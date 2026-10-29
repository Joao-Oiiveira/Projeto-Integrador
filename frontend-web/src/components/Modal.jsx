import React, { useEffect } from 'react';

/**
 * Modal Component
 * 
 * Componente de modal com bloqueio de tela durante salvamentos e chamadas de IA.
 * Quando `isLoading` ou `preventClose` está ativo:
 * - O botão "X" de fechar fica desabilitado e inativo
 * - O fechamento pela tecla ESC é bloqueado
 * - Um overlay de bloqueio visual centralizado impede qualquer interação
 * - Previne fechamento ou recarregamento acidental da página pelo navegador
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  isLoading = false,
  loadingMessage = "Salvando informações...",
  loadingSubmessage = "Por favor, aguarde a conclusão da operação. A tela permanecerá bloqueada para evitar inconsistências.",
  isAI = false,
  preventClose = false,
  maxWidth = "max-w-lg"
}) => {
  // Previne fechamento via tecla Escape enquanto estiver salvando/processando
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (!isLoading && !preventClose) {
          onClose?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, preventClose, onClose]);

  // Previne fechar a aba/janela do navegador se houver processo crítico rodando
  useEffect(() => {
    if (!isLoading) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isLoading]);

  if (!isOpen) return null;

  const isLocked = isLoading || preventClose;

  const handleClose = () => {
    if (!isLocked) {
      onClose?.();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in"
      aria-modal="true"
      role="dialog"
    >
      <div 
        className={`relative bg-white dark:bg-gray-800 w-full ${maxWidth} rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-fade-in-up border border-gray-100 dark:border-gray-700`}
      >
        
        {/* Header do Modal */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {isAI && (
              <span className="p-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-lg text-sm">
                ✨
              </span>
            )}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          </div>
          
          <button 
            type="button"
            onClick={handleClose}
            disabled={isLocked}
            aria-disabled={isLocked}
            aria-label="Fechar janela"
            title={isLocked ? "A tela está bloqueada durante o processamento. Aguarde..." : "Fechar"}
            className={`p-2 rounded-full transition-all ${
              isLocked 
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 opacity-40 cursor-not-allowed pointer-events-none' 
                : 'bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar relative">
          <div className={isLocked ? 'pointer-events-none select-none filter blur-[0.5px] opacity-40 transition-all duration-300' : ''}>
            {children}
          </div>

          {/* OVERLAY DE BLOQUEIO DE TELA DURANTE SALVAMENTO / PROCESSAMENTO IA */}
          {isLoading && (
            <div 
              className="absolute inset-0 bg-white/90 dark:bg-gray-800/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center animate-fade-in"
              role="alert"
              aria-busy="true"
            >
              {isAI ? (
                <div className="relative mb-5">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-purple-500/30 animate-pulse">
                    ✨
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-purple-400/40 border-t-purple-600 animate-spin -m-1" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full border-4 border-purple-200 dark:border-purple-900/50 border-t-purple-600 animate-spin mb-4" />
              )}

              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">
                {loadingMessage}
              </h3>
              
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed mb-4">
                {loadingSubmessage}
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
                Tela bloqueada para sua segurança
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default Modal;
