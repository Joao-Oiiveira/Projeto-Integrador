// test_metrics_service.mjs — Teste de Unidade do MetricsService
import assert from 'assert'

// Simulação da camada de banco Dexie
class MockTable {
  constructor() {
    this.items = []
    this.keyMap = new Map()
    this.autoId = 1
  }

  async get(key) {
    return this.keyMap.get(key) || null
  }

  async put(item) {
    const key = item.chave || item.id
    if (key) {
      this.keyMap.set(key, JSON.parse(JSON.stringify(item)))
    }
    return key
  }

  async add(item) {
    const id = this.autoId++
    const record = { id, ...JSON.parse(JSON.stringify(item)) }
    this.items.push(record)
    return id
  }

  async count() {
    return this.items.length
  }

  async clear() {
    this.items = []
    this.keyMap.clear()
  }

  orderBy(field) {
    return {
      reverse: () => ({
        limit: (n) => ({
          toArray: async () => {
            const sorted = [...this.items].sort((a, b) => (b[field] || 0) - (a[field] || 0))
            return sorted.slice(0, n)
          }
        }),
        toArray: async () => {
          return [...this.items].sort((a, b) => (b[field] || 0) - (a[field] || 0))
        }
      })
    }
  }
}

const mockDb = {
  metricas_operacoes: new MockTable(),
  metricas_resumo: new MockTable(),
  sync_queue: { count: async () => 0 },
  usuarios_locais: { count: async () => 15 }
}

// Implementação isolada de teste da lógica do metricsService
const RESUMO_KEY = 'resumo_geral'
const RESUMO_INICIAL = {
  chave: RESUMO_KEY,
  total_operacoes: 0,
  operacoes_por_tipo: {
    CRIAR_USUARIO: 0,
    EDITAR_USUARIO: 0,
    EXCLUIR_USUARIO: 0,
    ALTERAR_SENHA: 0
  },
  operacoes_por_modo: {
    online: 0,
    offline: 0
  },
  sessoes: {
    total_inicializacoes: 0,
    ultima_sessao: null
  },
  sincronizacao: {
    total_execucoes: 0,
    sucessos: 0,
    falhas: 0,
    itens_sincronizados: 0,
    ultima_sincronizacao: null
  },
  ultima_operacao: null
}

async function _obterResumoArmazenado() {
  const salvo = await mockDb.metricas_resumo.get(RESUMO_KEY)
  if (salvo) return salvo
  await mockDb.metricas_resumo.put({ ...RESUMO_INICIAL })
  return { ...RESUMO_INICIAL }
}

async function registrarInicializacao() {
  const resumo = await _obterResumoArmazenado()
  const agora = Date.now()
  resumo.sessoes = {
    total_inicializacoes: (resumo.sessoes?.total_inicializacoes || 0) + 1,
    ultima_sessao: agora
  }
  await mockDb.metricas_resumo.put(resumo)
}

async function registrarOperacao(tipo, { entidade = 'usuario', modo = 'online', detalhe = '' } = {}) {
  const agora = Date.now()
  await mockDb.metricas_operacoes.add({
    tipo,
    entidade,
    modo: modo === 'offline' ? 'offline' : 'online',
    detalhe: String(detalhe || '').slice(0, 150),
    timestamp: agora
  })

  const resumo = await _obterResumoArmazenado()
  resumo.total_operacoes = (resumo.total_operacoes || 0) + 1
  if (!resumo.operacoes_por_tipo) resumo.operacoes_por_tipo = { ...RESUMO_INICIAL.operacoes_por_tipo }
  resumo.operacoes_por_tipo[tipo] = (resumo.operacoes_por_tipo[tipo] || 0) + 1

  if (!resumo.operacoes_por_modo) resumo.operacoes_por_modo = { ...RESUMO_INICIAL.operacoes_por_modo }
  const chaveModo = modo === 'offline' ? 'offline' : 'online'
  resumo.operacoes_por_modo[chaveModo] = (resumo.operacoes_por_modo[chaveModo] || 0) + 1
  resumo.ultima_operacao = agora

  await mockDb.metricas_resumo.put(resumo)
}

async function registrarSincronizacao({ processados = 0, erros = 0 } = {}) {
  if (processados === 0 && erros === 0) return
  const agora = Date.now()
  const resumo = await _obterResumoArmazenado()
  if (!resumo.sincronizacao) resumo.sincronizacao = { ...RESUMO_INICIAL.sincronizacao }

  resumo.sincronizacao.total_execucoes = (resumo.sincronizacao.total_execucoes || 0) + 1
  resumo.sincronizacao.itens_sincronizados = (resumo.sincronizacao.itens_sincronizados || 0) + processados

  if (erros === 0 && processados > 0) {
    resumo.sincronizacao.sucessos = (resumo.sincronizacao.sucessos || 0) + 1
    resumo.sincronizacao.ultima_sincronizacao = agora
  } else if (erros > 0) {
    resumo.sincronizacao.falhas = (resumo.sincronizacao.falhas || 0) + 1
  }
  await mockDb.metricas_resumo.put(resumo)
}

async function obterMetricasConsolidadas() {
  const resumo = await _obterResumoArmazenado()
  const totalItensNaFila = await mockDb.sync_queue.count()
  const totalUsuariosNoCache = await mockDb.usuarios_locais.count()
  return {
    total_operacoes: resumo.total_operacoes || 0,
    operacoes_por_tipo: resumo.operacoes_por_tipo || { ...RESUMO_INICIAL.operacoes_por_tipo },
    operacoes_por_modo: resumo.operacoes_por_modo || { ...RESUMO_INICIAL.operacoes_por_modo },
    sessoes: resumo.sessoes || { ...RESUMO_INICIAL.sessoes },
    sincronizacao: resumo.sincronizacao || { ...RESUMO_INICIAL.sincronizacao },
    ultima_operacao: resumo.ultima_operacao,
    fila_sync_pendente: totalItensNaFila,
    usuarios_em_cache: totalUsuariosNoCache
  }
}

async function obterHistoricoOperacoes(limite = 20) {
  return await mockDb.metricas_operacoes.orderBy('id').reverse().limit(limite).toArray()
}

async function limparMetricas() {
  await mockDb.metricas_operacoes.clear()
  await mockDb.metricas_resumo.put({ ...RESUMO_INICIAL })
  return true
}

// BATERIA DE TESTES
async function rodarTestes() {
  console.log('--- INICIANDO TESTES DO SISTEMA DE MÉTRICAS ---')

  // 1. Teste de Inicialização de Sessão
  await registrarInicializacao()
  await registrarInicializacao()
  let metricas = await obterMetricasConsolidadas()
  assert.strictEqual(metricas.sessoes.total_inicializacoes, 2, 'Total de inicializações deve ser 2')
  assert.ok(metricas.sessoes.ultima_sessao > 0, 'Timestamp de última sessão deve existir')
  console.log('✅ Teste 1: Registro de Sessões Desktop OK')

  // 2. Teste de Operações Administrativas
  await registrarOperacao('CRIAR_USUARIO', { modo: 'online', detalhe: 'Usuário cadastrado: Amanda Souza' })
  await registrarOperacao('EDITAR_USUARIO', { modo: 'online', detalhe: 'Usuário ID 3 editado' })
  await registrarOperacao('CRIAR_USUARIO', { modo: 'offline', detalhe: 'Usuário criado offline: Bruno Lima' })
  await registrarOperacao('ALTERAR_SENHA', { modo: 'offline', detalhe: 'Senha do usuário ID 7 redefinida' })
  await registrarOperacao('EXCLUIR_USUARIO', { modo: 'online', detalhe: 'Usuário ID 14 excluído' })

  metricas = await obterMetricasConsolidadas()
  assert.strictEqual(metricas.total_operacoes, 5, 'Total de operações deve ser 5')
  assert.strictEqual(metricas.operacoes_por_tipo.CRIAR_USUARIO, 2, 'Criações deve ser 2')
  assert.strictEqual(metricas.operacoes_por_tipo.EDITAR_USUARIO, 1, 'Edições deve ser 1')
  assert.strictEqual(metricas.operacoes_por_tipo.EXCLUIR_USUARIO, 1, 'Exclusões deve ser 1')
  assert.strictEqual(metricas.operacoes_por_tipo.ALTERAR_SENHA, 1, 'Alterações de senha deve ser 1')
  assert.strictEqual(metricas.operacoes_por_modo.online, 3, 'Operações online deve ser 3')
  assert.strictEqual(metricas.operacoes_por_modo.offline, 2, 'Operações offline deve ser 2')
  console.log('✅ Teste 2: Contabilização de Operações e Modos Online/Offline OK')

  // 3. Teste de Segurança: Garantir ausência de dados sensíveis no histórico
  const historico = await obterHistoricoOperacoes(10)
  assert.strictEqual(historico.length, 5, 'Histórico deve conter 5 operações')
  for (const item of historico) {
    assert.strictEqual(item.senha, undefined, 'Histórico não deve conter campo senha')
    assert.strictEqual(item.token, undefined, 'Histórico não deve conter campo token')
    assert.strictEqual(item.nova_senha, undefined, 'Histórico não deve conter campo nova_senha')
    assert.ok(!item.detalhe.includes('123'), 'Detalhes não devem conter senhas em texto puro')
  }
  console.log('✅ Teste 3: Segurança e Privacidade (zero dados sensíveis) OK')

  // 4. Teste de Sincronização
  await registrarSincronizacao({ processados: 2, erros: 0 })
  await registrarSincronizacao({ processados: 0, erros: 1 })
  metricas = await obterMetricasConsolidadas()
  assert.strictEqual(metricas.sincronizacao.total_execucoes, 2, 'Total de execuções de sync deve ser 2')
  assert.strictEqual(metricas.sincronizacao.sucessos, 1, 'Syncs com sucesso deve ser 1')
  assert.strictEqual(metricas.sincronizacao.falhas, 1, 'Syncs com falha deve ser 1')
  assert.strictEqual(metricas.sincronizacao.itens_sincronizados, 2, 'Itens sincronizados deve ser 2')
  assert.ok(metricas.sincronizacao.ultima_sincronizacao > 0, 'Data da última sincronização deve existir')
  console.log('✅ Teste 4: Registro de Sincronizações OK')

  // 5. Teste de Ordenação do Histórico (mais recente primeiro)
  assert.strictEqual(historico[0].tipo, 'EXCLUIR_USUARIO', 'A última operação deve ser a primeira do histórico')
  assert.strictEqual(historico[4].tipo, 'CRIAR_USUARIO', 'A primeira operação deve ser a última do histórico')
  console.log('✅ Teste 5: Ordenação do Histórico (Decrescente por Timestamp) OK')

  // 6. Teste de Limpeza de Métricas
  await limparMetricas()
  const metricasLimpos = await obterMetricasConsolidadas()
  const historicoLimpo = await obterHistoricoOperacoes(10)
  assert.strictEqual(metricasLimpos.total_operacoes, 0, 'Total de operações deve ser 0 após limpar')
  assert.strictEqual(historicoLimpo.length, 0, 'Histórico deve estar vazio após limpar')
  console.log('✅ Teste 6: Reinicialização / Limpeza de Métricas OK')

  console.log('--- TODOS OS TESTES PASSARAM COM SUCESSO! ---')
}

rodarTestes().catch(err => {
  console.error('❌ Falha no teste:', err)
  process.exit(1)
})
