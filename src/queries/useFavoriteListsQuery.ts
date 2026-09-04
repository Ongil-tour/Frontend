import { useQuery } from '@tanstack/react-query';
import { getFavoriteLists } from '../api/favorites';

export function useFavoriteListsQuery() {
  return useQuery({
    queryKey: ['favorites', 'lists'],
    queryFn: getFavoriteLists,
  });
}
