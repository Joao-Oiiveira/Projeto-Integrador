// services/metricsService.js — Métricas Básicas de Uso e Funcionamento Administrativo
import db from '../db/db'

const RESUMO_KEY = 'resumo_geral'
const LIMITE_MAX_HISTORICO = 500

/**
 * Estrutura inicial do resumo consolidado de métricas.
 */
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

/**
 * Obtém ou inicializa o registro consolidado de métricas.
 */
async function _obterResumoArmazenado() {
  try {
    const salvo = await db.metricas_resumo.get(RESUMO_KEY)
    if (salvo) return salvo
    await db.metricas_resumo.put({ ...RESUMO_INICIAL })
    return { ...RESUMO_INICIAL }
  } catch (error) {
    console.warn('[metricsService] Falha ao ler metricas_resumo. Usando dados padrão.', error)
    return { ...RESUMO_INICIAL }
  }
}

/**
 * Registra a abertura da aplicação desktop (sessão de uso).
 * Chamado uma vez durante a inicialização do app.
 */
export async function registrarInicializacao() {
  try {
    const resumo = await _obterResumoArmazenado()
    const agora = Date.now()

    resumo.sessoes = {
      total_inicializacoes: (resumo.sessoes?.total_inicializacoes || 0) + 1,
      ultima_sessao: agora
    }

    await db.metricas_resumo.put(resumo)
    console.log('[metricsService] 📊 Sessão de uso registrada. Total:', resumo.sessoes.total_inicializacoes)
  } catch (err) {
    console.warn('[metricsService] Não foi possível registrar inicialização:', err)
  }
}

/**
 * Registra uma operação administrativa de escrita (criar, editar, excluir, alterar senha).
 *
 * ⚠️ SEGURANÇA: Garante que senhas, tokens ou dados sensíveis NUNCA sejam registrados.
 *
 * @param {string} tipo — 'CRIAR_USUARIO' | 'EDITAR_USUARIO' | 'EXCLUIR_USUARIO' | 'ALTERAR_SENHA'
 * @param {Object} opcoes — { entidade: string, modo: 'online' | 'offline', detalhe: string }
 */
export async function registrarOperacao(tipo, { entidade = 'usuario', modo = 'online', detalhe = '' } = {}) {
  try {
    const agora = Date.now()

    // 1. Grava no log de histórico de operações
    await db.metricas_operacoes.add({
      tipo,
      entidade,
      modo: modo === 'offline' ? 'offline' : 'online',
      detalhe: String(detalhe || '').slice(0, 150),
      timestamp: agora
    })

    // 2. Atualiza contadores consolidados
    const resumo = await _obterResumoArmazenado()

    resumo.total_operacoes = (resumo.total_operacoes || 0) + 1

    if (!resumo.operacoes_por_tipo) resumo.operacoes_por_tipo = { ...RESUMO_INICIAL.operacoes_por_tipo }
    resumo.operacoes_por_tipo[tipo] = (resumo.operacoes_por_tipo[tipo] || 0) + 1

    if (!resumo.operacoes_por_modo) resumo.operacoes_por_modo = { ...RESUMO_INICIAL.operacoes_por_modo }
    const chaveModo = modo === 'offline' ? 'offline' : 'online'
    resumo.operacoes_por_modo[chaveModo] = (resumo.operacoes_por_modo[chaveModo] || 0) + 1

    resumo.ultima_operacao = agora

    await db.metricas_resumo.put(resumo)

    // 3. Poda histórica para evitar crescimento indefinido
    const totalRegistros = await db.metricas_operacoes.count()
    if (totalRegistros > LIMITE_MAX_HISTORICO) {
      const maisAntigos = await db.metricas_operacoes
        .orderBy('timestamp')
        .limit(totalRegistros - LIMITE_MAX_HISTORICO)
        .keys()
      await db.metricas_operacoes.bulkDelete(maisAntigos)
    }

    console.log(`[metricsService] 📊 Operação registrada: [${tipo}] (Modo: ${modo})`)
  } catch (err) {
    // Falha silenciosa para nunca interromper a ação do administrador
    console.warn('[metricsService] Falha ao registrar métrica de operação:', err)
  }
}

/**
 * Registra o resultado da execução do motor de sincronização.
 *
 * @param {Object} resultado — { processados: number, erros: number }
 */
export async function registrarSincronizacao({ processados = 0, erros = 0 } = {}) {
  try {
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

    await db.metricas_resumo.put(resumo)
    console.log('[metricsService] 📊 Métrica de sincronização salva:', resumo.sincronizacao)
  } catch (err) {
    console.warn('[metricsService] Falha ao registrar métrica de sincronização:', err)
  }
}

/**
 * Consulta todas as métricas consolidadas e estatísticas de uso.
 *
 * @returns {Promise<Object>} Resumo completo das métricas
 */
export async function obterMetricasConsolidadas() {
  try {
    const resumo = await _obterResumoArmazenado()
    const totalItensNaFila = await db.sync_queue.count()
    const totalUsuariosNoCache = await db.usuarios_locais.count()

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
  } catch (err) {
    console.warn('[metricsService] Falha ao obter métricas consolidadas:', err)
    return { ...RESUMO_INICIAL, fila_sync_pendente: 0, usuarios_em_cache: 0 }
  }
}

/**
 * Consulta o histórico recente de operações administrativas registradas.
 *
 * @param {number} limite — Quantidade máxima de itens a retornar (padrão 20)
 * @returns {Promise<Array>} Lista de operações ordenadas da mais recente para a mais antiga
 */
export async function obterHistoricoOperacoes(limite = 20) {
  try {
    const historico = await db.metricas_operacoes
      .orderBy('id')
      .reverse()
      .limit(limite)
      .toArray()
    return historico
  } catch (err) {
    console.warn('[metricsService] Falha ao obter histórico de operações:', err)
    return []
  }
}

/**
 * Reinicia o histórico e contadores locais de métricas.
 */
export async function limparMetricas() {
  try {
    await db.metricas_operacoes.clear()
    await db.metricas_resumo.put({ ...RESUMO_INICIAL })
    console.log('[metricsService] 📊 Métricas zeradas com sucesso.')
    return true
  } catch (err) {
    console.error('[metricsService] Falha ao limpar métricas:', err)
    return false
  }
}
