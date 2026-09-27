import { extractCitedRefs, type BlockNode } from "@/entities/note";
import { BUNDLED_EDITION_ID } from "@/entities/scripture";
import { insertVerse } from "../insert-verse";
import { replaceQuoteRef } from "../replace-quote";

describe("replaceQuoteRef", () => {
  const inserted = insertVerse([{ type: "paragraph", text: "앞" }], "요 3:16");
  if (!inserted.ok) throw new Error("fixture");
  const body: BlockNode[] = inserted.body;

  it("인용만 새 참조로 다시 만들고 나머지 블록은 그대로 둔다", () => {
    const next = replaceQuoteRef(body, 1, " 요 3:16-17 ");
    expect(next).not.toBeNull();
    expect(next![0]).toBe(body[0]);
    expect(next![2]).toBe(body[2]);
    expect(next![1]).toEqual(
      expect.objectContaining({
        type: "quote",
        ref: "요 3:16-17",
        status: "loaded",
        editionId: BUNDLED_EDITION_ID,
      }),
    );
    const quote = next![1];
    expect(quote?.type === "quote" && quote.verses).toHaveLength(2);
    // 저장 시 citedRefs는 본문에서 다시 뽑힌다(RULE-EDIT-009)
    expect(extractCitedRefs(next!)).toEqual(["요 3:16-17"]);
  });

  it("원본 배열을 바꾸지 않는다", () => {
    replaceQuoteRef(body, 1, "창 1:1");
    expect(body[1]).toEqual(expect.objectContaining({ ref: "요 3:16" }));
  });

  it("같은 구절(표기만 다름)이면 null", () => {
    expect(replaceQuoteRef(body, 1, "요한복음 3:16")).toBeNull();
    expect(replaceQuoteRef(body, 1, "요3:16")).toBeNull();
  });

  it("조회 실패·빈 입력이면 null", () => {
    expect(replaceQuoteRef(body, 1, "요 99:1")).toBeNull();
    expect(replaceQuoteRef(body, 1, "   ")).toBeNull();
  });

  it("인용이 아닌 자리면 null", () => {
    expect(replaceQuoteRef(body, 0, "창 1:1")).toBeNull();
    expect(replaceQuoteRef(body, 9, "창 1:1")).toBeNull();
  });
});
