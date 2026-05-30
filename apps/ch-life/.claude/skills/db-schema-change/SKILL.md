---
name: db-schema-change
description: Add or change a column/table in the ch-life notes SQLite DB. Use when modifying the notes schema, adding a Note field, or touching db/schema.sql, db/index.ts, migrate.ts, or note-repo.ts. Keeps the duplicated schema, idempotent migration, repo mapping, and tests in sync.
---

# DB 스키마 변경

ch-life의 노트 DB는 스키마가 **두 곳에 중복**되고, 마이그레이션은 **버전 추적 없이 멱등**으로
돌며, 테스트와 프로덕션이 **서로 다른 SQLite 구현**을 쓴다. 한 곳만 고치면 조용히 깨진다.
컬럼/테이블을 추가·변경할 때 아래 순서를 모두 통과시킬 것.

## 체크리스트 (순서대로)

1. **`src/db/schema.sql`** — 정본 DDL. `CREATE TABLE` 정의를 갱신한다.
2. **`src/db/index.ts`** — ⚠️ 인라인 스키마 문자열이 `schema.sql`을 **중복**한다. 동일하게 수정.
   (둘이 어긋나면 신규 설치 DB와 마이그레이션된 DB가 달라진다.)
3. **`src/db/migrate.ts`** — 기존 사용자 DB는 `CREATE TABLE`로 안 바뀐다. 컬럼 추가라면
   `ADDED_NOTE_COLUMNS` 배열에 `{ name, ddl: "ALTER TABLE notes ADD COLUMN ..." }`를 추가한다.
   `addMissingNoteColumns`가 `PRAGMA table_info`로 누락 컬럼만 ALTER → **매 실행 멱등**.
   - 버전 번호/마이그레이션 테이블이 없으므로, 추가하는 단계도 반드시 멱등이어야 한다.
   - 컬럼 삭제/타입 변경은 SQLite 한계상 테이블 재생성이 필요 — 단순 ADD가 아니면 신중히.
4. **`src/db/note-repo.ts`** — 행↔`Note` 매핑(읽기/쓰기 양쪽)에 새 필드를 반영한다.
   - `update`는 **read-then-merge**: `null`은 컬럼을 비우고, `undefined`는 기존값을 유지한다.
     새 필드도 이 규칙을 따르게 한다.
5. **`src/domain/types.ts`** — `Note`(및 관련 타입) 모양을 갱신한다.
6. **검색 대상이면 FTS** — FTS는 현재 `title` + `cited_refs`만 색인하고 `body_text`는 빈
   문자열로 들어간다(알려진 제약). 새 필드를 검색 가능하게 하려면 FTS 트리거/삽입 경로도 함께 수정.
7. **테스트** — `src/db/__tests__`에 추가·갱신. 테스트는 **better-sqlite3**(노드)로 돌고
   프로덕션은 **expo-sqlite**다. 마이그레이션 멱등성(같은 DB에 두 번 실행)과
   read-then-merge 동작을 반드시 커버한다.

## 검증

```bash
pnpm test    # TZ=Asia/Seoul jest, db/__tests__ 포함
pnpm typecheck
```

## 자주 빠뜨리는 것

- `schema.sql`만 고치고 `db/index.ts` 인라인 스키마를 안 고침 → 신규 설치만 깨짐.
- 마이그레이션을 안 추가해서 기존 사용자에게 컬럼이 없음 → 런타임 에러.
- 마이그레이션 단계가 비멱등 → 두 번째 앱 실행에서 "duplicate column" 에러.
