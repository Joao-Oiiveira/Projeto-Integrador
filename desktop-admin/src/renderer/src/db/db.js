// db/db.js — Banco de dados local do Painel Administrativo (IndexedDB via Dexie.js)
import Dexie from 'dexie'

const db = new Dexie('EduAcessAdmin')

// Versão 1 do schema
db.version(1).stores({
  // Cache local dos usuários da plataforma
  usuarios_locais: 'id, email, nome, nivel, is_admin, data_criacao',

  // Fila de Sincronização (Offline Queue)
  sync_queue: '++id, tipo, entidade, entidade_id, status, timestamp'
})

// Versão 2: Adiciona tabelas para métricas de uso e funcionamento administrativo
db.version(2).stores({
  // Registro individual de operações administrativas realizadas (auditoria local leve)
  metricas_operacoes: '++id, tipo, entidade, modo, timestamp',

  // Contadores consolidados e estado de funcionamento da aplicação
  metricas_resumo: 'chave'
})

export default db
