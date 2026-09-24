import apiClient from './api';
import { storage } from '../utils/storage';
import { normalizeUser } from '../utils/normalizeUser';

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await apiClient.post('/api/auth/login', { email, password });
    storage.setToken(data.token);
    const user = normalizeUser(data.user);
    storage.setUser(user);
    return { ...data, user };
  },
  register: async (firstName: string, lastName: string, email: string, password: string) => {
    const { data } = await apiClient.post('/api/auth/register', { first_name: firstName, last_name: lastName, email, password });
    return { ...data, user: normalizeUser(data.user) };
  },
  logout: async () => {
    try { await apiClient.post('/api/auth/logout'); } catch {}
    storage.clear();
  },
  getMe: () => apiClient.get('/api/auth/me').then(r => normalizeUser(r.data)),
  forgotPassword: async (email: string) => apiClient.post('/api/auth/forgot-password', { email }).then((r) => r.data),
};
