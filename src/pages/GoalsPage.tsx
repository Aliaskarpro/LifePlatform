import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Flame,
  ArrowUpRight,
  TrendingUp,
  X,
  Check,
  Award
} from 'lucide-react';
import { useLifeStore } from '../store/lifeStore';
import { GoalCategory, GoalStatus } from '../types';
import { GoalsProgressChart } from '../components/goals/GoalsProgressChart';

const CATEGORY_NAMES: Record<GoalCategory, { label: string; color: string; hex: string }> = {
  health: { label: 'Здоровье', color: 'text-emerald-400', hex: '#10b981' },
  fitness: { label: 'Спорт и тело', color: 'text-cyan-400', hex: '#06b6d4' },
  career: { label: 'Карьера и дело', color: 'text-blue-400', hex: '#3b82f6' },
  education: { label: 'Обучение', color: 'text-indigo-400', hex: '#8b5cf6' },
  finance: { label: 'Финансы', color: 'text-amber-400', hex: '#f59e0b' },
  personal: { label: 'Личное развитие', color: 'text-violet-400', hex: '#a855f7' },
};

export const GoalsPage: React.FC = () => {
  const { goals, addGoal, toggleMilestone, deleteGoal, updateGoal } = useLifeStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [inlineMilestoneInput, setInlineMilestoneInput] = useState<{ [goalId: string]: string }>({});

  // Form states for creating a new goal
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('health');
  const [targetDate, setTargetDate] = useState(
    new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [milestonesText, setMilestonesText] = useState(
    'Пройти обследование\nСкорректировать план питания\nДостичь стабильного показателя'
  );

  const filteredGoals = filterCategory === 'all'
    ? goals
    : goals.filter((g) => g.category === filterCategory);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      const milestonesList = milestonesText
        .split('\n')
        .map((m) => m.trim())
        .filter(Boolean)
        .map((text, idx) => ({
          id: `m-${Date.now()}-${idx}`,
          title: text,
          isCompleted: false,
        }));

      addGoal({
        title: title.trim(),
        description: description.trim(),
        category,
        targetDate,
        startDate: new Date().toISOString().split('T')[0],
        status: 'in_progress',
        milestones: milestonesList,
      });

      // Reset
      setTitle('');
      setDescription('');
      setCategory('health');
      setTargetDate(
        new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0]
      );
      setMilestonesText('Пройти обследование\nСкорректировать план питания\nДостичь стабильного показателя');
      setModalOpen(false);
    }
  };

  const handleAddInlineMilestone = (goalId: string) => {
    const text = (inlineMilestoneInput[goalId] || '').trim();
    if (!text) return;

    const targetGoal = goals.find((g) => g.id === goalId);
    if (!targetGoal) return;

    const newMilestone = {
      id: `m-${Date.now()}-${targetGoal.milestones.length}`,
      title: text,
      isCompleted: false,
    };

    const updatedMilestones = [...targetGoal.milestones, newMilestone];
    const completedCount = updatedMilestones.filter((m) => m.isCompleted).length;
    const progress = Math.round((completedCount / updatedMilestones.length) * 100);

    updateGoal(goalId, {
      milestones: updatedMilestones,
      progressPercent: progress,
    });

    setInlineMilestoneInput({ ...inlineMilestoneInput, [goalId]: '' });
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Dynamic 2026 Header with glowing accents */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950/80 backdrop-blur-xl p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2 text-xs text-indigo-400 font-semibold tracking-wide">
              <Sparkles size={14} className="animate-pulse" />
              <span>СТРАТЕГИЧЕСКИЙ ТРЕКЕР 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              Личные цели и ключевые этапы
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Динамический контроль стратегических ориентиров в здоровье, спорте, карьере и ментальном балансе. Разделяйте глобальные цели на проверяемые микро-этапы.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="group relative inline-flex items-center justify-center p-0.5 overflow-hidden rounded-xl font-medium text-xs shadow-lg shadow-indigo-600/20 active:scale-95 transition-all self-start md:self-auto"
          >
            <span className="w-full h-full bg-gradient-to-br from-indigo-500 via-sky-400 to-emerald-400 group-hover:from-indigo-600 group-hover:to-emerald-500 absolute" />
            <span className="relative px-4 py-2.5 transition-all ease-out bg-slate-950 rounded-[10px] group-hover:bg-opacity-0 text-white flex items-center space-x-2">
              <Plus size={16} className="text-emerald-400 group-hover:text-white transition-colors" />
              <span className="font-semibold">Поставить новую цель</span>
            </span>
          </button>
        </div>
      </div>

      {/* Visual Progress Chart over Time using Recharts */}
      <GoalsProgressChart goals={goals} selectedCategory={filterCategory} />

      {/* Filter Tabs (Functional segmented filter controls) */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all duration-200 ${
            filterCategory === 'all'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          Все направления ({goals.length})
        </button>
        {Object.entries(CATEGORY_NAMES).map(([key, info]) => {
          const count = goals.filter((g) => g.category === key).length;
          const isActive = filterCategory === key;
          return (
            <button
              key={key}
              onClick={() => setFilterCategory(key)}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: info.hex }}
              />
              <span>{info.label}</span>
              <span className="text-[11px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredGoals.map((goal) => {
          const cat = CATEGORY_NAMES[goal.category] || CATEGORY_NAMES.personal;
          const completedMilestones = goal.milestones.filter((m) => m.isCompleted).length;
          const totalMilestones = goal.milestones.length;
          const isComplete = goal.progressPercent === 100;

          return (
            <div
              key={goal.id}
              className={`relative overflow-hidden rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-between space-y-5 backdrop-blur-xl group hover:-translate-y-1 ${
                isComplete
                  ? 'border-emerald-500/40 bg-slate-900/80 shadow-[0_12px_40px_rgba(16,185,129,0.15)]'
                  : 'border-slate-800/90 bg-slate-900/60 shadow-[0_8px_32px_rgba(0,0,0,0.36)] hover:border-slate-700/90 hover:shadow-[0_12px_40px_rgba(0,0,0,0.45)]'
              }`}
            >
              {/* Dynamic Aura Glow in corner */}
              <div
                className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none group-hover:opacity-35 transition-opacity"
                style={{ backgroundColor: cat.hex }}
              />

              <div className="relative z-10 space-y-4">
                {/* Header of card: Unboxed typography metadata */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className={`font-semibold ${cat.color}`}>
                      {cat.label}
                    </span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                      <Clock size={12} className="text-slate-500" />
                      Дедлайн: {new Date(goal.targetDate).toLocaleDateString('ru-RU')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {isComplete && (
                      <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-800/40 mr-1">
                        <Award size={13} /> Достигнуто
                      </span>
                    )}
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-all active:scale-90"
                      title="Удалить цель"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-lg font-bold text-white font-display tracking-tight group-hover:text-indigo-200 transition-colors">
                    {goal.title}
                  </h3>
                  {goal.description && (
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {goal.description}
                    </p>
                  )}
                </div>

                {/* Dynamic Progress Bar with animated Shimmer */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span>Прогресс готовности</span>
                      {goal.progressPercent >= 50 && (
                        <Flame size={13} className="text-amber-400 animate-pulse" />
                      )}
                    </span>
                    <span className="font-bold text-white tabular-nums font-mono text-sm">
                      {goal.progressPercent}%
                    </span>
                  </div>

                  <div className="relative w-full bg-slate-950/80 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                      style={{
                        width: `${goal.progressPercent}%`,
                        background: `linear-gradient(90deg, #6366f1 0%, ${cat.hex} 100%)`,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    </div>
                  </div>
                </div>

                {/* Milestones checklist with Spring Interaction */}
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-medium">
                      Ключевые этапы ({completedMilestones} из {totalMilestones}):
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0}% завершено
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {goal.milestones.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => toggleMilestone(goal.id, m.id)}
                        className={`flex items-center space-x-2.5 p-2.5 rounded-xl text-xs cursor-pointer border transition-all duration-200 active:scale-[0.98] ${
                          m.isCompleted
                            ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-300'
                            : 'bg-slate-950/50 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all duration-200 shrink-0 ${
                            m.isCompleted
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                              : 'border-slate-700 bg-slate-900 text-transparent hover:border-indigo-400'
                          }`}
                        >
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span
                          className={`flex-1 transition-colors ${
                            m.isCompleted ? 'line-through text-slate-500 font-normal' : 'text-slate-200 font-medium'
                          }`}
                        >
                          {m.title}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Inline Quick Add Milestone */}
                  <div className="pt-1 flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Добавить контрольный подэтап..."
                      value={inlineMilestoneInput[goal.id] || ''}
                      onChange={(e) =>
                        setInlineMilestoneInput({
                          ...inlineMilestoneInput,
                          [goal.id]: e.target.value,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddInlineMilestone(goal.id);
                        }
                      }}
                      className="flex-1 bg-slate-950/60 border border-slate-800/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddInlineMilestone(goal.id)}
                      className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors border border-slate-700/80 shrink-0 active:scale-95"
                    >
                      + Добавить
                    </button>
                  </div>
                </div>
              </div>

              {/* Status footer with unboxed metadata */}
              <div className="relative z-10 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isComplete ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'
                    }`}
                  />
                  <span className={isComplete ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                    {isComplete ? 'Цель успешно закрыта' : 'Активный спринт'}
                  </span>
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  Старт: {new Date(goal.startDate || goal.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New Goal (2026 Neo-Glass Experience) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in-up">
          <div className="relative overflow-hidden bg-slate-900/95 border border-slate-800/90 rounded-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl animate-scale-in">
            {/* Ambient Modal Glow */}
            <div className="absolute -top-16 -right-16 w-52 h-52 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Target size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    Поставить новую цель
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Сформулируйте ключевой ориентир и контрольные точки
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Формулировка цели
                </label>
                <input
                  type="text"
                  placeholder="Достичь веса 70 кг, пробежать полумарафон, закрыть проект..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all placeholder-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Описание / критерий успеха
                </label>
                <textarea
                  rows={2}
                  placeholder="Конкретный ожидаемый результат и мотивация..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Сфера жизни
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as GoalCategory)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all"
                  >
                    <option value="health">Здоровье</option>
                    <option value="fitness">Спорт и физическая форма</option>
                    <option value="career">Карьера и дело</option>
                    <option value="education">Обучение и навыки</option>
                    <option value="finance">Финансы</option>
                    <option value="personal">Личное развитие</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Срок реализации (дедлайн)
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Контрольные вехи (каждая с новой строки)
                </label>
                <textarea
                  rows={3}
                  value={milestonesText}
                  onChange={(e) => setMilestonesText(e.target.value)}
                  placeholder="Этап 1&#10;Этап 2&#10;Этап 3"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 font-mono transition-all"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white rounded-xl shadow-lg shadow-indigo-600/25 active:scale-95 transition-all"
                >
                  Создать цель
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
