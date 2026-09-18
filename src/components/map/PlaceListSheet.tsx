import { forwardRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import AccessibilityBadges from './AccessibilityBadges';
import { KakaoPlace } from '../../types/place';
import { GREEN } from '../../constants/colors';

interface Props {
  category: string | null;
  places: KakaoPlace[];
  onItemPress: (place: KakaoPlace) => void;
  onClose: () => void;
}

const PlaceListSheet = forwardRef<BottomSheet, Props>(({ category, places, onItemPress, onClose }, ref) => {
  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={['16%', '65%']}
      enablePanDownToClose
      onClose={onClose}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>{category} {places.length}곳 발견</Text>
      </View>
      <BottomSheetFlatList
        data={places}
        keyExtractor={(item, index) => item.id ?? `${item.lat},${item.lng},${index}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => onItemPress(item)}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.meta}>
              {item.category}
              {item.distance != null ? ` · ${item.distance}km 거리` : ''}
            </Text>
            {item.address ? (
              <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
            ) : null}
            <AccessibilityBadges accessibility={item.accessibility} />
          </TouchableOpacity>
        )}
      />
    </BottomSheet>
  );
});

export default PlaceListSheet;

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  headerText: { fontSize: 15, fontWeight: '700', color: '#111' },
  listContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  card: {
    backgroundColor: GREEN.softer,
    borderRadius: 14,
    padding: 14,
  },
  name: { fontSize: 16, fontWeight: '700', color: '#111' },
  meta: { fontSize: 13, color: '#777', marginTop: 2 },
  address: { fontSize: 12, color: '#999', marginTop: 2 },
});
