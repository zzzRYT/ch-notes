import { extractCitedRefs } from "../cited-refs";
import type { BlockNode } from "@/domain/types";

describe("extractCitedRefs", () => {
  it("quote 노드의 ref를 모은다 (등장 순서 유지)", () => {
    const body: BlockNode[] = [
      { type: "paragraph", text: "" },
      { type: "quote", ref: "Col 3:20", verses: [], status: "loaded" },
      { type: "paragraph", text: "" },
      { type: "quote", ref: "Eph 5:21", verses: [], status: "loaded" },
    ];
    expect(extractCitedRefs(body)).toEqual(["Col 3:20", "Eph 5:21"]);
  });

  it("중복은 제거", () => {
    const body: BlockNode[] = [
      { type: "quote", ref: "Col 3:20", verses: [], status: "loaded" },
      { type: "quote", ref: "Col 3:20", verses: [], status: "loaded" },
    ];
    expect(extractCitedRefs(body)).toEqual(["Col 3:20"]);
  });

  it("paragraph만 있으면 빈 배열", () => {
    expect(
      extractCitedRefs([{ type: "paragraph", text: "본문" }]),
    ).toEqual([]);
  });

  it("빈 body면 빈 배열", () => {
    expect(extractCitedRefs([])).toEqual([]);
  });
});
