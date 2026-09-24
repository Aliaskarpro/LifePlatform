import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Heart, 
  Moon, 
  Dumbbell, 
  CheckCircle2, 
  Activity,
  Calendar,
  Sparkles,
  Award
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { useLifeStore, calculateBmi } from '../store/lifeStore';

type Period = '7d' | '30d' | '90d' | '1y';

export const StatisticsPage: React.FC = () => {
  const { 
    anthropometry, 
    weightHistory, 
    vitalsHistory, 
    sleepHistory, 
    workoutsHistory, 
    habits, 
    goals 
  } = useLifeStore();

  const [period, setPeriod] = useState<Period>('30d');

  // Chart 1: Weight & BMI trend
  const weightChartData = weightHistory.map((w) => ({
    date: w.date.slice(5),
    weight: w.weightKg,
    bmi: w.bmi,
  }));

  // Chart 2: Vitals BP & Pulse trend
  const vitalsChartData = [...vitalsHistory].reverse().map((v) => ({
    date: v.date.slice(5),
    systolic: v.systolicBp,
    diastolic: v.diastolicBp,
    pulse: v.pulseBpm,
  }));

  // Chart 3: Sleep duration trend
  const sleepChartData = sleepHistory.map((s) => ({
    date: s.date.slice(5),
    duration: s.durationHours,
    qualityPercent: s.quality * 20,
  }));

  // Chart 4: Workouts calories & duration
  const workoutsChartData = workoutsHistory.map((w) => ({
    date: w.date.slice(5),
    calories: w.caloriesBurned,
    duration: w.durationMinutes,
    title: w.title,
  }));

  // Total summary stats
  const totalWorkouts = workoutsHistory.length;
  const totalCaloriesBurned = workoutsHistory.reduce((acc, w) => acc + w.caloriesBurned, 0);
  const avgSleep = sleepHistory.length > 0
    ? (sleepHistory.reduce((acc, s) => acc + s.durationHours, 0) / sleepHistory.length).toFixed(1)
    : '8.0';

  const initialWeight = weightHistory.length > 0 ? weightHistory[0].weightKg : anthropometry.currentWeightKg;
  const weightDiff = (anthropometry.currentWeightKg - initialWeight).toFixed(1);

  const completedGoals = goals.filter((g) => g.progressPercent === 100).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Аналитика и статистика прогресса
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Комплексный анализ изменения показателей здоровья, привычек и спортивных результатов.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center space-x-1 p-1 bg-slate-900 border border-slate-800 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setPeriod('7d')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              period === '7d' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            7 дней
          </button>
          <button
            onClick={() => setPeriod('30d')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              period === '30d' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1 месяц
          </button>
          <button
            onClick={() => setPeriod('90d')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              period === '90d' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3 месяца
          </button>
          <button
            onClick={() => setPeriod('1y')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              period === '1y' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1 год
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Динамика веса за период</span>
            <Scale size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white tabular-nums">
              {Number(weightDiff) <= 0 ? weightDiff : `+${weightDiff}`}
            </span>
            <span className="text-xs text-slate-400">кг</span>
          </div>
          <p className="text-xs text-emerald-400 mt-2 flex items-center space-x-1">
            <TrendingDown size={14} />
            <span>Плавное контролируемое снижение</span>
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Средний сон</span>
            <Moon size={16} className="text-violet-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white tabular-nums">{avgSleep}</span>
            <span className="text-xs text-slate-400">ч/сутки</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">В пределах оптимальной нормы (7-9 ч)</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Расход энергии в спорте</span>
            <Dumbbell size={16} className="text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-amber-400 tabular-nums">
              {totalCaloriesBurned.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">ккал</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">{totalWorkouts} тренировок записано</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Достигнутые цели</span>
            <Award size={16} className="text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-indigo-400 tabular-nums">{completedGoals}</span>
            <span className="text-xs text-slate-400">/ {goals.length} целей</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {goals.filter((g) => g.status === 'in_progress').length} в активной работе
          </p>
        </div>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Weight & BMI */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Тренд веса (кг) и ИМТ</h2>
              <p className="text-xs text-slate-400">Сравнение с целевой массой {anthropometry.targetWeightKg} кг</p>
            </div>
            <span className="text-xs font-mono text-emerald-400">
              Текущий: {anthropometry.currentWeightKg} кг
            </span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={['dataMin - 1', 'dataMax + 1']} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <ReferenceLine y={anthropometry.targetWeightKg} stroke="#10b981" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="weight" name="Вес (кг)" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Blood Pressure & Heart Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Артериальное давление и пульс</h2>
              <p className="text-xs text-slate-400">Верхнее/нижнее давление и частота сердечных сокращений</p>
            </div>
            <span className="text-xs font-mono text-rose-400">Норма: 120/80</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vitalsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[50, 150]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="systolic" name="Систолическое АД" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="diastolic" name="Диастолическое АД" stroke="#fb7185" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="pulse" name="Пульс (уд/мин)" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Sleep Duration & Quality */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Сон: Продолжительность (часов)</h2>
              <p className="text-xs text-slate-400">Контроль регулярности ночного сна</p>
            </div>
            <span className="text-xs font-mono text-violet-400">Цель: 8.0ч</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sleepChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 12]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <ReferenceLine y={8.0} stroke="#a855f7" strokeDasharray="4 4" />
                <Bar dataKey="duration" name="Часов сна" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Physical activity burned calories */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Энергозатраты тренировок (ккал)</h2>
              <p className="text-xs text-slate-400">Калории, сожженные во время физических упражнений</p>
            </div>
            <span className="text-xs font-mono text-amber-400">Всего: {totalCaloriesBurned} ккал</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workoutsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="calories" name="Калории (ккал)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Report & Insights */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center space-x-2 text-indigo-400">
          <Sparkles size={18} />
          <h2 className="text-base font-semibold text-white">Персональный аналитический отчет</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-800 space-y-1">
            <span className="font-semibold text-emerald-400 block">✓ Здоровье и форма</span>
            <p className="text-slate-400">
              ИМТ находится в оптимальном диапазоне ({calculateBmi(anthropometry.currentWeightKg, anthropometry.heightCm).bmi}). До достижения целевого веса осталось {(anthropometry.currentWeightKg - anthropometry.targetWeightKg).toFixed(1)} кг. Артериальное давление стабильно в коридоре 118-122 / 78-81.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-800 space-y-1">
            <span className="font-semibold text-violet-400 block">✓ Циркадный ритм</span>
            <p className="text-slate-400">
              Среднее время сна составляет {avgSleep} часов с хорошей долей глубокой фазы. Рекомендуется сохранять стабильное время отбоя до 23:30 даже в выходные дни.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-800 space-y-1">
            <span className="font-semibold text-cyan-400 block">✓ Физический тонус</span>
            <p className="text-slate-400">
              Баланс аэробных нагрузок (бег, плавание) и силовой работы поддерживается на уровне 4 тренировок в неделю, что соответствует ВОЗ по объему кардио-респираторной активности.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
