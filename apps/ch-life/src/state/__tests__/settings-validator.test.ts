import { parseSettings } from "../settings-validator";

const valid = {
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

describe("parseSettings", () => {
  it("정상 settings 통과", () => {
    expect(parseSettings(valid)).not.toBeNull();
    expect(parseSettings({ ...valid, fontScale: 1.6 })?.fontScale).toBe(1.6);
  });

  it("허용되지 않는 fontScale 거부", () => {
    expect(parseSettings({ ...valid, fontScale: 2.0 })).toBeNull();
    expect(parseSettings({ ...valid, fontScale: "1.2" })).toBeNull();
  });

  it("허용되지 않는 themePreference 거부", () => {
    expect(parseSettings({ ...valid, themePreference: "blue" })).toBeNull();
  });

  it("null/비객체 거부", () => {
    expect(parseSettings(null)).toBeNull();
    expect(parseSettings("string")).toBeNull();
  });

  it("lastBibleRef 없어도 파일 reject 안 함 → null 폴백", () => {
    const { lastBibleRef, ...withoutRef } = valid;
    const parsed = parseSettings(withoutRef);
    expect(parsed).not.toBeNull();
    expect(parsed?.lastBibleRef).toBeNull();
  });

  it("lastBibleRef 잘못된 타입이면 null 폴백(reject 아님)", () => {
    const parsed = parseSettings({ ...valid, lastBibleRef: 123 });
    expect(parsed).not.toBeNull();
    expect(parsed?.lastBibleRef).toBeNull();
  });

  it("lastBibleRef 정상 문자열 보존", () => {
    expect(parseSettings({ ...valid, lastBibleRef: "Gen 1" })?.lastBibleRef).toBe(
      "Gen 1",
    );
  });

  it("dismissedUpdateVersion 없거나 잘못돼도 파일 reject 안 함 → null 폴백", () => {
    const { dismissedUpdateVersion, ...withoutField } = valid;
    expect(parseSettings(withoutField)?.dismissedUpdateVersion).toBeNull();
    expect(
      parseSettings({ ...valid, dismissedUpdateVersion: 102 })
        ?.dismissedUpdateVersion,
    ).toBeNull();
  });

  it("dismissedUpdateVersion 정상 문자열 보존", () => {
    expect(
      parseSettings({ ...valid, dismissedUpdateVersion: "1.0.2" })
        ?.dismissedUpdateVersion,
    ).toBe("1.0.2");
  });
});
