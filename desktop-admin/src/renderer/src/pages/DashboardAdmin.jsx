// pages/DashboardAdmin.jsx — Dashboard de Estatísticas (dados reais da API + fallback offline)
import React, { useState, useEffect, useCallback } from 'react'
import { fetchEstatisticas } from '../services/statsService'
import { processSyncQueue } from '../sync/syncEngine'
import useOnlineStatus from '../hooks/useOnlineStatus'
import db from '../db/db'

// ==============================
// Sub-componentes
// ==============================

/** Card de métrica grande (seção Crescimento da Base) */
const CardDestaque = ({ titulo, valor, subtitulo, icone, cor, carregando, index }) => (
  <div
    className={`relative overflow-hidden rounded-[2rem] p-7 flex flex-col gap-3 shadow-sm border transition-all hover:shadow-lg animate-fade-in-up ${cor}`}
    style={{ animationDelay: `${index * 80}ms` }}
  >
    {/* Ícone decorativo de fundo */}
    <svg className="absolute right-4 bottom-4 w-24 h-24 opacity-[0.07]" fill="currentColor" viewBox="0 0 24 24">
      <path d={icone} />
    </svg>

    <div className="flex items-center justify-between relative z-10">
      <span className="text-sm font-semibold opacity-70 uppercase tracking-wider">{titulo}</span>
      <div className="p-2.5 rounded-2xl bg-white/20">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icone} />
        </svg>
      </div>
    </div>

    <div className="relative z-10">
      {carregando ? (
        <div className="h-12 w-24 bg-white/20 rounded-xl animate-pulse" />
      ) : (
        <span className="text-5xl font-black tracking-tight">{valor}</span>
      )}
      {subtitulo && (
        <p className="text-sm mt-1 opacity-70 font-medium">{subtitulo}</p>
      )}
    </div>
  </div>
)

/** Card de métrica menor (seção Engajamento Acadêmico) */
const CardEngajamento = ({ titulo, valor, icone, cor, corIcone, carregando, index }) => (
  <div
    className="bg-white rounded-[1.5rem] p-5 flex items-center gap-4 shadow-sm border border-gray-100 hover:shadow-md transition-all animate-fade-in-up"
    style={{ animationDelay: `${(index + 2) * 80}ms` }}
  >
    <div className={`p-3.5 rounded-2xl shrink-0 ${cor}`}>
      <svg className={`w-6 h-6 ${corIcone}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icone} />
      </svg>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">{titulo}</p>
      {carregando ? (
        <div className="h-7 w-16 bg-gray-100 rounded-lg animate-pulse mt-1" />
      ) : (
        <span className="text-2xl font-black text-slate-900">{valor}</span>
      )}
    </div>
  </div>
)

// ==============================
// Dashboard Principal
// ==============================
const DashboardAdmin = () => {
  const isOnline = useOnlineStatus()
  const [stats, setStats] = useState(null)
  const [totalUsuariosCache, setTotalUsuariosCache] = useState(0)
  const [pendentesSync, setPendentesSync] = useState(0)
  const [carregando, setCarregando] = useState(true)
  const [sincronizando, setSincronizando] = useState(false)
  const [feedbackSync, setFeedbackSync] = useState(null)

  const carregarDados = useCallback(async () => {
    try {
      const [estatisticas, pendentes, usuariosCache] = await Promise.all([
        fetchEstatisticas(isOnline),
        db.sync_queue.where('status').equals('pendente').count(),
        db.usuarios_locais.count()
      ])
      setStats(estatisticas)
      setPendentesSync(pendentes)
      setTotalUsuariosCache(usuariosCache)
    } catch (error) {
      console.error('[Dashboard] Erro inesperado ao carregar dados:', error)
    } finally {
      setCarregando(false)
    }
  }, [isOnline])

  // Carrega ao montar e tenta processar a fila pendente automaticamente
  useEffect(() => {
    const inicializar = async () => {
      await carregarDados()
      const pendentesIniciais = await db.sync_queue.where('status').equals('pendente').count()
      if (pendentesIniciais > 0 && isOnline) {
        console.log(`[Dashboard] ${pendentesIniciais} item(s) pendente(s). Sincronizando...`)
        const resultado = await processSyncQueue()
        if (resultado.processados > 0) {
          const pendentesApos = await db.sync_queue.where('status').equals('pendente').count()
          setPendentesSync(pendentesApos)
        }
      }
    }
    inicializar()
  }, [isOnline, carregarDados])

  // Auto-limpa o toast de feedback após 4s
  useEffect(() => {
    if (feedbackSync) {
      const timer = setTimeout(() => setFeedbackSync(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [feedbackSync])

  const handleSincronizarAgora = async () => {
    if (sincronizando) return
    setSincronizando(true)
    setFeedbackSync(null)
    try {
      const resultado = await processSyncQueue()
      const pendentesAtuais = await db.sync_queue.where('status').equals('pendente').count()
      setPendentesSync(pendentesAtuais)

      if (resultado.processados > 0) {
        setFeedbackSync({ tipo: 'sucesso', msg: `${resultado.processados} operação(ões) sincronizada(s) com sucesso!` })
        await carregarDados()
      } else if (pendentesAtuais === 0) {
        setFeedbackSync({ tipo: 'info', msg: 'Nenhuma operação pendente. Tudo sincronizado.' })
      } else {
        setFeedbackSync({ tipo: 'erro', msg: `${pendentesAtuais} operação(ões) ainda na fila. API indisponível?` })
      }
    } catch (error) {
      console.error('[Dashboard] Erro ao sincronizar:', error)
      setFeedbackSync({ tipo: 'erro', msg: 'Falha ao tentar sincronizar a fila.' })
    } finally {
      setSincronizando(false)
    }
  }

  const dataAtual = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric', month: 'long', weekday: 'long'
  }).format(new Date())

  const s = stats || { usuarios: { total: 0, novos_ultimos_7_dias: 0 }, engajamento: { tarefas_ativas: 0, disciplinas_ativas: 0, flashcards_criados: 0, simulados_realizados: 0 } }

  const cardsEngajamento = [
    {
      titulo: 'Tarefas Ativas',
      valor: s.engajamento.tarefas_ativas,
      icone: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      cor: 'bg-indigo-50',
      corIcone: 'text-indigo-600'
    },
    {
      titulo: 'Disciplinas',
      valor: s.engajamento.disciplinas_ativas,
      icone: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      cor: 'bg-sky-50',
      corIcone: 'text-sky-600'
    },
    {
      titulo: 'Flashcards Criados',
      valor: s.engajamento.flashcards_criados,
      icone: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      cor: 'bg-violet-50',
      corIcone: 'text-violet-600'
    },
    {
      titulo: 'Simulados Realizados',
      valor: s.engajamento.simulados_realizados,
      icone: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
      cor: 'bg-emerald-50',
      corIcone: 'text-emerald-600'
    }
  ]

  return (
    <div className="flex flex-col gap-8 animate-fade-in">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1 capitalize">{dataAtual}</p>
        </div>

        {/* Badge online/offline */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold shadow-sm border
          ${isOnline ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}
        `}>
          <span className={`w-2 h-2 rounded-full shrink-0 ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          {isOnline ? 'API Online' : 'API Offline'}
        </div>
      </div>

      {/* Toast de feedback de sincronização */}
      {feedbackSync && (
        <div className={`flex items-center gap-3 border rounded-2xl px-5 py-3.5 text-sm animate-fade-in-up ${
          feedbackSync.tipo === 'sucesso' ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : feedbackSync.tipo === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800'
          : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <svg className={`w-5 h-5 shrink-0 ${
            feedbackSync.tipo === 'sucesso' ? 'text-emerald-500'
            : feedbackSync.tipo === 'info' ? 'text-blue-500'
            : 'text-red-500'
          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={
              feedbackSync.tipo === 'sucesso' ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              : feedbackSync.tipo === 'info' ? 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            } />
          </svg>
          <span>{feedbackSync.msg}</span>
        </div>
      )}

      {/* ============================================
          SEÇÃO 1: CRESCIMENTO DA BASE
          ============================================ */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-5 rounded-full bg-blue-600" />
          <h2 className="text-base font-bold text-slate-700 uppercase tracking-wider">Crescimento da Base</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CardDestaque
            index={0}
            titulo="Total de Usuários"
            valor={s.usuarios.total}
            subtitulo="usuários cadastrados na plataforma"
            icone="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM9 8.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            cor="bg-slate-900 text-white"
            carregando={carregando}
          />
          <CardDestaque
            index={1}
            titulo="Novos na Semana"
            valor={s.usuarios.novos_ultimos_7_dias}
            subtitulo="cadastros nos últimos 7 dias"
            icone="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            cor="bg-blue-600 text-white"
            carregando={carregando}
          />
        </div>
      </section>

      {/* ============================================
          SEÇÃO 2: ENGAJAMENTO ACADÊMICO
          ============================================ */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-5 rounded-full bg-indigo-500" />
          <h2 className="text-base font-bold text-slate-700 uppercase tracking-wider">Engajamento Acadêmico</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {cardsEngajamento.map((card, i) => (
            <CardEngajamento key={card.titulo} {...card} index={i} carregando={carregando} />
          ))}
        </div>
      </section>

      {/* ============================================
          SEÇÃO 3: STATUS DO SISTEMA + PAINEL LATERAL
          ============================================ */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-5 rounded-full bg-slate-400" />
          <h2 className="text-base font-bold text-slate-700 uppercase tracking-wider">Status do Sistema</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Card Status */}
          <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900">Monitoramento</h3>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold
                ${isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}
              `}>
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                {isOnline ? 'API Online' : 'API Offline'}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Conexão com API */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className={`p-3 rounded-xl ${isOnline ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOnline ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'} />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="text-sm font-bold text-slate-800">Conexão com API</span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isOnline
                      ? 'Servidor backend acessível e respondendo normalmente.'
                      : 'API indisponível. Operações serão enfileiradas e sincronizadas ao reconectar.'}
                  </p>
                </div>
              </div>

              {/* Fila de Sincronização */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className={`p-3 rounded-xl ${pendentesSync > 0 ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  <svg className={`w-5 h-5 ${sincronizando ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-slate-800">Fila de Sincronização</span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {pendentesSync > 0
                      ? `${pendentesSync} operação(ões) aguardando sincronização.`
                      : 'Tudo sincronizado. Nenhuma operação pendente.'}
                  </p>
                </div>
                <button
                  id="btn-sincronizar-agora"
                  onClick={handleSincronizarAgora}
                  disabled={sincronizando || !isOnline}
                  title={!isOnline ? 'API indisponível' : 'Processar fila agora'}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0
                    ${sincronizando || !isOnline
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : pendentesSync > 0
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-slate-200 hover:text-slate-700'
                    }
                  `}
                >
                  <svg className={`w-3.5 h-3.5 ${sincronizando ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {sincronizando ? 'Sincronizando...' : 'Sincronizar Agora'}
                </button>
              </div>

              {/* Cache Local */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="text-sm font-bold text-slate-800">Cache Local (IndexedDB)</span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {totalUsuariosCache} usuário(s) armazenados no cache local para acesso offline.
                  </p>
                </div>
              </div>

              {/* Última atualização das stats */}
              {!isOnline && (
                <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 text-orange-700 rounded-2xl px-4 py-3 text-xs">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Estatísticas exibidas do cache local. Conecte à API para dados atualizados.</span>
                </div>
              )}
            </div>
          </div>

          {/* Card lateral: Boas-vindas + dica */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col gap-5">
            <h3 className="text-lg font-bold text-slate-900">Painel Admin</h3>

            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-blue-700 to-slate-800 text-white relative overflow-hidden flex-1">
              <svg className="absolute right-0 top-0 w-32 h-32 text-white opacity-10 transform translate-x-8 -translate-y-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div className="relative z-10 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/80">EduAcess Admin</span>
                </div>
                <h4 className="text-lg font-bold">Bem-vindo ao Painel</h4>
                <p className="text-white/80 text-xs leading-relaxed">
                  Gerencie usuários, acompanhe estatísticas e monitore o engajamento acadêmico da plataforma.
                </p>

                {/* Mini-estatísticas no card */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <span className="text-xl font-black">{carregando ? '…' : s.usuarios.total}</span>
                    <p className="text-[10px] text-white/70 mt-0.5">Usuários</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <span className="text-xl font-black">{carregando ? '…' : s.usuarios.novos_ultimos_7_dias}</span>
                    <p className="text-[10px] text-white/70 mt-0.5">Novos (7d)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dica offline */}
            <div className="bg-blue-50 rounded-2xl p-4 flex gap-3 items-start border border-blue-100">
              <svg className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium text-slate-600 leading-relaxed">
                Este painel funciona mesmo sem API. Alterações feitas offline são sincronizadas automaticamente ao reconectar.
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default DashboardAdmin
