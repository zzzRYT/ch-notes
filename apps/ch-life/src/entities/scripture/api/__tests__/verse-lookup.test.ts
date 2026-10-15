import { createBibleLookup } from "../bible-lookup";
import { lookupVerses } from "../verse-lookup";

describe("createBibleLookup", () => {
  const { lookupVerses: lookup } = createBibleLookup({
    Gen: { "1": { "1": "처음", "2": "둘째" } },
  });

  it("주입한 데이터에서 한 절과 범위를 찾는다", () => {
    expect(lookup("창 1:1")).toEqual([
      { book: "Gen", chapter: 1, verse: 1, text: "처음" },
    ]);
    expect(lookup("창 1:1-2")).toEqual([
      { book: "Gen", chapter: 1, verse: 1, text: "처음" },
      { book: "Gen", chapter: 1, verse: 2, text: "둘째" },
    ]);
  });

  it("없는 장, 불완전 범위, 역순 범위는 null", () => {
    expect(lookup("창 2:1")).toBeNull();
    expect(lookup("창 1:1-3")).toBeNull();
    expect(lookup("창 1:2-1")).toBeNull();
  });
});

describe("lookupVerses", () => {
  it("'골 3:20' 단절", () => {
    const v = lookupVerses("골 3:20");
    expect(v).not.toBeNull();
    expect(v).toHaveLength(1);
    const first = v?.[0];
    expect(first?.book).toBe("Col");
    expect(first?.chapter).toBe(3);
    expect(first?.verse).toBe(20);
    expect(typeof first?.text).toBe("string");
    expect(first?.text).toContain("자녀들아");
  });

  it("'골 3:20-22' 범위", () => {
    const v = lookupVerses("골 3:20-22");
    expect(v).not.toBeNull();
    expect(v).toHaveLength(3);
    expect(v?.[2]?.verse).toBe(22);
  });

  it("데드 ref (존재하지 않는 절)", () => {
    expect(lookupVerses("골 99:99")).toBeNull();
  });

  it("파싱 실패", () => {
    expect(lookupVerses("abc")).toBeNull();
  });

  it("범위 일부가 비면 null", () => {
    // 골 3장은 25절까지 — 24-26 범위는 26절이 없으므로 전체 null
    expect(lookupVerses("골 3:24-26")).toBeNull();
  });

  it("end < verse면 null", () => {
    expect(lookupVerses("골 3:20-19")).toBeNull();
  });
});
