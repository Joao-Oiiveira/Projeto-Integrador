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
 * Cria um novo usuário.
 *
 * Modo Online  → Tenta POST na API. Se bem-sucedido, salva no cache local
 *                com o ID real retornado e retorna o usuário criado.
 * Modo Offline → Cria um ID temporário negativo (-Date.now()) como Optimistic UI,
 *                salva no cache local e enfileira na sync_queue (tipo: 'POST').
 *
 * @param {Object} dados — { nome, email, senha, is_admin }
 * @returns {Promise<{sincronizado: boolean, usuario: Object}>}
 */
export async function criarUsuario(dados) {
  // Tenta salvar na API diretamente
  try {
    const token = getAdminToken()
    const response = await fetch(`${API_BASE}/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(dados),
      signal: AbortSignal.timeout(8000)
    })

    if (response.ok || response.status === 201) {
      const usuarioCriado = await response.json()
      // Salva no cache local com o ID real
      await db.usuarios_locais.put(usuarioCriado)
      return { sincronizado: true, usuario: usuarioCriado }
    }

    // Erro do servidor (ex: e-mail duplicado) — propaga o erro para o chamador
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `Erro HTTP ${response.status}`)
  } catch (err) {
    // Se for erro de validação/negócio do servidor, repropaga
    if (err.message && !err.message.includes('fetch') && !err.message.includes('network') && !err.message.includes('abort') && !err.message.includes('NetworkError') && !err.message.includes('Failed to fetch') && !err.message.includes('timeout')) {
      throw err
    }

    // Erro de REDE — Optimistic UI com ID temporário negativo
    const idTemporario = -Date.now()
    const usuarioLocal = {
      id: idTemporario,
      nome: dados.nome,
      email: dados.email,
      is_admin: dados.is_admin ?? false,
      nivel: dados.is_admin ? 'admin' : 'estudante',
      data_criacao: new Date().toISOString(),
      _pendente_sync: true
    }

    // Salva no cache local com ID temporário
    await db.usuarios_locais.put(usuarioLocal)

    // Enfileira na sync_queue para POST quando a API voltar
    await db.sync_queue.add({
      tipo: 'POST',
      entidade: 'usuarios',
      entidade_id: idTemporario,
      endpoint_sufixo: '',
      payload: dados,
      status: 'pendente',
      timestamp: Date.now(),
      tentativas: 0
    })

    console.warn('[usersService] Sem rede. Usuário salvo localmente com ID temporário:', idTemporario)
    const resultado = await processSyncQueue()
    return { sincronizado: resultado.processados > 0, usuario: usuarioLocal }
  }
}

/**
 * Edita um usuário existente.
 *
 * 1. Atualiza imediatamente o cache local (Optimistic UI).
 * 2. Enfileira a operação PUT na sync_queue (payload sem a senha).
 * 3. Tenta sincronizar agora (se online) ou aguarda reconexão.
 *
 * @param {number} id — ID do usuário a editar
 * @param {Object} dados — { nome, email, is_admin } (sem senha)
 * @returns {Promise<{sincronizado: boolean}>}
 */
export async function editarUsuario(id, dados) {
  // Payload sem a senha (segurança: senha só é alterada via alterarSenha())
  const { senha, ...payloadSemSenha } = dados

  // Atualização otimista do cache local
  const usuarioAtual = await db.usuarios_locais.get(id)
  if (usuarioAtual) {
    await db.usuarios_locais.put({
      ...usuarioAtual,
      ...payloadSemSenha,
      nivel: payloadSemSenha.is_admin ? 'admin' : (usuarioAtual.nivel || 'estudante')
    })
  }

  // Enfileira a operação PUT na sync_queue
  await db.sync_queue.add({
    tipo: 'PUT',
    entidade: 'usuarios',
    entidade_id: id,
    endpoint_sufixo: '',
    payload: payloadSemSenha,
    status: 'pendente',
    timestamp: Date.now(),
    tentativas: 0
  })

  // Tenta processar agora
  const resultado = await processSyncQueue()
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
