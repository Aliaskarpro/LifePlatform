import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Flame, 
  Plus, 
  Trash2, 
  Sparkles, 
  TrendingUp, 
  Award,
  Calendar,
  Check,
  Circle
} from 'lucide-react';
import { useLifeStore } from '../store/lifeStore';
import { HabitCategory } from '../types';

const CATEGORY_MAP: Record<HabitCategory, { label: string; color: string }> = {
  health: { label: 'Здоровье и гидратация', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40' },
  fitness: { label: 'Спорт и активность', color: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40' },
  mind: { label: 'Ментальное развитие', color: 'text-indigo-400 bg-indigo-950/40 border-indigo-800/40' },
  sleep: { label: 'Сон и восстановление', color: 'text-violet-400 bg-violet-950/40 border-violet-800/40' },
  productivity: { label: 'Продуктивность', color: 'text-amber-400 bg-amber-950/40 border-amber-800/40' },
  nutrition: { label: 'Питание и рацион', color: 'text-lime-400 bg-lime-950/40 border-lime-800/40' },
  other: { label: 'Другое', color: 'text-slate-400 bg-slate-800/40 border-slate-700/40' },
};

export const HabitsPage: React.FC = () => {
  const { habits, addHabit, toggleHabit, deleteHabit } = useLifeStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [habitTitle, setHabitTitle] = useState('');
  const [habitDescription, setHabitDescription] = useState('');
  const [habitCategory, setHabitCategory] = useState<HabitCategory>('health');
  const [targetDays, setTargetDays] = useState('7');

  // Generate last 7 days array
  const today = new Date();
  const pastDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('ru-RU', { weekday: 'short' });
    const dayNumber = d.getDate();
    return { dateStr, dayName, dayNumber, isToday: i === 6 };
  });

  // Calculate overall completion
  const totalChecksNeeded = habits.length * 7;
  const actualChecks = habits.reduce((acc, h) => {
    const checksThisWeek = pastDays.filter((d) => h.completedDates.includes(d.dateStr)).length;
    return acc + checksThisWeek;
  }, 0);
  const weeklyRate = totalChecksNeeded > 0 ? Math.round((actualChecks / totalChecksNeeded) * 100) : 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (habitTitle.trim()) {
      addHabit({
        title: habitTitle.trim(),
        description: habitDescription.trim() || undefined,
        category: habitCategory,
        targetDaysPerWeek: parseInt(targetDays) || 7,
      });
      setModalOpen(false);
      setHabitTitle('');
      setHabitDescription('');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">
            Привычки и саморазвитие
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Формирование регулярных полезных ритуалов и накопление непрерывных серий выполнения.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white rounded-xl transition-all flex items-center space-x-1.5 self-start sm:self-auto shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Plus size={15} />
          <span>Новая привычка</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/90 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all duration-300 group">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Активных привычек</span>
            <CheckCircle2 size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-3xl font-bold text-white tabular-nums font-display">{habits.length}</span>
            <span className="text-xs text-slate-400">в трекере</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Ежедневный фокус на ключевых действиях</p>
        </div>

        <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/90 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all duration-300 group">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Индекс дисциплины недели</span>
            <TrendingUp size={16} className="text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-3xl font-bold text-indigo-400 tabular-nums font-display">{weeklyRate}%</span>
            <span className="text-xs text-slate-400">выполнения</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {actualChecks} из {totalChecksNeeded} возможных отметок
          </p>
        </div>

        <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/90 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all duration-300 group">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Максимальная серия</span>
            <Flame size={16} className="text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-3xl font-bold text-amber-400 tabular-nums font-display">
              {Math.max(...habits.map((h) => h.bestStreak), 0)}
            </span>
            <span className="text-xs text-slate-400">дней подряд</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Лучший персональный рекорд</p>
        </div>
      </div>

      {/* Main Habits List with 7-Day Grid */}
      <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-white">Трекер привычек на 7 дней</h2>
            <p className="text-xs text-slate-400">
              Нажимайте на ячейки дней, чтобы мгновенно отмечать выполнение
            </p>
          </div>

          {/* Days header preview for mobile/desktop alignment */}
          <div className="hidden md:flex items-center space-x-3">
            {pastDays.map((d) => (
              <div
                key={d.dateStr}
                className={`w-9 text-center text-xs ${
                  d.isToday ? 'text-indigo-400 font-bold' : 'text-slate-400'
                }`}
              >
                <div className="uppercase text-[10px]">{d.dayName}</div>
                <div className="font-mono">{d.dayNumber}</div>
              </div>
            ))}
            <div className="w-16 text-right text-xs text-slate-500">Серия</div>
          </div>
        </div>

        {/* Habit Rows */}
        <div className="space-y-4">
          {habits.map((habit) => {
            const cat = CATEGORY_MAP[habit.category] || CATEGORY_MAP.health;
            return (
              <div
                key={habit.id}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                {/* Left info */}
                <div className="space-y-1 min-w-0 md:max-w-md">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${cat.color}`}>
                      {cat.label}
                    </span>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      title="Удалить привычку"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <h3 className="text-sm font-semibold text-white">{habit.title}</h3>
                  {habit.description && (
                    <p className="text-xs text-slate-400">{habit.description}</p>
                  )}
                </div>

                {/* Right: Days check-in grid */}
                <div className="flex items-center justify-between md:justify-end space-x-3">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    {pastDays.map((d) => {
                      const isDone = habit.completedDates.includes(d.dateStr);
                      return (
                        <button
                          key={d.dateStr}
                          onClick={() => toggleHabit(habit.id, d.dateStr)}
                          title={`${d.dayName}, ${d.dateStr}: ${isDone ? 'Выполнено' : 'Не выполнено'}`}
                          className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center transition-all ${
                            isDone
                              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                              : d.isToday
                              ? 'bg-slate-800 border-2 border-dashed border-indigo-500/70 text-slate-400 hover:border-indigo-400'
                              : 'bg-slate-800/60 border border-slate-700/60 text-slate-500 hover:bg-slate-700/80'
                          }`}
                        >
                          <span className="md:hidden text-[9px] uppercase leading-none opacity-60">
                            {d.dayName}
                          </span>
                          {isDone ? (
                            <Check size={16} />
                          ) : (
                            <span className="text-xs font-mono">{d.dayNumber}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Streak counter */}
                  <div className="w-16 text-right shrink-0">
                    <div className="flex items-center justify-end space-x-1 text-amber-400 font-mono text-xs font-bold">
                      <Flame size={14} className="fill-amber-400" />
                      <span>{habit.currentStreak} дн.</span>
                    </div>
                    <div className="text-[10px] text-slate-500">рекорд: {habit.bestStreak}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: New Habit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">Создать новую привычку</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Название привычки
                </label>
                <input
                  type="text"
                  placeholder="Выпивать 2 литра воды, 15 мин разминка, медитация..."
                  value={habitTitle}
                  onChange={(e) => setHabitTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Описание / подсказка
                </label>
                <input
                  type="text"
                  placeholder="Стакан воды сразу после пробуждения"
                  value={habitDescription}
                  onChange={(e) => setHabitDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Категория</label>
                  <select
                    value={habitCategory}
                    onChange={(e) => setHabitCategory(e.target.value as HabitCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="health">Здоровье и вода</option>
                    <option value="fitness">Спорт и активность</option>
                    <option value="mind">Ментальное развитие</option>
                    <option value="sleep">Сон и режим</option>
                    <option value="productivity">Продуктивность</option>
                    <option value="nutrition">Питание</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Дней в неделю
                  </label>
                  <select
                    value={targetDays}
                    onChange={(e) => setTargetDays(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="7">Каждый день (7)</option>
                    <option value="6">6 дней в неделю</option>
                    <option value="5">По будням (5)</option>
                    <option value="4">4 дня в неделю</option>
                    <option value="3">3 дня в неделю</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
                >
                  Создать привычку
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
