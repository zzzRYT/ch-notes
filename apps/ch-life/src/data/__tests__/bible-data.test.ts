import bible from "../../../assets/bible-krv.json";

type BibleData = Record<string, Record<string, Record<string, string>>>;
const DATA = bible as BibleData;

describe("bible-krv.json", () => {
  it("66권을 가진다", () => {
    expect(Object.keys(DATA)).toHaveLength(66);
  });

  it("골로새서 3:20을 가진다", () => {
    const text = DATA["Col"]?.["3"]?.["20"];
    expect(typeof text).toBe("string");
    expect((text ?? "").length).toBeGreaterThan(0);
  });

  it("창세기 1:1을 가진다", () => {
    const text = DATA["Gen"]?.["1"]?.["1"];
    expect(text).toContain("태초에");
  });
});
