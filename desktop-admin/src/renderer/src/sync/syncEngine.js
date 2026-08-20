// sync/syncEngine.js — Motor de Sincronização (Offline → API)
import db from '../db/db'

const API_BASE = 'http://127.0.0.1:8000/admin'

/**
 * Recupera o token JWT do admin armazenado no localStorage.
 * Retorna null se não houver token (admin não logado).
 */
function getAdminToken() {
  return localStorage.getItem('@EduAcess:adminToken')
}

/**
 * Processa toda a fila de sincronização (sync_queue).
 *
 * Lê todos os itens com status 'pendente', tenta enviar cada um
 * para a API Python e, em caso de sucesso, remove o item da fila.
 * Se a rede estiver offline ou a API retornar erro de rede,
 * o item permanece na fila para a próxima tentativa.
 *
 * Retorna um objeto { processados, erros } com a contagem.
 */
export async function processSyncQueue() {
  const token = getAdminToken()
  if (!token) {
    console.warn('[SyncEngine] Sem token de admin. Sincronização cancelada.')
    return { processados: 0, erros: 0 }
  }

  // Busca todos os itens pendentes, ordenados por timestamp (FIFO)
  const pendentes = await db.sync_queue
    .where('status')
    .equals('pendente')
    .sortBy('timestamp')

  let processados = 0
  let erros = 0

  for (const item of pendentes) {
    try {
      // Marca como 'processando' para evitar duplicação
      await db.sync_queue.update(item.id, { status: 'processando' })

      // Monta a URL do endpoint com base na entidade e ID
      const url = `${API_BASE}/${item.entidade}/${item.entidade_id}${item.endpoint_sufixo || ''}`

      // Monta as opções do fetch
      const opcoes = {
        method: item.tipo, // 'PUT' ou 'DELETE'
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }

      // Adiciona body apenas para PUT (DELETE não precisa)
      if (item.tipo === 'PUT' && item.payload) {
        opcoes.body = JSON.stringify(item.payload)
      }

      const response = await fetch(url, opcoes)

      if (response.ok || response.status === 204) {
        // Sucesso! Remove o item da fila
        await db.sync_queue.delete(item.id)
        processados++
        console.log(`[SyncEngine] ✅ ${item.tipo} ${url} — Sincronizado.`)
      } else {
        // Erro do servidor (4xx, 5xx) — marca como erro mas não tenta de novo
        // automaticamente (pode ser um conflito de dados)
        await db.sync_queue.update(item.id, {
          status: 'erro',
          tentativas: (item.tentativas || 0) + 1
        })
        erros++
        console.error(`[SyncEngine] ❌ ${item.tipo} ${url} — HTTP ${response.status}`)
      }
    } catch (error) {
      // Erro de REDE (fetch falhou) — mantém como pendente para retry
      await db.sync_queue.update(item.id, {
        status: 'pendente',
        tentativas: (item.tentativas || 0) + 1
      })
      erros++
      console.warn(`[SyncEngine] 🔌 Sem rede. ${item.tipo} ${item.entidade}/${item.entidade_id} mantido na fila.`)
    }
  }

  if (pendentes.length > 0) {
    console.log(`[SyncEngine] Resultado: ${processados} sincronizados, ${erros} erros, ${pendentes.length} total.`)
  }

  return { processados, erros }
}

/**
 * Inicia o listener automático de reconexão.
 *
 * Quando o navegador/Electron detecta que a internet voltou (evento 'online'),
 * o engine tenta processar a fila automaticamente.
 */
export function iniciarListenerDeReconexao() {
  window.addEventListener('online', async () => {
    console.log('[SyncEngine] 🌐 Internet detectada! Processando fila...')
    await processSyncQueue()
  })

  console.log('[SyncEngine] Listener de reconexão ativado.')
}
