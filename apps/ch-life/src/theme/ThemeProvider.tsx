import React, { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { useAppStore } from "@/state/app-store";

export type ThemeColors = {
  bg: string;
  surface: string;
  text: string;
  subtle: string;
  line: string;
  accent: string;
  accentText: string;
  chipBg: string;
  chipText: string;
  quoteBar: string;
  errBar: string;
  errBg: string;
  errText: string;
};

export type Theme = {
  colors: ThemeColors;
  fontScale: number;
  isDark: boolean;
};

const LIGHT: ThemeColors = {
  bg: "#ffffff",
  surface: "#fafafa",
  text: "#111111",
  subtle: "#666666",
  line: "#eeeeee",
  accent: "#222222",
  accentText: "#ffffff",
  chipBg: "#f0f0f0",
  chipText: "#444444",
  quoteBar: "#bdbdbd",
  errBar: "#c8342a",
  errBg: "#fde2e1",
  errText: "#c8342a",
};

const DARK: ThemeColors = {
  bg: "#000000",
  surface: "#111111",
  text: "#f4f4f4",
  subtle: "#9a9a9a",
  line: "#222222",
  accent: "#f4f4f4",
  accentText: "#111111",
  chipBg: "#1c1c1c",
  chipText: "#cccccc",
  quoteBar: "#5a5a5a",
  errBar: "#ff6b6b",
  errBg: "#3a1716",
  errText: "#ff8b80",
};

const Ctx = createContext<Theme>({
  colors: LIGHT,
  fontScale: 1,
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const settings = useAppStore((s) => s.settings);
  const isDark =
    settings.themePreference === "dark" ||
    (settings.themePreference === "system" && system === "dark");
  const value = useMemo<Theme>(
    () => ({
      colors: isDark ? DARK : LIGHT,
      fontScale: settings.fontScale,
      isDark,
    }),
    [isDark, settings.fontScale],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): Theme {
  return useContext(Ctx);
}

export function scaled(base: number, fontScale: number): number {
  return Math.round(base * fontScale);
}
