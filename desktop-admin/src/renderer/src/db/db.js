// db/db.js — Banco de dados local do Painel Administrativo (IndexedDB via Dexie.js)
import Dexie from 'dexie'

const db = new Dexie('EduAcessAdmin')

// Versão 1 do schema
db.version(1).stores({
  // Cache local dos usuários da plataforma
  // id = chave primária (mesmo ID do MySQL remoto)
  // email, nome = indexados para buscas e filtros rápidos
  usuarios_locais: 'id, email, nome, nivel, is_admin, data_criacao',

  // Fila de Sincronização (Offline Queue)
  // ++id = auto-increment local (chave primária sequencial)
  // status = 'pendente' | 'processando' | 'erro'
  // timestamp = para ordenar FIFO (primeiro a entrar, primeiro a sair)
  sync_queue: '++id, tipo, entidade, entidade_id, status, timestamp'
})

export default db
