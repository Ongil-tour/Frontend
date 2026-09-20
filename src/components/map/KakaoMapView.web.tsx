import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import type { WebViewMessageEvent } from 'react-native-webview';

// 네이티브 버전(KakaoMapView.tsx)은 WebView 안에 지도를 HTML/JS로 통째로 넣고
// postMessage로 통신하지만, 웹에서는 애초에 브라우저 안이라 그 다리가 필요 없다 -
// 카카오맵 JS SDK를 페이지에 직접 붙이고 kakao.maps.* API를 그냥 바로 호출한다.
// 부모(MapScreen.tsx)는 두 버전을 구분하지 않으므로, onMessage로 넘기는 이벤트 모양과
// KakaoMapViewHandle 시그니처를 네이티브 버전과 동일하게 맞춘다.
const KAKAO_JS_KEY = process.env.EXPO_PUBLIC_KAKAO_JS_KEY;
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

declare global {
  interface Window {
    kakao?: any;
  }
}

let kakaoSdkPromise: Promise<void> | null = null;
function loadKakaoSdk(): Promise<void> {
  if (window.kakao?.maps) return Promise.resolve();
  if (!kakaoSdkPromise) {
    kakaoSdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=services&autoload=false`;
      script.onload = () => {
        if (!window.kakao?.maps) {
          reject(new Error('카카오맵 SDK가 초기화되지 않았습니다 (앱키의 웹 플랫폼 도메인 등록 여부를 확인하세요)'));
          return;
        }
        window.kakao.maps.load(() => resolve());
      };
      script.onerror = () => reject(new Error('카카오맵 SDK 스크립트 로드 실패 (네트워크 또는 앱키 문제)'));
      document.head.appendChild(script);
    });
  }
  return kakaoSdkPromise;
}

const GREEN_PIN_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="38" viewBox="0 0 28 38">' +
  '<path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 24 14 24s14-13.5 14-24C28 6.268 21.732 0 14 0z" fill="#22A45D"/>' +
  '<circle cx="14" cy="14" r="5" fill="white"/>' +
  '</svg>';

// 지도 클릭당 카테고리 수만큼 API 호출이 나가므로, 이 앱과 관련 없거나
// (학원/부동산처럼) 밀집도가 높아 엉뚱한 최근접 결과를 만드는 카테고리는 뺐다.
// (네이티브 버전과 동일 - KakaoMapView.tsx 주석 참고)
const CLICK_CATEGORY_CODES = ['MT1', 'CS2', 'PK6', 'SW8', 'PO3', 'CT1', 'AT4', 'AD5', 'FD6', 'CE7', 'HP8', 'PM9'];
const CLICK_SEARCH_RADIUS = 50;

function toPlaceData(place: any) {
  return {
    id: place.id,
    name: place.place_name,
    address: place.road_address_name || place.address_name,
    category: place.category_name,
    phone: place.phone,
    lat: place.y,
    lng: place.x,
    distance: place.distance ? Math.round((place.distance / 1000) * 10) / 10 : null,
  };
}

function toFacilityPlaceData(item: any, distanceKm: number) {
  return {
    id: item.id,
    name: item.name,
    address: item.address,
    category: item.category,
    phone: item.phone,
    lat: item.lat,
    lng: item.lng,
    distance: distanceKm,
    source: item.source,
    accessibility: {
      wheelchairAccessible: item.wheelchairAccessible ?? item.wheelchair_accessible,
      disabledRestroom: item.disabledRestroom ?? item.disabled_restroom,
      parkingLot: item.parkingLot ?? item.disabledParking ?? item.disabled_parking,
      elevator: item.elevator,
      petFriendly: item.petFriendly ?? item.pet_friendly,
      nursingRoom: item.nursingRoom ?? item.nursing_room,
    },
  };
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export interface KakaoMapViewHandle {
  searchFacilityCategory: (category: string, origin?: { lat: number; lng: number; radiusM: number }) => void;
  searchKeyword: (keyword: string) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  showCurrentLocation: (lat: number, lng: number) => void;
}

interface Props {
  onMessage: (event: WebViewMessageEvent) => void;
}

function emit(onMessage: Props['onMessage'], payload: unknown) {
  onMessage({ nativeEvent: { data: JSON.stringify(payload) } } as WebViewMessageEvent);
}

function KakaoMapView({ onMessage }: Props, ref: React.Ref<KakaoMapViewHandle>) {
  const containerRef = useRef<View>(null);
  const mapRef = useRef<any>(null);
  const placesRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const markerImageRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const clickMarkerRef = useRef<any>(null);
  const currentLocationOverlayRef = useRef<any>(null);
  const findNearestPoiInFlightRef = useRef(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadKakaoSdk()
      .then(() => {
        if (cancelled) return;
        const kakao = window.kakao;
        // react-native-web에서 View의 ref는 실제 DOM 엘리먼트를 그대로 가리킨다.
        const container = containerRef.current as unknown as HTMLElement;

        const map = new kakao.maps.Map(container, {
          center: new kakao.maps.LatLng(37.5665, 126.978),
          level: 5,
        });
        const places = new kakao.maps.services.Places();
        const geocoder = new kakao.maps.services.Geocoder();
        const markerImage = new kakao.maps.MarkerImage(
          'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(GREEN_PIN_SVG),
          new kakao.maps.Size(28, 38),
          { offset: new kakao.maps.Point(14, 38) }
        );

        mapRef.current = map;
        placesRef.current = places;
        geocoderRef.current = geocoder;
        markerImageRef.current = markerImage;

        function addMarkerAt(data: any) {
          const marker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(data.lat, data.lng),
            image: markerImage,
            map,
          });
          kakao.maps.event.addListener(marker, 'click', () => {
            emit(onMessage, { type: 'MARKER_CLICK', place: data });
          });
          markersRef.current.push(marker);
          return data;
        }

        function clearMarkers() {
          markersRef.current.forEach((m) => m.setMap(null));
          markersRef.current = [];
        }
        // zoomIn/zoomOut/searchKeyword/searchFacilityCategory/showCurrentLocation에서 쓸 수 있도록
        // 인스턴스에 매달아둔다 (useImperativeHandle 쪽에서 mapRef를 통해 접근).
        map.__clearMarkers = clearMarkers;
        map.__addMarkerAt = addMarkerAt;

        function reportAddressAt(lat: number, lng: number) {
          geocoder.coord2Address(lng, lat, (result: any, status: any) => {
            if (status === kakao.maps.services.Status.OK) {
              const addressInfo = result[0].road_address || result[0].address;
              const addressName = addressInfo ? addressInfo.address_name : '';
              emit(onMessage, {
                type: 'MAP_CLICK',
                place: {
                  id: null,
                  name: addressName || '선택한 위치',
                  category: '선택한 위치',
                  address: addressName,
                  phone: '',
                  lat,
                  lng,
                  distance: null,
                },
              });
            }
          });
        }

        function findNearestPoi(lat: number, lng: number, callback: (place: any) => void) {
          const center = new kakao.maps.LatLng(lat, lng);
          let pending = CLICK_CATEGORY_CODES.length;
          let nearestPlace: any = null;
          let nearestDistance = Infinity;
          let settled = false;
          let timeoutId: ReturnType<typeof setTimeout>;

          function finish() {
            if (settled) return;
            settled = true;
            clearTimeout(timeoutId);
            findNearestPoiInFlightRef.current = false;
            callback(nearestPlace);
          }

          findNearestPoiInFlightRef.current = true;
          // 콜백이 하나라도 안 돌아오면 pending이 0에 못 닿아 가드가 영원히 잠길 수 있어,
          // 타임아웃으로 강제 해제한다 (네이티브 버전과 동일).
          timeoutId = setTimeout(finish, 8000);

          CLICK_CATEGORY_CODES.forEach((code) => {
            places.categorySearch(
              code,
              (result: any, status: any) => {
                if (status === kakao.maps.services.Status.OK && result.length > 0) {
                  const candidate = result[0];
                  const distance = Number(candidate.distance);
                  if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestPlace = candidate;
                  }
                }
                pending -= 1;
                if (pending <= 0) finish();
              },
              { location: center, radius: CLICK_SEARCH_RADIUS, sort: kakao.maps.services.SortBy.DISTANCE }
            );
          });
        }

        kakao.maps.event.addListener(map, 'click', (mouseEvent: any) => {
          if (findNearestPoiInFlightRef.current) return;

          const latlng = mouseEvent.latLng;
          const lat = latlng.getLat();
          const lng = latlng.getLng();

          if (clickMarkerRef.current) {
            clickMarkerRef.current.setMap(null);
          }
          clickMarkerRef.current = new kakao.maps.Marker({ position: latlng, image: markerImage, map });

          findNearestPoi(lat, lng, (nearestPlace) => {
            if (nearestPlace) {
              emit(onMessage, { type: 'MAP_CLICK', place: toPlaceData(nearestPlace) });
            } else {
              reportAddressAt(lat, lng);
            }
          });
        });

        setIsMapReady(true);
      })
      .catch((err: Error) => {
        if (!cancelled) setErrorMessage(err.message);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    searchFacilityCategory: (category: string, origin?: { lat: number; lng: number; radiusM: number }) => {
      const map = mapRef.current;
      const places = placesRef.current;
      if (!map || !places) return;
      const centerLat = origin ? origin.lat : map.getCenter().getLat();
      const centerLng = origin ? origin.lng : map.getCenter().getLng();
      const effectiveRadius = origin ? origin.radiusM : 1000;
      const url =
        `${API_BASE_URL}/map/markers?lat=${centerLat}&lng=${centerLng}` +
        `&radius_m=${effectiveRadius}&category=${encodeURIComponent(category)}`;

      fetch(url)
        .then((res) => res.json())
        .then((items) => items || [])
        .catch(() => [])
        .then((items: any[]) => {
          map.__clearMarkers();
          items.sort(
            (a, b) => haversineKm(centerLat, centerLng, a.lat, a.lng) - haversineKm(centerLat, centerLng, b.lat, b.lng)
          );
          const placeList = items.map((item) => {
            const distanceKm = haversineKm(centerLat, centerLng, item.lat, item.lng);
            return map.__addMarkerAt(toFacilityPlaceData(item, distanceKm));
          });
          emit(onMessage, { type: 'PLACES_RESULT', category, places: placeList });
        });
    },
    searchKeyword: (keyword: string) => {
      const map = mapRef.current;
      const places = placesRef.current;
      if (!map || !places) return;
      const kakao = window.kakao;
      places.keywordSearch(keyword, (result: any, status: any) => {
        map.__clearMarkers();
        if (status === kakao.maps.services.Status.OK) {
          const bounds = new kakao.maps.LatLngBounds();
          const placeList = result.map((place: any) => {
            bounds.extend(new kakao.maps.LatLng(place.y, place.x));
            return map.__addMarkerAt(toPlaceData(place));
          });
          map.setBounds(bounds);
          emit(onMessage, { type: 'PLACES_RESULT', category: 'SEARCH', places: placeList });
        } else {
          emit(onMessage, { type: 'PLACES_RESULT', category: 'SEARCH', places: [] });
        }
      });
    },
    zoomIn: () => {
      const map = mapRef.current;
      if (map) map.setLevel(map.getLevel() - 1);
    },
    zoomOut: () => {
      const map = mapRef.current;
      if (map) map.setLevel(map.getLevel() + 1);
    },
    showCurrentLocation: (lat: number, lng: number) => {
      const map = mapRef.current;
      const kakao = window.kakao;
      if (!map || !kakao) return;
      const position = new kakao.maps.LatLng(lat, lng);
      if (currentLocationOverlayRef.current) {
        currentLocationOverlayRef.current.setMap(null);
      }
      const overlay = new kakao.maps.CustomOverlay({
        position,
        content:
          '<div style="width:16px;height:16px;border-radius:50%;background:#22A45D;border:3px solid white;' +
          'box-shadow:0 0 0 2px rgba(34,164,93,0.35),0 1px 4px rgba(0,0,0,0.35);"></div>',
        zIndex: 10,
      });
      overlay.setMap(map);
      currentLocationOverlayRef.current = overlay;
      map.setCenter(position);
    },
  }));

  return (
    <View style={styles.container}>
      <View ref={containerRef} style={styles.map} />
      {!isMapReady && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          {errorMessage ? (
            <Text style={styles.loadingText}>지도를 불러오지 못했습니다{'\n'}{errorMessage}</Text>
          ) : (
            <>
              <ActivityIndicator size="large" color="#22A45D" />
              <Text style={styles.loadingText}>지도를 불러오는 중...</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
}

export default forwardRef(KakaoMapView);

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: { color: '#666666', fontSize: 14, textAlign: 'center' },
});
