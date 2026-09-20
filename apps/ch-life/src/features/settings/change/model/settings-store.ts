import { create } from "zustand";
import type {
  AccentChoice,
  BlockStyle,
  FontFamily,
  Variation,
} from "@/shared/ui";

export type Settings = {
  fontScale: 1.0 | 1.2 | 1.4 | 1.6;
  themePreference: "system" | "light" | "dark";
  variation: Variation;
  blockStyle: BlockStyle;
  fontFamily: FontFamily;
  accentChoice: AccentChoice;
  /** 스키마에 있으나 읽는 곳이 없다(CONTRACT-SETTINGS-FILE). 파일 호환용. */
  lastOpenedNoteId: string | null;
  /** `"{BookCode} {chapter}"`. 성경 브라우저 위젯이 읽고 쓴다. */
  lastBibleRef: string | null;
  /** 스토어 업데이트 안내를 닫은 버전. 같은 버전은 다시 띄우지 않는다. */
  dismissedUpdateVersion: string | null;
};

export const DEFAULT_SETTINGS: Settings = {
  fontScale: 1.2,
  themePreference: "system",
  variation: "focus",
  blockStyle: "default",
  fontFamily: "sans",
  accentChoice: "default",
  lastOpenedNoteId: null,
  lastBibleRef: null,
  dismissedUpdateVersion: null,
};

type SettingsState = {
  settings: Settings;
  /** settings.json을 읽으려는 시도가 끝났는가. 기본값과 저장값을 가른다. */
  settingsLoaded: boolean;
  setSettings: (next: Partial<Settings>) => void;
  markSettingsLoaded: () => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  settingsLoaded: false,
  setSettings: (next) =>
    set((s) => ({ settings: { ...s.settings, ...next } })),
  markSettingsLoaded: () => set({ settingsLoaded: true }),
}));
