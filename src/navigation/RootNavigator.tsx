import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/useAuthStore';
import LoginScreen from '../screens/auth/LoginScreen';
import MapScreen from '../screens/map/MapScreen';
import PlaceDetailScreen from '../screens/map/PlaceDetailScreen';
import MyPageScreen from '../screens/mypage/MyPageScreen';
import PlaceStorageScreen from '../screens/mypage/PlaceStorageScreen';
import SettingScreen from '../screens/mypage/SettingScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {accessToken ? (
        <>
          <Stack.Screen name="Map" component={MapScreen} options={{ animation: 'fade' }} />
          <Stack.Screen
            name="PlaceDetail"
            component={PlaceDetailScreen}
            options={{ headerShown: true, title: '상세 정보' }}
          />
          <Stack.Screen name="PlaceStorage" component={PlaceStorageScreen} options={{ animation: 'fade' }} />
          <Stack.Screen name="MyPage" component={MyPageScreen} options={{ animation: 'fade' }} />
          <Stack.Screen name="Setting" component={SettingScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
