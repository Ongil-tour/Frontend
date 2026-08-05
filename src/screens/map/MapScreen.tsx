import { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BottomSheet from '@gorhom/bottom-sheet';
import KakaoMapView, { KakaoMapViewHandle } from '../../components/map/KakaoMapView';
import PlacePreviewCard from '../../components/map/PlacePreviewCard';
import PlaceListSheet from '../../components/map/PlaceListSheet';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { RootStackParamList } from '../../navigation/types';
import { KakaoPlace } from '../../types/place';

// 백엔드 GET /map/markers가 받는 카테고리 값 그대로
const CATEGORIES = ['관광지', '식당', '카페', '숙소', '편의점', '병원'];

// 백엔드 GET /facilities/nearby가 허용하는 반경(km)과 동일
const RADIUS_OPTIONS = [1, 3, 5];

const RESULT_LABELS: Record<string, string> = {
  SEARCH: '검색결과',
};

export default function MapScreen() {
  const mapRef = useRef<KakaoMapViewHandle>(null);
  const previewSheetRef = useRef<BottomSheet>(null);
  const listSheetRef = useRef<BottomSheet>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [places, setPlaces] = useState<KakaoPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<KakaoPlace | null>(null);
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number | null>(null);
  const { location: userLocation, getCurrentLocation } = useCurrentLocation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Map'>>();

  const handleMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'PLACES_RESULT') {
      setSelectedCategory(data.category);
      setPlaces(data.places);
      previewSheetRef.current?.close();
      listSheetRef.current?.snapToIndex(0);
    }
    if (data.type === 'MARKER_CLICK' || data.type === 'MAP_CLICK') {
      setSelectedPlace(data.place);
      listSheetRef.current?.close();
      previewSheetRef.current?.expand();
    }
  };

  const runCategorySearch = (category: string, origin?: { lat: number; lng: number; radiusM: number }) => {
    mapRef.current?.searchFacilityCategory(category, origin);
  };

  const handleCategoryPress = (category: string) => {
    const origin =
      selectedRadiusKm != null && userLocation
        ? { lat: userLocation.lat, lng: userLocation.lng, radiusM: selectedRadiusKm * 1000 }
        : undefined;
    runCategorySearch(category, origin);
  };

  const handleRadiusPress = async (km: number) => {
    if (selectedRadiusKm === km) {
      setSelectedRadiusKm(null);
      return;
    }
    const coords = await getCurrentLocation();
    if (!coords) {
      Alert.alert('위치 권한 필요', '설정에서 위치 권한을 허용해주세요.');
      return;
    }
    setSelectedRadiusKm(km);
    mapRef.current?.showRadiusCircle(coords.lat, coords.lng, km * 1000);
    if (selectedCategory) {
      runCategorySearch(selectedCategory, { lat: coords.lat, lng: coords.lng, radiusM: km * 1000 });
    }
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    mapRef.current?.searchKeyword(searchQuery.trim());
  };

  const handleDetailPress = (place: KakaoPlace) => {
    navigation.navigate('PlaceDetail', { place });
  };

  const handleListItemPress = (place: KakaoPlace) => {
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
              key={category}
              style={[styles.categoryButton, selectedCategory === category && styles.categoryButtonActive]}
              onPress={() => handleCategoryPress(category)}
            >
              <Text
                style={[styles.categoryText, selectedCategory === category && styles.categoryTextActive]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.radiusBar}>
        {RADIUS_OPTIONS.map((km) => (
          <TouchableOpacity
            key={km}
            style={[styles.radiusButton, selectedRadiusKm === km && styles.radiusButtonActive]}
            onPress={() => handleRadiusPress(km)}
          >
            <Text style={[styles.radiusText, selectedRadiusKm === km && styles.radiusTextActive]}>
              {km}km
            </Text>
          </TouchableOpacity>
        ))}
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
        <PlacePreviewCard
          ref={previewSheetRef}
          place={selectedPlace}
          onDetailPress={handleDetailPress}
          onClose={() => setSelectedPlace(null)}
        />
        <PlaceListSheet
          ref={listSheetRef}
          category={selectedCategory ? RESULT_LABELS[selectedCategory] ?? selectedCategory : null}
          places={places}
          onItemPress={handleListItemPress}
          onClose={() => setSelectedCategory(null)}
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
  radiusBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  radiusButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f2f2f2',
  },
  radiusButtonActive: {
    backgroundColor: '#3B82F6',
  },
  radiusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  radiusTextActive: {
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
});
