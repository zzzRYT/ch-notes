# ADR-0014 · 기능 작업은 워크트리에서 격리한다

```yaml
id: ADR-0014
status: accepted
statement: 모든 기능·수정 작업은 .worktrees/ 아래의 별도 git worktree와 브랜치에서 하고, 검증도 그 안에서 실행한다. main 체크아웃에서 직접 작업하지 않는다.
confidence: 기록됨
source:
  - apps/ch-life/CLAUDE.md 워크트리 절
  - apps/ch-life/.claude/skills/start-feature/SKILL.md
  - docs/plans/2026-05-30-harness-structure-design.md
```

## 맥락

기록된 목적은 한 줄이다 — **"main 직접 작업 금지·격리가 목적"**(`docs/plans/2026-05-30-harness-structure-design.md`). 여기에 `CLAUDE.md`가 실무적 이유를 하나 더한다: `main` 체크아웃의 `node_modules`는 깨져 있을 수 있으므로 **검증은 활성 워크트리 안에서** 해야 한다.

> **정황 (미기록).** "에이전트가 코드를 생성하는 비중이 커서"라는 동기는 기록되어 있지 않다.

## 결정

`origin/main`에서 분기한 워크트리를 `.worktrees/<slug>`에 만들고, 그 안에서 `pnpm install` 후 작업·검증한다. 브랜치 접두는 `feature/` · `fix/` · `chore/`.

## 귀결

- **검증 결과가 신뢰할 수 있다.** 워크트리 안에서 돌린 `typecheck/lint/test`는 그 브랜치의 상태만 반영한다.
- 여러 기능을 동시에 진행해도 서로 영향을 주지 않는다.
- 워크트리마다 `node_modules`를 새로 깔아야 한다(better-sqlite3 네이티브 빌드 포함). 시간과 디스크를 쓴다.
- `.worktrees/`는 gitignore 대상이라 워크트리 자체는 커밋되지 않는다.
- **설계 문서는 워크트리가 아니라 공유되는 `docs/plans/`에 둔다** — 머지될 때 함께 올라가도록. 이 위키도 같은 원칙을 따른다(저장소 루트 `wiki/`).
