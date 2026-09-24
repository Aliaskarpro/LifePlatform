import apiClient from './api';
import { ScheduleEntry, ScheduleForm } from '../types';
import { MOCK_SCHEDULE, getTodaySchedule, getUpcomingLesson, getWeekSchedule } from '../utils/mockData';
import { storage } from '../utils/storage';

// Check if in demo mode (mock token or no backend)
const isDemoMode = () => {
  const token = storage.getToken();
  return !token || token === 'mock-jwt-token-demo-mode';
};

let mockSchedule = [...MOCK_SCHEDULE];

export const scheduleService = {
  getSchedule: async (params?: { start_date?: string; end_date?: string; status?: string; type?: string }): Promise<ScheduleEntry[]> => {
    if (isDemoMode()) {
      let data = [...mockSchedule];
      if (params?.status) data = data.filter(s => s.status === params.status);
      if (params?.type) data = data.filter(s => s.lessonType === params.type);
      return data.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }
    try {
      const { data } = await apiClient.get('/api/schedule', { params });
      return data;
    } catch {
      return [];
    }
  },

  getTodaySchedule: async (): Promise<ScheduleEntry[]> => {
    if (isDemoMode()) return getTodaySchedule();
    try {
      const { data } = await apiClient.get('/api/schedule/today');
      return data;
    } catch {
      return getTodaySchedule();
    }
  },

  getWeekSchedule: async (): Promise<ScheduleEntry[]> => {
    if (isDemoMode()) return getWeekSchedule();
    try {
      const { data } = await apiClient.get('/api/schedule/week');
      return data;
    } catch {
      return getWeekSchedule();
    }
  },

  getUpcoming: async (): Promise<ScheduleEntry | null> => {
    if (isDemoMode()) return getUpcomingLesson();
    try {
      const { data } = await apiClient.get('/api/schedule/upcoming');
      return data;
    } catch {
      return getUpcomingLesson();
    }
  },

  createEntry: async (form: ScheduleForm): Promise<ScheduleEntry> => {
    if (isDemoMode()) {
      const newEntry: ScheduleEntry = {
        id: `sch-${Date.now()}`,
        userId: 'demo-user-1',
        ...form,
        status: form.status || 'planned',
        lessonType: form.lessonType || 'lesson',
      };
      mockSchedule.push(newEntry);
      return newEntry;
    }
    const { data } = await apiClient.post('/api/schedule', form);
    return data;
  },

  updateEntry: async (id: string, form: Partial<ScheduleForm>): Promise<ScheduleEntry> => {
    if (isDemoMode()) {
      const idx = mockSchedule.findIndex(s => s.id === id);
      if (idx >= 0) {
        mockSchedule[idx] = { ...mockSchedule[idx], ...form };
        return mockSchedule[idx];
      }
      throw new Error('Entry not found');
    }
    const { data } = await apiClient.put(`/api/schedule/${id}`, form);
    return data;
  },

  deleteEntry: async (id: string): Promise<void> => {
    if (isDemoMode()) {
      mockSchedule = mockSchedule.filter(s => s.id !== id);
      return;
    }
    await apiClient.delete(`/api/schedule/${id}`);
  },
};
