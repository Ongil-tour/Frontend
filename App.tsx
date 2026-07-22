import { SafeAreaProvider } from 'react-native-safe-area-context';
import MapScreen from './src/screens/map/MapScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <MapScreen />
    </SafeAreaProvider>
  );
}
