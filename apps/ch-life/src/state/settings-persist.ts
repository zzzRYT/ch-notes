import * as FileSystem from "expo-file-system/legacy";
import type { Settings } from "@/domain/types";

const PATH = `${FileSystem.documentDirectory ?? ""}settings.json`;

const ALLOWED_FONT: ReadonlyArray<Settings["fontScale"]> = [1.0, 1.2, 1.4, 1.6];
const ALLOWED_THEME: ReadonlyArray<Settings["themePreference"]> = [
  "system",
  "light",
  "dark",
];

function isValidSettings(x: unknown): x is Settings {
  if (typeof x !== "object" || x === null) return false;
  const s = x as Record<string, unknown>;
  return (
    typeof s.fontScale === "number" &&
    (ALLOWED_FONT as ReadonlyArray<number>).includes(s.fontScale) &&
    typeof s.themePreference === "string" &&
    (ALLOWED_THEME as ReadonlyArray<string>).includes(s.themePreference) &&
    (s.lastOpenedNoteId === null || typeof s.lastOpenedNoteId === "string")
  );
}

export async function loadSettings(): Promise<Settings | null> {
  try {
    if (!FileSystem.documentDirectory) return null;
    const info = await FileSystem.getInfoAsync(PATH);
    if (!info.exists) return null;
    const raw = await FileSystem.readAsStringAsync(PATH);
    const parsed = JSON.parse(raw) as unknown;
    return isValidSettings(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveSettings(s: Settings): Promise<void> {
  if (!FileSystem.documentDirectory) return;
  await FileSystem.writeAsStringAsync(PATH, JSON.stringify(s));
}
