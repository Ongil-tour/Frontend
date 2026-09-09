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

    var GREEN_PIN_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="38" viewBox="0 0 28 38">' +
      '<path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 24 14 24s14-13.5 14-24C28 6.268 21.732 0 14 0z" fill="#22A45D"/>' +
      '<circle cx="14" cy="14" r="5" fill="white"/>' +
      '</svg>';
    var markerImage = new kakao.maps.MarkerImage(
      'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(GREEN_PIN_SVG),
      new kakao.maps.Size(28, 38),
      { offset: new kakao.maps.Point(14, 38) }
    );

    function clearMarkers() {
      markers.forEach(function(m) { m.setMap(null); });
      markers = [];
    }

    function addMarkerAt(data) {
      var marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(data.lat, data.lng),
        image: markerImage,
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

    // match-by-location 응답으로 camelCase가 확인됐지만(2026-08-05), /map/markers 자체는
    // 아직 CORS 때문에 실제 응답을 못 봤음. camelCase/snake_case 둘 다 방어적으로 읽고,
    // 확인되면 한쪽으로 정리할 것.
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
        source: item.source,
        accessibility: {
          wheelchairAccessible: item.wheelchairAccessible ?? item.wheelchair_accessible,
          disabledRestroom: item.disabledRestroom ?? item.disabled_restroom,
          parkingLot: item.parkingLot ?? item.disabledParking ?? item.disabled_parking,
          elevator: item.elevator,
          petFriendly: item.petFriendly ?? item.pet_friendly,
          nursingRoom: item.nursingRoom ?? item.nursing_room
        }
      };
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
          renderItems(items || []);
        })
        .catch(function() {
          renderItems([]);
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
        content: '<div style="width:16px;height:16px;border-radius:50%;background:#22A45D;border:3px solid white;box-shadow:0 0 0 2px rgba(34,164,93,0.35),0 1px 4px rgba(0,0,0,0.35);"></div>',
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
        strokeColor: '#22A45D',
        strokeOpacity: 0.5,
        fillColor: '#22A45D',
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

    // 지도 클릭당 카테고리 수만큼 API 호출이 나가므로, 이 앱과 관련 없거나
    // (학원/부동산처럼) 밀집도가 높아 엉뚱한 최근접 결과를 만드는 카테고리는 뺐다.
    var CLICK_CATEGORY_CODES = [
      'MT1', 'CS2', 'PK6', 'SW8', 'PO3',
      'CT1', 'AT4', 'AD5', 'FD6', 'CE7', 'HP8', 'PM9'
    ];
    var CLICK_SEARCH_RADIUS = 50;
    // 이전 클릭의 카테고리 검색이 아직 안 끝났으면 새 클릭을 무시해서
    // API 호출이 겹겹이 쌓이는 것과, 응답이 뒤섞여 옛날 클릭 결과가
    // 나중에 화면에 뜨는 것을 함께 막는다.
    var findNearestPoiInFlight = false;

    function findNearestPoi(lat, lng, callback) {
      var center = new kakao.maps.LatLng(lat, lng);
      var pending = CLICK_CATEGORY_CODES.length;
      var nearestPlace = null;
      var nearestDistance = Infinity;
      var settled = false;
      var timeoutId;

      function finish() {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        findNearestPoiInFlight = false;
        callback(nearestPlace);
      }

      findNearestPoiInFlight = true;
      // 콜백이 하나라도 안 돌아오면(백그라운드 전환 등으로 유실) pending이 0에
      // 못 닿아 가드가 영원히 잠길 수 있어, 타임아웃으로 강제 해제한다.
      timeoutId = setTimeout(finish, 8000);

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
            finish();
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
      if (findNearestPoiInFlight) return;

      var latlng = mouseEvent.latLng;
      var lat = latlng.getLat();
      var lng = latlng.getLng();

      if (clickMarker) {
        clickMarker.setMap(null);
      }
      clickMarker = new kakao.maps.Marker({ position: latlng, image: markerImage, map: map });

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
      source={{ html: mapHtml, baseUrl: 'http://localhost' }}
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
