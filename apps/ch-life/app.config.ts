import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "ch-life",
  slug: "ch-life",
  owner: "leejaejin_0403",
  version: "0.1.0",
  orientation: "default",
  icon: "./assets/icon.png",
  scheme: "chlife",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  updates: {
    url: "https://u.expo.dev/be4c4c47-3ef3-4438-a005-821a6078892a",
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#257AB4",
  },
  ios: {
    bundleIdentifier: "com.leejaejin.chlife",
    supportsTablet: true,
    infoPlist: {
      UIFileSharingEnabled: true,
      LSSupportsOpeningDocumentsInPlace: true,
    },
  },
  android: {
    package: "com.leejaejin.chlife",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#257AB4",
    },
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: ["expo-router"],
  experiments: { typedRoutes: true },
  extra: {
    eas: {
      projectId: "be4c4c47-3ef3-4438-a005-821a6078892a",
    },
  },
};

export default config;
