import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Search, 
  Pin, 
  Sparkles,
  X,
  Tag,
  Bookmark
} from 'lucide-react';
import { useLifeStore } from '../store/lifeStore';

const CATEGORY_COLORS: Record<string, { label: string; text: string; bg: string; border: string }> = {
  'Здоровье': { label: 'Здоровье', text: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-800/40' },
  'Сон': { label: 'Сон', text: 'text-violet-400', bg: 'bg-violet-950/40', border: 'border-violet-800/40' },
  'Тренировки': { label: 'Тренировки', text: 'text-cyan-400', bg: 'bg-cyan-950/40', border: 'border-cyan-800/40' },
  'Питание': { label: 'Питание', text: 'text-amber-400', bg: 'bg-amber-950/40', border: 'border-amber-800/40' },
  'Личное': { label: 'Личное', text: 'text-indigo-400', bg: 'bg-indigo-950/40', border: 'border-indigo-800/40' },
};

export const NotesPage: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote } = useLifeStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);

  // New Note state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Здоровье');
  const [tagsStr, setTagsStr] = useState('здоровье, привычки');

  const categories = ['all', 'Здоровье', 'Сон', 'Тренировки', 'Питание', 'Личное'];

  const filteredNotes = notes.filter((n) => {
    if (selectedCategory !== 'all' && n.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchContent = n.content.toLowerCase().includes(q);
      const matchTags = n.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTags) return false;
    }
    return true;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      const tags = tagsStr
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      addNote({
        title: title.trim(),
        content: content.trim(),
        category,
        tags,
        isPinned: false,
      });

      setModalOpen(false);
      setTitle('');
      setContent('');
      setTagsStr('здоровье, привычки');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/60 to-slate-950/80 border border-slate-800/80 backdrop-blur-xl p-6 lg:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center space-x-2 text-xs text-indigo-400 font-semibold tracking-wide uppercase">
              <Sparkles size={14} className="animate-pulse" />
              <span>База знаний и рекомендаций</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              Личные заметки и база знаний
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Хранение рекомендаций специалистов, конспектов по здоровью, питанию, привычкам и режиму дня.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white rounded-xl transition-all flex items-center space-x-2 self-start md:self-auto shadow-lg shadow-indigo-600/25 active:scale-95"
          >
            <Plus size={16} />
            <span>Новая заметка</span>
          </button>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="relative overflow-hidden bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по заголовку, тексту или тегам..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((c) => {
            const isActive = selectedCategory === c;
            return (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {c === 'all' ? 'Все' : c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-500 text-sm neo-glass rounded-2xl border border-slate-800/80">
            <FileText size={36} className="mx-auto mb-3 opacity-40 animate-float" />
            <p className="font-semibold text-slate-300">Заметок не найдено</p>
            <p className="text-xs text-slate-500 mt-1">Создайте новую заметку для фиксации рекомендаций или мыслей</p>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const catStyle = (note.category && CATEGORY_COLORS[note.category]) ? CATEGORY_COLORS[note.category] : CATEGORY_COLORS['Личное'];
            return (
              <div
                key={note.id}
                className={`relative overflow-hidden rounded-2xl border p-5 flex flex-col justify-between space-y-4 transition-all duration-300 backdrop-blur-xl group hover:-translate-y-1 ${
                  note.isPinned
                    ? 'bg-slate-900/80 border-indigo-500/50 shadow-[0_8px_32px_rgba(99,102,241,0.18)]'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2.5 py-0.5 rounded-full font-medium text-[11px] border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                      {note.category}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => updateNote(note.id, { isPinned: !note.isPinned })}
                        className={`p-1.5 rounded-lg transition-all active:scale-90 ${
                          note.isPinned ? 'text-indigo-400 bg-indigo-950/40' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                        }`}
                        title={note.isPinned ? 'Открепить' : 'Закрепить'}
                      >
                        <Pin size={14} className={note.isPinned ? 'rotate-45' : ''} />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-all active:scale-90"
                        title="Удалить"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white font-display group-hover:text-indigo-200 transition-colors">
                    {note.title}
                  </h3>
                  <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed line-clamp-3">
                    {note.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] text-slate-400 bg-slate-950/80 border border-slate-800/80 px-2 py-0.5 rounded-md font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                    <span>Обновлено: {new Date(note.updatedAt).toLocaleDateString('ru-RU')}</span>
                    {note.isPinned && (
                      <span className="text-indigo-400 font-medium">★ Закреплено</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: New Note */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in-up">
          <div className="relative overflow-hidden bg-slate-900/95 border border-slate-800/90 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-base font-bold text-white font-display">Новая заметка</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Заголовок</label>
                <input
                  type="text"
                  placeholder="Рекомендации врача, план питания..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Категория</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="Здоровье">Здоровье</option>
                  <option value="Сон">Сон</option>
                  <option value="Тренировки">Тренировки</option>
                  <option value="Питание">Питание</option>
                  <option value="Личное">Личное</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Содержание</label>
                <textarea
                  rows={4}
                  placeholder="Текст заметки или цитаты..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Теги (через запятую)
                </label>
                <input
                  type="text"
                  placeholder="сон, пульс, чекап"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder-slate-500"
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
