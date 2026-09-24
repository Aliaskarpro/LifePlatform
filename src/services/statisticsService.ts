import apiClient from './api';
import { Statistics } from '../types';

export const statisticsService = {
  getStatistics: async (): Promise<Statistics> => (await apiClient.get('/api/statistics')).data,
  getWeeklyStats: async () => (await apiClient.get('/api/statistics/weekly')).data,
  getMonthlyStats: async () => (await apiClient.get('/api/statistics/monthly')).data,
};
