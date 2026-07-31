import { View, Text, StyleSheet } from 'react-native';

export interface AccessibilityItem {
  key: string;
  label: string;
  icon: string;
  available: boolean | 0 | 1;
}

interface Props {
  items: AccessibilityItem[];
}

export default function AccessibilityGrid({ items }: Props) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View
          key={item.key}
          style={[styles.tile, item.available ? styles.tileAvailable : styles.tileUnavailable]}
        >
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
  icon: { fontSize: 34 },
  label: { fontSize: 16, fontWeight: '600', color: '#333' },
});
