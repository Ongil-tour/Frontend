import { useCallback, useState } from 'react';
import * as Location from 'expo-location';

export function useCurrentLocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(async () => {
    setError(null);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('위치 권한이 필요합니다.');
      return null;
    }
    try {
      const pos = await Location.getCurrentPositionAsync({});
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setLocation(coords);
      return coords;
    } catch {
      setError('현재 위치를 확인할 수 없습니다. 위치 서비스(GPS)가 켜져 있는지 확인해주세요.');
      return null;
    }
  }, []);

  return { location, error, getCurrentLocation };
}
