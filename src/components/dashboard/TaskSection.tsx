import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Tag as TagIcon, 
  Calendar, 
  AlertCircle, 
  Sparkles,
  Filter,
  Check,
  X
} from 'lucide-react';
import { useLifeStore } from '../../store/lifeStore';
import { Task, TaskPriority } from '../../types';

// Predefined categories with dedicated colors & icons
export const PREDEFINED_TAGS = [
  { name: 'Health', label: 'Здоровье', color: 'emerald', dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-800' },
  { name: 'Work', label: 'Работа', color: 'indigo', dot: 'bg-indigo-500', text: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-50 dark:bg-indigo-950/40', border: 'border-indigo-200 dark:border-indigo-800' },
  { name: 'Personal', label: 'Личное', color: 'purple', dot: 'bg-purple-500', text: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-50 dark:bg-purple-950/40', border: 'border-purple-200 dark:border-purple-800' },
  { name: 'Fitness', label: 'Спорт', color: 'cyan', dot: 'bg-cyan-500', text: 'text-cyan-700 dark:text-cyan-300', bg: 'bg-cyan-50 dark:bg-cyan-950/40', border: 'border-cyan-200 dark:border-cyan-800' },
  { name: 'Finance', label: 'Финансы', color: 'amber', dot: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-200 dark:border-amber-800' },
  { name: 'Urgent', label: 'Срочно', color: 'rose', dot: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/40', border: 'border-rose-200 dark:border-rose-800' },
] as const;

export function getTagStyle(tag: string) {
  const normalized = tag.trim().toLowerCase();
  switch (normalized) {
    case 'health':
    case 'здоровье':
      return {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
        border: 'border-emerald-500/30',
        text: 'text-emerald-700 dark:text-emerald-400',
        dot: 'bg-emerald-500',
        label: 'Health'
      };
    case 'work':
    case 'работа':
      return {
        bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
        border: 'border-indigo-500/30',
        text: 'text-indigo-700 dark:text-indigo-400',
        dot: 'bg-indigo-500',
        label: 'Work'
      };
    case 'personal':
    case 'личное':
      return {
        bg: 'bg-purple-500/10 dark:bg-purple-500/15',
        border: 'border-purple-500/30',
        text: 'text-purple-700 dark:text-purple-400',
        dot: 'bg-purple-500',
        label: 'Personal'
      };
    case 'fitness':
    case 'спорт':
      return {
        bg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
        border: 'border-cyan-500/30',
        text: 'text-cyan-700 dark:text-cyan-400',
        dot: 'bg-cyan-500',
        label: 'Fitness'
      };
    case 'finance':
    case 'финансы':
      return {
        bg: 'bg-amber-500/10 dark:bg-amber-500/15',
        border: 'border-amber-500/30',
        text: 'text-amber-700 dark:text-amber-400',
        dot: 'bg-amber-500',
        label: 'Finance'
      };
    case 'urgent':
    case 'срочно':
      return {
        bg: 'bg-rose-500/10 dark:bg-rose-500/15',
        border: 'border-rose-500/30',
        text: 'text-rose-700 dark:text-rose-400',
        dot: 'bg-rose-500',
        label: 'Urgent'
      };
    default:
      return {
        bg: 'bg-slate-500/10 dark:bg-slate-500/15',
        border: 'border-slate-500/30',
        text: 'text-slate-700 dark:text-slate-300',
        dot: 'bg-slate-400',
        label: tag
      };
  }
}

export const TaskTagBadge: React.FC<{ tag: string; onRemove?: () => void; isSelected?: boolean; onClick?: () => void }> = ({
  tag,
  onRemove,
  isSelected,
  onClick
}) => {
  const style = getTagStyle(tag);

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all ${
        isSelected
          ? 'ring-2 ring-indigo-500 shadow-sm ' + style.bg + ' ' + style.border + ' ' + style.text
          : style.bg + ' ' + style.border + ' ' + style.text
      } ${onClick ? 'cursor-pointer hover:opacity-85' : ''}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      <span>{tag}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:text-rose-500 focus:outline-none"
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
};

export const TaskSection: React.FC = () => {
  const { tasks = [], addTask, toggleTask, deleteTask } = useLifeStore();

  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Health']);
  const [customTagInput, setCustomTagInput] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Extract all distinct tags present across existing tasks
  const allDistinctTags = useMemo(() => {
    const set = new Set<string>();
    PREDEFINED_TAGS.forEach((t) => set.add(t.name));
    tasks.forEach((t) => t.tags?.forEach((tag) => set.add(tag)));
    return Array.from(set);
  }, [tasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Filter by Tag
      if (selectedTag !== 'all') {
        const hasTag = t.tags?.some((tg) => tg.toLowerCase() === selectedTag.toLowerCase());
        if (!hasTag) return false;
      }
      // Filter by Status
      if (statusFilter === 'active' && t.isCompleted) return false;
      if (statusFilter === 'completed' && !t.isCompleted) return false;
      return true;
    });
  }, [tasks, selectedTag, statusFilter]);

  // Statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleToggleTagSelection = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = customTagInput.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
      setCustomTagInput('');
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      isCompleted: false,
      tags: selectedTags.length > 0 ? selectedTags : ['Personal'],
      priority,
      dueDate,
    });

    // Reset & close
    setNewTitle('');
    setNewDescription('');
    setSelectedTags(['Health']);
    setPriority('medium');
    setModalOpen(false);
  };

  return (
    <div className="relative overflow-hidden bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-6 shadow-xl transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
              Фокус дня и Задачи
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80">
              {completedTasks}/{totalTasks}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Категоризация по сферам жизни: Health, Work, Personal с цветными бейджами
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={() => setModalOpen(true)}
          className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20 active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Новая задача</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 mb-5">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Прогресс выполнения</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">{completionRate}%</span>
        </div>
        <div className="relative w-full bg-slate-100 dark:bg-slate-950/80 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-800">
          <div
            className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 relative overflow-hidden"
            style={{ width: `${completionRate}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Tag Filtering Bar */}
      <div className="flex flex-wrap items-center gap-1.5 pb-4 mb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <span className="text-xs font-medium text-slate-400 dark:text-slate-500 mr-1 flex items-center space-x-1">
          <Filter size={12} />
          <span>Тег:</span>
        </span>

        {/* "All" button */}
        <button
          onClick={() => setSelectedTag('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
            selectedTag === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Все ({totalTasks})
        </button>

        {/* Distinct Tag Buttons */}
        {allDistinctTags.map((tag) => {
          const style = getTagStyle(tag);
          const count = tasks.filter((t) => t.tags?.some((tg) => tg.toLowerCase() === tag.toLowerCase())).length;
          const isActive = selectedTag.toLowerCase() === tag.toLowerCase();

          return (
            <button
              key={tag}
              onClick={() => setSelectedTag(isActive ? 'all' : tag)}
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                isActive
                  ? 'ring-2 ring-indigo-500 shadow-sm ' + style.bg + ' ' + style.border + ' ' + style.text
                  : style.bg + ' ' + style.border + ' ' + style.text + ' hover:opacity-80'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
              <span>{tag}</span>
              <span className="text-[10px] opacity-75 font-mono">({count})</span>
            </button>
          );
        })}

        {/* Status filter toggle */}
        <div className="ml-auto flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/60 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              statusFilter === 'active'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            В работе
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              statusFilter === 'completed'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Готово
          </button>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-10 text-slate-400 dark:text-slate-500">
          <TagIcon size={32} className="mx-auto mb-2 opacity-30 animate-pulse" />
          <p className="text-sm font-medium">Нет задач в данной категории</p>
          <p className="text-xs text-slate-400 mt-1">
            Выберите другой тег или создайте новую задачу
          </p>
          <button
            onClick={() => {
              setSelectedTag('all');
              setStatusFilter('all');
            }}
            className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const isToday = task.dueDate === new Date().toISOString().split('T')[0];

            return (
              <div
                key={task.id}
                className={`group flex items-start justify-between p-3.5 rounded-xl border transition-all duration-200 ${
                  task.isCompleted
                    ? 'bg-slate-50/80 dark:bg-slate-950/40 border-slate-200/80 dark:border-slate-800/50 opacity-75'
                    : 'bg-white dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
                }`}
              >
                {/* Left: Checkbox + Content */}
                <div className="flex items-start space-x-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 ${
                      task.isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                        : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-transparent text-transparent'
                    }`}
                  >
                    <Check size={14} className={task.isCompleted ? 'opacity-100' : 'opacity-0'} />
                  </button>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    {/* Title + Priority badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        onClick={() => toggleTask(task.id)}
                        className={`text-sm font-semibold cursor-pointer select-none transition-colors ${
                          task.isCompleted
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400'
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Priority indicator */}
                      {task.priority === 'high' && (
                        <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 rounded">
                          <AlertCircle size={10} />
                          <span>Высокий</span>
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Meta: Tags + Due Date */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      {/* Color-Coded Tag Badges */}
                      {task.tags?.map((tag) => (
                        <TaskTagBadge
                          key={tag}
                          tag={tag}
                          onClick={() => setSelectedTag(tag)}
                        />
                      ))}

                      {/* Due date */}
                      {task.dueDate && (
                        <span
                          className={`inline-flex items-center space-x-1 text-[11px] font-mono ${
                            isToday
                              ? 'text-amber-600 dark:text-amber-400 font-semibold'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          <Calendar size={11} />
                          <span>
                            {isToday
                              ? 'Сегодня'
                              : new Date(task.dueDate).toLocaleDateString('ru-RU', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-1 ml-2 shrink-0">
                  <button
                    onClick={() => deleteTask(task.id)}
                    title="Удалить задачу"
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors opacity-80 sm:opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Task */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                    Новая задача
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Укажите категорию и теги для удобной сортировки
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Название задачи *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Например: Записаться на плановый чекап здоровья"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  required
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Описание или заметка
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Дополнительные детали, адрес, параметры..."
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Tagging System Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Теги и категории (Color-Coded Badges) *
                </label>
                
                {/* Predefined Quick-Select Tags */}
                <div className="flex flex-wrap gap-2 mb-2.5">
                  {PREDEFINED_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag.name);
                    const style = getTagStyle(tag.name);

                    return (
                      <button
                        type="button"
                        key={tag.name}
                        onClick={() => handleToggleTagSelection(tag.name)}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'ring-2 ring-indigo-500 ' + style.bg + ' ' + style.border + ' ' + style.text
                            : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${tag.dot}`} />
                        <span>{tag.name}</span>
                        {isSelected && <Check size={12} className="ml-0.5" />}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Custom Tags Preview & Add Custom Tag */}
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyDown={handleAddCustomTag}
                      placeholder="Добавить свой тег (Enter)..."
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    disabled={!customTagInput.trim()}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-300 dark:border-slate-700 disabled:opacity-40"
                  >
                    + Добавить
                  </button>
                </div>

                {/* Active Selected Tags Display */}
                {selectedTags.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 self-center mr-1">Выбрано:</span>
                    {selectedTags.map((tag) => (
                      <TaskTagBadge
                        key={tag}
                        tag={tag}
                        onRemove={() => setSelectedTags(selectedTags.filter((t) => t !== tag))}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Priority & Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Приоритет
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="low">Низкий (Low)</option>
                    <option value="medium">Средний (Medium)</option>
                    <option value="high">Высокий (High)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Срок выполнения
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-600/25 active:scale-95 transition-all"
                >
                  Создать задачу
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
