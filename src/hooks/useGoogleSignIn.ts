import { useCallback } from 'react';
import { Platform } from 'react-native';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

// 구글 네이티브 SDK로 로그인해서 idToken만 뽑아준다. 이후 백엔드 검증은
// useSocialLoginMutation('google')이 idToken을 그대로 넘겨서 처리
export function useGoogleSignIn() {
  const signIn = useCallback(async () => {
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
