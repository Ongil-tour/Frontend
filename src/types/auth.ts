export type AuthProvider = 'google' | 'naver' | 'kakao';

export interface User {
  id: string;
  email: string;
  name: string;
  provider: AuthProvider;
}

// 백엔드 소셜 로그인 엔드포인트 요청/응답 형태. 엔드포인트 경로/필드명은
// 백엔드 확정되면 api/auth.ts만 맞춰서 고치면 됨
export interface SocialLoginPayload {
  idToken: string;
}

export interface SocialLoginResponse {
  token: string;
  user: User;
}
