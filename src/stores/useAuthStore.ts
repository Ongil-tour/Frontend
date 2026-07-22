import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: null;
  setToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setToken: (token) => set({ token }),
  clearAuth: () => set({ token: null, user: null }),
}));
