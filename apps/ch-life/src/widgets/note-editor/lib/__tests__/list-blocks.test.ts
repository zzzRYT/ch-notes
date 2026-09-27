import type { BlockNode } from "@/entities/note";
import { splitBulletLines, toggleBullet } from "../list-blocks";

const p = (text: string): BlockNode => ({ type: "paragraph", text });
const b = (text: string): BlockNode => ({ type: "bullet", text });

describe("toggleBullet", () => {
  test("a single-line paragraph becomes a bullet", () => {
    expect(toggleBullet([p("하나")], 0, "하나", 2)).toEqual({
      body: [b("하나")],
      focusIdx: 0,
    });
  });

  test("only the caret's line of a multi-line paragraph becomes a bullet", () => {
    const text = "위\n가운데\n아래";
    expect(toggleBullet([p(text)], 0, text, 4)).toEqual({
      body: [p("위"), b("가운데"), p("아래")],
      focusIdx: 1,
    });
  });

  test("first and last lines leave no empty paragraphs behind", () => {
    expect(toggleBullet([p("a\nb")], 0, "a\nb", 0)?.body).toEqual([b("a"), p("b")]);
    expect(toggleBullet([p("a\nb")], 0, "a\nb", 3)?.body).toEqual([p("a"), b("b")]);
  });

  test("uses the live text, not the stale committed block text", () => {
    expect(toggleBullet([p("")], 0, "방금 친 글", 5)?.body).toEqual([b("방금 친 글")]);
  });

  test("a bullet goes back to a paragraph", () => {
    expect(toggleBullet([p("x"), b("y")], 1, "y", 1)).toEqual({
      body: [p("x"), p("y")],
      focusIdx: 1,
    });
  });

  test("a quote is left alone", () => {
    const quote: BlockNode = { type: "quote", ref: "창 1:1", verses: [], status: "loaded" };
    expect(toggleBullet([quote], 0, "", 0)).toBeNull();
  });
});

describe("splitBulletLines", () => {
  test("Return at the end of a bullet opens a new empty bullet", () => {
    expect(splitBulletLines([b("첫째"), p("뒤")], 0, "첫째\n")).toEqual({
      body: [b("첫째"), b(""), p("뒤")],
      focusIdx: 1,
    });
  });

  test("Return in the middle splits the bullet", () => {
    expect(splitBulletLines([b("ab")], 0, "a\nb").body).toEqual([b("a"), b("b")]);
  });

  test("Return on an empty bullet ends the list in place", () => {
    expect(splitBulletLines([b("a"), b("")], 1, "\n")).toEqual({
      body: [b("a"), p("")],
      focusIdx: 1,
    });
  });

  test("pasting several lines makes one bullet per line", () => {
    expect(splitBulletLines([b("")], 0, "x\ny\nz")).toEqual({
      body: [b("x"), b("y"), b("z")],
      focusIdx: 2,
    });
  });
});
