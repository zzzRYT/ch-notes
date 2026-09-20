# CONTRACT-DOMAIN-NOTE — 노트 도메인 타입

```yaml
id: CONTRACT-DOMAIN-NOTE
policy: POL-NOTE-001
statement: 노트 엔티티가 소유하는 Note / BlockNode / CitationVerse 타입 정의. DB 행, 마크다운 파일, 화면 상태가 모두 이 모양으로 수렴한다. 인용 스냅샷은 성경 엔티티를 참조하지 않고 본문·참조·판본(editionId)을 스스로 든다.
implemented_by:
  - apps/ch-life/src/entities/note/model/types.ts
  - apps/ch-life/src/entities/note/model/citation.ts (makeQuoteBlock · withCitationEdition · LEGACY_CITATION_EDITION_ID)
verified_by:
  - test: apps/ch-life/src/entities/note/model/__tests__/types.test.ts
  - test: apps/ch-life/src/entities/note/api/__tests__/note-repo.test.ts#editionId 없이 저장된 인용은 읽을 때 번들 판본으로 채워진다
  - test: apps/ch-life/src/features/scripture/insert/model/__tests__/insert-verse.test.ts
confidence: 코드추론
```

## Note

```ts
type Note = {
  id: string;                 // RULE-NOTE-003 (ULID 아님)
  title: string | null;       // 설교 제목
  body: BlockNode[];          // DB에는 body_json TEXT로 직렬화
  createdAt: number;          // epoch ms — 목록 정렬·그룹핑 기준
  updatedAt: number;          // epoch ms — update마다 자동 갱신
  citedRefs: string[];        // body에서 파생, 저장 시 재계산 (RULE-EDIT-009)
  sermonDate: string | null;  // "YYYY-MM-DD"
  preacher: string | null;
  location: string | null;
  scripture: string | null;   // 생명양식 = 대표 본문, citedRefs와 별개
};
```

`title`은 목록에서 없으면 본문 미리보기로 대체된다. `citedRefs`는 **파생 값**이므로 직접 수정 대상이 아니다.

## BlockNode

```ts
type BlockNode =
  | { type: "paragraph";  text: string }
  | { type: "heading";    level: 1 | 2 | 3; text: string }
  | { type: "bullet";     text: string }
  | { type: "todo";       checked: boolean; text: string }
  | { type: "blockquote"; text: string }
  | { type: "quote";      ref: string; verses: CitationVerse[]; status: "loading" | "loaded" | "error"; editionId?: string };
```

- `quote`(성경 인용)를 뺀 모든 블록은 `text: string` 하나를 갖는다. 인라인 강조는 그 문자열 안의 경량 마크다운이다([`RULE-EDIT-010`](../rules/editor-insert.md)).
- `status`의 `loading`/`error`는 **어떤 코드도 생성하지 않는다**([`RULE-EDIT-007`](../rules/editor-insert.md)).
- `heading`/`bullet`/`todo`/`blockquote`를 **입력할 UI는 없다.** 마크다운 가져오기로만 들어오고, 들어오면 렌더·재직렬화는 정상 동작한다.
- **인용 블록은 `makeQuoteBlock(ref, verses, editionId)`로만 만든다**(`citation.ts`). 예외는 마크다운 파서 하나다([`drift.md`](../drift.md) B14).

## Citation Snapshot — `quote`와 `editionId`

`quote`는 인용 당시의 본문을 **스냅샷**으로 든다([`ADR-0024`](../decisions/ADR-0024-fsd-ddd-architecture.md)). 번들 성경이 바뀌어도 저장된 인용은 바뀌지 않는다.

- `editionId`는 **새 인용에 항상 기록된다** — 삽입 경로(`features/scripture/insert`)가 성경 엔티티의 `BUNDLED_EDITION_ID`(`"openbible-ko"`)를 넣는다.
- 저장 형식에서는 **선택**이다. 이 필드가 생기기 전(≤ 1.0.1)에 저장된 인용에는 없다. 그런 인용은 어댑터가 읽을 때 `LEGACY_CITATION_EDITION_ID`(`"openbible-ko"`)로 채운다(`withCitationEdition`) — SQLite `rowToNote`와 마크다운 파서 둘 다. 그래서 **메모리의 `Note`에서는 언제나 값이 있다.**
- 두 상수는 지금 같은 문자열이지만 뜻이 다르다. `LEGACY_…`는 과거 사실(옛 인용이 어디서 왔나)이라 번들이 바뀌어도 그대로고, `BUNDLED_…`는 지금 번들이다. 판본을 바꾸면 후자만 올린다.
- 아직 `editionId`를 **읽어서 무언가를 하는 코드는 없다.** 본문을 다시 조회하지 않기 때문이다. 이 필드는 다음 판본을 위한 기록이다.
- OTA로 되돌려도 옛 번들은 이 필드를 무시할 뿐 깨지지 않는다 — 새 블록 타입이 아니라 추가 필드다([`RULE-OTA-009`](../rules/release.md)).

## CitationVerse

```ts
type CitationVerse = { book: string; chapter: number; verse: number; text: string };
```

`book`은 성경 엔티티의 `BookCode`(예: `"Col"`)와 같은 문자열이지만 타입으로 묶지 않는다 — 노트 엔티티는 성경 엔티티를 import하지 않는다. 성경 엔티티의 `Verse`와 모양이 같아 구조적으로 호환된다. 계획 문서에 있던 `translation` 필드는 블록 단위의 `editionId`가 대신한다.

## Settings

노트 엔티티가 아니라 `features/settings/change`가 소유한다. [`CONTRACT-SETTINGS-FILE`](CONTRACT-SETTINGS-FILE.md) 참조.

## 바꾸려면

`Note`에 필드를 더하는 것은 도메인 타입만의 변경이 아니다. DB 컬럼·마이그레이션·repo 매핑·마크다운 frontmatter·자동저장 payload가 함께 움직인다([`CONTRACT-DB-NOTES`](CONTRACT-DB-NOTES.md)의 체크리스트).
