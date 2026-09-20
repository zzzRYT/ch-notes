import { resolveBrowserQuery } from "../browser-search";

describe("resolveBrowserQuery", () => {
  it("'골' → 책 후보 (Col)", () => {
    const r = resolveBrowserQuery("골");
    expect(r).toEqual({ kind: "book", book: "Col" });
  });

  it("'골 3' → 장 점프", () => {
    expect(resolveBrowserQuery("골 3")).toEqual({
      kind: "chapter",
      book: "Col",
      chapter: 3,
    });
  });

  it("'골 3:20' → 절 점프", () => {
    expect(resolveBrowserQuery("골 3:20")).toEqual({
      kind: "verse",
      book: "Col",
      chapter: 3,
      verse: 20,
    });
  });

  it("'Col 3' (영어)", () => {
    expect(resolveBrowserQuery("Col 3")).toEqual({
      kind: "chapter",
      book: "Col",
      chapter: 3,
    });
  });

  it("'요한복음' (한국어 정식)", () => {
    expect(resolveBrowserQuery("요한복음")).toEqual({
      kind: "book",
      book: "Jhn",
    });
  });

  it("매칭 안 되는 입력은 null", () => {
    expect(resolveBrowserQuery("롤리")).toBeNull();
    expect(resolveBrowserQuery("xyz 99")).toBeNull();
  });

  it("빈/공백 입력은 null", () => {
    expect(resolveBrowserQuery("")).toBeNull();
    expect(resolveBrowserQuery("   ")).toBeNull();
  });
});
