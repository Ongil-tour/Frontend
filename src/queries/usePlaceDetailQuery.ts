import { useQuery } from '@tanstack/react-query';
import { getPlaceDetail } from '../api/places';

export function usePlaceDetailQuery(id: string) {
  return useQuery({
    queryKey: ['place', id],
    queryFn: () => getPlaceDetail(id),
    enabled: !!id,
  });
}
