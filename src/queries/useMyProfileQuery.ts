import { useQuery } from '@tanstack/react-query';
import { getMyProfile } from '../api/user';
import { useAuthStore } from '../stores/useAuthStore';

export function useMyProfileQuery() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: getMyProfile,
    enabled: !!accessToken,
  });
}
