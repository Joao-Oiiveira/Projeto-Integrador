// services/usersService.js — CRUD de Usuários (Online + Offline)
import db from '../db/db'
import { processSyncQueue } from '../sync/syncEngine'
import { getAdminToken } from './authService'

const API_BASE = 'http://127.0.0.1:8000/admin'

/**
 * Busca a lista de usuários.
 *
 * Modo Online  → Tenta GET na API. Se bem-sucedido, atualiza o cache Dexie
 *                e retorna a lista. Se o fetch falhar (API fora do ar,
 *                timeout, sem rota), cai silenciosamente no fallback offline.
 * Modo Offline → Retorna o cache local do Dexie diretamente.
 *
 * ⚠️  OFFLINE-FIRST SAFETY: esta função NUNCA lança exceção de rede.
 *     Qualquer erro de conectividade é tratado internamente com fallback.
 *
 * @param {boolean} isOnline — Resultado do hook useOnlineStatus()
 * @returns {Promise<Array>} Lista de usuários (da API ou do cache local)
 */
export async function fetchUsuarios(isOnline) {
  if (isOnline) {
    try {
      const token = getAdminToken()
      const response = await fetch(`${API_BASE}/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(8000)
      })

      if (!response.ok) {
        console.warn(`[usersService] API retornou HTTP ${response.status}. Usando cache local.`)
        return await db.usuarios_locais.toArray()
      }

      const usuarios = await response.json()

      // Sincroniza (upsert) cada usuário no cache local para uso futuro offline
      await db.usuarios_locais.bulkPut(usuarios)

      return usuarios
    } catch (err) {
      // Erro de rede (fetch falhou, API fora do ar, ECONNREFUSED, timeout)
      console.warn('[usersService] Falha de rede ao buscar usuários. Usando cache local.', err?.message || err)
      return await db.usuarios_locais.toArray()
    }
  }

  // Modo offline explícito — retorna diretamente do cache
  return await db.usuarios_locais.toArray()
}

/**
 * Exclui um usuário.
 *
 * 1. Remove imediatamente do cache local (feedback instantâneo na UI).
 * 2. Enfileira a operação DELETE na sync_queue.
 * 3. Tenta sincronizar agora (se online) ou aguarda reconexão.
 *
 * @param {number} id — ID do usuário a excluir
 * @returns {Promise<{sincronizado: boolean}>}
 *   sincronizado=true  → operação foi enviada à API com sucesso agora
 *   sincronizado=false → ficou na fila (API indisponível), será enviada depois
 */
export async function excluirUsuario(id) {
  // Remoção otimista do cache local para feedback imediato
  await db.usuarios_locais.delete(id)

  // Enfileira a operação para enviar à API
  await db.sync_queue.add({
    tipo: 'DELETE',
    entidade: 'usuarios',
    entidade_id: id,
    endpoint_sufixo: '',
    payload: null,
    status: 'pendente',
    timestamp: Date.now(),
    tentativas: 0
  })

  // Tenta processar agora (se estiver online, executa; se offline, apenas enfileira)
  const resultado = await processSyncQueue()

  // Retorna se a operação foi de fato executada agora ou ficou na fila
  return { sincronizado: resultado.processados > 0 }
}

/**
 * Altera a senha de um usuário.
 *
 * Não altera o cache local (senha é campo sensível, não armazenado).
 * Enfileira a operação PUT na sync_queue e tenta sincronizar.
 *
 * @param {number} id — ID do usuário
 * @param {string} novaSenha — Nova senha em texto puro (a API faz o hash)
 * @returns {Promise<{sincronizado: boolean}>}
 *   sincronizado=true  → senha alterada na API agora
 *   sincronizado=false → ficou na fila (API indisponível), será enviada depois
 */
export async function alterarSenha(id, novaSenha) {
  // Enfileira a operação PUT /admin/usuarios/{id}/senha
  await db.sync_queue.add({
    tipo: 'PUT',
    entidade: 'usuarios',
    entidade_id: id,
    endpoint_sufixo: '/senha',
    payload: { nova_senha: novaSenha },
    status: 'pendente',
    timestamp: Date.now(),
    tentativas: 0
  })

  // Tenta processar agora
  const resultado = await processSyncQueue()

  return { sincronizado: resultado.processados > 0 }
}
