// pages/DashboardAdmin.jsx — Tela de Dashboard com cards de estatísticas
import React, { useState, useEffect } from 'react'
import { fetchUsuarios } from '../services/usersService'
import useOnlineStatus from '../hooks/useOnlineStatus'
import db from '../db/db'

const DashboardAdmin = () => {
  const isOnline = useOnlineStatus()
  const [totalUsuarios, setTotalUsuarios] = useState(0)
  const [totalAdmins, setTotalAdmins] = useState(0)
  const [totalAlunos, setTotalAlunos] = useState(0)
  const [pendentesSync, setPendentesSync] = useState(0)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const usuarios = await fetchUsuarios(isOnline)
        setTotalUsuarios(usuarios.length)
        setTotalAdmins(usuarios.filter(u => u.is_admin).length)
        setTotalAlunos(usuarios.filter(u => !u.is_admin).length)

        // Contar operações pendentes na fila de sincronização
        const pendentes = await db.sync_queue.where('status').equals('pendente').count()
        setPendentesSync(pendentes)
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [isOnline])

  const metricas = [
    {
      titulo: 'Total de Usuários',
      valor: totalUsuarios,
      destaque: true,
      icone: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM9 8.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      cor: 'bg-purple-50 text-purple-600'
    },
    {
      titulo: 'Estudantes',
      valor: totalAlunos,
      destaque: false,
      icone: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      cor: 'bg-blue-50 text-blue-600'
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1 capitalize">{dataAtual}</p>
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricas.map((item, index) => (
          <div
            key={index}
            className={`
              p-6 rounded-[2rem] flex flex-col gap-4 shadow-sm border transition-all hover:shadow-md
              ${item.destaque
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-900 border-gray-100'
              }
            `}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex justify-between items-start">
              <span className={`text-sm font-medium ${item.destaque ? 'text-gray-300' : 'text-gray-500'}`}>
                {item.titulo}
              </span>
              <div className={`p-2 rounded-xl ${item.destaque ? 'bg-gray-800 text-white' : item.cor}`}>
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

      {/* Seção inferior: Status do Sistema + Dicas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Card de Status do Sistema */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Status do Sistema</h2>
            <div className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold
              ${isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}
            `}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              {isOnline ? 'Conectado' : 'Offline'}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Item de status: Conexão */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className={`p-3 rounded-xl ${isOnline ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOnline ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'} />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-sm font-bold text-gray-800">Conexão com API</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isOnline ? 'Servidor backend acessível e respondendo normalmente.' : 'Sem conexão com o servidor. Operações serão enfileiradas.'}
                </p>
              </div>
            </div>

            {/* Item de status: Fila de sync */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className={`p-3 rounded-xl ${pendentesSync > 0 ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-sm font-bold text-gray-800">Fila de Sincronização</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  {pendentesSync > 0
                    ? `${pendentesSync} operação(ões) aguardando sincronização.`
                    : 'Tudo sincronizado. Nenhuma operação pendente.'
                  }
                </p>
              </div>
            </div>

            {/* Item de status: Cache local */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-sm font-bold text-gray-800">Cache Local (IndexedDB)</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  {totalUsuarios} usuário(s) armazenados no cache local para acesso offline.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card lateral: Informações do Admin */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Ações Rápidas</h2>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            {/* Card de boas-vindas */}
            <div className="p-6 rounded-[2rem] bg-gradient-to-r from-purple-600 to-indigo-600 text-white relative overflow-hidden">
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
              <div className="bg-[#F4F7FE] rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 border border-blue-50">
                <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium text-gray-600">
                  Este painel funciona offline. Alterações feitas sem internet serão sincronizadas automaticamente ao reconectar.
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
