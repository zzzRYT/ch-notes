import type { BlockNode } from "@/entities/note";
import { detectRefAtCursor } from "../autocomplete";
import { splitParagraphWithQuote } from "../split-paragraph";

function split(block: BlockNode, before: string) {
  const ref = detectRefAtCursor(before, before.length)!;
  return splitParagraphWithQuote([block], 0, before, ref)!;
}

describe("splitParagraphWithQuote", () => {
  test("a paragraph splits into paragraph / quote / paragraph", () => {
    const out = split({ type: "paragraph", text: "" }, "보라 창 1:1");
    expect(out.map((b) => b.type)).toEqual(["paragraph", "quote", "paragraph"]);
    expect(out[0]).toEqual({ type: "paragraph", text: "보라" });
  });

  test("a bullet keeps its text and stays a bullet before the quote", () => {
    const out = split({ type: "bullet", text: "" }, "보라 창 1:1");
    expect(out.map((b) => b.type)).toEqual(["bullet", "quote", "paragraph"]);
    expect(out[0]).toEqual({ type: "bullet", text: "보라" });
  });
});
