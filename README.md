# 온길 (OnGil)

배리어프리 여행 정보 제공 앱 — 한국관광공사 접근성 API + Kakao Maps 연동

> 이 문서는 팀원 세팅용 내부 문서입니다. 각자 환경(macOS / Windows)에 맞는 부분을 꼭 확인하고 진행해주세요.

---

## 팀 구성 (Frontend)

| 이름 | 담당 | 개발 환경 |
|---|---|---|
| 김한성 | 로그인, 회원가입, 지도 | macOS |
| 김소희 | 마이페이지, 장소 보관함 | Windows |

---

## 기술 스택

| 분야 | 기술 |
|---|---|
| Framework | React Native (Expo, Dev Build) |
| 언어 | TypeScript |
| 상태관리 | Zustand |
| 서버 상태 | TanStack Query |
| 네비게이션 | React Navigation |
| 지도 | Kakao Maps SDK (`@react-native-kakao/map`) |
| HTTP | Axios |
| 외부 API | 한국관광공사 TourAPI, Kakao Maps |

**⚠️ 중요: 이 프로젝트는 Expo Go를 사용하지 않습니다.**
카카오맵 SDK가 커스텀 네이티브 모듈이라 Expo Go에서 실행이 안 됩니다. 반드시 **Dev Build**로 진행합니다.

---

## 사전 준비 (공통)

두 사람 모두 아래는 동일하게 설치합니다.

- [ ] Node.js 20 LTS 이상
- [ ] Git
- [ ] VSCode
- [ ] Watchman *(macOS만 해당, Windows는 불필요)*

Node.js 버전 확인:
```bash
node -v
```

---

## 사전 준비 (OS별로 다름)

### macOS (한성)

1. **Xcode** 설치 (App Store) — 용량 크니 미리 받아두기
2. 터미널에서:
   ```bash
   sudo xcode-select --switch /Applications/Xcode.app
   sudo xcodebuild -license accept
   ```
3. **CocoaPods** 설치:
   ```bash
   sudo gem install cocoapods
   ```
4. **Android Studio**도 설치 (Android 빌드도 겸용하려면 — 필수는 아님, iOS만 담당이면 생략 가능)

### Windows (소희)

1. **Android Studio** 설치: https://developer.android.com/studio
2. 설치 마법사에서 Android SDK, SDK Platform-Tools, Android Virtual Device 체크된 상태로 진행
3. 환경변수 등록 (시스템 환경변수 편집에서):
   - `ANDROID_HOME` = `C:\Users\사용자명\AppData\Local\Android\Sdk`
   - `Path`에 추가: `%ANDROID_HOME%\platform-tools`, `%ANDROID_HOME%\emulator`
4. **iOS는 Windows에서 빌드 자체가 불가능합니다** (Xcode가 macOS 전용). iOS 확인이 필요하면 한성에게 요청하거나, 추후 EAS Build(클라우드 빌드)를 사용합니다.
5. Android Studio 실행 → 우측 상단 **Device Manager** → 에뮬레이터 1개 생성 (Pixel 계열 + 최신 API 권장)

---

## 프로젝트 최초 세팅 (프로젝트 처음 만들 때, 1인만 진행)

```bash
npx create-expo-app ongil --template
# 템플릿 선택: Blank (TypeScript)

cd ongil
npx expo install expo-dev-client

npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
npm install zustand @tanstack/react-query axios

npm i @react-native-kakao/map
npx expo install expo-build-properties
```

이후 GitHub에 레포 생성해서 push. **`.gitignore`에 아래 항목이 꼭 들어가 있는지 확인**:
```
/ios
/android
.env
node_modules/
```
> `ios/`, `android/` 폴더는 각자 로컬에서 `expo prebuild`로 자동 생성되는 것이라 Git에 올리지 않습니다. 올리면 서로 충돌만 납니다.

---

## 카카오 앱 키 발급 (1인만 진행)

1. https://developers.kakao.com 접속 → 로그인
2. **내 애플리케이션 → 애플리케이션 추가하기**
3. 앱 생성하면 **네이티브 앱 키**가 즉시 발급됨 (별도 심사 없음)
4. **플랫폼 등록** (필수, 안 하면 인증 에러남):
   - Android: 패키지명 + 키 해시 등록
   - iOS: 번들 ID 등록
5. 발급받은 네이티브 앱 키는 팀 카톡/노션으로 공유 (절대 GitHub에 올리지 않기)

---

## 각자 로컬 세팅 (레포 클론한 사람 모두 진행)

```bash
git clone [레포 주소]
cd ongil
npm install
```

`.env` 파일 생성 (레포 루트에, `.env.example` 있으면 복사):
```
KAKAO_NATIVE_APP_KEY=팀에서 공유받은 키 값 붙여넣기
```

Dev Build 생성:
```bash
npx expo prebuild
```

### macOS (한성) — iOS 실행
```bash
npx expo run:ios
```
- 첫 실행은 5~10분 정도 걸릴 수 있음 (CocoaPods 설치 + 빌드)
- 자동으로 iOS 시뮬레이터 열리고 앱 설치됨

### Windows (소희) — Android 실행
```bash
npx expo run:android
```
- 먼저 Android Studio에서 만든 에뮬레이터를 켜두거나, 실제 갤럭시를 USB로 연결
- 실기기 연결 시: 휴대폰 설정 → 개발자 옵션 → USB 디버깅 켜기 필요

---

## 이후 매일 개발할 때 (최초 세팅 이후)

```bash
npx expo start
```
Dev Build 앱이 이미 설치돼 있으면 Metro 서버 켜고 앱에서 연결만 하면 됨. 코드 수정하면 Fast Refresh로 바로 반영됨 (매번 run:ios / run:android 다시 할 필요 없음).

**네이티브 모듈을 새로 추가했거나 `app.json` 설정을 바꿨을 때만**:
```bash
npx expo prebuild --clean
npx expo run:ios   # 또는 run:android
```

---

## 자주 발생하는 에러

| 증상 | 원인 / 해결 |
|---|---|
| `pod install` 실패 (macOS) | `cd ios && pod install --repo-update` 재시도 |
| Android 빌드 시 SDK 버전 에러 | `android/build.gradle`의 `compileSdkVersion`을 에러 메시지에 나온 버전으로 맞추기 |
| 카카오맵이 하얀 화면 | 네이티브 앱 키 오타 확인, 또는 카카오 디벨로퍼스에 등록한 키 해시(Android)/번들ID(iOS)가 실제 값과 일치하는지 확인 |
| `ANDROID_HOME`을 못 찾는다는 에러 (Windows) | 환경변수 등록 후 터미널(또는 PC) 재시작 필요 |
| iOS 빌드하려는데 Windows라 안 됨 | 정상입니다. iOS는 macOS에서만 빌드 가능. 한성에게 요청하거나 추후 EAS Build 사용 |

---

## 카카오맵 연동 (WebView 방식)

**⚠️ 중요: `@react-native-kakao/map`은 사용하지 않습니다.**

`@react-native-kakao/map`(마지막 버전 2.2.7)은 라이브러리 제작자가 이후 버전에서 지도 패키지 자체를 저장소에서 제거했고, New Architecture(Fabric)를 지원하지 않아 최신 React Native(0.86+)에서 `The package @react-native-kakao/map only supports fabric` 에러가 발생합니다. 사실상 유지보수가 중단된 패키지입니다.

**대신 WebView + Kakao Maps JavaScript SDK 방식을 사용합니다.**

### 세팅 방법

1. `react-native-webview` 설치: `npx expo install react-native-webview`
2. 카카오 디벨로퍼스에서 **JavaScript 키** 발급 (네이티브 앱 키 아님)
3. `.env`에 추가:
   ```
   EXPO_PUBLIC_KAKAO_JS_KEY=발급받은_JavaScript_키
   ```
4. 카카오 디벨로퍼스 → 플랫폼 키 → JavaScript 키 → **Web 플랫폼 도메인**에 등록:
   ```
   http://localhost
   https://localhost
   ```
5. 카카오 디벨로퍼스 → **[제품 설정] → [카카오맵]** 메뉴에서 **API 활성화** (기본값이 비활성 상태라 반드시 켜야 함)
6. WebView 사용 시 **`baseUrl`을 반드시 지정**할 것 (`baseUrl` 없이 `source={{ html }}`만 쓰면 iOS에서 외부 스크립트 로딩이 막히는 이슈가 있음):
   ```tsx
   source={{ html: mapHtml, baseUrl: 'https://localhost' }}
   ```

### 트러블슈팅 참고

- `NotAuthorizedError: App disabled OPEN_MAP_AND_LOCAL service` → 카카오맵 API 활성화 안 된 상태 (위 5번 확인)
- `kakao is not defined` → SDK 스크립트 로딩 실패. `baseUrl` 누락, 도메인 미등록, 또는 API 비활성화가 원인일 확률이 높음

## 협업 규칙

- 코드는 Git으로 공유, 각자 담당 플랫폼(한성=iOS, 소희=Android)에서 로컬 빌드로 확인
- PR 올릴 때 가능하면 서로 다른 플랫폼에서 한 번씩 크로스 체크
- `.env`, `ios/`, `android/` 폴더는 절대 커밋하지 않기
- 배포 임박 시 EAS Build(클라우드 빌드)로 전환 예정 — 이땐 Windows에서도 iOS 빌드 트리거 가능