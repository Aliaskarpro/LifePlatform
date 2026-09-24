import { create } from 'zustand';
import { User } from '../types';
import { storage } from '../utils/storage';

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
  setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
  logout: () => {
    storage.clear();
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
    } else {
      set({ isLoading: false });
    }
  },
}));
