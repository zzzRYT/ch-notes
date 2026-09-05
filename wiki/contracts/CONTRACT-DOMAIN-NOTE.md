# CONTRACT-DOMAIN-NOTE — 노트 도메인 타입

```yaml
id: CONTRACT-DOMAIN-NOTE
policy: POL-NOTE-001
statement: 앱 전체가 공유하는 Note / BlockNode / Verse / Settings 타입 정의. DB 행, 마크다운 파일, 화면 상태가 모두 이 모양으로 수렴한다.
implemented_by:
  - apps/ch-life/src/domain/types.ts
verified_by:
  - test: apps/ch-life/src/domain/__tests__/types.test.ts
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
  | { type: "quote";      ref: string; verses: Verse[]; status: "loading" | "loaded" | "error" };
```

- `quote`(성경 인용)를 뺀 모든 블록은 `text: string` 하나를 갖는다. 인라인 강조는 그 문자열 안의 경량 마크다운이다([`RULE-EDIT-010`](../rules/editor-insert.md)).
- `status`의 `loading`/`error`는 **어떤 코드도 생성하지 않는다**([`RULE-EDIT-007`](../rules/editor-insert.md)).
- `heading`/`bullet`/`todo`/`blockquote`를 **입력할 UI는 없다.** 마크다운 가져오기로만 들어오고, 들어오면 렌더·재직렬화는 정상 동작한다.

## Verse

```ts
type Verse = { book: string; chapter: number; verse: number; text: string };
```

`book`은 `book-map.ts`의 `BookCode`(예: `"Col"`)다. 계획 문서에 있던 `translation` 필드는 **없다** — 번역본은 하나뿐이고 다국어 확장은 현재 범위 밖이다.

## Settings

[`CONTRACT-SETTINGS-FILE`](CONTRACT-SETTINGS-FILE.md) 참조.

## 바꾸려면

`Note`에 필드를 더하는 것은 도메인 타입만의 변경이 아니다. DB 컬럼·마이그레이션·repo 매핑·마크다운 frontmatter·자동저장 payload가 함께 움직인다([`CONTRACT-DB-NOTES`](CONTRACT-DB-NOTES.md)의 체크리스트).
