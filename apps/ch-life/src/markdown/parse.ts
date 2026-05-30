import matter from "gray-matter";
import type { BlockNode, Note, Verse } from "@/domain/types";
import { parseRef } from "@/parser/ref-parser";

function toStringOrNull(v: unknown): string | null {
  return typeof v === "string" && v.trim().length > 0 ? v : null;
}

// YAML parses an unquoted `2026-05-30` as a Date, not a string. Normalize both
// shapes back to a `YYYY-MM-DD` calendar string (UTC parts to avoid TZ drift).
function toDateString(v: unknown): string | null {
  if (typeof v === "string") return v.trim().length > 0 ? v : null;
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const yyyy = v.getUTCFullYear();
    const mm = String(v.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(v.getUTCDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  return null;
}

function toTimestamp(v: unknown): number | null {
  if (typeof v === "string") {
    const t = Date.parse(v);
    return Number.isNaN(t) ? null : t;
  }
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v.getTime();
  return null;
}

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
  const createdAt = toTimestamp(fm.createdAt) ?? now;
  const updatedAt = toTimestamp(fm.updatedAt) ?? now;
  const title = typeof fm.title === "string" ? fm.title : null;
  const id = typeof fm.id === "string" && fm.id ? fm.id : makeId();
  const citedRefs = Array.isArray(fm.citedRefs)
    ? (fm.citedRefs as unknown[]).filter(
        (x): x is string => typeof x === "string",
      )
    : extractRefsFromBlocks(blocks);
  const sermonDate = toDateString(fm.sermonDate);
  const preacher = toStringOrNull(fm.preacher);
  const location = toStringOrNull(fm.location);
  const scripture = toStringOrNull(fm.scripture);

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
