import { create } from 'zustand';
import { User } from '../types';
import { storage } from '../utils/storage';
import { useLifeStore } from './lifeStore';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  setAuth: (user, token) => {
    storage.setToken(token);
    storage.setUser(user);
    set({ user, token, isAuthenticated: true });
    void useLifeStore.getState().loadForUser(user.id);
  },
  logout: () => {
    storage.clear();
    useLifeStore.getState().clearPersonalData();
    set({ user: null, token: null, isAuthenticated: false });
  },
  setUser: (user) => {
    storage.setUser(user);
    set({ user });
  },
  initAuth: () => {
    const token = storage.getToken();
    const user = storage.getUser();
    if (token && user) {
      set({ user, token, isAuthenticated: true, isLoading: false });
      void useLifeStore.getState().loadForUser(user.id);
    } else {
      set({ isLoading: false });
    }
  },
}));
