import { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BottomSheet from '@gorhom/bottom-sheet';
import KakaoMapView, { KakaoMapViewHandle } from '../../components/map/KakaoMapView';
import PlacePreviewCard from '../../components/map/PlacePreviewCard';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { RootStackParamList } from '../../navigation/types';
import { KakaoPlace } from '../../types/place';

const CATEGORIES = [
  { label: '음식점', code: 'FD6' },
  { label: '카페', code: 'CE7' },
  { label: '숙소', code: 'AD5' },
  { label: '관광지', code: 'AT4' },
  { label: '병원', code: 'HP8' },
  { label: '편의점', code: 'CS2' },
];

const RESULT_LABELS: Record<string, string> = {
  SEARCH: '검색결과',
  ...Object.fromEntries(CATEGORIES.map((c) => [c.code, c.label])),
};

export default function MapScreen() {
  const mapRef = useRef<KakaoMapViewHandle>(null);
  const previewSheetRef = useRef<BottomSheet>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<KakaoPlace | null>(null);
  const { getCurrentLocation } = useCurrentLocation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Map'>>();

  const handleMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'PLACES_RESULT') {
      setSelectedCategory(data.category);
      setPlaces(data.places);
    }
    if (data.type === 'MARKER_CLICK' || data.type === 'MAP_CLICK') {
      setSelectedPlace(data.place);
      previewSheetRef.current?.expand();
    }
  };

  const handleCategoryPress = (code: string) => {
    mapRef.current?.searchCategory(code);
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    mapRef.current?.searchKeyword(searchQuery.trim());
  };

  const handleDetailPress = (place: KakaoPlace) => {
    navigation.navigate('PlaceDetail', { place });
  };

  const handleLocatePress = async () => {
    const coords = await getCurrentLocation();
    if (!coords) {
      Alert.alert('위치 권한 필요', '설정에서 위치 권한을 허용해주세요.');
      return;
    }
    mapRef.current?.showCurrentLocation(coords.lat, coords.lng);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="어디로 가고 싶으신가요?"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
      </View>
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
        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.zoomButton} onPress={() => mapRef.current?.zoomIn()}>
            <Text style={styles.zoomButtonText}>+</Text>
          </TouchableOpacity>
          <View style={styles.zoomDivider} />
          <TouchableOpacity style={styles.zoomButton} onPress={() => mapRef.current?.zoomOut()}>
            <Text style={styles.zoomButtonText}>−</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.locateButton} onPress={handleLocatePress}>
          <Text style={styles.locateButtonText}>◎</Text>
        </TouchableOpacity>
        {selectedCategory ? (
          <View style={styles.infoBox}>
            <Text style={styles.countText}>
              {RESULT_LABELS[selectedCategory] ?? selectedCategory} {places.length}곳 발견
            </Text>
          </View>
        ) : null}
        <PlacePreviewCard
          ref={previewSheetRef}
          place={selectedPlace}
          onDetailPress={handleDetailPress}
          onClose={() => setSelectedPlace(null)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f2f2f2',
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#333', padding: 0 },
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
  zoomControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  zoomButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomButtonText: { fontSize: 20, fontWeight: '600', color: '#333' },
  zoomDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e5e5e5',
    marginHorizontal: 8,
  },
  locateButton: {
    position: 'absolute',
    top: 108,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  locateButtonText: { fontSize: 20, color: '#3B82F6' },
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
