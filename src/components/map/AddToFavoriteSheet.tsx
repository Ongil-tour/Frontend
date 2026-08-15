import { forwardRef } from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useFavoriteListsQuery } from '../../queries/useFavoriteListsQuery';
import { useFavoriteStatusQuery } from '../../queries/useFavoriteStatusQuery';
import { useAddFavoriteMutation } from '../../queries/useAddFavoriteMutation';
import { useRemoveFavoriteByFacilityMutation } from '../../queries/useRemoveFavoriteByFacilityMutation';
import { FavoriteListType } from '../../types/favorite';
import BookmarkIcon from '../common/BookmarkIcon';

interface Props {
  facilityId: string | null;
  onClose: () => void;
}

const LIST_TYPE_LABEL: Record<FavoriteListType, string> = {
  FREQUENT: '즐겨찾는 곳',
  WISHLIST: '가고싶은 곳',
  VISITED: '방문했던 곳',
};

const LIST_TYPE_ICON: Record<FavoriteListType, string> = {
  FREQUENT: '⭐',
  WISHLIST: '🚩',
  VISITED: '📖',
};

const AddToFavoriteSheet = forwardRef<BottomSheet, Props>(({ facilityId, onClose }, ref) => {
  const { data: lists } = useFavoriteListsQuery();
  const { data: status } = useFavoriteStatusQuery(facilityId);
  const addMutation = useAddFavoriteMutation();
  const removeMutation = useRemoveFavoriteByFacilityMutation();

  const toggle = (listId: string, isSaved: boolean) => {
    if (!facilityId) return;
    if (isSaved) {
      removeMutation.mutate({ facilityId, listId });
    } else {
      addMutation.mutate({ facility_id: facilityId, list_id: listId });
    }
  };

  return (
    <BottomSheet ref={ref} index={-1} enableDynamicSizing enablePanDownToClose onClose={onClose}>
      <BottomSheetView style={styles.container}>
        <Text style={styles.title}>즐겨찾기에 저장</Text>
        {lists?.map((list) => {
          const isSaved = status?.favorite_list_ids.includes(list.id) ?? false;
          const isPending =
            (addMutation.isPending && addMutation.variables?.list_id === list.id) ||
            (removeMutation.isPending && removeMutation.variables?.listId === list.id);
          return (
            <TouchableOpacity
              key={list.id}
              style={styles.row}
              onPress={() => toggle(list.id, isSaved)}
              disabled={isPending}
            >
              <Text style={styles.rowIcon}>{LIST_TYPE_ICON[list.list_type]}</Text>
              <Text style={styles.rowText}>{LIST_TYPE_LABEL[list.list_type]}</Text>
              {isPending ? (
                <ActivityIndicator size="small" style={styles.spinner} />
              ) : (
                <BookmarkIcon active={isSaved} />
              )}
            </TouchableOpacity>
          );
        })}
      </BottomSheetView>
    </BottomSheet>
  );
});

export default AddToFavoriteSheet;

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 32, gap: 12 },
  title: { fontSize: 16, fontWeight: '700', color: '#111', textAlign: 'right', marginBottom: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 16,
  },
  rowIcon: { fontSize: 18 },
  rowText: { fontSize: 15, fontWeight: '600', color: '#111', flex: 1 },
  spinner: { marginLeft: 8 },
});
