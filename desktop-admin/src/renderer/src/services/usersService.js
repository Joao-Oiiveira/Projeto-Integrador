// services/usersService.js — CRUD de Usuários (Online + Offline)
import db from '../db/db'
import { processSyncQueue } from '../sync/syncEngine'
import { getAdminToken } from './authService'

const API_BASE = 'http://127.0.0.1:8000/admin'

/**
 * Busca a lista de usuários.
 *
 * Modo Online  → Faz GET na API, atualiza o cache do Dexie e retorna a lista.
 * Modo Offline → Retorna o cache local do Dexie diretamente.
 *
 * @param {boolean} isOnline — Resultado do hook useOnlineStatus()
 * @returns {Promise<Array>} Lista de usuários
 */
export async function fetchUsuarios(isOnline) {
  if (isOnline) {
    const token = getAdminToken()
    const response = await fetch(`${API_BASE}/usuarios`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!response.ok) {
      throw new Error('Falha ao buscar usuários da API.')
    }

    const usuarios = await response.json()

    // Sincroniza (upsert) cada usuário no cache local
    // put() substitui se já existir, insere se não existir
    await db.usuarios_locais.bulkPut(usuarios)

    return usuarios
  } else {
    // Modo offline — retorna do cache local
    return await db.usuarios_locais.toArray()
  }
}

/**
 * Exclui um usuário.
 *
 * 1. Remove imediatamente do cache local (feedback instantâneo na UI).
 * 2. Enfileira a operação DELETE na sync_queue.
 * 3. Tenta sincronizar agora (se online) ou aguarda reconexão.
 *
 * @param {number} id — ID do usuário a excluir
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
  await processSyncQueue()
}

/**
 * Altera a senha de um usuário.
 *
 * Não altera o cache local (senha é campo sensível, não armazenado).
 * Enfileira a operação PUT na sync_queue e tenta sincronizar.
 *
 * @param {number} id — ID do usuário
 * @param {string} novaSenha — Nova senha em texto puro (a API faz o hash)
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
  await processSyncQueue()
}
