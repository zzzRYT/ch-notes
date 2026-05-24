import matter from "gray-matter";
import type { Note } from "@/domain/types";

export const SCHEMA_VERSION = 1;

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
  const body = note.body
    .map((b) => {
      if (b.type === "paragraph") return b.text;
      return [
        `> **${b.ref}** (KRV)`,
        ...b.verses.map((v) => `> ${v.text}`),
      ].join("\n");
    })
    .join("\n\n");

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
