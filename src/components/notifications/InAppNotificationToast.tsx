import React, { useState, useEffect } from 'react';
import { BellRing, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InAppAlert {
  id: string;
  title: string;
  body: string;
  category: 'system' | 'reminder' | 'health' | 'habits' | 'finance';
}

export const InAppNotificationToast: React.FC = () => {
  const [currentAlert, setCurrentAlert] = useState<InAppAlert | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleNotification = (e: Event) => {
      const customEvent = e as CustomEvent<{ title: string; body: string; category?: InAppAlert['category'] }>;
      if (customEvent.detail) {
        const alert: InAppAlert = {
          id: String(Date.now()),
          title: customEvent.detail.title,
          body: customEvent.detail.body,
          category: customEvent.detail.category || 'reminder'
        };
        setCurrentAlert(alert);

        // Auto dismiss after 7 seconds
        const timer = setTimeout(() => {
          setCurrentAlert((prev) => (prev?.id === alert.id ? null : prev));
        }, 7000);

        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('life:notification', handleNotification);
    return () => window.removeEventListener('life:notification', handleNotification);
  }, []);

  if (!currentAlert) return null;

  const handleActionClick = () => {
    if (currentAlert.category === 'habits') {
      navigate('/habits');
    } else if (currentAlert.category === 'finance') {
      navigate('/finance');
    } else if (currentAlert.category === 'health') {
      navigate('/health');
    } else {
      navigate('/dashboard');
    }
    setCurrentAlert(null);
  };

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-in slide-in-from-top duration-300 pointer-events-auto">
      <div className="bg-slate-900/95 border border-indigo-500/40 text-white rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex items-start space-x-3 relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />

        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-0.5 shrink-0 shadow-lg shadow-indigo-500/30">
          <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-indigo-400">
            <BellRing size={18} className="animate-bounce" />
          </div>
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center space-x-2">
            <h4 className="text-xs font-bold text-white truncate">
              {currentAlert.title}
            </h4>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-indigo-500/20 text-indigo-300">
              сейчас
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug line-clamp-2">
            {currentAlert.body}
          </p>

          <button
            onClick={handleActionClick}
            className="mt-2 text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
          >
            <span>Открыть раздел</span>
            <ChevronRight size={12} />
          </button>
        </div>

        <button
          onClick={() => setCurrentAlert(null)}
          className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};
