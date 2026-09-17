import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '../api/auth';
import { useAuthStore } from '../stores/useAuthStore';
import { useSettingStore } from '../stores/useSettingStore';

// 서버 호출이 실패해도(네트워크 끊김 등) 로컬 세션은 정리한다 - 사용자가 로그아웃을
// 눌렀는데 계속 로그인 상태로 남아있는 것보다는 서버에 폐기되지 않은 refresh token이
// 하나 남는 편이 낫다.
export function useLogoutMutation() {
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => (refreshToken ? logout(refreshToken) : Promise.resolve(undefined)),
    onSettled: () => {
      clearAuth();
      // 계정별로 구분되지 않는 로컬 설정/쿼리 캐시가 다음 로그인까지 남아있으면
      // 다른 계정(또는 재가입 후 새 계정)에서 이전 계정 데이터가 그대로 보인다.
      useSettingStore.getState().resetSetting();
      queryClient.clear();
    },
  });
}
