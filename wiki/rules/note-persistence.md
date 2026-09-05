# RULE-NOTE — 노트 저장과 수명주기

상위 정책: [`POL-NOTE-001`](../policy/POL-NOTE.md), [`POL-PRIVACY-001`](../policy/POL-PRIVACY.md), [`POL-NOTE-003`](../policy/POL-NOTE.md)(RULE-NOTE-004·008)

노트의 정본은 기기 안의 SQLite 파일 하나다. 저장소 계층은 **어댑터로 추상화**되어 있어, 프로덕션은 `expo-sqlite`로 실행되고 테스트는 Node의 `better-sqlite3`로 실행된다.

---

## RULE-NOTE-001 · 노트는 기기 로컬에만 존재한다

```yaml
id: RULE-NOTE-001
policy: POL-PRIVACY-001
requirement: MUST
statement: 모든 노트는 앱 문서 디렉터리의 ch-life.db 한 파일에 저장되며, 어떤 경로로도 자동 전송·동기화·백업되지 않는다.
implemented_by:
  - apps/ch-life/src/db/index.ts
  - apps/ch-life/src/db/expo-adapter.ts
verified_by:
  - manual: 비행기 모드에서 작성·재시작 후 노트 유지
waiver: POL-PRIVACY-001의 귀결. 전송 코드의 부재를 자동으로 증명할 수단이 없다.
confidence: 기록됨
source:
  - docs/legal/privacy-policy.md 3장
  - DESIGN.md Premises P4
```

iOS는 `UIFileSharingEnabled`, `LSSupportsOpeningDocumentsInPlace`가 켜져 있어 사용자가 파일 앱에서 DB 파일 자체를 꺼내 백업할 수 있다(`app.config.ts`). 앱을 삭제하면 데이터도 함께 사라지며 복구 경로는 없다 — 그래서 [`POL-PORT-001`](../policy/POL-PORTABILITY.md)의 내보내기가 유일한 안전장치다.

## RULE-NOTE-002 · update는 읽고-합치기(read-then-merge)다

```yaml
id: RULE-NOTE-002
policy: POL-NOTE-001
requirement: MUST
statement: 노트 부분 수정 시 null을 넘기면 해당 필드를 비우고, undefined(생략)면 기존 값을 유지한다. 존재하지 않는 id에 대한 수정은 예외를 던진다.
implemented_by:
  - apps/ch-life/src/db/note-repo.ts (update)
verified_by:
  - test: apps/ch-life/src/db/__tests__/note-repo.test.ts#update가 메타 필드를 부분 갱신한다
confidence: 기록됨
source:
  - apps/ch-life/CLAUDE.md 핵심 데이터 모델
  - apps/ch-life/.claude/skills/db-schema-change/SKILL.md 4단계
```

이 앱에서 **가장 조용히 깨지기 쉬운 규칙**이다. 새 컬럼을 추가하면서 이 병합 규칙을 따르지 않으면, 다른 화면이 부분 저장을 할 때마다 방금 입력한 값이 지워진다.

`update`는 먼저 현재 row를 `SELECT` 한 뒤 병합해 전체 컬럼을 `UPDATE` 한다. 두 화면이 동시에 같은 노트를 저장하는 상황은 이 앱에 존재하지 않으므로(단일 사용자·단일 활성 노트) 낙관적 잠금이 없다.

`updated_at`은 매 `update`마다 현재 시각으로 덮어쓴다. 호출자가 지정할 수 없다.

## RULE-NOTE-003 · id 생성 규칙

```yaml
id: RULE-NOTE-003
policy: POL-NOTE-001
requirement: MUST
statement: 노트 id는 36진수 타임스탬프 10자 + 36진수 난수 10자를 대문자로 이어붙인 20자 문자열이다. ULID가 아니다.
implemented_by:
  - apps/ch-life/src/db/note-repo.ts (makeId)
  - apps/ch-life/src/markdown/parse.ts (makeId)
verified_by:
  - test: apps/ch-life/src/db/__tests__/note-repo.test.ts#노트를 만들고 읽는다
confidence: 코드추론
```

시간 접두가 있어 생성 순서대로 사전식 정렬되지만, ULID의 Crockford Base32도 아니고 같은 밀리초 안의 단조 증가 보장도 없다. `DESIGN.md`와 v1 spec의 `id: string // ulid` 주석은 **현재 사실이 아니다**.

같은 함수가 `note-repo.ts`와 `markdown/parse.ts`에 **복제되어 있다**([`drift.md`](../drift.md)). 한쪽만 바꾸면 가져오기로 만든 노트와 앱에서 만든 노트의 id 형식이 갈린다.

## RULE-NOTE-004 · 목록은 작성일 내림차순

```yaml
id: RULE-NOTE-004
policy: POL-NOTE-003
requirement: MUST
statement: 노트 목록과 검색 결과는 created_at 내림차순으로 정렬하고 한 번에 최대 200건을 읽는다. 노트를 수정해도 순서는 바뀌지 않는다.
implemented_by:
  - apps/ch-life/src/db/note-repo.ts (listRecent, searchNotes)
verified_by:
  - test: apps/ch-life/src/db/__tests__/note-repo.test.ts#createdAt 내림차순 정렬 (업데이트해도 순서 변하지 않음)
confidence: 코드추론
```

계획 단계는 `updated_at DESC`였고([v1 spec 2.2](../../docs/plans/2026-05-17-ch-life-v1-spec.md)) 실제로 그 인덱스가 있었지만, 지금은 `created_at` 기준으로 **의도적으로 전환**되었다 — 스키마에 `DROP INDEX IF EXISTS idx_notes_updated_at`가 남아 있는 것이 그 흔적이다([`ADR-0008`](../decisions/ADR-0008-created-at-ordering.md)). 설교 노트는 "언제 쓴 설교인가"로 찾지 "언제 마지막으로 손댔는가"로 찾지 않는다는 판단으로 읽히나, 근거 기록은 없다.

200건 제한은 페이지네이션 없이 고정이다. 노트가 200개를 넘으면 오래된 것부터 목록에서 사라진다 — 검색에서도 마찬가지다.

## RULE-NOTE-005 · 마이그레이션은 버전 없이 멱등이다

```yaml
id: RULE-NOTE-005
policy: POL-NOTE-001
requirement: MUST
statement: 스키마 변경은 버전 번호나 마이그레이션 이력 테이블 없이, 매 실행마다 PRAGMA table_info로 누락 컬럼만 찾아 ALTER 한다. 몇 번을 실행해도 결과가 같아야 한다.
implemented_by:
  - apps/ch-life/src/db/migrate.ts
verified_by:
  - test: apps/ch-life/src/db/__tests__/migrate.test.ts#멱등하다 — 두 번 실행해도 오류 없음
confidence: 기록됨
source:
  - docs/plans/2026-05-24-sermon-meta-header.md Task 2
  - apps/ch-life/.claude/skills/db-schema-change/SKILL.md
```

`CREATE TABLE IF NOT EXISTS`는 이미 있는 테이블에 컬럼을 더해주지 않으므로, 기존 설치본을 위해 별도 경로가 필요했다. 버전 추적 대신 **현재 상태를 조회해 차이만 메우는** 방식을 골랐다([`ADR-0005`](../decisions/ADR-0005-idempotent-migration.md)).

이 선택의 대가:

- 추가되는 모든 단계가 스스로 멱등이어야 한다. 비멱등 단계를 하나 넣으면 두 번째 앱 실행에서 `duplicate column`으로 죽는다.
- 컬럼 삭제·타입 변경은 SQLite 특성상 테이블 재생성이 필요하고, 이 틀에서는 안전하게 표현할 수 없다.
- 데이터 backfill을 표현할 자리가 없다.

## RULE-NOTE-006 · 새 노트는 즉시 만들어지고 정리되지 않는다

```yaml
id: RULE-NOTE-006
policy: POL-NOTE-001
requirement: MAY
statement: 새 노트 버튼을 누르면 빈 문단 하나를 가진 노트가 즉시 DB에 생성된다. 사용자가 아무것도 쓰지 않고 나가도 그 빈 노트는 남는다.
implemented_by:
  - apps/ch-life/app/index.tsx (createNote)
  - apps/ch-life/src/workspace/TabletWorkspace.tsx (createNote)
verified_by:
  - manual: 새 노트 → 뒤로가기 → 목록에 "(빈 노트)" 항목이 남는다
confidence: 기록됨
source:
  - docs/plans/2026-06-07-bible-reader-default-design.md "엣지 케이스" (빈 노트 방치는 기존 동작과 동일, 별도 정리 없음)
```

즉시 생성해야 에디터가 저장 대상 id를 갖고 시작할 수 있다. 빈 노트 청소를 넣지 않은 것은 **명시적으로 기록된 선택**이다. 목록에서는 `(빈 노트)`로 표시된다.

## RULE-NOTE-007 · 노트 삭제는 되돌릴 수 있어야 한다

```yaml
id: RULE-NOTE-007
requirement: MUST
policy: POL-NOTE-001
statement: 노트는 목록 스와이프·에디터·태블릿 세 경로에서 삭제할 수 있다. delete는 지우기 전에 노트 전체를 스냅샷으로 반환하고, 그 스냅샷으로 되돌리는 undo 경로가 제공된다. 되돌리기는 id와 created_at까지 원본 그대로 복원한다.
implemented_by:
  - apps/ch-life/src/notes/note-actions.ts
  - apps/ch-life/src/db/note-repo.ts
  - apps/ch-life/src/list/SwipeToDelete.tsx
verified_by:
  - test: apps/ch-life/src/notes/__tests__/note-actions.test.ts#deleteNoteWithUndo는 삭제 스냅샷과 revision을 등록한다
  - test: apps/ch-life/src/db/__tests__/note-repo.test.ts#delete가 완전한 스냅샷을 반환하고 restore가 그대로 복원한다
confidence: 기록됨
source:
  - docs/superpowers/specs/2026-08-09-note-delete-and-insert-feedback-design.md
```

`restore`는 `create`와 달리 id를 새로 발급하지 않고 `created_at`도 보존한다 — 되돌린 노트가 목록에서 원래 자리로 돌아가야 하기 때문이다([`RULE-NOTE-004`](#rule-note-004)의 `created_at DESC` 정렬과 묶여 있다). 그래서 `restore`는 **같은 id의 기존 노트를 덮어쓰지 않는다.**

이 규칙은 2026-09-05 이전 정본에서 정반대로 서술되어 있었다("앱 안에서 노트를 지울 수 없다"). 삭제 UI가 실제로 들어온 것은 1.0.1 릴리스다.

이것은 서술이지 승인된 설계가 아니다. `docs/legal/privacy-policy.md` 8장은 "사용자는 언제든지 앱 내에서 노트를 직접 수정·**삭제**하거나"라고 공개적으로 약속하고 있으나, **구현에는 그 경로가 없다.** 공개 문서와 구현이 어긋난 상태다([`drift.md`](../drift.md) D절).

## RULE-NOTE-008 · 목록 그룹핑은 작성일 기준

```yaml
id: RULE-NOTE-008
policy: POL-NOTE-003
requirement: MUST
statement: 노트 목록은 createdAt의 날짜로 묶고 최신 날짜 그룹이 위에 온다. 같은 그룹 안에서도 createdAt 내림차순이며 updatedAt은 무시한다.
implemented_by:
  - apps/ch-life/src/list/group-notes.ts
  - apps/ch-life/src/list/format-card.ts
verified_by:
  - test: apps/ch-life/src/list/__tests__/group-notes.test.ts
  - test: apps/ch-life/src/list/__tests__/format-card.test.ts
confidence: 코드추론
```

그룹 머리글은 `5월 17일` + 요일이고, 일요일은 `주일`로 표기한다. 카드는 제목이 없으면 본문 앞부분(강조 기호를 벗긴 40자)으로, 그것도 없으면 `(빈 노트)`로 대체한다. 카드에는 작성 시각(`HH:mm`), 설교자, 생명양식이 함께 표시된다.

날짜 계산은 기기 로컬 타임존을 쓴다. 테스트는 `TZ=Asia/Seoul`로 고정해 실행한다(`pnpm test`).
