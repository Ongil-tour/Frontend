import { useMutation } from '@tanstack/react-query';
import { deleteMyAccount } from '../api/user';
import { useAuthStore } from '../stores/useAuthStore';

export function useDeleteAccountMutation() {
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: deleteMyAccount,
    onSuccess: () => clearAuth(),
  });
}
