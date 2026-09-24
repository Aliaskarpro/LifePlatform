import React, { useState } from 'react';
import { 
  Moon, 
  Sun, 
  Sparkles, 
  Plus, 
  Clock, 
  TrendingUp, 
  Trash2, 
  Star,
  Target,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { useLifeStore } from '../store/lifeStore';

export const SleepPage: React.FC = () => {
  const { 
    sleepHistory, 
    sleepGoal, 
    addSleepRecord, 
    deleteSleepRecord, 
    updateSleepGoal 
  } = useLifeStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);

  // New sleep record form
  const [sleepDate, setSleepDate] = useState(new Date().toISOString().split('T')[0]);
  const [bedTime, setBedTime] = useState('23:15');
  const [wakeTime, setWakeTime] = useState('07:15');
  const [duration, setDuration] = useState('8.0');
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [deepSleep, setDeepSleep] = useState('110');
  const [notes, setNotes] = useState('');

  // Sleep goal form
  const [targetHours, setTargetHours] = useState(sleepGoal.targetHours.toString());
  const [targetBedTime, setTargetBedTime] = useState(sleepGoal.targetBedTime);
  const [targetWakeTime, setTargetWakeTime] = useState(sleepGoal.targetWakeTime);

  // Calculate averages
  const avgDuration = sleepHistory.length > 0
    ? (sleepHistory.reduce((acc, s) => acc + s.durationHours, 0) / sleepHistory.length).toFixed(1)
    : '8.0';

  const avgQuality = sleepHistory.length > 0
    ? Math.round((sleepHistory.reduce((acc, s) => acc + s.quality, 0) / sleepHistory.length) * 20)
    : 85;

  const chartData = sleepHistory.map((s) => ({
    date: s.date.slice(5),
    duration: s.durationHours,
    qualityScore: s.quality * 20,
  }));

  const handleAddSleep = (e: React.FormEvent) => {
    e.preventDefault();
    const dur = parseFloat(duration);
    if (!isNaN(dur) && dur > 0 && dur < 24) {
      addSleepRecord({
        date: sleepDate,
        bedTime,
        wakeTime,
        durationHours: dur,
        quality,
        deepSleepMinutes: parseInt(deepSleep) || undefined,
        notes: notes || undefined,
      });
      setModalOpen(false);
      setNotes('');
    }
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const th = parseFloat(targetHours);
    if (!isNaN(th) && th > 4 && th < 14) {
      updateSleepGoal({
        targetHours: th,
        targetBedTime,
        targetWakeTime,
      });
      setGoalModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Сон и восстановление
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Контроль циркадных ритмов, качества фаз сна и времени пробуждения.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setGoalModalOpen(true)}
            className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors flex items-center space-x-1.5"
          >
            <Target size={14} className="text-violet-400" />
            <span>Цели по сну</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="px-3.5 py-2 text-xs font-medium bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Plus size={14} />
            <span>Записать сон</span>
          </button>
        </div>
      </div>

      {/* Top metrics summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Средняя продолжительность</span>
            <Moon size={16} className="text-violet-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-3xl font-bold text-white tabular-nums">{avgDuration}</span>
            <span className="text-sm text-slate-400">ч/ночь</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Целевое значение: {sleepGoal.targetHours} часов
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Качество сна</span>
            <Star size={16} className="text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-3xl font-bold text-emerald-400 tabular-nums">{avgQuality}%</span>
            <span className="text-xs text-slate-400">индекс</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">На основе оценки утренней бодрости</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Режим отхода ко сну</span>
            <Clock size={16} className="text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-white font-mono">{sleepGoal.targetBedTime}</span>
            <span className="text-xs text-slate-400">цель</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Подъем в {sleepGoal.targetWakeTime}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Глубокая фаза (Deep Sleep)</span>
            <Sparkles size={16} className="text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-3xl font-bold text-white tabular-nums">~115</span>
            <span className="text-xs text-slate-400">минут</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Оптимально для восстановления ЦНС</p>
        </div>
      </div>

      {/* Sleep Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-white">Динамика продолжительности сна</h2>
            <p className="text-xs text-slate-400">История за последние дни с линией нормы</p>
          </div>
          <span className="text-xs text-violet-400 font-mono">Норма: {sleepGoal.targetHours}ч</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 12]} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <ReferenceLine
                y={sleepGoal.targetHours}
                stroke="#a855f7"
                strokeDasharray="4 4"
                label={{ value: 'Цель', fill: '#a855f7', fontSize: 11 }}
              />
              <Bar
                dataKey="duration"
                name="Часов сна"
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sleep History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Журнал сна</h2>
          <span className="text-xs text-slate-400">Записей: {sleepHistory.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 font-medium">Дата ночи</th>
                <th className="py-2.5 font-medium">Отбой</th>
                <th className="py-2.5 font-medium">Подъем</th>
                <th className="py-2.5 font-medium">Длительность</th>
                <th className="py-2.5 font-medium">Оценка</th>
                <th className="py-2.5 font-medium">Глубокий сон</th>
                <th className="py-2.5 font-medium">Заметки</th>
                <th className="py-2.5 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {[...sleepHistory].reverse().map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 font-mono text-slate-300">
                    {new Date(rec.date).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="py-2.5 font-mono text-slate-400">{rec.bedTime}</td>
                  <td className="py-2.5 font-mono text-slate-400">{rec.wakeTime}</td>
                  <td className="py-2.5 font-semibold text-white font-mono tabular-nums">
                    {rec.durationHours} ч
                  </td>
                  <td className="py-2.5">
                    <span className="flex items-center space-x-1 text-amber-400">
                      <span>{'★'.repeat(rec.quality)}</span>
                      <span className="text-[10px] text-slate-500">({rec.quality}/5)</span>
                    </span>
                  </td>
                  <td className="py-2.5 text-violet-400 font-mono">
                    {rec.deepSleepMinutes ? `${rec.deepSleepMinutes} мин` : '—'}
                  </td>
                  <td className="py-2.5 text-slate-400 max-w-xs truncate">{rec.notes || '—'}</td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => deleteSleepRecord(rec.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Sleep Record */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">Записать сон</h3>
            <form onSubmit={handleAddSleep} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Дата ночи</label>
                <input
                  type="date"
                  value={sleepDate}
                  onChange={(e) => setSleepDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Время отхода
                  </label>
                  <input
                    type="time"
                    value={bedTime}
                    onChange={(e) => setBedTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Время подъема
                  </label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Длительность (часов)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Качество (1-5)
                  </label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value) as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="5">★★★★★ Отличное</option>
                    <option value="4">★★★★☆ Хорошее</option>
                    <option value="3">★★★☆☆ Нормальное</option>
                    <option value="2">★★☆☆☆ Беспокойное</option>
                    <option value="1">★☆☆☆☆ Плохое</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Глубокий сон (мин)
                </label>
                <input
                  type="number"
                  value={deepSleep}
                  onChange={(e) => setDeepSleep(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Заметки</label>
                <input
                  type="text"
                  placeholder="Проветривание перед сном, без гаджетов"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
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
                  className="px-4 py-1.5 text-xs font-medium bg-violet-600 hover:bg-violet-500 text-white rounded-lg"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Sleep Goal */}
      {goalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">Цели по режиму сна</h3>
            <form onSubmit={handleSaveGoal} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Желаемая продолжительность (часов)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={targetHours}
                  onChange={(e) => setTargetHours(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Целевое время отбоя
                </label>
                <input
                  type="time"
                  value={targetBedTime}
                  onChange={(e) => setTargetBedTime(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Целевое время подъема
                </label>
                <input
                  type="time"
                  value={targetWakeTime}
                  onChange={(e) => setTargetWakeTime(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGoalModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
