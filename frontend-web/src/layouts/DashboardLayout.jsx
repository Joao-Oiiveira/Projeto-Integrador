import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { getLoggedUser } from '../services/auth';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  
  // NOVO: Controle de estado do menu no mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const loggedUser = getLoggedUser();
    if (!loggedUser) {
      navigate('/login');
    } else if (!loggedUser.perfil_usuario) {
      navigate('/onboarding');
    } else {
      setUser(loggedUser);
    }
  }, [navigate]);

  // NOVO: Fechar o menu mobile automaticamente ao trocar de página
  useEffect(() => {
    setIsSidebarOpen(false);
  },[location.pathname]);

  if (!user) return null;

  const menuItems =[
    { path: '/dashboard', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { path: '/disciplinas', label: 'Disciplinas', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { path: '/tarefas', label: 'Tarefas', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { path: '/calendario', label: 'Calendário', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }, 
    { path: '/flashcards', label: 'Flashcards', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { path: '#chatia', label: 'Chat IA', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  ];

  const dataAtual = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', weekday: 'long' }).format(new Date());

  return (
    <div className="flex h-screen bg-[#F4F7FE] text-gray-800 font-sans overflow-hidden">
      
      {/* NOVO: Fundo escuro (Overlay) quando o menu estiver aberto no mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR (Agora é responsiva: Fixa no mobile, Relativa no Desktop) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#F4F7FE] flex flex-col justify-between py-6 px-4 shrink-0 
        transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-none'}
      `}>
        <div>
          {/* Logo + Botão de fechar (Aparece só no mobile) */}
          <div className="flex items-center justify-between px-4 mb-10">
            <div className="flex items-center gap-3">
              <div className="bg-gray-900 text-white w-8 h-8 flex items-center justify-center rounded-lg font-bold">e.</div>
              <span className="text-xl font-bold text-gray-900">EduAcess</span>
            </div>
            {/* Fechar no Mobile */}
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-gray-400 bg-gray-100 rounded-full hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <nav className="flex flex-col gap-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.label}
                  onClick={() => item.path.startsWith('/') && navigate(item.path)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all ${
                    isActive 
                      ? 'bg-gray-900 text-white shadow-md' 
                      : 'text-gray-500 hover:bg-white hover:text-gray-900'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <button className="flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-gray-500 hover:bg-white hover:text-gray-900 transition-all mt-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Configurações
        </button>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        
        {/* HEADER RESPONSIVO */}
        <header className="flex justify-between items-center py-4 px-4 sm:py-6 sm:px-8 shrink-0 bg-[#F4F7FE] lg:bg-transparent z-30">
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botão Hambúrguer (Só mobile) */}
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="lg:hidden p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-600 hover:text-purple-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            
            {/* Oculto em telas muuuito pequenas para não quebrar */}
            <div className="hidden md:flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-gray-100">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className="font-medium text-gray-700 capitalize text-sm lg:text-base">{dataAtual}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="bg-white p-2 sm:p-2.5 rounded-full text-gray-400 hover:text-purple-600 shadow-sm border border-gray-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
            
            {/* Perfil Simplificado no Mobile */}
            <div className="flex items-center gap-3 bg-white p-1 sm:px-2 sm:py-1.5 sm:pr-4 rounded-full shadow-sm border border-gray-100 cursor-pointer">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
                {user.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-bold text-gray-900 leading-tight max-w-[120px] truncate">{user.nome}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Estudante</span>
              </div>
            </div>
          </div>
        </header>

        {/* CONTEÚDO DINÂMICO (PÁGINAS) */}
        {/* Ajustado padding para caber direito no celular */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-8 custom-scrollbar w-full">
          <Outlet />
        </div>

      </main>

    </div>
  );
};

export default DashboardLayout;