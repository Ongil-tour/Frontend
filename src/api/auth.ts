import { client } from './client';
import { AuthProvider, SocialLoginPayload, SocialLoginResponse } from '../types/auth';

// TODO: 백엔드 엔드포인트 경로/응답 형태 확정되면 맞춰서 수정
export const loginWithProvider = (provider: AuthProvider, payload: SocialLoginPayload) =>
  client.post<SocialLoginResponse>(`/auth/${provider}`, payload).then((r) => r.data);
