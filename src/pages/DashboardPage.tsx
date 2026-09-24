import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Scale, 
  Moon, 
  Dumbbell, 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  Target, 
  Activity, 
  ArrowUpRight, 
  Plus, 
  TrendingDown, 
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight,
  Wallet
} from 'lucide-react';
import { useLifeStore, calculateBmi } from '../store/lifeStore';
import { useAuthStore } from '../store/authStore';
import { TaskSection } from '../components/dashboard/TaskSection';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    anthropometry, 
    weightHistory, 
    vitalsHistory, 
    sleepHistory, 
    workoutsHistory, 
    habits, 
    goals, 
    calendarEvents,
    finance,
    toggleHabit,
    addWeightRecord,
    addVitalRecord
  } = useLifeStore();

  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [newWeight, setNewWeight] = useState(anthropometry.currentWeightKg.toString());

  const [vitalModalOpen, setVitalModalOpen] = useState(false);
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [pulse, setPulse] = useState('70');
  const [temperature, setTemperature] = useState('36.6');

  // Date formatted
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const dateFormatted = today.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  // Capitalize first letter of weekday
  const capitalizedDate = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

  // BMI calculation
  const bmiInfo = calculateBmi(anthropometry.currentWeightKg, anthropometry.heightCm);

  // Weight progress to target
  const initialWeight = weightHistory.length > 0 ? weightHistory[0].weightKg : anthropometry.currentWeightKg;
  const weightDiff = anthropometry.currentWeightKg - anthropometry.targetWeightKg;
  const totalToLose = initialWeight - anthropometry.targetWeightKg;
  const lostSoFar = initialWeight - anthropometry.currentWeightKg;
  const weightProgressPct = totalToLose > 0 
    ? Math.min(100, Math.max(0, Math.round((lostSoFar / totalToLose) * 100)))
    : 100;

  // Latest Vitals
  const latestVital = vitalsHistory.length > 0 ? vitalsHistory[0] : null;

  // Latest Sleep
  const latestSleep = sleepHistory.length > 0 ? sleepHistory[sleepHistory.length - 1] : null;

  // Recent Workouts (this week)
  const totalWorkoutsWeek = workoutsHistory.length;
  const totalMinutesWeek = workoutsHistory.reduce((acc, w) => acc + w.durationMinutes, 0);

  // Habits completed today
  const habitsDoneToday = habits.filter(h => h.completedDates.includes(todayStr)).length;
  const totalHabits = habits.length;
  const habitCompletionRate = totalHabits > 0 ? Math.round((habitsDoneToday / totalHabits) * 100) : 0;

  // Today's events & upcoming events
  const todayEvents = calendarEvents.filter(e => e.startTime.startsWith(todayStr));
  const upcomingEvents = calendarEvents
    .filter(e => new Date(e.startTime) >= new Date())
    .slice(0, 4);

  // Active Goals
  const activeGoals = goals.filter(g => g.status === 'in_progress').slice(0, 3);

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newWeight);
    if (!isNaN(w) && w > 30 && w < 300) {
      addWeightRecord({ weightKg: w });
      setWeightModalOpen(false);
    }
  };

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);
    const pul = parseInt(pulse);
    const temp = parseFloat(temperature);
    const nowTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    addVitalRecord({
      date: todayStr,
      time: nowTime,
      systolicBp: !isNaN(sys) ? sys : undefined,
      diastolicBp: !isNaN(dia) ? dia : undefined,
      pulseBpm: !isNaN(pul) ? pul : undefined,
      temperatureC: !isNaN(temp) ? temp : undefined,
    });
    setVitalModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* 1. Greeting & Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/70 to-slate-900/90 border border-slate-800/80 backdrop-blur-xl p-6 lg:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles size={14} className="animate-pulse" />
              <span>{capitalizedDate}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">
              Добрый день, {user?.firstName || 'Алекс'}! 👋
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Ваш персональный центр здоровья и продуктивности. Все ключевые показатели в норме. Сегодня запланировано {todayEvents.length} событий.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setWeightModalOpen(true)}
              className="px-3.5 py-2 text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl border border-slate-700/80 flex items-center space-x-1.5 transition-all shadow-sm hover:-translate-y-0.5"
            >
              <Scale size={14} className="text-emerald-400" />
              <span>Записать вес</span>
            </button>
            <button
              onClick={() => setVitalModalOpen(true)}
              className="px-3.5 py-2 text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl border border-slate-700/80 flex items-center space-x-1.5 transition-all shadow-sm hover:-translate-y-0.5"
            >
              <Heart size={14} className="text-rose-400" />
              <span>Замер давления</span>
            </button>
            <Link
              to="/calendar"
              className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white rounded-xl flex items-center space-x-1.5 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              <Plus size={14} />
              <span>Событие</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid (Anthropometry, Vitals, Sleep, Workouts) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Weight & BMI */}
        <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/90 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Вес и ИМТ</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Scale size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white tabular-nums font-display">{anthropometry.currentWeightKg}</span>
            <span className="text-xs text-slate-400">кг</span>
            <span className="text-slate-600">·</span>
            <span className="text-sm font-semibold text-emerald-400 tabular-nums">{bmiInfo.bmi}</span>
            <span className="text-xs text-slate-400">ИМТ</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>{bmiInfo.category}</span>
            <span className="text-slate-500 font-mono">Рост {anthropometry.heightCm} см</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500">До цели:</span>
            <span className="text-slate-300 font-medium">
              {weightDiff > 0 ? `-${weightDiff.toFixed(1)} кг` : 'Цель достигнута!'}
            </span>
          </div>
        </div>

        {/* Metric 2: Blood Pressure & Heart Rate */}
        <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/90 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Давление и пульс</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white tabular-nums font-display">
              {latestVital?.systolicBp || 118}/{latestVital?.diastolicBp || 78}
            </span>
            <span className="text-xs text-slate-400">мм рт. ст.</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Пульс в покое</span>
            <span className="text-emerald-400 font-semibold tabular-nums">{latestVital?.pulseBpm || 68} уд/мин</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500">Температура:</span>
            <span className="text-slate-300 font-medium">{latestVital?.temperatureC || 36.6} °C</span>
          </div>
        </div>

        {/* Metric 3: Sleep & Recovery */}
        <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/90 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Сон прошлой ночью</span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Moon size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white tabular-nums font-display">
              {latestSleep ? latestSleep.durationHours : 8.0}
            </span>
            <span className="text-xs text-slate-400">часов</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-emerald-400 font-medium">
              {latestSleep ? `${latestSleep.quality * 20}%` : '100%'} кач.
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Отбой / Подъем</span>
            <span className="text-slate-300 font-mono">
              {latestSleep?.bedTime || '23:15'} — {latestSleep?.wakeTime || '07:15'}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500">Глубокий сон:</span>
            <span className="text-violet-400 font-medium">{latestSleep?.deepSleepMinutes || 120} мин</span>
          </div>
        </div>

        {/* Metric 4: Workouts & Activity */}
        <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/90 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Активность недели</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Dumbbell size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white tabular-nums font-display">{totalWorkoutsWeek}</span>
            <span className="text-xs text-slate-400">тренировки</span>
            <span className="text-slate-600">·</span>
            <span className="text-sm font-semibold text-amber-400 tabular-nums">{totalMinutesWeek}</span>
            <span className="text-xs text-slate-400">мин</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Шаги сегодня</span>
            <span className="text-cyan-400 font-medium">8 450 / 10 000</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500">План выполнен:</span>
            <span className="text-emerald-400 font-medium">
              {Math.round((totalWorkoutsWeek / 4) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* 3. Daily Focus & Tasks with Tagging System (Health, Work, Personal, etc.) */}
      <TaskSection />

      {/* 4. Middle Section: Today's Plan & Habit Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Habits Today (2 columns on lg) */}
        <div className="lg:col-span-2 relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white font-display">Привычки на сегодня</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Выполнено {habitsDoneToday} из {totalHabits} ({habitCompletionRate}%)
              </p>
            </div>
            <Link
              to="/habits"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 transition-colors font-medium"
            >
              <span>Все привычки</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Progress Bar with animated Shimmer */}
          <div className="relative w-full bg-slate-950/80 rounded-full h-2.5 mb-4 overflow-hidden border border-slate-800">
            <div
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 relative overflow-hidden"
              style={{ width: `${habitCompletionRate}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>

          {/* Habits list */}
          <div className="space-y-2.5">
            {habits.slice(0, 5).map((habit) => {
              const isDone = habit.completedDates.includes(todayStr);
              return (
                <div
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id, todayStr)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-900/50 text-slate-200'
                      : 'bg-slate-850/60 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <button
                      type="button"
                      className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-600 bg-slate-800 text-transparent hover:border-slate-500'
                      }`}
                    >
                      <CheckCircle2 size={16} />
                    </button>
                    <div className="truncate">
                      <p className={`text-sm font-medium truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                        {habit.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        Серия: {habit.currentStreak} дн. · Лучшая: {habit.bestStreak} дн.
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded font-mono shrink-0 ${isDone ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {isDone ? 'Выполнено' : 'Нажать для отметки'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Schedule & Upcoming Events */}
        <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white font-display">План на сегодня</h2>
              <Link
                to="/calendar"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 transition-colors font-medium"
              >
                <span>Календарь</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {todayEvents.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                <CalendarIcon size={32} className="mx-auto mb-2 opacity-40 animate-float" />
                <p>На сегодня событий не запланировано</p>
                <Link
                  to="/calendar"
                  className="mt-3 inline-block text-xs text-indigo-400 hover:underline"
                >
                  + Запланировать событие
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {todayEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{evt.title}</span>
                      <span className="text-indigo-400 font-mono">
                        {evt.startTime.split('T')[1]?.slice(0, 5) || 'Весь день'}
                      </span>
                    </div>
                    {evt.description && (
                      <p className="text-xs text-slate-400">{evt.description}</p>
                    )}
                    {evt.location && (
                      <p className="text-[11px] text-slate-500">{evt.location}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick summary footer */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Предстоящих событий:</span>
            <span className="font-medium text-slate-200 font-mono">{upcomingEvents.length} в календаре</span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Personal Goals Progress & Quick Links */}
      <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white font-display">Личные цели и ключевые этапы</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Отслеживайте прогресс по ключевым направлениям жизни
            </p>
          </div>
          <Link
            to="/goals"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 font-medium transition-colors"
          >
            <span>Все цели ({goals.length})</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeGoals.map((goal) => (
            <div
              key={goal.id}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all hover:-translate-y-0.5 flex flex-col justify-between space-y-3 group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="capitalize font-semibold text-indigo-400">{goal.category}</span>
                  <span className="text-emerald-400 font-semibold font-mono">{goal.progressPercent}%</span>
                </div>
                <h3 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-indigo-200 transition-colors font-display">
                  {goal.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{goal.description}</p>
              </div>

              <div>
                <div className="relative w-full bg-slate-900 rounded-full h-2 mb-2 overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-indigo-500 to-emerald-400 relative overflow-hidden"
                    style={{ width: `${goal.progressPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>
                    Этапы: {goal.milestones.filter(m => m.isCompleted).length} / {goal.milestones.length}
                  </span>
                  <span>Дедлайн: {new Date(goal.targetDate).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Finance & Capital Teaser Widget */}
      {finance && (
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900/90 via-indigo-950/60 to-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-400 p-0.5 shrink-0 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-emerald-400">
                <Wallet size={24} />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white font-display">
                  Финансы и Капитал
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Баланс в норме
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Общий баланс счетов: <strong className="text-white font-mono">{new Intl.NumberFormat('ru-RU').format(Math.round(finance.accounts?.reduce((s, a) => s + a.balance, 0) || 0))} {finance.currency === 'KZT' ? '₸' : finance.currency === 'RUB' ? '₽' : finance.currency === 'USD' ? '$' : '€'}</strong> · Копилок: {finance.savingsGoals?.length || 0}
              </p>
            </div>
          </div>

          <Link
            to="/finance"
            className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20 active:scale-95 shrink-0 self-start md:self-auto"
          >
            <span>Открыть Финансы</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {/* Modal: Record Weight */}
      {weightModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">Внести текущий вес</h3>
            <form onSubmit={handleSaveWeight} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Вес (в килограммах)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-lg focus:outline-none focus:border-indigo-500"
                  autoFocus
                  required
                />
              </div>
              <p className="text-xs text-slate-500">
                ИМТ рассчитается автоматически с учетом текущего роста ({anthropometry.heightCm} см).
              </p>
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWeightModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Vitals */}
      {vitalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">Замер показателей здоровья</h3>
            <form onSubmit={handleSaveVitals} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Систолическое (верхнее)
                  </label>
                  <input
                    type="number"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    placeholder="120"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Диастолическое (нижнее)
                  </label>
                  <input
                    type="number"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    placeholder="80"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Пульс (уд/мин)
                  </label>
                  <input
                    type="number"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    placeholder="70"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Температура (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    placeholder="36.6"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVitalModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors"
                >
                  Сохранить замер
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
