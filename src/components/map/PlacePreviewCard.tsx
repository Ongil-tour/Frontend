import { forwardRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { KakaoPlace } from '../../types/place';
import { GREEN } from '../../constants/colors';

interface Props {
  place: KakaoPlace | null;
  onDetailPress: (place: KakaoPlace) => void;
  onClose: () => void;
  onRequestClose: () => void;
}

const PlacePreviewCard = forwardRef<BottomSheet, Props>(({ place, onDetailPress, onClose, onRequestClose }, ref) => {
  const insets = useSafeAreaInsets();

  const openInKakaoMap = () => {
    if (!place) return;
    const appUrl = place.id
      ? `kakaomap://place?id=${place.id}`
      : `kakaomap://look?p=${place.lat},${place.lng}`;
    const webUrl = place.id
      ? `https://m.map.kakao.com/scheme/place?id=${place.id}`
      : `https://m.map.kakao.com/scheme/look?p=${place.lat},${place.lng}`;

    // 웹은 kakaomap:// 커스텀 스킴을 처리할 앱이 없으면 window.open이 조용히 아무 일도
    // 안 하고 끝난다(에러도 안 남). react-native-web의 Linking.canOpenURL은 뭘 넣어도
    // 항상 true를 반환해서 이 분기로는 못 걸러내므로, 웹에서는 아예 https 버전으로 보낸다.
    if (Platform.OS === 'web') {
      Linking.openURL(webUrl);
      return;
    }

    Linking.canOpenURL(appUrl)
      .then((supported) => Linking.openURL(supported ? appUrl : webUrl))
      .catch(() => Linking.openURL(webUrl));
  };

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      enableDynamicSizing
      enablePanDownToClose
      onClose={onClose}
    >
      <BottomSheetView style={[styles.container, { paddingBottom: 20 + insets.bottom }]}>
        {place ? (
          <>
            <TouchableOpacity style={styles.closeButton} onPress={onRequestClose} hitSlop={8}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.name} numberOfLines={1}>{place.name}</Text>
            <Text style={styles.meta}>
              {place.category}
              {place.distance != null ? ` · ${place.distance}km 거리` : ''}
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={openInKakaoMap}>
                <Text style={styles.secondaryButtonText}>카카오맵으로 보기</Text>
              </TouchableOpacity>
              {place.id ? (
                <TouchableOpacity style={styles.primaryButton} onPress={() => onDetailPress(place)}>
                  <Text style={styles.primaryButtonText}>상세보기</Text>
                </TouchableOpacity>
              ) : null}
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
  closeButton: {
    position: 'absolute',
    top: 4,
    right: 20,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  closeButtonText: { fontSize: 13, color: '#666', fontWeight: '600' },
  name: { fontSize: 17, fontWeight: '700', color: '#111', paddingRight: 36 },
  meta: { fontSize: 13, color: '#777', marginTop: 4 },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: GREEN.soft,
    alignItems: 'center',
  },
  secondaryButtonText: { color: GREEN.primaryText, fontWeight: '600', fontSize: 14 },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: GREEN.primary,
    alignItems: 'center',
  },
  primaryButtonText: { color: 'white', fontWeight: '600', fontSize: 14 },
});
