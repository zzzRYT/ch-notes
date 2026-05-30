import type { BlockNode, Verse } from "@/domain/types";
import { inlineToMarkdown, markdownToInline } from "./inlineMarks";

// ProseMirror / TipTap document JSON, narrowed to the node set this editor uses.
// We bridge the editor and our BlockNode[] model through this JSON shape
// (editor.getJSON() / editor.setContent(json)) rather than HTML, because the
// structure is deterministic and trivially unit-testable off-device.
export type PMNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: PMNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
};

export type PMDoc = { type: "doc"; content?: PMNode[] };

// Node/mark type names as emitted by TipTap StarterKit + TaskList + our custom
// node. Kept here so the converter and the web editor schema stay in sync.
export const VERSE_NODE = "verseQuote";

function clampHeading(level: unknown): 1 | 2 | 3 {
  const n = typeof level === "number" ? level : 1;
  if (n <= 1) return 1;
  if (n >= 3) return 3;
  return 2;
}

function inline(node: PMNode): string {
  return inlineToMarkdown(node.content);
}

// Join the block children of a container (listItem, blockquote) into one text
// string, separating paragraphs with newlines.
function joinParagraphs(container: PMNode): string {
  const kids = container.content ?? [];
  const parts: string[] = [];
  for (const kid of kids) {
    if (kid.type === "paragraph" || kid.type === "heading") {
      parts.push(inline(kid));
    }
  }
  return parts.join("\n");
}

function parseVerses(raw: unknown): Verse[] {
  if (typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (v): v is Verse =>
        !!v &&
        typeof v === "object" &&
        typeof (v as Verse).text === "string",
    );
  } catch {
    return [];
  }
}

// Flatten a (possibly nested) list node into flat bullet/todo blocks.
function listToBlocks(list: PMNode, out: BlockNode[]): void {
  const isTask = list.type === "taskList";
  for (const item of list.content ?? []) {
    if (item.type === "listItem" || item.type === "taskItem") {
      const text = joinParagraphs(item);
      if (isTask || item.type === "taskItem") {
        out.push({ type: "todo", checked: item.attrs?.checked === true, text });
      } else {
        out.push({ type: "bullet", text });
      }
      // Nested lists inside the item are flattened to sibling blocks.
      for (const kid of item.content ?? []) {
        if (kid.type === "bulletList" || kid.type === "orderedList" || kid.type === "taskList") {
          listToBlocks(kid, out);
        }
      }
    }
  }
}

// TipTap doc JSON → our BlockNode[] model.
export function docToBlocks(doc: PMDoc | undefined | null): BlockNode[] {
  const out: BlockNode[] = [];
  const top = doc?.content ?? [];
  for (const node of top) {
    switch (node.type) {
      case "paragraph":
        out.push({ type: "paragraph", text: inline(node) });
        break;
      case "heading":
        out.push({ type: "heading", level: clampHeading(node.attrs?.level), text: inline(node) });
        break;
      case "bulletList":
      case "orderedList":
      case "taskList":
        listToBlocks(node, out);
        break;
      case "blockquote":
        out.push({ type: "blockquote", text: joinParagraphs(node) });
        break;
      case VERSE_NODE: {
        const rawStatus = node.attrs?.status;
        const status =
          rawStatus === "loading" || rawStatus === "error" ? rawStatus : "loaded";
        out.push({
          type: "quote",
          ref: typeof node.attrs?.ref === "string" ? node.attrs.ref : "",
          verses: parseVerses(node.attrs?.verses),
          status,
        });
        break;
      }
      default:
        // Unknown block: preserve its text as a paragraph rather than dropping.
        if (node.content) out.push({ type: "paragraph", text: inline(node) });
        break;
    }
  }
  if (out.length === 0) out.push({ type: "paragraph", text: "" });
  return out;
}

function paragraph(text: string): PMNode {
  const content = markdownToInline(text);
  return content.length ? { type: "paragraph", content } : { type: "paragraph" };
}

export type BlocksToDocOptions = {
  // Resolves a scripture ref to its display label (e.g. "Gen 1:1" → "창세기 1:1").
  // The web verse node is schema-only and can't import the RN parser, so the
  // formatted label is passed in as a node attr. Defaults to the raw ref.
  labelFor?: (ref: string) => string;
};

function verseNode(
  block: Extract<BlockNode, { type: "quote" }>,
  labelFor: (ref: string) => string,
): PMNode {
  return {
    type: VERSE_NODE,
    attrs: {
      ref: block.ref,
      label: labelFor(block.ref),
      verses: JSON.stringify(block.verses),
      status: block.status,
    },
  };
}

// Our BlockNode[] model → TipTap doc JSON. Consecutive bullet / todo blocks are
// grouped back into a single list node so the editor renders them as one list.
export function blocksToDoc(blocks: BlockNode[], options: BlocksToDocOptions = {}): PMDoc {
  const labelFor = options.labelFor ?? ((ref: string) => ref);
  const content: PMNode[] = [];
  let i = 0;
  while (i < blocks.length) {
    const block = blocks[i]!;
    if (block.type === "bullet") {
      const items: PMNode[] = [];
      while (i < blocks.length && blocks[i]!.type === "bullet") {
        items.push({ type: "listItem", content: [paragraph((blocks[i]! as { text: string }).text)] });
        i += 1;
      }
      content.push({ type: "bulletList", content: items });
      continue;
    }
    if (block.type === "todo") {
      const items: PMNode[] = [];
      while (i < blocks.length && blocks[i]!.type === "todo") {
        const t = blocks[i]! as Extract<BlockNode, { type: "todo" }>;
        items.push({
          type: "taskItem",
          attrs: { checked: t.checked },
          content: [paragraph(t.text)],
        });
        i += 1;
      }
      content.push({ type: "taskList", content: items });
      continue;
    }
    switch (block.type) {
      case "paragraph":
        content.push(paragraph(block.text));
        break;
      case "heading":
        content.push({ type: "heading", attrs: { level: block.level }, content: markdownToInline(block.text) });
        break;
      case "blockquote":
        content.push({ type: "blockquote", content: [paragraph(block.text)] });
        break;
      case "quote":
        content.push(verseNode(block, labelFor));
        break;
    }
    i += 1;
  }
  if (content.length === 0) content.push({ type: "paragraph" });
  return { type: "doc", content };
}
