import React from 'react';
import { Smartphone, Share2, PlusSquare, CheckCircle2, X, Download, ShieldCheck, Bell } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNotifications?: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onOpenNotifications,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-100">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-0.5 shadow-md shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-indigo-400">
                <Smartphone size={20} />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">
                Установка на смартфон
              </h3>
              <p className="text-xs text-slate-400">
                iPhone (iOS) и Android как полноценное нативное приложение
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5 text-sm">
          {/* iOS Specific Instructions Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-800/40 to-slate-900 border border-indigo-500/20 space-y-3">
            <div className="flex items-center space-x-2 text-indigo-300 font-semibold">
              <span className="text-base"></span>
              <span>Инструкция для Apple iPhone / iPad (iOS Safari)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              В iOS Safari приложения устанавливаются без App Store за 3 простых шага:
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-xs">
                  1
                </div>
                <div className="text-xs">
                  <div className="font-medium text-white flex items-center gap-1.5">
                    Нажмите «Поделиться» <Share2 size={13} className="text-indigo-400 inline" />
                  </div>
                  <span className="text-slate-400">
                    Иконка квадрата со стрелкой вверх в нижней панели Safari.
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-xs">
                  2
                </div>
                <div className="text-xs">
                  <div className="font-medium text-white flex items-center gap-1.5">
                    Выберите «На экран "Домой"» <PlusSquare size={13} className="text-emerald-400 inline" />
                  </div>
                  <span className="text-slate-400">
                    Прокрутите всплывшее меню чуть ниже (Add to Home Screen).
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-xs">
                  3
                </div>
                <div className="text-xs">
                  <div className="font-medium text-white flex items-center gap-1.5">
                    Нажмите «Добавить» <CheckCircle2 size={13} className="text-indigo-400 inline" />
                  </div>
                  <span className="text-slate-400">
                    Приложение появится на главном экране iPhone без рамок браузера!
                  </span>
                </div>
              </div>
            </div>

            {/* Apple iOS Notification Note */}
            <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 flex items-start space-x-2.5">
              <Bell size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 font-semibold block">
                  Как работают уведомления на iOS (iOS 16.4+):
                </strong>
                По правилам Apple, пуш-уведомления на iPhone разрешены <em>только</em> после добавления иконки на рабочий стол («На экран "Домой"»).
              </div>
            </div>
          </div>

          {/* Android / Desktop Direct 1-Click Install */}
          {isInstallable && (
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-emerald-300">
                    Android / Chrome / Edge
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Доступна быстрая автоматическая установка в 1 клик
                  </p>
                </div>
                <button
                  onClick={handleInstallClick}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                >
                  <Download size={14} />
                  <span>Установить сейчас</span>
                </button>
              </div>
            </div>
          )}

          {isInstalled && (
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center space-x-2.5">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>
                Приложение уже запущено в автономном режиме на домашнем экране!
              </span>
            </div>
          )}

          {/* Benefits List */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Преимущества на смартфоне:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Быстрый запуск в 1 касание</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Полноэкранный режим без адресной строки</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Системные пуш-напоминания</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Работа в офлайн-режиме с кэшем</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          {onOpenNotifications && (
            <button
              onClick={() => {
                onClose();
                onOpenNotifications();
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1.5 transition-colors"
            >
              <Bell size={14} />
              <span>Настроить напоминания</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
