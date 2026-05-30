# ch-life 하네스 구조화 설계

Date: 2026-05-30

## 목표

`apps/ch-life`의 실제 구현에 맞는 CLAUDE.md, 프로젝트 스킬, 훅을 정리해
효율적인 개발과 유지보수가 가능하도록 하네스를 구조화한다.

우선순위(모두 채택): 컨텍스트/온보딩 · 자동 가드레일(훅) · 반복 작업 스킬 · 워크트리/배포 흐름.

## 설계 원칙

1. **글로벌 ECC 룰과 중복 금지** — `~/.claude/rules/`에 코딩스타일·테스트·보안이
   이미 있으므로, 프로젝트 설정에는 *이 프로젝트에서만 참인 것*만 담는다.
2. **얇게 유지** — CLAUDE.md는 매 세션 로드되므로 포인터 위주, 200줄 이내.
3. **새 도구 도입 안 함** — 훅은 기존 `eslint --fix`만 사용(prettier 미설치).
4. **설정의 집은 `apps/ch-life`** — 단일 앱 repo이고 워크트리가 이 폴더를 통째로 들고 감.
   루트 `.claude/`는 건드리지 않는다.

## 파일 배치

```
apps/ch-life/
├── CLAUDE.md                    # 알맹이 (기존 @AGENTS.md 한 줄 대체)
├── AGENTS.md                    # Expo v54 주의 (유지)
└── .claude/
    ├── settings.json            # expo 플러그인(보존) + hooks 추가
    └── skills/
        ├── db-schema-change/SKILL.md
        └── eas-release/SKILL.md
```

## CLAUDE.md 구성

- 한 줄 소개(Expo SDK 54 / RN / expo-router / expo-sqlite / zustand, web+mobile)
- Expo v54 버전드 문서 링크(AGENTS.md 내용 흡수)
- 명령어(typecheck/lint/test/start/android/ios), 테스트는 better-sqlite3
- 아키텍처 지도(feature/domain별 폴더)
- 핵심 데이터 모델 & 함정(메모리에서 승격):
  - Note.body = BlockNode[] → body_json TEXT
  - repo update = read-then-merge (null=clear, undefined=keep)
  - **스키마 중복**: db/index.ts + schema.sql 동시 수정
  - 마이그레이션 버전리스 멱등
  - FTS는 title + cited_refs만, body_text는 빈 색인
  - isDark = variation==="dark"
  - 900px phone/tablet 분기
  - bible.json = CC BY-SA 4.0 (재배포 텍스트 BY-SA 유지)
- 워크트리 워크플로

## 훅 (가볍게, 비차단)

- **PostToolUse (Write|Edit)**: 수정된 `.ts/.tsx`에만 `eslint --fix` 자동수정.
  scripts/android/ios는 eslint config가 이미 ignore.
- **Stop**: `tsc --noEmit` 1회, 비차단(정보만). jest/build는 무거워서 제외.

## 스킬

### db-schema-change
schema.sql → db/index.ts(중복) → migrate.ts(멱등 ADDED_NOTE_COLUMNS) →
note-repo.ts(read-then-merge) → domain/types.ts → (FTS) → db/__tests__(better-sqlite3).
함정: 스키마 2곳 중복, 버전 추적 없는 멱등 마이그레이션, expo-sqlite/better-sqlite3 이원화.

### eas-release
- JS/에셋만 → EAS Update(OTA). main CI 통과 시 preview 자동, 수동 dispatch 가능.
- 네이티브 의존성/version 변경 → EAS Build(수동 dispatch, --no-wait).
- 함정: `runtimeVersion: appVersion` → version 올리면 OTA 미도달, 새 빌드 필수.
- 함정: pnpm `.npmrc` node-linker=hoisted 필수.

### start-feature
키워드 → slug/branch 도출(`feature/`·`fix/`·`chore/`) → `origin/main` 기준
`.worktrees/<slug>` 워크트리+브랜치 생성 → 워크트리 안 `pnpm install` →
`superpowers:brainstorming` 인계, 설계는 `docs/plans/<날짜>-<slug>-design.md`에 기록.
main 직접 작업 금지·격리가 목적. 설계 문서는 워크트리가 아닌 공유 docs/plans에 둔다.
