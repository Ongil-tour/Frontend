import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from '../screens/map/MapScreen';
import PlaceDetailScreen from '../screens/map/PlaceDetailScreen';
import MyPageScreen from '../screens/mypage/MyPageScreen';
import PlaceStorageScreen from '../screens/mypage/PlaceStorageScreen';
import SettingScreen from '../screens/mypage/SettingScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{ headerShown: false, animation: 'fade' }}
      />
      <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} options={{ title: '상세 정보' }} />
      <Stack.Screen
        name="PlaceStorage"
        component={PlaceStorageScreen}
        options={{ headerShown: false, animation: 'fade' }}
      />
      <Stack.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{ headerShown: false, animation: 'fade' }}
      />
      <Stack.Screen name="Setting" component={SettingScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
