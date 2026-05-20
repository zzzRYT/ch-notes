import React, { createContext, useContext, useMemo } from "react";
import { useAppStore } from "@/state/app-store";
import type { Variation } from "@/domain/types";

// Design tokens align with styles.css from the Claude Design handoff
// (설교 노트 앱 — 4 variations).  Each palette carries the legacy
// fields plus the Toss-style "ink/paper/rule/accent" tokens.
export type ThemeColors = {
  // Legacy fields used across the existing app.
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
  // Toss-style design tokens (added for the new visual system).
  paper: string;
  ink: string;
  ink2: string;
  ink3: string;
  ink4: string;
  rule: string;
  accentSoft: string;
};

export type Theme = {
  colors: ThemeColors;
  fontScale: number;
  variation: Variation;
  isDark: boolean;
};

const MINIMAL: ThemeColors = {
  bg: "#fafaf7",
  paper: "#ffffff",
  surface: "#ffffff",
  ink: "#0c0a08",
  text: "#0c0a08",
  ink2: "rgba(12,10,8,0.6)",
  ink3: "rgba(12,10,8,0.4)",
  ink4: "rgba(12,10,8,0.18)",
  subtle: "rgba(12,10,8,0.55)",
  rule: "rgba(12,10,8,0.08)",
  line: "rgba(12,10,8,0.08)",
  accent: "#1e6fd9",
  accentSoft: "rgba(30,111,217,0.08)",
  accentText: "#ffffff",
  chipBg: "rgba(12,10,8,0.06)",
  chipText: "rgba(12,10,8,0.6)",
  quoteBar: "rgba(12,10,8,0.18)",
  errBar: "#c8342a",
  errBg: "#fde2e1",
  errText: "#c8342a",
};

const PAPER: ThemeColors = {
  bg: "#f7f3ec",
  paper: "#fcf9f3",
  surface: "#fcf9f3",
  ink: "#1f1a13",
  text: "#1f1a13",
  ink2: "rgba(31,26,19,0.68)",
  ink3: "rgba(31,26,19,0.44)",
  ink4: "rgba(31,26,19,0.2)",
  subtle: "rgba(31,26,19,0.6)",
  rule: "rgba(31,26,19,0.09)",
  line: "rgba(31,26,19,0.09)",
  accent: "#b15c2e",
  accentSoft: "rgba(177,92,46,0.09)",
  accentText: "#fcf9f3",
  chipBg: "rgba(31,26,19,0.06)",
  chipText: "rgba(31,26,19,0.6)",
  quoteBar: "rgba(31,26,19,0.2)",
  errBar: "#9a3823",
  errBg: "rgba(154,56,35,0.12)",
  errText: "#9a3823",
};

const FOCUS: ThemeColors = {
  bg: "#ffffff",
  paper: "#ffffff",
  surface: "#ffffff",
  ink: "#15140e",
  text: "#15140e",
  ink2: "rgba(21,20,14,0.55)",
  ink3: "rgba(21,20,14,0.35)",
  ink4: "rgba(21,20,14,0.15)",
  subtle: "rgba(21,20,14,0.5)",
  rule: "rgba(21,20,14,0.06)",
  line: "rgba(21,20,14,0.06)",
  accent: "#6b7280",
  accentSoft: "rgba(107,114,128,0.08)",
  accentText: "#ffffff",
  chipBg: "rgba(21,20,14,0.05)",
  chipText: "rgba(21,20,14,0.55)",
  quoteBar: "rgba(21,20,14,0.15)",
  errBar: "#c8342a",
  errBg: "#fde2e1",
  errText: "#c8342a",
};

const DARK: ThemeColors = {
  bg: "#0e0d0c",
  paper: "#1a1916",
  surface: "#1a1916",
  ink: "#f5f3ee",
  text: "#f5f3ee",
  ink2: "rgba(245,243,238,0.66)",
  ink3: "rgba(245,243,238,0.42)",
  ink4: "rgba(245,243,238,0.2)",
  subtle: "rgba(245,243,238,0.6)",
  rule: "rgba(245,243,238,0.1)",
  line: "rgba(245,243,238,0.1)",
  accent: "#f5b35e",
  accentSoft: "rgba(245,179,94,0.14)",
  accentText: "#1a1916",
  chipBg: "rgba(245,243,238,0.06)",
  chipText: "rgba(245,243,238,0.7)",
  quoteBar: "rgba(245,243,238,0.2)",
  errBar: "#ff6b6b",
  errBg: "#3a1716",
  errText: "#ff8b80",
};

const PALETTES: Record<Variation, ThemeColors> = {
  minimal: MINIMAL,
  paper: PAPER,
  focus: FOCUS,
  dark: DARK,
};

const Ctx = createContext<Theme>({
  colors: MINIMAL,
  fontScale: 1,
  variation: "minimal",
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const settings = useAppStore((s) => s.settings);
  const variation: Variation = settings.variation;
  const value = useMemo<Theme>(
    () => ({
      colors: PALETTES[variation],
      fontScale: settings.fontScale,
      variation,
      isDark: variation === "dark",
    }),
    [variation, settings.fontScale],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): Theme {
  return useContext(Ctx);
}

export function scaled(base: number, fontScale: number): number {
  return Math.round(base * fontScale);
}

export const VARIATION_OPTIONS: ReadonlyArray<{
  value: Variation;
  label: string;
  hint: string;
}> = [
  { value: "minimal", label: "A · 미니멀", hint: "깨끗한 화이트 · 파랑" },
  { value: "paper", label: "B · 종이", hint: "크림 톤 · 갈색" },
  { value: "focus", label: "C · 포커스", hint: "여백 중심 · 슬레이트" },
  { value: "dark", label: "D · 다크", hint: "긴 설교용 · 호박" },
];
