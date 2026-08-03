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
        LSApplicationQueriesSchemes: ["kakaomap"],
        // 개발 중 로컬 백엔드(평문 HTTP)에 접속하기 위한 설정. 백엔드가 HTTPS로
        // 배포되면 이 예외는 제거할 것.
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true
        }
      }
    },
    android: {
      package: "com.ongil.app",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundImage: "./assets/android-icon-background.png",
        monochromeImage: "./assets/android-icon-monochrome.png"
      },
      predictiveBackGestureEnabled: false,
      // 위와 동일한 이유로 개발 중 평문 HTTP 허용. HTTPS 배포 후 제거.
      usesCleartextTraffic: true
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-location",
        {
          locationWhenInUsePermission: "내 주변 장소를 찾기 위해 위치 정보를 사용합니다."
        }
      ]
    ]
  }
};