import { useAppStore } from "../app-store";

describe("app-store", () => {
  beforeEach(() => {
    useAppStore.setState({
      currentNoteId: null,
      settings: {
        fontScale: 1.2,
        themePreference: "system",
        lastOpenedNoteId: null,
      },
    });
  });

  it("currentNoteId 초기값은 null", () => {
    expect(useAppStore.getState().currentNoteId).toBeNull();
  });

  it("setCurrentNoteId가 동작한다", () => {
    useAppStore.getState().setCurrentNoteId("01HABC");
    expect(useAppStore.getState().currentNoteId).toBe("01HABC");
  });

  it("기본 fontScale은 1.2", () => {
    expect(useAppStore.getState().settings.fontScale).toBe(1.2);
  });

  it("setSettings는 부분 머지", () => {
    useAppStore.getState().setSettings({ fontScale: 1.4 });
    const s = useAppStore.getState().settings;
    expect(s.fontScale).toBe(1.4);
    expect(s.themePreference).toBe("system");
  });
});
