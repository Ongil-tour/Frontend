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

  // 로그아웃/회원탈퇴 시 우리 앱 세션만 지우고 기기에 남은 구글 로그인 상태는
  // 그대로 둬서, 다음에 "Google로 계속하기"를 누르면 계정 선택 창 없이 같은
  // 계정으로 바로 재로그인(= 탈퇴 직후 자동 재가입)되던 문제. 실패해도
  // 로그아웃 자체를 막으면 안 되므로 항상 조용히 넘어간다.
  const signOut = useCallback(async () => {
    try {
      const { GoogleSignin } = require('@react-native-google-signin/google-signin');
      await GoogleSignin.signOut();
    } catch {
      // 네이티브 모듈 초기화 실패 등 - 로그아웃 흐름을 막지 않는다.
    }
  }, []);

  return { signIn, signOut };
}
