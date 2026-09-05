# CONTRACT-NOTE-REPO — 저장소 계층 API

```yaml
id: CONTRACT-NOTE-REPO
policy: POL-NOTE-001
statement: 화면은 SQL을 직접 쓰지 않고 note-repo가 노출하는 일곱 함수만 사용한다. repo는 DbAdapter 인터페이스에만 의존해 프로덕션(expo-sqlite)과 테스트(better-sqlite3)에서 같은 코드로 동작한다.
implemented_by:
  - apps/ch-life/src/db/note-repo.ts
  - apps/ch-life/src/db/expo-adapter.ts
verified_by:
  - test: apps/ch-life/src/db/__tests__/note-repo.test.ts
  - test: apps/ch-life/src/db/__tests__/note-repo-search.test.ts
confidence: 코드추론
```

## API

| 함수 | 계약 |
|---|---|
| `create(input)` | id 생략 시 발급. `created_at`·`updated_at` 모두 현재 시각. 반환은 id. |
| `update(id, patch)` | read-then-merge. `null`=비움 / 생략=유지. 없는 id면 `throw`. `updated_at` 자동 갱신 ([`RULE-NOTE-002`](../rules/note-persistence.md)) |
| `findById(id)` | 없으면 `null` |
| `listRecent({limit})` | `created_at DESC` ([`RULE-NOTE-004`](../rules/note-persistence.md)) |
| `delete(id)` | 지우기 전 노트를 읽어 **스냅샷을 반환**한다. 없으면 `null` ([`RULE-NOTE-007`](../rules/note-persistence.md)) |
| `restore(note)` | 스냅샷을 통째로 INSERT. **id·`created_at`을 보존**하므로 `create`와 다르다 ([`RULE-NOTE-007`](../rules/note-persistence.md)) |
| `searchNotes(q)` | FTS 접두 매칭, 최대 200건 ([`RULE-SEARCH-*`](../rules/search.md)) |

## 어댑터 이원화

```ts
type DbAdapter = { execAsync, runAsync, getAllAsync, getFirstAsync };
```

이 네 함수만 있으면 어떤 SQLite 바인딩이든 붙는다. 그래서 DB 로직 전체가 Node에서 실기기 없이 테스트된다 — 이 프로젝트에서 **가장 신뢰도 높은 자동 증거가 이 계층에 몰려 있는 이유**다.

한계: 두 구현의 차이(트랜잭션 동작, 동시성, WAL, 타입 강제)는 검증되지 않는다. `expo-sqlite`에서만 나타나는 문제는 테스트가 잡지 못한다.

## 바꾸려면

새 조회를 추가할 때 화면에서 SQL을 직접 쓰지 않는다. repo에 함수를 더하고 `note-repo.test.ts`에 테스트를 함께 추가한다.
