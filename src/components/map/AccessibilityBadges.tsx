import { View, Text, StyleSheet } from 'react-native';
import { AccessibilityInfo } from '../../types/place';

const BADGES: { key: keyof AccessibilityInfo; icon: string }[] = [
  { key: 'wheelchairAccessible', icon: '♿' },
  { key: 'disabledRestroom', icon: '🚻' },
  { key: 'parkingLot', icon: '🅿️' },
  { key: 'elevator', icon: '🛗' },
  { key: 'petFriendly', icon: '🐕' },
  { key: 'nursingRoom', icon: '🍼' },
];

interface Props {
  accessibility?: AccessibilityInfo;
}

// null/undefined = 정보 없음 (회색), true = 있음 (초록), false = 없음 (빨강)
function badgeStyleFor(value: boolean | null | undefined) {
  if (value == null) return styles.unknown;
  return value ? styles.available : styles.unavailable;
}

export default function AccessibilityBadges({ accessibility }: Props) {
  if (!accessibility) return null;

  return (
    <View style={styles.row}>
      {BADGES.map(({ key, icon }) => (
        <View key={key} style={[styles.badge, badgeStyleFor(accessibility[key])]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, marginTop: 10 },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  available: { backgroundColor: '#D9F2DE' },
  unavailable: { backgroundColor: '#F7D9DC' },
  unknown: { backgroundColor: '#E8E8E8' },
  icon: { fontSize: 13 },
});
