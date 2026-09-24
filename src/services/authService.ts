import apiClient from './api';
import { storage } from '../utils/storage';
import { MOCK_USER } from '../utils/mockData';

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const { data } = await apiClient.post('/api/auth/login', { email, password });
      storage.setToken(data.token);
      storage.setUser(data.user);
      return data;
    } catch (error) {
      // Fallback for demo
      if (email === 'demo@example.com' && password === 'Demo1234!') {
        const data = { token: 'demo-token-123', user: MOCK_USER };
        storage.setToken(data.token);
        storage.setUser(data.user);
        return data;
      }
      throw error;
    }
  },
  register: async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      const { data } = await apiClient.post('/api/auth/register', { first_name: firstName, last_name: lastName, email, password });
      storage.setToken(data.token);
      storage.setUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  },
  logout: async () => {
    try { await apiClient.post('/api/auth/logout'); } catch {}
    storage.clear();
  },
  getMe: () => apiClient.get('/api/auth/me').then(r => r.data),
  forgotPassword: async (email: string) => {
    try {
      const { data } = await apiClient.post('/api/auth/forgot-password', { email });
      return data;
    } catch (error) {
      // Mock response for demo
      return { message: 'Password reset link sent (mock)' };
    }
  },
};
