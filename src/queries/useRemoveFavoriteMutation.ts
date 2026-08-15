import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeFavorite } from '../api/favorites';

export function useRemoveFavoriteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { favoriteId: string; facilityId?: string }) =>
      removeFavorite(variables.favoriteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}
