import React, { useCallback, useEffect, useState } from 'react';
import { Search, Shield, Trash2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';
import apiClient from '../services/api';

type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
};

type UserDetails = AdminUser & {
  avatarUrl?: string | null;
  personalData: {
    lifeData: Record<string, unknown>;
    progress: Record<string, unknown> | null;
    notes: unknown[];
    schedule: unknown[];
    lessonProgress: unknown[];
    notifications: unknown[];
  };
};

const normalizeUser = (row: any): AdminUser => ({
  id: row.id,
  email: row.email,
  firstName: row.first_name ?? row.firstName ?? '',
  lastName: row.last_name ?? row.lastName ?? '',
  role: row.role,
  isActive: row.is_active ?? row.isActive ?? false,
  createdAt: row.created_at ?? row.createdAt,
});

const normalizeDetails = (row: any): UserDetails => ({
  ...normalizeUser(row),
  avatarUrl: row.avatar_url ?? row.avatarUrl ?? null,
  personalData: {
    lifeData: row.personalData?.lifeData ?? row.personal_data?.life_data ?? {},
    progress: row.personalData?.progress ?? row.progress ?? null,
    notes: row.personalData?.notes ?? [],
    schedule: row.personalData?.schedule ?? [],
    lessonProgress: row.personalData?.lessonProgress ?? row.personal_data?.lesson_progress ?? [],
    notifications: row.personalData?.notifications ?? [],
  },
});

export const AdminPage: React.FC = () => {
  const currentUser = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [query, setQuery] = useState('');
  const [profile, setProfile] = useState({ email: '', firstName: '', lastName: '', role: 'user' as 'user' | 'admin', isActive: true });
  const [personalDataJson, setPersonalDataJson] = useState('{}');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (currentUser?.role !== 'admin') navigate('/dashboard', { replace: true });
  }, [currentUser?.role, navigate]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setMessage('');
    try {
      const { data } = await apiClient.get('/api/admin/users', { params: { page, limit: 100, search: query || undefined } });
      setUsers(data.users.map(normalizeUser));
      setTotalPages(data.pagination.totalPages);
      setTotalUsers(data.pagination.total);
      const normalizedUsers = data.users.map(normalizeUser);
      if (!selectedId && normalizedUsers[0]) setSelectedId(normalizedUsers[0].id);
      if (selectedId && !normalizedUsers.some((user: AdminUser) => user.id === selectedId)) setSelectedId(normalizedUsers[0]?.id || '');
    } catch {
      setMessage('Не удалось загрузить пользователей. Проверьте права и соединение с API.');
    } finally {
      setLoading(false);
    }
  }, [query, page, selectedId]);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  useEffect(() => {
    if (!selectedId || currentUser?.role !== 'admin') {
      setDetails(null);
      return;
    }
    let active = true;
    apiClient.get(`/api/admin/users/${selectedId}`).then(({ data }) => {
      if (!active) return;
      const normalized = normalizeDetails(data);
      setDetails(normalized);
      setProfile({ email: normalized.email, firstName: normalized.firstName, lastName: normalized.lastName, role: normalized.role, isActive: normalized.isActive });
      setPersonalDataJson(JSON.stringify(normalized.personalData, null, 2));
    }).catch(() => {
      if (active) setMessage('Не удалось загрузить данные пользователя.');
    });
    return () => { active = false; };
  }, [selectedId, currentUser?.role]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!details) return;
    setMessage('');
    let personalData: unknown;
    try {
      personalData = JSON.parse(personalDataJson);
      if (!personalData || typeof personalData !== 'object' || Array.isArray(personalData)) throw new Error('Expected an object');
    } catch {
      setMessage('Персональные данные должны быть корректным JSON-объектом.');
      return;
    }

    setSaving(true);
    try {
      await apiClient.put(`/api/admin/users/${details.id}`, {
        email: profile.email,
        first_name: profile.firstName,
        last_name: profile.lastName,
        role: profile.role,
        is_active: profile.isActive,
      });
      await apiClient.put(`/api/admin/users/${details.id}/personal-data`, {
        personal_data: {
          life_data: (personalData as any).lifeData ?? (personalData as any).life_data,
          progress: (personalData as any).progress,
          notes: (personalData as any).notes,
          schedule: (personalData as any).schedule,
          lesson_progress: (personalData as any).lessonProgress ?? (personalData as any).lesson_progress,
          notifications: (personalData as any).notifications,
        },
      });
      setMessage('Изменения сохранены.');
      await loadUsers();
      const { data } = await apiClient.get(`/api/admin/users/${details.id}`);
      setDetails(normalizeDetails(data));
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Не удалось сохранить изменения.');
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async () => {
    if (!details || details.id === currentUser?.id) return;
    if (!window.confirm(`Удалить аккаунт ${details.email} вместе со всеми его данными?`)) return;
    try {
      await apiClient.delete(`/api/admin/users/${details.id}`);
      setDetails(null);
      setSelectedId('');
      setMessage('Аккаунт и связанные данные удалены.');
      await loadUsers();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Не удалось удалить аккаунт.');
    }
  };

  if (currentUser?.role !== 'admin') return null;

  return (
    <div className="space-y-6 min-w-0">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2 text-indigo-500"><Shield size={18} /><span className="text-xs font-semibold uppercase tracking-wide">Admin</span></div>
          <h1 className="text-2xl font-bold sm:text-3xl">Панель администратора</h1>
          <p className="mt-1 text-sm text-slate-500">Управление аккаунтами и доступ к персональным данным пользователей.</p>
        </div>
        <div className="rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800"><Users className="mr-2 inline" size={16} />{totalUsers} пользователей</div>
      </header>

      {message && <p role="status" className="rounded-lg border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900">{message}</p>}

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.6fr)]">
        <Card className="min-w-0">
          <CardHeader><CardTitle>Пользователи</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Поиск по имени или email" className="w-full min-w-0 rounded-lg border border-slate-300 bg-transparent py-2 pl-9 pr-3 text-sm dark:border-slate-700" />
            </label>
            <div className="max-h-[65vh] space-y-1 overflow-y-auto">
              {loading && <p className="py-4 text-sm text-slate-500">Загрузка…</p>}
              {!loading && users.length === 0 && <p className="py-4 text-sm text-slate-500">Пользователи не найдены.</p>}
              {users.map((user) => (
                <button key={user.id} onClick={() => setSelectedId(user.id)} className={`w-full min-w-0 rounded-lg p-3 text-left transition-colors ${selectedId === user.id ? 'bg-indigo-100 dark:bg-indigo-950/60' : 'hover:bg-slate-100 dark:hover:bg-slate-800/70'}`}>
                  <span className="block truncate text-sm font-medium">{user.firstName} {user.lastName}</span>
                  <span className="block truncate text-xs text-slate-500">{user.email}</span>
                  <span className="mt-1 inline-block text-[11px] text-slate-500">{user.role} · {user.isActive ? 'активен' : 'отключён'}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
              <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}>Назад</Button>
              <span className="text-xs text-slate-500">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage((value) => value + 1)}>Далее</Button>
            </div>
          </CardContent>
        </Card>

        <div className="min-w-0 space-y-4">
          {details ? (
            <Card className="min-w-0">
              <CardHeader className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Аккаунт и личные данные</CardTitle>
                <Button variant="outline" size="sm" disabled={details.id === currentUser?.id} onClick={() => void deleteUser()}><Trash2 size={15} className="mr-2" />Удалить аккаунт</Button>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={save}>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="text-sm">Имя<input required className="mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} /></label>
                    <label className="text-sm">Фамилия<input required className="mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} /></label>
                    <label className="text-sm sm:col-span-2">Email<input required type="email" className="mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></label>
                    <label className="text-sm">Роль<select className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value as 'user' | 'admin' })}><option value="user">user</option><option value="admin">admin</option></select></label>
                    <label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" checked={profile.isActive} onChange={(e) => setProfile({ ...profile, isActive: e.target.checked })} />Аккаунт активен</label>
                  </div>
                  <label className="block text-sm">Все персональные данные, включая медицинские записи, расписание, заметки и прогресс (JSON)
                    <textarea spellCheck={false} className="mt-1 min-h-64 w-full min-w-0 rounded-lg border border-slate-300 bg-slate-950 p-3 font-mono text-xs text-slate-100 dark:border-slate-700" value={personalDataJson} onChange={(e) => setPersonalDataJson(e.target.value)} />
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button type="submit" isLoading={saving}>Сохранить изменения</Button>
                    <span className="text-xs text-slate-500">ID: {details.id} · Создан: {new Date(details.createdAt).toLocaleString()}</span>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : <Card><CardContent className="py-12 text-center text-sm text-slate-500">Выберите пользователя, чтобы просмотреть данные.</CardContent></Card>}

          {details && <Card className="min-w-0">
            <CardHeader><CardTitle>Дополнительные персональные записи</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>Заметки: {details.personalData?.notes?.length || 0} · Расписание: {details.personalData?.schedule?.length || 0}</p>
              <details>
                <summary className="cursor-pointer text-indigo-500">Просмотреть заметки, расписание, учебный прогресс и уведомления</summary>
                <pre className="mt-3 max-h-96 overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-100">{JSON.stringify({ notes: details.personalData?.notes || [], schedule: details.personalData?.schedule || [], lessonProgress: details.personalData?.lessonProgress || [], notifications: details.personalData?.notifications || [] }, null, 2)}</pre>
              </details>
            </CardContent>
          </Card>}
        </div>
      </div>
    </div>
  );
};
