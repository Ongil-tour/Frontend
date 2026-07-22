import { useQuery } from '@tanstack/react-query';
import { getPlaces } from '../api/places';

export function usePlacesQuery(params: { category?: string; distance?: number }) {
  return useQuery({
    queryKey: ['places', params],
    queryFn: () => getPlaces(params),
  });
}
