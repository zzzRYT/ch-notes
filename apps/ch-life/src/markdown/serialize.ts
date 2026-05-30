import matter from "gray-matter";
import type { BlockNode, Note } from "@/domain/types";

export const SCHEMA_VERSION = 1;

function prefixLines(text: string, prefix: string): string {
  return text
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
}

// One BlockNode → its Markdown representation. Inline emphasis already lives in
// the block text as markdown (**bold**, _italic_, ++underline++), so it passes
// through untouched. Scripture quotes keep their distinctive `(KRV)` header so
// the parser can tell them apart from plain blockquotes on import.
export function blockToMarkdown(b: BlockNode): string {
  switch (b.type) {
    case "paragraph":
      return b.text;
    case "heading":
      return `${"#".repeat(b.level)} ${b.text}`;
    case "bullet":
      return `- ${b.text}`;
    case "todo":
      return `- [${b.checked ? "x" : " "}] ${b.text}`;
    case "blockquote":
      return prefixLines(b.text, "> ");
    case "quote":
      return [
        `> **${b.ref}** (KRV)`,
        ...b.verses.map((v) => `> ${v.text}`),
      ].join("\n");
  }
}

type Frontmatter = {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  citedRefs: string[];
  schemaVersion: number;
  sermonDate?: string;
  preacher?: string;
  location?: string;
  scripture?: string;
};

export function noteToMarkdown(note: Note): string {
  const body = note.body.map(blockToMarkdown).join("\n\n");

  const data: Frontmatter = {
    id: note.id,
    createdAt: new Date(note.createdAt).toISOString(),
    updatedAt: new Date(note.updatedAt).toISOString(),
    citedRefs: note.citedRefs,
    schemaVersion: SCHEMA_VERSION,
  };
  if (note.title) data.title = note.title;
  if (note.sermonDate) data.sermonDate = note.sermonDate;
  if (note.preacher) data.preacher = note.preacher;
  if (note.location) data.location = note.location;
  if (note.scripture) data.scripture = note.scripture;

  return matter.stringify(body, data);
}

export function noteFileName(note: Note): string {
  const d = new Date(note.updatedAt);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const slug = note.title?.trim().replace(/\s+/g, "-") || note.id.slice(-8);
  return `${yyyy}-${mm}-${dd}-${slug}.md`;
}
