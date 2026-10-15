import { validateScriptureWithLookup } from "../scripture-field-core";
import { validateScripture } from "../scripture-field";

describe("validateScriptureWithLookup", () => {
  it("주입된 조회 함수 결과로 유효성을 판정한다", () => {
    const lookup = (ref: string) =>
      ref === "창 1:1"
        ? [{ book: "Gen" as const, chapter: 1, verse: 1, text: "처음" }]
        : null;

    expect(validateScriptureWithLookup(" 창 1:1 ", lookup)).toEqual({
      valid: true,
      verses: [{ book: "Gen", chapter: 1, verse: 1, text: "처음" }],
    });
    expect(validateScriptureWithLookup("없는 참조", lookup)).toEqual({
      valid: false,
      verses: null,
    });
  });
});

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
