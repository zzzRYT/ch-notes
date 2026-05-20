import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "ch-life",
  slug: "ch-life",
  version: "0.1.0",
  orientation: "default",
  icon: "./assets/icon.png",
  scheme: "chlife",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
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
};

export default config;
