import { useCallback } from 'react';
import { Platform } from 'react-native';

let isConfigured = false;

// 구글 네이티브 SDK로 로그인해서 idToken만 뽑아준다. 이후 백엔드 검증은
// useSocialLoginMutation('google')이 idToken을 그대로 넘겨서 처리
//
// 'RNGoogleSignin' TurboModule을 이 패키지를 import하는 순간 native에서 찾는데,
// 지금 native 빌드에 등록이 안 되어 있어서 top-level import만으로도 앱 전체가 죽는다.
// 그래서 실제로 로그인 버튼을 눌렀을 때만 require 하도록 지연시켜 앱 나머지 기능은 살려둔다.
export function useGoogleSignIn() {
  const signIn = useCallback(async () => {
    const { GoogleSignin, isSuccessResponse } = require('@react-native-google-signin/google-signin');

    if (!isConfigured) {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      });
      isConfigured = true;
    }
    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response) || !response.data.idToken) {
      return null;
    }
    return response.data.idToken;
  }, []);

  return { signIn };
}
