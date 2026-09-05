# ADR-0005 · 버전 없는 멱등 마이그레이션

```yaml
id: ADR-0005
status: accepted
statement: 스키마 마이그레이션은 버전 번호나 이력 테이블 없이, 매 실행마다 현재 스키마를 조회해 누락된 컬럼만 추가하는 방식으로 한다.
confidence: 기록됨
source:
  - docs/plans/2026-05-24-sermon-meta-header.md Task 2
  - apps/ch-life/.claude/skills/db-schema-change/SKILL.md
```

## 맥락

설교 메타 필드 4개를 추가하면서 문제가 드러났다. `CREATE TABLE IF NOT EXISTS`는 **기존 테이블에 컬럼을 더해주지 않으므로**, 이미 앱을 쓰고 있는 사용자의 DB에는 새 컬럼이 생기지 않는다.

## 결정

`PRAGMA table_info(notes)`로 현재 컬럼을 읽고, `ADDED_NOTE_COLUMNS` 목록 중 없는 것만 `ALTER TABLE ADD COLUMN` 한다. 버전 번호를 두지 않는다.

## 이유 (미기록 · 정황)

> 출처는 **무엇을 했는지까지만** 적는다. plan Task 2는 "`CREATE TABLE IF NOT EXISTS`는 기존 테이블에 컬럼을 추가하지 못하므로 `PRAGMA table_info`로 확인 후 `ALTER TABLE ADD COLUMN` 하는 멱등 마이그레이션을 도입한다", 스킬 문서는 "버전 번호/마이그레이션 테이블이 없으므로, 추가하는 단계도 반드시 멱등이어야 한다"까지다.
>
> **왜 버전 테이블 대신 이 방식인지는 기록이 없다.** 단일 사용자·단일 기기 구조에서 마이그레이션 프레임워크가 과하다는 판단이었을 가능성이 크지만 추정이며, 확정하려면 사용자의 답이 필요하다([`drift.md` E절](../drift.md)).

## 귀결

- 새 컬럼 추가는 배열에 한 줄 더하는 것으로 끝난다. 실행 순서나 이력을 신경 쓸 필요가 없다.
- **모든 단계가 스스로 멱등이어야 한다.** 비멱등 단계를 하나 넣으면 두 번째 앱 실행에서 `duplicate column`으로 죽는다.
- 컬럼 삭제·타입 변경·데이터 backfill을 표현할 자리가 없다. SQLite에서 그런 변경은 테이블 재생성이 필요한데, 이 틀은 그것을 담지 못한다.
- 스키마가 "지금 어느 버전인지" 알 수 없다. 롤백 개념도 없다.
