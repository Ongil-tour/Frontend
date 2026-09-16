require("@expo/env").load(__dirname);

export default {
  expo: {
    name: "Frontend",
    slug: "Frontend",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.ongil.app",
      infoPlist: {
        LSApplicationQueriesSchemes: ["kakaomap"]
      }
    },
    android: {
      package: "com.ongil.app",
      adaptiveIcon: {
        backgroundColor: "#FAF7EE",
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundImage: "./assets/android-icon-background.png",
        monochromeImage: "./assets/android-icon-monochrome.png"
      },
      predictiveBackGestureEnabled: false,
      // 카카오맵 SDK가 kakao.maps.load() 내부에서 실제 지도 모듈을
      // http://t1.daumcdn.net/... (평문 HTTP)로 불러온다. Android 9+ 기본값(차단)
      // 때문에 지도 초기화가 조용히 멈춰있던 원인 - 우리 백엔드는 HTTPS라 필요
      // 없다고 지웠었는데, 이 서드파티 SDK 때문에 다시 켜야 함.
      usesCleartextTraffic: true
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-build-properties",
        {
          ios: {
            buildReactNativeFromSource: true
          },
          android: {}
        }
      ],
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME ?? ""
        }
      ],
      [
        "expo-location",
        {
          locationWhenInUsePermission: "내 주변 장소를 찾기 위해 위치 정보를 사용합니다."
        }
      ],
      "expo-secure-store",
      "expo-status-bar"
    ],
    extra: {
      eas: {
        projectId: "cba916a8-1150-4dd9-b9cc-ec5f4ea572a9"
      }
    }
  }
};
