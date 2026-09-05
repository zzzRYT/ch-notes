# ADR-0006 · 스키마 DDL 이중 기록을 감수한다

```yaml
id: ADR-0006
status: accepted
statement: 같은 DDL이 db/index.ts의 인라인 문자열(프로덕션 실행)과 db/schema.sql 파일(테스트 로드)에 중복 기록되어 있으며, 이 상태를 수용하고 규율로 관리한다.
confidence: 확인필요
source:
  - apps/ch-life/CLAUDE.md ("스키마가 두 곳에 중복 — 동시 수정 필수")
  - apps/ch-life/.claude/skills/db-schema-change/SKILL.md 1~2단계
```

## 맥락

프로덕션은 React Native 번들에서 실행되므로 `.sql` 파일을 파일시스템에서 읽을 수 없다. 그래서 DDL이 TypeScript 문자열로 들어가 있다. 반면 테스트는 Node에서 `fs.readFileSync`로 `schema.sql`을 읽어 better-sqlite3에 먹인다.

## 결정

번들러 설정을 손대는 대신 **두 곳을 함께 고치는 규율**로 관리한다. 그 규율을 프로젝트 스킬(`db-schema-change`)로 문서화한다.

## 이유

기록되어 있지 않다. RN 번들러에서 `.sql`을 문자열로 import 하려면 별도 transformer 설정이 필요하고, 이 프로젝트에는 `metro.config.js` 자체가 없다는 점이 정황이다. **확인이 필요하다.**

## 귀결 (이미 발생한 것)

- **두 파일은 이미 어긋나 있다.** `db/index.ts`에만 `DROP INDEX IF EXISTS idx_notes_updated_at`가 있다.
- 따라서 **테스트가 검증하는 스키마는 프로덕션이 실행하는 스키마가 아니다.** 오라클과 실물이 다르다([`drift.md`](../drift.md) C절).
- 규율은 사람이 지켜야 하고, 어겨도 CI가 잡지 못한다.

## 대안 (채택하지 않음)

- 정본을 TS 문자열 하나로 두고, 테스트가 그 상수를 import 해 쓴다. 파일 중복이 사라지고 오라클이 실물과 같아진다. **가장 작은 개선이지만 아직 하지 않았다.**
- 두 파일이 같은지 비교하는 테스트를 추가한다.
