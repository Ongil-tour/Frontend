# 카카오맵이 실기기에서 안 뜨던 문제 (해결)

## 증상

- `expo run:android` 디버그 빌드(에뮬레이터)에서는 지도가 (거의) 잘 떴음
- EAS로 빌드한 릴리즈용 APK를 실제 안드로이드 기기에 설치하면 지도 화면에서
  **"지도를 불러오는 중..." 스피너만 무한히 돌고 지도가 안 뜸**
- 에러 메시지도 처음엔 전혀 안 뜸 (흰 화면/로딩 화면만 무한정)

## 최종 원인

카카오맵 JavaScript SDK가 내부적으로 이렇게 되어 있다 (실제 SDK 코드 확인함):

```js
// https://dapi.kakao.com/v2/maps/sdk.js 안의 실제 코드
r = ("https:" == location.protocol) ? "https:" : "http:";
...
p = {
  v3: r + "//t1.daumcdn.net/mapjsapi/js/main/4.5.26/kakao.js",
  services: r + "//t1.daumcdn.net/mapjsapi/js/libs/services/1.1.1/services.js",
  ...
};
```

즉 `kakao.maps.load()`가 실제 지도 기능을 담은 추가 파일을
**"지금 이 페이지의 프로토콜(`location.protocol`)을 그대로 따라서"** 불러온다.

우리 앱의 지도 화면은 WebView로 만든 로컬 HTML이고, 아래처럼
`baseUrl`로 이 웹뷰의 "가짜 주소"를 지정하고 있었다:

```ts
// src/components/map/KakaoMapView.tsx
source={{ html: mapHtml, baseUrl: 'http://localhost' }}  // 문제의 코드
```

`baseUrl`이 `http://localhost`라서 `location.protocol`이 `"http:"`가 되고,
카카오 SDK는 그대로 `http://t1.daumcdn.net/...`로 요청을 보낸다.

**Android 9(API 28)부터는 앱이 `usesCleartextTraffic`을 명시적으로 켜두지
않으면 평문 HTTP 요청이 기본적으로 차단된다.** 이 프로젝트는 (한때) 백엔드가
이미 HTTPS라는 이유로 그 설정을 지워버린 상태였어서, 카카오 SDK의 이 특정
요청이 조용히 막히고 있었다. `kakao.maps.load()`의 콜백은 영원히 호출되지
않고(에러도 안 던져짐 - 그냥 리소스 로드 실패라 `window.onerror`에도 안 잡힘),
그래서 로딩 스피너만 무한히 돎.

### 왜 에뮬레이터(디버그 빌드)에서는 됐나

Android 디버그 빌드는 기본적으로 cleartext(평문 HTTP) 트래픽을 허용하는
네트워크 보안 설정을 갖는 경우가 많아서, 같은 코드인데도 안 걸렸던 것.
릴리즈 빌드(EAS `preview`/`production`)는 Android 기본 정책 그대로라 막힘.

### `baseUrl`이 왜 `http://localhost`였나 (역사)

git log를 보면 원래는 `https://localhost`였다가, **그 당시엔 백엔드 API가
아직 평문 HTTP였어서** `https` 페이지에서 `http` 백엔드로 요청을 보내면
Mixed Content로 막혀서 `http://localhost`로 바꿔뒀던 것. 지금은 백엔드가
`https://ongil-api.onrender.com`로 이미 HTTPS라 그 워크어라운드 자체가
불필요해진 상태였는데, 코드에는 그대로 남아있었다.

## 수정

```ts
// src/components/map/KakaoMapView.tsx
source={{ html: mapHtml, baseUrl: 'https://localhost' }}
```

카카오 개발자센터 콘솔의 "JavaScript SDK 도메인"(앱 > 제품 링크 관리 또는
앱 설정 > 플랫폼, 콘솔 버전에 따라 이름이 다름)에 `http://localhost`,
`https://localhost` 둘 다 미리 등록되어 있어서 도메인 화이트리스트 문제는
없었다.

추가로 안전장치 겸 다음도 같이 적용:

```js
// app.config.js
android: {
  ...
  usesCleartextTraffic: true  // 혹시 다른 곳에서 평문 http를 쓰는 경우를 위한 안전망
}
```

## 관련해서 같이 고친 것들 (진짜 원인은 아니었지만 정당한 개선)

디버깅 과정에서 "타이밍 레이스 컨디션"이라고 잘못 진단하고 고친 부분들인데,
결과적으로는 원인이 아니었지만 그 자체로는 맞는 개선이라 남겨둠:

1. **`autoload=false` + `kakao.maps.load(callback)`** — SDK 로드 직후
   바로 `new kakao.maps.LatLng(...)`을 쓰면 타이밍에 따라
   `"kakao.maps.LatLng is not a constructor"` 에러가 날 수 있음(카카오
   공식 권장 패턴). 근본 원인(cleartext 차단)과는 별개로, 이 패턴 자체는
   맞게 고친 것.
2. **초기화 전 커맨드 큐잉** — `kakao.maps.load()` 콜백이 끝나기 전에
   `zoomIn`/`showRadiusCircle` 등을 호출하면 같은 종류의 에러가 남.
   `MAP_READY` 신호를 받기 전까지는 명령을 큐에 쌓아뒀다가 순서대로
   실행하도록 함.
3. **`findNearestPoi`에 8초 타임아웃 추가** — 지도 클릭 시 카테고리
   검색 콜백이 하나라도 안 돌아오면 가드가 영구히 잠기던 문제.
4. **`window.onerror` / `unhandledrejection` / WebView `onError`/
   `onHttpError`** — 지도 로드 실패가 전부 흰 화면으로만 나오던 걸 실제
   에러 메시지(Alert)로 보이게 함. 이번 디버깅이 가능했던 것도 이 계측
   덕분.

## 디버깅하면서 배운 것

- **`usesCleartextTraffic`을 켰는데도 안 될 수 있다** — 문제가 "우리 코드가
  http로 요청한다"가 아니라 "서드파티 SDK가 우리 페이지의 protocol을
  그대로 따라간다"는 식으로 간접적일 수 있음. 안드로이드 설정만 만지지 말고
  **왜 http로 나가는지 소스까지 추적**해야 확실하다.
- **막힌 리소스 로드는 `window.onerror`에 안 걸린다.** `<script>` 태그나
  `fetch`가 네트워크 정책으로 막히는 건 "던져진 에러"가 아니라 조용한
  리소스 로드 실패라서, `window.onerror`만 걸어두면 못 잡는다.
  `document.createElement('script')`를 감싸서 동적으로 생성되는
  `<script>`의 `load`/`error` 이벤트까지 잡아야 보인다.
- **USB/같은 와이파이 없이도 웹뷰 디버깅이 가능하다** — `chrome://inspect`
  원격 디버깅이 안 될 때는, 웹뷰 안에서 실제 네트워크 요청을 가로채서
  `postMessage`로 RN에 보고하거나(Alert로 표시), 최후의 수단으로 웹뷰
  화면에 직접 로그를 `<pre>` 텍스트로 찍는 방법이 있다.
- **의심되면 실제 서드파티 코드를 받아서 직접 읽어봐라.** "카카오 SDK가
  protocol-relative URL을 쓸 것 같다"는 추측에 머물지 않고, 실제
  `dapi.kakao.com/v2/maps/sdk.js`를 `curl`로 받아서 `location.protocol`
  분기 코드를 눈으로 확인하고서야 100% 확신할 수 있었다.
- **"레이스 컨디션처럼 보이는" 에러가 실은 "영원히 실패하는" 에러일 수
  있다.** 처음 본 에러(`kakao.maps.LatLng is not a constructor`)를
  타이밍 문제로 오진단해서 `autoload=false` 같은 걸 먼저 시도했는데,
  사실은 애초에 그 리소스가 절대 로드될 수 없는 상태(cleartext 차단)였다.
  "가끔 되고 가끔 안 된다"가 아니라 "환경(에뮬레이터 vs 실기기)에 따라
  항상 똑같이 실패한다"는 패턴이면 레이스 컨디션이 아니라 환경 차이(설정,
  네트워크 정책 등)를 먼저 의심해야 한다.

## 최종 수정 파일

- `src/components/map/KakaoMapView.tsx` — `baseUrl` https로 변경,
  `autoload=false` + `kakao.maps.load()`, 커맨드 큐잉, 에러 계측
- `app.config.js` — `android.usesCleartextTraffic: true`
