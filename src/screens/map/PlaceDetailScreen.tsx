import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import AccessibilityGrid, { AccessibilityItem } from '../../components/map/AccessibilityGrid';
import { RootStackParamList } from '../../navigation/types';

// 백엔드 배리어프리 정보 API 연동 전까지 쓰는 임시 목데이터
const MOCK_ACCESSIBILITY: AccessibilityItem[] = [
  { key: 'wheelchair', label: '휠체어 경사로', icon: '♿', available: true },
  { key: 'restroom', label: '장애인 화장실', icon: '🚻', available: true },
  { key: 'parking', label: '전용 주차장', icon: '🅿️', available: false },
  { key: 'elevator', label: '엘리베이터', icon: '🛗', available: true },
  { key: 'serviceDog', label: '보호견 동반', icon: '🐕', available: false },
  { key: 'nursingRoom', label: '수유실', icon: '🍼', available: true },
];

export default function PlaceDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'PlaceDetail'>>();
  const { place } = route.params;
  const [bookmarked, setBookmarked] = useState(false);

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

      <AccessibilityGrid items={MOCK_ACCESSIBILITY} />

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
  infoRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  infoIcon: { fontSize: 16, width: 20 },
  infoLabel: { fontSize: 13, fontWeight: '600', color: '#666' },
  infoValue: { fontSize: 15, color: '#111', marginTop: 2 },
});
