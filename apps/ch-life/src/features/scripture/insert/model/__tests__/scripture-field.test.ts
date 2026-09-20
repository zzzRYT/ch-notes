import { validateScripture } from "../scripture-field";

describe("validateScripture", () => {
  it("존재하는 참조는 valid=true, verses 반환", () => {
    const r = validateScripture("창 1:1");
    expect(r.valid).toBe(true);
    expect(r.verses).not.toBeNull();
    expect((r.verses?.length ?? 0)).toBeGreaterThan(0);
  });

  it("빈 문자열/공백은 valid=false, verses=null", () => {
    expect(validateScripture("")).toEqual({ valid: false, verses: null });
    expect(validateScripture("   ")).toEqual({ valid: false, verses: null });
  });

  it("파싱 불가/없는 본문은 valid=false", () => {
    const r = validateScripture("없는책 1:1");
    expect(r.valid).toBe(false);
    expect(r.verses).toBeNull();
  });
});
