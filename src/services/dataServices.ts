import apiClient from './api';
import { Course } from '../types';
import { normalizeUser } from '../utils/normalizeUser';

export const coursesService = {
  getCourses: async (): Promise<Course[]> => (await apiClient.get('/api/courses')).data,
  getCourse: async (id: string): Promise<Course & { lessons: any[] }> => (await apiClient.get(`/api/courses/${id}`)).data,
};

export const lessonsService = {
  getLessons: async (courseId?: string) =>
    (await apiClient.get('/api/lessons', { params: courseId ? { course_id: courseId } : {} })).data,
  getLesson: async (id: string) => (await apiClient.get(`/api/lessons/${id}`)).data,
  updateProgress: async (lessonId: string, status: string) =>
    (await apiClient.put(`/api/lessons/${lessonId}/progress`, { status })).data,
};

export const levelsService = {
  getLevels: async () => (await apiClient.get('/api/levels')).data,
  getUserLevel: async () => (await apiClient.get('/api/levels/user/current')).data,
};

export const userService = {
  getProfile: async () => {
    const data = (await apiClient.get('/api/users/profile')).data;
    return { ...data, ...normalizeUser(data) };
  },
  updateProfile: async (profileData: any) => {
    const data = (await apiClient.put('/api/users/profile', profileData)).data;
    return normalizeUser(data);
  },
  getUserStats: async () => (await apiClient.get('/api/users/stats')).data,
};
