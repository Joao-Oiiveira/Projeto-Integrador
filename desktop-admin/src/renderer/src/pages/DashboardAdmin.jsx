// pages/DashboardAdmin.jsx — Tela de Dashboard com cards de estatísticas
import React, { useState, useEffect, useCallback } from 'react'
import { fetchUsuarios } from '../services/usersService'
import { processSyncQueue } from '../sync/syncEngine'
import useOnlineStatus from '../hooks/useOnlineStatus'
import db from '../db/db'

const DashboardAdmin = () => {
  const isOnline = useOnlineStatus()
  const [totalUsuarios, setTotalUsuarios] = useState(0)
  const [totalAdmins, setTotalAdmins] = useState(0)
  const [totalAlunos, setTotalAlunos] = useState(0)
  const [pendentesSync, setPendentesSync] = useState(0)
  const [carregando, setCarregando] = useState(true)
  const [sincronizando, setSincronizando] = useState(false)
  const [feedbackSync, setFeedbackSync] = useState(null) // { tipo: 'sucesso'|'info'|'erro', msg: string }

  const carregarDados = useCallback(async () => {
    try {
      // fetchUsuarios nunca lança erro de rede — sempre retorna array (API ou cache)
      const usuarios = await fetchUsuarios(isOnline)
      setTotalUsuarios(usuarios.length)
      setTotalAdmins(usuarios.filter(u => u.is_admin).length)
      setTotalAlunos(usuarios.filter(u => !u.is_admin).length)

      // Contar operações pendentes na fila de sincronização
      const pendentes = await db.sync_queue.where('status').equals('pendente').count()
      setPendentesSync(pendentes)
    } catch (error) {
      // Segurança extra: mesmo que algo inesperado aconteça, a UI exibe zeros
      console.error('[Dashboard] Erro inesperado ao carregar dados:', error)
    } finally {
      setCarregando(false)
    }
  }, [isOnline])

  // Carrega dados ao montar e tenta processar a fila pendente
  // Isso resolve o caso em que a API caiu (mas o PC ficou com internet),
  // e o evento 'online' não disparou. A fila é sempre tentada ao abrir o dashboard.
  useEffect(() => {
    const inicializar = async () => {
      await carregarDados()

      // Tenta processar a fila logo ao entrar no dashboard
      const pendentesIniciais = await db.sync_queue.where('status').equals('pendente').count()
      if (pendentesIniciais > 0 && isOnline) {
        console.log(`[Dashboard] ${pendentesIniciais} item(s) pendente(s) encontrado(s). Tentando sincronizar...`)
        const resultado = await processSyncQueue()
        if (resultado.processados > 0) {
          // Atualiza a contagem após sync automático
          const pendentesApos = await db.sync_queue.where('status').equals('pendente').count()
          setPendentesSync(pendentesApos)
          console.log(`[Dashboard] Sync automático: ${resultado.processados} item(s) sincronizado(s).`)
        }
      }
    }

    inicializar()
  }, [isOnline, carregarDados])

  // Limpa o feedback de sync após 4 segundos
  useEffect(() => {
    if (feedbackSync) {
      const timer = setTimeout(() => setFeedbackSync(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [feedbackSync])

  /**
   * Sincronização manual: processa a fila e atualiza os contadores.
   * Chamada pelo botão "Sincronizar Agora".
   */
  const handleSincronizarAgora = async () => {
    if (sincronizando) return
    setSincronizando(true)
    setFeedbackSync(null)

    try {
      const resultado = await processSyncQueue()
      // Atualiza contadores após sync
      const pendentesAtuais = await db.sync_queue.where('status').equals('pendente').count()
      setPendentesSync(pendentesAtuais)

      if (resultado.processados > 0) {
        setFeedbackSync({
          tipo: 'sucesso',
          msg: `${resultado.processados} operação(ões) sincronizada(s) com sucesso!`
        })
        // Recarrega dados da API após sync bem-sucedido
        await carregarDados()
      } else if (pendentesAtuais === 0) {
        setFeedbackSync({ tipo: 'info', msg: 'Nenhuma operação pendente. Tudo sincronizado.' })
      } else {
        setFeedbackSync({
          tipo: 'erro',
          msg: `${pendentesAtuais} operação(ões) ainda na fila. API indisponível?`
        })
      }
    } catch (error) {
      console.error('[Dashboard] Erro ao sincronizar:', error)
      setFeedbackSync({ tipo: 'erro', msg: 'Falha ao tentar sincronizar a fila.' })
    } finally {
      setSincronizando(false)
    }
  }

  const metricas = [
    {
      titulo: 'Total de Usuários',
      valor: totalUsuarios,
      destaque: true,
      icone: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM9 8.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      cor: 'bg-blue-50 text-blue-600'
    },
    {
      titulo: 'Estudantes',
      valor: totalAlunos,
      destaque: false,
      icone: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      cor: 'bg-sky-50 text-sky-600'
    },
    {
      titulo: 'Administradores',
      valor: totalAdmins,
      destaque: false,
      icone: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      cor: 'bg-emerald-50 text-emerald-600'
    },
    {
      titulo: 'Pendentes de Sync',
      valor: pendentesSync,
      destaque: false,
      icone: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
      cor: pendentesSync > 0 ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-400'
    }
  ]

  const dataAtual = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', weekday: 'long' }).format(new Date())

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      
      {/* Cabeçalho da página */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1 capitalize">{dataAtual}</p>
        </div>
      </div>

      {/* Toast de feedback de sincronização */}
      {feedbackSync && (
        <div className={`flex items-center gap-3 border rounded-2xl px-5 py-3.5 text-sm animate-fade-in-up ${
          feedbackSync.tipo === 'sucesso'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : feedbackSync.tipo === 'info'
              ? 'bg-blue-50 border-blue-200 text-blue-800'
              : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <svg className={`w-5 h-5 shrink-0 ${
            feedbackSync.tipo === 'sucesso' ? 'text-emerald-500' :
            feedbackSync.tipo === 'info' ? 'text-blue-500' : 'text-red-500'
          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={
              feedbackSync.tipo === 'sucesso'
                ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                : feedbackSync.tipo === 'info'
                  ? 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            } />
          </svg>
          <span>{feedbackSync.msg}</span>
        </div>
      )}

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricas.map((item, index) => (
          <div
            key={index}
            className={`
              p-6 rounded-[2rem] flex flex-col gap-4 shadow-sm border transition-all hover:shadow-md
              ${item.destaque
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-900 border-gray-100'
              }
            `}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex justify-between items-start">
              <span className={`text-sm font-medium ${item.destaque ? 'text-slate-300' : 'text-slate-500'}`}>
                {item.titulo}
              </span>
              <div className={`p-2 rounded-xl ${item.destaque ? 'bg-slate-800 text-white' : item.cor}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icone} />
                </svg>
              </div>
            </div>
            <div className="text-4xl font-bold animate-pulse-once">
              {carregando ? (
                <div className="h-10 w-16 bg-gray-200 rounded-xl animate-pulse" />
              ) : (
                item.valor
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Seção inferior: Status do Sistema + Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Card de Status do Sistema */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Status do Sistema</h2>
            <div className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold
              ${isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}
            `}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              {isOnline ? 'API Online' : 'API Offline'}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Item de status: Conexão */}
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

            {/* Item de status: Fila de sync + botão "Sincronizar Agora" */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <div className={`p-3 rounded-xl ${pendentesSync > 0 ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                <svg
                  className={`w-5 h-5 ${sincronizando ? 'animate-spin' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-slate-800">Fila de Sincronização</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  {pendentesSync > 0
                    ? `${pendentesSync} operação(ões) aguardando sincronização.`
                    : 'Tudo sincronizado. Nenhuma operação pendente.'
                  }
                </p>
              </div>

              {/* Botão "Sincronizar Agora" */}
              <button
                id="btn-sincronizar-agora"
                onClick={handleSincronizarAgora}
                disabled={sincronizando || !isOnline}
                title={!isOnline ? 'API indisponível' : 'Processar fila agora'}
                className={`
                  flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
                  transition-all shrink-0
                  ${sincronizando || !isOnline
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : pendentesSync > 0
                      ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-slate-200 hover:text-slate-700'
                  }
                `}
              >
                <svg
                  className={`w-3.5 h-3.5 ${sincronizando ? 'animate-spin' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {sincronizando ? 'Sincronizando...' : 'Sincronizar Agora'}
              </button>
            </div>

            {/* Item de status: Cache local */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-sm font-bold text-slate-800">Cache Local (IndexedDB)</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  {totalUsuarios} usuário(s) armazenados no cache local para acesso offline.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card lateral: Ações Rápidas */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Ações Rápidas</h2>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            {/* Card de boas-vindas */}
            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-blue-700 to-slate-800 text-white relative overflow-hidden">
              <svg className="absolute right-0 top-0 w-32 h-32 text-white opacity-10 transform translate-x-8 -translate-y-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div className="relative z-10 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/80">EduAcess Admin</span>
                </div>
                <h3 className="text-lg font-bold">Bem-vindo ao Painel</h3>
                <p className="text-white/90 text-xs leading-relaxed">
                  Gerencie os usuários da plataforma, altere senhas e remova contas diretamente deste painel.
                </p>
              </div>
            </div>

            {/* Dica sobre modo offline */}
            <div className="mt-auto pt-4 border-t border-gray-100">
              <div className="bg-blue-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 border border-blue-100">
                <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium text-slate-600">
                  Este painel funciona mesmo sem API. Alterações feitas offline são sincronizadas automaticamente ao reconectar.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardAdmin
