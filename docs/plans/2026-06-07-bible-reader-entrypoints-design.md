# 성경 리더 진입점 재설계 (홈 전체화면 / 에디터 모달)

- 날짜: 2026-06-07
- 상태: 설계 완료 → 구현
- 선행: [2026-06-07-bible-reader-default-design.md](./2026-06-07-bible-reader-default-design.md)

## 배경 / 변경 의도

선행 구현에서 홈(노트 목록) 헤더의 성경 버튼은 **모달**을 열고, 절 옆 `＋`로
**새 노트에 삽입**하는 흐름이었다. 사용자 요청에 따라 진입점을 둘로 분리한다.

1. **홈 목록**: 성경을 **전체화면(모달 아님)** 으로, **`＋` 삽입 버튼 없이 순수 읽기 전용**.
2. **에디터(`note/[id]`)**: 헤더에 성경 버튼을 추가해 **모달**로 열고, **현재 노트에 인용 삽입**(현행 모달 동작 유지).

> 이 결정은 선행 문서의 결정 #3("목록에서 연 리더의 삽입 = 새 노트로 삽입")을 의도적으로 뒤집는다.
> 홈 성경은 읽기 전용이 되며, 홈의 새-노트-삽입 흐름은 제거된다.

## 변경 설계

### A. `VerseList` 읽기 전용 모드 (`src/browser/VerseList.tsx`)

- `InsertMode` 를 `"currentNote" | "newNote" | "none"` 으로 확장.
- `insertMode === "none"` 이면 절 행의 `＋` Pressable 을 **렌더하지 않음**.
- `BibleReader` 가 이미 `insertMode` 를 `VerseList` 로 그대로 전달하므로 추가 배선 불필요.
  읽기 전용 진입점에서는 `onInsertVerse` 가 호출되지 않는다(무해한 no-op).

### B. 신규 라우트 `app/bible.tsx` — 전체화면 읽기 전용

```
┌─ AppHeader ─────────────────┐
│ ← 노트            성경        │  back → router.back()
├─────────────────────────────┤
│   <BibleReader               │
│     insertMode="none"        │  ← ＋ 버튼 없음
│     initialRef / onPosition  │  ← useBiblePosition()
│     onTitleChange → 헤더 제목 │  ← 현재 책/장 반영
│   />                         │
└─────────────────────────────┘
```

- `useBiblePosition()` 재사용 → "이어 읽기"(마지막 책·장)와 위치 저장이 모달과 동일하게 동작.
  읽기 위치는 홈 리더 / 에디터 모달이 전역 1개를 공유.
- `onTitleChange` 로 AppHeader 제목을 현재 책/장으로 갱신("페이지" 느낌).
- 리더 내부 `← 뒤로` 는 절→장→책 단계 이동, 헤더 `←` 는 목록으로 복귀.

### C. 홈 `app/index.tsx` — 모달 → 라우트, 삽입 흐름 제거

- `BookOpen` 헤더 버튼 `onPress`: `setBibleOpen(true)` → `router.push("/bible")`.
- 제거: `bibleOpen` state, `insertToNewNote`, 하단 `<BibleBrowser/>`, 미사용 import
  (`BibleBrowser`, `useAppStore`).

### D. 에디터 `app/note/[id].tsx` — 헤더 버튼으로 모달 연결

- 헤더 우측에 `HeaderIconButton icon={BookOpen} label="성경 읽기"` 추가
  → `onPress={() => setBrowserOpen(true)}` (지금까지 죽어있던 state 연결).
- 순서: `성경 / 공유 / 완료`.
- 기존 `<BibleBrowser visible={browserOpen} onInsertVerse={insertVerseFromBrowser}/>` 유지.
  `insertMode` 기본값 `"currentNote"` 라 절 `＋` 가 현재 노트에 인용 삽입.

## 엣지 / 비범위

- 태블릿(≥900px)은 `TabletWorkspace`(`BiblePanel`) 경로라 `/bible` 라우트와 무관 — 현행 유지.
- 저장된 `lastBibleRef` 파싱 실패 → 책 목록부터 시작(기존 `levelFromRef` 동작).
- 홈 읽기 전용이므로 빈 새 노트 생성 가능성 자체가 사라짐.

## 검증

- `pnpm typecheck` + `pnpm lint` + `pnpm test` (워크트리 내부).
- `InsertMode` 에 `"none"` 추가가 기존 테스트 회귀 없는지 확인.
- 폰 너비: 홈 성경 → `/bible` 전체화면(＋ 없음) → 뒤로 → 목록.
- 에디터: 성경 버튼 → 모달 → 절 `＋` → 현재 노트 인용 삽입.

## 작업 범위 요약

| 파일 | 변경 |
|---|---|
| `src/browser/VerseList.tsx` | `InsertMode`에 `"none"`, 읽기전용 시 `＋` 미렌더 |
| `app/bible.tsx` | **신규** — 전체화면 읽기 전용 리더 라우트 |
| `app/index.tsx` | 성경 버튼 → `/bible` push, 모달/삽입 흐름 제거 |
| `app/note/[id].tsx` | 헤더에 성경 버튼 추가(기존 모달 연결) |
