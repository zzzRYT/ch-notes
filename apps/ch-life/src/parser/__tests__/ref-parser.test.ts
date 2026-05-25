import { parseRef } from "../ref-parser";

describe("parseRef", () => {
  it("'골 3:20' → Col 3:20", () => {
    expect(parseRef("골 3:20")).toEqual({
      book: "Col",
      chapter: 3,
      verse: 20,
      end: null,
    });
  });

  it("'골3:20' (공백 없음)", () => {
    expect(parseRef("골3:20")).toEqual({
      book: "Col",
      chapter: 3,
      verse: 20,
      end: null,
    });
  });

  it("'요한복음 3:16'", () => {
    expect(parseRef("요한복음 3:16")).toEqual({
      book: "Jhn",
      chapter: 3,
      verse: 16,
      end: null,
    });
  });

  it("'Col 3:20' (영어)", () => {
    expect(parseRef("Col 3:20")).toEqual({
      book: "Col",
      chapter: 3,
      verse: 20,
      end: null,
    });
  });

  it("'골 3:20-22' (범위)", () => {
    expect(parseRef("골 3:20-22")).toEqual({
      book: "Col",
      chapter: 3,
      verse: 20,
      end: 22,
    });
  });

  it("'창세기 1:1~3' (물결표 범위)", () => {
    expect(parseRef("창세기 1:1~3")).toEqual({
      book: "Gen",
      chapter: 1,
      verse: 1,
      end: 3,
    });
  });

  it("'창 1:1~3' (약어 + 물결표 범위)", () => {
    expect(parseRef("창 1:1~3")).toEqual({
      book: "Gen",
      chapter: 1,
      verse: 1,
      end: 3,
    });
  });

  it("'골 3:20～22' (전각 물결표 범위)", () => {
    expect(parseRef("골 3:20～22")).toEqual({
      book: "Col",
      chapter: 3,
      verse: 20,
      end: 22,
    });
  });

  it("데드 패턴 'abc'", () => {
    expect(parseRef("abc")).toBeNull();
  });

  it("범위 끝이 시작보다 작으면 그대로 받지만 end는 number", () => {
    // 정책: 파서는 패턴만 보고, 시맨틱 검증(end < verse 등)은 lookupVerses에서.
    expect(parseRef("골 3:20-19")).toEqual({
      book: "Col",
      chapter: 3,
      verse: 20,
      end: 19,
    });
  });

  it("앞뒤 공백은 trim", () => {
    expect(parseRef("  골 3:20  ")).toEqual({
      book: "Col",
      chapter: 3,
      verse: 20,
      end: null,
    });
  });
});
