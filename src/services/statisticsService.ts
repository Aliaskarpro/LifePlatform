import apiClient from './api';
import { Statistics } from '../types';
import { MOCK_STATS } from '../utils/mockData';
import { storage } from '../utils/storage';

const isDemoMode = () => {
  const token = storage.getToken();
  return !token || token === 'mock-jwt-token-demo-mode';
};

export const statisticsService = {
  getStatistics: async (): Promise<Statistics> => {
    if (isDemoMode()) return MOCK_STATS;
    try {
      const { data } = await apiClient.get('/api/statistics');
      return data;
    } catch {
      return MOCK_STATS;
    }
  },

  getWeeklyStats: async () => {
    if (isDemoMode()) return MOCK_STATS.weeklyData;
    try {
      const { data } = await apiClient.get('/api/statistics/weekly');
      return data;
    } catch {
      return MOCK_STATS.weeklyData;
    }
  },

  getMonthlyStats: async () => {
    if (isDemoMode()) return MOCK_STATS.monthlyData;
    try {
      const { data } = await apiClient.get('/api/statistics/monthly');
      return data;
    } catch {
      return MOCK_STATS.monthlyData;
    }
  },
};
