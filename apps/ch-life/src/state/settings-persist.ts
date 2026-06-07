import * as FileSystem from "expo-file-system/legacy";
import type { Settings } from "@/domain/types";
import { parseSettings } from "./settings-validator";

const PATH = `${FileSystem.documentDirectory ?? ""}settings.json`;

export async function loadSettings(): Promise<Settings | null> {
  try {
    if (!FileSystem.documentDirectory) return null;
    const info = await FileSystem.getInfoAsync(PATH);
    if (!info.exists) return null;
    const raw = await FileSystem.readAsStringAsync(PATH);
    return parseSettings(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export async function saveSettings(s: Settings): Promise<void> {
  if (!FileSystem.documentDirectory) return;
  await FileSystem.writeAsStringAsync(PATH, JSON.stringify(s));
}
