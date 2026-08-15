import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
}

// TODO: 로그인 상태 기기 저장(재시작 후에도 유지)은 나중에 처리.
// expo-secure-store가 이 프로젝트의 New Architecture 조합에서 네이티브 모듈을
// 못 찾는 미해결 Expo 버그를 건드려서, 지금은 메모리에만 들고 있음
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  setSession: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
  clearAuth: () => set({ accessToken: null, refreshToken: null }),
}));
