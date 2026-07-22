import { StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useState } from 'react';

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
    var geocoder = new kakao.maps.services.Geocoder();
    var markers = [];

    function clearMarkers() {
      markers.forEach(function(m) { m.setMap(null); });
      markers = [];
    }

    // 클릭한 좌표 주변 장소를 카테고리로 검색 (예: 음식점 FD6)
    function searchNearbyPlaces(lat, lng) {
      var callback = function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
          clearMarkers();
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
            places: placeList
          }));
        }
      };

      places.categorySearch('FD6', callback, {
        location: new kakao.maps.LatLng(lat, lng),
        radius: 300
      });
    }

    // 클릭한 좌표를 주소로 변환 (역geocoding)
    function getAddressFromCoords(lat, lng) {
      geocoder.coord2Address(lng, lat, function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
          var addr = result[0].address ? result[0].address.address_name : '';
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'ADDRESS_RESULT',
            address: addr,
            lat: lat,
            lng: lng
          }));
        }
      });
    }

    kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
      var latlng = mouseEvent.latLng;
      var lat = latlng.getLat();
      var lng = latlng.getLng();
      getAddressFromCoords(lat, lng);
      searchNearbyPlaces(lat, lng);
    });
  </script>
</body>
</html>
`;

export default function App() {
  const [address, setAddress] = useState('');
  const [places, setPlaces] = useState<any[]>([]);

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: mapHtml, baseUrl: 'https://localhost' }}
        style={styles.map}
        onMessage={(event) => {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === 'ADDRESS_RESULT') {
            setAddress(data.address);
          }
          if (data.type === 'PLACES_RESULT') {
            setPlaces(data.places);
            console.log('주변 음식점:', data.places);
          }
        }}
      />
      {address ? (
        <View style={styles.infoBox}>
          <Text style={styles.addressText}>{address}</Text>
          <Text style={styles.countText}>주변 음식점 {places.length}곳 발견</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
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
  addressText: { fontSize: 14, fontWeight: '600' },
  countText: { fontSize: 12, color: '#666', marginTop: 4 },
});