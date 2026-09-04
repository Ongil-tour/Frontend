import { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BottomSheet from '@gorhom/bottom-sheet';
import KakaoMapView, { KakaoMapViewHandle } from '../../components/map/KakaoMapView';
import PlacePreviewCard from '../../components/map/PlacePreviewCard';
import PlaceListSheet from '../../components/map/PlaceListSheet';
import BottomTabBar from '../../components/common/BottomTabBar';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { RootStackParamList } from '../../navigation/types';
import { KakaoPlace } from '../../types/place';
import { GREEN, DARK } from '../../constants/colors';
import { useSettingStore } from '../../stores/useSettingStore';

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
  const { isDark } = useSettingStore();

  const colors = {
    background: isDark ? DARK.background : GREEN.screenBg,
    surface: isDark ? DARK.card : '#FFFFFF',
    surfaceBorder: isDark ? DARK.border : GREEN.border,
    text: isDark ? DARK.text : '#222222',
    subText: isDark ? DARK.subText : '#666666',
    placeholder: isDark ? '#8A8A8A' : '#999999',
  };

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="어디로 가고 싶으신가요?"
          placeholderTextColor={colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
      </View>
      <View style={[styles.categoryBar, { backgroundColor: colors.background, borderBottomColor: colors.surfaceBorder }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                { backgroundColor: colors.surface },
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => handleCategoryPress(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: colors.text },
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.mapContainer}>
        <KakaoMapView ref={mapRef} onMessage={handleMessage} />
        <View style={styles.radiusOverlay}>
          {RADIUS_OPTIONS.map((km) => (
            <TouchableOpacity
              key={km}
              style={[
                styles.radiusButton,
                { backgroundColor: colors.surface },
                selectedRadiusKm === km && styles.radiusButtonActive,
              ]}
              onPress={() => handleRadiusPress(km)}
            >
              <Text
                style={[
                  styles.radiusText,
                  { color: colors.text },
                  selectedRadiusKm === km && styles.radiusTextActive,
                ]}
              >
                {km}km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={[styles.zoomControls, { backgroundColor: colors.surface }]}>
          <TouchableOpacity style={styles.zoomButton} onPress={() => mapRef.current?.zoomIn()}>
            <Text style={[styles.zoomButtonText, { color: colors.text }]}>+</Text>
          </TouchableOpacity>
          <View style={[styles.zoomDivider, { backgroundColor: colors.surfaceBorder }]} />
          <TouchableOpacity style={styles.zoomButton} onPress={() => mapRef.current?.zoomOut()}>
            <Text style={[styles.zoomButtonText, { color: colors.text }]}>−</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.locateButton, { backgroundColor: colors.surface }]} onPress={handleLocatePress}>
          <Text style={styles.locateButtonText}>◎</Text>
        </TouchableOpacity>
        <PlaceListSheet
          ref={listSheetRef}
          category={selectedCategory ? RESULT_LABELS[selectedCategory] ?? selectedCategory : null}
          places={places}
          onItemPress={handleListItemPress}
          onClose={() => setSelectedCategory(null)}
        />
      </View>
      <BottomTabBar activeTab="explore" hidden={!!selectedPlace} />
      {/* 탭바 예약 공간까지 포함해 화면 끝까지 쓰도록 mapContainer 밖에 오버레이.
          탭바가 사라진 상태(장소 선택 중)에서만 실제로 보임 */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <PlacePreviewCard
          ref={previewSheetRef}
          place={selectedPlace}
          onDetailPress={handleDetailPress}
          onClose={() => setSelectedPlace(null)}
          onRequestClose={() => previewSheetRef.current?.close()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  categoryBar: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  categoryList: {
    paddingHorizontal: 12,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryButtonActive: {
    backgroundColor: GREEN.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: 'white',
  },
  radiusOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  radiusButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  radiusButtonActive: {
    backgroundColor: GREEN.primary,
  },
  radiusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  radiusTextActive: {
    color: 'white',
  },
  mapContainer: { flex: 1 },
  zoomControls: {
    position: 'absolute',
    top: 16,
    right: 16,
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
  zoomButtonText: { fontSize: 20, fontWeight: '600' },
  zoomDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 8,
  },
  locateButton: {
    position: 'absolute',
    top: 108,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  locateButtonText: { fontSize: 20, color: GREEN.primary },
});
