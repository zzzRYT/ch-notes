# 성경 리더 기본 노출 설계

- 날짜: 2026-06-07
- 상태: 설계 완료 (구현 대기)

## 배경 / 목표

태블릿 우측 패널은 현재 "현재 노트가 인용한 구절 정보"(`BibleLookupPanel`)만 보여준다.
사용자는 우측 패널에서 **기본적으로 성경 자체가 떠서 검색해 바로 찾아볼 수 있기를** 원한다.
모바일에는 이에 대응하는 진입점이 없으므로, **노트 목록 화면 상단 버튼**으로 성경을 바로 열 수 있게 한다.

### 확정된 결정 사항

1. **태블릿 우측 패널**: "성경 / 인용" 탭으로 둘 다 유지. 기본 탭은 **성경(리더)**.
2. **모바일 진입점**: **노트 목록 화면 상단 헤더**에 성경 버튼. (에디터 화면은 현행 유지)
3. **목록에서 연 리더의 삽입 동작**: 활성 노트가 없으므로 **새 노트로 삽입**.
4. **읽기 위치 기억**: 마지막으로 읽던 **책·장**을 기억해 이어 읽기.

## 핵심 전략 — 기존 컴포넌트 재사용

현재 분리된 두 성경 UI:

| 컴포넌트 | 위치 | 역할 | 상태 |
|---|---|---|---|
| `BibleBrowser` | `src/browser/` | 책→장→절 탐색 + 검색, 반응형(sidebar/modal) | 완성 |
| `BibleLookupPanel` | `src/workspace/` | 검색 + "현재 노트 인용 목록", 태블릿 우측 패널 | 완성 |

신규 코드를 최소화하기 위해 **`BibleBrowser`의 탐색 본문을 재사용 가능한 리더로 추출**하고,
세 진입점(모바일 모달 / 에디터 사이드바 / 태블릿 "성경" 탭)이 같은 리더를 공유한다.

## 변경 설계

### 1. `BibleReader` 추출 (`src/browser/`)

`BibleBrowser`의 내부 `body` JSX(책/장/절 렌더 + `level`/`testament`/`search` 상태)를
순수 리더 컴포넌트 `BibleReader`로 분리한다. 헤더 닫기버튼·모달/사이드바 래핑은 `BibleBrowser`에 남긴다.

```ts
type BibleReaderProps = {
  onInsertVerse: (ref: string) => void;
  insertMode?: "currentNote" | "newNote"; // 버튼 라벨 분기 (기본 currentNote)
  initialRef?: string | null;             // 마지막 읽던 위치 (예: "Gen 1")
  onPositionChange?: (book: BookCode, chapter: number) => void;
};
```

- 내부 상태 `level`/`testament`/`search`는 그대로 유지.
- `initialRef`로 초기 `level` 계산: 파싱 성공 시 `{kind:"verses", book, chapter}`, 실패/없음 시 `{kind:"books"}`.
- 절 화면(`VerseList`)에서 장이 바뀔 때마다 `onPositionChange(book, chapter)` 호출.
- 삽입 버튼 라벨: `insertMode === "newNote"` → "＋ 새 노트에 담기", 아니면 "＋ 노트에 삽입".

`BibleBrowser`는 `BibleReader`를 감싸 모달/사이드바 + 닫기 헤더만 제공하도록 슬림화한다.

### 2. 태블릿 우측 패널 → 탭 컨테이너 `BiblePanel` (`src/workspace/`)

```
┌─ 우측 패널 (340px) ──────────┐
│  [ 성경 ]  [ 인용 ③ ]    ›   │  ← 탭 헤더 + 접기 버튼(›)
├──────────────────────────────┤
│   (활성 탭 내용)              │
└──────────────────────────────┘
```

- 탭 상태: `useState<"reader" | "cited">("reader")` — 기본 "성경(reader)".
- 인용 탭에 현재 인용 수(`citedRefs.length`)를 카운트 배지로 표시.
- **성경 탭** → `BibleReader` (props: `onInsert`=활성 노트 삽입, `initialRef`, `onPositionChange`).
- **인용 탭** → 기존 `BibleLookupPanel`의 인용 목록 + 검색 부분 재사용.
- `TabletWorkspace`: 우측 패널의 `<BibleLookupPanel/>`를 `<BiblePanel/>`로 교체.
  기존 `insertRef`(현 `TabletWorkspace.tsx:148`)를 양쪽 onInsert로 전달. 접기/펼치기 로직 유지.

**스타일 점검**: 340px 고정폭에서 `ChapterGrid`(4열) / `VerseList` 레이아웃 확인
(`BibleBrowser` sidebar는 33% 폭 기준이므로 고정폭에서 재검).

### 3. 모바일 노트 목록 헤더 버튼 (`app/index.tsx`)

- `AppHeader` 우측 버튼에 **성경 아이콘** 추가 (순서: 성경 / 검색 / 가져오기 / 설정).
- `accessibilityLabel="성경 읽기"`, 터치 타깃 ≥ 48px (어르신 친화).
- 탭 시 `bibleOpen` 상태 → `<BibleBrowser visible insertMode="newNote" onClose />` 모달.

### 4. 읽기전용 + "새 노트로 삽입" 흐름

기존 `pendingInsertRef` 메커니즘을 그대로 재사용한다.

1. 목록에서 성경 열기 → 절 옆 버튼 "＋ 새 노트에 담기".
2. 탭 시:
   ```ts
   requestInsertRef(ref);                       // app-store에 이미 존재
   const repo = await openNoteRepo();
   const id = await repo.create({
     title: null, body: [{ type: "paragraph", text: "" }], citedRefs: [],
   });
   router.push(`/note/${id}`);
   ```
3. 에디터 마운트 → 기존 `consumePendingInsert()` (`app/note/[id].tsx:93`)가 자동 삽입. **추가 작업 없음.**

에디터 화면은 이미 `BibleBrowser`(currentNote 모드)를 가지고 있으므로 현행 유지.

### 5. 읽기 위치 기억

`Settings`에 필드 추가:

```ts
// src/domain/types.ts — Settings
lastBibleRef: string | null;   // 예: "Gen 1" (책코드 + 장)
```

- `src/state/app-store.ts` `DEFAULT_SETTINGS`에 `lastBibleRef: null` 추가.
- `src/state/settings-persist.ts` `parseSettings`: **관대하게 읽기** —
  `lastBibleRef`가 없거나 string이 아니면 `null` 폴백, **파일 전체를 reject하지 않는다.**
  (기존 `lastOpenedNoteId`는 reject 방식 → 구버전 settings.json이 통째로 날아갈 위험.
  이 필드는 `readEnum` 스타일의 안전 처리로 회귀 방지.)
- `BibleReader.onPositionChange(book, chapter)` → `setSettings({ lastBibleRef })` + persist.
- 다음 오픈 시 `initialRef`로 해당 장 진입.
- 저장 단위는 **장(chapter)까지만**. 절 스크롤 위치 저장은 YAGNI.
- 위치는 전역 1개 — 태블릿 리더 / 에디터 모달 / 목록 모달이 공유.

## 엣지 케이스

- 저장된 `lastBibleRef` 파싱 실패 → 책 목록으로 시작.
- 340px 패널에서 `ChapterGrid` 4열 오버플로우 → 점검 후 필요시 3열/반응형 조정.
- 목록에서 새 노트 생성 직후 삽입 없이 닫기 → 빈 노트 방치는 기존 동작과 동일(별도 정리 없음).

## 테스트 (jest)

- `parseSettings`: `lastBibleRef` 누락/잘못된 값 → 파일 reject 안 되고 `null` 폴백 **(핵심 회귀 방지)**.
- `lastBibleRef` round-trip(save→load) 유지.
- `BibleReader` `initialRef` → 초기 level이 chapters/verses로 진입.
- 기존 `BibleBrowser` / `verse-lookup` 테스트 회귀 확인.

## 검증

- `pnpm typecheck` + `pnpm lint` + `pnpm test`
- 태블릿(≥900px) / 폰(<900px) 너비에서 실제 동작 확인.

## 작업 범위 요약

| 파일 | 변경 |
|---|---|
| `src/browser/BibleReader.tsx` | **신규** — `BibleBrowser` 본문 추출 |
| `src/browser/BibleBrowser.tsx` | `BibleReader` 래핑으로 슬림화, `insertMode` 전달 |
| `src/workspace/BiblePanel.tsx` | **신규** — 성경/인용 탭 셸 |
| `src/workspace/TabletWorkspace.tsx` | 우측 패널을 `BiblePanel`로 교체 |
| `src/workspace/BibleLookupPanel.tsx` | 인용 탭 콘텐츠로 재사용(필요시 슬림화) |
| `app/index.tsx` | 헤더 성경 버튼 + 새-노트 삽입 흐름 |
| `src/domain/types.ts` | `Settings.lastBibleRef` 추가 |
| `src/state/app-store.ts` | `DEFAULT_SETTINGS.lastBibleRef` |
| `src/state/settings-persist.ts` | `lastBibleRef` 관대한 파싱 |
