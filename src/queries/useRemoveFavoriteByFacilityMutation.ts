import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getFavoriteListItems, removeFavorite } from '../api/favorites';

// GET /favorites/{facility_id}/status는 favorite_list_ids만 주고 favorite_id(삭제에
// 필요한 값)는 안 줘서, 특정 목록에서 해제할 땐 그 목록 항목을 다시 조회해 facility_id가
// 일치하는 항목을 찾은 뒤 지운다. AddToFavoriteSheet의 체크 해제에서만 쓰는 경로.
export function useRemoveFavoriteByFacilityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: { facilityId: string; listId: string }) => {
      const items = await getFavoriteListItems(variables.listId);
      const match = items.find((item) => item.facility_id === variables.facilityId);
      if (!match) return;
      return removeFavorite(match.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}
