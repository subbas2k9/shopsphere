import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

let toastSubscriber = null;

// Global helper to trigger toast from anywhere
export const showToast = (message, type = 'success') => {
  if (toastSubscriber) {
    toastSubscriber(message, type);
  }
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastSubscriber = (message, type = 'success') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    return () => {
      toastSubscriber = null;
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-2xl backdrop-blur-xl border transition-all duration-300 transform translate-y-0 animate-fade-in ${
            toast.type === 'success'
              ? 'bg-dark-800/90 border-emerald-500/40 text-gray-100 shadow-emerald-950/20'
              : toast.type === 'error'
              ? 'bg-dark-800/90 border-rose-500/40 text-gray-100 shadow-rose-950/20'
              : 'bg-dark-800/90 border-brand-500/40 text-gray-100 shadow-brand-950/20'
          }`}
        >
          <div className="flex items-center gap-3">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-brand-400 shrink-0" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors ml-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
