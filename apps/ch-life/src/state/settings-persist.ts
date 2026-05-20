import * as FileSystem from "expo-file-system/legacy";
import type { Settings, Variation } from "@/domain/types";

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

function readVariation(value: unknown, themePref: unknown): Variation {
  if (
    typeof value === "string" &&
    (ALLOWED_VARIATION as ReadonlyArray<string>).includes(value)
  ) {
    return value as Variation;
  }
  // Migration: derive from previous themePreference if variation absent.
  if (themePref === "dark") return "dark";
  return "minimal";
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
    lastOpenedNoteId: s.lastOpenedNoteId as string | null,
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
