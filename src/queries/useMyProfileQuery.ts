import { useQuery } from '@tanstack/react-query';
import { getMyProfile } from '../api/user';
import { useAuthStore } from '../stores/useAuthStore';

export function useMyProfileQuery() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: getMyProfile,
    enabled: !!token,
  });
}
