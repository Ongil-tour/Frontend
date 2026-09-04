import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clearFavoriteList, getFavoriteLists } from '../api/favorites';

// "즐겨찾기 전체 삭제" - 목록별 삭제만 있어서, 사용자의 목록(FREQUENT/WISHLIST/VISITED)
// 전부를 조회한 뒤 각 목록을 비운다.
export function useClearAllFavoritesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const lists = await getFavoriteLists();
      await Promise.all(lists.map((list) => clearFavoriteList(list.id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}
