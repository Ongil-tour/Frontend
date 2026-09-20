import { useQuery } from '@tanstack/react-query';
import { getMySettings } from '../api/user';
import { useAuthStore } from '../stores/useAuthStore';

export function useMySettingsQuery() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['users', 'me', 'settings'],
    queryFn: getMySettings,
    enabled: !!accessToken,
  });
}
