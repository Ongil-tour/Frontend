import { useQuery } from '@tanstack/react-query';
import { getFavoriteListItems } from '../api/favorites';

export function useFavoriteListItemsQuery(listId: string | undefined) {
  return useQuery({
    queryKey: ['favorites', 'list', listId],
    queryFn: () => getFavoriteListItems(listId!),
    enabled: !!listId,
  });
}
