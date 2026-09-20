import { useRef, useCallback } from 'react';
import type { WebView } from 'react-native-webview';

export function useKakaoPlacesSearch() {
  const webViewRef = useRef<WebView>(null);

  const search = useCallback((keyword: string) => {
    webViewRef.current?.postMessage(JSON.stringify({ type: 'SEARCH', keyword }));
  }, []);

  return { webViewRef, search };
}
