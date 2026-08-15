import { useQuery } from '@tanstack/react-query';
import { getFavoriteStatus } from '../api/favorites';

export function useFavoriteStatusQuery(facilityId: string | null) {
  return useQuery({
    queryKey: ['favorites', 'status', facilityId],
    queryFn: () => getFavoriteStatus(facilityId!),
    enabled: !!facilityId,
  });
}
