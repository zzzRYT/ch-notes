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

// A scripture quote's first `>` line carries the "**ref** (KRV)" header, which
// is how we tell it apart from a plain user blockquote on import.
const VERSE_HEADER = /^\*\*(.+)\*\*\s*\(KRV\)\s*$/;
const HEADING = /^(#{1,3})\s+(.*)$/;
const TODO = /^[-*]\s+\[([ xX])\]\s+(.*)$/;
const BULLET = /^[-*]\s+(.*)$/;

function quoteOrBlockquote(group: string[]): BlockNode {
  const header = group[0] ?? "";
  const headerMatch = VERSE_HEADER.exec(header);
  if (headerMatch) {
    const ref = headerMatch[1]!.trim();
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
    return { type: "quote", ref, verses, status: "loaded" };
  }
  return { type: "blockquote", text: group.join("\n") };
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
        group.push((lines[i] ?? "").replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push(quoteOrBlockquote(group));
      continue;
    }

    if (line.trim().length === 0) {
      i += 1;
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      const level = Math.min(heading[1]!.length, 3) as 1 | 2 | 3;
      blocks.push({ type: "heading", level, text: heading[2]! });
      i += 1;
      continue;
    }

    const todo = TODO.exec(line);
    if (todo) {
      blocks.push({
        type: "todo",
        checked: todo[1]!.toLowerCase() === "x",
        text: todo[2]!,
      });
      i += 1;
      continue;
    }

    const bullet = BULLET.exec(line);
    if (bullet) {
      blocks.push({ type: "bullet", text: bullet[1]! });
      i += 1;
      continue;
    }

    // Plain text: gather consecutive non-structural lines into one paragraph so
    // soft line breaks inside a paragraph survive.
    const para: string[] = [];
    while (i < lines.length) {
      const cur = lines[i] ?? "";
      if (
        cur.startsWith(">") ||
        cur.trim().length === 0 ||
        HEADING.test(cur) ||
        BULLET.test(cur)
      ) {
        break;
      }
      para.push(cur);
      i += 1;
    }
    blocks.push({ type: "paragraph", text: para.join("\n") });
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
