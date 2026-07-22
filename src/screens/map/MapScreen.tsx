import { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import KakaoMapView, { KakaoMapViewHandle } from '../../components/map/KakaoMapView';

const CATEGORIES = [
  { label: '음식점', code: 'FD6' },
  { label: '카페', code: 'CE7' },
  { label: '숙소', code: 'AD5' },
  { label: '관광지', code: 'AT4' },
  { label: '병원', code: 'HP8' },
  { label: '편의점', code: 'CS2' },
];

export default function MapScreen() {
  const mapRef = useRef<KakaoMapViewHandle>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [places, setPlaces] = useState<any[]>([]);

  const handleMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'PLACES_RESULT') {
      setPlaces(data.places);
    }
  };

  const handleCategoryPress = (code: string) => {
    setSelectedCategory(code);
    mapRef.current?.searchCategory(code);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.categoryBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.code}
              style={[styles.categoryButton, selectedCategory === category.code && styles.categoryButtonActive]}
              onPress={() => handleCategoryPress(category.code)}
            >
              <Text
                style={[styles.categoryText, selectedCategory === category.code && styles.categoryTextActive]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.mapContainer}>
        <KakaoMapView ref={mapRef} onMessage={handleMessage} />
        {selectedCategory ? (
          <View style={styles.infoBox}>
            <Text style={styles.countText}>
              {CATEGORIES.find((c) => c.code === selectedCategory)?.label} {places.length}곳 발견
            </Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  categoryBar: {
    backgroundColor: 'white',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  categoryList: {
    paddingHorizontal: 12,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f2f2f2',
  },
  categoryButtonActive: {
    backgroundColor: '#3B82F6',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  categoryTextActive: {
    color: 'white',
  },
  mapContainer: { flex: 1 },
  infoBox: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  countText: { fontSize: 12, color: '#666' },
});
