import { blockToMarkdown } from "../serialize";
import { markdownToNote } from "../parse";
import type { BlockNode } from "@/domain/types";

function bodyFromMarkdown(md: string): BlockNode[] {
  const note = markdownToNote(md);
  return note?.body ?? [];
}

describe("rich block markdown", () => {
  test("serializes each block type", () => {
    expect(blockToMarkdown({ type: "heading", level: 1, text: "제목" })).toBe("# 제목");
    expect(blockToMarkdown({ type: "heading", level: 3, text: "소제목" })).toBe("### 소제목");
    expect(blockToMarkdown({ type: "bullet", text: "항목" })).toBe("- 항목");
    expect(blockToMarkdown({ type: "todo", checked: true, text: "완료" })).toBe("- [x] 완료");
    expect(blockToMarkdown({ type: "todo", checked: false, text: "할일" })).toBe("- [ ] 할일");
    expect(blockToMarkdown({ type: "blockquote", text: "인용문" })).toBe("> 인용문");
    expect(blockToMarkdown({ type: "paragraph", text: "평문 **굵게**" })).toBe("평문 **굵게**");
  });

  test("parses heading / bullet / todo / blockquote", () => {
    const md = [
      "# 제목",
      "",
      "본문 단락",
      "",
      "- 첫째",
      "",
      "- 둘째",
      "",
      "- [x] 끝낸 일",
      "",
      "- [ ] 남은 일",
      "",
      "> 일반 인용",
    ].join("\n");
    expect(bodyFromMarkdown(md)).toEqual<BlockNode[]>([
      { type: "heading", level: 1, text: "제목" },
      { type: "paragraph", text: "본문 단락" },
      { type: "bullet", text: "첫째" },
      { type: "bullet", text: "둘째" },
      { type: "todo", checked: true, text: "끝낸 일" },
      { type: "todo", checked: false, text: "남은 일" },
      { type: "blockquote", text: "일반 인용" },
    ]);
  });

  test("plain blockquote is not mistaken for a scripture quote", () => {
    const body = bodyFromMarkdown("> 그냥 인용한 문장입니다");
    expect(body[0]).toEqual({ type: "blockquote", text: "그냥 인용한 문장입니다" });
  });

  test("scripture quote header is still recognized", () => {
    const body = bodyFromMarkdown("> **Col 3:20** (KRV)\n> 자녀들아");
    expect(body[0]?.type).toBe("quote");
  });

  test("body round trips through markdown", () => {
    const body: BlockNode[] = [
      { type: "heading", level: 2, text: "오늘의 말씀" },
      { type: "paragraph", text: "평문 _기울임_ 과 ++밑줄++" },
      { type: "bullet", text: "기도제목 1" },
      { type: "bullet", text: "기도제목 2" },
      { type: "todo", checked: false, text: "심방 가기" },
      { type: "blockquote", text: "묵상 한 줄" },
    ];
    // Serialize via the note serializer path, then parse back.
    const md = body.map(blockToMarkdown).join("\n\n");
    expect(bodyFromMarkdown(md)).toEqual(body);
  });
});
