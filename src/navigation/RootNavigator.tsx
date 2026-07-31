import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from '../screens/map/MapScreen';
import PlaceDetailScreen from '../screens/map/PlaceDetailScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} options={{ title: '상세 정보' }} />
    </Stack.Navigator>
  );
}
