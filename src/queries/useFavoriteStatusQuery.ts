import { useQuery } from '@tanstack/react-query';
import { getFavoriteStatus } from '../api/favorites';
import { FacilitySource } from '../types/favorite';

export function useFavoriteStatusQuery(facilityId: string | null, source: FacilitySource = 'internal') {
  return useQuery({
    queryKey: ['favorites', 'status', facilityId, source],
    queryFn: () => getFavoriteStatus(facilityId!, source),
    enabled: !!facilityId,
  });
}
