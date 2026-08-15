import { client } from './client';
import { AuthProvider, SocialLoginPayload, SocialLoginResponse } from '../types/auth';

export const loginWithProvider = (provider: AuthProvider, payload: SocialLoginPayload) =>
  client.post<SocialLoginResponse>(`/auth/${provider}/callback`, payload).then((r) => r.data);
