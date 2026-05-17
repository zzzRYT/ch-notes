import { create } from "zustand";
import type { Settings } from "@/domain/types";

type AppState = {
  currentNoteId: string | null;
  pendingInsertRef: string | null;
  settings: Settings;
  setCurrentNoteId: (id: string | null) => void;
  requestInsertRef: (ref: string) => void;
  consumePendingInsert: () => string | null;
  setSettings: (next: Partial<Settings>) => void;
};

const DEFAULT_SETTINGS: Settings = {
  fontScale: 1.2,
  themePreference: "system",
  lastOpenedNoteId: null,
};

export const useAppStore = create<AppState>((set, get) => ({
  currentNoteId: null,
  pendingInsertRef: null,
  settings: DEFAULT_SETTINGS,
  setCurrentNoteId: (id) => set({ currentNoteId: id }),
  requestInsertRef: (ref) => set({ pendingInsertRef: ref }),
  consumePendingInsert: () => {
    const ref = get().pendingInsertRef;
    if (ref !== null) set({ pendingInsertRef: null });
    return ref;
  },
  setSettings: (next) =>
    set((s) => ({ settings: { ...s.settings, ...next } })),
}));
