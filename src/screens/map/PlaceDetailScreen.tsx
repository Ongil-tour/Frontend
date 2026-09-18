import { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import BottomSheet from '@gorhom/bottom-sheet';
import AccessibilityGrid, { AccessibilityItem } from '../../components/map/AccessibilityGrid';
import AddToFavoriteSheet from '../../components/map/AddToFavoriteSheet';
import BookmarkIcon from '../../components/common/BookmarkIcon';
import { useAccessibilityQuery } from '../../queries/useAccessibilityQuery';
import { useFavoriteStatusQuery } from '../../queries/useFavoriteStatusQuery';
import { RootStackParamList } from '../../navigation/types';
import { AccessibilityInfo } from '../../types/place';
import { FacilitySource } from '../../types/favorite';

function toAccessibilityItems(a: AccessibilityInfo): AccessibilityItem[] {
  return [
    { key: 'wheelchairAccessible', label: '휠체어 접근', icon: '♿', available: a.wheelchairAccessible },
    { key: 'disabledRestroom', label: '장애인 화장실', icon: '🚻', available: a.disabledRestroom },
    { key: 'parkingLot', label: '전용 주차장', icon: '🅿️', available: a.parkingLot },
    { key: 'elevator', label: '엘리베이터', icon: '🛗', available: a.elevator },
    { key: 'petFriendly', label: '보호견 동반', icon: '🐕', available: a.petFriendly },
    { key: 'nursingRoom', label: '수유실', icon: '🍼', available: a.nursingRoom },
  ];
}

export default function PlaceDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'PlaceDetail'>>();
  const { place } = route.params;
  const favoriteSheetRef = useRef<BottomSheet>(null);
  // /map/markers에서 온 place(source='internal'|'kakao')는 이미 정확한 접근성 데이터를
  // 들고 있으므로 그대로 쓰고 좌표 재조회를 하지 않는다 (kakao 소스는 null이어도 그대로 —
  // 좌표로 재조회하면 밀집 지역에서 엉뚱한 근처 시설로 매칭될 수 있음). source가 없는
  // 경우(지도 클릭, 카카오 키워드 검색 등)에만 좌표로 조회한다.
  const ownAccessibility = place.source ? place.accessibility ?? null : null;
  const { data, isLoading, isError } = useAccessibilityQuery(
    place.source ? null : { lat: place.lat, lng: place.lng }
  );
  // 즐겨찾기는 우리 DB의 실제 facility_id에만 저장 가능. source가 있으면 place.id가 이미
  // facility_id다. source가 없는 경우(검색바 키워드 검색, 지도 클릭)엔 위 좌표 매칭
  // 결과(data.facility)가 있을 때만 그 facility.id를 쓴다 — 근처에 매칭되는 시설이 없으면
  // 저장할 방법이 없어 버튼을 숨긴다(우리 DB에 없는 곳이라 진짜로 불가능).
  const favoriteFacilityId = place.source
    ? place.id
    : data?.matched && data.facility
      ? data.facility.id
      : null;
  // place.source가 'kakao'인 경우만 카카오 소스. 그 외(내부 DB 직접 매칭, 좌표 재조회로
  // 찾은 매칭 결과)는 전부 우리 DB의 실제 시설이므로 'internal'.
  const favoriteSource: FacilitySource = place.source === 'kakao' ? 'kakao' : 'internal';
  const { data: favoriteStatus } = useFavoriteStatusQuery(favoriteFacilityId, favoriteSource);

  return (
    <>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.titleRow}>
        <Text style={styles.name}>{place.name}</Text>
        {favoriteFacilityId ? (
          <TouchableOpacity onPress={() => favoriteSheetRef.current?.expand()}>
            <BookmarkIcon active={favoriteStatus?.is_favorite ?? false} size={26} />
          </TouchableOpacity>
        ) : null}
      </View>
      <Text style={styles.meta}>
        {place.category}
        {place.distance != null ? ` · ${place.distance}km 거리` : ''}
      </Text>

      {ownAccessibility ? (
        <AccessibilityGrid items={toAccessibilityItems(ownAccessibility)} />
      ) : isLoading ? (
        <ActivityIndicator style={styles.statusBox} />
      ) : isError ? (
        <Text style={styles.statusText}>배리어프리 정보를 불러오지 못했습니다.</Text>
      ) : !data?.matched || !data.facility ? (
        <Text style={styles.statusText}>{data?.message ?? '등록된 무장애 관광 정보가 없습니다.'}</Text>
      ) : (
        <AccessibilityGrid items={toAccessibilityItems(data.facility.accessibility)} />
      )}

      <View style={styles.infoRow}>
        <Text style={styles.infoIcon}>📍</Text>
        <View>
          <Text style={styles.infoLabel}>주소</Text>
          <Text style={styles.infoValue}>{place.address || '주소 정보 없음'}</Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoIcon}>📞</Text>
        <View>
          <Text style={styles.infoLabel}>전화번호</Text>
          <Text style={styles.infoValue}>{place.phone || '전화번호 정보 없음'}</Text>
        </View>
      </View>
    </ScrollView>
    {favoriteFacilityId ? (
      <AddToFavoriteSheet
        ref={favoriteSheetRef}
        facilityId={favoriteFacilityId}
        source={favoriteSource}
        onClose={() => {}}
      />
    ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  content: { padding: 20, gap: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: 22, fontWeight: '700', color: '#111', flexShrink: 1 },
  meta: { fontSize: 14, color: '#777', marginTop: -8 },
  statusBox: { paddingVertical: 24 },
  statusText: { fontSize: 14, color: '#999', textAlign: 'center', paddingVertical: 24 },
  infoRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  infoIcon: { fontSize: 16, width: 20 },
  infoLabel: { fontSize: 13, fontWeight: '600', color: '#666' },
  infoValue: { fontSize: 15, color: '#111', marginTop: 2 },
});
