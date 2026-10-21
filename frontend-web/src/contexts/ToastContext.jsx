import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * ToastContext.jsx
 *
 * Sistema global de notificações/toasts para o EduAcess.
 * Suporta 4 variantes: success, error, warning, info.
 *
 * Uso:
 *   const { addToast } = useToast();
 *   addToast({ type: 'error', title: 'Falha de conexão', message: 'Não foi possível conectar ao servidor.', action: 'Tente novamente.' });
 *   addToast({ type: 'success', message: 'Tarefa criada com sucesso!' });
 */

const ToastContext = createContext(null);

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message, action, duration = 5000 }) => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev, { id, type, title, message, action }]);

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de <ToastProvider>');
  return ctx;
}

// ============================================================
// Componentes visuais internos
// ============================================================

const TOAST_STYLES = {
  success: {
    container: 'bg-white dark:bg-gray-800 border-l-4 border-green-500',
    icon: (
      <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    titleColor: 'text-green-700 dark:text-green-400',
    progress: 'bg-green-500',
  },
  error: {
    container: 'bg-white dark:bg-gray-800 border-l-4 border-red-500',
    icon: (
      <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    titleColor: 'text-red-700 dark:text-red-400',
    progress: 'bg-red-500',
  },
  warning: {
    container: 'bg-white dark:bg-gray-800 border-l-4 border-yellow-400',
    icon: (
      <svg className="w-5 h-5 text-yellow-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    titleColor: 'text-yellow-700 dark:text-yellow-400',
    progress: 'bg-yellow-400',
  },
  info: {
    container: 'bg-white dark:bg-gray-800 border-l-4 border-blue-500',
    icon: (
      <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    titleColor: 'text-blue-700 dark:text-blue-400',
    progress: 'bg-blue-500',
  },
};

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      aria-live="assertive"
      aria-atomic="false"
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl
        ${style.container} animate-fade-in-up transition-all`}
      role="alert"
    >
      {/* Ícone */}
      <div className="mt-0.5">{style.icon}</div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className={`text-sm font-bold leading-snug ${style.titleColor}`}>
            {toast.title}
          </p>
        )}
        {toast.message && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5 leading-snug">
            {toast.message}
          </p>
        )}
        {toast.action && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 leading-snug">
            {toast.action}
          </p>
        )}
      </div>

      {/* Botão fechar */}
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg transition-colors"
        aria-label="Fechar notificação"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
