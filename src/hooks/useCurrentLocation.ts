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
    const pos = await Location.getCurrentPositionAsync({});
    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    setLocation(coords);
    return coords;
  }, []);

  return { location, error, getCurrentLocation };
}
