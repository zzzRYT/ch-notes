import type { Note } from "@/domain/types";
import { formatTime, noteTitleOrFallback } from "./group-notes";

export type FormattedCard = {
  title: string;
  timeLabel: string;
  preacher: string | null;
  scripture: string | null;
};

export function formatNoteCard(note: Note): FormattedCard {
  return {
    title: noteTitleOrFallback(note),
    timeLabel: formatTime(note.createdAt),
    preacher: note.preacher?.trim() || null,
    scripture: note.scripture?.trim() || null,
  };
}
