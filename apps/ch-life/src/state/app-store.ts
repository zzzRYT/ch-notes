import { create } from "zustand";
import type { Settings } from "@/domain/types";

type AppState = {
  currentNoteId: string | null;
  settings: Settings;
  setCurrentNoteId: (id: string | null) => void;
  setSettings: (next: Partial<Settings>) => void;
};

const DEFAULT_SETTINGS: Settings = {
  fontScale: 1.2,
  themePreference: "system",
  lastOpenedNoteId: null,
};

export const useAppStore = create<AppState>((set) => ({
  currentNoteId: null,
  settings: DEFAULT_SETTINGS,
  setCurrentNoteId: (id) => set({ currentNoteId: id }),
  setSettings: (next) =>
    set((s) => ({ settings: { ...s.settings, ...next } })),
}));
