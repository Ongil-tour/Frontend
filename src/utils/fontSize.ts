import { FontSize } from '../types/user';

// SettingScreen 글자크기 버튼(기본/크게/더 크게)의 픽셀값과
// 백엔드 UserSettings.font_size('sm'|'md'|'lg')를 매핑한다.
const FONT_SIZE_PX: Record<FontSize, number> = {
  sm: 15,
  md: 17,
  lg: 19,
};

export function fontSizeToPx(size: FontSize): number {
  return FONT_SIZE_PX[size];
}
