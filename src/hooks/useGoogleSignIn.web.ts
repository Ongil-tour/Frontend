import { useCallback, useEffect, useRef } from 'react';

// 네이티브 버전(useGoogleSignIn.ts)과 동일한 시그니처({ signIn, signOut }, signIn은 idToken
// 문자열 또는 null 반환)를 유지해서 SocialLoginButtons.tsx 등 호출부는 플랫폼 분기 없이 그대로 쓴다.
// Metro가 웹 번들에서는 이 파일(.web.ts)을 자동으로 대신 골라 쓴다.
//
// @react-native-google-signin/google-signin은 웹 구현체가 "sponsors only" 스텁이라 호출 시
// 항상 throw한다 (node_modules/.../GoogleSignin.web.ts 확인됨) - 그래서 웹에서는 구글이 제공하는
// Google Identity Services(GIS) 스크립트를 직접 붙여서 ID 토큰을 받는다. 백엔드는 네이티브 로그인 때도
// GoogleSignin이 webClientId(EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID)를 audience로 발급한 idToken을
// 검증하고 있어서, GIS도 같은 client_id로 초기화하면 백엔드 쪽 변경 없이 그대로 호환된다.
//
// GIS의 One Tap(`prompt()`)은 사용자가 이전에 닫은 적이 있으면 쿨다운으로 아예 안 뜨는 경우가 있어
// 커스텀 버튼과 묶기엔 불안정하다. 대신 화면 밖에 진짜 구글 버튼을 렌더링해두고, 우리 버튼 클릭 시
// 그 버튼을 프로그램적으로 클릭하는 방식을 쓴다 - 항상 동일하게 동작하고, 클릭 이벤트 콜스택 안에서
// 동기적으로 실행되므로 브라우저 팝업 차단에도 걸리지 않는다.
const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GIS_SRC = 'https://accounts.google.com/gsi/client';

declare global {
  interface Window {
    google?: any;
  }
}

let gisScriptPromise: Promise<void> | null = null;
function loadGisScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!gisScriptPromise) {
    gisScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = GIS_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('구글 로그인 스크립트를 불러오지 못했습니다.'));
      document.head.appendChild(script);
    });
  }
  return gisScriptPromise;
}

// 다음 클릭 때 콜스택이 동기적으로 이어지도록, 스크립트 로딩은 모듈이 쓰이는 시점(훅 마운트)에
// 미리 시작해둔다.
loadGisScript().catch(() => {});

export function useGoogleSignIn() {
  const hiddenButtonRef = useRef<HTMLElement | null>(null);
  const pendingResolveRef = useRef<((idToken: string | null) => void) | null>(null);
  const initializedRef = useRef(false);

  const ensureButton = useCallback(async () => {
    await loadGisScript();
    const google = window.google;

    if (!initializedRef.current) {
      google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response: { credential?: string }) => {
          pendingResolveRef.current?.(response.credential ?? null);
          pendingResolveRef.current = null;
        },
      });
      initializedRef.current = true;
    }

    if (!hiddenButtonRef.current) {
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      document.body.appendChild(container);
      google.accounts.id.renderButton(container, { type: 'standard' });
      hiddenButtonRef.current = container.querySelector('div[role="button"]');
    }

    return hiddenButtonRef.current;
  }, []);

  useEffect(() => {
    ensureButton().catch(() => {});
  }, [ensureButton]);

  const signIn = useCallback(async () => {
    const button = await ensureButton();
    if (!button) {
      throw new Error('구글 로그인 버튼을 초기화하지 못했습니다.');
    }
    return new Promise<string | null>((resolve) => {
      pendingResolveRef.current = resolve;
      button.click();
    });
  }, [ensureButton]);

  // 로그아웃/회원탈퇴 시 다음 로그인 때 계정 선택 없이 바로 재로그인되는 걸 막는다
  // (네이티브 signOut과 동일한 목적 - useLogoutMutation.ts 주석 참고).
  const signOut = useCallback(async () => {
    try {
      window.google?.accounts?.id?.disableAutoSelect();
    } catch {
      // 무시 - 로그아웃 자체는 계속 진행되어야 한다.
    }
  }, []);

  return { signIn, signOut };
}
