export { insertVerse, type InsertVerseResult } from "./model/insert-verse";
export {
  detectRefAtCursor,
  detectTriggeredRef,
  splitAtRef,
  type DetectedRef,
  type RefSplit,
  type TriggeredRef,
} from "./model/autocomplete";
export { splitParagraphWithQuote } from "./model/split-paragraph";
export {
  validateScripture,
  type ScriptureValidation,
} from "./model/scripture-field";
