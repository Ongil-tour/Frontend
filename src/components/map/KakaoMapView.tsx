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
    html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; }
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
    var markers = [];

    function clearMarkers() {
      markers.forEach(function(m) { m.setMap(null); });
      markers = [];
    }

    function searchCategory(code) {
      var center = map.getCenter();
      places.categorySearch(code, function(result, status) {
        clearMarkers();
        if (status === kakao.maps.services.Status.OK) {
          var placeList = result.map(function(place) {
            var marker = new kakao.maps.Marker({
              position: new kakao.maps.LatLng(place.y, place.x),
              map: map
            });
            markers.push(marker);
            return {
              name: place.place_name,
              address: place.road_address_name || place.address_name,
              category: place.category_name,
              phone: place.phone,
              lat: place.y,
              lng: place.x
            };
          });
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
  </script>
</body>
</html>
`;

export interface KakaoMapViewHandle {
  searchCategory: (code: string) => void;
}

interface Props {
  onMessage: (event: WebViewMessageEvent) => void;
}

function KakaoMapView({ onMessage }: Props, ref: React.Ref<KakaoMapViewHandle>) {
  const webViewRef = useRef<WebView>(null);

  useImperativeHandle(ref, () => ({
    searchCategory: (code: string) => {
      webViewRef.current?.injectJavaScript(`searchCategory('${code}'); true;`);
    },
  }));

  return (
    <WebView
      ref={webViewRef}
      originWhitelist={['*']}
      source={{ html: mapHtml, baseUrl: 'https://localhost' }}
      style={styles.map}
      onMessage={onMessage}
    />
  );
}

export default forwardRef(KakaoMapView);

const styles = StyleSheet.create({
  map: { flex: 1 },
});
