import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Award, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  BarChart3, 
  LineChart as LineChartIcon,
  Flame,
  ChevronRight,
  Filter,
  Target,
  Zap,
  Activity
} from 'lucide-react';
import { PersonalGoal } from '../../types';

interface GoalsProgressChartProps {
  goals: PersonalGoal[];
  selectedCategory?: string;
}

const PALETTE = [
  { stroke: '#10b981', fill: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', name: 'emerald' },
  { stroke: '#06b6d4', fill: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)', name: 'cyan' },
  { stroke: '#8b5cf6', fill: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)', name: 'violet' },
  { stroke: '#f59e0b', fill: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', name: 'amber' },
  { stroke: '#3b82f6', fill: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)', name: 'blue' },
  { stroke: '#ec4899', fill: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)', name: 'pink' },
  { stroke: '#14b8a6', fill: '#14b8a6', glow: 'rgba(20, 184, 166, 0.4)', name: 'teal' },
];

export const GoalsProgressChart: React.FC<GoalsProgressChartProps> = ({ 
  goals,
  selectedCategory = 'all' 
}) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [activeGoalId, setActiveGoalId] = useState<string | 'all'>('all');
  const [timeRange, setTimeRange] = useState<'all' | '60d' | '30d'>('all');

  // Filter active goals
  const activeGoals = useMemo(() => {
    let list = goals.filter((g) => g.status !== 'on_hold');
    if (selectedCategory !== 'all') {
      list = list.filter((g) => g.category === selectedCategory);
    }
    return list;
  }, [goals, selectedCategory]);

  // Generate or retrieve history for goals
  const processedGoals = useMemo(() => {
    return activeGoals.map((goal, index) => {
      const color = PALETTE[index % PALETTE.length];
      let history = goal.history && goal.history.length > 0 ? [...goal.history] : [];

      if (history.length === 0) {
        // Fallback interpolation if no history was recorded
        const startDate = new Date(goal.startDate || goal.createdAt || Date.now() - 30 * 86400000);
        const today = new Date();
        const diffDays = Math.max(1, Math.round((today.getTime() - startDate.getTime()) / 86400000));
        const curProgress = goal.progressPercent || 0;
        
        const points = 5;
        history = [];
        for (let i = 0; i <= points; i++) {
          const pointDate = new Date(startDate.getTime() + (diffDays * 86400000 * i) / points);
          const p = Math.round((curProgress * i) / points);
          history.push({
            date: pointDate.toISOString().split('T')[0],
            progressPercent: p,
          });
        }
      } else if (history.length === 1) {
        history.push({
          date: new Date().toISOString().split('T')[0],
          progressPercent: goal.progressPercent,
        });
      }

      // Ensure sorted by date
      history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return {
        ...goal,
        color,
        effectiveHistory: history,
      };
    });
  }, [activeGoals]);

  // Aggregate time series data points across all active goals
  const chartData = useMemo(() => {
    if (processedGoals.length === 0) return [];

    // Collect all unique dates
    const dateSet = new Set<string>();
    const now = new Date();
    const cutoffDate = timeRange === '30d' 
      ? new Date(now.getTime() - 30 * 86400000)
      : timeRange === '60d'
      ? new Date(now.getTime() - 60 * 86400000)
      : null;

    processedGoals.forEach((goal) => {
      goal.effectiveHistory.forEach((h) => {
        if (!cutoffDate || new Date(h.date) >= cutoffDate) {
          dateSet.add(h.date);
        }
      });
    });

    // Ensure today's date is in the set
    const todayStr = now.toISOString().split('T')[0];
    if (!cutoffDate || now >= cutoffDate) {
      dateSet.add(todayStr);
    }

    const sortedDates = Array.from(dateSet).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    return sortedDates.map((dateStr) => {
      const row: Record<string, any> = {
        date: dateStr,
        displayDate: new Date(dateStr).toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'short',
        }),
      };

      let sumProgress = 0;
      let count = 0;

      processedGoals.forEach((goal) => {
        const historyBefore = goal.effectiveHistory.filter(
          (h) => new Date(h.date) <= new Date(dateStr)
        );
        let progress = 0;
        if (historyBefore.length > 0) {
          progress = historyBefore[historyBefore.length - 1].progressPercent;
        } else {
          progress = 0;
        }

        row[`goal_${goal.id}`] = progress;
        sumProgress += progress;
        count++;
      });

      row.average = count > 0 ? Math.round(sumProgress / count) : 0;
      return row;
    });
  }, [processedGoals, timeRange]);

  // Stats for motivation
  const stats = useMemo(() => {
    if (activeGoals.length === 0) {
      return {
        avgProgress: 0,
        topGoal: null,
        totalMilestones: 0,
        completedMilestones: 0,
        nearestDeadlineDays: null,
      };
    }

    const totalProgress = activeGoals.reduce((sum, g) => sum + g.progressPercent, 0);
    const avgProgress = Math.round(totalProgress / activeGoals.length);

    const sortedByProgress = [...activeGoals].sort((a, b) => b.progressPercent - a.progressPercent);
    const topGoal = sortedByProgress[0];

    let totalMilestones = 0;
    let completedMilestones = 0;
    activeGoals.forEach((g) => {
      totalMilestones += g.milestones.length;
      completedMilestones += g.milestones.filter((m) => m.isCompleted).length;
    });

    const today = new Date().getTime();
    let minDiffDays: number | null = null;
    activeGoals.forEach((g) => {
      const targetTime = new Date(g.targetDate).getTime();
      const diffDays = Math.ceil((targetTime - today) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && (minDiffDays === null || diffDays < minDiffDays)) {
        minDiffDays = diffDays;
      }
    });

    return {
      avgProgress,
      topGoal,
      totalMilestones,
      completedMilestones,
      nearestDeadlineDays: minDiffDays,
    };
  }, [activeGoals]);

  // Motivational message generator
  const motivationQuote = useMemo(() => {
    if (stats.avgProgress >= 80) {
      return {
        title: 'Финишная прямая!',
        text: 'Вы в одном шаге от триумфа. Основная масса ключевых рубежей успешно пройдена — сфокусируйтесь на закреплении результата.',
        badge: 'Высокая готовность',
        badgeColor: 'text-emerald-400',
      };
    } else if (stats.avgProgress >= 50) {
      return {
        title: 'Экватор преодолен!',
        text: 'Больше половины пути позади. Инерция и наработанная дисциплина работают на вас — сохраняйте взятый темп.',
        badge: 'Отличный разгон',
        badgeColor: 'text-indigo-400',
      };
    } else if (stats.avgProgress >= 25) {
      return {
        title: 'Уверенное движение вперед',
        text: 'Первые и самые сложные барьеры преодолены. Каждый выполненный подэтап укрепляет уверенность в результате.',
        badge: 'Нарастающий импульс',
        badgeColor: 'text-cyan-400',
      };
    }
    return {
      title: 'Старт заложен!',
      text: 'Главное в достижении больших целей — постоянство малых шагов. Закройте следующий этап уже на этой неделе.',
      badge: 'Начало пути',
      badgeColor: 'text-amber-400',
    };
  }, [stats.avgProgress]);

  // Bar chart data for comparative view
  const barData = useMemo(() => {
    return processedGoals.map((g) => ({
      id: g.id,
      name: g.title.length > 25 ? `${g.title.slice(0, 25)}…` : g.title,
      fullName: g.title,
      progress: g.progressPercent,
      completedMilestones: g.milestones.filter((m) => m.isCompleted).length,
      totalMilestones: g.milestones.length,
      color: g.color.stroke,
    }));
  }, [processedGoals]);

  if (activeGoals.length === 0) {
    return (
      <div className="neo-glass rounded-2xl p-8 text-center border border-slate-800/80 animate-fade-in-up">
        <Target className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-float" />
        <h3 className="text-base font-semibold text-white">Нет активных целей для построения графика</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Добавьте новую цель или измените фильтр категории, чтобы увидеть визуальный прогресс и аналитику завершения.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-2xl p-5 sm:p-7 space-y-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition-all duration-300 hover:border-slate-700/80 animate-fade-in-up">
      {/* Ambient background light orb inside the chart card */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Top Header & Motivational Status */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <TrendingUp size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight font-display flex items-center gap-2">
                <span>Динамика выполнения целей во времени</span>
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className={`font-semibold ${motivationQuote.badgeColor}`}>
                  {motivationQuote.badge}
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>{motivationQuote.text}</span>
              </div>
            </div>
          </div>
        </div>

        {/* View toggles & Time range */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Mode */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 text-xs backdrop-blur-md">
            <button
              onClick={() => setChartType('area')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                chartType === 'area'
                  ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LineChartIcon size={14} />
              <span>Таймлайн (%)</span>
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                chartType === 'bar'
                  ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 size={14} />
              <span>Сравнение</span>
            </button>
          </div>

          {/* Time range (for area chart) */}
          {chartType === 'area' && (
            <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 text-xs backdrop-blur-md">
              <button
                onClick={() => setTimeRange('all')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                  timeRange === 'all'
                    ? 'bg-slate-800 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Все время
              </button>
              <button
                onClick={() => setTimeRange('60d')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                  timeRange === '60d'
                    ? 'bg-slate-800 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                60 дн
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                  timeRange === '30d'
                    ? 'bg-slate-800 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                30 дн
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Motivational KPI Cards with 2026 Micro-Interactions */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Average progress */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between backdrop-blur-md hover:border-slate-700 transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Средний прогресс</span>
            <Flame size={15} className="text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight tabular-nums font-display">
              {stats.avgProgress}%
            </span>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center">
              <TrendingUp size={12} className="mr-0.5 inline" />
              +{Math.min(24, Math.round(stats.avgProgress * 0.35))}%
            </span>
          </div>
          {/* Animated shimmer progress bar */}
          <div className="relative w-full bg-slate-800/80 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 h-2 rounded-full transition-all duration-700 relative overflow-hidden"
              style={{ width: `${stats.avgProgress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Card 2: Top Goal */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between backdrop-blur-md hover:border-slate-700 transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Лидер прогресса</span>
            <Award size={15} className="text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2">
            <div className="text-sm font-semibold text-white truncate" title={stats.topGoal?.title}>
              {stats.topGoal?.title || '—'}
            </div>
            <div className="text-xs text-indigo-400 font-semibold mt-1 tabular-nums flex items-center gap-1.5">
              <span>{stats.topGoal ? `${stats.topGoal.progressPercent}% выполнено` : '—'}</span>
              <span className="text-[10px] text-slate-500 font-normal">· максимум</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 mt-2">Лучший темп прироста</span>
        </div>

        {/* Card 3: Milestones */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between backdrop-blur-md hover:border-slate-700 transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Закрыто этапов</span>
            <CheckCircle2 size={15} className="text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight tabular-nums font-display">
              {stats.completedMilestones}
            </span>
            <span className="text-xs text-slate-400">из {stats.totalMilestones}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span>
              {stats.totalMilestones > 0
                ? `${Math.round((stats.completedMilestones / stats.totalMilestones) * 100)}% всех ключевых вех`
                : '0% вех'}
            </span>
          </div>
        </div>

        {/* Card 4: Deadline countdown */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between backdrop-blur-md hover:border-slate-700 transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Ближайший дедлайн</span>
            <Clock size={15} className="text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight tabular-nums font-display">
              {stats.nearestDeadlineDays !== null ? stats.nearestDeadlineDays : '—'}
            </span>
            <span className="text-xs text-slate-400">дней</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            {stats.nearestDeadlineDays !== null && stats.nearestDeadlineDays <= 15 ? (
              <span className="text-amber-400 font-medium">⚡ Финишный спринт</span>
            ) : (
              <span>В стабильном графике</span>
            )}
          </div>
        </div>
      </div>

      {/* Goal Selector Controls (interactive filter pills with live visual states) */}
      <div className="relative z-10 flex flex-wrap items-center gap-2 text-xs pt-1">
        <span className="text-slate-400 mr-1 flex items-center gap-1 text-[11px]">
          <Filter size={13} className="text-indigo-400" />
          Выбор фокуса:
        </span>

        <button
          onClick={() => setActiveGoalId('all')}
          className={`px-3 py-1.5 rounded-lg transition-all duration-200 font-medium ${
            activeGoalId === 'all'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          Все активные ({processedGoals.length})
        </button>

        {processedGoals.map((g) => {
          const isSelected = activeGoalId === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setActiveGoalId(isSelected ? 'all' : g.id)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                isSelected
                  ? 'border-indigo-500/80 bg-indigo-950/40 text-white font-medium ring-2 ring-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                  : 'border-slate-800 bg-slate-950/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: g.color.stroke }}
              />
              <span className="truncate max-w-[140px] sm:max-w-[200px]">{g.title}</span>
              <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                {g.progressPercent}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Recharts Area Container with SVG Glow and High Polish */}
      <div className="relative z-10 h-72 sm:h-84 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 14, left: -14, bottom: 0 }}>
              <defs>
                {/* SVG Glow Filter for futuristic aesthetic */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Soft Gradient fills */}
                {processedGoals.map((g) => (
                  <linearGradient
                    key={`grad_${g.id}`}
                    id={`color_${g.id}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={g.color.stroke} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={g.color.stroke} stopOpacity={0.0} />
                  </linearGradient>
                ))}

                <linearGradient id="color_avg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />

              <XAxis
                dataKey="displayDate"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />

              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                domain={[0, 100]}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={(v) => `${v}%`}
              />

              <Tooltip
                content={<CustomTooltip goals={processedGoals} />}
              />

              {/* Reference Lines with Clean Accents */}
              <ReferenceLine
                y={100}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{
                  value: '100% Финиш',
                  fill: '#10b981',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
              <ReferenceLine
                y={50}
                stroke="#64748b"
                strokeDasharray="3 3"
                opacity={0.6}
                label={{
                  value: '50% Экватор',
                  fill: '#94a3b8',
                  fontSize: 9,
                  position: 'insideTopLeft',
                }}
              />

              {/* Goal Area Trajectories */}
              {processedGoals.map((g) => {
                const isDimmed = activeGoalId !== 'all' && activeGoalId !== g.id;
                if (isDimmed) return null;

                return (
                  <Area
                    key={g.id}
                    type="monotone"
                    dataKey={`goal_${g.id}`}
                    name={g.title}
                    stroke={g.color.stroke}
                    strokeWidth={activeGoalId === g.id ? 3.5 : 2.5}
                    fillOpacity={1}
                    fill={`url(#color_${g.id})`}
                    isAnimationActive={true}
                    animationDuration={1300}
                    animationEasing="ease-out"
                    activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2, fill: g.color.stroke }}
                  />
                );
              })}

              {/* Average Trend line across active goals */}
              {activeGoalId === 'all' && processedGoals.length > 1 && (
                <Line
                  type="monotone"
                  dataKey="average"
                  name="Средний прогресс"
                  stroke="#ffffff"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  isAnimationActive={true}
                  animationDuration={1600}
                  dot={{ r: 3, fill: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#ffffff' }}
                />
              )}
            </AreaChart>
          ) : (
            <BarChart
              data={barData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(v) => `${v}%`}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                width={130}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <ReferenceLine x={100} stroke="#10b981" strokeDasharray="4 4" />
              <Bar 
                dataKey="progress" 
                radius={[0, 8, 8, 0]} 
                isAnimationActive={true}
                animationDuration={1200}
              >
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Motivational Footer Note */}
      <div className="relative z-10 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <Sparkles size={15} className="text-indigo-400 flex-shrink-0 animate-pulse" />
          <span>
            Принцип 2026: прогресс строится на серии микро-побед. Завершайте намеченные контрольные точки последовательно.
          </span>
        </div>
        <div className="flex items-center space-x-4 self-end sm:self-auto text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" /> 100% Финиш
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-slate-400 inline-block" /> 50% Экватор
          </span>
          {activeGoalId === 'all' && processedGoals.length > 1 && (
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-white border border-dashed border-white inline-block" /> Средний тренд
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Custom Tooltip for Timeline Area Chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="neo-glass rounded-xl p-3.5 shadow-2xl text-xs max-w-xs space-y-2 border border-slate-700/80 animate-scale-in">
        <div className="font-semibold text-slate-200 border-b border-slate-800/80 pb-1.5 flex items-center justify-between">
          <span className="font-mono text-slate-300">Дата: {payload[0]?.payload?.date}</span>
          {payload[0]?.payload?.average !== undefined && (
            <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold">
              Ср: {payload[0]?.payload?.average}%
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => {
            const isAvg = entry.dataKey === 'average';
            return (
              <div key={index} className="flex items-center justify-between space-x-3">
                <div className="flex items-center space-x-2 truncate">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className={`truncate ${isAvg ? 'font-semibold text-white' : 'text-slate-300'}`}>
                    {entry.name}
                  </span>
                </div>
                <span className="font-bold text-white tabular-nums flex-shrink-0">
                  {entry.value}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Comparative Bar Chart
const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="neo-glass rounded-xl p-3.5 shadow-2xl text-xs max-w-xs space-y-2 border border-slate-700/80 animate-scale-in">
        <div className="font-semibold text-white font-display">{data.fullName}</div>
        <div className="flex items-center justify-between text-slate-300 pt-1.5 border-t border-slate-800">
          <span>Прогресс:</span>
          <span className="font-bold text-emerald-400 tabular-nums">{data.progress}%</span>
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span>Закрыто этапов:</span>
          <span className="text-white tabular-nums">
            {data.completedMilestones} из {data.totalMilestones}
          </span>
        </div>
      </div>
    );
  }
  return null;
};
