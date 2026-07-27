import { forwardRef, useImperativeHandle, useRef } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { StyleSheet } from 'react-native';

const KAKAO_JS_KEY = process.env.EXPO_PUBLIC_KAKAO_JS_KEY;

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

    function clearMarkers() {
      markers.forEach(function(m) { m.setMap(null); });
      markers = [];
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
      var data = toPlaceData(place);
      var marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(place.y, place.x),
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

    function searchCategory(code) {
      var center = map.getCenter();
      places.categorySearch(code, function(result, status) {
        clearMarkers();
        if (status === kakao.maps.services.Status.OK) {
          var placeList = result.map(addMarker);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'PLACES_RESULT',
            category: code,
            places: placeList
          }));
        } else {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'PLACES_RESULT',
            category: code,
            places: []
          }));
        }
      }, {
        location: center,
        radius: 1000,
        sort: kakao.maps.services.SortBy.DISTANCE
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
  searchCategory: (code: string) => void;
  searchKeyword: (keyword: string) => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

interface Props {
  onMessage: (event: WebViewMessageEvent) => void;
}

function KakaoMapView({ onMessage }: Props, ref: React.Ref<KakaoMapViewHandle>) {
  const webViewRef = useRef<WebView>(null);

  useImperativeHandle(ref, () => ({
    searchCategory: (code: string) => {
      webViewRef.current?.injectJavaScript(`searchCategory(${JSON.stringify(code)}); true;`);
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
    />
  );
}

export default forwardRef(KakaoMapView);

const styles = StyleSheet.create({
  map: { flex: 1 },
});
