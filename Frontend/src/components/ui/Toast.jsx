import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: <CheckCircle size={18} />,
  error:   <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info:    <Info size={18} />,
};

const COLORS = {
  success: 'border-green-500/30 text-green-400',
  error:   'border-red-500/30 text-red-400',
  warning: 'border-yellow-500/30 text-yellow-400',
  info:    'border-blue-500/30 text-blue-400',
};

function Toast({ id, type = 'info', message, onRemove }) {
  return (
    <div
      role="alert"
      style={{
        animation: 'fade-in-up 0.35s cubic-bezier(0.16,1,0.3,1) both',
        background: 'var(--color-elevated)',
        border: `1px solid`,
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        minWidth: '280px',
        maxWidth: '400px',
        boxShadow: 'var(--shadow-modal)',
      }}
      className={`${COLORS[type]}`}
    >
      <span className="shrink-0">{ICONS[type]}</span>
      <span
        className="flex-1 text-sm font-sans"
        style={{ color: 'var(--color-text-1)' }}
      >
        {message}
      </span>
      <button
        onClick={() => onRemove(id)}
        className="shrink-0 cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Dismiss notification"
        style={{ color: 'var(--color-text-2)' }}
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info:    (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div
        aria-live="polite"
        aria-atomic="false"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <Toast {...t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
