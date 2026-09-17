import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMyAccount } from '../api/user';
import { useAuthStore } from '../stores/useAuthStore';
import { useSettingStore } from '../stores/useSettingStore';

export function useDeleteAccountMutation() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMyAccount,
    onSuccess: () => {
      clearAuth();
      // 계정별로 구분되지 않는 로컬 설정/쿼리 캐시가 남아있으면, 탈퇴 후 같은
      // 이메일로 재가입해도 이전 계정의 다크모드/설정/즐겨찾기가 그대로 보인다.
      useSettingStore.getState().resetSetting();
      queryClient.clear();
    },
  });
}
