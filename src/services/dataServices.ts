import apiClient from './api';
import { Course } from '../types';
import { MOCK_COURSES, MOCK_LESSONS } from '../utils/mockData';
import { storage } from '../utils/storage';

const isDemoMode = () => {
  const token = storage.getToken();
  return !token || token === 'mock-jwt-token-demo-mode';
};

export const coursesService = {
  getCourses: async (): Promise<Course[]> => {
    if (isDemoMode()) return MOCK_COURSES;
    try {
      const { data } = await apiClient.get('/api/courses');
      return data;
    } catch {
      return MOCK_COURSES;
    }
  },

  getCourse: async (id: string): Promise<Course & { lessons: any[] }> => {
    if (isDemoMode()) {
      const course = MOCK_COURSES.find(c => c.id === id);
      const lessons = MOCK_LESSONS.filter(l => l.courseId === id);
      return { ...(course as Course), lessons };
    }
    const { data } = await apiClient.get(`/api/courses/${id}`);
    return data;
  },
};

export const lessonsService = {
  getLessons: async (courseId?: string) => {
    if (isDemoMode()) {
      return courseId ? MOCK_LESSONS.filter(l => l.courseId === courseId) : MOCK_LESSONS;
    }
    try {
      const { data } = await apiClient.get('/api/lessons', { params: courseId ? { course_id: courseId } : {} });
      return data;
    } catch {
      return courseId ? MOCK_LESSONS.filter(l => l.courseId === courseId) : MOCK_LESSONS;
    }
  },

  getLesson: async (id: string) => {
    if (isDemoMode()) {
      return MOCK_LESSONS.find(l => l.id === id) || null;
    }
    const { data } = await apiClient.get(`/api/lessons/${id}`);
    return data;
  },

  updateProgress: async (lessonId: string, status: string) => {
    if (isDemoMode()) {
      const lesson = MOCK_LESSONS.find(l => l.id === lessonId);
      if (lesson) lesson.status = status as any;
      return { lessonId, status };
    }
    const { data } = await apiClient.put(`/api/lessons/${lessonId}/progress`, { status });
    return data;
  },
};

export const levelsService = {
  getLevels: async () => {
    const { MOCK_LEVELS } = await import('../utils/mockData');
    if (isDemoMode()) return MOCK_LEVELS;
    try {
      const { data } = await apiClient.get('/api/levels');
      return data;
    } catch {
      return MOCK_LEVELS;
    }
  },

  getUserLevel: async () => {
    const { MOCK_PROGRESS } = await import('../utils/mockData');
    if (isDemoMode()) return MOCK_PROGRESS;
    try {
      const { data } = await apiClient.get('/api/levels/user/current');
      return data;
    } catch {
      return MOCK_PROGRESS;
    }
  },
};

export const userService = {
  getProfile: async () => {
    const { MOCK_USER } = await import('../utils/mockData');
    if (isDemoMode()) return { ...MOCK_USER, progress: await levelsService.getUserLevel() };
    const { data } = await apiClient.get('/api/users/profile');
    return data;
  },

  updateProfile: async (profileData: any) => {
    const { MOCK_USER } = await import('../utils/mockData');
    if (isDemoMode()) {
      Object.assign(MOCK_USER, profileData);
      return MOCK_USER;
    }
    const { data } = await apiClient.put('/api/users/profile', profileData);
    return data;
  },

  getUserStats: async () => {
    const { MOCK_STATS } = await import('../utils/mockData');
    if (isDemoMode()) return MOCK_STATS;
    const { data } = await apiClient.get('/api/users/stats');
    return data;
  },
};
