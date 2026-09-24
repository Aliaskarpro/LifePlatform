import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  HeartPulse, 
  FileHeart, 
  Moon, 
  Dumbbell, 
  CheckCircle2, 
  Target, 
  BarChart3, 
  FileText, 
  User as UserIcon,
  Sun,
  Menu,
  X,
  LogOut,
  Sparkles,
  Wallet,
  Smartphone,
  Bell,
  BellRing
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useLifeStore } from '../store/lifeStore';
import { useAuthStore } from '../store/authStore';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { notificationService } from '../services/notificationService';
import { PWAInstallModal } from '../components/pwa/PWAInstallModal';
import { NotificationSettingsModal } from '../components/notifications/NotificationSettingsModal';
import { InAppNotificationToast } from '../components/notifications/InAppNotificationToast';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Главная', badge: null },
  { path: '/calendar', icon: CalendarIcon, label: 'Календарь', badge: null },
  { path: '/health', icon: HeartPulse, label: 'Здоровье и ИМТ', badge: null },
  { path: '/medical-card', icon: FileHeart, label: 'Медкарта', badge: null },
  { path: '/sleep', icon: Moon, label: 'Сон и отдых', badge: null },
  { path: '/workouts', icon: Dumbbell, label: 'Активность', badge: null },
  { path: '/habits', icon: CheckCircle2, label: 'Привычки', badge: null },
  { path: '/goals', icon: Target, label: 'Личные цели', badge: null },
  { path: '/finance', icon: Wallet, label: 'Финансы', badge: null },
  { path: '/statistics', icon: BarChart3, label: 'Аналитика', badge: null },
  { path: '/notes', icon: FileText, label: 'Заметки', badge: null },
  { path: '/account', icon: UserIcon, label: 'Профиль', badge: null },
];

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const { theme, toggleTheme, anthropometry } = useLifeStore();
  const { user, logout } = useAuthStore();
  const { isInstalled, isIOS } = usePWAInstall();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const item = navItems.find((n) => location.pathname.startsWith(n.path));
    return item ? item.label : 'LifePlatform';
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md shrink-0 transition-colors duration-200">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-lg">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-600 via-indigo-600 to-slate-900 dark:from-emerald-400 dark:via-indigo-300 dark:to-white bg-clip-text text-transparent">
                LifePlatform
              </span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                Personal Dashboard
              </span>
            </div>
          </Link>
        </div>

        {/* Quick Health Status Indicator */}
        <div className="mx-3 mt-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span>ИМТ / Текущий вес</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{anthropometry.currentWeightKg} кг</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Рост: {anthropometry.heightCm} см</span>
            <span className="text-slate-400 dark:text-slate-500">·</span>
            <span className="text-slate-700 dark:text-slate-300">Цель: {anthropometry.targetWeightKg} кг</span>
          </div>
        </div>

        {/* Shortcuts for Notifications & Smartphone */}
        <div className="mx-3 mt-2 space-y-1.5">
          <button
            onClick={() => setNotificationModalOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-all border border-slate-200/80 dark:border-slate-800 text-left"
          >
            <span className="flex items-center space-x-2">
              <BellRing size={15} className="text-indigo-500 shrink-0" />
              <span className="truncate">Напоминания</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/10 text-indigo-400 shrink-0">
              PUSH
            </span>
          </button>

          {!isInstalled && (
            <button
              onClick={() => setInstallModalOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition-all border border-emerald-500/30 text-left"
            >
              <span className="flex items-center space-x-2">
                <Smartphone size={15} className="shrink-0" />
                <span className="truncate">На iPhone / Android</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 shrink-0">
                PWA
              </span>
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
                )}
              >
                <Icon
                  size={18}
                  className={cn(
                    'transition-transform group-hover:scale-110',
                    isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            <span className="flex items-center space-x-2">
              {theme === 'dark' ? <Moon size={15} className="text-indigo-400" /> : <Sun size={15} className="text-amber-500" />}
              <span>{theme === 'dark' ? 'Тёмная тема' : 'Светлая тема'}</span>
            </span>
            <span className="text-[10px] text-slate-500 uppercase font-mono">{theme}</span>
          </button>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-800/60">
            <Link to="/account" className="flex items-center space-x-2.5 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-200">
                {user?.firstName ? user.firstName[0] : 'U'}
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Пользователь'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email || 'Профиль'}</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              title="Выйти"
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between shrink-0 transition-colors duration-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Открыть меню"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{getPageTitle()}</h1>
              <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
                Персональная платформа саморазвития и здоровья
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Install on Mobile Header Button */}
            {!isInstalled && (
              <button
                onClick={() => setInstallModalOpen(true)}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition-all"
                title="Установить на iPhone / Android"
              >
                <Smartphone size={14} />
                <span>На смартфон</span>
              </button>
            )}

            {/* Notification Bell */}
            <button
              onClick={() => setNotificationModalOpen(true)}
              className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Напоминания и уведомления"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Переключить тему"
            >
              {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
            </button>

            <Link
              to="/calendar"
              className="hidden sm:flex items-center space-x-2 text-xs font-medium bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/60 transition-colors"
            >
              <CalendarIcon size={14} className="text-indigo-600 dark:text-indigo-400" />
              <span>{new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
            </Link>

            <Link
              to="/account"
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white font-semibold text-xs flex items-center justify-center shadow-sm"
            >
              {user?.firstName ? user.firstName[0] : 'U'}
            </Link>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 bg-slate-50 dark:bg-slate-950 relative transition-colors duration-200">
          {/* Subtle Ambient Glow Orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-aurora" />
          <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-500/8 rounded-full blur-[130px] pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* iOS & Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-lg transition-colors pb-[env(safe-area-inset-bottom,8px)]">
        <Link
          to="/dashboard"
          className={cn(
            'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors',
            location.pathname === '/dashboard'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          )}
        >
          <LayoutDashboard size={20} className="mb-0.5" />
          <span>Главная</span>
        </Link>

        <Link
          to="/health"
          className={cn(
            'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors',
            location.pathname === '/health'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          )}
        >
          <HeartPulse size={20} className="mb-0.5" />
          <span>Здоровье</span>
        </Link>

        <Link
          to="/habits"
          className={cn(
            'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors',
            location.pathname === '/habits'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          )}
        >
          <CheckCircle2 size={20} className="mb-0.5" />
          <span>Привычки</span>
        </Link>

        <Link
          to="/finance"
          className={cn(
            'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors',
            location.pathname === '/finance'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          )}
        >
          <Wallet size={20} className="mb-0.5" />
          <span>Финансы</span>
        </Link>

        <button
          onClick={() => setNotificationModalOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          <BellRing size={20} className="mb-0.5 text-indigo-500" />
          <span>Пуш</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          <Menu size={20} className="mb-0.5" />
          <span>Еще</span>
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full flex flex-col p-4 z-10 transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">LifePlatform</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Drawer Action Buttons */}
            <div className="py-3 border-b border-slate-200 dark:border-slate-800 space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setNotificationModalOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-200 dark:border-indigo-800"
              >
                <span className="flex items-center space-x-2">
                  <BellRing size={16} />
                  <span>Напоминания (Push)</span>
                </span>
                <span className="text-[10px]">Открыть</span>
              </button>

              {!isInstalled && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setInstallModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-800"
                >
                  <span className="flex items-center space-x-2">
                    <Smartphone size={16} />
                    <span>Установить на iPhone / Android</span>
                  </span>
                  <span className="text-[10px]">Инструкция</span>
                </button>
              )}
            </div>

            <nav className="flex-1 space-y-1 py-3 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-300'
                    )}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                <span>Тема: {theme === 'dark' ? 'Тёмная' : 'Светлая'}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-xs text-rose-500 hover:text-rose-600"
              >
                <LogOut size={16} />
                <span>Выход</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals & In-App Alerts */}
      <InAppNotificationToast />
      <PWAInstallModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
        onOpenNotifications={() => setNotificationModalOpen(true)}
      />
      <NotificationSettingsModal
        isOpen={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
        onOpenInstallModal={() => setInstallModalOpen(true)}
      />
    </div>
  );
};
