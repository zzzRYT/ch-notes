export type {
  Note,
  BlockNode,
  TextBlock,
  QuoteBlockNode,
  CitationVerse,
  InlineMark,
} from "./model/types";
export {
  NoteRepoProvider,
  useNoteRepo,
  type NoteRepo,
  type NoteInput,
  type NotePatch,
} from "./model/note-repo";
export {
  makeQuoteBlock,
  withCitationEdition,
  LEGACY_CITATION_EDITION_ID,
} from "./model/citation";
export { extractCitedRefs } from "./model/cited-refs";
export {
  makeSqliteNoteRepo,
  runNoteMigrations,
  NOTE_SCHEMA_SQL,
} from "./api/sqlite-note-repo";
export {
  markdownToNote,
  type RefResolver,
  type MarkdownParseOptions,
} from "./api/markdown-parse";
export {
  noteToMarkdown,
  noteFileName,
  blockToMarkdown,
  SCHEMA_VERSION,
} from "./api/markdown-serialize";
export {
  groupNotesByDay,
  formatTime,
  notePreview,
  noteTitleOrFallback,
  type NoteGroup,
} from "./lib/group-notes";
export { stripInlineMarks } from "./lib/inline-marks";
