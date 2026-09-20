import { DEFAULT_SETTINGS, useSettingsStore } from "../settings-store";

describe("settings-store", () => {
  beforeEach(() => {
    useSettingsStore.setState({
      settings: { ...DEFAULT_SETTINGS, variation: "minimal" },
      settingsLoaded: false,
    });
  });

  it("기본 fontScale은 1.2", () => {
    expect(useSettingsStore.getState().settings.fontScale).toBe(1.2);
  });

  it("setSettings는 부분 머지", () => {
    useSettingsStore.getState().setSettings({ fontScale: 1.4 });
    const s = useSettingsStore.getState().settings;
    expect(s.fontScale).toBe(1.4);
    expect(s.themePreference).toBe("system");
    expect(s.variation).toBe("minimal");
  });

  it("기본 lastBibleRef는 null", () => {
    expect(useSettingsStore.getState().settings.lastBibleRef).toBeNull();
  });

  it("setSettings로 lastBibleRef 갱신", () => {
    useSettingsStore.getState().setSettings({ lastBibleRef: "Gen 1" });
    expect(useSettingsStore.getState().settings.lastBibleRef).toBe("Gen 1");
  });

  it("markSettingsLoaded는 로드 완료 신호만 올린다", () => {
    expect(useSettingsStore.getState().settingsLoaded).toBe(false);
    useSettingsStore.getState().markSettingsLoaded();
    expect(useSettingsStore.getState().settingsLoaded).toBe(true);
    expect(useSettingsStore.getState().settings.fontScale).toBe(1.2);
  });
});
