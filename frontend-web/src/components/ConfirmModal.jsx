import React from 'react';

/**
 * ConfirmModal Component
 * Modal de confirmação reutilizável com suporte a estado de carregamento (isLoading)
 * para impedir múltiplos cliques e mostrar feedback durante exclusões.
 */
const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Excluir",
  isLoading = false,
  loadingText = "Excluindo..."
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-fade-in-up border border-gray-100 dark:border-gray-700 p-6 md:p-8 text-center">
        
        {/* Ícone de Alerta */}
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 shrink-0">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Textos */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">{message}</p>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button 
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className={`flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-sm transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
            }`}
          >
            Cancelar
          </button>
          <button 
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm shadow-red-200 dark:shadow-none ${
              isLoading ? 'opacity-70 cursor-not-allowed pointer-events-none' : ''
            }`}
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4 text-white shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            <span>{isLoading ? loadingText : confirmText}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;