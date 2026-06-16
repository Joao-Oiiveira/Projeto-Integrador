import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { getLoggedUser, logoutAPI } from '../services/auth'; // <-- Corrigido para logoutAPI
import { useAccessibility } from '../contexts/AccessibilityContext';
import Modal from '../components/Modal';
import Checkbox from '../components/Checkbox';
import TTSReader from '../components/TTSReader';
import { obterNotificacoes, marcarComoLida, marcarTodasComoLidas } from '../services/notificacoes';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { configuracoes, updateAccessibility } = useAccessibility();
  const [isAcessibilidadeOpen, setIsAcessibilidadeOpen] = useState(false);

  // Estados de Notificações
  const [notificacoes, setNotificacoes] = useState([]);
  const [isNotificacoesOpen, setIsNotificacoesOpen] = useState(false);

  // Estado para o Dropdown do Perfil
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const carregarNotificacoes = async () => {
    try {
      const data = await obterNotificacoes();
      setNotificacoes(data || []);
    } catch (error) {
      console.error("Erro ao buscar notificações", error);
    }
  };

  useEffect(() => {
    const loggedUser = getLoggedUser();
    if (!loggedUser) {
      navigate('/login');
    } else if (!loggedUser.perfil && !loggedUser.perfil_usuario) {
      navigate('/onboarding');
    } else {
      setUser(loggedUser);
      carregarNotificacoes();
    }
  }, [navigate]);

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsNotificacoesOpen(false);
    setIsProfileOpen(false); // Fecha o menu de perfil ao mudar de tela
  }, [location.pathname]);

  if (!user) return null;

  const handleConfigChange = (campo, valor) => {
    updateAccessibility({ [campo]: valor });
  };

  const handleMarcarLida = async (id) => {
    await marcarComoLida(id);
    carregarNotificacoes();
  };

  const handleLimparTodas = async () => {
    await marcarTodasComoLidas();
    carregarNotificacoes();
    setIsNotificacoesOpen(false);
  };

  // NOVO: Função que limpa os dados e redireciona
  const handleLogout = () => {
    // Limpa o cofre do navegador
    localStorage.removeItem('@EduAcess:token');
    localStorage.removeItem('@EduAcess:loggedUser');
    
    // Força o recarregamento da página para limpar qualquer estado do React
    window.location.href = '/login';
  };

  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { path: '/disciplinas', label: 'Disciplinas', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { path: '/tarefas', label: 'Tarefas', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { path: '/calendario', label: 'Calendário', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { path: '/flashcards', label: 'Flashcards', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { path: '/exercicios', label: 'Exercícios', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  ];

  const dataAtual = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', weekday: 'long' }).format(new Date());

  return (
    <div className="flex h-screen bg-[#F4F7FE] text-gray-800 font-sans dyslexia:font-opendyslexic overflow-hidden">
      
      <TTSReader />

      {isSidebarOpen && <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#F4F7FE] dark:bg-gray-900 flex flex-col justify-between py-6 px-4 shrink-0 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 border-r border-gray-200 dark:border-gray-800 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-none'}`}>
        <div>
          <div className="flex items-center justify-between px-4 mb-10">
            <div className="flex items-center gap-3">
              <div className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white w-8 h-8 flex items-center justify-center rounded-lg font-bold">e.</div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">EduAcess</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <nav className="flex flex-col gap-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button key={item.label} onClick={() => navigate(item.path)} className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all ${isActive ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md' : 'text-gray-500 hover:bg-white dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          {/* Botão de Acessibilidade Ajustado (Igual ao de Configurações) */}
          <button 
            onClick={() => setIsAcessibilidadeOpen(true)} 
            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all text-gray-500 hover:bg-white dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            Acessibilidade
          </button>

          <button onClick={() => navigate('/configuracoes')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all ${location.pathname === '/configuracoes' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md' : 'text-gray-500 hover:bg-white dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Configurações
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        <header className="flex justify-between items-center py-4 px-4 sm:py-6 sm:px-8 shrink-0 bg-[#F4F7FE] dark:bg-gray-900 lg:bg-transparent z-30">
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="hidden md:flex items-center gap-3 bg-white dark:bg-gray-800 px-5 py-2.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className="font-medium text-gray-700 dark:text-gray-300 capitalize text-sm lg:text-base">{dataAtual}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            
            {/* SINO DE NOTIFICAÇÕES */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotificacoesOpen(!isNotificacoesOpen);
                  setIsProfileOpen(false);
                }}
                className="bg-white dark:bg-gray-800 p-2.5 rounded-full text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors relative"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {notificacoesNaoLidas.length > 0 && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white dark:border-gray-800 rounded-full animate-pulse"></span>
                )}
              </button>

              {/* DROPDOWN DE NOTIFICAÇÕES */}
              {isNotificacoesOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-fade-in">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="font-bold text-gray-900 dark:text-white">Notificações</h3>
                    {notificacoesNaoLidas.length > 0 && (
                      <button onClick={handleLimparTodas} className="text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400">Marcar todas como lidas</button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {notificacoes.length === 0 ? (
                      <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">Nenhuma notificação.</div>
                    ) : (
                      notificacoes.map(notif => (
                        <div 
                          key={notif.id} 
                          onClick={() => !notif.lida && handleMarcarLida(notif.id)}
                          className={`p-4 border-b border-gray-50 dark:border-gray-700/50 transition-colors ${!notif.lida ? 'bg-purple-50/50 dark:bg-purple-900/10 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20' : 'bg-white dark:bg-gray-800 opacity-70'}`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <h4 className={`text-sm font-bold ${!notif.lida ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{notif.titulo}</h4>
                            {!notif.lida && <span className="w-2 h-2 bg-purple-500 rounded-full mt-1 shrink-0"></span>}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{notif.descricao}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* PERFIL COM DROPDOWN DE LOGOUT */}
            <div className="relative">
              <div 
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificacoesOpen(false);
                }}
                className="flex items-center gap-3 bg-white dark:bg-gray-800 p-1 sm:px-2 sm:py-1.5 sm:pr-4 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold text-sm">
                  {user.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight max-w-[120px] truncate">{user.nome}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Estudante</span>
                </div>
              </div>

              {/* Menu Flutuante do Perfil */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-fade-in">
                  <div className="p-2">
                    <button 
                      onClick={handleLogout} // <-- Usando a nova função que limpa e redireciona
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sair da Conta
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-8 custom-scrollbar w-full">
          <Outlet />
        </div>
      </main>

      <Modal isOpen={isAcessibilidadeOpen} onClose={() => setIsAcessibilidadeOpen(false)} title="Ajustes de Acessibilidade">
        <div className="flex flex-col gap-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">As alterações feitas aqui são salvas automaticamente e aplicadas em todo o sistema.</p>
          <div className="flex flex-col gap-4">
            <Checkbox id="menu_tema_escuro" label="Tema Escuro (Dark Mode)" description="Reduz o brilho da tela" checked={configuracoes.tema_escuro} onChange={() => handleConfigChange('tema_escuro', !configuracoes.tema_escuro)} />
            <Checkbox id="menu_fonte_dislexia" label="Fonte para Dislexia" description="Aplica a fonte OpenDyslexic" checked={configuracoes.fonte_dislexia} onChange={() => handleConfigChange('fonte_dislexia', !configuracoes.fonte_dislexia)} />
            <Checkbox id="menu_leitura_texto" label="Leitura de Texto (TTS)" description="Ativa o botão flutuante de leitura" checked={configuracoes.leitura_texto} onChange={() => handleConfigChange('leitura_texto', !configuracoes.leitura_texto)} />
            <div className="flex flex-col gap-1.5 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tamanho da Fonte (Base)</label>
              <select className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md p-2 mt-1 focus:ring-2 focus:ring-purple-500 border border-gray-200 dark:border-gray-700 outline-none cursor-pointer" value={configuracoes.tamanho_fonte} onChange={(e) => handleConfigChange('tamanho_fonte', Number(e.target.value))}>
                <option value={16}>Padrão (16px)</option>
                <option value={20}>Grande (20px)</option>
                <option value={24}>Extra Grande (24px)</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardLayout;