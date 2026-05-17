import { lookupVerses } from "../verse-lookup";

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
    // Col 3:20-23 — 23은 placeholder JSON에 없음
    expect(lookupVerses("골 3:20-23")).toBeNull();
  });

  it("end < verse면 null", () => {
    expect(lookupVerses("골 3:20-19")).toBeNull();
  });
});
