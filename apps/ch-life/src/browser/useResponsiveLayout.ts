import { useWindowDimensions } from "react-native";

export type LayoutMode = "sheet" | "sidebar";

export function useResponsiveLayout(): { mode: LayoutMode; width: number } {
  const { width } = useWindowDimensions();
  const isTabletLandscape = width >= 900;
  return {
    mode: isTabletLandscape ? "sidebar" : "sheet",
    width,
  };
}
