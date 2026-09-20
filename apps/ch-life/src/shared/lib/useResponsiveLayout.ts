import { useWindowDimensions } from "react-native";

/** 폰/태블릿 분기점. 노트 목록과 성경 시트가 같은 값을 본다(RULE-UI-001). */
export const TABLET_BREAKPOINT = 900;

export type LayoutMode = "sheet" | "sidebar";

export function useResponsiveLayout(): { mode: LayoutMode; width: number } {
  const { width } = useWindowDimensions();
  const isTabletLandscape = width >= TABLET_BREAKPOINT;
  return {
    mode: isTabletLandscape ? "sidebar" : "sheet",
    width,
  };
}
