import { View, Text, StyleSheet } from 'react-native';
import { AccessibilityInfo } from '../../types/place';

const BADGES: { key: keyof AccessibilityInfo; icon: string }[] = [
  { key: 'wheelchair_accessible', icon: '♿' },
  { key: 'disabled_restroom', icon: '🚻' },
  { key: 'disabled_parking', icon: '🅿️' },
  { key: 'elevator', icon: '🛗' },
  { key: 'pet_friendly', icon: '🐕' },
  { key: 'nursing_room', icon: '🍼' },
];

interface Props {
  accessibility?: AccessibilityInfo;
}

export default function AccessibilityBadges({ accessibility }: Props) {
  if (!accessibility) return null;

  return (
    <View style={styles.row}>
      {BADGES.map(({ key, icon }) => (
        <View key={key} style={[styles.badge, accessibility[key] ? styles.available : styles.unavailable]}>
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
  icon: { fontSize: 13 },
});
