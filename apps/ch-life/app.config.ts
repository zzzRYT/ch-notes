import { ExpoConfig } from "expo/config";

const hotUpdaterChannel = process.env.HOT_UPDATER_CHANNEL ?? "production";
const hotUpdaterBaseUrl = process.env.HOT_UPDATER_BASE_URL ?? null;

if (process.env.EAS_BUILD_PROFILE && !hotUpdaterBaseUrl) {
  throw new Error(
    "HOT_UPDATER_BASE_URL must be set when creating an EAS build.",
  );
}

const config: ExpoConfig = {
  name: "씀씀",
  slug: "ch-note",
  owner: "zzzryt",
  version: "1.0.1",
  orientation: "default",
  icon: "./assets/icon.png",
  scheme: "chlife",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#FDF9F4",
  },
  ios: {
    bundleIdentifier: "com.leejaejin.chlife",
    supportsTablet: true,
    infoPlist: {
      UIFileSharingEnabled: true,
      LSSupportsOpeningDocumentsInPlace: true,
      // HTTPS 외 자체 암호화 미사용 → 수출규정 면제. 매 빌드 질문 방지.
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: "com.leejaejin.chlife",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FDF9F4",
    },
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-router",
    ["@hot-updater/react-native", { channel: hotUpdaterChannel }],
    [
      "expo-build-properties",
      {
        android: {
          // R8 코드 축소·난독화 (Play Console 앱 최적화 권장)
          enableMinifyInReleaseBuilds: true,
          // 미사용 리소스 제거 (minify와 함께 사용)
          enableShrinkResourcesInReleaseBuilds: true,
        },
      },
    ],
  ],
  experiments: { typedRoutes: true },
  extra: {
    hotUpdaterBaseUrl,
    eas: {
      projectId: "813691d9-f5ff-48d6-93c7-47432b44b2ce",
    },
  },
};

export default config;
