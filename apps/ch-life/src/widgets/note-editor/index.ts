// 스파이크: WebView 에디터로 교체(ADR-0001 재검토). 네이티브 판은 ui/NoteEditor.tsx에 그대로 있다.
export { RichNoteEditor as NoteEditor, type NoteEditorHandle } from "./ui/RichNoteEditor";
export { SermonMetaHeader, type SermonMetaHeaderProps } from "./ui/SermonMetaHeader";
export { QuoteBlock } from "./ui/QuoteBlock";
export {
  useNoteDraft,
  type NoteDraft,
  type NoteDraftPatch,
  type NoteDraftStatus,
} from "./model/useNoteDraft";
