import { docToBlocks, blocksToDoc, type PMDoc } from "../doc";
import {
  inlineToMarkdown,
  markdownToInline,
  stripInlineMarks,
} from "../inlineMarks";
import type { BlockNode } from "@/domain/types";

describe("inlineMarks", () => {
  test("wraps single marks", () => {
    expect(
      inlineToMarkdown([{ type: "text", text: "hi", marks: [{ type: "bold" }] }]),
    ).toBe("**hi**");
    expect(
      inlineToMarkdown([{ type: "text", text: "hi", marks: [{ type: "italic" }] }]),
    ).toBe("_hi_");
    expect(
      inlineToMarkdown([
        { type: "text", text: "hi", marks: [{ type: "underline" }] },
      ]),
    ).toBe("++hi++");
  });

  test("nests bold + italic deterministically", () => {
    const out = inlineToMarkdown([
      { type: "text", text: "x", marks: [{ type: "bold" }, { type: "italic" }] },
    ]);
    expect(out).toBe("**_x_**");
  });

  test("hardBreak becomes newline", () => {
    expect(
      inlineToMarkdown([
        { type: "text", text: "a" },
        { type: "hardBreak" },
        { type: "text", text: "b" },
      ]),
    ).toBe("a\nb");
  });

  test("markdownToInline parses marks back", () => {
    expect(markdownToInline("**hi**")).toEqual([
      { type: "text", text: "hi", marks: [{ type: "bold" }] },
    ]);
    expect(markdownToInline("**_x_**")).toEqual([
      { type: "text", text: "x", marks: [{ type: "bold" }, { type: "italic" }] },
    ]);
  });

  test("inline round trip", () => {
    const md = "a **bold** and _italic_ and ++under++ end";
    expect(inlineToMarkdown(markdownToInline(md))).toBe(md);
  });

  test("stripInlineMarks removes delimiters", () => {
    expect(stripInlineMarks("a **b** _c_ ++d++")).toBe("a b c d");
  });
});

describe("docToBlocks", () => {
  test("maps every block type", () => {
    const doc: PMDoc = {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "제목" }] },
        { type: "paragraph", content: [{ type: "text", text: "본문" }] },
        {
          type: "bulletList",
          content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "항목1" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "항목2" }] }] },
          ],
        },
        {
          type: "taskList",
          content: [
            { type: "taskItem", attrs: { checked: true }, content: [{ type: "paragraph", content: [{ type: "text", text: "완료" }] }] },
            { type: "taskItem", attrs: { checked: false }, content: [{ type: "paragraph", content: [{ type: "text", text: "할일" }] }] },
          ],
        },
        { type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: "인용" }] }] },
        {
          type: "verseQuote",
          attrs: {
            ref: "Col 3:20",
            verses: JSON.stringify([
              { book: "Col", chapter: 3, verse: 20, text: "순종하라" },
            ]),
            status: "loaded",
          },
        },
      ],
    };
    expect(docToBlocks(doc)).toEqual<BlockNode[]>([
      { type: "heading", level: 1, text: "제목" },
      { type: "paragraph", text: "본문" },
      { type: "bullet", text: "항목1" },
      { type: "bullet", text: "항목2" },
      { type: "todo", checked: true, text: "완료" },
      { type: "todo", checked: false, text: "할일" },
      { type: "blockquote", text: "인용" },
      {
        type: "quote",
        ref: "Col 3:20",
        verses: [{ book: "Col", chapter: 3, verse: 20, text: "순종하라" }],
        status: "loaded",
      },
    ]);
  });

  test("reads verse node status (loading/error round-trip)", () => {
    const doc: PMDoc = {
      type: "doc",
      content: [
        {
          type: "verseQuote",
          attrs: { ref: "Gen 1:1", verses: "[]", status: "loading" },
        },
      ],
    };
    const block = docToBlocks(doc)[0];
    expect(block).toEqual({
      type: "quote",
      ref: "Gen 1:1",
      verses: [],
      status: "loading",
    });
  });

  test("clamps heading level to 1..3", () => {
    const doc: PMDoc = {
      type: "doc",
      content: [{ type: "heading", attrs: { level: 5 }, content: [{ type: "text", text: "x" }] }],
    };
    expect(docToBlocks(doc)[0]).toEqual({ type: "heading", level: 3, text: "x" });
  });

  test("empty doc yields one empty paragraph", () => {
    expect(docToBlocks({ type: "doc", content: [] })).toEqual([
      { type: "paragraph", text: "" },
    ]);
  });
});

describe("blocksToDoc", () => {
  test("groups consecutive bullets and todos", () => {
    const blocks: BlockNode[] = [
      { type: "bullet", text: "a" },
      { type: "bullet", text: "b" },
      { type: "todo", checked: false, text: "c" },
    ];
    const doc = blocksToDoc(blocks);
    expect(doc.content?.map((n) => n.type)).toEqual(["bulletList", "taskList"]);
    expect(doc.content?.[0]?.content).toHaveLength(2);
  });

  test("round trip blocks -> doc -> blocks", () => {
    const blocks: BlockNode[] = [
      { type: "heading", level: 2, text: "소제목" },
      { type: "paragraph", text: "평문 **굵게** 끝" },
      { type: "bullet", text: "first" },
      { type: "bullet", text: "second" },
      { type: "todo", checked: true, text: "done" },
      { type: "blockquote", text: "인용문" },
      {
        type: "quote",
        ref: "Gen 1:1",
        verses: [{ book: "Gen", chapter: 1, verse: 1, text: "태초에" }],
        status: "loaded",
      },
    ];
    expect(docToBlocks(blocksToDoc(blocks))).toEqual(blocks);
  });
});
