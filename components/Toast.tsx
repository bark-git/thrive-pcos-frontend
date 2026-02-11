'use client';

import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'celebration';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  subMessage?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, options?: { subMessage?: string; duration?: number }) => void;
  showCelebration: (title: string, message: string) => void;
}

// Create a simple event-based system for toasts
const toastListeners: ((toast: Toast) => void)[] = [];

export const toast = {
  show: (message: string, type: ToastType = 'success', options?: { subMessage?: string; duration?: number }) => {
    const newToast: Toast = {
      id: Date.now().toString(),
      message,
      type,
      subMessage: options?.subMessage,
      duration: options?.duration || 3000
    };
    toastListeners.forEach(listener => listener(newToast));
  },
  success: (message: string, subMessage?: string) => toast.show(message, 'success', { subMessage }),
  error: (message: string, subMessage?: string) => toast.show(message, 'error', { subMessage }),
  info: (message: string, subMessage?: string) => toast.show(message, 'info', { subMessage }),
  celebration: (title: string, message: string) => toast.show(title, 'celebration', { subMessage: message, duration: 5000 }),
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (newToast: Toast) => {
      setToasts(prev => [...prev, newToast]);
      
      // Auto-remove after duration
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, newToast.duration || 3000);
    };

    toastListeners.push(handleToast);
    return () => {
      const index = toastListeners.indexOf(handleToast);
      if (index > -1) toastListeners.splice(index, 1);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast: t, onClose }: { toast: Toast; onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    celebration: '🎉'
  };

  const styles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    celebration: 'bg-gradient-to-r from-peach-500 via-sage-500 to-orange-400 text-white'
  };

  return (
    <div
      className={`transform transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className={`${styles[t.type]} rounded-xl shadow-lg p-4 flex items-start gap-3`}>
        {t.type === 'celebration' ? (
          <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-2xl animate-bounce">
            {icons[t.type]}
          </div>
        ) : (
          <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
            {icons[t.type]}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold ${t.type === 'celebration' ? 'text-lg' : ''}`}>{t.message}</p>
          {t.subMessage && (
            <p className="text-sm opacity-90 mt-0.5">{t.subMessage}</p>
          )}
        </div>
        <button 
          onClick={onClose}
          className="flex-shrink-0 text-white/70 hover:text-white transition"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
