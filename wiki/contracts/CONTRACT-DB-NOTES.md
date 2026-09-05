# CONTRACT-DB-NOTES — 노트 데이터베이스 스키마

```yaml
id: CONTRACT-DB-NOTES
policy: POL-NOTE-001
statement: 노트는 ch-life.db의 notes 테이블에 저장되고, 검색은 notes_fts 가상 테이블에 트리거로 동기화된다. 이 DDL은 두 파일에 중복 기록되어 있으며 항상 함께 바뀌어야 한다.
implemented_by:
  - apps/ch-life/src/db/schema.sql
  - apps/ch-life/src/db/index.ts
  - apps/ch-life/src/db/migrate.ts
verified_by:
  - test: apps/ch-life/src/db/__tests__/migrations.test.ts
  - test: apps/ch-life/src/db/__tests__/migrate.test.ts
confidence: 기록됨
source:
  - apps/ch-life/.claude/skills/db-schema-change/SKILL.md
```

## 테이블

```sql
notes(
  id TEXT PRIMARY KEY, title TEXT, body_json TEXT NOT NULL,
  created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
  cited_refs TEXT NOT NULL DEFAULT '[]',
  sermon_date TEXT, preacher TEXT, location TEXT, scripture TEXT
)
idx_notes_created_at (created_at DESC)   -- 목록 정렬
idx_notes_title
notes_fts USING fts5(id UNINDEXED, title, body_text, cited_refs, tokenize='unicode61')
```

- `body_json` = `BlockNode[]`의 JSON 문자열([`CONTRACT-DOMAIN-NOTE`](CONTRACT-DOMAIN-NOTE.md)).
- `cited_refs` = 문자열 배열의 JSON.
- `sermon_date` = `YYYY-MM-DD` 달력 문자열(타임스탬프 아님).
- FTS는 `content=` 옵션 없는 **독립 테이블**이며 세 트리거(`notes_ai` / `notes_ad` / `notes_au`)로 동기화한다. INSERT 트리거는 `body_text`에 빈 문자열을 넣고, UPDATE 트리거는 `body_text`를 건드리지 않는다([`RULE-SEARCH-001`](../rules/search.md)).

## 계약의 위험 지점

### 1. 스키마가 두 곳에 있고, 이미 어긋나 있다

`db/index.ts`의 인라인 문자열이 프로덕션에서 실행되고, `db/schema.sql`은 테스트가 읽는다. 두 파일은 같아야 하지만 **지금 동일하지 않다** — 인라인 쪽에만 `DROP INDEX IF EXISTS idx_notes_updated_at`가 있다.

의미: **테스트가 검증하는 DDL은 프로덕션이 실행하는 DDL이 아니다.** 오라클이 실물과 다르다. 지금은 차이가 낡은 인덱스 제거뿐이라 무해하지만, 구조적으로는 언제든 갈라질 수 있다([`ADR-0006`](../decisions/ADR-0006-duplicated-schema.md), [`drift.md`](../drift.md) C절).

### 2. 마이그레이션에 버전이 없다

컬럼 추가는 `ADDED_NOTE_COLUMNS` 배열에 `{ name, ddl }`을 더하는 것으로만 표현할 수 있다([`RULE-NOTE-005`](../rules/note-persistence.md)). 컬럼 삭제·타입 변경·데이터 backfill을 표현할 자리가 없다.

### 3. 신규 설치와 기존 설치의 경로가 다르다

신규 설치는 `CREATE TABLE`로 컬럼을 갖고 태어나고, 기존 설치는 `ALTER TABLE`로 뒤늦게 받는다. 둘 중 하나만 고치면 한쪽 사용자에게서만 깨진다.

## 바꾸려면

`apps/ch-life/.claude/skills/db-schema-change/SKILL.md`의 7단계 체크리스트를 그대로 따른다: `schema.sql` → `db/index.ts` 인라인 → `migrate.ts` 멱등 단계 → `note-repo.ts` 양방향 매핑 → `domain/types.ts` → (검색 대상이면) FTS 트리거 → `db/__tests__` 멱등성·병합 테스트.
