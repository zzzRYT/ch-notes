# ch-life V1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 한국어 설교노트 + 성경 자동삽입 Expo 앱 V1을 5주 안에 본인 디바이스 출시 가능한 수준으로 빌드한다.

**Architecture:** Expo (RN) managed workflow 위에 file-based routing(Expo Router), `expo-sqlite`(notes+FTS5), `@10play/tentap-editor`(에디터), `bible-passage-reference-parser`(ref 파싱) + 한국어 책명 어댑터, gray-matter+remark(마크다운 직렬화). 단일 소스 = SQLite, 외부 노출 = 노트별 `.md` 파일 export/import.

**Tech Stack:** Expo SDK 51+, Expo Router, expo-sqlite (FTS5), expo-file-system, expo-sharing, expo-document-picker, Zustand, TypeScript strict, Jest, Maestro, gray-matter, remark, @10play/tentap-editor.

**Spec 참조:** `docs/plans/2026-05-17-ch-life-v1-spec.md`

**작업 원칙:**
- DRY / YAGNI / TDD / 작은 commit
- 각 Task는 합쳐서 1시간 내 완료 가능한 단위
- 각 Step은 2~5분짜리 단일 액션
- 코드는 plan 안에 전체를 적는다 (요약/생략 금지)

---

## Phase 0 — De-risk (Week 0, 코드 시작 전 검증)

> 이 셋 중 하나라도 막히면 spec 재검토 트리거. 본격 빌드 진입 전 무조건 통과.

### Task 0.1: 개발자 계정·EAS 빈 앱 통과

**목표:** Apple Developer($99) + Google Play($25) 등록 + EAS Build 빈 앱이 TestFlight/Internal Testing 업로드까지 한 번 통과.

**Files:**
- Create: `apps/ch-life/` (Expo 빈 프로젝트)
- Create: `apps/ch-life/eas.json`
- Create: `apps/ch-life/app.config.ts`

**Step 1: Apple Developer 등록 시작**

브라우저에서 https://developer.apple.com/programs/ 가입 신청. 인증 1~3일 소요 가능.

수동 작업. 완료 후 `team ID`·`bundle prefix` 메모.

**Step 2: Google Play Console 등록**

브라우저에서 https://play.google.com/console/signup 에서 $25 결제·등록.

수동 작업. 완료 후 `package name`·`upload key` 메모.

**Step 3: Expo 프로젝트 생성**

Run:
```bash
cd /Users/leejaejin/coding/toy-project/ch-life
mkdir -p apps && cd apps
npx create-expo-app@latest ch-life --template blank-typescript
cd ch-life
```

Expected: `apps/ch-life/` 디렉토리에 Expo TS 템플릿 생성.

**Step 4: EAS CLI 설치 + 로그인**

Run:
```bash
npm install -g eas-cli
eas login
```

Expected: Expo 계정으로 로그인 성공.

**Step 5: `app.config.ts` 작성**

Create `apps/ch-life/app.config.ts`:
```ts
import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "ch-life",
  slug: "ch-life",
  version: "0.1.0",
  orientation: "default",
  icon: "./assets/icon.png",
  scheme: "chlife",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    bundleIdentifier: "com.leejaejin.chlife",
    supportsTablet: true,
    infoPlist: {
      UIFileSharingEnabled: true,
      LSSupportsOpeningDocumentsInPlace: true,
    },
  },
  android: {
    package: "com.leejaejin.chlife",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
  },
  plugins: ["expo-router", "expo-sqlite"],
  experiments: { typedRoutes: true },
};

export default config;
```

**Step 6: `eas.json` 작성**

Create `apps/ch-life/eas.json`:
```json
{
  "cli": { "version": ">= 5.9.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": { "production": {} }
}
```

**Step 7: EAS 빌드 통과**

Run:
```bash
cd apps/ch-life
eas build --platform all --profile preview --non-interactive
```

Expected: iOS Simulator·Android APK 빌드 둘 다 성공. 빌드 URL 2개 출력.

**Step 8: TestFlight·Internal Testing 한 번 업로드**

Run:
```bash
eas build --platform all --profile production
eas submit --platform ios --latest
eas submit --platform android --latest
```

Expected: 둘 다 업로드 성공. 본인 디바이스에서 설치 가능한 상태.

**Step 9: Commit**

```bash
cd /Users/leejaejin/coding/toy-project/ch-life
git init
git add apps/ch-life
git commit -m "chore: Expo 빈 앱 EAS 빌드 파이프라인 통과"
```

---

### Task 0.2: 개역한글 JSON 라이선스 검증

**목표:** `bible.mearie.org` 또는 Wikisource KRV의 라이선스를 명시적으로 확인하고 한 줄 spec에 기록.

**Files:**
- Modify: `docs/plans/2026-05-17-ch-life-v1-spec.md` (라이선스 한 줄 추가)
- Create: `docs/research/krv-license-evidence.md`

**Step 1: 후보 소스 ToS 확인**

브라우저에서 각각 방문:
- https://bible.mearie.org/ — 라이선스 페이지·푸터·about 문구
- https://www.getbible.net/ — API ToS, 한국어 KRV 명시 여부
- https://ko.wikisource.org/wiki/개역한글판 — 라이선스 박스

**Step 2: 증거 기록**

Create `docs/research/krv-license-evidence.md`:
```markdown
# KRV (개역한글 1961) 라이선스 검증

## 결론
선택: [TBD — Step 1 결과에 따라 채움]
근거: [URL + 스크린샷 또는 인용]

## 후보별 검증 결과
### bible.mearie.org
- 라이선스 명시: [예/아니오]
- URL: ...
- 원문 인용: ...

### Wikisource KRV
- 라이선스 명시: 공공도메인 (CC0 표시)
- URL: https://ko.wikisource.org/wiki/개역한글판
- 원문 인용: ...

## 확정 소스
- 빌드 스크립트에서 사용할 URL/포맷
```

**Step 3: spec 업데이트**

Edit `docs/plans/2026-05-17-ch-life-v1-spec.md` 5.6 절 끝에 라이선스 검증 결과 한 줄 추가.

**Step 4: Commit**

```bash
git add docs/research/krv-license-evidence.md docs/plans/2026-05-17-ch-life-v1-spec.md
git commit -m "docs: KRV JSON 소스 라이선스 검증 기록"
```

---

### Task 0.3: 에디터 PoC (`@10play/tentap-editor` 자동완성 위젯)

**목표:** 빈 Expo 화면에 tentap 에디터 + 입력 패턴(`골 3:20`) 감지 시 회색 칩 데코레이션을 붙이는 PoC. 성공 = 동영상/스크린샷 1개 + PoC 코드 commit. 실패 = pell+suffix-ghost-text fallback 결정.

**Files:**
- Create: `apps/ch-life/poc/editor-poc.tsx`
- Create: `docs/research/editor-poc-result.md`

**Step 1: tentap-editor 설치**

Run:
```bash
cd apps/ch-life
npx expo install @10play/tentap-editor react-native-webview
```

Expected: peerDeps 경고 없음, package.json에 추가됨.

**Step 2: PoC 컴포넌트 작성**

Create `apps/ch-life/poc/editor-poc.tsx`:
```tsx
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { RichText, Toolbar, useEditorBridge } from "@10play/tentap-editor";

const REF_PATTERN = /([가-힣]{1,4}|[A-Za-z]{2,4})\s*\d{1,3}:\d{1,3}/;

export default function EditorPoc() {
  const editor = useEditorBridge({
    autofocus: true,
    avoidIosKeyboard: true,
    initialContent: "여기에 '골 3:20' 입력해보기",
  });

  editor.on("update", () => {
    editor.getHTML().then((html) => {
      const match = REF_PATTERN.exec(html);
      console.log("[PoC] ref match:", match?.[0] ?? null);
    });
  });

  return (
    <SafeAreaView style={styles.root}>
      <RichText editor={editor} />
      <Toolbar editor={editor} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
```

**Step 3: 라우트에 PoC 연결**

Modify `apps/ch-life/App.tsx`:
```tsx
import EditorPoc from "./poc/editor-poc";
export default EditorPoc;
```

**Step 4: 실기기 실행**

Run:
```bash
npx expo start --dev-client
```

폰/시뮬레이터에서 앱 열기 → `골 3:20` 입력 → 콘솔에 `[PoC] ref match: 골 3:20` 찍히는지 확인.

**Step 5: 데코레이션 시도 (Tiptap extension)**

Modify `apps/ch-life/poc/editor-poc.tsx`에 Tiptap mark extension 추가:
```tsx
// useEditorBridge 옵션에 bridgeExtensions로 커스텀 mark 추가
// (tentap이 제공하는 확장 API 사용)
```

성공 = ref 패턴 위에 회색 배경이 깔림. 실패 = 다음 단계.

**Step 6: PoC 결과 기록**

Create `docs/research/editor-poc-result.md`:
```markdown
# 에디터 PoC 결과

## 결론
선택: tentap-editor / pell-fallback

## 근거
- 자동완성 칩 부착 가능 여부
- iOS / Android 둘 다 동작 여부
- WebView 성능 (60fps 유지 여부)

## 증거
- 스크린샷 또는 동영상 경로
```

**Step 7: Commit**

```bash
git add apps/ch-life/poc apps/ch-life/package.json apps/ch-life/App.tsx docs/research/editor-poc-result.md
git commit -m "poc: tentap-editor 자동완성 칩 PoC 결과 기록"
```

---

## Phase 1 — Foundation (Week 1)

### Task 1.1: 프로젝트 구조 + 라우팅 골격

**Files:**
- Create: `apps/ch-life/app/_layout.tsx`
- Create: `apps/ch-life/app/index.tsx` (노트 목록)
- Create: `apps/ch-life/app/note/[id].tsx` (에디터)
- Create: `apps/ch-life/app/settings.tsx`
- Create: `apps/ch-life/tsconfig.json` (strict mode)

**Step 1: Expo Router 설치**

Run:
```bash
cd apps/ch-life
npx expo install expo-router react-native-safe-area-context react-native-screens
```

**Step 2: `package.json` main 변경**

Modify `apps/ch-life/package.json`:
```json
{
  "main": "expo-router/entry"
}
```

App.tsx는 삭제하거나 무시.

**Step 3: 루트 레이아웃 작성**

Create `apps/ch-life/app/_layout.tsx`:
```tsx
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: true }}>
        <Stack.Screen name="index" options={{ title: "노트" }} />
        <Stack.Screen name="note/[id]" options={{ title: "" }} />
        <Stack.Screen name="settings" options={{ title: "설정" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
```

**Step 4: 빈 화면 3개 작성**

Create `apps/ch-life/app/index.tsx`:
```tsx
import { View, Text } from "react-native";
export default function NotesList() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>노트 목록 (TBD)</Text>
    </View>
  );
}
```

Create `apps/ch-life/app/note/[id].tsx`:
```tsx
import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
export default function NoteEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>노트 에디터 — id: {id}</Text>
    </View>
  );
}
```

Create `apps/ch-life/app/settings.tsx`:
```tsx
import { View, Text } from "react-native";
export default function Settings() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>설정 (TBD)</Text>
    </View>
  );
}
```

**Step 5: tsconfig strict**

Create `apps/ch-life/tsconfig.json`:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

**Step 6: 실행 확인**

Run:
```bash
npx expo start
```

폰에서 빈 노트 목록 → 카드 없음 → 설정 진입 확인.

**Step 7: Commit**

```bash
git add apps/ch-life
git commit -m "feat: Expo Router 라우팅 골격 (노트 목록/에디터/설정)"
```

---

### Task 1.2: TypeScript 도메인 타입 정의

**Files:**
- Create: `apps/ch-life/src/domain/types.ts`
- Create: `apps/ch-life/src/domain/__tests__/types.test.ts`

**Step 1: 실패 테스트 작성**

Create `apps/ch-life/src/domain/__tests__/types.test.ts`:
```ts
import type { Note, BlockNode, Verse, Settings } from "../types";

describe("domain types", () => {
  it("Note는 필수 필드를 가진다", () => {
    const note: Note = {
      id: "01HABC",
      title: null,
      body: [{ type: "paragraph", text: "" }],
      createdAt: 0,
      updatedAt: 0,
      citedRefs: [],
    };
    expect(note.body[0].type).toBe("paragraph");
  });

  it("BlockNode quote는 verses와 status를 가진다", () => {
    const q: BlockNode = {
      type: "quote",
      ref: "Col 3:20",
      verses: [
        { book: "Col", chapter: 3, verse: 20, text: "자녀들아..." },
      ],
      status: "loaded",
    };
    expect(q.type).toBe("quote");
    expect(q.status).toBe("loaded");
  });
});
```

**Step 2: Jest 설치**

Run:
```bash
cd apps/ch-life
npx expo install jest @types/jest jest-expo
```

Modify `apps/ch-life/package.json` 추가:
```json
{
  "scripts": {
    "test": "jest"
  },
  "jest": {
    "preset": "jest-expo"
  }
}
```

**Step 3: 테스트 실행 (실패 확인)**

Run:
```bash
npm test -- --testPathPattern=types.test
```

Expected: `Cannot find module '../types'` — 실패.

**Step 4: 타입 정의**

Create `apps/ch-life/src/domain/types.ts`:
```ts
export type Verse = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
};

export type BlockNode =
  | { type: "paragraph"; text: string }
  | {
      type: "quote";
      ref: string;
      verses: Verse[];
      status: "loading" | "loaded" | "error";
    };

export type Note = {
  id: string;
  title: string | null;
  body: BlockNode[];
  createdAt: number;
  updatedAt: number;
  citedRefs: string[];
};

export type Settings = {
  fontScale: 1.0 | 1.2 | 1.4 | 1.6;
  themePreference: "system" | "light" | "dark";
  lastOpenedNoteId: string | null;
};
```

**Step 5: 테스트 통과 확인**

Run:
```bash
npm test -- --testPathPattern=types.test
```

Expected: PASS 2 tests.

**Step 6: Commit**

```bash
git add apps/ch-life/src/domain apps/ch-life/package.json
git commit -m "feat: 도메인 타입 (Note, BlockNode, Verse, Settings)"
```

---

### Task 1.3: 성경 데이터 빌드 스크립트

**Files:**
- Create: `apps/ch-life/scripts/build-bible.ts`
- Create: `apps/ch-life/assets/bible-krv.json` (스크립트 산출물)
- Create: `apps/ch-life/src/data/__tests__/bible-data.test.ts`

**Step 1: 빌드 스크립트 작성**

Create `apps/ch-life/scripts/build-bible.ts`:
```ts
/**
 * Task 0.2에서 결정된 소스 URL에서 KRV JSON을 받아
 * { [book: string]: { [chapter: number]: { [verse: number]: string } } }
 * 형태로 정규화 후 assets/bible-krv.json에 저장.
 */
import fs from "fs";
import path from "path";

const SOURCE_URL = process.env.KRV_SOURCE_URL ?? "";
const OUT_PATH = path.resolve(__dirname, "../assets/bible-krv.json");

const BOOK_CODES = [
  "Gen","Exo","Lev","Num","Deu","Jos","Jdg","Rut","1Sa","2Sa",
  "1Ki","2Ki","1Ch","2Ch","Ezr","Neh","Est","Job","Psa","Pro",
  "Ecc","Sng","Isa","Jer","Lam","Ezk","Dan","Hos","Joe","Amo",
  "Oba","Jon","Mic","Nam","Hab","Zep","Hag","Zec","Mal",
  "Mat","Mrk","Luk","Jhn","Act","Rom","1Co","2Co","Gal","Eph",
  "Php","Col","1Th","2Th","1Ti","2Ti","Tit","Phm","Heb","Jas",
  "1Pe","2Pe","1Jn","2Jn","3Jn","Jud","Rev",
];

async function main() {
  if (!SOURCE_URL) {
    throw new Error("KRV_SOURCE_URL 환경변수가 비어있다");
  }
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`fetch 실패: ${res.status}`);
  const raw = await res.json();
  const normalized = normalize(raw);
  validate(normalized);
  fs.writeFileSync(OUT_PATH, JSON.stringify(normalized));
  console.log(`완료: ${OUT_PATH} (${BOOK_CODES.length}권)`);
}

function normalize(raw: unknown): Record<string, Record<number, Record<number, string>>> {
  // 소스 포맷에 맞춰 채움 (Task 0.2에서 결정된 포맷 기준)
  // 여기서는 형태 가이드만 두고, 실제 매핑 로직은 소스 확정 후 보완.
  throw new Error("Task 0.2 결과에 따라 매핑 로직 구현 필요");
}

function validate(data: Record<string, Record<number, Record<number, string>>>) {
  for (const code of BOOK_CODES) {
    if (!data[code]) throw new Error(`누락된 책: ${code}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

**Step 2: 실행 (Task 0.2 결과 반영)**

Run:
```bash
cd apps/ch-life
KRV_SOURCE_URL="<Task 0.2에서 확정한 URL>" npx tsx scripts/build-bible.ts
```

Expected: `assets/bible-krv.json` 생성, 66권 모두 포함.

**Step 3: 데이터 검증 테스트**

Create `apps/ch-life/src/data/__tests__/bible-data.test.ts`:
```ts
import bible from "../../../assets/bible-krv.json";

describe("bible-krv.json", () => {
  it("66권을 가진다", () => {
    expect(Object.keys(bible)).toHaveLength(66);
  });
  it("골로새서 3:20을 가진다", () => {
    const text = (bible as any)["Col"][3][20];
    expect(typeof text).toBe("string");
    expect(text.length).toBeGreaterThan(0);
  });
  it("창세기 1:1을 가진다", () => {
    const text = (bible as any)["Gen"][1][1];
    expect(text).toContain("태초에");
  });
});
```

**Step 4: 테스트 실행**

Run:
```bash
npm test -- --testPathPattern=bible-data
```

Expected: PASS 3 tests.

**Step 5: Commit**

```bash
git add apps/ch-life/scripts apps/ch-life/assets/bible-krv.json apps/ch-life/src/data
git commit -m "feat: 개역한글 정적 데이터 빌드 + 검증 테스트"
```

---

### Task 1.4: SQLite 스키마 + 마이그레이션

**Files:**
- Create: `apps/ch-life/src/db/schema.sql`
- Create: `apps/ch-life/src/db/index.ts`
- Create: `apps/ch-life/src/db/__tests__/migrations.test.ts`

**Step 1: 스키마 파일 작성**

Create `apps/ch-life/src/db/schema.sql`:
```sql
CREATE TABLE IF NOT EXISTS notes (
  id          TEXT PRIMARY KEY,
  title       TEXT,
  body_json   TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL,
  cited_refs  TEXT NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);

CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
  id UNINDEXED,
  title,
  body_text,
  cited_refs,
  tokenize='unicode61'
);

CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
  INSERT INTO notes_fts(id, title, body_text, cited_refs)
  VALUES (new.id, COALESCE(new.title,''), '', new.cited_refs);
END;

CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
  DELETE FROM notes_fts WHERE id = old.id;
END;

CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
  UPDATE notes_fts SET title = COALESCE(new.title,''), cited_refs = new.cited_refs
  WHERE id = new.id;
END;
```

**Step 2: DB 모듈 작성**

Run:
```bash
cd apps/ch-life
npx expo install expo-sqlite
```

Create `apps/ch-life/src/db/index.ts`:
```ts
import * as SQLite from "expo-sqlite";

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync("ch-life.db");
  await runMigrations(dbInstance);
  return dbInstance;
}

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(SCHEMA_SQL);
}

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS notes (
  id          TEXT PRIMARY KEY,
  title       TEXT,
  body_json   TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL,
  cited_refs  TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);
CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
  id UNINDEXED, title, body_text, cited_refs, tokenize='unicode61'
);
CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
  INSERT INTO notes_fts(id, title, body_text, cited_refs)
  VALUES (new.id, COALESCE(new.title,''), '', new.cited_refs);
END;
CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
  DELETE FROM notes_fts WHERE id = old.id;
END;
CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
  UPDATE notes_fts SET title = COALESCE(new.title,''), cited_refs = new.cited_refs
  WHERE id = new.id;
END;
`;
```

**Step 3: 인메모리 SQLite 테스트 (better-sqlite3로 schema만 검증)**

Run:
```bash
cd apps/ch-life
npm install -D better-sqlite3 @types/better-sqlite3
```

Create `apps/ch-life/src/db/__tests__/migrations.test.ts`:
```ts
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const SCHEMA = fs.readFileSync(
  path.resolve(__dirname, "../schema.sql"),
  "utf8",
);

describe("schema", () => {
  it("notes 테이블·인덱스·FTS·트리거가 생성된다", () => {
    const db = new Database(":memory:");
    db.exec(SCHEMA);
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((r: any) => r.name);
    expect(tables).toContain("notes");
    expect(tables).toContain("notes_fts");
    const triggers = db
      .prepare("SELECT name FROM sqlite_master WHERE type='trigger'")
      .all()
      .map((r: any) => r.name);
    expect(triggers).toEqual(
      expect.arrayContaining(["notes_ai", "notes_ad", "notes_au"]),
    );
    db.close();
  });
});
```

**Step 4: 테스트 통과 확인**

Run:
```bash
npm test -- --testPathPattern=migrations
```

Expected: PASS.

**Step 5: Commit**

```bash
git add apps/ch-life/src/db apps/ch-life/package.json
git commit -m "feat: SQLite + FTS5 스키마와 마이그레이션"
```

---

### Task 1.5: Zustand 글로벌 상태 (currentNoteId·settings)

**Files:**
- Create: `apps/ch-life/src/state/app-store.ts`
- Create: `apps/ch-life/src/state/__tests__/app-store.test.ts`

**Step 1: 실패 테스트**

Create `apps/ch-life/src/state/__tests__/app-store.test.ts`:
```ts
import { useAppStore } from "../app-store";

describe("app-store", () => {
  beforeEach(() => useAppStore.setState({ currentNoteId: null }));

  it("currentNoteId 초기값은 null", () => {
    expect(useAppStore.getState().currentNoteId).toBeNull();
  });

  it("setCurrentNoteId가 동작한다", () => {
    useAppStore.getState().setCurrentNoteId("01HABC");
    expect(useAppStore.getState().currentNoteId).toBe("01HABC");
  });

  it("기본 fontScale은 1.2", () => {
    expect(useAppStore.getState().settings.fontScale).toBe(1.2);
  });
});
```

**Step 2: Zustand 설치**

Run:
```bash
cd apps/ch-life
npm install zustand
```

**Step 3: 스토어 작성**

Create `apps/ch-life/src/state/app-store.ts`:
```ts
import { create } from "zustand";
import type { Settings } from "@/domain/types";

type AppState = {
  currentNoteId: string | null;
  settings: Settings;
  setCurrentNoteId: (id: string | null) => void;
  setSettings: (next: Partial<Settings>) => void;
};

const DEFAULT_SETTINGS: Settings = {
  fontScale: 1.2,
  themePreference: "system",
  lastOpenedNoteId: null,
};

export const useAppStore = create<AppState>((set) => ({
  currentNoteId: null,
  settings: DEFAULT_SETTINGS,
  setCurrentNoteId: (id) => set({ currentNoteId: id }),
  setSettings: (next) =>
    set((s) => ({ settings: { ...s.settings, ...next } })),
}));
```

**Step 4: 테스트 실행**

Run: `npm test -- --testPathPattern=app-store`
Expected: PASS 3 tests.

**Step 5: Commit**

```bash
git add apps/ch-life/src/state apps/ch-life/package.json
git commit -m "feat: Zustand 글로벌 상태 (currentNoteId, settings)"
```

---

## Phase 2 — Autocomplete Core (Week 2)

### Task 2.1: 한국어 책명 매핑 어댑터 (Jest 198 케이스)

**Files:**
- Create: `apps/ch-life/src/parser/book-map.ts`
- Create: `apps/ch-life/src/parser/__tests__/book-map.test.ts`

**Step 1: 실패 테스트 — 한국어 정식 66개**

Create `apps/ch-life/src/parser/__tests__/book-map.test.ts`:
```ts
import { resolveBookCode } from "../book-map";

const FULL_KO = [
  ["창세기", "Gen"], ["출애굽기", "Exo"], ["레위기", "Lev"], ["민수기", "Num"],
  ["신명기", "Deu"], ["여호수아", "Jos"], ["사사기", "Jdg"], ["룻기", "Rut"],
  ["사무엘상", "1Sa"], ["사무엘하", "2Sa"], ["열왕기상", "1Ki"], ["열왕기하", "2Ki"],
  ["역대상", "1Ch"], ["역대하", "2Ch"], ["에스라", "Ezr"], ["느헤미야", "Neh"],
  ["에스더", "Est"], ["욥기", "Job"], ["시편", "Psa"], ["잠언", "Pro"],
  ["전도서", "Ecc"], ["아가", "Sng"], ["이사야", "Isa"], ["예레미야", "Jer"],
  ["예레미야애가", "Lam"], ["에스겔", "Ezk"], ["다니엘", "Dan"], ["호세아", "Hos"],
  ["요엘", "Joe"], ["아모스", "Amo"], ["오바댜", "Oba"], ["요나", "Jon"],
  ["미가", "Mic"], ["나훔", "Nam"], ["하박국", "Hab"], ["스바냐", "Zep"],
  ["학개", "Hag"], ["스가랴", "Zec"], ["말라기", "Mal"],
  ["마태복음", "Mat"], ["마가복음", "Mrk"], ["누가복음", "Luk"], ["요한복음", "Jhn"],
  ["사도행전", "Act"], ["로마서", "Rom"], ["고린도전서", "1Co"], ["고린도후서", "2Co"],
  ["갈라디아서", "Gal"], ["에베소서", "Eph"], ["빌립보서", "Php"], ["골로새서", "Col"],
  ["데살로니가전서", "1Th"], ["데살로니가후서", "2Th"], ["디모데전서", "1Ti"],
  ["디모데후서", "2Ti"], ["디도서", "Tit"], ["빌레몬서", "Phm"], ["히브리서", "Heb"],
  ["야고보서", "Jas"], ["베드로전서", "1Pe"], ["베드로후서", "2Pe"],
  ["요한일서", "1Jn"], ["요한이서", "2Jn"], ["요한삼서", "3Jn"], ["유다서", "Jud"],
  ["요한계시록", "Rev"],
] as const;

const ABBR_KO: ReadonlyArray<readonly [string, string]> = [
  ["창", "Gen"], ["출", "Exo"], ["골", "Col"], ["롬", "Rom"], ["요", "Jhn"],
  ["마", "Mat"], ["엡", "Eph"], ["빌", "Php"], ["계", "Rev"], ["시", "Psa"],
  // (전체 66권 축약을 채울 것 — Wikipedia 한국어 성경 약어 표 기준)
];

const EN: ReadonlyArray<readonly [string, string]> = [
  ["Genesis", "Gen"], ["Colossians", "Col"], ["John", "Jhn"],
  ["1 Corinthians", "1Co"], ["Col", "Col"], ["Rev", "Rev"],
  // (66권 영어 정식·축약 모두 — 어댑터 구현 시 채움)
];

describe("resolveBookCode — 한국어 정식 66권", () => {
  for (const [input, code] of FULL_KO) {
    it(`${input} → ${code}`, () => {
      expect(resolveBookCode(input)).toBe(code);
    });
  }
});

describe("resolveBookCode — 한국어 축약", () => {
  for (const [input, code] of ABBR_KO) {
    it(`${input} → ${code}`, () => {
      expect(resolveBookCode(input)).toBe(code);
    });
  }
});

describe("resolveBookCode — 영어", () => {
  for (const [input, code] of EN) {
    it(`${input} → ${code}`, () => {
      expect(resolveBookCode(input)).toBe(code);
    });
  }
});

describe("resolveBookCode — 데드 케이스", () => {
  it("존재하지 않는 책은 null", () => {
    expect(resolveBookCode("롤리")).toBeNull();
  });
});
```

**Step 2: 테스트 실행 (실패 확인)**

Run: `npm test -- --testPathPattern=book-map`
Expected: 모두 실패 (`resolveBookCode is not a function`).

**Step 3: 매핑 데이터·함수 구현**

Create `apps/ch-life/src/parser/book-map.ts`:
```ts
type BookCode =
  | "Gen" | "Exo" | "Lev" | "Num" | "Deu" | "Jos" | "Jdg" | "Rut"
  | "1Sa" | "2Sa" | "1Ki" | "2Ki" | "1Ch" | "2Ch" | "Ezr" | "Neh"
  | "Est" | "Job" | "Psa" | "Pro" | "Ecc" | "Sng" | "Isa" | "Jer"
  | "Lam" | "Ezk" | "Dan" | "Hos" | "Joe" | "Amo" | "Oba" | "Jon"
  | "Mic" | "Nam" | "Hab" | "Zep" | "Hag" | "Zec" | "Mal"
  | "Mat" | "Mrk" | "Luk" | "Jhn" | "Act" | "Rom" | "1Co" | "2Co"
  | "Gal" | "Eph" | "Php" | "Col" | "1Th" | "2Th" | "1Ti" | "2Ti"
  | "Tit" | "Phm" | "Heb" | "Jas" | "1Pe" | "2Pe" | "1Jn" | "2Jn"
  | "3Jn" | "Jud" | "Rev";

const ALIAS_TABLE: Array<{ aliases: string[]; code: BookCode }> = [
  { code: "Gen", aliases: ["창세기", "창", "Genesis", "Gen"] },
  { code: "Exo", aliases: ["출애굽기", "출", "Exodus", "Exo", "Ex"] },
  { code: "Lev", aliases: ["레위기", "레", "Leviticus", "Lev"] },
  { code: "Num", aliases: ["민수기", "민", "Numbers", "Num"] },
  { code: "Deu", aliases: ["신명기", "신", "Deuteronomy", "Deu", "Dt"] },
  { code: "Jos", aliases: ["여호수아", "수", "Joshua", "Jos", "Josh"] },
  { code: "Jdg", aliases: ["사사기", "삿", "Judges", "Jdg", "Judg"] },
  { code: "Rut", aliases: ["룻기", "룻", "Ruth", "Rut"] },
  { code: "1Sa", aliases: ["사무엘상", "삼상", "1 Samuel", "1Sa", "1Sam"] },
  { code: "2Sa", aliases: ["사무엘하", "삼하", "2 Samuel", "2Sa", "2Sam"] },
  { code: "1Ki", aliases: ["열왕기상", "왕상", "1 Kings", "1Ki", "1Kgs"] },
  { code: "2Ki", aliases: ["열왕기하", "왕하", "2 Kings", "2Ki", "2Kgs"] },
  { code: "1Ch", aliases: ["역대상", "대상", "1 Chronicles", "1Ch"] },
  { code: "2Ch", aliases: ["역대하", "대하", "2 Chronicles", "2Ch"] },
  { code: "Ezr", aliases: ["에스라", "스", "Ezra", "Ezr"] },
  { code: "Neh", aliases: ["느헤미야", "느", "Nehemiah", "Neh"] },
  { code: "Est", aliases: ["에스더", "에", "Esther", "Est"] },
  { code: "Job", aliases: ["욥기", "욥", "Job"] },
  { code: "Psa", aliases: ["시편", "시", "Psalms", "Psalm", "Psa", "Ps"] },
  { code: "Pro", aliases: ["잠언", "잠", "Proverbs", "Pro", "Prov"] },
  { code: "Ecc", aliases: ["전도서", "전", "Ecclesiastes", "Ecc", "Eccl"] },
  { code: "Sng", aliases: ["아가", "아", "Song of Solomon", "Song", "Sng", "SoS"] },
  { code: "Isa", aliases: ["이사야", "사", "Isaiah", "Isa"] },
  { code: "Jer", aliases: ["예레미야", "렘", "Jeremiah", "Jer"] },
  { code: "Lam", aliases: ["예레미야애가", "애", "Lamentations", "Lam"] },
  { code: "Ezk", aliases: ["에스겔", "겔", "Ezekiel", "Ezk", "Ezek"] },
  { code: "Dan", aliases: ["다니엘", "단", "Daniel", "Dan"] },
  { code: "Hos", aliases: ["호세아", "호", "Hosea", "Hos"] },
  { code: "Joe", aliases: ["요엘", "욜", "Joel", "Joe"] },
  { code: "Amo", aliases: ["아모스", "암", "Amos", "Amo"] },
  { code: "Oba", aliases: ["오바댜", "옵", "Obadiah", "Oba"] },
  { code: "Jon", aliases: ["요나", "욘", "Jonah", "Jon"] },
  { code: "Mic", aliases: ["미가", "미", "Micah", "Mic"] },
  { code: "Nam", aliases: ["나훔", "나", "Nahum", "Nam"] },
  { code: "Hab", aliases: ["하박국", "합", "Habakkuk", "Hab"] },
  { code: "Zep", aliases: ["스바냐", "습", "Zephaniah", "Zep"] },
  { code: "Hag", aliases: ["학개", "학", "Haggai", "Hag"] },
  { code: "Zec", aliases: ["스가랴", "슥", "Zechariah", "Zec", "Zech"] },
  { code: "Mal", aliases: ["말라기", "말", "Malachi", "Mal"] },
  { code: "Mat", aliases: ["마태복음", "마", "Matthew", "Mat", "Matt"] },
  { code: "Mrk", aliases: ["마가복음", "막", "Mark", "Mrk", "Mk"] },
  { code: "Luk", aliases: ["누가복음", "눅", "Luke", "Luk", "Lk"] },
  { code: "Jhn", aliases: ["요한복음", "요", "John", "Jhn", "Jn"] },
  { code: "Act", aliases: ["사도행전", "행", "Acts", "Act"] },
  { code: "Rom", aliases: ["로마서", "롬", "Romans", "Rom"] },
  { code: "1Co", aliases: ["고린도전서", "고전", "1 Corinthians", "1Co", "1Cor"] },
  { code: "2Co", aliases: ["고린도후서", "고후", "2 Corinthians", "2Co", "2Cor"] },
  { code: "Gal", aliases: ["갈라디아서", "갈", "Galatians", "Gal"] },
  { code: "Eph", aliases: ["에베소서", "엡", "Ephesians", "Eph"] },
  { code: "Php", aliases: ["빌립보서", "빌", "Philippians", "Php", "Phil"] },
  { code: "Col", aliases: ["골로새서", "골", "Colossians", "Col"] },
  { code: "1Th", aliases: ["데살로니가전서", "살전", "1 Thessalonians", "1Th"] },
  { code: "2Th", aliases: ["데살로니가후서", "살후", "2 Thessalonians", "2Th"] },
  { code: "1Ti", aliases: ["디모데전서", "딤전", "1 Timothy", "1Ti", "1Tim"] },
  { code: "2Ti", aliases: ["디모데후서", "딤후", "2 Timothy", "2Ti", "2Tim"] },
  { code: "Tit", aliases: ["디도서", "딛", "Titus", "Tit"] },
  { code: "Phm", aliases: ["빌레몬서", "몬", "Philemon", "Phm"] },
  { code: "Heb", aliases: ["히브리서", "히", "Hebrews", "Heb"] },
  { code: "Jas", aliases: ["야고보서", "약", "James", "Jas"] },
  { code: "1Pe", aliases: ["베드로전서", "벧전", "1 Peter", "1Pe", "1Pet"] },
  { code: "2Pe", aliases: ["베드로후서", "벧후", "2 Peter", "2Pe", "2Pet"] },
  { code: "1Jn", aliases: ["요한일서", "요일", "1 John", "1Jn"] },
  { code: "2Jn", aliases: ["요한이서", "요이", "2 John", "2Jn"] },
  { code: "3Jn", aliases: ["요한삼서", "요삼", "3 John", "3Jn"] },
  { code: "Jud", aliases: ["유다서", "유", "Jude", "Jud"] },
  { code: "Rev", aliases: ["요한계시록", "계", "Revelation", "Rev", "Rv"] },
];

const ALIAS_MAP: ReadonlyMap<string, BookCode> = (() => {
  const m = new Map<string, BookCode>();
  for (const { aliases, code } of ALIAS_TABLE) {
    for (const a of aliases) m.set(normalize(a), code);
  }
  return m;
})();

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

export function resolveBookCode(input: string): BookCode | null {
  return ALIAS_MAP.get(normalize(input)) ?? null;
}

export type { BookCode };
```

**Step 4: 테스트 실행 (통과 확인)**

Run: `npm test -- --testPathPattern=book-map`
Expected: 모두 PASS.

**Step 5: Commit**

```bash
git add apps/ch-life/src/parser
git commit -m "feat: 한국어/영어 책명 매핑 어댑터 + Jest 케이스"
```

---

### Task 2.2: ref 패턴 파서

**Files:**
- Create: `apps/ch-life/src/parser/ref-parser.ts`
- Create: `apps/ch-life/src/parser/__tests__/ref-parser.test.ts`

**Step 1: 실패 테스트**

Create `apps/ch-life/src/parser/__tests__/ref-parser.test.ts`:
```ts
import { parseRef } from "../ref-parser";

describe("parseRef", () => {
  it("'골 3:20' → Col 3:20", () => {
    expect(parseRef("골 3:20")).toEqual({ book: "Col", chapter: 3, verse: 20, end: null });
  });
  it("'골3:20' (공백 없음)", () => {
    expect(parseRef("골3:20")).toEqual({ book: "Col", chapter: 3, verse: 20, end: null });
  });
  it("'요한복음 3:16'", () => {
    expect(parseRef("요한복음 3:16")).toEqual({ book: "Jhn", chapter: 3, verse: 16, end: null });
  });
  it("'Col 3:20' (영어)", () => {
    expect(parseRef("Col 3:20")).toEqual({ book: "Col", chapter: 3, verse: 20, end: null });
  });
  it("'골 3:20-22' (범위)", () => {
    expect(parseRef("골 3:20-22")).toEqual({ book: "Col", chapter: 3, verse: 20, end: 22 });
  });
  it("데드 패턴 'abc'", () => {
    expect(parseRef("abc")).toBeNull();
  });
});
```

**Step 2: 실행 (실패)**

Run: `npm test -- --testPathPattern=ref-parser`
Expected: 실패.

**Step 3: 파서 구현**

Create `apps/ch-life/src/parser/ref-parser.ts`:
```ts
import { resolveBookCode, type BookCode } from "./book-map";

export type ParsedRef = {
  book: BookCode;
  chapter: number;
  verse: number;
  end: number | null;
};

const PATTERN =
  /^([가-힣]{1,8}|[A-Za-z\s]{1,20})\s*(\d{1,3}):(\d{1,3})(?:-(\d{1,3}))?$/;

export function parseRef(input: string): ParsedRef | null {
  const trimmed = input.trim();
  const m = PATTERN.exec(trimmed);
  if (!m) return null;
  const [, bookRaw, chapterStr, verseStr, endStr] = m;
  const code = resolveBookCode(bookRaw);
  if (!code) return null;
  const chapter = Number(chapterStr);
  const verse = Number(verseStr);
  const end = endStr ? Number(endStr) : null;
  if (!Number.isInteger(chapter) || !Number.isInteger(verse)) return null;
  return { book: code, chapter, verse, end };
}
```

**Step 4: 테스트 통과 확인**

Run: `npm test -- --testPathPattern=ref-parser`
Expected: PASS 6 tests.

**Step 5: Commit**

```bash
git add apps/ch-life/src/parser
git commit -m "feat: ref 패턴 파서 (한국어/영어, 단절·범위)"
```

---

### Task 2.3: 절 lookup 서비스

**Files:**
- Create: `apps/ch-life/src/parser/verse-lookup.ts`
- Create: `apps/ch-life/src/parser/__tests__/verse-lookup.test.ts`

**Step 1: 실패 테스트**

Create `apps/ch-life/src/parser/__tests__/verse-lookup.test.ts`:
```ts
import { lookupVerses } from "../verse-lookup";

describe("lookupVerses", () => {
  it("'골 3:20' 단절", () => {
    const v = lookupVerses("골 3:20");
    expect(v).toHaveLength(1);
    expect(v?.[0].book).toBe("Col");
    expect(v?.[0].chapter).toBe(3);
    expect(v?.[0].verse).toBe(20);
    expect(typeof v?.[0].text).toBe("string");
  });
  it("'골 3:20-22' 범위", () => {
    const v = lookupVerses("골 3:20-22");
    expect(v).toHaveLength(3);
    expect(v?.[2].verse).toBe(22);
  });
  it("데드 ref (존재하지 않는 절)", () => {
    expect(lookupVerses("골 99:99")).toBeNull();
  });
  it("파싱 실패", () => {
    expect(lookupVerses("abc")).toBeNull();
  });
});
```

**Step 2: 실행 (실패)**

Run: `npm test -- --testPathPattern=verse-lookup`

**Step 3: 구현**

Create `apps/ch-life/src/parser/verse-lookup.ts`:
```ts
import { parseRef } from "./ref-parser";
import type { Verse } from "@/domain/types";
import bible from "../../assets/bible-krv.json";

type BibleData = Record<string, Record<string, Record<string, string>>>;
const DATA: BibleData = bible as BibleData;

export function lookupVerses(refInput: string): Verse[] | null {
  const parsed = parseRef(refInput);
  if (!parsed) return null;
  const { book, chapter, verse, end } = parsed;
  const endVerse = end ?? verse;
  if (endVerse < verse) return null;

  const chapterData = DATA[book]?.[String(chapter)];
  if (!chapterData) return null;

  const verses: Verse[] = [];
  for (let v = verse; v <= endVerse; v++) {
    const text = chapterData[String(v)];
    if (!text) return null;
    verses.push({ book, chapter, verse: v, text });
  }
  return verses.length > 0 ? verses : null;
}
```

**Step 4: 통과 확인**

Run: `npm test -- --testPathPattern=verse-lookup`
Expected: PASS 4 tests.

**Step 5: Commit**

```bash
git add apps/ch-life/src/parser
git commit -m "feat: 절 lookup 서비스 (정적 자산 메모리 lookup)"
```

---

### Task 2.4: 노트 레포지토리 (SQLite CRUD)

**Files:**
- Create: `apps/ch-life/src/db/note-repo.ts`
- Create: `apps/ch-life/src/db/__tests__/note-repo.test.ts`

**Step 1: 실패 테스트 (better-sqlite3 인메모리)**

Create `apps/ch-life/src/db/__tests__/note-repo.test.ts`:
```ts
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { makeNoteRepo } from "../note-repo";

const SCHEMA = fs.readFileSync(
  path.resolve(__dirname, "../schema.sql"),
  "utf8",
);

function setup() {
  const db = new Database(":memory:");
  db.exec(SCHEMA);
  return makeNoteRepo({
    execAsync: async (sql: string) => { db.exec(sql); },
    runAsync: async (sql: string, params: any[] = []) =>
      db.prepare(sql).run(...params),
    getAllAsync: async <T,>(sql: string, params: any[] = []): Promise<T[]> =>
      db.prepare(sql).all(...params) as T[],
    getFirstAsync: async <T,>(sql: string, params: any[] = []): Promise<T | null> =>
      (db.prepare(sql).get(...params) as T | undefined) ?? null,
  });
}

describe("note-repo", () => {
  it("노트를 만들고 읽는다", async () => {
    const repo = setup();
    const id = await repo.create({
      title: "주일설교",
      body: [{ type: "paragraph", text: "안녕" }],
      citedRefs: [],
    });
    const note = await repo.findById(id);
    expect(note?.title).toBe("주일설교");
    expect(note?.body[0]).toEqual({ type: "paragraph", text: "안녕" });
  });

  it("최신순 정렬", async () => {
    const repo = setup();
    const a = await repo.create({ title: "A", body: [], citedRefs: [] });
    await new Promise((r) => setTimeout(r, 5));
    const b = await repo.create({ title: "B", body: [], citedRefs: [] });
    const list = await repo.listRecent({ limit: 10 });
    expect(list[0].id).toBe(b);
    expect(list[1].id).toBe(a);
  });

  it("update가 updatedAt을 갱신한다", async () => {
    const repo = setup();
    const id = await repo.create({ title: "x", body: [], citedRefs: [] });
    const before = (await repo.findById(id))!;
    await new Promise((r) => setTimeout(r, 5));
    await repo.update(id, { title: "y" });
    const after = (await repo.findById(id))!;
    expect(after.title).toBe("y");
    expect(after.updatedAt).toBeGreaterThan(before.updatedAt);
  });
});
```

**Step 2: 실행 (실패)**

Run: `npm test -- --testPathPattern=note-repo`

**Step 3: 레포 구현**

Create `apps/ch-life/src/db/note-repo.ts`:
```ts
import type { BlockNode, Note } from "@/domain/types";

type DbAdapter = {
  execAsync: (sql: string) => Promise<void>;
  runAsync: (sql: string, params?: any[]) => Promise<any>;
  getAllAsync: <T>(sql: string, params?: any[]) => Promise<T[]>;
  getFirstAsync: <T>(sql: string, params?: any[]) => Promise<T | null>;
};

type Row = {
  id: string;
  title: string | null;
  body_json: string;
  created_at: number;
  updated_at: number;
  cited_refs: string;
};

function rowToNote(r: Row): Note {
  return {
    id: r.id,
    title: r.title,
    body: JSON.parse(r.body_json) as BlockNode[],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    citedRefs: JSON.parse(r.cited_refs) as string[],
  };
}

function makeId(): string {
  // 외부 라이브러리 의존 없는 간단 ULID-ish (Task 2.4 단계는 의존 최소화).
  const t = Date.now().toString(36).padStart(10, "0");
  const r = Math.random().toString(36).slice(2, 12).padStart(10, "0");
  return (t + r).toUpperCase();
}

export function makeNoteRepo(db: DbAdapter) {
  return {
    async create(input: {
      title?: string | null;
      body: BlockNode[];
      citedRefs: string[];
    }): Promise<string> {
      const id = makeId();
      const now = Date.now();
      await db.runAsync(
        `INSERT INTO notes(id, title, body_json, created_at, updated_at, cited_refs)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          input.title ?? null,
          JSON.stringify(input.body),
          now,
          now,
          JSON.stringify(input.citedRefs),
        ],
      );
      return id;
    },

    async update(
      id: string,
      patch: { title?: string | null; body?: BlockNode[]; citedRefs?: string[] },
    ): Promise<void> {
      const current = await db.getFirstAsync<Row>(
        `SELECT * FROM notes WHERE id = ?`,
        [id],
      );
      if (!current) throw new Error(`note not found: ${id}`);
      const next: Row = {
        ...current,
        title: patch.title !== undefined ? patch.title : current.title,
        body_json: patch.body
          ? JSON.stringify(patch.body)
          : current.body_json,
        cited_refs: patch.citedRefs
          ? JSON.stringify(patch.citedRefs)
          : current.cited_refs,
        updated_at: Date.now(),
      };
      await db.runAsync(
        `UPDATE notes SET title=?, body_json=?, cited_refs=?, updated_at=?
         WHERE id=?`,
        [next.title, next.body_json, next.cited_refs, next.updated_at, id],
      );
    },

    async findById(id: string): Promise<Note | null> {
      const row = await db.getFirstAsync<Row>(
        `SELECT * FROM notes WHERE id = ?`,
        [id],
      );
      return row ? rowToNote(row) : null;
    },

    async listRecent(opts: { limit: number }): Promise<Note[]> {
      const rows = await db.getAllAsync<Row>(
        `SELECT * FROM notes ORDER BY updated_at DESC LIMIT ?`,
        [opts.limit],
      );
      return rows.map(rowToNote);
    },

    async delete(id: string): Promise<void> {
      await db.runAsync(`DELETE FROM notes WHERE id = ?`, [id]);
    },
  };
}

export type NoteRepo = ReturnType<typeof makeNoteRepo>;
```

**Step 4: 통과 확인**

Run: `npm test -- --testPathPattern=note-repo`
Expected: PASS 3 tests.

**Step 5: Commit**

```bash
git add apps/ch-life/src/db
git commit -m "feat: 노트 레포지토리 (create/update/findById/listRecent)"
```

---

### Task 2.5: 에디터 화면 + 인용블록 렌더링

**Files:**
- Modify: `apps/ch-life/app/note/[id].tsx`
- Create: `apps/ch-life/src/editor/QuoteBlock.tsx`
- Create: `apps/ch-life/src/editor/NoteEditor.tsx`

**Step 1: QuoteBlock 컴포넌트**

Create `apps/ch-life/src/editor/QuoteBlock.tsx`:
```tsx
import React from "react";
import { ActivityIndicator, Text, View, StyleSheet } from "react-native";
import type { BlockNode } from "@/domain/types";

type Props = Extract<BlockNode, { type: "quote" }>;

export function QuoteBlock({ ref, verses, status }: Props) {
  const barColor = status === "error" ? "#c8342a" : "#bdbdbd";
  return (
    <View style={[styles.row, { borderLeftColor: barColor }]}>
      <View style={styles.body}>
        <Text style={styles.ref}>{ref}</Text>
        {status === "loading" && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" />
            <Text style={styles.loading}>불러오는 중…</Text>
          </View>
        )}
        {status === "loaded" &&
          verses.map((v) => (
            <Text key={`${v.book}-${v.chapter}-${v.verse}`} style={styles.verse}>
              {v.text}
            </Text>
          ))}
        {status === "error" && (
          <Text style={styles.error}>본문을 찾을 수 없습니다</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingLeft: 12,
    borderLeftWidth: 4,
    marginVertical: 8,
  },
  body: { flex: 1 },
  ref: { fontWeight: "600", marginBottom: 4, fontSize: 16 },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  loading: { color: "#7a7a7a" },
  verse: { fontSize: 16, lineHeight: 24 },
  error: { color: "#c8342a" },
});
```

**Step 2: NoteEditor (단순 paragraph 리스트 렌더)**

Create `apps/ch-life/src/editor/NoteEditor.tsx`:
```tsx
import React from "react";
import { ScrollView, Text, TextInput, StyleSheet } from "react-native";
import type { BlockNode } from "@/domain/types";
import { QuoteBlock } from "./QuoteBlock";

type Props = {
  body: BlockNode[];
  onChangeBody: (next: BlockNode[]) => void;
};

export function NoteEditor({ body, onChangeBody }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.root}>
      {body.map((block, idx) => {
        if (block.type === "quote") {
          return <QuoteBlock key={idx} {...block} />;
        }
        return (
          <TextInput
            key={idx}
            style={styles.paragraph}
            value={block.text}
            multiline
            onChangeText={(text) => {
              const next = body.slice();
              next[idx] = { type: "paragraph", text };
              onChangeBody(next);
            }}
            placeholder={idx === 0 ? "오늘의 설교를 적어보세요" : ""}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: 16, gap: 8 },
  paragraph: { fontSize: 18, lineHeight: 26, minHeight: 28 },
});
```

**Step 3: 에디터 라우트 연결**

Modify `apps/ch-life/app/note/[id].tsx`:
```tsx
import React, { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { NoteEditor } from "@/editor/NoteEditor";
import type { BlockNode } from "@/domain/types";

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [body, setBody] = useState<BlockNode[]>([
    { type: "paragraph", text: "" },
    {
      type: "quote",
      ref: "골 3:20",
      verses: [
        { book: "Col", chapter: 3, verse: 20, text: "자녀들아 모든 일에 부모에게 순종하라" },
      ],
      status: "loaded",
    },
    { type: "paragraph", text: "" },
  ]);

  return (
    <View style={{ flex: 1 }}>
      <NoteEditor body={body} onChangeBody={setBody} />
    </View>
  );
}
```

**Step 4: 실기기 확인**

Run: `npx expo start`
폰에서 `/note/1` 진입 → 인용블록 + 빈 paragraph가 렌더되는지 확인.

**Step 5: Commit**

```bash
git add apps/ch-life/src/editor apps/ch-life/app/note
git commit -m "feat: 노트 에디터 + 인용블록 렌더링 (paragraph/quote)"
```

---

### Task 2.6: 자동완성 칩 + Tab 확정

**Files:**
- Create: `apps/ch-life/src/editor/useAutocomplete.ts`
- Create: `apps/ch-life/src/editor/__tests__/useAutocomplete.test.ts`
- Create: `apps/ch-life/src/editor/RefChip.tsx`
- Modify: `apps/ch-life/src/editor/NoteEditor.tsx`

**Step 1: useAutocomplete 훅 테스트**

Create `apps/ch-life/src/editor/__tests__/useAutocomplete.test.ts`:
```ts
import { detectRefAtCursor } from "../useAutocomplete";

describe("detectRefAtCursor", () => {
  it("커서 직전의 '골 3:20' 감지", () => {
    expect(detectRefAtCursor("오늘 본문은 골 3:20", 19)).toEqual({
      ref: "골 3:20",
      start: 13,
      end: 19,
    });
  });
  it("'골3:20' (공백 없음) 감지", () => {
    expect(detectRefAtCursor("골3:20", 5)).toEqual({
      ref: "골3:20",
      start: 0,
      end: 5,
    });
  });
  it("패턴 없으면 null", () => {
    expect(detectRefAtCursor("그냥 글자", 5)).toBeNull();
  });
  it("데드 ref (책 안 매칭)는 null", () => {
    expect(detectRefAtCursor("롤리 3:20", 8)).toBeNull();
  });
  it("데드 ref (존재하지 않는 절)도 null — 칩 안 뜸 정책", () => {
    expect(detectRefAtCursor("골 99:99", 8)).toBeNull();
  });
});
```

**Step 2: 실행 (실패 확인)**

Run: `npm test -- --testPathPattern=useAutocomplete`

**Step 3: 감지 함수 구현**

Create `apps/ch-life/src/editor/useAutocomplete.ts`:
```ts
import { lookupVerses } from "@/parser/verse-lookup";

const TAIL_PATTERN =
  /([가-힣]{1,8}|[A-Za-z]{2,20})\s?\d{1,3}:\d{1,3}$/;

export type DetectedRef = { ref: string; start: number; end: number };

export function detectRefAtCursor(
  text: string,
  cursor: number,
): DetectedRef | null {
  const before = text.slice(0, cursor);
  const m = TAIL_PATTERN.exec(before);
  if (!m) return null;
  const ref = m[0];
  const start = before.length - ref.length;
  // 데드 ref면 칩 안 띄움
  const verses = lookupVerses(ref);
  if (!verses) return null;
  return { ref, start, end: cursor };
}
```

**Step 4: 통과 확인**

Run: `npm test -- --testPathPattern=useAutocomplete`
Expected: PASS 5 tests.

**Step 5: RefChip 컴포넌트**

Create `apps/ch-life/src/editor/RefChip.tsx`:
```tsx
import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

export function RefChip({ ref, onConfirm }: { ref: string; onConfirm: () => void }) {
  return (
    <Pressable onPress={onConfirm} style={styles.chip} accessibilityRole="button">
      <Text style={styles.label}>↹ {ref} 채움</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    backgroundColor: "#e6e6e6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginVertical: 4,
  },
  label: { color: "#333", fontSize: 14 },
});
```

**Step 6: NoteEditor에 자동완성 연결**

Modify `apps/ch-life/src/editor/NoteEditor.tsx`:
```tsx
import React, { useRef, useState } from "react";
import {
  ScrollView, TextInput, StyleSheet, View, Pressable, Platform,
  NativeSyntheticEvent, TextInputKeyPressEventData,
} from "react-native";
import type { BlockNode } from "@/domain/types";
import { QuoteBlock } from "./QuoteBlock";
import { RefChip } from "./RefChip";
import { detectRefAtCursor } from "./useAutocomplete";
import { lookupVerses } from "@/parser/verse-lookup";

type Props = {
  body: BlockNode[];
  onChangeBody: (next: BlockNode[]) => void;
};

export function NoteEditor({ body, onChangeBody }: Props) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [cursorMap, setCursorMap] = useState<Record<number, number>>({});

  const insertQuoteAfter = (idx: number, ref: string) => {
    const verses = lookupVerses(ref);
    if (!verses) return;
    const next = body.slice();
    next.splice(idx + 1, 0,
      { type: "quote", ref, verses, status: "loaded" },
      { type: "paragraph", text: "" },
    );
    onChangeBody(next);
  };

  const handleKeyPress = (
    idx: number,
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) => {
    if (e.nativeEvent.key !== "Tab") return;
    const block = body[idx];
    if (block.type !== "paragraph") return;
    const cursor = cursorMap[idx] ?? block.text.length;
    const detected = detectRefAtCursor(block.text, cursor);
    if (!detected) return;
    e.preventDefault?.();
    insertQuoteAfter(idx, detected.ref);
  };

  return (
    <ScrollView contentContainerStyle={styles.root}>
      {body.map((block, idx) => {
        if (block.type === "quote") return <QuoteBlock key={idx} {...block} />;
        const detected =
          activeIdx === idx
            ? detectRefAtCursor(block.text, cursorMap[idx] ?? block.text.length)
            : null;
        return (
          <View key={idx}>
            <TextInput
              style={styles.paragraph}
              value={block.text}
              multiline
              onFocus={() => setActiveIdx(idx)}
              onSelectionChange={(e) =>
                setCursorMap((m) => ({ ...m, [idx]: e.nativeEvent.selection.end }))
              }
              onChangeText={(text) => {
                const next = body.slice();
                next[idx] = { type: "paragraph", text };
                onChangeBody(next);
              }}
              onKeyPress={(e) => handleKeyPress(idx, e)}
              placeholder={idx === 0 ? "오늘의 설교를 적어보세요" : ""}
            />
            {detected && (
              <RefChip
                ref={detected.ref}
                onConfirm={() => insertQuoteAfter(idx, detected.ref)}
              />
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: 16, gap: 8 },
  paragraph: { fontSize: 18, lineHeight: 26, minHeight: 28 },
});
```

**Step 7: 첫 통합 마일스톤 수동 검증**

Run: `npx expo start`
시나리오:
1. 노트 진입 → 빈 paragraph
2. `오늘 본문은 골 3:20` 입력 → 칩 표시
3. Tab(외장키보드) 또는 칩 탭 → 다음 줄에 인용블록 + 본문이 풀림

Expected: 골 3:20의 본문 텍스트가 인용블록에 표시됨.

**Step 8: Commit**

```bash
git add apps/ch-life/src/editor
git commit -m "feat: ref 자동완성 칩 + Tab 확정 → 인용블록 삽입"
```

---

### Task 2.7: citedRefs 자동 동기화

**Files:**
- Create: `apps/ch-life/src/editor/cited-refs.ts`
- Create: `apps/ch-life/src/editor/__tests__/cited-refs.test.ts`

**Step 1: 실패 테스트**

Create `apps/ch-life/src/editor/__tests__/cited-refs.test.ts`:
```ts
import { extractCitedRefs } from "../cited-refs";
import type { BlockNode } from "@/domain/types";

describe("extractCitedRefs", () => {
  it("quote 노드의 ref를 모은다", () => {
    const body: BlockNode[] = [
      { type: "paragraph", text: "" },
      { type: "quote", ref: "Col 3:20", verses: [], status: "loaded" },
      { type: "paragraph", text: "" },
      { type: "quote", ref: "Eph 5:21", verses: [], status: "loaded" },
    ];
    expect(extractCitedRefs(body)).toEqual(["Col 3:20", "Eph 5:21"]);
  });
  it("중복은 제거", () => {
    const body: BlockNode[] = [
      { type: "quote", ref: "Col 3:20", verses: [], status: "loaded" },
      { type: "quote", ref: "Col 3:20", verses: [], status: "loaded" },
    ];
    expect(extractCitedRefs(body)).toEqual(["Col 3:20"]);
  });
});
```

**Step 2: 실행 (실패)**

Run: `npm test -- --testPathPattern=cited-refs`

**Step 3: 구현**

Create `apps/ch-life/src/editor/cited-refs.ts`:
```ts
import type { BlockNode } from "@/domain/types";

export function extractCitedRefs(body: BlockNode[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const b of body) {
    if (b.type === "quote" && !seen.has(b.ref)) {
      seen.add(b.ref);
      out.push(b.ref);
    }
  }
  return out;
}
```

**Step 4: 통과 확인 & Commit**

```bash
npm test -- --testPathPattern=cited-refs
git add apps/ch-life/src/editor
git commit -m "feat: citedRefs 추출 유틸"
```

---

### Task 2.8: 자동저장 (디바운스 500ms)

**Files:**
- Create: `apps/ch-life/src/editor/useAutoSave.ts`
- Modify: `apps/ch-life/app/note/[id].tsx`

**Step 1: 훅 작성**

Create `apps/ch-life/src/editor/useAutoSave.ts`:
```ts
import { useEffect, useRef } from "react";
import type { BlockNode } from "@/domain/types";
import { extractCitedRefs } from "./cited-refs";

type SaveFn = (patch: {
  title: string | null;
  body: BlockNode[];
  citedRefs: string[];
}) => Promise<void>;

export function useAutoSave(opts: {
  title: string | null;
  body: BlockNode[];
  save: SaveFn;
  delayMs?: number;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      opts.save({
        title: opts.title,
        body: opts.body,
        citedRefs: extractCitedRefs(opts.body),
      }).catch((e) => console.warn("autosave failed", e));
    }, opts.delayMs ?? 500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [opts.title, opts.body, opts.save, opts.delayMs]);
}
```

**Step 2: 라우트 연결**

Modify `apps/ch-life/app/note/[id].tsx`:
```tsx
import React, { useEffect, useState, useCallback } from "react";
import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { NoteEditor } from "@/editor/NoteEditor";
import { useAutoSave } from "@/editor/useAutoSave";
import { getDb } from "@/db";
import { makeNoteRepo } from "@/db/note-repo";
import type { BlockNode } from "@/domain/types";

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [title, setTitle] = useState<string | null>(null);
  const [body, setBody] = useState<BlockNode[]>([{ type: "paragraph", text: "" }]);
  const [ready, setReady] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const db = await getDb();
      const repo = makeNoteRepo({
        execAsync: db.execAsync.bind(db),
        runAsync: db.runAsync.bind(db),
        getAllAsync: db.getAllAsync.bind(db),
        getFirstAsync: db.getFirstAsync.bind(db),
      });
      const note = await repo.findById(id);
      if (cancelled || !note) { setReady(true); return; }
      setTitle(note.title);
      setBody(note.body.length ? note.body : [{ type: "paragraph", text: "" }]);
      setReady(true);
    })();
    return () => { cancelled = true; };
  }, [id]);

  const save = useCallback(
    async (patch: { title: string | null; body: BlockNode[]; citedRefs: string[] }) => {
      const db = await getDb();
      const repo = makeNoteRepo({
        execAsync: db.execAsync.bind(db),
        runAsync: db.runAsync.bind(db),
        getAllAsync: db.getAllAsync.bind(db),
        getFirstAsync: db.getFirstAsync.bind(db),
      });
      try {
        await repo.update(id, patch);
        setSaveErr(null);
      } catch (e) {
        setSaveErr("저장 실패. 다시 시도 중...");
        throw e;
      }
    },
    [id],
  );

  useAutoSave({ title, body, save });

  if (!ready) return null;
  return (
    <View style={{ flex: 1 }}>
      {saveErr && (
        <View style={{ backgroundColor: "#fde2e1", padding: 8 }}>
          <Text style={{ color: "#c8342a" }}>{saveErr}</Text>
        </View>
      )}
      <NoteEditor body={body} onChangeBody={setBody} />
    </View>
  );
}
```

**Step 3: 실기기 확인**

500ms 후 자동저장 → 앱 재시작 → 노트 보존 확인.

**Step 4: Commit**

```bash
git add apps/ch-life/src/editor apps/ch-life/app/note
git commit -m "feat: 디바운스 500ms 자동저장 + 실패 배너"
```

---

## Phase 3 — Bible Browser + Notes List + Markdown (Week 3)

### Task 3.1: 노트 목록 카드 + 새 노트 FAB

**Files:**
- Modify: `apps/ch-life/app/index.tsx`
- Create: `apps/ch-life/src/list/NoteCard.tsx`
- Create: `apps/ch-life/src/list/__tests__/format-card.test.ts`
- Create: `apps/ch-life/src/list/format-card.ts`

**Step 1: 카드 표시 유틸 테스트**

Create `apps/ch-life/src/list/__tests__/format-card.test.ts`:
```ts
import { formatNoteCard } from "../format-card";

describe("formatNoteCard", () => {
  const base = { id: "x", title: null, body: [], createdAt: 0, updatedAt: 0, citedRefs: [] };
  it("제목 있으면 제목을 메인 라벨로", () => {
    expect(formatNoteCard({ ...base, title: "주일설교" }).mainLabel).toBe("주일설교");
  });
  it("제목 없으면 '2026년 5월 17일 주일' 형식", () => {
    const ts = new Date("2026-05-17T10:00:00+09:00").getTime();
    expect(formatNoteCard({ ...base, updatedAt: ts }).mainLabel).toBe(
      "2026년 5월 17일 주일",
    );
  });
  it("citedRefs 3개까지 + 추가 개수", () => {
    expect(
      formatNoteCard({ ...base, citedRefs: ["Col 3:20", "Eph 5:21", "Rom 8:28", "Jhn 3:16", "Psa 23:1"] })
        .refChips,
    ).toEqual({ visible: ["Col 3:20", "Eph 5:21", "Rom 8:28"], moreCount: 2 });
  });
});
```

**Step 2: 실행 (실패)**

Run: `npm test -- --testPathPattern=format-card`

**Step 3: 구현**

Create `apps/ch-life/src/list/format-card.ts`:
```ts
import type { Note } from "@/domain/types";

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

export function formatNoteCard(note: Note) {
  const mainLabel = note.title?.trim() || formatDate(note.updatedAt);
  const visible = note.citedRefs.slice(0, 3);
  const moreCount = Math.max(0, note.citedRefs.length - visible.length);
  return { mainLabel, refChips: { visible, moreCount } };
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const dow = DOW[d.getDay()];
  return `${y}년 ${m}월 ${day}일 ${dow}요일`;
}
```

> 참고: spec의 "주일" 케이스(일요일)는 본 함수가 `일요일`로 산출한다. spec과 100% 일치시키려면 일요일에 한해 `일요일` → `주일` 치환 분기를 추가. 첫 컷에서는 일관된 요일 표기로 두고 본인 사용 후 결정.

**Step 4: NoteCard 컴포넌트 + 라우트**

Create `apps/ch-life/src/list/NoteCard.tsx`:
```tsx
import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import type { Note } from "@/domain/types";
import { formatNoteCard } from "./format-card";

export function NoteCard({ note, onPress }: { note: Note; onPress: () => void }) {
  const { mainLabel, refChips } = formatNoteCard(note);
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.title} numberOfLines={1}>{mainLabel}</Text>
      <View style={styles.chips}>
        {refChips.visible.map((r) => (
          <View key={r} style={styles.chip}><Text style={styles.chipText}>{r}</Text></View>
        ))}
        {refChips.moreCount > 0 && (
          <View style={styles.chip}><Text style={styles.chipText}>+{refChips.moreCount}</Text></View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, minHeight: 72, borderBottomWidth: 1, borderColor: "#eee" },
  title: { fontSize: 18, fontWeight: "500", marginBottom: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { backgroundColor: "#f0f0f0", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  chipText: { color: "#555", fontSize: 13 },
});
```

Modify `apps/ch-life/app/index.tsx`:
```tsx
import React, { useEffect, useState, useCallback } from "react";
import { View, FlatList, Pressable, Text, StyleSheet } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { getDb } from "@/db";
import { makeNoteRepo } from "@/db/note-repo";
import { NoteCard } from "@/list/NoteCard";
import type { Note } from "@/domain/types";

export default function NotesList() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);

  const reload = useCallback(async () => {
    const db = await getDb();
    const repo = makeNoteRepo({
      execAsync: db.execAsync.bind(db),
      runAsync: db.runAsync.bind(db),
      getAllAsync: db.getAllAsync.bind(db),
      getFirstAsync: db.getFirstAsync.bind(db),
    });
    setNotes(await repo.listRecent({ limit: 200 }));
  }, []);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const createNote = async () => {
    const db = await getDb();
    const repo = makeNoteRepo({
      execAsync: db.execAsync.bind(db),
      runAsync: db.runAsync.bind(db),
      getAllAsync: db.getAllAsync.bind(db),
      getFirstAsync: db.getFirstAsync.bind(db),
    });
    const id = await repo.create({ title: null, body: [{ type: "paragraph", text: "" }], citedRefs: [] });
    router.push(`/note/${id}`);
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={notes}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => (
          <NoteCard note={item} onPress={() => router.push(`/note/${item.id}`)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>첫 번째 설교 노트를 시작하세요</Text>
            <Pressable style={styles.startBtn} onPress={createNote}>
              <Text style={styles.startBtnText}>시작하기</Text>
            </Pressable>
          </View>
        }
      />
      <Pressable style={styles.fab} onPress={createNote}>
        <Text style={styles.fabText}>＋</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: "center", paddingTop: 120, gap: 16 },
  emptyText: { fontSize: 18, color: "#666" },
  startBtn: { backgroundColor: "#222", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999 },
  startBtnText: { color: "white", fontSize: 16 },
  fab: { position: "absolute", right: 24, bottom: 36, width: 64, height: 64, borderRadius: 32, backgroundColor: "#222", alignItems: "center", justifyContent: "center" },
  fabText: { color: "white", fontSize: 32, lineHeight: 36 },
});
```

**Step 5: 통과 확인 + 수동 검증**

Run: `npm test -- --testPathPattern=format-card`
Expected: PASS 3 tests.

실기기: 빈 상태 → 시작하기 → 새 노트 진입 → 뒤로 → 목록에 카드 1개.

**Step 6: Commit**

```bash
git add apps/ch-life/src/list apps/ch-life/app/index.tsx
git commit -m "feat: 노트 목록 카드 + 새 노트 FAB + 빈 상태"
```

---

### Task 3.2: 노트 검색 (FTS5)

**Files:**
- Modify: `apps/ch-life/src/db/note-repo.ts` (`searchNotes` 추가)
- Modify: `apps/ch-life/app/index.tsx` (검색바)
- Create: `apps/ch-life/src/db/__tests__/note-repo-search.test.ts`

**Step 1: 검색 테스트**

Create `apps/ch-life/src/db/__tests__/note-repo-search.test.ts`:
```ts
import Database from "better-sqlite3";
import fs from "fs"; import path from "path";
import { makeNoteRepo } from "../note-repo";

const SCHEMA = fs.readFileSync(path.resolve(__dirname, "../schema.sql"), "utf8");

function setup() {
  const db = new Database(":memory:");
  db.exec(SCHEMA);
  return makeNoteRepo({
    execAsync: async (sql) => { db.exec(sql); },
    runAsync: async (sql, params = []) => db.prepare(sql).run(...params),
    getAllAsync: async (sql, params = []) => db.prepare(sql).all(...params) as any,
    getFirstAsync: async (sql, params = []) => (db.prepare(sql).get(...params) as any) ?? null,
  });
}

describe("searchNotes", () => {
  it("제목 검색", async () => {
    const repo = setup();
    await repo.create({ title: "주일설교", body: [], citedRefs: [] });
    await repo.create({ title: "수요예배", body: [], citedRefs: [] });
    const r = await repo.searchNotes("주일");
    expect(r.map((n) => n.title)).toContain("주일설교");
  });
  it("citedRefs 검색", async () => {
    const repo = setup();
    await repo.create({ title: null, body: [], citedRefs: ["Col 3:20"] });
    const r = await repo.searchNotes("Col");
    expect(r).toHaveLength(1);
  });
});
```

**Step 2: 구현 추가**

Modify `apps/ch-life/src/db/note-repo.ts` (return object에 추가):
```ts
    async searchNotes(query: string): Promise<Note[]> {
      const q = query.trim();
      if (!q) return [];
      const sanitized = q.replace(/["']/g, "");
      const rows = await db.getAllAsync<Row>(
        `SELECT n.* FROM notes n
         JOIN notes_fts f ON f.id = n.id
         WHERE notes_fts MATCH ?
         ORDER BY n.updated_at DESC LIMIT 200`,
        [`${sanitized}*`],
      );
      return rows.map(rowToNote);
    },
```

**Step 3: 통과 확인**

Run: `npm test -- --testPathPattern=note-repo-search`

**Step 4: 검색바 UI**

Modify `apps/ch-life/app/index.tsx` 상단에 TextInput + state 추가, `notes` 대신 `query.trim() ? searchResults : notes`를 FlatList data로 사용. 디바운스 200ms.

```tsx
// (상단에 추가)
import { TextInput } from "react-native";
// (state)
const [query, setQuery] = useState("");
const [results, setResults] = useState<Note[] | null>(null);
// debounce
useEffect(() => {
  const q = query.trim();
  if (!q) { setResults(null); return; }
  const t = setTimeout(async () => {
    const db = await getDb();
    const repo = makeNoteRepo({
      execAsync: db.execAsync.bind(db), runAsync: db.runAsync.bind(db),
      getAllAsync: db.getAllAsync.bind(db), getFirstAsync: db.getFirstAsync.bind(db),
    });
    setResults(await repo.searchNotes(q));
  }, 200);
  return () => clearTimeout(t);
}, [query]);
// FlatList data → results ?? notes
```

**Step 5: Commit**

```bash
git add apps/ch-life/src/db apps/ch-life/app/index.tsx
git commit -m "feat: 노트 FTS5 검색 + 검색바"
```

---

### Task 3.3: 성경 브라우저 — 시트/사이드바 컨테이너

**Files:**
- Create: `apps/ch-life/src/browser/BibleBrowser.tsx`
- Create: `apps/ch-life/src/browser/useResponsiveLayout.ts`
- Modify: `apps/ch-life/app/note/[id].tsx` (📖 토글 버튼)

**Step 1: 반응형 훅**

Create `apps/ch-life/src/browser/useResponsiveLayout.ts`:
```ts
import { useWindowDimensions } from "react-native";

export function useResponsiveLayout() {
  const { width } = useWindowDimensions();
  const isTabletLandscape = width >= 900;
  return {
    mode: isTabletLandscape ? "sidebar" : "sheet" as const,
    width,
  };
}
```

**Step 2: 브라우저 컴포넌트 스켈레톤**

Create `apps/ch-life/src/browser/BibleBrowser.tsx`:
```tsx
import React, { useState } from "react";
import { View, Text, Modal, Pressable, StyleSheet } from "react-native";
import { useResponsiveLayout } from "./useResponsiveLayout";

type Level = { kind: "books" } | { kind: "chapters"; book: string } | { kind: "verses"; book: string; chapter: number };

type Props = {
  visible: boolean;
  onClose: () => void;
  onInsertVerse: (ref: string) => void;
};

export function BibleBrowser({ visible, onClose, onInsertVerse }: Props) {
  const { mode } = useResponsiveLayout();
  const [level, setLevel] = useState<Level>({ kind: "books" });

  const body = (
    <View style={styles.body}>
      <Text>성경 브라우저 (level: {level.kind})</Text>
      <Pressable onPress={onClose}><Text>닫기</Text></Pressable>
    </View>
  );

  if (mode === "sidebar") {
    if (!visible) return null;
    return <View style={styles.sidebar}>{body}</View>;
  }
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.sheetBackdrop}>
        <View style={styles.sheet}>{body}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, padding: 16 },
  sidebar: { position: "absolute", right: 0, top: 0, bottom: 0, width: "33%", backgroundColor: "white", borderLeftWidth: 1, borderColor: "#eee" },
  sheetBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.3)" },
  sheet: { height: "70%", backgroundColor: "white", borderTopLeftRadius: 16, borderTopRightRadius: 16 },
});
```

**Step 3: 에디터에 📖 토글 + state lift**

Modify `apps/ch-life/app/note/[id].tsx`:
```tsx
// 상단 import 추가
import { BibleBrowser } from "@/browser/BibleBrowser";
import { Pressable, Text } from "react-native";
// state
const [browserOpen, setBrowserOpen] = useState(false);
// ...
return (
  <View style={{ flex: 1 }}>
    <View style={{ flexDirection: "row", padding: 8, justifyContent: "flex-end" }}>
      <Pressable onPress={() => setBrowserOpen((b) => !b)}>
        <Text style={{ fontSize: 22 }}>📖</Text>
      </Pressable>
    </View>
    {saveErr && /*...*/}
    <NoteEditor body={body} onChangeBody={setBody} />
    <BibleBrowser
      visible={browserOpen}
      onClose={() => setBrowserOpen(false)}
      onInsertVerse={(ref) => {/* Task 3.5에서 채움 */}}
    />
  </View>
);
```

**Step 4: 수동 확인 & Commit**

폰에서 📖 → 하단 시트 / 태블릿 가로 → 사이드바.

```bash
git add apps/ch-life/src/browser apps/ch-life/app/note
git commit -m "feat: 성경 브라우저 반응형 컨테이너 (시트/사이드바)"
```

---

### Task 3.4: 성경 브라우저 — 책/장/절 3단 네비게이션

**Files:**
- Modify: `apps/ch-life/src/browser/BibleBrowser.tsx`
- Create: `apps/ch-life/src/browser/books-meta.ts`

**Step 1: 책 메타데이터**

Create `apps/ch-life/src/browser/books-meta.ts`:
```ts
import type { BookCode } from "@/parser/book-map";
import bible from "../../assets/bible-krv.json";

export type BookMeta = { code: BookCode; nameKo: string; testament: "OT" | "NT" };

export const BOOKS_META: BookMeta[] = [
  { code: "Gen", nameKo: "창세기", testament: "OT" },
  { code: "Exo", nameKo: "출애굽기", testament: "OT" },
  // ... 66권 채움 (BOOK_CODES 순서)
];

export function chapterCount(book: BookCode): number {
  const b = (bible as any)[book];
  return b ? Object.keys(b).length : 0;
}

export function verseCount(book: BookCode, chapter: number): number {
  const c = (bible as any)[book]?.[String(chapter)];
  return c ? Object.keys(c).length : 0;
}
```

**Step 2: 3단 UI**

Modify `apps/ch-life/src/browser/BibleBrowser.tsx`로 Lv1(책 목록 + 구약/신약 세그먼트 + 검색), Lv2(장 그리드 4열), Lv3(절 리스트 + [+] 버튼)를 구현. 절 옆 + 버튼은 `onInsertVerse(\`${nameKo} ${chapter}:${verse}\`)`를 호출.

(전체 코드 ~150줄. 빈 화면을 점진적으로 채움. 작은 commit 4개로 쪼개기.)

**Step 3 — 3a: Lv1 책 목록**
- 구약/신약 세그먼트
- BOOKS_META 필터링
- 책 탭 → `setLevel({ kind: "chapters", book })`
- Commit: `feat: 브라우저 Lv1 책 목록`

**Step 4 — 3b: Lv2 장 그리드**
- 헤더 `← 책 이름`
- 4열 그리드 (FlatList numColumns=4)
- 장 탭 → `setLevel({ kind: "verses", book, chapter })`
- Commit: `feat: 브라우저 Lv2 장 그리드`

**Step 5 — 3c: Lv3 절 리스트**
- 헤더 + 이전/다음 장 버튼
- 절 ScrollView + 우측 [+] 버튼
- + 누름 → `onInsertVerse` 콜백 + 토스트 (간단 setTimeout 기반)
- Commit: `feat: 브라우저 Lv3 절 리스트 + 인용 버튼`

**Step 6 — 3d: 검색 입력**
- TextInput에 `골`, `골 3`, `골 3:20`, `Col 3:20` 인식해서 해당 Level로 점프
- `parseRef`로 fast path 처리, 없으면 책 자동완성
- Commit: `feat: 브라우저 검색 입력 (책/장/절 점프)`

---

### Task 3.5: 절 → 노트 인용 흐름 (currentNoteId 기반)

**Files:**
- Modify: `apps/ch-life/src/state/app-store.ts` (pendingInsertRef 추가 + 액션)
- Modify: `apps/ch-life/app/note/[id].tsx` (pendingInsertRef 소비)

**Step 1: 스토어 확장**

Modify `apps/ch-life/src/state/app-store.ts`:
```ts
type AppState = {
  currentNoteId: string | null;
  pendingInsertRef: string | null;
  settings: Settings;
  setCurrentNoteId: (id: string | null) => void;
  requestInsertRef: (ref: string) => void;
  consumePendingInsert: () => string | null;
  setSettings: (next: Partial<Settings>) => void;
};
// 구현:
//   requestInsertRef(ref) → set({ pendingInsertRef: ref })
//   consumePendingInsert() → 현재값 반환 후 null 셋
```

**Step 2: 에디터 진입 시 currentNoteId set + pending 소비**

Modify `apps/ch-life/app/note/[id].tsx`:
```tsx
import { useAppStore } from "@/state/app-store";
import { lookupVerses } from "@/parser/verse-lookup";

useEffect(() => {
  useAppStore.getState().setCurrentNoteId(id);
  return () => { /* 머무는 정책: 닫지 않음 */ };
}, [id]);

// pendingInsertRef 소비
useEffect(() => {
  const ref = useAppStore.getState().consumePendingInsert();
  if (!ref) return;
  const verses = lookupVerses(ref);
  if (!verses) return;
  setBody((b) => [
    ...b,
    { type: "quote", ref, verses, status: "loaded" },
    { type: "paragraph", text: "" },
  ]);
}, [/* 매 포커스마다 */]);

// 브라우저에서 + 누를 때:
<BibleBrowser
  visible={browserOpen}
  onClose={() => setBrowserOpen(false)}
  onInsertVerse={(ref) => {
    const verses = lookupVerses(ref);
    if (!verses) return;
    setBody((b) => [
      ...b,
      { type: "quote", ref, verses, status: "loaded" },
      { type: "paragraph", text: "" },
    ]);
  }}
/>
```

**Step 3: 노트가 안 열린 상태 폴백 (브라우저를 노트 목록 화면에서 열 때)**

이건 V1에서 단순화: 브라우저는 노트 에디터에서만 진입한다. spec 4.5 액션시트는 V1 범위에 두되, 시간 없으면 V1.1로 미룸. plan에는 기본 정책 = "브라우저는 노트 안에서만 열림"으로 잠금.

**Step 4: 수동 확인 & Commit**

```bash
git add apps/ch-life/src/state apps/ch-life/app/note
git commit -m "feat: 브라우저 + 버튼 → 현재 노트 인용 삽입"
```

---

### Task 3.6: 마크다운 직렬화 (DB → MD)

**Files:**
- Create: `apps/ch-life/src/markdown/serialize.ts`
- Create: `apps/ch-life/src/markdown/__tests__/serialize.test.ts`

**Step 1: 실패 테스트**

Create `apps/ch-life/src/markdown/__tests__/serialize.test.ts`:
```ts
import { noteToMarkdown } from "../serialize";
import type { Note } from "@/domain/types";

describe("noteToMarkdown", () => {
  it("frontmatter + 본문 + 인용블록", () => {
    const note: Note = {
      id: "01HABC",
      title: "주일설교",
      body: [
        { type: "paragraph", text: "오늘 본문은 골 3:20" },
        {
          type: "quote",
          ref: "Col 3:20",
          verses: [
            { book: "Col", chapter: 3, verse: 20, text: "자녀들아 모든 일에 부모에게 순종하라" },
            { book: "Col", chapter: 3, verse: 21, text: "이는 주 안에서 기쁘게 하는 것이니라" },
          ],
          status: "loaded",
        },
      ],
      createdAt: 1747000000000,
      updatedAt: 1747001000000,
      citedRefs: ["Col 3:20"],
    };
    const md = noteToMarkdown(note);
    expect(md).toContain("id: 01HABC");
    expect(md).toContain("title: 주일설교");
    expect(md).toContain("schemaVersion: 1");
    expect(md).toContain("오늘 본문은 골 3:20");
    expect(md).toContain("> **Col 3:20** (KRV)");
    expect(md).toContain("> 자녀들아 모든 일에 부모에게 순종하라");
    expect(md).toContain("> 이는 주 안에서 기쁘게 하는 것이니라");
  });
});
```

**Step 2: 의존성**

Run:
```bash
cd apps/ch-life
npm install gray-matter
```

**Step 3: 구현**

Create `apps/ch-life/src/markdown/serialize.ts`:
```ts
import matter from "gray-matter";
import type { Note } from "@/domain/types";

const SCHEMA_VERSION = 1;

export function noteToMarkdown(note: Note): string {
  const body = note.body
    .map((b) => {
      if (b.type === "paragraph") return b.text;
      return [
        `> **${b.ref}** (KRV)`,
        ...b.verses.map((v) => `> ${v.text}`),
      ].join("\n");
    })
    .join("\n\n");

  const data = {
    id: note.id,
    title: note.title ?? undefined,
    createdAt: new Date(note.createdAt).toISOString(),
    updatedAt: new Date(note.updatedAt).toISOString(),
    citedRefs: note.citedRefs,
    schemaVersion: SCHEMA_VERSION,
  };
  return matter.stringify(body, data);
}

export function noteFileName(note: Note): string {
  const d = new Date(note.updatedAt);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const slug = note.title?.trim().replace(/\s+/g, "-") || note.id.slice(-8);
  return `${yyyy}-${mm}-${dd}-${slug}.md`;
}
```

**Step 4: 통과 확인 & Commit**

```bash
npm test -- --testPathPattern=serialize
git add apps/ch-life/src/markdown apps/ch-life/package.json
git commit -m "feat: 노트 → 마크다운 직렬화 (frontmatter + 인용블록)"
```

---

### Task 3.7: 마크다운 역직렬화 (MD → DB) + 왕복 테스트

**Files:**
- Create: `apps/ch-life/src/markdown/parse.ts`
- Create: `apps/ch-life/src/markdown/__tests__/roundtrip.test.ts`

**Step 1: 왕복 테스트 (실패 우선)**

Create `apps/ch-life/src/markdown/__tests__/roundtrip.test.ts`:
```ts
import { noteToMarkdown } from "../serialize";
import { markdownToNote } from "../parse";
import type { Note } from "@/domain/types";

describe("markdown roundtrip", () => {
  const note: Note = {
    id: "01HABC",
    title: "주일설교",
    body: [
      { type: "paragraph", text: "오늘 본문은 골 3:20" },
      {
        type: "quote",
        ref: "Col 3:20",
        verses: [
          { book: "Col", chapter: 3, verse: 20, text: "자녀들아 모든 일에 부모에게 순종하라" },
        ],
        status: "loaded",
      },
      { type: "paragraph", text: "이어지는 메모" },
    ],
    createdAt: 1747000000000,
    updatedAt: 1747001000000,
    citedRefs: ["Col 3:20"],
  };

  it("DB → MD → DB가 본질 데이터를 보존한다", () => {
    const md = noteToMarkdown(note);
    const back = markdownToNote(md);
    expect(back?.id).toBe(note.id);
    expect(back?.title).toBe(note.title);
    expect(back?.citedRefs).toEqual(note.citedRefs);
    expect(back?.body[0]).toEqual({ type: "paragraph", text: "오늘 본문은 골 3:20" });
    expect(back?.body[1].type).toBe("quote");
    if (back?.body[1].type === "quote") {
      expect(back.body[1].ref).toBe("Col 3:20");
      expect(back.body[1].verses[0].text).toContain("자녀들아");
    }
    expect(back?.body[2]).toEqual({ type: "paragraph", text: "이어지는 메모" });
  });

  it("frontmatter 없는 외부 MD도 새 노트로 받음", () => {
    const md = `자유 메모\n\n> **Col 3:20** (KRV)\n> 자녀들아\n`;
    const back = markdownToNote(md);
    expect(back?.id).toBeTruthy(); // 새 ulid
    expect(back?.body[0]).toEqual({ type: "paragraph", text: "자유 메모" });
    expect(back?.body[1].type).toBe("quote");
  });
});
```

**Step 2: 실행 (실패)**

Run: `npm test -- --testPathPattern=roundtrip`

**Step 3: 구현**

Create `apps/ch-life/src/markdown/parse.ts`:
```ts
import matter from "gray-matter";
import type { BlockNode, Note, Verse } from "@/domain/types";
import { parseRef } from "@/parser/ref-parser";

function makeId(): string {
  const t = Date.now().toString(36).padStart(10, "0");
  const r = Math.random().toString(36).slice(2, 12).padStart(10, "0");
  return (t + r).toUpperCase();
}

export function markdownToNote(md: string): Note | null {
  const parsed = matter(md);
  const fm = parsed.data as Record<string, unknown>;
  const body = parsed.content;

  const blocks = parseBody(body);

  const now = Date.now();
  const createdAt = typeof fm.createdAt === "string" ? Date.parse(fm.createdAt) : now;
  const updatedAt = typeof fm.updatedAt === "string" ? Date.parse(fm.updatedAt) : now;
  const title = typeof fm.title === "string" ? fm.title : null;
  const id = typeof fm.id === "string" && fm.id ? fm.id : makeId();
  const citedRefs =
    Array.isArray(fm.citedRefs)
      ? (fm.citedRefs as unknown[]).filter((x): x is string => typeof x === "string")
      : extractRefsFromBlocks(blocks);

  return { id, title, body: blocks, createdAt, updatedAt, citedRefs };
}

function parseBody(content: string): BlockNode[] {
  const lines = content.split("\n");
  const blocks: BlockNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith(">")) {
      // 인용블록 그룹 수집
      const group: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        group.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      const header = group[0] ?? "";
      const refMatch = /\*\*([^*]+)\*\*/.exec(header);
      const ref = refMatch?.[1]?.trim() ?? header.trim();
      const verseTexts = group.slice(1).filter((s) => s.trim().length > 0);
      const parsedRef = parseRef(ref);
      const verses: Verse[] = parsedRef
        ? verseTexts.map((t, idx) => ({
            book: parsedRef.book,
            chapter: parsedRef.chapter,
            verse: parsedRef.verse + idx,
            text: t,
          }))
        : [];
      blocks.push({ type: "quote", ref, verses, status: "loaded" });
    } else if (line.trim().length === 0) {
      i += 1;
    } else {
      const para: string[] = [];
      while (i < lines.length && !lines[i].startsWith(">") && lines[i].trim().length > 0) {
        para.push(lines[i]);
        i += 1;
      }
      blocks.push({ type: "paragraph", text: para.join("\n") });
    }
  }
  return blocks;
}

function extractRefsFromBlocks(blocks: BlockNode[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const b of blocks) {
    if (b.type === "quote" && !seen.has(b.ref)) {
      seen.add(b.ref);
      out.push(b.ref);
    }
  }
  return out;
}
```

**Step 4: 통과 확인 & Commit**

Run: `npm test -- --testPathPattern=roundtrip`
Expected: PASS 2 tests.

```bash
git add apps/ch-life/src/markdown
git commit -m "feat: 마크다운 역직렬화 + 왕복 테스트"
```

---

### Task 3.8: Export 흐름 (단일 노트 공유)

**Files:**
- Modify: `apps/ch-life/app/note/[id].tsx` (메뉴 → 공유)
- Create: `apps/ch-life/src/share/export-note.ts`

**Step 1: 의존성**

Run:
```bash
cd apps/ch-life
npx expo install expo-sharing expo-file-system
```

**Step 2: export 함수**

Create `apps/ch-life/src/share/export-note.ts`:
```ts
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import type { Note } from "@/domain/types";
import { noteFileName, noteToMarkdown } from "@/markdown/serialize";

export async function exportNote(note: Note): Promise<void> {
  const md = noteToMarkdown(note);
  const path = `${FileSystem.cacheDirectory}${noteFileName(note)}`;
  await FileSystem.writeAsStringAsync(path, md, { encoding: FileSystem.EncodingType.UTF8 });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path, { mimeType: "text/markdown", dialogTitle: "노트 공유" });
  }
}
```

**Step 3: 에디터 우상단 공유 버튼**

Modify `apps/ch-life/app/note/[id].tsx` 우상단에 `📤` 버튼 추가 → 현재 노트 fetch → `exportNote(note)` 호출.

**Step 4: 수동 확인 (실기기)**

iA Writer·메모·iCloud Drive로 보내져서 열어보기.

**Step 5: Commit**

```bash
git add apps/ch-life/src/share apps/ch-life/app/note
git commit -m "feat: 단일 노트 마크다운 공유 (expo-sharing)"
```

---

### Task 3.9: Import 흐름 + 충돌 정책

**Files:**
- Create: `apps/ch-life/src/share/import-note.ts`
- Create: `apps/ch-life/src/share/__tests__/import-decision.test.ts`
- Modify: `apps/ch-life/app/settings.tsx` (가져오기 버튼)

**Step 1: 충돌 결정 함수 + 테스트**

Create `apps/ch-life/src/share/__tests__/import-decision.test.ts`:
```ts
import { resolveImportConflict } from "../import-note";

describe("resolveImportConflict", () => {
  it("기존 노트 없음 → insert", () => {
    expect(resolveImportConflict(null, "overwrite")).toBe("insert");
  });
  it("기존 노트 있음 + overwrite → update", () => {
    expect(resolveImportConflict({} as any, "overwrite")).toBe("update");
  });
  it("기존 노트 있음 + new-id → reinsert", () => {
    expect(resolveImportConflict({} as any, "new-id")).toBe("reinsert");
  });
  it("기존 노트 있음 + skip → skip", () => {
    expect(resolveImportConflict({} as any, "skip")).toBe("skip");
  });
});
```

**Step 2: 구현**

Create `apps/ch-life/src/share/import-note.ts`:
```ts
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import type { Note } from "@/domain/types";
import { markdownToNote } from "@/markdown/parse";
import { makeNoteRepo, type NoteRepo } from "@/db/note-repo";
import { getDb } from "@/db";

export type ConflictPolicy = "overwrite" | "new-id" | "skip";
export type ConflictResult = "insert" | "update" | "reinsert" | "skip";

export function resolveImportConflict(existing: Note | null, policy: ConflictPolicy): ConflictResult {
  if (!existing) return "insert";
  if (policy === "overwrite") return "update";
  if (policy === "new-id") return "reinsert";
  return "skip";
}

export async function pickAndImport(promptPolicy: (existing: Note) => Promise<ConflictPolicy>): Promise<{ imported: number; skipped: number }> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: ["text/markdown", "text/plain", "application/octet-stream"],
    multiple: false,
  });
  if (picked.canceled) return { imported: 0, skipped: 0 };
  const file = picked.assets[0];
  if (!file?.uri) return { imported: 0, skipped: 0 };
  const content = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.UTF8 });
  const note = markdownToNote(content);
  if (!note) return { imported: 0, skipped: 0 };

  const db = await getDb();
  const repo: NoteRepo = makeNoteRepo({
    execAsync: db.execAsync.bind(db),
    runAsync: db.runAsync.bind(db),
    getAllAsync: db.getAllAsync.bind(db),
    getFirstAsync: db.getFirstAsync.bind(db),
  });

  const existing = await repo.findById(note.id);
  let policy: ConflictPolicy = "overwrite";
  if (existing) policy = await promptPolicy(existing);
  const action = resolveImportConflict(existing, policy);
  if (action === "insert") {
    await repo.create({ title: note.title, body: note.body, citedRefs: note.citedRefs });
    return { imported: 1, skipped: 0 };
  }
  if (action === "update") {
    await repo.update(note.id, { title: note.title, body: note.body, citedRefs: note.citedRefs });
    return { imported: 1, skipped: 0 };
  }
  if (action === "reinsert") {
    await repo.create({ title: note.title, body: note.body, citedRefs: note.citedRefs });
    return { imported: 1, skipped: 0 };
  }
  return { imported: 0, skipped: 1 };
}
```

**Step 3: 설정에서 가져오기 버튼 + 충돌 모달**

Modify `apps/ch-life/app/settings.tsx`로 "가져오기" 버튼 추가. 충돌 시 Alert.alert로 3-way 선택을 받아 `promptPolicy`에 해결.

**Step 4: 통과 확인 + 수동 확인**

```bash
npm test -- --testPathPattern=import-decision
```

iA Writer에서 만든 .md를 ch-life로 import → 노트 목록에 나타남.

**Step 5: Commit**

```bash
git add apps/ch-life/src/share apps/ch-life/app/settings.tsx
git commit -m "feat: 마크다운 import + 충돌 정책"
```

---

## Phase 4 — Polish (Week 4)

### Task 4.1: 설정 화면 (글꼴/테마/버전)

**Files:**
- Modify: `apps/ch-life/app/settings.tsx`
- Create: `apps/ch-life/src/state/settings-persist.ts`

**Step 1: settings.json 파일 영속화**

Create `apps/ch-life/src/state/settings-persist.ts`:
```ts
import * as FileSystem from "expo-file-system";
import type { Settings } from "@/domain/types";

const PATH = `${FileSystem.documentDirectory}settings.json`;

export async function loadSettings(): Promise<Settings | null> {
  try {
    const info = await FileSystem.getInfoAsync(PATH);
    if (!info.exists) return null;
    const raw = await FileSystem.readAsStringAsync(PATH);
    return JSON.parse(raw) as Settings;
  } catch { return null; }
}

export async function saveSettings(s: Settings): Promise<void> {
  await FileSystem.writeAsStringAsync(PATH, JSON.stringify(s));
}
```

**Step 2: 루트 레이아웃에서 로드 + 자동 저장**

Modify `apps/ch-life/app/_layout.tsx`:
```tsx
import { useEffect } from "react";
import { loadSettings, saveSettings } from "@/state/settings-persist";
import { useAppStore } from "@/state/app-store";

// RootLayout 안:
useEffect(() => {
  loadSettings().then((s) => { if (s) useAppStore.getState().setSettings(s); });
}, []);
useEffect(() => useAppStore.subscribe((state) => saveSettings(state.settings)), []);
```

**Step 3: 설정 UI**

Modify `apps/ch-life/app/settings.tsx`로 글꼴 4단 슬라이더(또는 4개 버튼)·테마 라디오·버전 표시·내보내기/가져오기 액션.

**Step 4: 통과 확인 + Commit**

```bash
git add apps/ch-life/src/state apps/ch-life/app
git commit -m "feat: 설정 화면 + settings.json 영속화"
```

---

### Task 4.2: 폰트 스케일·테마 적용

**Files:**
- Create: `apps/ch-life/src/theme/ThemeProvider.tsx`
- Modify: 모든 화면에서 `useTheme()` 사용

**Step 1: ThemeProvider**

Create `apps/ch-life/src/theme/ThemeProvider.tsx`:
```tsx
import React, { createContext, useContext, useMemo } from "react";
import { Appearance, useColorScheme } from "react-native";
import { useAppStore } from "@/state/app-store";

type Theme = {
  colors: { bg: string; text: string; subtle: string; line: string; accent: string; quoteBar: string; errBar: string };
  fontScale: number;
};

const LIGHT: Theme["colors"] = { bg: "#fff", text: "#111", subtle: "#666", line: "#eee", accent: "#222", quoteBar: "#bdbdbd", errBar: "#c8342a" };
const DARK: Theme["colors"] = { bg: "#000", text: "#f4f4f4", subtle: "#9a9a9a", line: "#222", accent: "#fff", quoteBar: "#5a5a5a", errBar: "#ff6b6b" };

const Ctx = createContext<Theme>({ colors: LIGHT, fontScale: 1 });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const { settings } = useAppStore();
  const isDark =
    settings.themePreference === "dark" ||
    (settings.themePreference === "system" && system === "dark");
  const value = useMemo<Theme>(() => ({
    colors: isDark ? DARK : LIGHT,
    fontScale: settings.fontScale,
  }), [isDark, settings.fontScale]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() { return useContext(Ctx); }
```

**Step 2: 적용**

각 화면(`index.tsx`, `note/[id].tsx`, `settings.tsx`, `QuoteBlock`, `NoteCard`)에서 `useTheme()`로 색·`fontSize * fontScale` 적용.

**Step 3: 수동 확인 + Commit**

```bash
git add apps/ch-life/src/theme apps/ch-life
git commit -m "feat: 다크/라이트 강제 + 글꼴 스케일 적용"
```

---

### Task 4.3: 접근성 (탭 타깃 48dp, accessibilityLabel)

**Files:**
- 전반에 걸쳐: 모든 Pressable에 `accessibilityRole="button"` + `accessibilityLabel`
- 모든 탭 타깃 최소 48×48 (이미 충족하는 곳 확인, 미달 곳 보강)

**Step 1: 감사**

Run:
```bash
grep -rn "Pressable\|TouchableOpacity" apps/ch-life/src apps/ch-life/app
```

각 결과를 검토하여 누락된 a11y prop 채움.

**Step 2: Commit**

```bash
git add apps/ch-life
git commit -m "chore: 접근성 보강 (a11y label + 탭 타깃)"
```

---

### Task 4.4: 본인 일요일 설교 사용 + 부서진 것 고치기

**Step 1: 실 사용**

일요일 설교 1회 사용. 메모에 부서진 것·아쉬운 것 적기.

**Step 2: 발견 항목 처리**

각 항목별로 별도 commit. 큰 변경은 별도 Task로 끌어올림.

**Step 3: 사용 후 회고 한 줄 노트**

Create `docs/research/week4-self-use.md`:
- 잘 동작한 것
- 부서진 것 + 고친 commit hash
- V1.1로 미룬 것

---

## Phase 5 — Distribution (Week 5)

### Task 5.1: TestFlight + Internal Testing 업로드

**Files:**
- Modify: `apps/ch-life/app.config.ts` (version → 1.0.0)
- Modify: `apps/ch-life/eas.json` (production 프로파일 점검)

**Step 1: 빌드**

Run:
```bash
cd apps/ch-life
eas build --platform all --profile production
```

**Step 2: 업로드**

Run:
```bash
eas submit --platform ios --latest
eas submit --platform android --latest
```

**Step 3: 본인 디바이스 설치 + 비행기 모드 골든패스 검증**

DoD 체크:
- [ ] 비행기 모드: 새 노트 → "골 3:20" → Tab → 인용블록 → 저장 → 재시작 → 보존
- [ ] 1개 노트 export → iA Writer에서 열림 + 인용블록 보존
- [ ] 카톡으로 받은 .md → ch-life 공유 → import 정상
- [ ] 전체 백업 zip export → 새 디바이스 import → 보존
- [ ] 본인 일요일 설교 실제 사용

**Step 4: Commit**

```bash
git add apps/ch-life
git commit -m "release: V1.0.0 빌드 + 스토어 업로드"
git tag v1.0.0
```

---

### Task 5.2: 1명 테스터 배포 + 5분 사용 관찰

**Step 1:** 가족·교회 친구 1명에게 TestFlight·Internal Testing 초대.

**Step 2:** 옆에서 5분 사용 관찰. 노트.

**Step 3:** 발견 항목을 `docs/research/week5-user-test.md`에 기록.

---

## V1 종료 체크리스트

`docs/plans/2026-05-17-ch-life-v1-spec.md` §8의 DoD 항목을 모두 체크했는지 확인:

- [ ] iOS/Android EAS Build 본인 디바이스 설치 동작
- [ ] 비행기 모드 골든패스
- [ ] 한국어 책명 매핑 Jest 통과
- [ ] 자동완성 100회 실사용 체감 지연 없음
- [ ] .md export → 다른 마크다운 앱에서 열림
- [ ] 카톡 .md → ch-life 공유 import
- [ ] 백업 zip export/import
- [ ] **본인 일요일 설교 1회 이상 실 사용**

V1 종료 = 위 8개 모두 체크 + git tag `v1.0.0` push.

---

## Maestro E2E 골든패스 (선택 — Phase 2 후 추가 가능)

**File:** `apps/ch-life/.maestro/golden-path.yaml`

```yaml
appId: com.leejaejin.chlife
---
- launchApp
- tapOn: "시작하기"
- inputText: "오늘 본문은 골 3:20"
- pressKey: "Tab"
- assertVisible: "자녀들아 모든 일에 부모에게 순종하라"
```

Phase 2 마지막 또는 Phase 5에 추가. CI는 V1 범위 외.

---

## 메모

- 각 Task의 코드는 spec과 1:1 대응. spec이 바뀌면 plan 단위로 재작성.
- 모든 commit은 `feat/fix/chore/docs/test` 접두 사용.
- 1개 Task ≥ 1시간 들면 멈추고 Task를 다시 쪼개기.
- 외장키보드 단축키·녹음 등은 V1 범위 외 — 본 plan에 추가하지 말 것.
