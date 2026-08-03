import { forwardRef, useImperativeHandle, useRef } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { StyleSheet } from 'react-native';

const KAKAO_JS_KEY = process.env.EXPO_PUBLIC_KAKAO_JS_KEY;
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const mapHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=services"></script>
  <script>
    var map = new kakao.maps.Map(document.getElementById('map'), {
      center: new kakao.maps.LatLng(37.5665, 126.9780),
      level: 5
    });

    var places = new kakao.maps.services.Places();
    var geocoder = new kakao.maps.services.Geocoder();
    var markers = [];
    var clickMarker = null;
    var currentLocationOverlay = null;
    var API_BASE_URL = ${JSON.stringify(API_BASE_URL ?? '')};

    function clearMarkers() {
      markers.forEach(function(m) { m.setMap(null); });
      markers = [];
    }

    function addMarkerAt(data) {
      var marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(data.lat, data.lng),
        map: map
      });
      kakao.maps.event.addListener(marker, 'click', function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'MARKER_CLICK',
          place: data
        }));
      });
      markers.push(marker);
      return data;
    }

    function toPlaceData(place) {
      return {
        id: place.id,
        name: place.place_name,
        address: place.road_address_name || place.address_name,
        category: place.category_name,
        phone: place.phone,
        lat: place.y,
        lng: place.x,
        distance: place.distance ? Math.round((place.distance / 1000) * 10) / 10 : null
      };
    }

    function addMarker(place) {
      return addMarkerAt(toPlaceData(place));
    }

    function haversineKm(lat1, lng1, lat2, lng2) {
      var R = 6371;
      var dLat = (lat2 - lat1) * Math.PI / 180;
      var dLng = (lng2 - lng1) * Math.PI / 180;
      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.round(R * c * 10) / 10;
    }

    function toFacilityPlaceData(item, distanceKm) {
      return {
        id: item.id,
        name: item.name,
        address: item.address,
        category: item.category,
        phone: item.phone,
        lat: item.lat,
        lng: item.lng,
        distance: distanceKm,
        accessibility: {
          wheelchair_accessible: item.wheelchair_accessible,
          disabled_restroom: item.disabled_restroom,
          disabled_parking: item.disabled_parking,
          elevator: item.elevator,
          pet_friendly: item.pet_friendly,
          nursing_room: item.nursing_room
        }
      };
    }

    // TODO(demo): 백엔드 CORS/연동 확인되면 이 함수 통째로 지울 것.
    // 지금은 /map/markers 호출이 실패하거나(CORS) 결과가 비어있을 때 데모용 더미 데이터로
    // 대체해서, 카테고리 버튼 UI(마커+리스트시트+배지)가 동작하는 것만 먼저 보여준다.
    function buildDummyItems(category, centerLat, centerLng) {
      var names = ['숲속', '한빛', '모두의', '함께하는', '푸른'];
      return names.map(function(prefix, i) {
        return {
          id: 'dummy-' + category + '-' + i,
          name: prefix + ' ' + category,
          category: category,
          address: '서울 어딘가 ' + (i + 1) + '길 10',
          phone: '02-000-000' + i,
          lat: centerLat + (Math.random() - 0.5) * 0.01,
          lng: centerLng + (Math.random() - 0.5) * 0.01,
          wheelchair_accessible: i % 2 === 0,
          disabled_restroom: i % 3 !== 0,
          disabled_parking: i % 2 !== 0,
          elevator: i % 3 === 0,
          pet_friendly: i % 2 === 0,
          nursing_room: i % 4 === 0
        };
      });
    }

    // 백엔드 GET /map/markers — 내부 TourAPI DB(관광지/식당/카페/숙소/화장실/주차장)
    // + 카카오 실시간(편의점/병원)을 합쳐서 반환. 카테고리 버튼은 전부 이걸 탄다.
    // lat/lng/radiusM이 오면 그 좌표(반경 필터 선택 시 내 위치) 기준, 없으면 지도 중심+1km 기본값
    function searchFacilityCategory(category, lat, lng, radiusM) {
      var centerLat = lat != null ? lat : map.getCenter().getLat();
      var centerLng = lng != null ? lng : map.getCenter().getLng();
      var effectiveRadius = radiusM != null ? radiusM : 1000;
      var url = API_BASE_URL + '/map/markers?lat=' + centerLat + '&lng=' + centerLng +
        '&radius_m=' + effectiveRadius + '&category=' + encodeURIComponent(category);

      function renderItems(items) {
        clearMarkers();
        items.sort(function(a, b) {
          return haversineKm(centerLat, centerLng, a.lat, a.lng) - haversineKm(centerLat, centerLng, b.lat, b.lng);
        });
        var placeList = items.map(function(item) {
          var distanceKm = haversineKm(centerLat, centerLng, item.lat, item.lng);
          return addMarkerAt(toFacilityPlaceData(item, distanceKm));
        });
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'PLACES_RESULT',
          category: category,
          places: placeList
        }));
      }

      fetch(url)
        .then(function(res) { return res.json(); })
        .then(function(items) {
          renderItems(items && items.length > 0 ? items : buildDummyItems(category, centerLat, centerLng));
        })
        .catch(function() {
          renderItems(buildDummyItems(category, centerLat, centerLng));
        });
    }

    function searchKeyword(keyword) {
      places.keywordSearch(keyword, function(result, status) {
        clearMarkers();
        if (status === kakao.maps.services.Status.OK) {
          var bounds = new kakao.maps.LatLngBounds();
          var placeList = result.map(function(place) {
            bounds.extend(new kakao.maps.LatLng(place.y, place.x));
            return addMarker(place);
          });
          map.setBounds(bounds);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'PLACES_RESULT',
            category: 'SEARCH',
            places: placeList
          }));
        } else {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'PLACES_RESULT',
            category: 'SEARCH',
            places: []
          }));
        }
      });
    }

    function zoomIn() {
      map.setLevel(map.getLevel() - 1);
    }

    function zoomOut() {
      map.setLevel(map.getLevel() + 1);
    }

    function showCurrentLocation(lat, lng) {
      var position = new kakao.maps.LatLng(lat, lng);
      if (currentLocationOverlay) {
        currentLocationOverlay.setMap(null);
      }
      currentLocationOverlay = new kakao.maps.CustomOverlay({
        position: position,
        content: '<div style="width:16px;height:16px;border-radius:50%;background:#4285F4;border:3px solid white;box-shadow:0 0 0 2px rgba(66,133,244,0.35),0 1px 4px rgba(0,0,0,0.35);"></div>',
        zIndex: 10
      });
      currentLocationOverlay.setMap(map);
      map.setCenter(position);
    }

    var radiusCircle = null;
    var radiusCircleTimeout = null;

    function showRadiusCircle(lat, lng, radiusM) {
      if (radiusCircle) {
        radiusCircle.setMap(null);
      }
      if (radiusCircleTimeout) {
        clearTimeout(radiusCircleTimeout);
      }
      radiusCircle = new kakao.maps.Circle({
        center: new kakao.maps.LatLng(lat, lng),
        radius: radiusM,
        strokeWeight: 1,
        strokeColor: '#4285F4',
        strokeOpacity: 0.5,
        fillColor: '#4285F4',
        fillOpacity: 0.15
      });
      radiusCircle.setMap(map);
      radiusCircleTimeout = setTimeout(function() {
        if (radiusCircle) {
          radiusCircle.setMap(null);
          radiusCircle = null;
        }
      }, 2500);
    }

    var CLICK_CATEGORY_CODES = [
      'MT1', 'CS2', 'PS3', 'SC4', 'AC5', 'PK6', 'OL7', 'SW8', 'BK9',
      'CT1', 'AG2', 'PO3', 'AT4', 'AD5', 'FD6', 'CE7', 'HP8', 'PM9'
    ];
    var CLICK_SEARCH_RADIUS = 50;

    function findNearestPoi(lat, lng, callback) {
      var center = new kakao.maps.LatLng(lat, lng);
      var pending = CLICK_CATEGORY_CODES.length;
      var nearestPlace = null;
      var nearestDistance = Infinity;

      CLICK_CATEGORY_CODES.forEach(function(code) {
        places.categorySearch(code, function(result, status) {
          if (status === kakao.maps.services.Status.OK && result.length > 0) {
            var candidate = result[0];
            var distance = Number(candidate.distance);
            if (distance < nearestDistance) {
              nearestDistance = distance;
              nearestPlace = candidate;
            }
          }
          pending -= 1;
          if (pending <= 0) {
            callback(nearestPlace);
          }
        }, {
          location: center,
          radius: CLICK_SEARCH_RADIUS,
          sort: kakao.maps.services.SortBy.DISTANCE
        });
      });
    }

    function reportAddressAt(lat, lng) {
      geocoder.coord2Address(lng, lat, function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
          var addressInfo = result[0].road_address || result[0].address;
          var addressName = addressInfo ? addressInfo.address_name : '';
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'MAP_CLICK',
            place: {
              id: null,
              name: addressName || '선택한 위치',
              category: '선택한 위치',
              address: addressName,
              phone: '',
              lat: lat,
              lng: lng,
              distance: null
            }
          }));
        }
      });
    }

    kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
      var latlng = mouseEvent.latLng;
      var lat = latlng.getLat();
      var lng = latlng.getLng();

      if (clickMarker) {
        clickMarker.setMap(null);
      }
      clickMarker = new kakao.maps.Marker({ position: latlng, map: map });

      findNearestPoi(lat, lng, function(nearestPlace) {
        if (nearestPlace) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'MAP_CLICK',
            place: toPlaceData(nearestPlace)
          }));
        } else {
          reportAddressAt(lat, lng);
        }
      });
    });
  </script>
</body>
</html>
`;

export interface KakaoMapViewHandle {
  searchFacilityCategory: (category: string, origin?: { lat: number; lng: number; radiusM: number }) => void;
  searchKeyword: (keyword: string) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  showCurrentLocation: (lat: number, lng: number) => void;
  showRadiusCircle: (lat: number, lng: number, radiusM: number) => void;
}

interface Props {
  onMessage: (event: WebViewMessageEvent) => void;
}

function KakaoMapView({ onMessage }: Props, ref: React.Ref<KakaoMapViewHandle>) {
  const webViewRef = useRef<WebView>(null);

  useImperativeHandle(ref, () => ({
    searchFacilityCategory: (category: string, origin?: { lat: number; lng: number; radiusM: number }) => {
      const args = origin
        ? `${JSON.stringify(category)}, ${origin.lat}, ${origin.lng}, ${origin.radiusM}`
        : JSON.stringify(category);
      webViewRef.current?.injectJavaScript(`searchFacilityCategory(${args}); true;`);
    },
    searchKeyword: (keyword: string) => {
      webViewRef.current?.injectJavaScript(`searchKeyword(${JSON.stringify(keyword)}); true;`);
    },
    zoomIn: () => {
      webViewRef.current?.injectJavaScript('zoomIn(); true;');
    },
    zoomOut: () => {
      webViewRef.current?.injectJavaScript('zoomOut(); true;');
    },
    showCurrentLocation: (lat: number, lng: number) => {
      webViewRef.current?.injectJavaScript(`showCurrentLocation(${lat}, ${lng}); true;`);
    },
    showRadiusCircle: (lat: number, lng: number, radiusM: number) => {
      webViewRef.current?.injectJavaScript(`showRadiusCircle(${lat}, ${lng}, ${radiusM}); true;`);
    },
  }));

  return (
    <WebView
      ref={webViewRef}
      originWhitelist={['*']}
      source={{ html: mapHtml, baseUrl: 'https://localhost' }}
      style={styles.map}
      onMessage={onMessage}
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
      webviewDebuggingEnabled={__DEV__}
    />
  );
}

export default forwardRef(KakaoMapView);

const styles = StyleSheet.create({
  map: { flex: 1 },
});
