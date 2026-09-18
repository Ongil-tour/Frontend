import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMyAccount } from '../api/user';
import { useAuthStore } from '../stores/useAuthStore';
import { useSettingStore } from '../stores/useSettingStore';
import { useGoogleSignIn } from '../hooks/useGoogleSignIn';

export function useDeleteAccountMutation() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();
  const { signOut: googleSignOut } = useGoogleSignIn();

  return useMutation({
    mutationFn: deleteMyAccount,
    onSuccess: async () => {
      clearAuth();
      // 계정별로 구분되지 않는 로컬 설정/쿼리 캐시가 남아있으면, 탈퇴 후 같은
      // 이메일로 재가입해도 이전 계정의 다크모드/설정/즐겨찾기가 그대로 보인다.
      useSettingStore.getState().resetSetting();
      queryClient.clear();
      // 기기에 남은 구글 로그인 상태도 지워서, 탈퇴 직후 같은 계정으로
      // 자동 재가입되지 않고 계정 선택 창이 다시 뜨도록 한다.
      await googleSignOut();
    },
  });
}
