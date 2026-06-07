import * as FileSystem from "expo-file-system/legacy";
import type {
  AccentChoice,
  BlockStyle,
  FontFamily,
  Settings,
  Variation,
} from "@/domain/types";

const PATH = `${FileSystem.documentDirectory ?? ""}settings.json`;

const ALLOWED_FONT: ReadonlyArray<Settings["fontScale"]> = [1.0, 1.2, 1.4, 1.6];
const ALLOWED_THEME: ReadonlyArray<Settings["themePreference"]> = [
  "system",
  "light",
  "dark",
];
const ALLOWED_VARIATION: ReadonlyArray<Variation> = [
  "minimal",
  "paper",
  "focus",
  "dark",
];
const ALLOWED_BLOCK_STYLE: ReadonlyArray<BlockStyle> = [
  "default",
  "card",
  "quote",
  "collapse",
];
const ALLOWED_FONT_FAMILY: ReadonlyArray<FontFamily> = ["sans", "serif", "mono"];
const ALLOWED_ACCENT: ReadonlyArray<AccentChoice> = [
  "default",
  "#1e6fd9",
  "#b15c2e",
  "#1f8a5b",
  "#f5b35e",
  "#7a5af0",
  "#6b7280",
];

function readVariation(value: unknown, themePref: unknown): Variation {
  if (
    typeof value === "string" &&
    (ALLOWED_VARIATION as ReadonlyArray<string>).includes(value)
  ) {
    return value as Variation;
  }
  // Migration: derive from previous themePreference if variation absent.
  if (themePref === "dark") return "dark";
  return "focus";
}

function readEnum<T extends string>(
  value: unknown,
  allowed: ReadonlyArray<T>,
  fallback: T,
): T {
  if (
    typeof value === "string" &&
    (allowed as ReadonlyArray<string>).includes(value)
  ) {
    return value as T;
  }
  return fallback;
}

function parseSettings(x: unknown): Settings | null {
  if (typeof x !== "object" || x === null) return null;
  const s = x as Record<string, unknown>;
  if (
    typeof s.fontScale !== "number" ||
    !(ALLOWED_FONT as ReadonlyArray<number>).includes(s.fontScale)
  )
    return null;
  if (
    typeof s.themePreference !== "string" ||
    !(ALLOWED_THEME as ReadonlyArray<string>).includes(s.themePreference)
  )
    return null;
  if (s.lastOpenedNoteId !== null && typeof s.lastOpenedNoteId !== "string")
    return null;
  return {
    fontScale: s.fontScale as Settings["fontScale"],
    themePreference: s.themePreference as Settings["themePreference"],
    variation: readVariation(s.variation, s.themePreference),
    blockStyle: readEnum(s.blockStyle, ALLOWED_BLOCK_STYLE, "default"),
    fontFamily: readEnum(s.fontFamily, ALLOWED_FONT_FAMILY, "sans"),
    accentChoice: readEnum(s.accentChoice, ALLOWED_ACCENT, "default"),
    lastOpenedNoteId: s.lastOpenedNoteId as string | null,
    lastBibleRef: null,
  };
}

export async function loadSettings(): Promise<Settings | null> {
  try {
    if (!FileSystem.documentDirectory) return null;
    const info = await FileSystem.getInfoAsync(PATH);
    if (!info.exists) return null;
    const raw = await FileSystem.readAsStringAsync(PATH);
    const parsed = JSON.parse(raw) as unknown;
    return parseSettings(parsed);
  } catch {
    return null;
  }
}

export async function saveSettings(s: Settings): Promise<void> {
  if (!FileSystem.documentDirectory) return;
  await FileSystem.writeAsStringAsync(PATH, JSON.stringify(s));
}
