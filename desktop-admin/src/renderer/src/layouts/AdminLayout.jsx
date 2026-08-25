// layouts/AdminLayout.jsx — Layout base com Sidebar + Header (identidade visual EduAcess Web)
import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { logoutAdmin, getAdminUser } from '../services/authService'
import useOnlineStatus from '../hooks/useOnlineStatus'

const AdminLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const isOnline = useOnlineStatus()
  const user = getAdminUser()

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleLogout = () => {
    logoutAdmin()
    navigate('/login')
  }

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
    },
    {
      path: '/usuarios',
      label: 'Usuários',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM9 8.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
    }
  ]

  return (
    <div className="flex h-screen bg-[#F4F7FE] text-gray-800 font-sans overflow-hidden">

      {/* Overlay mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ============================
          SIDEBAR
          ============================ */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-[#F4F7FE]
          flex flex-col justify-between py-6 px-4 shrink-0
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 border-r border-gray-200
          ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-none'}
        `}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center justify-between px-4 mb-10">
            <div className="flex items-center gap-3">
              <div className="bg-gray-900 text-white w-8 h-8 flex items-center justify-center rounded-lg font-bold">e.</div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 leading-tight">EduAcess</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600">Admin</span>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-400 bg-gray-100 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menu de navegação */}
          <nav className="flex flex-col gap-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    navigate(item.path)
                    setIsSidebarOpen(false)
                  }}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all
                    ${isActive
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'text-gray-500 hover:bg-white hover:text-gray-900'
                    }
                  `}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Badge de status online/offline no rodapé da sidebar */}
        <div className="flex flex-col gap-3 mt-4 px-2">
          <div className={`
            flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold
            ${isOnline
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              : 'bg-red-50 text-red-700 border border-red-100'
            }
          `}>
            <span className={`w-2 h-2 rounded-full shrink-0 ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            {isOnline ? 'Sistema Online' : 'Sistema Offline'}
          </div>
        </div>
      </aside>

      {/* ============================
          CONTEÚDO PRINCIPAL
          ============================ */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        
        {/* Header */}
        <header className="flex justify-between items-center py-4 px-4 sm:py-5 sm:px-8 shrink-0 bg-[#F4F7FE] lg:bg-transparent z-30">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Menu hamburguer (mobile) */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Título da página atual */}
            <div className="hidden md:flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-gray-100">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="font-medium text-gray-700 text-sm">Painel Administrativo</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Perfil + Logout */}
            <div className="flex items-center gap-3 bg-white p-1 px-2 pr-4 rounded-full shadow-sm border border-gray-100">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
                {user?.nome ? user.nome.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-bold text-gray-900 leading-tight max-w-[120px] truncate">
                  {user?.nome || 'Admin'}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Administrador</span>
              </div>
            </div>

            {/* Botão de Logout */}
            <button
              onClick={handleLogout}
              className="p-2.5 bg-white rounded-full shadow-sm border border-gray-100 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
              title="Sair"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        {/* Área de conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-8 custom-scrollbar w-full">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
