// Sound & Notification Service for iOS PWA and Modern Browsers

export interface ReminderSettings {
  enabled: boolean;
  morningReminder: boolean;
  morningTime: string; // "09:00"
  waterReminder: boolean;
  afternoonTime: string; // "14:00"
  eveningReminder: boolean;
  eveningTime: string; // "21:30"
  habitsReminder: boolean;
  financeReminder: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  lastSentSlot?: string; // "morning-2026-09-24"
}

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: false,
  morningReminder: true,
  morningTime: '09:00',
  waterReminder: true,
  afternoonTime: '14:00',
  eveningReminder: true,
  eveningTime: '21:30',
  habitsReminder: true,
  financeReminder: true,
  soundEnabled: true,
  vibrationEnabled: true,
};

const STORAGE_KEY = 'edu_reminder_settings';
const HISTORY_KEY = 'edu_notification_history';

export interface NotificationHistoryItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  category: 'system' | 'reminder' | 'health' | 'habits' | 'finance';
}

class NotificationService {
  private settings: ReminderSettings;
  private timerId: number | null = null;
  private audioCtx: AudioContext | null = null;

  constructor() {
    this.settings = this.loadSettings();
    if (typeof window !== 'undefined') {
      this.initBackgroundCheck();
    }
  }

  public getSettings(): ReminderSettings {
    return { ...this.settings };
  }

  public saveSettings(newSettings: Partial<ReminderSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    }
    return this.settings;
  }

  private loadSettings(): ReminderSettings {
    if (typeof window === 'undefined') return DEFAULT_REMINDER_SETTINGS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_REMINDER_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed to load reminder settings', e);
    }
    return DEFAULT_REMINDER_SETTINGS;
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.saveSettings({ enabled: true });
        this.playChime();
        this.vibrate();
      }
      return permission;
    } catch (e) {
      console.error('Error requesting notification permission:', e);
      return 'denied';
    }
  }

  /**
   * Synthesize a gentle pleasant chime using Web Audio API
   */
  public playChime() {
    if (!this.settings.soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioContextClass();
      }
      
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      // C6 and G6 chord tone
      osc1.frequency.setValueAtTime(1046.5, now); // C6
      osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.12); // E6
      
      osc2.frequency.setValueAtTime(1567.98, now + 0.08); // G6

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.2, now + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } catch (e) {
      // Audio autoplay policy might restrict without interaction
    }
  }

  /**
   * Tactile vibration for mobile devices (iOS / Android)
   */
  public vibrate(pattern: number[] = [120, 80, 160]) {
    if (!this.settings.vibrationEnabled) return;
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Ignore vibration errors
      }
    }
  }

  /**
   * Send notification via Service Worker (preferred for iOS/Android PWA) or Notification API fallback
   */
  public async sendNotification(title: string, options: { body: string; icon?: string; badge?: string; tag?: string; category?: NotificationHistoryItem['category'] }): Promise<boolean> {
    const { body, icon = '/pwa-192x192.png', badge = '/favicon.svg', tag = 'life-reminder', category = 'reminder' } = options;

    // Save to in-app history
    this.recordHistory({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      body,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      category
    });

    // Sound & Vibration
    this.playChime();
    this.vibrate();

    // Dispatch custom DOM event for active UI banners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('life:notification', {
          detail: { title, body, category }
        })
      );
    }

    if (!this.isSupported() || Notification.permission !== 'granted') {
      return false;
    }

    try {
      // 1. Try ServiceWorkerRegistration (Standard for iOS 16.4+ standalone PWA and Android)
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.showNotification) {
          await registration.showNotification(title, {
            body,
            icon,
            badge,
            tag,
            vibrate: [100, 50, 100],
            data: { url: '/' }
          });
          return true;
        }
      }

      // 2. Direct browser Notification fallback
      new Notification(title, {
        body,
        icon,
        badge,
        tag
      });
      return true;
    } catch (e) {
      console.warn('System notification display error:', e);
      return false;
    }
  }

  public getHistory(): NotificationHistoryItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private recordHistory(item: NotificationHistoryItem) {
    if (typeof window === 'undefined') return;
    try {
      const history = this.getHistory();
      const updated = [item, ...history].slice(0, 30);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to record notification history', e);
    }
  }

  public clearHistory() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(HISTORY_KEY);
    }
  }

  /**
   * Background schedule runner that checks time every 30 seconds
   */
  private initBackgroundCheck() {
    if (this.timerId) return;

    this.timerId = window.setInterval(() => {
      this.checkScheduledReminders();
    }, 30000);

    // Also check on visibility change (when user unlocks phone or opens app)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.checkScheduledReminders();
      }
    });
  }

  private checkScheduledReminders() {
    if (!this.settings.enabled) return;

    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;
    const todayDateStr = now.toISOString().slice(0, 10);

    // 1. Morning reminder
    if (this.settings.morningReminder && currentTimeStr === this.settings.morningTime) {
      const slotKey = `morning-${todayDateStr}`;
      if (this.settings.lastSentSlot !== slotKey) {
        this.saveSettings({ lastSentSlot: slotKey });
        this.sendNotification('🌅 Утренний фокус дня', {
          body: 'Время начать день продуктивно! Проверьте задачи, утренние привычки и примите витамины.',
          category: 'health'
        });
      }
    }

    // 2. Afternoon / Hydration reminder
    if (this.settings.waterReminder && currentTimeStr === this.settings.afternoonTime) {
      const slotKey = `afternoon-${todayDateStr}`;
      if (this.settings.lastSentSlot !== slotKey) {
        this.saveSettings({ lastSentSlot: slotKey });
        this.sendNotification('💧 Водный баланс & Перерыв', {
          body: 'Сделайте паузу: выпейте стакан воды, разомнитесь и отметьте дневной прогресс.',
          category: 'health'
        });
      }
    }

    // 3. Evening recap & habits reminder
    if (this.settings.eveningReminder && currentTimeStr === this.settings.eveningTime) {
      const slotKey = `evening-${todayDateStr}`;
      if (this.settings.lastSentSlot !== slotKey) {
        this.saveSettings({ lastSentSlot: slotKey });
        this.sendNotification('🌙 Вечерний чекпоинт', {
          body: 'Пора подвести итоги дня! Отметьте выполненные привычки и подготовьтесь ко сну.',
          category: 'habits'
        });
      }
    }
  }

  /**
   * Schedule delayed test push notification so user can lock screen / switch apps
   */
  public scheduleDelayedTest(seconds: number = 5, onCountdown?: (remaining: number) => void) {
    let remaining = seconds;
    if (onCountdown) onCountdown(remaining);

    const interval = window.setInterval(() => {
      remaining -= 1;
      if (onCountdown) onCountdown(remaining);

      if (remaining <= 0) {
        window.clearInterval(interval);
        this.sendNotification('🔔 Пора сделать это! (Тест)', {
          body: 'Уведомление успешно доставлено на ваш смартфон! Вы не пропустите важные привычки и задачи.',
          category: 'reminder'
        });
      }
    }, 1000);
  }
}

export const notificationService = new NotificationService();
