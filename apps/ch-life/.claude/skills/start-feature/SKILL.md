---
name: start-feature
description: Given a feature keyword, create an isolated git worktree + branch under .worktrees/, install deps there, then kick off brainstorming for the feature. Use when starting any new feature/fix/chore that deserves isolation — e.g. "start-feature 성경 검색", "새 기능 워크트리 만들어줘", "브레인스토밍 시작하자".
---

# 새 기능 시작 (워크트리 + 브레인스토밍)

키워드를 받아 격리된 워크트리를 만들고 의존성을 깔고, 곧바로 브레인스토밍으로 넘긴다.
ch-life는 모든 기능 작업을 `.worktrees/`에서 격리해서 진행한다(main 체크아웃의 node_modules는
깨져 있을 수 있으므로 워크트리 안에서 검증).

## 입력에서 이름 도출

키워드(한글/영문 가능)에서 두 값을 만든다:
- `<slug>` — 짧은 kebab-case 영문. 예: "성경 검색" → `bible-search`, "노트 공유 개선" → `note-share`.
- `<branch>` — 타입 접두사 + slug. 기본 `feature/<slug>`. 키워드가 버그수정이면 `fix/<slug>`,
  잡일/릴리스 준비면 `chore/<slug>`. (기존 컨벤션: `feature/`, `fix/`, `chore/`)

확신이 안 서면 사용자에게 slug/타입을 한 번 확인한다.

## 0) 정본 확인 (워크트리 만들기 전에)

`wiki/by-task.md`에서 이 키워드가 닿는 영역을 찾아 기존 `POL`/`RULE`/`ADR`을 훑는다.
**이미 결정되었거나 의도적으로 안 하기로 한 것과 충돌하면 여기서 멈추고 사용자에게 확인한다.**
워크트리 생성 + `pnpm install`(better-sqlite3 네이티브 빌드)은 비싸다 — 그 전에 거른다.

## 1) 워크트리 생성

저장소 루트(`apps/ch-life`의 부모, `.worktrees/`가 있는 곳)에서 실행한다.

```bash
# 최신 main 기준으로 분기 (원격 반영)
git fetch origin --quiet || true
BASE=$(git rev-parse --verify origin/main >/dev/null 2>&1 && echo origin/main || echo main)

# 이미 있으면 멈추고 사용자에게 알릴 것
test ! -e ".worktrees/<slug>" || { echo ".worktrees/<slug> 이미 존재"; exit 1; }

git worktree add ".worktrees/<slug>" -b "<branch>" "$BASE"
```

브랜치명이 이미 존재하면 `-b` 대신 기존 브랜치를 체크아웃: `git worktree add ".worktrees/<slug>" "<branch>"`.

## 2) 의존성 설치

워크트리는 자체 node_modules가 필요하다(설치 전엔 typecheck/test 불가).

```bash
cd ".worktrees/<slug>/apps/ch-life" && pnpm install --frozen-lockfile
```

(시간이 좀 걸린다. better-sqlite3 네이티브 빌드 포함.)

## 3) 브레인스토밍으로 인계

이제 작업 컨텍스트를 이 워크트리(`.worktrees/<slug>/apps/ch-life`)로 잡고,
`superpowers:brainstorming` 스킬을 실행해 기능 설계를 시작한다. 브레인스토밍은:
- 한 번에 한 질문씩 목적·제약·성공기준을 좁히고,
- 2~3개 접근법을 비교한 뒤,
- 합의된 설계를 **`docs/plans/<오늘날짜>-<slug>-design.md`** 에 기록한다(저장소 루트의 docs).

> 날짜는 환경의 현재 날짜를 쓴다(YYYY-MM-DD).

## 마무리 안내

사용자에게 다음을 알린다:
- 생성된 워크트리 경로와 브랜치명
- "이 안에서 검증(typecheck/lint/test)하면 됩니다"
- 설계가 끝나면 `superpowers:writing-plans`로 구현 계획을 만들 수 있다는 점

## 주의

- `.worktrees/`는 gitignore됨 — 워크트리 자체는 커밋 대상이 아니다.
- 절대 main에서 직접 기능 작업하지 말 것. 격리가 이 스킬의 존재 이유다.
- 설계 문서는 워크트리 안이 아니라 **공유되는 docs/plans**에 둔다(머지 시 함께 올라가도록).
