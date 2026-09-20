// GET /users/me, PATCH /users/me 응답 기준 (Backend app/schemas/user.py).
// users 테이블엔 email/created_at만 있고 이름(닉네임) 필드가 없음 — 프로필 표시는 email로 대체.
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export type FontSize = 'sm' | 'md' | 'lg';
export type ProfileImageFile = 'profile1.png' | 'profile2.png' | 'profile3.png' | 'profile4.png';

export interface UserSettings {
  high_contrast: boolean;
  font_size: FontSize;
  dark_mode: boolean;
  profile_image: ProfileImageFile;
  updated_at: string;
}

// PATCH /users/me 요청 바디. 보낸 필드만 갱신된다 (exclude_unset).
export interface UserSettingsUpdate {
  high_contrast?: boolean;
  font_size?: FontSize;
  dark_mode?: boolean;
  profile_image?: ProfileImageFile;
}
