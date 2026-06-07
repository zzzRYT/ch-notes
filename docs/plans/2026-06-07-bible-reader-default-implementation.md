# 성경 리더 기본 노출 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 태블릿 우측 패널에 성경 리더를 기본으로 띄우고(성경/인용 탭), 모바일 노트 목록 상단 버튼으로 성경을 바로 열 수 있게 하며, 마지막 읽던 책·장을 기억한다.

**Architecture:** 기존 `BibleBrowser`의 탐색 본문을 순수 리더 `BibleReader`로 추출해 모바일 모달·에디터 사이드바·태블릿 "성경" 탭이 공유한다. 태블릿 우측 패널은 `BiblePanel`(성경/인용 탭)로 교체한다. 읽기 위치는 `Settings.lastBibleRef`(예: `"Gen 1"`)에 저장하고, 기존 자동 persist(`app/_layout.tsx` 구독)로 파일에 반영된다. 모바일 "새 노트로 삽입"은 기존 `requestInsertRef`/`consumePendingInsert` 메커니즘을 재사용한다.

**Tech Stack:** Expo SDK 54, React Native, expo-router, zustand, jest (better-sqlite3 어댑터), TypeScript.

**작업 디렉터리:** `.worktrees/bible-reader-default/apps/ch-life` (브랜치 `feat/bible-reader-default`). 모든 명령은 이 디렉터리에서 실행. 경로는 이 디렉터리 기준 상대경로.

**공통 검증 명령:**
- 타입체크: `pnpm typecheck`
- 린트: `pnpm lint`
- 테스트(단일 파일): `pnpm jest <경로> -t "<이름>"` 또는 `pnpm test`
- 전체 CI: `pnpm test:ci`

**커밋 규칙:** conventional commits (`feat:`, `refactor:`, `test:`). 자주 커밋.

---

## Task 1: Settings 모델에 `lastBibleRef` 추가

**Files:**
- Modify: `src/domain/types.ts:60-68` (`Settings` 타입)
- Modify: `src/state/app-store.ts:16-24` (`DEFAULT_SETTINGS`)
- Test: `src/state/__tests__/app-store.test.ts`

**Step 1: 실패하는 테스트 작성**

`src/state/__tests__/app-store.test.ts`의 `beforeEach` settings 객체에 `lastBibleRef: null` 추가하고, 아래 테스트를 파일 끝(마지막 `});` 앞)에 추가:

```ts
  it("기본 lastBibleRef는 null", () => {
    expect(useAppStore.getState().settings.lastBibleRef).toBeNull();
  });

  it("setSettings로 lastBibleRef 갱신", () => {
    useAppStore.getState().setSettings({ lastBibleRef: "Gen 1" });
    expect(useAppStore.getState().settings.lastBibleRef).toBe("Gen 1");
  });
```

**Step 2: 테스트 실패 확인**

Run: `pnpm jest src/state/__tests__/app-store.test.ts`
Expected: FAIL — `lastBibleRef`가 `Settings`에 없어 타입 에러 또는 `undefined`.

**Step 3: 최소 구현**

`src/domain/types.ts` `Settings` 타입 마지막 필드 뒤에 추가:

```ts
  lastOpenedNoteId: string | null;
  lastBibleRef: string | null;
```

`src/state/app-store.ts` `DEFAULT_SETTINGS`에 추가:

```ts
  lastOpenedNoteId: null,
  lastBibleRef: null,
```

**Step 4: 테스트 통과 확인**

Run: `pnpm jest src/state/__tests__/app-store.test.ts`
Expected: PASS. 그리고 `pnpm typecheck` 통과(다른 곳에서 `Settings` 리터럴을 만드는 곳이 있으면 컴파일 에러가 날 수 있음 — Task 2에서 처리되거나 여기서 함께 수정).

> 참고: `Settings` 객체 리터럴을 만드는 위치는 `app-store.ts`(DEFAULT_SETTINGS)와 테스트들뿐. `settings-persist.ts`의 반환도 수정 필요 → Task 2.

**Step 5: 커밋**

```bash
git add src/domain/types.ts src/state/app-store.ts src/state/__tests__/app-store.test.ts
git commit -m "feat: Settings에 lastBibleRef(읽기 위치) 필드 추가"
```

---

## Task 2: settings-validator 분리 + `lastBibleRef` 관대한 파싱

기존 `settings-persist.ts`는 expo-file-system을 import해 jest에서 직접 테스트 불가(테스트 파일 상단 주석 참고). 검증 로직을 순수 모듈 `settings-validator.ts`로 분리해 테스트 가능하게 만들고, `lastBibleRef`는 **없거나 잘못돼도 파일 전체를 reject하지 않고 `null` 폴백**한다.

**Files:**
- Create: `src/state/settings-validator.ts`
- Modify: `src/state/settings-persist.ts` (검증 로직을 validator import로 교체)
- Test: `src/state/__tests__/settings-validator.test.ts` (기존 재구현 테스트를 실제 모듈 import로 교체)

**Step 1: 실패하는 테스트 작성**

`src/state/__tests__/settings-validator.test.ts` 전체를 아래로 교체:

```ts
import { parseSettings } from "../settings-validator";

const valid = {
  fontScale: 1.2,
  themePreference: "system",
  variation: "focus",
  blockStyle: "default",
  fontFamily: "sans",
  accentChoice: "default",
  lastOpenedNoteId: null,
  lastBibleRef: null,
};

describe("parseSettings", () => {
  it("정상 settings 통과", () => {
    expect(parseSettings(valid)).not.toBeNull();
    expect(parseSettings({ ...valid, fontScale: 1.6 })?.fontScale).toBe(1.6);
  });

  it("허용되지 않는 fontScale 거부", () => {
    expect(parseSettings({ ...valid, fontScale: 2.0 })).toBeNull();
    expect(parseSettings({ ...valid, fontScale: "1.2" })).toBeNull();
  });

  it("허용되지 않는 themePreference 거부", () => {
    expect(parseSettings({ ...valid, themePreference: "blue" })).toBeNull();
  });

  it("null/비객체 거부", () => {
    expect(parseSettings(null)).toBeNull();
    expect(parseSettings("string")).toBeNull();
  });

  it("lastBibleRef 없어도 파일 reject 안 함 → null 폴백", () => {
    const { lastBibleRef, ...withoutRef } = valid;
    const parsed = parseSettings(withoutRef);
    expect(parsed).not.toBeNull();
    expect(parsed?.lastBibleRef).toBeNull();
  });

  it("lastBibleRef 잘못된 타입이면 null 폴백(reject 아님)", () => {
    const parsed = parseSettings({ ...valid, lastBibleRef: 123 });
    expect(parsed).not.toBeNull();
    expect(parsed?.lastBibleRef).toBeNull();
  });

  it("lastBibleRef 정상 문자열 보존", () => {
    expect(parseSettings({ ...valid, lastBibleRef: "Gen 1" })?.lastBibleRef).toBe(
      "Gen 1",
    );
  });
});
```

**Step 2: 테스트 실패 확인**

Run: `pnpm jest src/state/__tests__/settings-validator.test.ts`
Expected: FAIL — `../settings-validator` 모듈 없음.

**Step 3: 최소 구현 — validator 추출**

`src/state/settings-validator.ts` 생성. 현재 `settings-persist.ts`의 `ALLOWED_*`, `readVariation`, `readEnum`, `parseSettings`를 그대로 옮기고 `lastBibleRef` 처리 추가:

```ts
import type {
  AccentChoice,
  BlockStyle,
  FontFamily,
  Settings,
  Variation,
} from "@/domain/types";

const ALLOWED_FONT: ReadonlyArray<Settings["fontScale"]> = [1.0, 1.2, 1.4, 1.6];
const ALLOWED_THEME: ReadonlyArray<Settings["themePreference"]> = [
  "system",
  "light",
  "dark",
];
const ALLOWED_VARIATION: ReadonlyArray<Variation> = [
  "minimal",
  "paper",
  "focus",
  "dark",
];
const ALLOWED_BLOCK_STYLE: ReadonlyArray<BlockStyle> = [
  "default",
  "card",
  "quote",
  "collapse",
];
const ALLOWED_FONT_FAMILY: ReadonlyArray<FontFamily> = ["sans", "serif", "mono"];
const ALLOWED_ACCENT: ReadonlyArray<AccentChoice> = [
  "default",
  "#1e6fd9",
  "#b15c2e",
  "#1f8a5b",
  "#f5b35e",
  "#7a5af0",
  "#6b7280",
];

function readVariation(value: unknown, themePref: unknown): Variation {
  if (
    typeof value === "string" &&
    (ALLOWED_VARIATION as ReadonlyArray<string>).includes(value)
  ) {
    return value as Variation;
  }
  if (themePref === "dark") return "dark";
  return "focus";
}

function readEnum<T extends string>(
  value: unknown,
  allowed: ReadonlyArray<T>,
  fallback: T,
): T {
  if (
    typeof value === "string" &&
    (allowed as ReadonlyArray<string>).includes(value)
  ) {
    return value as T;
  }
  return fallback;
}

// 관대한 읽기: 없거나 string이 아니면 null. 절대 파일 전체를 reject하지 않음.
function readNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function parseSettings(x: unknown): Settings | null {
  if (typeof x !== "object" || x === null) return null;
  const s = x as Record<string, unknown>;
  if (
    typeof s.fontScale !== "number" ||
    !(ALLOWED_FONT as ReadonlyArray<number>).includes(s.fontScale)
  )
    return null;
  if (
    typeof s.themePreference !== "string" ||
    !(ALLOWED_THEME as ReadonlyArray<string>).includes(s.themePreference)
  )
    return null;
  return {
    fontScale: s.fontScale as Settings["fontScale"],
    themePreference: s.themePreference as Settings["themePreference"],
    variation: readVariation(s.variation, s.themePreference),
    blockStyle: readEnum(s.blockStyle, ALLOWED_BLOCK_STYLE, "default"),
    fontFamily: readEnum(s.fontFamily, ALLOWED_FONT_FAMILY, "sans"),
    accentChoice: readEnum(s.accentChoice, ALLOWED_ACCENT, "default"),
    lastOpenedNoteId: readNullableString(s.lastOpenedNoteId),
    lastBibleRef: readNullableString(s.lastBibleRef),
  };
}
```

> 주의: 기존 `parseSettings`는 `lastOpenedNoteId`가 `undefined`면 reject했음. 위 구현은 `readNullableString`으로 완화 → 구버전 settings.json도 더 잘 살아남음(의도된 개선). 이 동작 변화는 위 테스트로 고정됨.

**Step 4: settings-persist에서 validator 사용**

`src/state/settings-persist.ts`를 아래로 단순화(파일 I/O만 남김):

```ts
import * as FileSystem from "expo-file-system/legacy";
import type { Settings } from "@/domain/types";
import { parseSettings } from "./settings-validator";

const PATH = `${FileSystem.documentDirectory ?? ""}settings.json`;

export async function loadSettings(): Promise<Settings | null> {
  try {
    if (!FileSystem.documentDirectory) return null;
    const info = await FileSystem.getInfoAsync(PATH);
    if (!info.exists) return null;
    const raw = await FileSystem.readAsStringAsync(PATH);
    return parseSettings(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export async function saveSettings(s: Settings): Promise<void> {
  if (!FileSystem.documentDirectory) return;
  await FileSystem.writeAsStringAsync(PATH, JSON.stringify(s));
}
```

**Step 5: 테스트/타입 확인**

Run: `pnpm jest src/state/__tests__/settings-validator.test.ts && pnpm typecheck`
Expected: PASS.

**Step 6: 커밋**

```bash
git add src/state/settings-validator.ts src/state/settings-persist.ts src/state/__tests__/settings-validator.test.ts
git commit -m "refactor: settings 검증을 순수 모듈로 분리하고 lastBibleRef 관대 파싱"
```

---

## Task 3: `levelFromRef` 헬퍼 (읽기 위치 → 탐색 레벨)

저장된 `lastBibleRef`(예: `"Gen 1"`)를 `BibleReader`의 초기 `BrowserLevel`로 변환하는 순수 함수. `resolveBrowserQuery` 재사용.

**Files:**
- Create: `src/browser/level-from-ref.ts`
- Test: `src/browser/__tests__/level-from-ref.test.ts`

**Step 1: 실패하는 테스트 작성**

`src/browser/__tests__/level-from-ref.test.ts`:

```ts
import { levelFromRef } from "../level-from-ref";

describe("levelFromRef", () => {
  it("null/빈값 → 책 목록", () => {
    expect(levelFromRef(null)).toEqual({ kind: "books" });
    expect(levelFromRef(undefined)).toEqual({ kind: "books" });
    expect(levelFromRef("")).toEqual({ kind: "books" });
  });

  it("'Gen 1' → 해당 장의 절 목록", () => {
    expect(levelFromRef("Gen 1")).toEqual({
      kind: "verses",
      book: "Gen",
      chapter: 1,
    });
  });

  it("한글 책명도 처리 ('시 23')", () => {
    expect(levelFromRef("시 23")).toEqual({
      kind: "verses",
      book: "Psa",
      chapter: 23,
    });
  });

  it("책만 있으면 ('Gen') → 장 그리드", () => {
    expect(levelFromRef("Gen")).toEqual({ kind: "chapters", book: "Gen" });
  });

  it("파싱 실패 → 책 목록", () => {
    expect(levelFromRef("zzzzz 99")).toEqual({ kind: "books" });
  });
});
```

> 검증 필요: `resolveBookCode("Gen")`과 `resolveBookCode("시")`가 각각 `"Gen"`, `"Ps"`를 반환하는지(시편 코드 확인). 다르면 테스트 기대값을 실제 코드값으로 맞춘다. 빠르게 확인: `pnpm jest src/browser/__tests__/browser-search.test.ts`의 기존 기대값 참고 또는 `src/browser/books-meta.ts`에서 시편 code 확인.

**Step 2: 테스트 실패 확인**

Run: `pnpm jest src/browser/__tests__/level-from-ref.test.ts`
Expected: FAIL — 모듈 없음.

**Step 3: 최소 구현**

`src/browser/level-from-ref.ts`:

```ts
import { resolveBrowserQuery } from "./browser-search";
import type { BrowserLevel } from "./BibleReader";

export function levelFromRef(ref: string | null | undefined): BrowserLevel {
  if (!ref) return { kind: "books" };
  const r = resolveBrowserQuery(ref);
  if (!r) return { kind: "books" };
  if (r.kind === "book") return { kind: "chapters", book: r.book };
  return { kind: "verses", book: r.book, chapter: r.chapter };
}
```

> `BrowserLevel` 타입은 Task 4에서 `BibleReader.tsx`로 옮긴다. Task 4를 먼저 끝내고 import 경로를 맞추거나, 임시로 `./BibleBrowser`에서 import 후 Task 4에서 교체. **권장 순서: Task 4를 먼저 하거나, 본 Task에서 `BrowserLevel`을 `level-from-ref.ts`가 아닌 곳에 둘 위치를 Task 4 완료 후 확정.** 실행 시 Task 3과 Task 4를 묶어 진행해도 좋다.

**Step 4: 테스트 통과 확인**

Run: `pnpm jest src/browser/__tests__/level-from-ref.test.ts`
Expected: PASS.

**Step 5: 커밋**

```bash
git add src/browser/level-from-ref.ts src/browser/__tests__/level-from-ref.test.ts
git commit -m "feat: 저장된 읽기 위치를 탐색 레벨로 변환하는 levelFromRef"
```

---

## Task 4: `BibleReader` 추출 + 위치 기억/삽입 라벨 props

`BibleBrowser`의 내부 본문(헤더 제외한 탐색 UI)을 `BibleReader`로 추출하고, `initialRef`/`onPositionChange`/`insertMode`를 받는다. `BibleBrowser`는 `BibleReader`를 감싸는 모달/사이드바 셸로 슬림화.

**Files:**
- Create: `src/browser/BibleReader.tsx`
- Modify: `src/browser/BibleBrowser.tsx`
- Modify: `src/browser/VerseList.tsx` (삽입 버튼 라벨 분기)
- Test: `src/browser/__tests__/level-from-ref.test.ts` (Task 3과 import 정합)

**Step 1: `BrowserLevel` + `BibleReader` 생성**

`src/browser/BibleReader.tsx` 생성. `BibleBrowser.tsx`의 `BrowserLevel` 타입과 `level`/`testament`/`search` 상태, books/chapters/verses 렌더(헤더 제외)를 옮긴다:

```tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, FlatList, TextInput } from "react-native";
import type { BookCode } from "@/parser/book-map";
import { BOOKS_META, findBookMeta, type BookMeta, type Testament } from "./books-meta";
import { ChapterGrid } from "./ChapterGrid";
import { VerseList, type InsertMode } from "./VerseList";
import { resolveBrowserQuery } from "./browser-search";
import { levelFromRef } from "./level-from-ref";

export type BrowserLevel =
  | { kind: "books" }
  | { kind: "chapters"; book: BookCode }
  | { kind: "verses"; book: BookCode; chapter: number };

type Props = {
  onInsertVerse: (ref: string) => void;
  insertMode?: InsertMode;
  initialRef?: string | null;
  onPositionChange?: (book: BookCode, chapter: number) => void;
  onTitleChange?: (title: string, canGoBack: boolean) => void;
};

export function BibleReader({
  onInsertVerse,
  insertMode = "currentNote",
  initialRef,
  onPositionChange,
  onTitleChange,
}: Props) {
  const [level, setLevel] = useState<BrowserLevel>(() => levelFromRef(initialRef));
  const [testament, setTestament] = useState<Testament>("OT");
  const [search, setSearch] = useState("");
  const seeded = useRef(initialRef != null);

  // 설정이 마운트 후 늦게 로드되면 1회만 위치 시드(이후 사용자 탐색을 덮지 않음)
  useEffect(() => {
    if (seeded.current) return;
    if (initialRef == null) return;
    seeded.current = true;
    setLevel(levelFromRef(initialRef));
  }, [initialRef]);

  // 절 화면 진입/장 변경 시 위치 저장
  useEffect(() => {
    if (level.kind === "verses") onPositionChange?.(level.book, level.chapter);
  }, [level, onPositionChange]);

  const onSubmitSearch = () => {
    const r = resolveBrowserQuery(search);
    if (!r) return;
    if (r.kind === "book") setLevel({ kind: "chapters", book: r.book });
    else setLevel({ kind: "verses", book: r.book, chapter: r.chapter });
    setSearch("");
  };

  const filteredBooks = useMemo(
    () => BOOKS_META.filter((m) => m.testament === testament),
    [testament],
  );

  const onBack = () => {
    if (level.kind === "chapters") setLevel({ kind: "books" });
    else if (level.kind === "verses") setLevel({ kind: "chapters", book: level.book });
  };

  // 셸(BibleBrowser/BiblePanel)이 헤더 타이틀/뒤로가기를 그릴 수 있도록 통지
  const headerTitle =
    level.kind === "books"
      ? "성경"
      : level.kind === "chapters"
        ? (findBookMeta(level.book)?.nameKo ?? level.book)
        : `${findBookMeta(level.book)?.nameKo ?? level.book} ${level.chapter}장`;
  useEffect(() => {
    onTitleChange?.(headerTitle, level.kind !== "books");
  }, [headerTitle, level.kind, onTitleChange]);

  // 셸에서 뒤로가기를 호출할 수 있도록 노출이 필요하면 ref/콜백로 확장 가능.
  // 현 설계: BibleReader 내부에는 뒤로가기 버튼을 두지 않고, books 화면에선 검색+탭,
  // 하위 화면에선 ChapterGrid/VerseList가 자체 네비를 제공(VerseList는 이전/다음 장,
  // chapters→books 복귀는 아래 inlineBack로 처리).

  return (
    <View style={styles.body}>
      {level.kind !== "books" && (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          hitSlop={12}
          style={styles.inlineBack}
        >
          <Text style={styles.inlineBackText}>← 뒤로</Text>
        </Pressable>
      )}

      {level.kind === "books" && (
        <>
          <View style={styles.searchWrap}>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={onSubmitSearch}
              placeholder="책·장·절 (예: 골 3:20)"
              accessibilityLabel="성경 검색"
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="go"
            />
          </View>
          <View style={styles.segment}>
            <SegmentBtn label="구약" active={testament === "OT"} onPress={() => setTestament("OT")} />
            <SegmentBtn label="신약" active={testament === "NT"} onPress={() => setTestament("NT")} />
          </View>
          <FlatList
            data={filteredBooks}
            keyExtractor={(m) => m.code}
            renderItem={({ item }) => (
              <BookRow meta={item} onPress={() => setLevel({ kind: "chapters", book: item.code })} />
            )}
          />
        </>
      )}

      {level.kind === "chapters" && (
        <ChapterGrid
          book={level.book}
          onSelect={(chapter) => setLevel({ kind: "verses", book: level.book, chapter })}
        />
      )}

      {level.kind === "verses" && (
        <VerseList
          book={level.book}
          chapter={level.chapter}
          insertMode={insertMode}
          onInsert={(ref) => onInsertVerse(ref)}
          onChangeChapter={(chapter) => setLevel({ kind: "verses", book: level.book, chapter })}
        />
      )}
    </View>
  );
}
```

`SegmentBtn`, `BookRow`, 그리고 관련 `styles`(body, inlineBack, searchWrap, searchInput, segment, segmentBtn, segmentBtnActive, segmentText, segmentTextActive, bookRow, bookName, bookCode)를 `BibleBrowser.tsx`에서 이 파일로 이동/복제. `inlineBack`/`inlineBackText` 스타일은 신규:

```ts
  inlineBack: { paddingHorizontal: 16, paddingVertical: 12, minHeight: 48, justifyContent: "center" },
  inlineBackText: { fontSize: 15, color: "#555" },
```

> 설계 단순화: 뒤로가기를 셸 헤더가 아니라 `BibleReader` 내부 `inlineBack`로 둔다. 그래야 `BiblePanel`(탭 헤더만 있음)과 `BibleBrowser`(닫기 헤더) 양쪽에서 동일하게 동작하고 셸이 reader의 내부 level을 알 필요가 없다. `onTitleChange`는 선택적(셸이 제목을 표시하고 싶을 때만).

**Step 2: `VerseList`에 `insertMode` 추가**

`src/browser/VerseList.tsx` `Props`에 추가하고 버튼 라벨 분기:

```ts
export type InsertMode = "currentNote" | "newNote";

type Props = {
  book: BookCode;
  chapter: number;
  insertMode?: InsertMode;
  onInsert: (ref: string) => void;
  onChangeChapter: (chapter: number) => void;
};
```

함수 시그니처: `export function VerseList({ book, chapter, insertMode = "currentNote", onInsert, onChangeChapter }: Props)`.

삽입 버튼(현재 `＋` 아이콘)의 `accessibilityLabel`을 모드에 맞게:

```tsx
                accessibilityLabel={`${nameKo} ${chapter}:${item.num} ${
                  insertMode === "newNote" ? "새 노트에 담기" : "노트에 인용"
                }`}
```

(아이콘 `＋`는 그대로 둔다. 라벨만 분기 — 좁은 절 행에 텍스트 버튼은 부적합.)

**Step 3: `BibleBrowser`를 셸로 슬림화**

`src/browser/BibleBrowser.tsx`를 `BibleReader`를 감싸는 형태로 교체. `BrowserLevel` export는 `BibleReader.tsx`로 이동했으므로 `BibleBrowser`에서 재export하거나 사용처를 수정. `useBiblePosition` 훅(Task 5)으로 위치 연동:

```tsx
import React from "react";
import { View, Text, Modal, Pressable, StyleSheet } from "react-native";
import { useResponsiveLayout } from "../workspace/useResponsiveLayout"; // 실제 경로 확인: src/browser/useResponsiveLayout.ts
import { BibleReader } from "./BibleReader";
import { useBiblePosition } from "./useBiblePosition";
import type { InsertMode } from "./VerseList";

type Props = {
  visible: boolean;
  onClose: () => void;
  onInsertVerse: (ref: string) => void;
  insertMode?: InsertMode;
};

export function BibleBrowser({ visible, onClose, onInsertVerse, insertMode }: Props) {
  const { mode } = useResponsiveLayout();
  const { initialRef, onPositionChange } = useBiblePosition();

  const body = (
    <View style={styles.body}>
      <View style={styles.header}>
        <View style={styles.headerBtn} />
        <Text style={styles.headerTitle} numberOfLines={1}>성경</Text>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="브라우저 닫기" hitSlop={12} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>✕</Text>
        </Pressable>
      </View>
      <BibleReader
        onInsertVerse={onInsertVerse}
        insertMode={insertMode}
        initialRef={initialRef}
        onPositionChange={onPositionChange}
      />
    </View>
  );

  if (mode === "sidebar") {
    if (!visible) return null;
    return <View style={styles.sidebar}>{body}</View>;
  }
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.sheetBackdrop}>
        <Pressable style={styles.backdropTap} onPress={onClose} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
        <View style={styles.sheet}>{body}</View>
      </View>
    </Modal>
  );
}
```

`useResponsiveLayout` 실제 경로는 `src/browser/useResponsiveLayout.ts` → import `"./useResponsiveLayout"`. styles는 기존 `BibleBrowser`의 header/headerBtn/headerBtnText/headerTitle/sidebar/sheetBackdrop/backdropTap/sheet/body만 남긴다(books/segment/bookRow 등은 BibleReader로 이동).

`BrowserLevel`을 다른 파일이 import하는지 확인: `grep -rn "BrowserLevel" src app`. 사용처를 `./BibleReader` import로 교체.

**Step 4: 타입/테스트 확인**

Run: `pnpm typecheck && pnpm jest src/browser`
Expected: PASS. 기존 `browser-search`, `books-meta` 테스트 회귀 없음. `level-from-ref` 테스트 PASS.

> Task 5(useBiblePosition)가 아직 없으면 Step 3에서 import 에러. **Task 5를 먼저 만들고 본 Step을 마무리**하거나, 두 Task를 함께 진행.

**Step 5: 커밋**

```bash
git add src/browser/BibleReader.tsx src/browser/BibleBrowser.tsx src/browser/VerseList.tsx
git commit -m "refactor: BibleReader 추출 + 위치 기억/삽입 모드 props"
```

---

## Task 5: `useBiblePosition` 훅 (위치 읽기/쓰기 DRY)

여러 진입점이 동일한 `lastBibleRef`를 공유하도록 store 연동을 한 곳에 모은다.

**Files:**
- Create: `src/browser/useBiblePosition.ts`
- Test: `src/state/__tests__/app-store.test.ts` (라운드트립은 Task 1에서 커버; 훅 자체는 store 위임이라 별도 단위테스트 생략 — YAGNI. 필요 시 ref 포맷만 순수 함수로 뺄 수 있음)

**Step 1: 구현**

`src/browser/useBiblePosition.ts`:

```ts
import { useCallback } from "react";
import type { BookCode } from "@/parser/book-map";
import { useAppStore } from "@/state/app-store";

export function useBiblePosition(): {
  initialRef: string | null;
  onPositionChange: (book: BookCode, chapter: number) => void;
} {
  const initialRef = useAppStore((s) => s.settings.lastBibleRef);
  const setSettings = useAppStore((s) => s.setSettings);
  const onPositionChange = useCallback(
    (book: BookCode, chapter: number) => {
      setSettings({ lastBibleRef: `${book} ${chapter}` });
    },
    [setSettings],
  );
  return { initialRef, onPositionChange };
}
```

> `${book} ${chapter}`는 `levelFromRef`가 `resolveBrowserQuery`로 역파싱 가능한 형식. `book`은 BookCode(예: `"Gen"`). Task 3 테스트가 이 왕복을 고정.

**Step 2: 타입 확인**

Run: `pnpm typecheck`
Expected: PASS.

**Step 3: 커밋**

```bash
git add src/browser/useBiblePosition.ts
git commit -m "feat: useBiblePosition 훅으로 읽기 위치 store 연동 일원화"
```

---

## Task 6: `BiblePanel` (태블릿 우측 패널 — 성경/인용 탭)

성경(기본)·인용 탭을 가진 우측 패널 셸. 성경 탭=`BibleReader`, 인용 탭=기존 `BibleLookupPanel`.

**Files:**
- Create: `src/workspace/BiblePanel.tsx`
- (참고) `src/workspace/BibleLookupPanel.tsx`는 그대로 인용 탭 콘텐츠로 사용

**Step 1: 구현**

`src/workspace/BiblePanel.tsx`:

```tsx
import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { BibleReader } from "@/browser/BibleReader";
import { useBiblePosition } from "@/browser/useBiblePosition";
import { BibleLookupPanel } from "./BibleLookupPanel";

type Tab = "reader" | "cited";

type Props = {
  citedRefs: ReadonlyArray<string>;
  onInsert: (ref: string) => void;
  onCollapse: () => void;
};

export function BiblePanel({ citedRefs, onInsert, onCollapse }: Props) {
  const { colors } = useTheme();
  const [tab, setTab] = useState<Tab>("reader");
  const { initialRef, onPositionChange } = useBiblePosition();

  return (
    <View style={[styles.root, { backgroundColor: colors.paper }]}>
      <View style={[styles.tabs, { borderBottomColor: colors.rule }]}>
        <TabBtn label="성경" active={tab === "reader"} onPress={() => setTab("reader")} colors={colors} />
        <TabBtn
          label="인용"
          badge={citedRefs.length}
          active={tab === "cited"}
          onPress={() => setTab("cited")}
          colors={colors}
        />
        <Pressable
          onPress={onCollapse}
          accessibilityRole="button"
          accessibilityLabel="성경 패널 접기"
          hitSlop={10}
          style={styles.collapseBtn}
        >
          <Text style={[styles.collapseText, { color: colors.ink2 }]}>›</Text>
        </Pressable>
      </View>

      {tab === "reader" ? (
        <BibleReader
          onInsertVerse={onInsert}
          insertMode="currentNote"
          initialRef={initialRef}
          onPositionChange={onPositionChange}
        />
      ) : (
        <BibleLookupPanel citedRefs={citedRefs} onInsert={onInsert} onCollapse={onCollapse} hideHeader />
      )}
    </View>
  );
}
```

`TabBtn` 보조 컴포넌트(인라인) + styles(root, tabs, collapseBtn, collapseText, tabBtn, tabBtnActive, tabLabel, tabLabelActive, badge, badgeText). 접근성: `accessibilityRole="tab"`, `accessibilityState={{ selected: active }}`, 터치 타깃 ≥44px.

**Step 2: `BibleLookupPanel`에 `hideHeader` 옵션 추가**

`BiblePanel`이 이미 탭 헤더/접기 버튼을 가지므로, 인용 탭에서 `BibleLookupPanel` 자체 헤더("성경 보기" + 접기)는 중복. `src/workspace/BibleLookupPanel.tsx` `Props`에 `hideHeader?: boolean` 추가하고, `head` View를 `{!hideHeader && (...)}`로 감싼다. 기본 동작(단독 사용)은 변화 없음.

**Step 3: 타입 확인**

Run: `pnpm typecheck`
Expected: PASS.

**Step 4: 커밋**

```bash
git add src/workspace/BiblePanel.tsx src/workspace/BibleLookupPanel.tsx
git commit -m "feat: BiblePanel(성경/인용 탭) 추가"
```

---

## Task 7: TabletWorkspace 우측 패널 교체

**Files:**
- Modify: `src/workspace/TabletWorkspace.tsx` (import + 우측 패널 렌더 ~line 327-358)

**Step 1: import 교체**

상단 import에서 `BibleLookupPanel` → `BiblePanel`:

```ts
import { BiblePanel } from "./BiblePanel";
```

(기존 `import { BibleLookupPanel } ...` 제거. 단, `BibleLookupPanel`을 다른 데서 직접 쓰지 않으면 제거.)

**Step 2: 렌더 교체**

우측 패널의 `<BibleLookupPanel .../>`를 교체:

```tsx
          <BiblePanel
            citedRefs={citedRefs}
            onInsert={insertRef}
            onCollapse={() => setRightOpen(false)}
          />
```

`insertRef`(`TabletWorkspace.tsx:148`)는 그대로 활성 노트에 삽입. 접기/펼치기(`rightOpen`, `PanelRail`) 로직 변경 없음.

**Step 3: 타입/테스트**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

**Step 4: 커밋**

```bash
git add src/workspace/TabletWorkspace.tsx
git commit -m "feat: 태블릿 우측 패널을 BiblePanel로 교체(기본 성경 리더)"
```

---

## Task 8: 모바일 노트 목록 헤더 성경 버튼 + 새 노트 삽입

**Files:**
- Modify: `app/index.tsx` (import, `PhoneNotesList` 상태/헤더/모달, 새-노트 삽입 콜백)

**Step 1: import 추가**

```ts
import { BookOpen, Download, Search, Settings } from "lucide-react-native";
import { BibleBrowser } from "@/browser/BibleBrowser";
import { useAppStore } from "@/state/app-store";
```

(`BookOpen` 아이콘 사용. lucide-react-native에 존재.)

**Step 2: 상태 + 삽입 콜백 추가**

`PhoneNotesList` 컴포넌트 본문(`createNote` 근처)에 추가:

```ts
  const [bibleOpen, setBibleOpen] = useState(false);

  const insertToNewNote = useCallback(
    async (ref: string) => {
      useAppStore.getState().requestInsertRef(ref);
      const repo = await openNoteRepo();
      const id = await repo.create({
        title: null,
        body: [{ type: "paragraph", text: "" }],
        citedRefs: [],
      });
      setBibleOpen(false);
      router.push(`/note/${id}`);
    },
    [router],
  );
```

> 에디터(`app/note/[id].tsx:91-96`)가 마운트 시 `consumePendingInsert()`로 자동 삽입하므로 추가 작업 불필요. `requestInsertRef`를 `repo.create` **전에** 호출해 경합을 피한다.

**Step 3: 헤더 버튼 추가**

`AppHeader`의 `right`에서 `Search` 앞에 성경 버튼 추가:

```tsx
        right={
          <>
            <HeaderIconButton
              icon={BookOpen}
              label="성경 읽기"
              onPress={() => setBibleOpen(true)}
            />
            <HeaderIconButton icon={Search} label="노트 검색" onPress={() => searchRef.current?.focus()} />
            <HeaderIconButton icon={Download} label="마크다운 노트 가져오기" onPress={handleImport} />
            <HeaderIconButton icon={Settings} label="설정" onPress={() => router.push("/settings")} />
          </>
        }
```

**Step 4: 모달 렌더**

`PhoneNotesList`의 최상위 `<View>` 안, FAB 뒤(닫는 `</View>` 직전)에 추가:

```tsx
      <BibleBrowser
        visible={bibleOpen}
        onClose={() => setBibleOpen(false)}
        onInsertVerse={insertToNewNote}
        insertMode="newNote"
      />
```

**Step 5: 타입/린트/테스트**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

**Step 6: 커밋**

```bash
git add app/index.tsx
git commit -m "feat: 노트 목록 헤더에 성경 버튼 추가(읽기→새 노트 삽입)"
```

---

## Task 9: 에디터 BibleBrowser 삽입 모드 명시(현행 유지 확인)

에디터 화면은 활성 노트에 삽입하므로 기본값(`currentNote`)으로 충분. 위치 기억은 `BibleBrowser` 내부 `useBiblePosition`으로 자동 공유됨. 변경 거의 없음 — 동작만 확인.

**Files:**
- Verify: `app/note/[id].tsx:203-207` (`BibleBrowser` 사용처)

**Step 1: 확인**

`app/note/[id].tsx`의 `<BibleBrowser ... onInsertVerse={insertVerseFromBrowser} />`가 `insertMode` 미지정(기본 currentNote)으로 정상인지 확인. 변경 불필요. (단, 에디터에서 성경을 여는 버튼이 현재 없다면 별도 이슈 — 본 작업 범위 밖. Q2에서 "목록 상단"만 합의.)

**Step 2: 커밋**

변경 없으면 커밋 생략.

---

## Task 10: 최종 검증 (타입·린트·테스트·수동 확인)

**Step 1: 전체 자동 검증**

```bash
pnpm typecheck
pnpm lint
pnpm test:ci
```

Expected: 모두 통과. 기존 375 테스트 + 신규(app-store, settings-validator, level-from-ref) 회귀 없음.

**Step 2: 수동 확인 — 태블릿(≥900px)**

- 앱을 태블릿 폭으로 실행(`pnpm start` 후 웹 또는 넓은 창). 우측 패널 기본 탭이 **성경**인지.
- 검색창에 `골 3:20` 입력→go → 해당 장 절 목록. 절 `＋` → 활성 노트에 인용 삽입.
- "인용" 탭 전환 → 현재 노트 인용 목록 + 카운트 배지.
- 책→장→절 진입 후 다른 화면 갔다 와도(앱 재시작) 마지막 장으로 복귀(위치 기억).
- 340px 폭에서 `ChapterGrid` 4열/`VerseList` 레이아웃 깨짐 없는지. 깨지면 `BiblePanel`/`ChapterGrid`에서 폭 대응(예: numColumns 조정) — 별도 후속.

**Step 3: 수동 확인 — 폰(<900px)**

- 노트 목록 헤더의 **성경(BookOpen)** 버튼 탭 → 바텀시트 모달.
- 검색/탐색으로 절 찾기 → `＋`(라벨 "새 노트에 담기") → 새 노트 생성 + 에디터로 이동 + 해당 구절 자동 삽입.
- 모달 다시 열면 마지막 위치로 복귀.

**Step 4: 마무리**

모든 확인 통과 시 superpowers:finishing-a-development-branch로 통합 옵션(머지/PR) 진행.

---

## 위험 요소 / 메모

- **340px 폭 레이아웃**: `BibleBrowser` sidebar는 33% 폭 기준. 고정 340px에서 `ChapterGrid`(4열) 점검 필수(Task 10 Step 2).
- **settings.json 마이그레이션**: Task 2에서 `lastOpenedNoteId` 파싱을 reject→tolerant로 완화. 구버전 파일 호환성은 개선되나, 동작 변화이므로 테스트로 고정.
- **위치 시드 타이밍**: 설정이 reader 마운트 후 로드되면 `seeded` ref가 1회 시드. 사용자가 이미 탐색했으면 덮지 않음.
- **빈 노트 방치**: 목록에서 새 노트 생성 후 삽입 없이 뒤로가면 빈 노트 잔존(기존 동작과 동일, 정리 안 함).
- **스키마 영향 없음**: `lastBibleRef`는 settings.json에만 저장. SQLite 스키마 변경 없음 → `db-schema-change` 스킬 불필요.
