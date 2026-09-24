import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  CheckCircle2,
  AlertCircle,
  X,
  Volume2,
  Vibrate,
  Clock,
  Sparkles,
  Smartphone,
  Send,
  Trash2,
  Info
} from 'lucide-react';
import {
  notificationService,
  ReminderSettings,
  NotificationHistoryItem
} from '../../services/notificationService';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInstallModal?: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenInstallModal,
}) => {
  const [settings, setSettings] = useState<ReminderSettings>(notificationService.getSettings());
  const [permission, setPermission] = useState<NotificationPermission>(notificationService.getPermission());
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSettings(notificationService.getSettings());
      setPermission(notificationService.getPermission());
      setHistory(notificationService.getHistory());
      setStatusMessage(null);
      setCountdown(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const result = await notificationService.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      const updated = notificationService.saveSettings({ enabled: true });
      setSettings(updated);
      setStatusMessage('Разрешение успешно получено! Уведомления включены.');
      await notificationService.sendNotification('Уведомления успешно включены! 🎉', {
        body: 'Теперь вы будете вовремя получать напоминания о привычках, здоровье и целях.',
        category: 'system'
      });
      setHistory(notificationService.getHistory());
    } else if (result === 'denied') {
      setStatusMessage('Уведомления заблокированы. Разрешите их в Настройках браузера или iOS.');
    }
  };

  const handleToggle = (key: keyof ReminderSettings) => {
    const updated = notificationService.saveSettings({ [key]: !settings[key] });
    setSettings(updated);
  };

  const handleTimeChange = (key: 'morningTime' | 'afternoonTime' | 'eveningTime', value: string) => {
    const updated = notificationService.saveSettings({ [key]: value });
    setSettings(updated);
  };

  const handleTestNow = async () => {
    setStatusMessage('Отправляем мгновенное уведомление...');
    const ok = await notificationService.sendNotification('🔔 Пора сделать это! (Тест)', {
      body: 'Отличная работа! Это напоминание о привычках и фокусных задачах дня.',
      category: 'reminder'
    });
    setHistory(notificationService.getHistory());
    if (ok) {
      setStatusMessage('Уведомление отправлено!');
    } else {
      setStatusMessage('Уведомление показано в приложении. Для системных push-окон разрешите уведомления.');
    }
  };

  const handleTestDelayed = () => {
    setStatusMessage('Таймер запущен: 5 секунд! Сверните окно или заблокируйте телефон.');
    notificationService.scheduleDelayedTest(5, (rem) => {
      setCountdown(rem);
      if (rem <= 0) {
        setCountdown(null);
        setStatusMessage('Уведомление отправлено на смартфон!');
        setHistory(notificationService.getHistory());
      }
    });
  };

  const handleClearHistory = () => {
    notificationService.clearHistory();
    setHistory([]);
  };

  const getPermissionBadge = () => {
    if (permission === 'granted') {
      return (
        <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 size={13} />
          <span>Разрешено</span>
        </span>
      );
    }
    if (permission === 'denied') {
      return (
        <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
          <AlertCircle size={13} />
          <span>Заблокировано</span>
        </span>
      );
    }
    return (
      <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
        <AlertCircle size={13} />
        <span>Требуется разрешение</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-100">
        {/* Glow Accents */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-0.5 shadow-md shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-indigo-400">
                <BellRing size={20} />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">
                Уведомления и Напоминания
              </h3>
              <p className="text-xs text-slate-400">
                Автоматические подсказки «Пора это сделать» на смартфон
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

        {/* Tabs */}
        <div className="flex items-center space-x-2 pt-4 pb-2 border-b border-slate-800/60 text-xs">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Настройки и Время
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>Журнал напоминаний</span>
            {history.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-500 text-[10px] flex items-center justify-center text-white">
                {history.length}
              </span>
            )}
          </button>
        </div>

        {/* Status / Alert Bar */}
        {statusMessage && (
          <div className="mt-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles size={14} className="text-indigo-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
            {countdown !== null && (
              <span className="font-mono font-bold text-amber-300 text-sm px-2 py-0.5 rounded-md bg-amber-500/20">
                {countdown}с
              </span>
            )}
          </div>
        )}

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 text-sm">
          {activeTab === 'settings' ? (
            <>
              {/* Permission Banner */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-300">
                      Системные Push-уведомления:
                    </span>
                    {getPermissionBadge()}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Необходимы для показа баннеров на экране блокировки и в шторке телефона.
                  </p>
                </div>

                {permission !== 'granted' ? (
                  <button
                    onClick={handleRequestPermission}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/20 transition-all shrink-0 active:scale-95"
                  >
                    <Bell size={14} />
                    <span>Разрешить в браузере</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggle('enabled')}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all shrink-0 ${
                      settings.enabled
                        ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {settings.enabled ? 'Включено' : 'Выключено'}
                  </button>
                )}
              </div>

              {/* iOS Safari Tip */}
              <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex items-start space-x-3 text-xs text-indigo-200">
                <Smartphone size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p>
                    <strong>Для iPhone (iOS 16.4+):</strong> Чтобы системные уведомления приходили при закрытом приложении, сначала добавьте платформу на экран «Домой».
                  </p>
                  {onOpenInstallModal && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenInstallModal();
                      }}
                      className="text-emerald-400 hover:underline font-semibold flex items-center space-x-1 mt-1"
                    >
                      <span>Открыть инструкцию установки на iOS →</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Schedules Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Расписание ежедневных слотов
                </h4>

                {/* 1. Morning Slot */}
                <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🌅</span>
                    <div>
                      <div className="font-semibold text-white text-xs">
                        Утренний фокус дня
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Зарядка, прием витаминов, список задач
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <input
                      type="time"
                      value={settings.morningTime}
                      onChange={(e) => handleTimeChange('morningTime', e.target.value)}
                      className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="checkbox"
                      checked={settings.morningReminder}
                      onChange={() => handleToggle('morningReminder')}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* 2. Water / Afternoon Slot */}
                <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">💧</span>
                    <div>
                      <div className="font-semibold text-white text-xs">
                        Водный баланс и разминка
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Напоминание выпить воды и размять спину
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <input
                      type="time"
                      value={settings.afternoonTime}
                      onChange={(e) => handleTimeChange('afternoonTime', e.target.value)}
                      className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="checkbox"
                      checked={settings.waterReminder}
                      onChange={() => handleToggle('waterReminder')}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* 3. Evening Slot */}
                <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🌙</span>
                    <div>
                      <div className="font-semibold text-white text-xs">
                        Вечерний чекпоинт и итоги
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Отметка привычек, учет расходов, подготовка ко сну
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <input
                      type="time"
                      value={settings.eveningTime}
                      onChange={(e) => handleTimeChange('eveningTime', e.target.value)}
                      className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="checkbox"
                      checked={settings.eveningReminder}
                      onChange={() => handleToggle('eveningReminder')}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Sound & Vibration Options */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => {
                    handleToggle('soundEnabled');
                    notificationService.playChime();
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    settings.soundEnabled
                      ? 'bg-indigo-600/10 border-indigo-500/30 text-white'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Volume2 size={16} className={settings.soundEnabled ? 'text-indigo-400' : 'text-slate-500'} />
                    <span className="text-xs font-semibold">Звук джингла</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono">{settings.soundEnabled ? 'ВКЛ' : 'ВЫКЛ'}</span>
                </button>

                <button
                  onClick={() => {
                    handleToggle('vibrationEnabled');
                    notificationService.vibrate();
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    settings.vibrationEnabled
                      ? 'bg-emerald-600/10 border-emerald-500/30 text-white'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Vibrate size={16} className={settings.vibrationEnabled ? 'text-emerald-400' : 'text-slate-500'} />
                    <span className="text-xs font-semibold">Вибрация</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono">{settings.vibrationEnabled ? 'ВКЛ' : 'ВЫКЛ'}</span>
                </button>
              </div>

              {/* Interactive Test Panel */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-800/80 via-indigo-950/40 to-slate-800/80 border border-slate-700 space-y-3">
                <div className="flex items-center space-x-2">
                  <Send size={15} className="text-indigo-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Тестирование уведомления
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Проверьте, как уведомление будет всплывать на экране смартфона прямо сейчас или с задержкой (чтобы успеть свернуть приложение):
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <button
                    onClick={handleTestNow}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all active:scale-95 border border-slate-700"
                  >
                    <Bell size={13} className="text-indigo-400" />
                    <span>Проверить сейчас</span>
                  </button>

                  <button
                    onClick={handleTestDelayed}
                    disabled={countdown !== null}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Clock size={13} />
                    <span>{countdown !== null ? `Отсчет: ${countdown}с...` : 'Через 5 сек (свернуть)'}</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* History Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Отправленные напоминания
                </span>
                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1 transition-colors"
                  >
                    <Trash2 size={13} />
                    <span>Очистить</span>
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-800/30 border border-slate-800 text-slate-400 text-xs space-y-2">
                  <Info size={24} className="mx-auto text-slate-500" />
                  <p>Журнал пока пуст. Отправьте тестовое напоминание, чтобы проверить его доставку.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <Bell size={12} className="text-indigo-400" />
                          <span>{item.title}</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">{item.body}</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {item.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Фоновый планировщик активен</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition-colors"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
