import { useMutation } from '@tanstack/react-query';
import { logout } from '../api/auth';
import { useAuthStore } from '../stores/useAuthStore';

// 서버 호출이 실패해도(네트워크 끊김 등) 로컬 세션은 정리한다 - 사용자가 로그아웃을
// 눌렀는데 계속 로그인 상태로 남아있는 것보다는 서버에 폐기되지 않은 refresh token이
// 하나 남는 편이 낫다.
export function useLogoutMutation() {
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: () => (refreshToken ? logout(refreshToken) : Promise.resolve(undefined)),
    onSettled: () => clearAuth(),
  });
}
