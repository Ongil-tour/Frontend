import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addFavorite } from '../api/favorites';

export function useAddFavoriteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}
