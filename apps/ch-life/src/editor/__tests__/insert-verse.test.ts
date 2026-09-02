import type { BlockNode } from "@/domain/types";
import { insertVerse } from "../insert-verse";

describe("insertVerse", () => {
  const body: BlockNode[] = [{ type: "paragraph", text: "메모" }];

  it("인용 블록과 빈 문단을 붙이고 표시용 성공 문구를 반환한다", () => {
    const result = insertVerse(body, "요 3:16");
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected success");
    expect(result.body.slice(-2)).toEqual([
      expect.objectContaining({
        type: "quote",
        ref: "요 3:16",
        status: "loaded",
      }),
      { type: "paragraph", text: "" },
    ]);
    expect(result.message).toBe("요한복음 3:16을 노트에 추가했습니다");
  });

  it("조회 실패 시 원래 본문과 오류 문구를 반환한다", () => {
    expect(insertVerse(body, "없는 구절")).toEqual({
      ok: false,
      body,
      message: "성경 구절을 추가하지 못했습니다",
    });
  });
});
