export type AuthProvider = 'google' | 'naver' | 'kakao';

// 백엔드 UserRead(app/schemas/user.py) 기준 - name/provider 필드는 없음
export interface User {
  id: string;
  email: string;
  createdAt: string;
}

// 백엔드 OAuthLoginRequest(app/routers/auth.py) 기준
export interface SocialLoginPayload {
  token: string;
}

// 백엔드 TokenPair(app/schemas/user.py) 기준 - user는 로그인 응답에 없고
// GET /users/me를 access_token으로 따로 호출해야 함
export interface SocialLoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
