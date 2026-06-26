import React, { createContext, useContext, useMemo, useState } from 'react';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const api = useMemo(() => ({
    show(message, type = 'success', title = '') {
      const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      setToasts(prev => [...prev, { id, message, type, title }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3600);
    }
  }), []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-wrap">
        {toasts.map(toast => <Toast key={toast.id} toast={toast} onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} />)}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onClose }) {
  const icons = {
    success: CheckCircle2,
    info: Info,
    warning: AlertTriangle,
    error: XCircle
  };
  const Icon = icons[toast.type] || Info;
  return (
    <div className={`toast toast-${toast.type}`}>
      <Icon size={22} />
      <div className="toast-content">
        <strong>{toast.title || defaultTitle(toast.type)}</strong>
        <span>{toast.message}</span>
      </div>
      <button type="button" className="icon-btn small" onClick={onClose}><X size={16} /></button>
    </div>
  );
}

function defaultTitle(type) {
  return type === 'success' ? 'Thành công' : type === 'warning' ? 'Lưu ý' : type === 'error' ? 'Có lỗi xảy ra' : 'Thông báo';
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
