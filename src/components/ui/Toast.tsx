import React from 'react';
import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UiStore {
  toasts: Toast[];
  addToast: (message: string, type?: 'success'|'error'|'info') => void;
  removeToast: (id: string) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    set(state => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })), 3000);
  },
  removeToast: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }))
}));

export const ToastContainer: React.FC = () => {
  const toasts = useUiStore(s => s.toasts);
  
  if (!toasts.length) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`px-4 py-3 rounded-lg shadow-lg border text-sm text-white max-w-sm animate-in slide-in-from-right-full ${t.type === 'error' ? 'bg-red-500 border-red-400' : t.type === 'success' ? 'bg-green-500 border-green-400' : 'bg-slate-800 border-slate-700'}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
};
