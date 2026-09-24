import React, { useState } from 'react';
import { 
  Scale, 
  Heart, 
  Thermometer, 
  Activity, 
  Plus, 
  Trash2, 
  TrendingDown, 
  Info,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { useLifeStore, calculateBmi } from '../store/lifeStore';

export const HealthPage: React.FC = () => {
  const { 
    anthropometry, 
    updateAnthropometry, 
    weightHistory, 
    addWeightRecord, 
    deleteWeightRecord,
    vitalsHistory,
    addVitalRecord,
    deleteVitalRecord
  } = useLifeStore();

  const [activeTab, setActiveTab] = useState<'anthropometry' | 'vitals'>('anthropometry');

  // Anthropometry edit modal
  const [editAnthModal, setEditAnthModal] = useState(false);
  const [heightInput, setHeightInput] = useState(anthropometry.heightCm.toString());
  const [targetWeightInput, setTargetWeightInput] = useState(anthropometry.targetWeightKg.toString());
  const [bloodTypeInput, setBloodTypeInput] = useState(anthropometry.bloodType || 'A (II)');

  // New weight log modal
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [logWeightInput, setLogWeightInput] = useState(anthropometry.currentWeightKg.toString());
  const [logWeightDate, setLogWeightDate] = useState(new Date().toISOString().split('T')[0]);
  const [logWeightNotes, setLogWeightNotes] = useState('');

  // New vital record modal
  const [vitalModalOpen, setVitalModalOpen] = useState(false);
  const [vitalDate, setVitalDate] = useState(new Date().toISOString().split('T')[0]);
  const [vitalTime, setVitalTime] = useState(
    new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  );
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [pulse, setPulse] = useState('68');
  const [temperature, setTemperature] = useState('36.6');
  const [vitalNotes, setVitalNotes] = useState('');

  const bmiInfo = calculateBmi(anthropometry.currentWeightKg, anthropometry.heightCm);

  // Weight chart data
  const chartData = weightHistory.map((item) => ({
    date: item.date.slice(5), // MM-DD
    weight: item.weightKg,
    bmi: item.bmi,
  }));

  // Handle saving anthropometry
  const handleSaveAnth = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseInt(heightInput);
    const tw = parseFloat(targetWeightInput);
    if (!isNaN(h) && h > 100 && h < 250) {
      updateAnthropometry({
        heightCm: h,
        targetWeightKg: !isNaN(tw) ? tw : anthropometry.targetWeightKg,
        bloodType: bloodTypeInput,
      });
      setEditAnthModal(false);
    }
  };

  // Handle adding weight record
  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(logWeightInput);
    if (!isNaN(w) && w > 30 && w < 300) {
      addWeightRecord({
        weightKg: w,
        date: logWeightDate,
        notes: logWeightNotes || undefined,
      });
      setWeightModalOpen(false);
      setLogWeightNotes('');
    }
  };

  // Handle adding vital record
  const handleAddVital = (e: React.FormEvent) => {
    e.preventDefault();
    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);
    const pul = parseInt(pulse);
    const temp = parseFloat(temperature);

    addVitalRecord({
      date: vitalDate,
      time: vitalTime,
      systolicBp: !isNaN(sys) ? sys : undefined,
      diastolicBp: !isNaN(dia) ? dia : undefined,
      pulseBpm: !isNaN(pul) ? pul : undefined,
      temperatureC: !isNaN(temp) ? temp : undefined,
      notes: vitalNotes || undefined,
    });
    setVitalModalOpen(false);
    setVitalNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Здоровье и антропометрия
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Контроль веса, расчет ИМТ, замеры артериального давления, пульса и температуры тела.
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex items-center space-x-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => setActiveTab('anthropometry')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'anthropometry'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Антропометрия и ИМТ
          </button>
          <button
            onClick={() => setActiveTab('vitals')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'vitals'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Медицинские показатели
          </button>
        </div>
      </div>

      {/* Tab 1: Anthropometry & Weight */}
      {activeTab === 'anthropometry' && (
        <div className="space-y-6">
          {/* Top summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Current Weight */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Текущий вес</span>
                <Scale size={16} className="text-emerald-400" />
              </div>
              <div className="mt-2 flex items-baseline space-x-1">
                <span className="text-3xl font-bold text-white tabular-nums">
                  {anthropometry.currentWeightKg}
                </span>
                <span className="text-sm text-slate-400">кг</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Цель: {anthropometry.targetWeightKg} кг (осталось {(anthropometry.currentWeightKg - anthropometry.targetWeightKg).toFixed(1)} кг)
              </p>
            </div>

            {/* Height */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Рост</span>
                <button
                  onClick={() => setEditAnthModal(true)}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  Изменить
                </button>
              </div>
              <div className="mt-2 flex items-baseline space-x-1">
                <span className="text-3xl font-bold text-white tabular-nums">
                  {anthropometry.heightCm}
                </span>
                <span className="text-sm text-slate-400">см</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Группа крови: {anthropometry.bloodType || 'A (II) Rh+'}
              </p>
            </div>

            {/* BMI */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Индекс массы тела (ИМТ)</span>
                <Info size={16} className="text-indigo-400" />
              </div>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-white tabular-nums">
                  {bmiInfo.bmi}
                </span>
                <span className={`text-xs font-semibold ${bmiInfo.color}`}>
                  {bmiInfo.category}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{bmiInfo.description}</p>
            </div>

            {/* BMI Formula Explanation */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">Формула расчета</span>
              <div className="my-2 p-2 rounded bg-slate-800/60 text-xs font-mono text-indigo-300">
                ИМТ = вес (кг) / (рост (м))²
              </div>
              <p className="text-[11px] text-slate-500">
                Норма Всемирной организации здравоохранения: 18.5 — 24.9
              </p>
            </div>
          </div>

          {/* Weight Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="text-base font-semibold text-white">График изменения веса</h2>
                <p className="text-xs text-slate-400">Динамика веса с привязкой к целевому значению</p>
              </div>
              <button
                onClick={() => setWeightModalOpen(true)}
                className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center space-x-1 self-start sm:self-auto"
              >
                <Plus size={14} />
                <span>Добавить замер</span>
              </button>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    domain={['dataMin - 1', 'dataMax + 1']}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: '#cbd5e1' }}
                  />
                  <ReferenceLine
                    y={anthropometry.targetWeightKg}
                    label={{ value: 'Цель: ' + anthropometry.targetWeightKg, fill: '#10b981', fontSize: 11 }}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    name="Вес (кг)"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ fill: '#6366f1', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weight Log Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">История замеров веса</h2>
              <span className="text-xs text-slate-400">Всего записей: {weightHistory.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 font-medium">Дата</th>
                    <th className="py-2.5 font-medium">Вес</th>
                    <th className="py-2.5 font-medium">ИМТ</th>
                    <th className="py-2.5 font-medium">Категория</th>
                    <th className="py-2.5 font-medium">Заметки</th>
                    <th className="py-2.5 font-medium text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {[...weightHistory].reverse().map((rec) => {
                    const recBmi = calculateBmi(rec.weightKg, anthropometry.heightCm);
                    return (
                      <tr key={rec.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 font-mono text-slate-300">
                          {new Date(rec.date).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="py-2.5 font-semibold text-white tabular-nums">
                          {rec.weightKg} кг
                        </td>
                        <td className="py-2.5 font-mono text-indigo-400 tabular-nums">
                          {recBmi.bmi}
                        </td>
                        <td className="py-2.5">
                          <span className={`text-xs ${recBmi.color}`}>{recBmi.category}</span>
                        </td>
                        <td className="py-2.5 text-slate-400 truncate max-w-xs">
                          {rec.notes || '—'}
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => deleteWeightRecord(rec.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Удалить запись"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Vitals & Medical Indicators */}
      {activeTab === 'vitals' && (
        <div className="space-y-6">
          {/* Add Vital button */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Журнал показателей здоровья</h2>
            <button
              onClick={() => setVitalModalOpen(true)}
              className="px-3.5 py-2 text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white rounded-lg flex items-center space-x-1.5 shadow-sm"
            >
              <Plus size={14} />
              <span>Добавить замер показателей</span>
            </button>
          </div>

          {/* Vitals History List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vitalsHistory.map((vital) => (
              <div
                key={vital.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors space-y-3 relative group"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-1.5 font-mono">
                    <Calendar size={13} className="text-indigo-400" />
                    <span>{new Date(vital.date).toLocaleDateString('ru-RU')}</span>
                    <span className="text-slate-600">·</span>
                    <Clock size={13} className="text-indigo-400" />
                    <span>{vital.time}</span>
                  </div>
                  <button
                    onClick={() => deleteVitalRecord(vital.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-all"
                    title="Удалить"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {vital.systolicBp && (
                    <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                      <span className="text-slate-400 block text-[11px]">Давление (АД)</span>
                      <span className="text-base font-bold text-white font-mono">
                        {vital.systolicBp}/{vital.diastolicBp}
                      </span>
                      <span className="text-[10px] text-slate-500 block">мм рт. ст.</span>
                    </div>
                  )}

                  {vital.pulseBpm && (
                    <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                      <span className="text-slate-400 block text-[11px]">Пульс</span>
                      <span className="text-base font-bold text-rose-400 font-mono">
                        {vital.pulseBpm}
                      </span>
                      <span className="text-[10px] text-slate-500 block">уд/мин</span>
                    </div>
                  )}

                  {vital.temperatureC && (
                    <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                      <span className="text-slate-400 block text-[11px]">Температура</span>
                      <span className="text-base font-bold text-amber-400 font-mono">
                        {vital.temperatureC}
                      </span>
                      <span className="text-[10px] text-slate-500 block">°C</span>
                    </div>
                  )}

                  {vital.oxygenPercent && (
                    <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                      <span className="text-slate-400 block text-[11px]">Сатурация SpO2</span>
                      <span className="text-base font-bold text-cyan-400 font-mono">
                        {vital.oxygenPercent}%
                      </span>
                      <span className="text-[10px] text-slate-500 block">Кислород</span>
                    </div>
                  )}
                </div>

                {vital.notes && (
                  <p className="text-xs text-slate-400 bg-slate-950 p-2 rounded border border-slate-800">
                    {vital.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Edit Anthropometry */}
      {editAnthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">Параметры тела</h3>
            <form onSubmit={handleSaveAnth} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Рост (в сантиметрах)
                </label>
                <input
                  type="number"
                  value={heightInput}
                  onChange={(e) => setHeightInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Целевой вес (в килограммах)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={targetWeightInput}
                  onChange={(e) => setTargetWeightInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Группа крови и резус-фактор
                </label>
                <select
                  value={bloodTypeInput}
                  onChange={(e) => setBloodTypeInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="O (I) Rh+">O (I) Rh+ (Первая положительная)</option>
                  <option value="O (I) Rh-">O (I) Rh- (Первая отрицательная)</option>
                  <option value="A (II) Rh+">A (II) Rh+ (Вторая положительная)</option>
                  <option value="A (II) Rh-">A (II) Rh- (Вторая отрицательная)</option>
                  <option value="B (III) Rh+">B (III) Rh+ (Третья положительная)</option>
                  <option value="B (III) Rh-">B (III) Rh- (Третья отрицательная)</option>
                  <option value="AB (IV) Rh+">AB (IV) Rh+ (Четвертая положительная)</option>
                  <option value="AB (IV) Rh-">AB (IV) Rh- (Четвертая отрицательная)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditAnthModal(false)}
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

      {/* Modal: Add Weight */}
      {weightModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">Добавить замер веса</h3>
            <form onSubmit={handleAddWeight} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Вес (кг)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={logWeightInput}
                  onChange={(e) => setLogWeightInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Дата замера
                </label>
                <input
                  type="date"
                  value={logWeightDate}
                  onChange={(e) => setLogWeightDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Заметки (необязательно)
                </label>
                <input
                  type="text"
                  placeholder="Утреннее взвешивание натощак"
                  value={logWeightNotes}
                  onChange={(e) => setLogWeightNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

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
                  className="px-4 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Vitals */}
      {vitalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">Новый замер показателей</h3>
            <form onSubmit={handleAddVital} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Дата</label>
                  <input
                    type="date"
                    value={vitalDate}
                    onChange={(e) => setVitalDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Время</label>
                  <input
                    type="time"
                    value={vitalTime}
                    onChange={(e) => setVitalTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Систолическое АД
                  </label>
                  <input
                    type="number"
                    placeholder="120"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Диастолическое АД
                  </label>
                  <input
                    type="number"
                    placeholder="80"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
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
                    placeholder="68"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Температура (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="36.6"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Заметки / Самочувствие
                </label>
                <input
                  type="text"
                  placeholder="Отличное самочувствие, после сна"
                  value={vitalNotes}
                  onChange={(e) => setVitalNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
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
                  className="px-4 py-1.5 text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white rounded-lg"
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
