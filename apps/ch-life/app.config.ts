import { existsSync } from "node:fs";
import { ExpoConfig } from "expo/config";

const hotUpdaterChannel = process.env.HOT_UPDATER_CHANNEL ?? "production";
const hotUpdaterBaseUrl = process.env.HOT_UPDATER_BASE_URL ?? null;
// Firebase 설정 파일은 gitignore 대상 — EAS 빌드 서버에서는 file 타입 환경변수로 주입된다.
// eas build를 호출하는 쪽(CI 러너)은 파일도 변수도 없이 config를 읽으므로 없으면 비워 둔다.
const firebaseFile = (envPath: string | undefined, local: string) =>
  envPath ?? (existsSync(local) ? local : undefined);
const googleServicesJson = firebaseFile(
  process.env.GOOGLE_SERVICES_JSON,
  "./google-services.json",
);
const googleServiceInfoPlist = firebaseFile(
  process.env.GOOGLE_SERVICE_INFO_PLIST,
  "./GoogleService-Info.plist",
);
// 빌드 서버에서 빠지면 iOS는 조용히 빌드되고 실행 시 FirebaseApp.configure()에서 죽는다.
if (process.env.EAS_BUILD && !(googleServicesJson && googleServiceInfoPlist)) {
  throw new Error(
    "GOOGLE_SERVICES_JSON / GOOGLE_SERVICE_INFO_PLIST must be set on EAS builds.",
  );
}

if (process.env.EAS_BUILD_PROFILE && !hotUpdaterBaseUrl) {
  throw new Error(
    "HOT_UPDATER_BASE_URL must be set when creating an EAS build.",
  );
}

const config: ExpoConfig = {
  name: "씀씀",
  slug: "ch-note",
  owner: "zzzryt",
  version: "1.0.3",
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
    googleServicesFile: googleServiceInfoPlist,
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
    googleServicesFile: googleServicesJson,
    // Firebase Analytics가 병합하는 광고 ID 권한 제거 — 광고 ID 미사용(ADR-0029), Play 선언과 일치
    blockedPermissions: ["com.google.android.gms.permission.AD_ID"],
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
    // SPM(dynamic frameworks)은 Expo 54 prebuilt core와 충돌 → CocoaPods + static
    ["@react-native-firebase/app", { ios: { disableSPM: true } }],
    // IDFA 미사용 → ATT 프롬프트 불필요
    ["@react-native-firebase/analytics", { ios: { withoutAdIdSupport: true } }],
    [
      "expo-build-properties",
      {
        ios: {
          useFrameworks: "static",
          forceStaticLinking: ["RNFBApp", "RNFBAnalytics"],
        },
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
