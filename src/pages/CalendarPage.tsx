import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Filter,
  Dumbbell,
  Stethoscope,
  Moon,
  CheckSquare
} from 'lucide-react';
import { useLifeStore } from '../store/lifeStore';
import { CalendarCategory, CalendarEvent } from '../types';

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  workout: { label: 'Тренировки', color: 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50', icon: Dumbbell },
  doctor_visit: { label: 'Врачи и чекапы', color: 'bg-rose-950/50 text-rose-400 border-rose-800/50', icon: Stethoscope },
  sleep_rest: { label: 'Сон и отдых', color: 'bg-violet-950/50 text-violet-400 border-violet-800/50', icon: Moon },
  habit_task: { label: 'Привычки и дела', color: 'bg-indigo-950/50 text-indigo-400 border-indigo-800/50', icon: CheckSquare },
  goal_milestone: { label: 'Цели и этапы', color: 'bg-amber-950/50 text-amber-400 border-amber-800/50', icon: CheckCircle2 },
  personal: { label: 'Личное', color: 'bg-sky-950/50 text-sky-400 border-sky-800/50', icon: CalendarIcon },
  work: { label: 'Работа', color: 'bg-blue-950/50 text-blue-400 border-blue-800/50', icon: CalendarIcon },
  education: { label: 'Обучение', color: 'bg-teal-950/50 text-teal-400 border-teal-800/50', icon: CalendarIcon },
  other: { label: 'Другое', color: 'bg-slate-800 text-slate-300 border-slate-700', icon: CalendarIcon },
};

export const CalendarPage: React.FC = () => {
  const { calendarEvents, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent } = useLifeStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);

  // New Event form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CalendarCategory>('workout');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [location, setLocation] = useState('');

  // Month navigation
  const prevPeriod = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() - 1);
    else if (viewMode === 'week') next.setDate(next.getDate() - 7);
    else next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const nextPeriod = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() + 1);
    else if (viewMode === 'week') next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filter events
  const filteredEvents = calendarEvents.filter((e) => {
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    return true;
  });

  // Days in month calculation for Month View
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Russian week starts on Monday (1): Monday = 0, Sunday = 6
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastDayOfMonth.getDate();

  // Create array of days for month grid
  const monthDays: { dateStr: string; dayNumber: number; isCurrentMonth: boolean }[] = [];
  
  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i);
    monthDays.push({
      dateStr: d.toISOString().split('T')[0],
      dayNumber: d.getDate(),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    monthDays.push({
      dateStr: d.toISOString().split('T')[0],
      dayNumber: i,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete 35 or 42 cells
  const remaining = 35 - monthDays.length;
  if (remaining > 0) {
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      monthDays.push({
        dateStr: d.toISOString().split('T')[0],
        dayNumber: i,
        isCurrentMonth: false,
      });
    }
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      addCalendarEvent({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        startTime: `${startDate}T${startTime}:00`,
        endTime: `${startDate}T${endTime}:00`,
        location: location.trim() || undefined,
        status: 'planned',
      });
      setModalOpen(false);
      setTitle('');
      setDescription('');
      setLocation('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Календарь и расписание
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Планирование тренировок, визитов к врачу, привычек и распорядка дня.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setModalOpen(true)}
            className="px-3.5 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Plus size={14} />
            <span>Запланировать событие</span>
          </button>
        </div>
      </div>

      {/* Control bar: Month navigation, Views, Category filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navigation */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <button
              onClick={prevPeriod}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextPeriod}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <h2 className="text-base font-semibold text-white min-w-[170px] capitalize">
            {currentDate.toLocaleDateString('ru-RU', {
              month: 'long',
              year: 'numeric',
            })}
          </h2>

          <button
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
          >
            Сегодня
          </button>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-lg self-start md:self-auto">
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'month' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Месяц
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'week' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Неделя
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'day' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            День
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Все категории
          </button>
          {Object.entries(CATEGORY_CONFIG).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors shrink-0 ${
                selectedCategory === key
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {info.label}
            </button>
          ))}
        </div>
      </div>

      {/* Month View Grid */}
      {viewMode === 'month' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-hidden">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-medium text-xs text-slate-400 pb-2 border-b border-slate-800">
            <div>Пн</div>
            <div>Вт</div>
            <div>Ср</div>
            <div>Чт</div>
            <div>Пт</div>
            <div className="text-indigo-400">Сб</div>
            <div className="text-indigo-400">Вс</div>
          </div>

          {/* Days cells */}
          <div className="grid grid-cols-7 gap-1 pt-2">
            {monthDays.map((d, idx) => {
              const dayEvents = filteredEvents.filter((e) => e.startTime.startsWith(d.dateStr));
              const isToday = d.dateStr === todayStr;

              return (
                <div
                  key={idx}
                  className={`min-h-[105px] sm:min-h-[120px] p-1.5 rounded-lg border flex flex-col justify-between transition-colors ${
                    isToday
                      ? 'bg-indigo-950/20 border-indigo-500/50'
                      : d.isCurrentMonth
                      ? 'bg-slate-850/50 border-slate-800/80 hover:bg-slate-800/60'
                      : 'bg-slate-900/30 border-slate-800/30 opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-mono ${
                        isToday ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'
                      }`}
                    >
                      {d.dayNumber}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        {dayEvents.length} соб.
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1 overflow-y-auto max-h-[85px]">
                    {dayEvents.map((evt) => {
                      const catInfo = CATEGORY_CONFIG[evt.category] || CATEGORY_CONFIG.other;
                      const isCompleted = evt.status === 'completed';

                      return (
                        <div
                          key={evt.id}
                          onClick={() =>
                            updateCalendarEvent(evt.id, {
                              status: isCompleted ? 'planned' : 'completed',
                            })
                          }
                          title={`${evt.title} (${isCompleted ? 'Выполнено' : 'Запланировано'})`}
                          className={`px-1.5 py-0.5 rounded text-[11px] border truncate cursor-pointer transition-all ${
                            catInfo.color
                          } ${isCompleted ? 'line-through opacity-60' : ''}`}
                        >
                          <span className="font-semibold mr-1 font-mono text-[10px]">
                            {evt.startTime.split('T')[1]?.slice(0, 5)}
                          </span>
                          {evt.title}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week & Day View / Detailed Events Schedule List */}
      {(viewMode === 'week' || viewMode === 'day') && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Список событий и расписание</h2>
            <span className="text-xs text-slate-400">Всего: {filteredEvents.length} событий</span>
          </div>

          <div className="space-y-3">
            {filteredEvents.length === 0 ? (
              <p className="text-center py-8 text-slate-500 text-xs">Нет событий для отображения</p>
            ) : (
              filteredEvents.map((evt) => {
                const catInfo = CATEGORY_CONFIG[evt.category] || CATEGORY_CONFIG.other;
                const isCompleted = evt.status === 'completed';

                return (
                  <div
                    key={evt.id}
                    className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all ${
                      isCompleted
                        ? 'bg-slate-900/60 border-slate-800/60 opacity-60'
                        : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${catInfo.color}`}>
                          {catInfo.label}
                        </span>
                        <h3 className={`text-sm font-semibold text-white ${isCompleted ? 'line-through' : ''}`}>
                          {evt.title}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center space-x-1">
                          <CalendarIcon size={12} className="text-indigo-400" />
                          <span>{new Date(evt.startTime).toLocaleDateString('ru-RU')}</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center space-x-1 font-mono">
                          <Clock size={12} className="text-indigo-400" />
                          <span>
                            {evt.startTime.split('T')[1]?.slice(0, 5)} - {evt.endTime.split('T')[1]?.slice(0, 5)}
                          </span>
                        </span>
                        {evt.location && (
                          <>
                            <span>·</span>
                            <span className="flex items-center space-x-1">
                              <MapPin size={12} className="text-slate-500" />
                              <span>{evt.location}</span>
                            </span>
                          </>
                        )}
                      </div>

                      {evt.description && (
                        <p className="text-xs text-slate-400 pt-1">{evt.description}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() =>
                          updateCalendarEvent(evt.id, {
                            status: isCompleted ? 'planned' : 'completed',
                          })
                        }
                        className={`px-3 py-1 text-xs rounded-lg font-medium border transition-colors ${
                          isCompleted
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {isCompleted ? 'Выполнено' : 'Отметить готовым'}
                      </button>
                      <button
                        onClick={() => deleteCalendarEvent(evt.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Удалить"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modal: New Calendar Event */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">Запланировать событие</h3>
            <form onSubmit={handleAddEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Название события
                </label>
                <input
                  type="text"
                  placeholder="Силовая тренировка, визит к врачу, прием лекарств..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Категория события
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CalendarCategory)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="workout">Тренировка и спорт</option>
                  <option value="doctor_visit">Визит к врачу / медосмотр</option>
                  <option value="sleep_rest">Сон и восстановление</option>
                  <option value="habit_task">Задача или привычка</option>
                  <option value="other">Другое событие</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Дата</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Начало</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Конец</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Место проведения (необязательно)
                </label>
                <input
                  type="text"
                  placeholder="Фитнес-клуб, парк, Клиника №1..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Описание / заметка
                </label>
                <textarea
                  rows={2}
                  placeholder="Детали, с собой взять форму/анализы..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
