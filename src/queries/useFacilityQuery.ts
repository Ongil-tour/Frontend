import { useQuery } from '@tanstack/react-query';
import { getFacilityById } from '../api/facilities';

export function useFacilityQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['facility', id],
    queryFn: () => getFacilityById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
