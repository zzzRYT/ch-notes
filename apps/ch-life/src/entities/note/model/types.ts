// 인용 스냅샷 한 절. 성경 엔티티의 `Verse`와 모양이 같지만 일부러 따로 둔다 —
// 노트는 성경 엔티티를 참조하지 않고, 인용 당시의 본문을 스스로 소유한다(ADR-0024).
export type CitationVerse = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
};

// Inline emphasis stored inside a block's `text` as lightweight markdown:
//   bold      → **text**
//   italic    → _text_
//   underline → ++text++
// Storing marks in the text keeps `text: string` on every block, so the
// share/markdown export, FTS body_text, list preview, and cited-ref extraction
// only need to strip the delimiters rather than understand a span model.
export type InlineMark = "bold" | "italic" | "underline";

export type BlockNode =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "bullet"; text: string }
  | { type: "todo"; checked: boolean; text: string }
  | { type: "blockquote"; text: string }
  | {
      type: "quote";
      ref: string;
      verses: CitationVerse[];
      status: "loading" | "loaded" | "error";
      /**
       * 인용 당시의 성경 판본. 새 인용은 항상 기록한다. `editionId`가 생기기
       * 전에 저장된 인용에는 없으므로 저장소 어댑터가 읽을 때 채운다
       * (`LEGACY_CITATION_EDITION_ID`). OTA로 되돌려도 무시될 뿐 깨지지 않는
       * 추가 필드다(RULE-OTA-009).
       */
      editionId?: string;
    };

// Block types whose content is a single rich-text string (everything except the
// scripture `quote`, which carries structured verse data instead).
export type TextBlock = Extract<BlockNode, { text: string }>;

export type QuoteBlockNode = Extract<BlockNode, { type: "quote" }>;

export type Note = {
  id: string;
  title: string | null;
  body: BlockNode[];
  createdAt: number;
  updatedAt: number;
  citedRefs: string[];
  sermonDate: string | null;
  preacher: string | null;
  location: string | null;
  scripture: string | null;
};
