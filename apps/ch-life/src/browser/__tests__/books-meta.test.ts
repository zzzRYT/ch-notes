import { BOOKS_META, chapterCount, verseCount } from "../books-meta";

describe("BOOKS_META", () => {
  it("총 66권", () => {
    expect(BOOKS_META).toHaveLength(66);
  });

  it("구약 39권 / 신약 27권", () => {
    const ot = BOOKS_META.filter((m) => m.testament === "OT");
    const nt = BOOKS_META.filter((m) => m.testament === "NT");
    expect(ot).toHaveLength(39);
    expect(nt).toHaveLength(27);
  });

  it("code는 중복 없음", () => {
    const codes = BOOKS_META.map((m) => m.code);
    expect(new Set(codes).size).toBe(66);
  });
});

describe("chapterCount / verseCount", () => {
  it("Col 3장 있음", () => {
    expect(chapterCount("Col")).toBeGreaterThanOrEqual(1);
  });
  it("Col 3장 절 수 (KRV)", () => {
    expect(verseCount("Col", 3)).toBe(25);
  });
  it("Gen 1장 절 수 (KRV)", () => {
    expect(verseCount("Gen", 1)).toBe(31);
  });
  it("존재하지 않는 장은 0", () => {
    expect(verseCount("Rev", 99)).toBe(0);
    expect(verseCount("Gen", 999)).toBe(0);
  });
});
