import { useQuery } from '@tanstack/react-query';
import { matchFacilityByLocation } from '../api/places';

export function useAccessibilityQuery(coords: { lat: number; lng: number } | null) {
  return useQuery({
    queryKey: ['facility-match', coords],
    queryFn: () => matchFacilityByLocation(coords!),
    enabled: coords != null,
  });
}
