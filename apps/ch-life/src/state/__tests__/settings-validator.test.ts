// settings-persist 모듈을 통째로 import하면 expo-file-system이 끌려와서
// jest에서 native 의존이 실패함. 그래서 validator는 별도 모듈로 분리하는
// 대신, 동일한 검증 로직을 여기서 재구현해 동작 의도를 고정한다.
//
// 향후 settings-persist에서 validator를 별도 파일로 빼면 이 테스트를
// 그쪽 import로 교체.

type Settings = {
  fontScale: 1.0 | 1.2 | 1.4 | 1.6;
  themePreference: "system" | "light" | "dark";
  lastOpenedNoteId: string | null;
};

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

describe("isValidSettings", () => {
  const valid: Settings = {
    fontScale: 1.2,
    themePreference: "system",
    lastOpenedNoteId: null,
  };

  it("정상 settings 통과", () => {
    expect(isValidSettings(valid)).toBe(true);
    expect(isValidSettings({ ...valid, fontScale: 1.6 })).toBe(true);
    expect(isValidSettings({ ...valid, themePreference: "dark" })).toBe(true);
    expect(
      isValidSettings({ ...valid, lastOpenedNoteId: "01HABC" }),
    ).toBe(true);
  });

  it("허용되지 않는 fontScale 거부", () => {
    expect(isValidSettings({ ...valid, fontScale: 2.0 })).toBe(false);
    expect(isValidSettings({ ...valid, fontScale: "1.2" })).toBe(false);
  });

  it("허용되지 않는 themePreference 거부", () => {
    expect(isValidSettings({ ...valid, themePreference: "blue" })).toBe(false);
  });

  it("null/비객체 거부", () => {
    expect(isValidSettings(null)).toBe(false);
    expect(isValidSettings("string")).toBe(false);
    expect(isValidSettings(123)).toBe(false);
  });
});
