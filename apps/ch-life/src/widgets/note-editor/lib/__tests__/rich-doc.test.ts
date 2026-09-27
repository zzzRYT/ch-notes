import type { BlockNode } from "@/entities/note";
import { blocksToDoc, docToBlocks, markdownToInline } from "../rich-doc";

const roundTrip = (body: BlockNode[]) => docToBlocks(blocksToDoc(body, (r) => r));

describe("rich-doc", () => {
  test("every block type survives BlockNode[] → doc → BlockNode[]", () => {
    const body: BlockNode[] = [
      { type: "heading", level: 2, text: "설교 **제목**" },
      { type: "paragraph", text: "a **b** _c_ ++d++ **_e_**\n둘째 줄" },
      { type: "bullet", text: "하나" },
      { type: "bullet", text: "++둘++" },
      { type: "todo", checked: true, text: "기도" },
      { type: "blockquote", text: "인용문" },
      {
        type: "quote",
        ref: "요 3:16",
        verses: [{ book: "JHN", chapter: 3, verse: 16, text: "하나님이 세상을" }],
        status: "loaded",
        editionId: "open-bible-ko",
      },
      { type: "paragraph", text: "" },
    ];
    expect(roundTrip(body)).toEqual(body);
  });

  test("consecutive bullets become one list", () => {
    const doc = blocksToDoc(
      [
        { type: "bullet", text: "a" },
        { type: "bullet", text: "b" },
      ],
      (r) => r,
    );
    expect(doc.content).toHaveLength(1);
    expect(doc.content![0]!.content).toHaveLength(2);
  });

  test("an unpaired delimiter stays literal text", () => {
    expect(markdownToInline("snake_case 2**3")).toEqual([
      { type: "text", text: "snake_case 2**3" },
    ]);
    expect(roundTrip([{ type: "paragraph", text: "snake_case" }])).toEqual([
      { type: "paragraph", text: "snake_case" },
    ]);
  });
});
