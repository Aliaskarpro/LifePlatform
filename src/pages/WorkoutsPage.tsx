import React, { useState } from 'react';
import { 
  Dumbbell, 
  Flame, 
  Clock, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Target, 
  Activity, 
  Heart,
  Footprints,
  Calendar
} from 'lucide-react';
import { useLifeStore } from '../store/lifeStore';
import { WorkoutType } from '../types';

const WORKOUT_LABELS: Record<WorkoutType, { name: string; color: string }> = {
  running: { name: 'Бег на улице / дорожке', color: 'text-emerald-400' },
  gym: { name: 'Силовая в зале', color: 'text-indigo-400' },
  swimming: { name: 'Плавание', color: 'text-cyan-400' },
  cycling: { name: 'Велосипед', color: 'text-amber-400' },
  walking: { name: 'Ходьба / треккинг', color: 'text-teal-400' },
  yoga: { name: 'Йога / пилатес', color: 'text-violet-400' },
  hiit: { name: 'Интервальная (HIIT)', color: 'text-rose-400' },
  pilates: { name: 'Пилатес', color: 'text-pink-400' },
  martial_arts: { name: 'Единоборства', color: 'text-orange-400' },
  team_sports: { name: 'Командные игры', color: 'text-blue-400' },
  other: { name: 'Другая активность', color: 'text-slate-400' },
};

export const WorkoutsPage: React.FC = () => {
  const { 
    workoutsHistory, 
    activityGoal, 
    addWorkoutRecord, 
    deleteWorkoutRecord, 
    updateActivityGoal 
  } = useLifeStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);

  // New workout form
  const [wType, setWType] = useState<WorkoutType>('running');
  const [wTitle, setWTitle] = useState('');
  const [wDate, setWDate] = useState(new Date().toISOString().split('T')[0]);
  const [wDuration, setWDuration] = useState('45');
  const [wCalories, setWCalories] = useState('400');
  const [wIntensity, setWIntensity] = useState<'low' | 'moderate' | 'high' | 'extreme'>('moderate');
  const [wDistance, setWDistance] = useState('');
  const [wHeartRate, setWHeartRate] = useState('');
  const [wNotes, setWNotes] = useState('');

  // Activity goal form
  const [targetWorkouts, setTargetWorkouts] = useState(activityGoal.weeklyWorkoutsTarget.toString());
  const [targetMinutes, setTargetMinutes] = useState(activityGoal.weeklyMinutesTarget.toString());
  const [targetSteps, setTargetSteps] = useState(activityGoal.dailyStepsTarget.toString());

  // Calculations
  const totalWorkouts = workoutsHistory.length;
  const totalMinutes = workoutsHistory.reduce((acc, w) => acc + w.durationMinutes, 0);
  const totalCalories = workoutsHistory.reduce((acc, w) => acc + w.caloriesBurned, 0);

  const workoutsProgressPct = Math.min(
    100,
    Math.round((totalWorkouts / activityGoal.weeklyWorkoutsTarget) * 100)
  );

  const minutesProgressPct = Math.min(
    100,
    Math.round((totalMinutes / activityGoal.weeklyMinutesTarget) * 100)
  );

  const handleAddWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    const dur = parseInt(wDuration);
    const cal = parseInt(wCalories);
    if (!isNaN(dur) && dur > 0) {
      addWorkoutRecord({
        date: wDate,
        type: wType,
        title: wTitle || WORKOUT_LABELS[wType].name,
        durationMinutes: dur,
        caloriesBurned: !isNaN(cal) ? cal : 0,
        intensity: wIntensity,
        distanceKm: wDistance ? parseFloat(wDistance) : undefined,
        avgHeartRate: wHeartRate ? parseInt(wHeartRate) : undefined,
        notes: wNotes || undefined,
      });
      setModalOpen(false);
      setWTitle('');
      setWNotes('');
      setWDistance('');
      setWHeartRate('');
    }
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    updateActivityGoal({
      weeklyWorkoutsTarget: parseInt(targetWorkouts) || 4,
      weeklyMinutesTarget: parseInt(targetMinutes) || 200,
      dailyStepsTarget: parseInt(targetSteps) || 10000,
    });
    setGoalModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Физическая активность и тренировки
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Учет тренировочного процесса, расхода калорий и регулярности нагрузок.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setGoalModalOpen(true)}
            className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors flex items-center space-x-1.5"
          >
            <Target size={14} className="text-indigo-400" />
            <span>Цели недели</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="px-3.5 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Plus size={14} />
            <span>Записать тренировку</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Тренировок за неделю</span>
            <Dumbbell size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-3xl font-bold text-white tabular-nums">{totalWorkouts}</span>
            <span className="text-xs text-slate-400">/ {activityGoal.weeklyWorkoutsTarget} цель</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${workoutsProgressPct}%` }} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Активных минут</span>
            <Clock size={16} className="text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-3xl font-bold text-indigo-400 tabular-nums">{totalMinutes}</span>
            <span className="text-xs text-slate-400">/ {activityGoal.weeklyMinutesTarget} мин</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${minutesProgressPct}%` }} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Сожжено калорий</span>
            <Flame size={16} className="text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-3xl font-bold text-white tabular-nums">{totalCalories}</span>
            <span className="text-xs text-slate-400">ккал</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Высокий метаболический отклик</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Дневные шаги (цель)</span>
            <Footprints size={16} className="text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-3xl font-bold text-white tabular-nums">
              {activityGoal.dailyStepsTarget.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">шагов/день</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Аэробная база низкой интенсивности</p>
        </div>
      </div>

      {/* Workouts History List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Журнал выполненных тренировок</h2>
          <span className="text-xs text-slate-400">Всего сессий: {workoutsHistory.length}</span>
        </div>

        <div className="space-y-3">
          {workoutsHistory.length === 0 ? (
            <p className="text-center py-8 text-slate-500 text-xs">Тренировок пока не записано</p>
          ) : (
            workoutsHistory.map((w) => {
              const info = WORKOUT_LABELS[w.type] || { name: w.type, color: 'text-slate-400' };
              return (
                <div
                  key={w.id}
                  className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start justify-between gap-4 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-white">{w.title}</span>
                      <span className={`text-xs font-medium ${info.color}`}>
                        ({info.name})
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Calendar size={13} className="text-indigo-400" />
                        <span>{new Date(w.date).toLocaleDateString('ru-RU')}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center space-x-1">
                        <Clock size={13} className="text-emerald-400" />
                        <span className="text-slate-200 font-mono">{w.durationMinutes} мин</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center space-x-1">
                        <Flame size={13} className="text-amber-400" />
                        <span className="text-slate-200 font-mono">{w.caloriesBurned} ккал</span>
                      </span>
                      {w.distanceKm && (
                        <>
                          <span>·</span>
                          <span>Дистанция: <strong className="text-slate-200">{w.distanceKm} км</strong></span>
                        </>
                      )}
                      {w.avgHeartRate && (
                        <>
                          <span>·</span>
                          <span className="flex items-center space-x-1 text-rose-400">
                            <Heart size={12} />
                            <span>{w.avgHeartRate} уд/мин</span>
                          </span>
                        </>
                      )}
                    </div>

                    {w.notes && <p className="text-xs text-slate-400 pt-1">{w.notes}</p>}
                  </div>

                  <button
                    onClick={() => deleteWorkoutRecord(w.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                    title="Удалить"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal: Add Workout */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">Записать тренировку</h3>
            <form onSubmit={handleAddWorkout} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Вид физической активности
                </label>
                <select
                  value={wType}
                  onChange={(e) => setWType(e.target.value as WorkoutType)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="running">Бег на улице или дорожке</option>
                  <option value="gym">Силовая тренировка в зале</option>
                  <option value="swimming">Плавание</option>
                  <option value="cycling">Велосипед / сайклинг</option>
                  <option value="walking">Оздоровительная ходьба / треккинг</option>
                  <option value="yoga">Йога / стретчинг</option>
                  <option value="hiit">Интервальная тренировка (HIIT)</option>
                  <option value="martial_arts">Единоборства</option>
                  <option value="team_sports">Командный спорт</option>
                  <option value="other">Другая активность</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Название / фокус сессии
                </label>
                <input
                  type="text"
                  placeholder="Темповый кросс, день ног, плавание кролем..."
                  value={wTitle}
                  onChange={(e) => setWTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Дата</label>
                  <input
                    type="date"
                    value={wDate}
                    onChange={(e) => setWDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Длительность (мин)
                  </label>
                  <input
                    type="number"
                    value={wDuration}
                    onChange={(e) => setWDuration(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Расход калорий (ккал)
                  </label>
                  <input
                    type="number"
                    value={wCalories}
                    onChange={(e) => setWCalories(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Интенсивность
                  </label>
                  <select
                    value={wIntensity}
                    onChange={(e) => setWIntensity(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="low">Низкая (разминка)</option>
                    <option value="moderate">Умеренная (аэробная)</option>
                    <option value="high">Высокая (силовая/интервалы)</option>
                    <option value="extreme">Предельная</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Дистанция (км)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="5.5"
                    value={wDistance}
                    onChange={(e) => setWDistance(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Средний пульс
                  </label>
                  <input
                    type="number"
                    placeholder="138"
                    value={wHeartRate}
                    onChange={(e) => setWHeartRate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Заметки</label>
                <input
                  type="text"
                  placeholder="Отличный темп, дыхание стабильное"
                  value={wNotes}
                  onChange={(e) => setWNotes(e.target.value)}
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
                  className="px-4 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Activity Goal */}
      {goalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">Цели по физической активности</h3>
            <form onSubmit={handleSaveGoal} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Количество тренировок в неделю
                </label>
                <input
                  type="number"
                  value={targetWorkouts}
                  onChange={(e) => setTargetWorkouts(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Активных минут в неделю
                </label>
                <input
                  type="number"
                  value={targetMinutes}
                  onChange={(e) => setTargetMinutes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Цель по шагам в день
                </label>
                <input
                  type="number"
                  value={targetSteps}
                  onChange={(e) => setTargetSteps(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
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
