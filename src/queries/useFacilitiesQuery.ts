import { useQueries } from '@tanstack/react-query';
import { getFacilityById } from '../api/facilities';

export function useFacilitiesQuery(ids: string[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ['facility', id],
      queryFn: () => getFacilityById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    })),
  });
}
