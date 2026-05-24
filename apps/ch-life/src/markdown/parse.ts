import matter from "gray-matter";
import type { BlockNode, Note, Verse } from "@/domain/types";
import { parseRef } from "@/parser/ref-parser";

function makeId(): string {
  const t = Date.now().toString(36).padStart(10, "0");
  const r = Math.random().toString(36).slice(2, 12).padStart(10, "0");
  return (t + r).toUpperCase();
}

export function markdownToNote(md: string): Note | null {
  const parsed = matter(md);
  const fm = parsed.data as Record<string, unknown>;
  const blocks = parseBody(parsed.content);

  const now = Date.now();
  const createdAt =
    typeof fm.createdAt === "string" ? Date.parse(fm.createdAt) : now;
  const updatedAt =
    typeof fm.updatedAt === "string" ? Date.parse(fm.updatedAt) : now;
  const title = typeof fm.title === "string" ? fm.title : null;
  const id = typeof fm.id === "string" && fm.id ? fm.id : makeId();
  const citedRefs = Array.isArray(fm.citedRefs)
    ? (fm.citedRefs as unknown[]).filter(
        (x): x is string => typeof x === "string",
      )
    : extractRefsFromBlocks(blocks);
  const sermonDate = typeof fm.sermonDate === "string" ? fm.sermonDate : null;
  const preacher = typeof fm.preacher === "string" ? fm.preacher : null;
  const location = typeof fm.location === "string" ? fm.location : null;
  const scripture = typeof fm.scripture === "string" ? fm.scripture : null;

  return { id, title, body: blocks, createdAt, updatedAt, citedRefs, sermonDate, preacher, location, scripture };
}

function parseBody(content: string): BlockNode[] {
  const lines = content.split("\n");
  const blocks: BlockNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (line.startsWith(">")) {
      const group: string[] = [];
      while (i < lines.length && (lines[i] ?? "").startsWith(">")) {
        const stripped = (lines[i] ?? "").replace(/^>\s?/, "");
        group.push(stripped);
        i += 1;
      }
      const header = group[0] ?? "";
      const refMatch = /\*\*([^*]+)\*\*/.exec(header);
      const ref = (refMatch?.[1] ?? header).trim();
      const verseTexts = group.slice(1).filter((s) => s.trim().length > 0);
      const parsedRef = parseRef(ref);
      const verses: Verse[] = parsedRef
        ? verseTexts.map((t, idx) => ({
            book: parsedRef.book,
            chapter: parsedRef.chapter,
            verse: parsedRef.verse + idx,
            text: t,
          }))
        : [];
      blocks.push({ type: "quote", ref, verses, status: "loaded" });
    } else if (line.trim().length === 0) {
      i += 1;
    } else {
      const para: string[] = [];
      while (
        i < lines.length &&
        !(lines[i] ?? "").startsWith(">") &&
        (lines[i] ?? "").trim().length > 0
      ) {
        para.push(lines[i] ?? "");
        i += 1;
      }
      blocks.push({ type: "paragraph", text: para.join("\n") });
    }
  }
  return blocks;
}

function extractRefsFromBlocks(blocks: BlockNode[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const b of blocks) {
    if (b.type === "quote" && !seen.has(b.ref)) {
      seen.add(b.ref);
      out.push(b.ref);
    }
  }
  return out;
}
