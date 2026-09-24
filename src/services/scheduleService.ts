import apiClient from './api';
import { ScheduleEntry, ScheduleForm } from '../types';

export const scheduleService = {
  getSchedule: async (params?: { start_date?: string; end_date?: string; status?: string; type?: string }): Promise<ScheduleEntry[]> =>
    (await apiClient.get('/api/schedule', { params })).data,
  getTodaySchedule: async (): Promise<ScheduleEntry[]> => (await apiClient.get('/api/schedule/today')).data,
  getWeekSchedule: async (): Promise<ScheduleEntry[]> => (await apiClient.get('/api/schedule/week')).data,
  getUpcoming: async (): Promise<ScheduleEntry | null> => (await apiClient.get('/api/schedule/upcoming')).data,
  createEntry: async (form: ScheduleForm): Promise<ScheduleEntry> => (await apiClient.post('/api/schedule', form)).data,
  updateEntry: async (id: string, form: Partial<ScheduleForm>): Promise<ScheduleEntry> =>
    (await apiClient.put(`/api/schedule/${id}`, form)).data,
  deleteEntry: async (id: string): Promise<void> => { await apiClient.delete(`/api/schedule/${id}`); },
};
