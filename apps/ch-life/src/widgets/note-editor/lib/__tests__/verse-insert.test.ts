import { getSchema, Node as TipTapNode } from "@tiptap/core";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Node as PMNode } from "@tiptap/pm/model";
import { EditorState, TextSelection } from "@tiptap/pm/state";
import { StarterKit } from "@tiptap/starter-kit";
import type { BlockNode, QuoteBlockNode } from "@/entities/note";
import { docToBlocks, VERSE_NODE, type PMDoc, type PMNode as JSONNode } from "../rich-doc";
import { verseInsertTransaction, verseShape, type VerseInsertTarget } from "../verse-insert";

// verse-bridge의 VerseQuote와 같은 스키마 모양(atom, block 그룹, block/label 속성)만 가진 최소 노드.
// verse-bridge 자체는 tentap(RN)을 끌고 와서 jest에서 못 연다.
const Verse = TipTapNode.create({
  name: VERSE_NODE,
  group: "block",
  atom: true,
  addAttributes() {
    return { block: { default: "{}" }, label: { default: "" } };
  },
});
const schema = getSchema([StarterKit, TaskList, TaskItem, Verse]);

const QUOTE: QuoteBlockNode = {
  type: "quote",
  ref: "창 1:2",
  verses: [{ book: "GEN", chapter: 1, verse: 2, text: "땅이 혼돈하고" }],
  status: "loaded",
  editionId: "open-bible-ko",
};
const card = () => schema.nodes[VERSE_NODE]!.create({ block: JSON.stringify(QUOTE), label: "창 1:2" });

const t = (text: string): JSONNode => ({ type: "text", text });
const p = (text?: string): JSONNode =>
  text ? { type: "paragraph", content: [t(text)] } : { type: "paragraph" };
const h = (text: string): JSONNode => ({ type: "heading", attrs: { level: 1 }, content: [t(text)] });
const li = (...kids: JSONNode[]): JSONNode => ({ type: "listItem", content: kids });
const ti = (checked: boolean, ...kids: JSONNode[]): JSONNode => ({
  type: "taskItem",
  attrs: { checked },
  content: kids,
});
const ul = (...items: JSONNode[]): JSONNode => ({ type: "bulletList", content: items });
const tl = (...items: JSONNode[]): JSONNode => ({ type: "taskList", content: items });
const bq = (...kids: JSONNode[]): JSONNode => ({ type: "blockquote", content: kids });
const doc = (...content: JSONNode[]): PMDoc => ({ type: "doc", content });

// 앞 공백까지 지우는 실제 RN 응답과 같은 모양: before = 캐럿 앞 글자, cut = 공백 + 참조.
const REF = "창1:2";
const target = (key: "space" | "enter", pos: number): VerseInsertTarget => ({
  pos,
  key,
  cut: 1 + REF.length,
  refText: " " + REF,
});

// 문서에서 처음 나오는 ` 창1:2` 의 끝(= 트리거 때 캐럿 위치).
function refEnd(d: PMNode): number {
  let found = -1;
  d.descendants((node, pos) => {
    const at = node.isText && found < 0 ? node.text!.indexOf(" " + REF) : -1;
    if (at >= 0) found = pos + at + 1 + REF.length;
  });
  if (found < 0) throw new Error("ref not found");
  return found;
}

function stateOf(json: PMDoc, head?: (d: PMNode) => number): EditorState {
  const d = schema.nodeFromJSON(json);
  const base = EditorState.create({ schema, doc: d });
  return head ? base.apply(base.tr.setSelection(TextSelection.create(d, head(d)))) : base;
}

// 인용이 최상위가 아니면 docToBlocks가 조용히 버린다 — 그 회귀를 직접 막는다.
function expectTopLevelCards(d: PMNode) {
  d.descendants((node, pos) => {
    if (node.type.name === VERSE_NODE) expect(d.resolve(pos).depth).toBe(0);
  });
}

function run(state: EditorState, r: VerseInsertTarget) {
  const tr = verseInsertTransaction(state, r, card());
  if (!tr) return null;
  const next = state.apply(tr);
  next.doc.check();
  expectTopLevelCards(next.doc);
  return next;
}

const stored = (s: EditorState): BlockNode[] => docToBlocks(s.doc.toJSON() as PMDoc);
const shape = (s: EditorState) => s.doc.content.content.map((n) => n.type.name);
const caretText = (s: EditorState) => s.selection.$head.parent.textContent;

describe("verse-insert: space", () => {
  test("top-level paragraph: [앞][카드][뒤] (회귀)", () => {
    const s = stateOf(doc(p("오늘 본문 창1:2 입니다")));
    const next = run(s, target("space", refEnd(s.doc)))!;
    expect(stored(next)).toEqual([
      { type: "paragraph", text: "오늘 본문" },
      QUOTE,
      { type: "paragraph", text: "입니다" },
    ]);
    expect(caretText(next)).toBe("입니다");
    expect(next.selection.$head.parentOffset).toBe(0);
  });

  test("heading keeps its kind in front, the rest becomes a paragraph", () => {
    const s = stateOf(doc(h("오늘 본문 창1:2 입니다")));
    const next = run(s, target("space", refEnd(s.doc)))!;
    expect(stored(next)).toEqual([
      { type: "heading", level: 1, text: "오늘 본문" },
      QUOTE,
      { type: "paragraph", text: "입니다" },
    ]);
    expect(shape(next)).toEqual(["heading", VERSE_NODE, "paragraph"]);
  });

  test("bullet", () => {
    const s = stateOf(doc(ul(li(p("오늘 본문 창1:2 입니다")))));
    const next = run(s, target("space", refEnd(s.doc)))!;
    expect(stored(next)).toEqual([
      { type: "bullet", text: "오늘 본문" },
      QUOTE,
      { type: "paragraph", text: "입니다" },
    ]);
    expect(caretText(next)).toBe("입니다");
  });

  test("todo keeps checked on the front item", () => {
    const s = stateOf(doc(tl(ti(true, p("오늘 본문 창1:2 입니다")))));
    const next = run(s, target("space", refEnd(s.doc)))!;
    expect(stored(next)).toEqual([
      { type: "todo", checked: true, text: "오늘 본문" },
      QUOTE,
      { type: "paragraph", text: "입니다" },
    ]);
  });

  test("blockquote", () => {
    const s = stateOf(doc(bq(p("오늘 본문 창1:2 입니다"))));
    const next = run(s, target("space", refEnd(s.doc)))!;
    expect(stored(next)).toEqual([
      { type: "blockquote", text: "오늘 본문" },
      QUOTE,
      { type: "paragraph", text: "입니다" },
    ]);
  });

  test("blockquote with more paragraphs: the following ones stay in a blockquote", () => {
    const s = stateOf(doc(bq(p("앞 창1:2 뒤"), p("둘째"))));
    const next = run(s, target("space", refEnd(s.doc)))!;
    expect(shape(next)).toEqual(["blockquote", VERSE_NODE, "paragraph", "blockquote"]);
    expect(stored(next)).toEqual([
      { type: "blockquote", text: "앞" },
      QUOTE,
      { type: "paragraph", text: "뒤" },
      { type: "blockquote", text: "둘째" },
    ]);
  });

  test("middle item of a multi-item list: the list splits in two, only one item is lifted", () => {
    const s = stateOf(doc(ul(li(p("하나")), li(p("둘 창1:2 뒤")), li(p("셋")), li(p("넷")))));
    const next = run(s, target("space", refEnd(s.doc)))!;
    expect(shape(next)).toEqual(["bulletList", VERSE_NODE, "paragraph", "bulletList"]);
    expect(next.doc.child(3).childCount).toBe(2);
    expect(stored(next)).toEqual([
      { type: "bullet", text: "하나" },
      { type: "bullet", text: "둘" },
      QUOTE,
      { type: "paragraph", text: "뒤" },
      { type: "bullet", text: "셋" },
      { type: "bullet", text: "넷" },
    ]);
    expect(caretText(next)).toBe("뒤");
  });

  test("last item: nothing is left to split off after the paragraph", () => {
    const s = stateOf(doc(ul(li(p("하나")), li(p("둘 창1:2 뒤")))));
    const next = run(s, target("space", refEnd(s.doc)))!;
    expect(shape(next)).toEqual(["bulletList", VERSE_NODE, "paragraph"]);
  });

  test("reference at the start of an item leaves an empty item in front", () => {
    const s = stateOf(doc(ul(li(p(" 창1:2 뒤")))));
    const next = run(s, target("space", refEnd(s.doc)))!;
    expect(stored(next)).toEqual([
      { type: "bullet", text: "" },
      QUOTE,
      { type: "paragraph", text: "뒤" },
    ]);
  });

  test("reference at the end of an item leaves an empty paragraph to keep typing in", () => {
    const s = stateOf(doc(ul(li(p("글 창1:2 ")), li(p("다음")))));
    const next = run(s, target("space", refEnd(s.doc)))!;
    expect(stored(next)).toEqual([
      { type: "bullet", text: "글" },
      QUOTE,
      { type: "paragraph", text: "" },
      { type: "bullet", text: "다음" },
    ]);
    expect(caretText(next)).toBe("");
    expect(next.selection.$head.parent.type.name).toBe("paragraph");
    expect(next.selection.$head.depth).toBe(1);
  });

  test("inline marks and a nested list under the item survive", () => {
    const s = stateOf(
      doc(
        ul(
          li(
            { type: "paragraph", content: [{ type: "text", text: "굵게", marks: [{ type: "bold" }] }, t(" 창1:2 뒤")] },
            ul(li(p("하위"))),
          ),
        ),
      ),
    );
    const next = run(s, target("space", refEnd(s.doc)))!;
    expect(stored(next)).toEqual([
      { type: "bullet", text: "**굵게**" },
      QUOTE,
      { type: "paragraph", text: "뒤" },
      { type: "bullet", text: "하위" },
    ]);
  });

  test("a stale document is discarded", () => {
    const s = stateOf(doc(ul(li(p("오늘 본문 창1:2 입니다")))));
    const pos = refEnd(s.doc);
    // 참조가 바뀜
    expect(verseInsertTransaction(s, { ...target("space", pos), refText: " 창1:3" }, card())).toBeNull();
    // 위치가 문서 밖 / 어긋남
    expect(verseInsertTransaction(s, target("space", pos + 3), card())).toBeNull();
    expect(verseInsertTransaction(s, target("space", 999), card())).toBeNull();
    // 트리거 공백이 사라짐(앞에서 지움)
    const edited = s.apply(s.tr.delete(pos, pos + 1));
    expect(verseInsertTransaction(edited, target("space", pos), card())).toBeNull();
  });

  test("a document whose block no longer qualifies is discarded", () => {
    const s = stateOf(doc(ul(li(p("a"), p("둘째 창1:2 뒤")))));
    expect(verseInsertTransaction(s, target("space", refEnd(s.doc)), card())).toBeNull();
  });
});

describe("verse-insert: guard (verseShape)", () => {
  const at = (json: PMDoc) => {
    const d = schema.nodeFromJSON(json);
    return d.resolve(refEnd(d));
  };

  test.each([
    ["paragraph", doc(p("a 창1:2 b")), "top"],
    ["heading", doc(h("a 창1:2 b")), "top"],
    ["bullet", doc(ul(li(p("a 창1:2 b")))), "list"],
    ["ordered list", doc({ type: "orderedList", content: [li(p("a 창1:2 b"))] }), "list"],
    ["todo", doc(tl(ti(false, p("a 창1:2 b")))), "list"],
    ["blockquote", doc(bq(p("a 창1:2 b"))), "quote"],
  ] as const)("%s is allowed", (_n, json, expected) => {
    expect(verseShape(at(json))).toBe(expected);
  });

  test.each([
    ["code block", doc({ type: "codeBlock", content: [t("a 창1:2 b")] })],
    ["nested list", doc(ul(li(p("x"), ul(li(p("a 창1:2 b"))))))],
    ["list inside a blockquote", doc(bq(ul(li(p("a 창1:2 b")))))],
    ["blockquote inside a blockquote", doc(bq(bq(p("a 창1:2 b"))))],
    ["second paragraph of a list item", doc(ul(li(p("x"), p("a 창1:2 b"))))],
  ])("%s is refused", (_n, json) => {
    expect(verseShape(at(json))).toBeNull();
  });

  test("a verse-quote node itself is refused", () => {
    const d = schema.nodeFromJSON(doc(p("앞"), { type: VERSE_NODE }));
    expect(verseShape(d.resolve(d.child(0).nodeSize))).toBeNull();
    expect(verseShape(d.resolve(0))).toBeNull();
  });
});

describe("verse-insert: enter", () => {
  // Enter가 이미 블록을 나눈 뒤의 문서 + 캐럿은 새 블록 맨 앞.
  const afterEnter = (json: PMDoc, restHead: (d: PMNode) => number) => {
    const s = stateOf(json, restHead);
    return { s, pos: refEnd(s.doc) };
  };
  const restStart = (n: number) => (d: PMNode) => refEnd(d) + n;

  test("paragraph: card goes between the two paragraphs, caret stays below", () => {
    const { s, pos } = afterEnter(doc(p("오늘 본문 창1:2"), p("다음")), restStart(2));
    const next = run(s, target("enter", pos))!;
    expect(stored(next)).toEqual([
      { type: "paragraph", text: "오늘 본문" },
      QUOTE,
      { type: "paragraph", text: "다음" },
    ]);
    expect(caretText(next)).toBe("다음");
    expect(next.selection.$head.parentOffset).toBe(0);
  });

  test("heading: the new block below becomes a paragraph", () => {
    const { s, pos } = afterEnter(doc(h("오늘 본문 창1:2"), h("뒤")), restStart(2));
    const next = run(s, target("enter", pos))!;
    expect(stored(next)).toEqual([
      { type: "heading", level: 1, text: "오늘 본문" },
      QUOTE,
      { type: "paragraph", text: "뒤" },
    ]);
  });

  test("list: Enter already made the next item; it leaves the list as a paragraph", () => {
    const { s, pos } = afterEnter(
      doc(ul(li(p("하나")), li(p("둘 창1:2")), li(p("")), li(p("셋")))),
      restStart(4),
    );
    expect(s.selection.$head.parent.type.name).toBe("paragraph");
    const next = run(s, target("enter", pos))!;
    expect(shape(next)).toEqual(["bulletList", VERSE_NODE, "paragraph", "bulletList"]);
    expect(stored(next)).toEqual([
      { type: "bullet", text: "하나" },
      { type: "bullet", text: "둘" },
      QUOTE,
      { type: "paragraph", text: "" },
      { type: "bullet", text: "셋" },
    ]);
    expect(next.selection.$head.depth).toBe(1);
    expect(next.selection.$head.parent.type.name).toBe("paragraph");
  });

  test("todo", () => {
    const { s, pos } = afterEnter(
      doc(tl(ti(true, p("할 일 창1:2")), ti(false, p("")))),
      restStart(4),
    );
    const next = run(s, target("enter", pos))!;
    expect(stored(next)).toEqual([
      { type: "todo", checked: true, text: "할 일" },
      QUOTE,
      { type: "paragraph", text: "" },
    ]);
  });

  test("blockquote: Enter split it into two paragraphs of one blockquote", () => {
    const { s, pos } = afterEnter(doc(bq(p("앞 창1:2"), p("뒤"))), restStart(2));
    const next = run(s, target("enter", pos))!;
    expect(shape(next)).toEqual(["blockquote", VERSE_NODE, "paragraph"]);
    expect(stored(next)).toEqual([
      { type: "blockquote", text: "앞" },
      QUOTE,
      { type: "paragraph", text: "뒤" },
    ]);
  });

  test("Enter that hasn't split anything yet is discarded", () => {
    const s = stateOf(doc(ul(li(p("둘 창1:2")))));
    expect(verseInsertTransaction(s, target("enter", refEnd(s.doc)), card())).toBeNull();
    const t2 = stateOf(doc(p("오늘 창1:2")));
    expect(verseInsertTransaction(t2, target("enter", refEnd(t2.doc)), card())).toBeNull();
  });

  test("reference no longer at the end of its block is discarded", () => {
    const { s, pos } = afterEnter(doc(ul(li(p("둘 창1:2 더")), li(p("")))), restStart(6));
    expect(verseInsertTransaction(s, target("enter", pos), card())).toBeNull();
  });

  test("next block is not a plain text block: discarded instead of guessing", () => {
    const s = stateOf(doc(p("앞 창1:2"), { type: VERSE_NODE }));
    expect(verseInsertTransaction(s, target("enter", refEnd(s.doc)), card())).toBeNull();
    const l = stateOf(doc(bq(p("앞 창1:2"), ul(li(p("x"))))));
    expect(verseInsertTransaction(l, target("enter", refEnd(l.doc)), card())).toBeNull();
  });

  test("caret moved elsewhere during the round trip: it is left to the mapping", () => {
    const s = stateOf(doc(ul(li(p("둘 창1:2")), li(p("")), li(p("끝")))), (d) => d.content.size - 3);
    const next = run(s, target("enter", refEnd(s.doc)))!;
    expect(caretText(next)).toBe("끝");
  });
});
