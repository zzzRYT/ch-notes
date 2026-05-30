import {
  META_FIELD_ORDER,
  nextMetaField,
  firstParagraphIndex,
} from "../field-nav";
import type { BlockNode } from "@/domain/types";

describe("nextMetaField", () => {
  it("필드는 정의된 순서대로 다음 필드를 가리킨다", () => {
    expect(nextMetaField("title")).toBe("date");
    expect(nextMetaField("date")).toBe("preacher");
    expect(nextMetaField("preacher")).toBe("location");
    expect(nextMetaField("location")).toBe("scripture");
  });

  it("마지막 메타 필드 다음은 본문으로 넘어간다", () => {
    expect(nextMetaField("scripture")).toBe("body");
  });

  it("순서 배열은 다섯 개 메타 필드를 담는다", () => {
    expect(META_FIELD_ORDER).toEqual([
      "title",
      "date",
      "preacher",
      "location",
      "scripture",
    ]);
  });
});

describe("firstParagraphIndex", () => {
  it("첫 단락 블록의 인덱스를 찾는다", () => {
    const body: BlockNode[] = [{ type: "paragraph", text: "안녕" }];
    expect(firstParagraphIndex(body)).toBe(0);
  });

  it("앞쪽 인용 블록을 건너뛰고 첫 단락을 찾는다", () => {
    const body: BlockNode[] = [
      { type: "quote", ref: "요 3:16", verses: [], status: "loaded" },
      { type: "paragraph", text: "" },
    ];
    expect(firstParagraphIndex(body)).toBe(1);
  });

  it("단락이 없으면 -1", () => {
    const body: BlockNode[] = [
      { type: "quote", ref: "요 3:16", verses: [], status: "loaded" },
    ];
    expect(firstParagraphIndex(body)).toBe(-1);
  });
});
