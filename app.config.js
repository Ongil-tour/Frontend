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
      predictiveBackGestureEnabled: false
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
    ]
  }
};
