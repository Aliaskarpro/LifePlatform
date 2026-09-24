import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Scale, 
  Heart, 
  Moon, 
  Sun, 
  Download, 
  RotateCcw, 
  ShieldCheck, 
  Lock, 
  Save, 
  Check,
  Sparkles
} from 'lucide-react';
import { useLifeStore, calculateBmi } from '../store/lifeStore';
import { useAuthStore } from '../store/authStore';

export const AccountPage: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    anthropometry, 
    updateAnthropometry, 
    theme, 
    setTheme, 
    resetToDefaultData 
  } = useLifeStore();

  const [firstName, setFirstName] = useState(user?.firstName || 'Алекс');
  const [lastName, setLastName] = useState(user?.lastName || 'Волков');
  const [email, setEmail] = useState(user?.email || 'alex.volkov@example.com');

  const [height, setHeight] = useState(anthropometry.heightCm.toString());
  const [targetWeight, setTargetWeight] = useState(anthropometry.targetWeightKg.toString());
  const [bloodType, setBloodType] = useState(anthropometry.bloodType || 'A (II)');
  const [birthDate, setBirthDate] = useState(anthropometry.birthDate || '1995-05-14');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(anthropometry.gender || 'male');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const bmiInfo = calculateBmi(anthropometry.currentWeightKg, anthropometry.heightCm);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateAnthropometry({
      heightCm: parseInt(height) || anthropometry.heightCm,
      targetWeightKg: parseFloat(targetWeight) || anthropometry.targetWeightKg,
      bloodType,
      birthDate,
      gender,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportData = () => {
    const raw = localStorage.getItem('eduplatform_life_data_v1');
    const blob = new Blob([raw || '{}'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifeplatform-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (confirm('Сбросить все персональные данные к демонстрационным значениям по умолчанию?')) {
      resetToDefaultData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Профиль пользователя и настройки
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Управление персональной информацией, антропометрическими параметрами и темой оформления.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-400 text-xs rounded-xl flex items-center space-x-2">
          <Check size={16} />
          <span>Настройки профиля успешно обновлены!</span>
        </div>
      )}

      {resetSuccess && (
        <div className="p-3 bg-indigo-950/40 border border-indigo-800 text-indigo-400 text-xs rounded-xl flex items-center space-x-2">
          <Sparkles size={16} />
          <span>Данные успешно сброшены до эталонного набора!</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Section 1: Basic User Data */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center space-x-2">
            <User size={18} className="text-indigo-400" />
            <span>Основная информация</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Имя</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Фамилия</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Электронная почта
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2 text-slate-400 text-xs cursor-not-allowed"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Используется для авторизации и синхронизации
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Anthropometry & Biological Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center space-x-2">
              <Scale size={18} className="text-emerald-400" />
              <span>Антропометрия и физиология</span>
            </h2>
            <span className="text-xs text-indigo-400 font-mono">
              Текущий ИМТ: {bmiInfo.bmi} ({bmiInfo.category})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Рост (см)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Целевой вес (кг)
              </label>
              <input
                type="number"
                step="0.1"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Группа крови
              </label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="O (I)">O (I) Rh+</option>
                <option value="A (II)">A (II) Rh+</option>
                <option value="B (III)">B (III) Rh+</option>
                <option value="AB (IV)">AB (IV) Rh+</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Дата рождения
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Пол</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
                <option value="other">Другой</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Appearance & Theme */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center space-x-2">
            <Moon size={18} className="text-violet-400" />
            <span>Оформление интерфейса</span>
          </h2>

          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex-1 p-3.5 rounded-xl border flex items-center justify-center space-x-2.5 text-xs font-semibold transition-all ${
                theme === 'dark'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Moon size={16} />
              <span>Тёмная тема (Dark Mode)</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex-1 p-3.5 rounded-xl border flex items-center justify-center space-x-2.5 text-xs font-semibold transition-all ${
                theme === 'light'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sun size={16} />
              <span>Светлая тема (Light Mode)</span>
            </button>
          </div>
        </div>

        {/* Section 4: Data Management & Backups */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center space-x-2">
            <ShieldCheck size={18} className="text-emerald-400" />
            <span>Управление данными и резервные копии</span>
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleExportData}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-2 transition-colors"
            >
              <Download size={14} />
              <span>Экспорт данных (JSON бэкап)</span>
            </button>

            <button
              type="button"
              onClick={handleResetData}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-900 transition-colors flex items-center space-x-2"
            >
              <RotateCcw size={14} />
              <span>Сбросить к исходным демо-данным</span>
            </button>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center space-x-2 shadow-lg shadow-indigo-600/20 transition-colors"
          >
            <Save size={16} />
            <span>Сохранить изменения</span>
          </button>
        </div>
      </form>
    </div>
  );
};
