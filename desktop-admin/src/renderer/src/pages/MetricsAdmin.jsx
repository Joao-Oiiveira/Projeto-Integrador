// pages/MetricsAdmin.jsx — Painel de Métricas de Uso e Funcionamento Administrativo
import React, { useState, useEffect, useCallback } from 'react'
import {
  obterMetricasConsolidadas,
  obterHistoricoOperacoes,
  limparMetricas
} from '../services/metricsService'
import useOnlineStatus from '../hooks/useOnlineStatus'

const MetricsAdmin = () => {
  const isOnline = useOnlineStatus()
  const [metricas, setMetricas] = useState(null)
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [mensagemSucesso, setMensagemSucesso] = useState('')
  const [confirmarLimpeza, setConfirmarLimpeza] = useState(false)

  const carregarDados = useCallback(async () => {
    try {
      const [dadosConsolidados, listaHistorico] = await Promise.all([
        obterMetricasConsolidadas(),
        obterHistoricoOperacoes(25)
      ])
      setMetricas(dadosConsolidados)
      setHistorico(listaHistorico)
    } catch (err) {
      console.error('[MetricsAdmin] Erro ao carregar métricas:', err)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  useEffect(() => {
    if (mensagemSucesso) {
      const timer = setTimeout(() => setMensagemSucesso(''), 4000)
      return () => clearTimeout(timer)
    }
  }, [mensagemSucesso])

  const handleLimparMetricas = async () => {
    const ok = await limparMetricas()
    if (ok) {
      setConfirmarLimpeza(false)
      setMensagemSucesso('Histórico e contadores de métricas foram reiniciados com sucesso.')
      await carregarDados()
    }
  }

  const formatarDataHora = (timestamp) => {
    if (!timestamp) return 'Nunca'
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(timestamp))
  }

  const obterBadgeOperacao = (tipo) => {
    switch (tipo) {
      case 'CRIAR_USUARIO':
        return {
          label: 'Criação',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          ponto: 'bg-emerald-500'
        }
      case 'EDITAR_USUARIO':
        return {
          label: 'Edição',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          ponto: 'bg-blue-500'
        }
      case 'EXCLUIR_USUARIO':
        return {
          label: 'Exclusão',
          bg: 'bg-red-50 text-red-700 border-red-200',
          ponto: 'bg-red-500'
        }
      case 'ALTERAR_SENHA':
        return {
          label: 'Senha',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          ponto: 'bg-amber-500'
        }
      default:
        return {
          label: tipo,
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          ponto: 'bg-slate-500'
        }
    }
  }

  const m = metricas || {
    total_operacoes: 0,
    operacoes_por_tipo: { CRIAR_USUARIO: 0, EDITAR_USUARIO: 0, EXCLUIR_USUARIO: 0, ALTERAR_SENHA: 0 },
    operacoes_por_modo: { online: 0, offline: 0 },
    sessoes: { total_inicializacoes: 0, ultima_sessao: null },
    sincronizacao: { total_execucoes: 0, sucessos: 0, falhas: 0, itens_sincronizados: 0, ultima_sincronizacao: null },
    ultima_operacao: null,
    fila_sync_pendente: 0,
    usuarios_em_cache: 0
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-12">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Métricas de Uso e Funcionamento</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitoramento de operações administrativas, estabilidade e sincronização offline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={carregarDados}
            disabled={carregando}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl shadow-sm transition-all"
            title="Atualizar métricas agora"
          >
            <svg className={`w-4 h-4 ${carregando ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{carregando ? 'Atualizando...' : 'Atualizar'}</span>
          </button>

          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold shadow-sm border ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'bg-red-50 text-red-700 border-red-100'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            {isOnline ? 'Sistema Online' : 'Sistema Offline'}
          </div>
        </div>
      </div>

      {/* Alerta de Feedback */}
      {mensagemSucesso && (
        <div className="flex items-center gap-3 border bg-emerald-50 border-emerald-200 text-emerald-800 rounded-2xl px-5 py-3.5 text-sm animate-fade-in-up">
          <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* ============================================
          SEÇÃO 1: OPERAÇÕES ADMINISTRATIVAS REALIZADAS
          ============================================ */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-5 rounded-full bg-blue-600" />
          <h2 className="text-base font-bold text-slate-700 uppercase tracking-wider">
            Operações Administrativas
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Geral de Operações */}
          <div className="bg-slate-900 text-white rounded-[2rem] p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total de Operações</span>
              <div className="p-2 bg-white/10 rounded-xl">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-4xl font-black">{m.total_operacoes}</span>
              <p className="text-xs text-slate-400 mt-1">Ações de escrita realizadas</p>
            </div>
          </div>

          {/* Usuários Criados */}
          <div className="bg-white rounded-[2rem] p-6 flex flex-col justify-between shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Usuários Criados</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-900">{m.operacoes_por_tipo?.CRIAR_USUARIO || 0}</span>
              <p className="text-xs text-slate-400 mt-1">Cadastros concluídos</p>
            </div>
          </div>

          {/* Usuários Editados */}
          <div className="bg-white rounded-[2rem] p-6 flex flex-col justify-between shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Usuários Editados</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-900">{m.operacoes_por_tipo?.EDITAR_USUARIO || 0}</span>
              <p className="text-xs text-slate-400 mt-1">Perfis atualizados</p>
            </div>
          </div>

          {/* Usuários Excluídos */}
          <div className="bg-white rounded-[2rem] p-6 flex flex-col justify-between shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Usuários Excluídos</span>
              <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-900">{m.operacoes_por_tipo?.EXCLUIR_USUARIO || 0}</span>
              <p className="text-xs text-slate-400 mt-1">Registros removidos</p>
            </div>
          </div>

          {/* Senhas Redefinidas */}
          <div className="bg-white rounded-[2rem] p-6 flex flex-col justify-between shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Senhas Alteradas</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-900">{m.operacoes_por_tipo?.ALTERAR_SENHA || 0}</span>
              <p className="text-xs text-slate-400 mt-1">Credenciais redefinidas</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SEÇÃO 2: FUNCIONAMENTO E CONECTIVIDADE
          ============================================ */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-5 rounded-full bg-indigo-500" />
          <h2 className="text-base font-bold text-slate-700 uppercase tracking-wider">
            Funcionamento e Sincronização
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sessões e Uso */}
          <div className="bg-white rounded-[1.75rem] p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sessões Desktop</span>
                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
              <span className="text-2xl font-black text-slate-900">{m.sessoes?.total_inicializacoes || 0}</span>
              <p className="text-xs text-slate-500 mt-1">Inicializações da aplicação</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              Último acesso: <span className="font-semibold text-slate-700">{formatarDataHora(m.sessoes?.ultima_sessao)}</span>
            </div>
          </div>

          {/* Distribuição Online vs Offline */}
          <div className="bg-white rounded-[1.75rem] p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Modo das Operações</span>
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <div>
                  <span className="text-2xl font-black text-emerald-600">{m.operacoes_por_modo?.online || 0}</span>
                  <span className="text-xs text-slate-500 ml-1">online</span>
                </div>
                <span className="text-slate-300">|</span>
                <div>
                  <span className="text-2xl font-black text-amber-600">{m.operacoes_por_modo?.offline || 0}</span>
                  <span className="text-xs text-slate-500 ml-1">offline</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">Distribuição de conectividade</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              Última operação: <span className="font-semibold text-slate-700">{formatarDataHora(m.ultima_operacao)}</span>
            </div>
          </div>

          {/* Sincronização */}
          <div className="bg-white rounded-[1.75rem] p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sincronizações</span>
                <span className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </span>
              </div>
              <span className="text-2xl font-black text-slate-900">{m.sincronizacao?.itens_sincronizados || 0}</span>
              <p className="text-xs text-slate-500 mt-1">
                Itens enviados ({m.sincronizacao?.sucessos || 0} sucessos, {m.sincronizacao?.falhas || 0} falhas)
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              Última sincronização: <span className="font-semibold text-slate-700">{formatarDataHora(m.sincronizacao?.ultima_sincronizacao)}</span>
            </div>
          </div>

          {/* Estado Atual do Armazenamento */}
          <div className="bg-white rounded-[1.75rem] p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Armazenamento Local</span>
                <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <div>
                  <span className="text-2xl font-black text-blue-700">{m.usuarios_em_cache}</span>
                  <span className="text-xs text-slate-500 ml-1">no cache</span>
                </div>
                <span className="text-slate-300">|</span>
                <div>
                  <span className={`text-2xl font-black ${m.fila_sync_pendente > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                    {m.fila_sync_pendente}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">na fila</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">IndexedDB (Dexie)</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              Fila: <span className="font-semibold text-slate-700">{m.fila_sync_pendente === 0 ? 'Em dia' : 'Aguardando envio'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SEÇÃO 3: HISTÓRICO RECENTE DE OPERAÇÕES
          ============================================ */}
      <section className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full bg-slate-800" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">Histórico de Operações Administrativas</h2>
              <p className="text-xs text-slate-500">Últimas 25 operações registradas no dispositivo</p>
            </div>
          </div>

          <div>
            {!confirmarLimpeza ? (
              <button
                onClick={() => setConfirmarLimpeza(true)}
                className="text-xs font-medium text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-red-200 transition-all"
              >
                Limpar Métricas
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-red-50 p-1.5 rounded-xl border border-red-200 text-xs">
                <span className="text-red-700 px-2 font-medium">Confirmar reinicialização?</span>
                <button
                  onClick={handleLimparMetricas}
                  className="px-2.5 py-1 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all"
                >
                  Sim
                </button>
                <button
                  onClick={() => setConfirmarLimpeza(false)}
                  className="px-2.5 py-1 bg-white text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-all"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>

        {historico.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-semibold text-slate-700">Nenhuma operação administrativa registrada ainda</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Quando cadastrar, editar, excluir usuários ou redefinir senhas, as operações aparecerão listadas aqui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Data e Hora</th>
                  <th className="py-3 px-4">Operação</th>
                  <th className="py-3 px-4">Modo</th>
                  <th className="py-3 px-4">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {historico.map((item) => {
                  const badge = obterBadgeOperacao(item.tipo)
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                        {formatarDataHora(item.timestamp)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.ponto}`} />
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                          item.modo === 'offline' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.modo === 'offline' ? 'Offline' : 'Online'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-700">
                        {item.detalhe || 'Operação administrativa concluída'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default MetricsAdmin

