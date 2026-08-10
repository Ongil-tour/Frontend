import { useMutation } from '@tanstack/react-query';
import { loginWithProvider } from '../api/auth';
import { useAuthStore } from '../stores/useAuthStore';
import { AuthProvider, SocialLoginPayload } from '../types/auth';

export function useSocialLoginMutation(provider: AuthProvider) {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (payload: SocialLoginPayload) => loginWithProvider(provider, payload),
    onSuccess: (data) => setSession(data.token, data.user),
  });
}
