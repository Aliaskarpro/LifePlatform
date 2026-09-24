import React, { useCallback, useEffect, useState } from 'react';
import { CalendarClock, Trash2 } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ScheduleEntry } from '../types';
import { scheduleService } from '../services/scheduleService';

export const SchedulePage: React.FC = () => {
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try { setEntries(await scheduleService.getSchedule()); }
    catch { setError('Не удалось загрузить расписание. Проверьте подключение к серверу.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const deleteEntry = async (id: string) => {
    try {
      await scheduleService.deleteEntry(id);
      setEntries((current) => current.filter((entry) => entry.id !== id));
    } catch {
      setError('Не удалось удалить запись. Попробуйте ещё раз.');
    }
  };

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Расписание</h1>
        <p className="text-slate-400 mt-1">Личные события вашего аккаунта</p>
      </div>
      <Card>
        <CardHeader><CardTitle>События</CardTitle></CardHeader>
        <CardContent>
          {error && <p role="alert" className="mb-4 text-sm text-rose-500">{error}</p>}
          {loading ? <p className="text-sm text-slate-400">Загрузка…</p> : entries.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center text-slate-400">
              <CalendarClock size={28} />
              <p>Событий пока нет. Добавьте первое в календаре.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {entries.map((entry) => (
                <li key={entry.id} className="flex min-w-0 items-center gap-3 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{entry.title}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(entry.startTime).toLocaleString()} · {entry.location || 'Место не указано'}
                    </p>
                  </div>
                  <Badge variant={entry.status as any}>{entry.status}</Badge>
                  <Button variant="ghost" size="sm" aria-label="Удалить событие" onClick={() => void deleteEntry(entry.id)}>
                    <Trash2 size={16} />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
