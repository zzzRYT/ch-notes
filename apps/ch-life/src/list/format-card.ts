import type { Note } from "@/domain/types";

const DOW = ["주일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
const MAX_VISIBLE_CHIPS = 3;

export type FormattedCard = {
  mainLabel: string;
  refChips: { visible: string[]; moreCount: number };
};

export function formatNoteCard(note: Note): FormattedCard {
  const trimmed = note.title?.trim();
  const mainLabel = trimmed ? trimmed : formatDate(note.updatedAt);
  const visible = note.citedRefs.slice(0, MAX_VISIBLE_CHIPS);
  const moreCount = Math.max(0, note.citedRefs.length - visible.length);
  return { mainLabel, refChips: { visible, moreCount } };
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const dow = DOW[d.getDay()] ?? "";
  return `${y}년 ${m}월 ${day}일 ${dow}`;
}
