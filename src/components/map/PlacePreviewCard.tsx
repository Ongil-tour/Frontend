import { forwardRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { KakaoPlace } from '../../types/place';

interface Props {
  place: KakaoPlace | null;
  onDetailPress: (place: KakaoPlace) => void;
  onClose: () => void;
}

const PlacePreviewCard = forwardRef<BottomSheet, Props>(({ place, onDetailPress, onClose }, ref) => {
  const openInKakaoMap = () => {
    if (!place) return;
    const appUrl = place.id
      ? `kakaomap://place?id=${place.id}`
      : `kakaomap://look?p=${place.lat},${place.lng}`;
    const webUrl = `https://map.kakao.com/link/map/${encodeURIComponent(place.name)},${place.lat},${place.lng}`;

    Linking.canOpenURL(appUrl).then((supported) => {
      Linking.openURL(supported ? appUrl : webUrl);
    });
  };

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={['24%']}
      enablePanDownToClose
      onClose={onClose}
    >
      <BottomSheetView style={styles.container}>
        {place ? (
          <>
            <Text style={styles.name} numberOfLines={1}>{place.name}</Text>
            <Text style={styles.meta}>
              {place.category}
              {place.distance != null ? ` · ${place.distance}km 거리` : ''}
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={openInKakaoMap}>
                <Text style={styles.secondaryButtonText}>카카오맵으로 보기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={() => onDetailPress(place)}>
                <Text style={styles.primaryButtonText}>상세보기</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : null}
      </BottomSheetView>
    </BottomSheet>
  );
});

export default PlacePreviewCard;

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 4 },
  name: { fontSize: 17, fontWeight: '700', color: '#111' },
  meta: { fontSize: 13, color: '#777', marginTop: 4 },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#E9F7EF',
    alignItems: 'center',
  },
  secondaryButtonText: { color: '#2E7D4F', fontWeight: '600', fontSize: 14 },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#22A45D',
    alignItems: 'center',
  },
  primaryButtonText: { color: 'white', fontWeight: '600', fontSize: 14 },
});
