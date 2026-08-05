import { View, Text, StyleSheet } from 'react-native';

export interface AccessibilityItem {
  key: string;
  label: string;
  icon: string;
  // null/undefined = 정보 없음 (회색), true/1 = 있음 (초록), false/0 = 없음 (빨강)
  available: boolean | 0 | 1 | null | undefined;
}

interface Props {
  items: AccessibilityItem[];
}

function tileStyleFor(value: AccessibilityItem['available']) {
  if (value == null) return styles.tileUnknown;
  return value ? styles.tileAvailable : styles.tileUnavailable;
}

export default function AccessibilityGrid({ items }: Props) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.key} style={[styles.tile, tileStyleFor(item.available)]}>
          <Text style={styles.icon}>{item.icon}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  tile: {
    width: '46%',
    borderRadius: 16,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  tileAvailable: { backgroundColor: '#D9F2DE' },
  tileUnavailable: { backgroundColor: '#F7D9DC' },
  tileUnknown: { backgroundColor: '#E8E8E8' },
  icon: { fontSize: 34 },
  label: { fontSize: 16, fontWeight: '600', color: '#333' },
});
