import type { BlockNode, InlineMark, QuoteBlockNode } from "@/entities/note";

// WebView 에디터(TipTap)의 문서 JSON ↔ 저장 모델 BlockNode[].
// 저장 형식은 그대로다 — 인라인 강조는 텍스트 안의 `**`·`_`·`++`(RULE-EDIT-010).
export type PMMark = { type: string };
export type PMNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: PMNode[];
  text?: string;
  marks?: PMMark[];
};
export type PMDoc = { type: "doc"; content?: PMNode[] };

export const VERSE_NODE = "verseQuote";

const DELIM: Record<InlineMark, string> = { bold: "**", italic: "_", underline: "++" };
// 바깥 → 안쪽 고정 순서라 직렬화 결과가 결정적이다.
const WRAP_ORDER: readonly InlineMark[] = ["underline", "bold", "italic"];
// 긴 구분자 먼저 — `**`를 기울임 두 개로 읽지 않는다.
const SCAN_ORDER: readonly InlineMark[] = ["bold", "underline", "italic"];

function isMark(t: string): t is InlineMark {
  return t === "bold" || t === "italic" || t === "underline";
}

export function inlineToMarkdown(content: PMNode[] | undefined): string {
  let out = "";
  for (const node of content ?? []) {
    if (node.type === "hardBreak") out += "\n";
    else if (node.type === "text" && node.text) {
      const marks = new Set((node.marks ?? []).map((m) => m.type).filter(isMark));
      out += WRAP_ORDER.reduceRight(
        (s, m) => (marks.has(m) ? DELIM[m] + s + DELIM[m] : s),
        node.text,
      );
    }
  }
  return out;
}

// 짝이 있는 구분자만 강조로 연다 — `snake_case`의 `_`는 글자 그대로 남는다.
export function markdownToInline(text: string): PMNode[] {
  const nodes: PMNode[] = [];
  const active = new Set<InlineMark>();
  let buf = "";
  const flush = () => {
    if (!buf) return;
    const marks = WRAP_ORDER.filter((m) => active.has(m)).map((type) => ({ type }));
    nodes.push(marks.length ? { type: "text", text: buf, marks } : { type: "text", text: buf });
    buf = "";
  };
  let i = 0;
  while (i < text.length) {
    if (text[i] === "\n") {
      flush();
      nodes.push({ type: "hardBreak" });
      i += 1;
      continue;
    }
    const mark = SCAN_ORDER.find((m) => {
      const d = DELIM[m];
      return text.startsWith(d, i) && (active.has(m) || text.indexOf(d, i + d.length) !== -1);
    });
    if (!mark) {
      buf += text[i];
      i += 1;
      continue;
    }
    flush();
    if (active.has(mark)) active.delete(mark);
    else active.add(mark);
    i += DELIM[mark].length;
  }
  flush();
  return nodes;
}

function paragraph(text: string): PMNode {
  const content = markdownToInline(text);
  return content.length ? { type: "paragraph", content } : { type: "paragraph" };
}

function itemText(item: PMNode): string {
  return (item.content ?? [])
    .filter((k) => k.type === "paragraph" || k.type === "heading")
    .map((k) => inlineToMarkdown(k.content))
    .join("\n");
}

function pushList(list: PMNode, out: BlockNode[]): void {
  for (const item of list.content ?? []) {
    const text = itemText(item);
    if (item.type === "taskItem") out.push({ type: "todo", checked: item.attrs?.checked === true, text });
    else out.push({ type: "bullet", text });
    // 중첩 목록은 평탄화한다 — 저장 모델에 들여쓰기가 없다.
    for (const kid of item.content ?? []) {
      if (/List$/.test(kid.type)) pushList(kid, out);
    }
  }
}

export function docToBlocks(doc: PMDoc | null | undefined): BlockNode[] {
  const out: BlockNode[] = [];
  for (const node of doc?.content ?? []) {
    switch (node.type) {
      case "paragraph":
        out.push({ type: "paragraph", text: inlineToMarkdown(node.content) });
        break;
      case "heading": {
        const n = Number(node.attrs?.level) || 1;
        const level = (n <= 1 ? 1 : n >= 3 ? 3 : 2) as 1 | 2 | 3;
        out.push({ type: "heading", level, text: inlineToMarkdown(node.content) });
        break;
      }
      case "bulletList":
      case "orderedList":
      case "taskList":
        pushList(node, out);
        break;
      case "blockquote":
        out.push({ type: "blockquote", text: itemText(node) });
        break;
      case VERSE_NODE:
        out.push(JSON.parse(String(node.attrs?.block)) as QuoteBlockNode);
        break;
      default:
        if (node.content) out.push({ type: "paragraph", text: inlineToMarkdown(node.content) });
    }
  }
  return out.length ? out : [{ type: "paragraph", text: "" }];
}

export function verseNode(block: QuoteBlockNode, label: string): PMNode {
  return { type: VERSE_NODE, attrs: { block: JSON.stringify(block), label } };
}

// 연속된 bullet/todo는 목록 노드 하나로 묶는다.
export function blocksToDoc(blocks: BlockNode[], labelFor: (ref: string) => string): PMDoc {
  const content: PMNode[] = [];
  for (const block of blocks) {
    const last = content[content.length - 1];
    if (block.type === "bullet" || block.type === "todo") {
      const listType = block.type === "bullet" ? "bulletList" : "taskList";
      const item: PMNode =
        block.type === "bullet"
          ? { type: "listItem", content: [paragraph(block.text)] }
          : { type: "taskItem", attrs: { checked: block.checked }, content: [paragraph(block.text)] };
      if (last?.type === listType) last.content!.push(item);
      else content.push({ type: listType, content: [item] });
      continue;
    }
    switch (block.type) {
      case "paragraph":
        content.push(paragraph(block.text));
        break;
      case "heading":
        content.push({ ...paragraph(block.text), type: "heading", attrs: { level: block.level } });
        break;
      case "blockquote":
        content.push({ type: "blockquote", content: [paragraph(block.text)] });
        break;
      case "quote":
        content.push(verseNode(block, labelFor(block.ref)));
        break;
    }
  }
  return { type: "doc", content: content.length ? content : [{ type: "paragraph" }] };
}
