import { create } from 'zustand';
import { User } from '../types/auth';

interface AuthState {
  token: string | null;
  user: User | null;
  setSession: (token: string, user: User) => void;
  clearAuth: () => void;
}

// TODO: 로그인 상태 기기 저장(재시작 후에도 유지)은 나중에 처리.
// expo-secure-store가 이 프로젝트의 New Architecture 조합에서 네이티브 모듈을
// 못 찾는 미해결 Expo 버그를 건드려서, 지금은 메모리에만 들고 있음
export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setSession: (token, user) => set({ token, user }),
  clearAuth: () => set({ token: null, user: null }),
}));
