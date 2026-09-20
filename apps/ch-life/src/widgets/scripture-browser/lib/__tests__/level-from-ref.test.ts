import { levelFromRef } from "../level-from-ref";

describe("levelFromRef", () => {
  it("null/빈값 → 책 목록", () => {
    expect(levelFromRef(null)).toEqual({ kind: "books" });
    expect(levelFromRef(undefined)).toEqual({ kind: "books" });
    expect(levelFromRef("")).toEqual({ kind: "books" });
  });

  it("'Gen 1' → 해당 장의 절 목록", () => {
    expect(levelFromRef("Gen 1")).toEqual({ kind: "verses", book: "Gen", chapter: 1 });
  });

  it("한글 책명도 처리 ('시 23')", () => {
    expect(levelFromRef("시 23")).toEqual({ kind: "verses", book: "Psa", chapter: 23 });
  });

  it("책만 있으면 ('Gen') → 장 그리드", () => {
    expect(levelFromRef("Gen")).toEqual({ kind: "chapters", book: "Gen" });
  });

  it("파싱 실패 → 책 목록", () => {
    expect(levelFromRef("zzzzz 99")).toEqual({ kind: "books" });
  });
});
