import { useFavoriteListsQuery } from './useFavoriteListsQuery';
import { useFavoriteListItemsQuery } from './useFavoriteListItemsQuery';
import { useFacilitiesQuery } from './useFacilitiesQuery';
import { FavoriteListType } from '../types/favorite';

// 즐겨찾기 목록 하나(FREQUENT/WISHLIST/VISITED)를 골라서 목록 id 조회 → 항목 조회 →
// 항목별 시설 상세까지 한 번에 묶어주는 훅. PlaceStorageScreen/MyPageScreen이 공유해서 쓴다.
export function useFavoriteListWithFacilities(listType: FavoriteListType, limit?: number) {
  const listsQuery = useFavoriteListsQuery();
  const list = listsQuery.data?.find((l) => l.list_type === listType);
  const itemsQuery = useFavoriteListItemsQuery(list?.id);
  const items = (limit != null ? itemsQuery.data?.slice(0, limit) : itemsQuery.data) ?? [];
  const facilityQueries = useFacilitiesQuery(items.map((item) => item.facility_id));

  const rows = items.map((item, i) => ({
    item,
    facility: facilityQueries[i]?.data,
    isLoading: facilityQueries[i]?.isLoading ?? false,
    isError: facilityQueries[i]?.isError ?? false,
  }));

  return {
    listId: list?.id,
    favoriteCount: list?.favorite_count,
    rows,
    isLoading: listsQuery.isLoading || itemsQuery.isLoading,
    isError: listsQuery.isError || itemsQuery.isError,
  };
}
