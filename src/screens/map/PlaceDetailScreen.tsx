import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import AccessibilityGrid, { AccessibilityItem } from '../../components/map/AccessibilityGrid';
import { useAccessibilityQuery } from '../../queries/useAccessibilityQuery';
import { RootStackParamList } from '../../navigation/types';
import { FacilityMatchResult } from '../../types/place';

function toAccessibilityItems(facility: FacilityMatchResult): AccessibilityItem[] {
  const a = facility.accessibility;
  return [
    { key: 'wheelchairAccessible', label: '휠체어 접근', icon: '♿', available: !!a.wheelchairAccessible },
    { key: 'disabledRestroom', label: '장애인 화장실', icon: '🚻', available: !!a.disabledRestroom },
    { key: 'parkingLot', label: '전용 주차장', icon: '🅿️', available: !!a.parkingLot },
    { key: 'elevator', label: '엘리베이터', icon: '🛗', available: !!a.elevator },
    { key: 'petFriendly', label: '보호견 동반', icon: '🐕', available: !!a.petFriendly },
    { key: 'nursingRoom', label: '수유실', icon: '🍼', available: !!a.nursingRoom },
  ];
}

export default function PlaceDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'PlaceDetail'>>();
  const { place } = route.params;
  const [bookmarked, setBookmarked] = useState(false);
  const { data, isLoading, isError } = useAccessibilityQuery({ lat: place.lat, lng: place.lng });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.titleRow}>
        <Text style={styles.name}>{place.name}</Text>
        <TouchableOpacity onPress={() => setBookmarked((v) => !v)}>
          <Text style={styles.bookmark}>{bookmarked ? '🔖' : '🏷️'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.meta}>
        {place.category}
        {place.distance != null ? ` · ${place.distance}km 거리` : ''}
      </Text>

      {isLoading ? (
        <ActivityIndicator style={styles.statusBox} />
      ) : isError ? (
        <Text style={styles.statusText}>배리어프리 정보를 불러오지 못했습니다.</Text>
      ) : !data?.matched || !data.facility ? (
        <Text style={styles.statusText}>{data?.message ?? '등록된 무장애 관광 정보가 없습니다.'}</Text>
      ) : (
        <AccessibilityGrid items={toAccessibilityItems(data.facility)} />
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  content: { padding: 20, gap: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: 22, fontWeight: '700', color: '#111', flexShrink: 1 },
  bookmark: { fontSize: 22 },
  meta: { fontSize: 14, color: '#777', marginTop: -8 },
  statusBox: { paddingVertical: 24 },
  statusText: { fontSize: 14, color: '#999', textAlign: 'center', paddingVertical: 24 },
  infoRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  infoIcon: { fontSize: 16, width: 20 },
  infoLabel: { fontSize: 13, fontWeight: '600', color: '#666' },
  infoValue: { fontSize: 15, color: '#111', marginTop: 2 },
});
