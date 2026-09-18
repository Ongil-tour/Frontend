import { create } from "zustand";

interface SettingState {
  // 다크모드
  isDark: boolean;
  setIsDark: (value: boolean) => void;

  // 글자 크기
  fontSize: number;
  setFontSize: (size: number) => void;

  // 기본값으로 초기화
  resetSetting: () => void;
}

export const useSettingStore = create<SettingState>((set) => ({
  // 초기 기본값
  isDark: false,
  fontSize: 15,

  // 다크모드 변경
  setIsDark: (value) =>
    set({
      isDark: value,
    }),

  // 글자 크기 변경
  setFontSize: (size) =>
    set({
      fontSize: size,
    }),

  // 설정 초기화
  resetSetting: () =>
    set({
      isDark: false,
      fontSize: 15,
    }),
}));