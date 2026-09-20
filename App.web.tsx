import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';

const queryClient = new QueryClient();

// 화면들이 전부 모바일 폭 기준으로 만들어져 있어서, 데스크톱 넓은 창에서 그냥 풀스크린으로
// 늘리면 UI가 다 깨진다. 대신 실제 폰처럼 보이는 카드 안에 앱을 담아 중앙에 띄운다.
// 창이 이미 폰 폭이면(모바일 브라우저 등) 카드 없이 그대로 꽉 채운다.
const PHONE_MAX_WIDTH = 430;
const PHONE_MAX_HEIGHT = 900;
const NARROW_BREAKPOINT = 560;

export default function App() {
  const { width, height } = useWindowDimensions();
  const isNarrow = width < NARROW_BREAKPOINT;

  const frameStyle = isNarrow
    ? styles.frameFull
    : [
        styles.frameCard,
        {
          width: Math.min(width * 0.94, PHONE_MAX_WIDTH),
          height: Math.min(height * 0.94, PHONE_MAX_HEIGHT),
        },
      ];

  return (
    <View style={[styles.backdrop, isNarrow && styles.backdropNarrow]}>
      <View style={frameStyle}>
        <GestureHandlerRootView style={styles.flexFill}>
          <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            </QueryClientProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    minHeight: '100vh' as unknown as number,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E7E9E7',
  },
  backdropNarrow: {
    backgroundColor: '#FFFFFF',
  },
  frameFull: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  frameCard: {
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
  },
  flexFill: { flex: 1 },
});
