# RULE-MD — 마크다운 내보내기·가져오기

상위 정책: [`POL-PORT-001`](../policy/POL-PORTABILITY.md)

노트 하나가 파일 하나다. 내부 저장은 SQLite이고 외부 노출은 Markdown이라는 하이브리드 구조의 경계가 이 계층이다([`ADR-0003`](../decisions/ADR-0003-sqlite-markdown-hybrid.md)). 형식 자체는 [`CONTRACT-MD-NOTE`](../contracts/CONTRACT-MD-NOTE.md)에 고정되어 있다.

---

## RULE-MD-001 · 내보내기 단위는 노트 한 개

```yaml
id: RULE-MD-001
policy: POL-PORT-001
requirement: MUST
statement: 내보내기는 현재 노트 하나를 YYYY-MM-DD-{제목슬러그 또는 id뒷자리}.md 파일로 만들어 OS 공유 시트에 넘긴다.
implemented_by:
  - apps/ch-life/src/share/export-note.ts
  - apps/ch-life/src/markdown/serialize.ts (noteFileName)
verified_by:
  - test: apps/ch-life/src/markdown/__tests__/serialize.test.ts#noteFileName
confidence: 코드추론
```

파일명의 날짜는 `sermonDate`가 아니라 `updatedAt`이다. 제목이 있으면 공백을 하이픈으로 바꿔 슬러그로 쓰고, 없으면 id 뒤 8자를 쓴다. 파일은 캐시 디렉터리에 쓰고 공유하므로 앱이 정리하지 않아도 OS가 회수한다.

내보내는 내용은 DB의 저장본이 아니라 **화면에 있는 현재 상태**다(에디터가 자기 상태를 얹어 넘긴다). 자동저장 디바운스([`RULE-EDIT-008`](editor-insert.md)) 중에 공유해도 방금 친 글자가 빠지지 않는다.

## RULE-MD-002 · frontmatter는 값이 있는 필드만 쓴다

```yaml
id: RULE-MD-002
policy: POL-PORT-001
requirement: MUST
statement: id/createdAt/updatedAt/citedRefs/schemaVersion은 항상 쓰고, title·sermonDate·preacher·location·scripture는 값이 있을 때만 키를 만든다.
implemented_by:
  - apps/ch-life/src/markdown/serialize.ts
verified_by:
  - test: apps/ch-life/src/markdown/__tests__/serialize.test.ts#title 없으면 frontmatter에 title 키 자체가 없음
confidence: 코드추론
```

빈 값을 `null`로 남기지 않고 키를 생략해, 다른 마크다운 앱에서 열었을 때 프론트매터가 지저분해지지 않게 한다. 시각은 ISO 8601 문자열, `sermonDate`는 `YYYY-MM-DD` 달력 문자열이다.

## RULE-MD-003 · 성경 인용의 표식은 `(KRV)` 머리줄

```yaml
id: RULE-MD-003
policy: POL-PORT-001
requirement: MUST
statement: 성경 인용 블록은 첫 줄이 "> **{참조}** (KRV)"인 blockquote로 직렬화한다. 이 머리줄이 없는 blockquote는 사용자가 쓴 일반 인용으로 복원한다.
implemented_by:
  - apps/ch-life/src/markdown/serialize.ts (blockToMarkdown)
  - apps/ch-life/src/markdown/parse.ts (VERSE_HEADER)
verified_by:
  - test: apps/ch-life/src/markdown/__tests__/rich-blocks.test.ts#plain blockquote is not mistaken for a scripture quote
  - test: apps/ch-life/src/markdown/__tests__/rich-blocks.test.ts#scripture quote header is still recognized
confidence: 코드추론
```

두 종류의 인용(성경 / 사용자)을 같은 마크다운 문법으로 표현해야 해서, **머리줄 패턴이 구분자 역할**을 한다. 이 문자열은 사실상 파일 포맷의 일부이며 바꾸면 이미 내보낸 파일을 다시 읽지 못한다.

`(KRV)`는 개역한글을 쓰기로 했던 계획 시점의 잔재다. 실제 데이터는 Open Bible 한국어판이므로 **이 표기는 지금 데이터를 잘못 이름 붙이고 있다.** 그럼에도 바꿀 수 없는 이유가 위와 같다 — 호환성 때문에 고착된 표기다([`drift.md`](../drift.md) B절, [`ADR-0009`](../decisions/ADR-0009-bible-source.md)).

## RULE-MD-004 · 왕복 변환은 본질 데이터를 보존한다

```yaml
id: RULE-MD-004
policy: POL-PORT-001
requirement: MUST
statement: DB → 마크다운 → DB 왕복 후 id·제목·설교 메타·블록 구조·인용 참조가 보존된다.
implemented_by:
  - apps/ch-life/src/markdown/serialize.ts
  - apps/ch-life/src/markdown/parse.ts
verified_by:
  - test: apps/ch-life/src/markdown/__tests__/roundtrip.test.ts
  - test: apps/ch-life/src/markdown/__tests__/rich-blocks.test.ts#body round trips through markdown
confidence: 코드추론
```

보존되지 않는 것도 명시한다.

- **절 번호**: 인용 블록의 각 절은 본문만 저장되므로, 다시 읽을 때 시작 절부터 1씩 증가한다고 **가정**해 재구성한다. 참조를 파싱할 수 없으면 `verses`는 빈 배열이 되고 인용 블록은 참조만 남는다.
- **문단 내 빈 줄**: 빈 줄은 블록 경계이므로 하나의 문단 안에 빈 줄을 유지할 수 없다.
- **heading level 4 이상**: 3으로 낮춰 읽는다.
- **작성·수정 시각**: `repo.create`의 입력 타입에 `createdAt`/`updatedAt`이 없고 두 컬럼 모두 `Date.now()`로 채운다. 가져온 노트는 파일에 적힌 원래 시각이 아니라 **가져오기를 실행한 시각**을 갖는다. 목록이 `created_at` 내림차순이므로([`ADR-0008`](../decisions/ADR-0008-created-at-ordering.md)) 오래된 설교 노트를 가져오면 목록 맨 위로 올라온다.

⚠️ **증거 테스트가 이 규칙의 범위를 덮지 않는다.** `roundtrip.test.ts`는 이름이 "DB → MD → DB"지만 실제로는 `noteToMarkdown` ↔ `markdownToNote`만 부르고 `note-repo.ts`를 한 번도 거치지 않는다. 위의 시각 소실이 자동으로 잡히지 않는 이유다 → [`drift.md` C6](../drift.md).

## RULE-MD-005 · 외부에서 만든 마크다운도 받는다

```yaml
id: RULE-MD-005
policy: POL-PORT-001
requirement: MUST
statement: frontmatter가 없거나 일부만 있는 파일도 노트로 받는다. id가 없으면 새로 발급하고, citedRefs가 없으면 본문 인용 블록에서 추출하며, 따옴표 없는 날짜(YAML Date)는 달력 문자열로 정규화한다.
implemented_by:
  - apps/ch-life/src/markdown/parse.ts
verified_by:
  - test: apps/ch-life/src/markdown/__tests__/roundtrip.test.ts#frontmatter 없는 외부 MD도 새 노트로 받음
  - test: apps/ch-life/src/markdown/__tests__/roundtrip.test.ts#따옴표 없는 날짜(외부 파일)도 sermonDate 문자열로 받음
confidence: 코드추론
```

YAML은 따옴표 없는 `2026-05-30`을 `Date` 객체로 파싱한다. 이를 그대로 두면 타임존에 따라 하루가 밀리므로 **UTC 기준 연·월·일**로 되돌린다(코드 주석). 시각(`createdAt`/`updatedAt`)이 없으면 가져오는 시점의 현재 시각을 넣는다.

`markdownToNote`는 실패를 반환하지 않는다(항상 노트를 만든다). 그래서 마크다운이 아닌 파일을 골라도 "가져오기 실패"가 아니라 이상한 노트 한 개가 생길 수 있다.

## RULE-MD-006 · id가 겹칠 때만 사용자에게 묻는다

```yaml
id: RULE-MD-006
policy: POL-PORT-001
requirement: MUST
statement: 가져오는 노트의 id가 기존 노트와 같을 때만 덮어쓰기 / 새 id로 추가 / 건너뛰기를 묻는다. 겹치지 않으면 묻지 않고 그대로 삽입한다.
implemented_by:
  - apps/ch-life/src/share/import-decision.ts
  - apps/ch-life/src/share/import-note.ts
  - apps/ch-life/src/share/use-note-import.ts
verified_by:
  - test: apps/ch-life/src/share/__tests__/import-decision.test.ts
confidence: 코드추론
```

판정은 **id 하나로만** 한다. 내용이 같은지, 어느 쪽이 최신인지는 보지 않는다 — `updatedAt` 비교도, 내용 해시 중복 제거도 없다. 같은 노트를 두 기기에서 편집한 뒤 한쪽을 가져오면, 사용자가 "덮어쓰기"를 고르는 순간 다른 쪽 수정은 사라진다.

한 번에 파일 하나만 고를 수 있고(`multiple: false`), "모두 적용" 선택지는 없다(v1 spec 5.11의 계획분 미구현).

⚠️ **"덮어쓰기"는 없는 필드를 지운다.** `parse.ts`의 `toStringOrNull`·`toDateString`은 frontmatter에 키가 없으면 `undefined`가 아니라 **`null`**을 돌려주고, `import-note.ts`는 그 값을 그대로 `repo.update` 패치에 넣는다. `repo.update`는 read-then-merge라 `null`은 "비움"이다([`RULE-NOTE-002`](note-persistence.md)). 그래서 `preacher:`가 없는 외부 `.md`를 기존 노트에 덮어쓰면 **기존 설교자 값이 지워진다.** → [`drift.md` B16](../drift.md)

## RULE-MD-007 · schemaVersion은 쓰기만 하고 읽지 않는다

```yaml
id: RULE-MD-007
policy: POL-PORT-001
statement: 내보낼 때 schemaVersion: 1을 기록하지만, 가져올 때 그 값을 검사하지 않는다. 버전이 달라도 거부하지 않는다.
implemented_by:
  - apps/ch-life/src/markdown/serialize.ts (SCHEMA_VERSION)
  - apps/ch-life/src/markdown/parse.ts
confidence: 코드추론
```

v1 spec 5.10은 "`schemaVersion` 확인 → 다르면 거부"였다. 구현은 검사하지 않으므로, 미래에 포맷을 바꾸면 **구버전 앱이 신버전 파일을 조용히 잘못 읽는다.** 지금은 버전이 1뿐이라 드러나지 않는 잠복 결함이다([`drift.md`](../drift.md) A절).

## RULE-MD-008 · 전체 백업과 시스템 열기 흐름은 없다

```yaml
id: RULE-MD-008
policy: POL-PORT-001
statement: 노트 전체를 zip으로 묶는 백업, 그리고 다른 앱에서 .md 파일을 씀씀으로 "공유"해 여는 흐름은 구현되어 있지 않다.
implemented_by:
  - apps/ch-life/app/settings.tsx (내보내기 절 — 노트 화면 버튼으로 안내만)
confidence: 코드추론
```

설정 화면의 "내보내기" 항목은 기능이 아니라 안내 문구다. 노트가 많아질수록 한 개씩 공유하는 것이 유일한 백업 수단이라는 뜻이며, [`POL-PORT-001`](../policy/POL-PORTABILITY.md)이 막으려던 "전부 잃어버리는" 시나리오에 대한 방어가 실제로는 얇다. iOS는 파일 앱에서 DB 파일 자체를 꺼낼 수 있다는 우회로가 있다([`RULE-NOTE-001`](note-persistence.md)).
