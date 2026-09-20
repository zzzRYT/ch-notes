import matter from "gray-matter";
import type { BlockNode, CitationVerse, Note } from "../model/types";
import { LEGACY_CITATION_EDITION_ID } from "../model/citation";
import { makeId } from "../lib/make-id";

/**
 * 인용 헤더의 참조 문자열을 책·장·절로 푸는 함수. 노트 엔티티는 성경 엔티티를
 * 모르므로(ADR-0024) 호출하는 쪽(가져오기 기능)이 `parseRef`를 넘긴다.
 */
export type RefResolver = (
  ref: string,
) => { book: string; chapter: number; verse: number } | null;

export type MarkdownParseOptions = { resolveRef: RefResolver };

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

export function markdownToNote(
  md: string,
  { resolveRef }: MarkdownParseOptions,
): Note | null {
  const parsed = matter(md);
  const fm = parsed.data as Record<string, unknown>;
  const blocks = parseBody(parsed.content, resolveRef);

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

// A scripture quote's first `>` line carries the "**ref** (KRV)" header, which
// is how we tell it apart from a plain user blockquote on import.
const VERSE_HEADER = /^\*\*(.+)\*\*\s*\(KRV\)\s*$/;
const HEADING = /^(#{1,3})\s+(.*)$/;
const TODO = /^[-*]\s+\[([ xX])\]\s+(.*)$/;
const BULLET = /^[-*]\s+(.*)$/;

function quoteOrBlockquote(group: string[], resolveRef: RefResolver): BlockNode {
  const header = group[0] ?? "";
  const headerMatch = VERSE_HEADER.exec(header);
  if (headerMatch) {
    const ref = headerMatch[1]!.trim();
    const verseTexts = group.slice(1).filter((s) => s.trim().length > 0);
    const parsedRef = resolveRef(ref);
    const verses: CitationVerse[] = parsedRef
      ? verseTexts.map((t, idx) => ({
          book: parsedRef.book,
          chapter: parsedRef.chapter,
          verse: parsedRef.verse + idx,
          text: t,
        }))
      : [];
    // 마크다운은 판본을 싣지 않는다 — `(KRV)` 헤더는 번들 판본을 뜻한다(CONTRACT-MD-NOTE).
    return {
      type: "quote",
      ref,
      verses,
      status: "loaded",
      editionId: LEGACY_CITATION_EDITION_ID,
    };
  }
  return { type: "blockquote", text: group.join("\n") };
}

function parseBody(content: string, resolveRef: RefResolver): BlockNode[] {
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
      blocks.push(quoteOrBlockquote(group, resolveRef));
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
