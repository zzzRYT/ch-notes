import type { Note } from "@/domain/types";

const DOW = ["주일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

export type NoteGroup = {
  key: string;
  date: string;
  dow: string;
  notes: Note[];
};

function dayKey(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${m}월 ${day}일`;
}

function formatDow(ts: number): string {
  const d = new Date(ts);
  return DOW[d.getDay()] ?? "";
}

export function groupNotesByDay(
  notes: ReadonlyArray<Note>,
): ReadonlyArray<NoteGroup> {
  const buckets = new Map<string, Note[]>();
  for (const n of notes) {
    const k = dayKey(n.createdAt);
    const arr = buckets.get(k);
    if (arr) arr.push(n);
    else buckets.set(k, [n]);
  }
  const groups: NoteGroup[] = [];
  for (const [key, items] of buckets.entries()) {
    items.sort((a, b) => b.createdAt - a.createdAt);
    const head = items[0]!;
    groups.push({
      key,
      date: formatDate(head.createdAt),
      dow: formatDow(head.createdAt),
      notes: items,
    });
  }
  groups.sort((a, b) => (a.key < b.key ? 1 : a.key > b.key ? -1 : 0));
  return groups;
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function notePreview(note: Note, max: number = 120): string {
  for (const block of note.body) {
    if (block.type === "paragraph") {
      const t = block.text.trim();
      if (t.length === 0) continue;
      const flat = t.replace(/\s+/g, " ");
      return flat.length > max ? `${flat.slice(0, max)}…` : flat;
    }
  }
  return "";
}

export function noteTitleOrFallback(note: Note): string {
  const t = note.title?.trim();
  if (t) return t;
  return notePreview(note, 40) || "(빈 노트)";
}
