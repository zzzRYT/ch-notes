# 설교 메타데이터 헤더 (Sermon Meta Header) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 설교 편집기 상단에 설교 제목·날짜·설교자·장소·생명양식(본문 성경)을 입력·표시하는 항상 보이는 라벨 헤더를 추가하고, SQLite에 영속화하며, 내보내기/가져오기(Markdown frontmatter)까지 왕복 보존한다.

**Architecture:** 기존 `title`을 "설교 제목"으로 재사용하고, `Note`에 `sermonDate`·`preacher`·`location`·`scripture` 4개의 nullable string 필드를 추가한다. SQLite에는 4개의 nullable TEXT 컬럼을 추가하되, 기존 설치본 호환을 위해 멱등(idempotent) "누락 컬럼 추가" 마이그레이션을 도입한다. 날짜는 **네이티브 의존성 없는 앱 내장 달력 모달**로 입력하고, 생명양식은 기존 `parseRef`/`lookupVerses` 인프라로 검증하며 탭 시 본문을 읽기 전용으로 미리 본다. 공유 컴포넌트 `SermonMetaHeader`를 폰(`app/note/[id].tsx`)과 태블릿(`TabletWorkspace.tsx`) 양쪽 편집 화면에 동일하게 연결한다.

**Tech Stack:** Expo ~54 / React Native 0.81 / React 19, TypeScript, expo-sqlite, Zustand, gray-matter. 테스트는 jest-expo + better-sqlite3 (순수 로직·DB 계층만; RN 컴포넌트 테스트 라이브러리는 미설치 → UI는 수동 검증).

**작업 디렉터리:** 모든 명령은 `apps/ch-life/`에서 실행한다 (`cd apps/ch-life`). 패키지 매니저는 **pnpm**.

---

## 데이터 모델 결정 (전 작업 공통 참조)

| 화면 라벨 | `Note` 필드 | DB 컬럼 | 형식 | 비고 |
|---|---|---|---|---|
| 설교 제목 | `title` (기존) | `title` | `string \| null` | 변경 없음, 재사용 |
| 날짜 | `sermonDate` (신규) | `sermon_date TEXT` | `"YYYY-MM-DD" \| null` | 타임존 안전한 달력 문자열 |
| 설교자 | `preacher` (신규) | `preacher TEXT` | `string \| null` | 자유 텍스트 |
| 장소 | `location` (신규) | `location TEXT` | `string \| null` | 자유 텍스트 |
| 생명양식 | `scripture` (신규) | `scripture TEXT` | `string \| null` | 성경 참조 문자열 (예: `"창 1:1"`) — `citedRefs`(본문 자동추출)와 별개의 "대표 본문" |

**범위 밖 (YAGNI):** FTS 인덱스에 설교자/생명양식 추가(검색 요구 없음), 노트 목록 카드에 메타 표시, 새 native date-picker 의존성. 필요해지면 별도 작업으로.

---

## Task 1: `Note` 도메인 타입 확장

**Files:**
- Modify: `src/domain/types.ts:17-24`
- Test: `src/domain/__tests__/types.test.ts`

**Step 1: 실패하는 테스트 작성**

`src/domain/__tests__/types.test.ts` 의 첫 번째 `it` 블록 아래에 다음 테스트를 추가한다 (`describe("domain types", () => { ... })` 내부):

```typescript
  it("Note는 설교 메타데이터 필드를 가진다", () => {
    const note: Note = {
      id: "01HABC",
      title: "주일설교",
      body: [{ type: "paragraph", text: "" }],
      createdAt: 0,
      updatedAt: 0,
      citedRefs: [],
      sermonDate: "2026-05-24",
      preacher: "홍길동 목사",
      location: "본당",
      scripture: "요 3:16",
    };
    expect(note.sermonDate).toBe("2026-05-24");
    expect(note.preacher).toBe("홍길동 목사");
    expect(note.location).toBe("본당");
    expect(note.scripture).toBe("요 3:16");
  });
```

**Step 2: 테스트가 실패하는지 확인**

Run: `pnpm jest src/domain/__tests__/types.test.ts`
Expected: FAIL — 타입 에러 (`Object literal may only specify known properties` / `sermonDate does not exist in type 'Note'`).

**Step 3: 최소 구현 — `Note` 타입에 필드 추가**

`src/domain/types.ts` 의 `Note` 타입을 수정한다:

```typescript
export type Note = {
  id: string;
  title: string | null;
  body: BlockNode[];
  createdAt: number;
  updatedAt: number;
  citedRefs: string[];
  sermonDate: string | null;
  preacher: string | null;
  location: string | null;
  scripture: string | null;
};
```

**Step 4: 테스트 통과 확인**

Run: `pnpm jest src/domain/__tests__/types.test.ts`
Expected: PASS (2 tests).

> 참고: 이 변경으로 `Note`를 직접 생성하는 다른 코드(파서 등)에 타입 에러가 날 수 있다. 이후 Task에서 모두 해소한다. 지금은 이 테스트 파일만 통과하면 된다.

**Step 5: 커밋**

```bash
git add src/domain/types.ts src/domain/__tests__/types.test.ts
git commit -m "feat(domain): add sermon metadata fields to Note type"
```

---

## Task 2: DB 스키마 + 누락 컬럼 마이그레이션

기존 설치본의 `notes` 테이블에는 새 컬럼이 없다. `CREATE TABLE IF NOT EXISTS`는 기존 테이블에 컬럼을 추가하지 못하므로, `PRAGMA table_info` 로 확인 후 `ALTER TABLE ADD COLUMN` 하는 멱등 마이그레이션을 도입한다. 신규 설치/테스트는 `schema.sql`의 `CREATE TABLE`에 컬럼이 포함되어 바로 생성된다.

**Files:**
- Create: `src/db/migrate.ts`
- Create: `src/db/__tests__/migrate.test.ts`
- Modify: `src/db/schema.sql:1-7` (CREATE TABLE 컬럼 추가)
- Modify: `src/db/index.ts:13-42` (인라인 SCHEMA_SQL 동기화 + 마이그레이션 호출)

**Step 1: 실패하는 테스트 작성**

`src/db/__tests__/migrate.test.ts` 생성:

```typescript
import Database from "better-sqlite3";
import { addMissingNoteColumns } from "../migrate";
import type { DbAdapter } from "../note-repo";

// 새 컬럼이 없던 "구버전" notes 테이블을 흉내낸다.
const OLD_SCHEMA = `
CREATE TABLE notes (
  id          TEXT PRIMARY KEY,
  title       TEXT,
  body_json   TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL,
  cited_refs  TEXT NOT NULL DEFAULT '[]'
);`;

function adapterFor(db: Database.Database): DbAdapter {
  return {
    execAsync: async (sql) => {
      db.exec(sql);
    },
    runAsync: async (sql, params = []) => {
      db.prepare(sql).run(...params);
    },
    getAllAsync: async <T,>(sql: string, params: unknown[] = []) =>
      db.prepare(sql).all(...params) as T[],
    getFirstAsync: async <T,>(sql: string, params: unknown[] = []) =>
      (db.prepare(sql).get(...params) as T | undefined) ?? null,
  };
}

function columnNames(db: Database.Database): string[] {
  return (db.prepare("PRAGMA table_info(notes)").all() as Array<{ name: string }>).map(
    (c) => c.name,
  );
}

describe("addMissingNoteColumns", () => {
  it("구버전 테이블에 누락된 메타 컬럼을 추가한다", async () => {
    const db = new Database(":memory:");
    db.exec(OLD_SCHEMA);
    await addMissingNoteColumns(adapterFor(db));
    const cols = columnNames(db);
    expect(cols).toEqual(
      expect.arrayContaining(["sermon_date", "preacher", "location", "scripture"]),
    );
    db.close();
  });

  it("멱등하다 — 두 번 실행해도 오류 없음", async () => {
    const db = new Database(":memory:");
    db.exec(OLD_SCHEMA);
    await addMissingNoteColumns(adapterFor(db));
    await expect(addMissingNoteColumns(adapterFor(db))).resolves.toBeUndefined();
    db.close();
  });
});
```

**Step 2: 테스트가 실패하는지 확인**

Run: `pnpm jest src/db/__tests__/migrate.test.ts`
Expected: FAIL — `Cannot find module '../migrate'`.

**Step 3: 최소 구현 — `src/db/migrate.ts` 생성**

```typescript
type MigrateDb = {
  execAsync: (sql: string) => Promise<unknown>;
  getAllAsync: <T>(sql: string, params?: unknown[]) => Promise<T[]>;
};

export const ADDED_NOTE_COLUMNS: ReadonlyArray<{ name: string; ddl: string }> = [
  { name: "sermon_date", ddl: "ALTER TABLE notes ADD COLUMN sermon_date TEXT" },
  { name: "preacher", ddl: "ALTER TABLE notes ADD COLUMN preacher TEXT" },
  { name: "location", ddl: "ALTER TABLE notes ADD COLUMN location TEXT" },
  { name: "scripture", ddl: "ALTER TABLE notes ADD COLUMN scripture TEXT" },
];

// notes 테이블에 누락된 메타 컬럼만 골라 추가한다. 매 실행 멱등.
export async function addMissingNoteColumns(db: MigrateDb): Promise<void> {
  const cols = await db.getAllAsync<{ name: string }>("PRAGMA table_info(notes)");
  const have = new Set(cols.map((c) => c.name));
  for (const col of ADDED_NOTE_COLUMNS) {
    if (!have.has(col.name)) await db.execAsync(col.ddl);
  }
}
```

**Step 4: 테스트 통과 확인**

Run: `pnpm jest src/db/__tests__/migrate.test.ts`
Expected: PASS (2 tests).

**Step 5: 신규 설치/테스트용 스키마에 컬럼 추가**

`src/db/schema.sql` 의 `CREATE TABLE` 블록을 수정한다 (상단 7줄):

```sql
CREATE TABLE IF NOT EXISTS notes (
  id          TEXT PRIMARY KEY,
  title       TEXT,
  body_json   TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL,
  cited_refs  TEXT NOT NULL DEFAULT '[]',
  sermon_date TEXT,
  preacher    TEXT,
  location    TEXT,
  scripture   TEXT
);
```

**Step 6: 런타임 스키마(인라인) 동기화 + 마이그레이션 호출**

`src/db/index.ts` 를 수정한다.

(a) 상단에 import 추가:

```typescript
import { addMissingNoteColumns } from "./migrate";
```

(b) `runMigrations` 를 다음과 같이 교체 (기존 `await db.execAsync(SCHEMA_SQL);` 한 줄을 확장):

```typescript
async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(SCHEMA_SQL);
  await addMissingNoteColumns({
    execAsync: (sql) => db.execAsync(sql),
    getAllAsync: <T,>(sql: string) => db.getAllAsync<T>(sql),
  });
}
```

(c) 인라인 `SCHEMA_SQL` 의 `CREATE TABLE` 블록을 `schema.sql` 과 동일하게 수정 (컬럼 4개 추가):

```typescript
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS notes (
  id          TEXT PRIMARY KEY,
  title       TEXT,
  body_json   TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL,
  cited_refs  TEXT NOT NULL DEFAULT '[]',
  sermon_date TEXT,
  preacher    TEXT,
  location    TEXT,
  scripture   TEXT
);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
DROP INDEX IF EXISTS idx_notes_updated_at;
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

**Step 7: 기존 스키마 테스트가 여전히 통과하는지 확인**

Run: `pnpm jest src/db/__tests__/migrations.test.ts`
Expected: PASS (2 tests) — `schema.sql` 의 새 컬럼은 기존 단언에 영향을 주지 않는다.

**Step 8: 커밋**

```bash
git add src/db/migrate.ts src/db/__tests__/migrate.test.ts src/db/schema.sql src/db/index.ts
git commit -m "feat(db): add nullable sermon metadata columns with idempotent migration"
```

---

## Task 3: note-repo가 메타 필드를 읽고 쓴다

**Files:**
- Modify: `src/db/note-repo.ts:10-127`
- Test: `src/db/__tests__/note-repo.test.ts`

**Step 1: 실패하는 테스트 작성**

`src/db/__tests__/note-repo.test.ts` 의 `describe` 안에 추가:

```typescript
  it("설교 메타데이터를 저장하고 읽는다", async () => {
    const repo = setup();
    const id = await repo.create({
      title: "주일설교",
      body: [],
      citedRefs: [],
      sermonDate: "2026-05-24",
      preacher: "홍길동 목사",
      location: "본당",
      scripture: "요 3:16",
    });
    const note = await repo.findById(id);
    expect(note?.sermonDate).toBe("2026-05-24");
    expect(note?.preacher).toBe("홍길동 목사");
    expect(note?.location).toBe("본당");
    expect(note?.scripture).toBe("요 3:16");
  });

  it("메타 필드 미지정 시 null로 저장된다", async () => {
    const repo = setup();
    const id = await repo.create({ title: null, body: [], citedRefs: [] });
    const note = await repo.findById(id);
    expect(note?.sermonDate).toBeNull();
    expect(note?.preacher).toBeNull();
    expect(note?.location).toBeNull();
    expect(note?.scripture).toBeNull();
  });

  it("update가 메타 필드를 부분 갱신한다", async () => {
    const repo = setup();
    const id = await repo.create({
      title: "x",
      body: [],
      citedRefs: [],
      preacher: "전임 목사",
    });
    await repo.update(id, { preacher: "후임 목사", location: "교육관" });
    const note = await repo.findById(id);
    expect(note?.preacher).toBe("후임 목사");
    expect(note?.location).toBe("교육관");
    // 건드리지 않은 필드는 유지
    expect(note?.title).toBe("x");
  });
```

**Step 2: 테스트가 실패하는지 확인**

Run: `pnpm jest src/db/__tests__/note-repo.test.ts`
Expected: FAIL — `create` 입력 타입에 `sermonDate` 등이 없고, `note?.sermonDate` 가 `undefined`.

**Step 3: 최소 구현 — `src/db/note-repo.ts` 수정**

(a) `Row` 타입에 컬럼 추가 (`src/db/note-repo.ts:10-17`):

```typescript
type Row = {
  id: string;
  title: string | null;
  body_json: string;
  created_at: number;
  updated_at: number;
  cited_refs: string;
  sermon_date: string | null;
  preacher: string | null;
  location: string | null;
  scripture: string | null;
};
```

(b) `rowToNote` 에 매핑 추가:

```typescript
function rowToNote(r: Row): Note {
  return {
    id: r.id,
    title: r.title,
    body: JSON.parse(r.body_json) as BlockNode[],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    citedRefs: JSON.parse(r.cited_refs) as string[],
    sermonDate: r.sermon_date,
    preacher: r.preacher,
    location: r.location,
    scripture: r.scripture,
  };
}
```

(c) `create` 의 입력 타입과 INSERT 문 수정:

```typescript
    async create(input: {
      title?: string | null;
      body: BlockNode[];
      citedRefs: string[];
      sermonDate?: string | null;
      preacher?: string | null;
      location?: string | null;
      scripture?: string | null;
    }): Promise<string> {
      const id = makeId();
      const now = Date.now();
      await db.runAsync(
        `INSERT INTO notes(id, title, body_json, created_at, updated_at, cited_refs,
                           sermon_date, preacher, location, scripture)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          input.title ?? null,
          JSON.stringify(input.body),
          now,
          now,
          JSON.stringify(input.citedRefs),
          input.sermonDate ?? null,
          input.preacher ?? null,
          input.location ?? null,
          input.scripture ?? null,
        ],
      );
      return id;
    },
```

(d) `update` 의 patch 타입, Row 병합, UPDATE 문 수정:

```typescript
    async update(
      id: string,
      patch: {
        title?: string | null;
        body?: BlockNode[];
        citedRefs?: string[];
        sermonDate?: string | null;
        preacher?: string | null;
        location?: string | null;
        scripture?: string | null;
      },
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
        sermon_date:
          patch.sermonDate !== undefined ? patch.sermonDate : current.sermon_date,
        preacher:
          patch.preacher !== undefined ? patch.preacher : current.preacher,
        location:
          patch.location !== undefined ? patch.location : current.location,
        scripture:
          patch.scripture !== undefined ? patch.scripture : current.scripture,
        updated_at: Date.now(),
      };
      await db.runAsync(
        `UPDATE notes SET title=?, body_json=?, cited_refs=?,
                          sermon_date=?, preacher=?, location=?, scripture=?,
                          updated_at=?
         WHERE id=?`,
        [
          next.title,
          next.body_json,
          next.cited_refs,
          next.sermon_date,
          next.preacher,
          next.location,
          next.scripture,
          next.updated_at,
          id,
        ],
      );
    },
```

**Step 4: 테스트 통과 확인**

Run: `pnpm jest src/db/__tests__/note-repo.test.ts`
Expected: PASS (기존 + 신규 8 tests).

**Step 5: 커밋**

```bash
git add src/db/note-repo.ts src/db/__tests__/note-repo.test.ts
git commit -m "feat(db): persist sermon metadata in note repo create/update"
```

---

## Task 4: 달력 순수 헬퍼 (`calendar.ts`)

날짜 피커 모달의 날짜 계산 로직을 순수 함수로 분리해 TDD한다 (UI는 Task 6).

**Files:**
- Create: `src/editor/calendar.ts`
- Create: `src/editor/__tests__/calendar.test.ts`

**Step 1: 실패하는 테스트 작성**

`src/editor/__tests__/calendar.test.ts` 생성:

```typescript
import {
  formatYmd,
  parseYmd,
  formatKoreanDate,
  buildMonthGrid,
  addMonths,
} from "../calendar";

describe("calendar helpers", () => {
  it("formatYmd는 로컬 날짜를 YYYY-MM-DD로 만든다", () => {
    expect(formatYmd(new Date(2026, 4, 24))).toBe("2026-05-24");
    expect(formatYmd(new Date(2026, 0, 1))).toBe("2026-01-01");
  });

  it("parseYmd는 유효한 문자열을 Date로, 그 외엔 null", () => {
    const d = parseYmd("2026-05-24");
    expect(d?.getFullYear()).toBe(2026);
    expect(d?.getMonth()).toBe(4);
    expect(d?.getDate()).toBe(24);
    expect(parseYmd("garbage")).toBeNull();
    expect(parseYmd("2026-13-01")).toBeNull();
  });

  it("formatKoreanDate는 한국어 표기를 만든다", () => {
    expect(formatKoreanDate("2026-05-24")).toBe("2026년 5월 24일");
  });

  it("buildMonthGrid는 42칸 격자에 해당 월 날짜를 배치한다", () => {
    const grid = buildMonthGrid(2026, 4); // 2026년 5월
    expect(grid).toHaveLength(42);
    expect(grid).toContain("2026-05-01");
    expect(grid).toContain("2026-05-31");
    // 1일은 요일 오프셋 위치에 온다 (일요일 시작)
    const firstWeekday = new Date(2026, 4, 1).getDay();
    expect(grid[firstWeekday]).toBe("2026-05-01");
    // 그 앞칸은 패딩(null)
    if (firstWeekday > 0) expect(grid[firstWeekday - 1]).toBeNull();
  });

  it("addMonths는 연·월 경계를 넘긴다", () => {
    expect(addMonths(2026, 11, 1)).toEqual({ year: 2027, month0: 0 });
    expect(addMonths(2026, 0, -1)).toEqual({ year: 2025, month0: 11 });
  });
});
```

**Step 2: 테스트가 실패하는지 확인**

Run: `pnpm jest src/editor/__tests__/calendar.test.ts`
Expected: FAIL — `Cannot find module '../calendar'`.

**Step 3: 최소 구현 — `src/editor/calendar.ts` 생성**

```typescript
function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatYmd(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function parseYmd(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const year = Number(m[1]);
  const month0 = Number(m[2]) - 1;
  const day = Number(m[3]);
  const d = new Date(year, month0, day);
  // 잘못된 값은 정규화로 어긋나므로 되돌려 검사 (예: 2026-13-01)
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month0 ||
    d.getDate() !== day
  ) {
    return null;
  }
  return d;
}

export function formatKoreanDate(ymd: string): string {
  const d = parseYmd(ymd);
  if (!d) return ymd;
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

// 일요일 시작 6주(42칸) 격자. 각 칸은 YYYY-MM-DD 또는 패딩 null.
export function buildMonthGrid(year: number, month0: number): (string | null)[] {
  const first = new Date(year, month0, 1);
  const offset = first.getDay();
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(formatYmd(new Date(year, month0, day)));
  }
  while (cells.length < 42) cells.push(null);
  return cells;
}

export function addMonths(
  year: number,
  month0: number,
  delta: number,
): { year: number; month0: number } {
  const total = year * 12 + month0 + delta;
  return { year: Math.floor(total / 12), month0: ((total % 12) + 12) % 12 };
}

export function todayYmd(): string {
  return formatYmd(new Date());
}
```

**Step 4: 테스트 통과 확인**

Run: `pnpm jest src/editor/__tests__/calendar.test.ts`
Expected: PASS (5 tests).

**Step 5: 커밋**

```bash
git add src/editor/calendar.ts src/editor/__tests__/calendar.test.ts
git commit -m "feat(editor): add pure calendar helpers for in-app date picker"
```

---

## Task 5: 생명양식 검증 순수 헬퍼 (`scripture-field.ts`)

**Files:**
- Create: `src/editor/scripture-field.ts`
- Create: `src/editor/__tests__/scripture-field.test.ts`

**Step 1: 실패하는 테스트 작성**

`src/editor/__tests__/scripture-field.test.ts` 생성:

```typescript
import { validateScripture } from "../scripture-field";

describe("validateScripture", () => {
  it("존재하는 참조는 valid=true, verses 반환", () => {
    const r = validateScripture("창 1:1");
    expect(r.valid).toBe(true);
    expect(r.verses).not.toBeNull();
    expect((r.verses?.length ?? 0)).toBeGreaterThan(0);
  });

  it("빈 문자열/공백은 valid=false, verses=null", () => {
    expect(validateScripture("")).toEqual({ valid: false, verses: null });
    expect(validateScripture("   ")).toEqual({ valid: false, verses: null });
  });

  it("파싱 불가/없는 본문은 valid=false", () => {
    const r = validateScripture("없는책 1:1");
    expect(r.valid).toBe(false);
    expect(r.verses).toBeNull();
  });
});
```

**Step 2: 테스트가 실패하는지 확인**

Run: `pnpm jest src/editor/__tests__/scripture-field.test.ts`
Expected: FAIL — `Cannot find module '../scripture-field'`.

**Step 3: 최소 구현 — `src/editor/scripture-field.ts` 생성**

```typescript
import type { Verse } from "@/domain/types";
import { lookupVerses } from "@/parser/verse-lookup";

export type ScriptureValidation = {
  valid: boolean;
  verses: Verse[] | null;
};

// 생명양식 입력값을 검증한다. 성경 본문이 실제로 조회되면 valid.
export function validateScripture(ref: string): ScriptureValidation {
  const trimmed = ref.trim();
  if (!trimmed) return { valid: false, verses: null };
  const verses = lookupVerses(trimmed);
  return { valid: verses !== null, verses };
}
```

**Step 4: 테스트 통과 확인**

Run: `pnpm jest src/editor/__tests__/scripture-field.test.ts`
Expected: PASS (3 tests).

> 만약 "창 1:1" 이 `assets/bible.json` 에 없어 첫 테스트가 실패하면, `app/note/[id].tsx:16` 의 `DEFAULT_RECENTS`(`"창 1:1"`, `"엡 2:8"`, `"시 23:1"`) 중 조회되는 다른 참조로 교체한다.

**Step 5: 커밋**

```bash
git add src/editor/scripture-field.ts src/editor/__tests__/scripture-field.test.ts
git commit -m "feat(editor): add scripture reference validation helper"
```

---

## Task 6: 날짜 피커 모달 컴포넌트 (`DatePickerModal.tsx`)

> **테스트 참고:** 이 저장소에는 RN 컴포넌트 테스트 라이브러리(`@testing-library/react-native`)가 설치되어 있지 않다. 따라서 UI 컴포넌트(Task 6·7·8)는 **자동 테스트 없이 수동 검증**한다. 핵심 날짜 로직은 Task 4의 `calendar.ts` 테스트가 커버한다. 컴포넌트는 얇게 유지하고 로직은 헬퍼에 둔다.

**Files:**
- Create: `src/editor/DatePickerModal.tsx`

**Step 1: 컴포넌트 작성**

`src/editor/DatePickerModal.tsx` 생성:

```typescript
import React, { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme, scaled } from "@/theme/ThemeProvider";
import {
  addMonths,
  buildMonthGrid,
  parseYmd,
  todayYmd,
} from "./calendar";

type Props = {
  visible: boolean;
  value: string | null; // YYYY-MM-DD
  onSelect: (ymd: string) => void;
  onClose: () => void;
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function DatePickerModal({ visible, value, onSelect, onClose }: Props) {
  const { colors, fontScale, fontStack } = useTheme();
  const initial = parseYmd(value ?? "") ?? parseYmd(todayYmd())!;
  const [view, setView] = useState({
    year: initial.getFullYear(),
    month0: initial.getMonth(),
  });

  const grid = useMemo(
    () => buildMonthGrid(view.year, view.month0),
    [view.year, view.month0],
  );

  const goMonth = (delta: number) =>
    setView((v) => addMonths(v.year, v.month0, delta));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.paper }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.head}>
            <Pressable
              onPress={() => goMonth(-1)}
              accessibilityRole="button"
              accessibilityLabel="이전 달"
              hitSlop={12}
              style={styles.navBtn}
            >
              <Text style={[styles.navText, { color: colors.ink2 }]}>‹</Text>
            </Pressable>
            <Text
              style={[
                styles.headTitle,
                { color: colors.ink, fontFamily: fontStack, fontSize: scaled(17, fontScale) },
              ]}
            >
              {view.year}년 {view.month0 + 1}월
            </Text>
            <Pressable
              onPress={() => goMonth(1)}
              accessibilityRole="button"
              accessibilityLabel="다음 달"
              hitSlop={12}
              style={styles.navBtn}
            >
              <Text style={[styles.navText, { color: colors.ink2 }]}>›</Text>
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map((w) => (
              <Text key={w} style={[styles.weekday, { color: colors.ink3 }]}>
                {w}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {grid.map((ymd, i) => {
              if (!ymd) return <View key={`pad-${i}`} style={styles.cell} />;
              const day = Number(ymd.slice(8, 10));
              const selected = ymd === value;
              return (
                <Pressable
                  key={ymd}
                  onPress={() => {
                    onSelect(ymd);
                    onClose();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${day}일`}
                  style={[
                    styles.cell,
                    selected && { backgroundColor: colors.accent, borderRadius: 999 },
                  ]}
                >
                  <Text
                    style={{
                      color: selected ? colors.accentText : colors.ink,
                      fontSize: scaled(15, fontScale),
                      fontWeight: selected ? "700" : "400",
                    }}
                  >
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={() => {
              onSelect(todayYmd());
              onClose();
            }}
            accessibilityRole="button"
            accessibilityLabel="오늘 선택"
            style={styles.todayBtn}
          >
            <Text style={[styles.todayText, { color: colors.accent }]}>오늘</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const CELL = 44;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  sheet: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 16,
    padding: 16,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headTitle: { fontWeight: "700" },
  navBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: { fontSize: 24 },
  weekRow: { flexDirection: "row" },
  weekday: { width: CELL, textAlign: "center", fontSize: 12, paddingVertical: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: {
    width: CELL,
    height: CELL,
    alignItems: "center",
    justifyContent: "center",
  },
  todayBtn: { alignSelf: "center", marginTop: 8, padding: 12 },
  todayText: { fontSize: 14, fontWeight: "600" },
});
```

**Step 2: 타입체크 확인**

Run: `pnpm exec tsc --noEmit`
Expected: 에러 없음 (이 파일 관련).

**Step 3: 커밋**

```bash
git add src/editor/DatePickerModal.tsx
git commit -m "feat(editor): add in-app calendar date picker modal"
```

---

## Task 7: 생명양식 본문 미리보기 모달 (`ScripturePreviewModal.tsx`)

생명양식이 유효할 때 탭하면 본문을 읽기 전용으로 보여준다. 기존 `QuoteBlock` 렌더링을 재사용한다.

**Files:**
- Create: `src/editor/ScripturePreviewModal.tsx`

**Step 1: 컴포넌트 작성**

```typescript
import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { QuoteBlock } from "./QuoteBlock";
import { validateScripture } from "./scripture-field";

type Props = {
  visible: boolean;
  scripture: string | null;
  onClose: () => void;
};

export function ScripturePreviewModal({ visible, scripture, onClose }: Props) {
  const { colors } = useTheme();
  const { verses } = scripture
    ? validateScripture(scripture)
    : { verses: null };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.paper }]}
          onPress={(e) => e.stopPropagation()}
        >
          <ScrollView contentContainerStyle={styles.content}>
            {verses && scripture ? (
              <QuoteBlock
                type="quote"
                ref={scripture}
                verses={verses}
                status="loaded"
              />
            ) : (
              <Text style={[styles.empty, { color: colors.ink3 }]}>
                본문을 찾을 수 없습니다
              </Text>
            )}
          </ScrollView>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="닫기"
            style={styles.closeBtn}
          >
            <Text style={[styles.closeText, { color: colors.accent }]}>닫기</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  sheet: { width: "100%", maxWidth: 420, maxHeight: "70%", borderRadius: 16, padding: 16 },
  content: { paddingVertical: 8 },
  empty: { textAlign: "center", paddingVertical: 24, fontSize: 14 },
  closeBtn: { alignSelf: "center", marginTop: 8, padding: 12 },
  closeText: { fontSize: 14, fontWeight: "600" },
});
```

> 참고: `QuoteBlock` 의 props는 `Extract<BlockNode, { type: "quote" }>` (`type`/`ref`/`verses`/`status`)이다 — `src/editor/QuoteBlock.tsx:12`. `ref` 는 일반 prop 이름이라 RN 경고 없이 사용 가능하다.

**Step 2: 타입체크 확인**

Run: `pnpm exec tsc --noEmit`
Expected: 에러 없음.

**Step 3: 커밋**

```bash
git add src/editor/ScripturePreviewModal.tsx
git commit -m "feat(editor): add read-only scripture preview modal"
```

---

## Task 8: 메타데이터 헤더 컴포넌트 (`SermonMetaHeader.tsx`)

항상 보이는 라벨 필드 5개 (제목·날짜·설교자·장소·생명양식). 폰/태블릿 공유.

**Files:**
- Create: `src/editor/SermonMetaHeader.tsx`

**Step 1: 컴포넌트 작성**

```typescript
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme, scaled } from "@/theme/ThemeProvider";
import { formatKoreanDate } from "./calendar";
import { validateScripture } from "./scripture-field";
import { DatePickerModal } from "./DatePickerModal";
import { ScripturePreviewModal } from "./ScripturePreviewModal";

export type SermonMetaHeaderProps = {
  title: string | null;
  sermonDate: string | null;
  preacher: string | null;
  location: string | null;
  scripture: string | null;
  onChangeTitle: (v: string | null) => void;
  onChangeSermonDate: (v: string | null) => void;
  onChangePreacher: (v: string | null) => void;
  onChangeLocation: (v: string | null) => void;
  onChangeScripture: (v: string | null) => void;
};

function toNull(v: string): string | null {
  return v.length === 0 ? null : v;
}

export function SermonMetaHeader(props: SermonMetaHeaderProps) {
  const { colors, fontScale, fontStack } = useTheme();
  const [dateOpen, setDateOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const scriptureValid =
    !!props.scripture && validateScripture(props.scripture).valid;

  const labelStyle = [
    styles.label,
    { color: colors.ink3, fontSize: scaled(13, fontScale) },
  ];
  const fieldText = {
    color: colors.ink,
    fontFamily: fontStack,
    fontSize: scaled(16, fontScale),
  };

  return (
    <View style={[styles.root, { borderBottomColor: colors.rule }]}>
      {/* 제목 */}
      <View style={styles.row}>
        <Text style={labelStyle}>제목</Text>
        <TextInput
          style={[styles.input, fieldText, { fontWeight: "700", fontSize: scaled(20, fontScale) }]}
          value={props.title ?? ""}
          onChangeText={(t) => props.onChangeTitle(toNull(t))}
          placeholder="설교 제목"
          placeholderTextColor={colors.ink3}
          accessibilityLabel="설교 제목"
          maxLength={120}
        />
      </View>

      {/* 날짜 */}
      <View style={styles.row}>
        <Text style={labelStyle}>날짜</Text>
        <Pressable
          onPress={() => setDateOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="설교 날짜 선택"
          style={styles.pressField}
        >
          <Text style={[fieldText, !props.sermonDate && { color: colors.ink3 }]}>
            {props.sermonDate ? formatKoreanDate(props.sermonDate) : "날짜 선택"}
          </Text>
          <Text style={[styles.chev, { color: colors.ink3 }]}>▾</Text>
        </Pressable>
      </View>

      {/* 설교자 */}
      <View style={styles.row}>
        <Text style={labelStyle}>설교자</Text>
        <TextInput
          style={[styles.input, fieldText]}
          value={props.preacher ?? ""}
          onChangeText={(t) => props.onChangePreacher(toNull(t))}
          placeholder="설교자 이름"
          placeholderTextColor={colors.ink3}
          accessibilityLabel="설교자"
          maxLength={60}
        />
      </View>

      {/* 장소 */}
      <View style={styles.row}>
        <Text style={labelStyle}>장소</Text>
        <TextInput
          style={[styles.input, fieldText]}
          value={props.location ?? ""}
          onChangeText={(t) => props.onChangeLocation(toNull(t))}
          placeholder="예배 장소"
          placeholderTextColor={colors.ink3}
          accessibilityLabel="장소"
          maxLength={60}
        />
      </View>

      {/* 생명양식 */}
      <View style={[styles.row, styles.lastRow]}>
        <Text style={labelStyle}>생명양식</Text>
        <View style={styles.scriptureField}>
          <TextInput
            style={[styles.input, styles.scriptureInput, fieldText]}
            value={props.scripture ?? ""}
            onChangeText={(t) => props.onChangeScripture(toNull(t))}
            placeholder="본문 (예: 요 3:16)"
            placeholderTextColor={colors.ink3}
            accessibilityLabel="생명양식 본문"
            maxLength={40}
            autoCapitalize="none"
          />
          {scriptureValid && (
            <Text style={[styles.check, { color: colors.accent }]}>✓</Text>
          )}
          <Pressable
            onPress={() => setPreviewOpen(true)}
            disabled={!scriptureValid}
            accessibilityRole="button"
            accessibilityLabel="본문 보기"
            hitSlop={8}
            style={styles.bookBtn}
          >
            <Text style={{ opacity: scriptureValid ? 1 : 0.3, fontSize: 18 }}>📖</Text>
          </Pressable>
        </View>
      </View>

      <DatePickerModal
        visible={dateOpen}
        value={props.sermonDate}
        onSelect={props.onChangeSermonDate}
        onClose={() => setDateOpen(false)}
      />
      <ScripturePreviewModal
        visible={previewOpen}
        scripture={props.scripture}
        onClose={() => setPreviewOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    gap: 12,
  },
  lastRow: {},
  label: { width: 64, fontWeight: "600" },
  input: { flex: 1, paddingVertical: 8 },
  pressField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  chev: { fontSize: 12 },
  scriptureField: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  scriptureInput: { flex: 1 },
  check: { fontSize: 16, fontWeight: "700" },
  bookBtn: {
    minWidth: 32,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
```

**Step 2: 타입체크 확인**

Run: `pnpm exec tsc --noEmit`
Expected: 에러 없음.

**Step 3: 커밋**

```bash
git add src/editor/SermonMetaHeader.tsx
git commit -m "feat(editor): add always-visible sermon metadata header component"
```

---

## Task 9: useAutoSave가 메타 필드를 저장하도록 확장

저장 페이로드 조립을 순수 함수로 분리해 TDD하고, 훅은 이를 사용한다.

**Files:**
- Modify: `src/editor/useAutoSave.ts`
- Create: `src/editor/__tests__/useAutoSave-payload.test.ts`

**Step 1: 실패하는 테스트 작성**

`src/editor/__tests__/useAutoSave-payload.test.ts` 생성:

```typescript
import { buildSavePayload } from "../useAutoSave";

describe("buildSavePayload", () => {
  it("body에서 citedRefs를 추출하고 모든 메타 필드를 포함한다", () => {
    const payload = buildSavePayload({
      title: "주일설교",
      body: [
        { type: "quote", ref: "Col 3:20", verses: [], status: "loaded" },
        { type: "paragraph", text: "메모" },
      ],
      sermonDate: "2026-05-24",
      preacher: "홍길동",
      location: "본당",
      scripture: "요 3:16",
    });
    expect(payload).toEqual({
      title: "주일설교",
      body: expect.any(Array),
      citedRefs: ["Col 3:20"],
      sermonDate: "2026-05-24",
      preacher: "홍길동",
      location: "본당",
      scripture: "요 3:16",
    });
  });
});
```

**Step 2: 테스트가 실패하는지 확인**

Run: `pnpm jest src/editor/__tests__/useAutoSave-payload.test.ts`
Expected: FAIL — `buildSavePayload` 미존재.

**Step 3: 최소 구현 — `src/editor/useAutoSave.ts` 전체 교체**

```typescript
import { useEffect, useRef } from "react";
import type { BlockNode } from "@/domain/types";
import { extractCitedRefs } from "./cited-refs";

type SaveState = {
  title: string | null;
  body: BlockNode[];
  sermonDate: string | null;
  preacher: string | null;
  location: string | null;
  scripture: string | null;
};

type SavePayload = SaveState & { citedRefs: string[] };

type SaveFn = (patch: SavePayload) => Promise<void>;

export function buildSavePayload(state: SaveState): SavePayload {
  return {
    title: state.title,
    body: state.body,
    citedRefs: extractCitedRefs(state.body),
    sermonDate: state.sermonDate,
    preacher: state.preacher,
    location: state.location,
    scripture: state.scripture,
  };
}

export function useAutoSave(opts: {
  title: string | null;
  body: BlockNode[];
  sermonDate: string | null;
  preacher: string | null;
  location: string | null;
  scripture: string | null;
  save: SaveFn;
  delayMs?: number;
  onError?: (e: unknown) => void;
}): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    title,
    body,
    sermonDate,
    preacher,
    location,
    scripture,
    save,
    delayMs = 500,
    onError,
  } = opts;

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      save(
        buildSavePayload({
          title,
          body,
          sermonDate,
          preacher,
          location,
          scripture,
        }),
      ).catch((e) => {
        if (onError) onError(e);
        else console.warn("autosave failed", e);
      });
    }, delayMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [title, body, sermonDate, preacher, location, scripture, save, delayMs, onError]);
}
```

**Step 4: 테스트 통과 확인**

Run: `pnpm jest src/editor/__tests__/useAutoSave-payload.test.ts`
Expected: PASS (1 test).

> 이 변경으로 `app/note/[id].tsx` 와 `TabletWorkspace.tsx` 의 `useAutoSave` 호출과 `save` 콜백 시그니처가 타입 에러를 낸다 — Task 10·11에서 해소한다.

**Step 5: 커밋**

```bash
git add src/editor/useAutoSave.ts src/editor/__tests__/useAutoSave-payload.test.ts
git commit -m "feat(editor): include sermon metadata in autosave payload"
```

---

## Task 10: 폰 편집 화면 연결 (`app/note/[id].tsx`)

기존 단독 제목 `TextInput` 을 `SermonMetaHeader` 로 교체하고 메타 상태를 전 흐름에 연결한다.

**Files:**
- Modify: `app/note/[id].tsx`

**Step 1: import 추가** (`app/note/[id].tsx:6` 부근, 다른 editor import 옆)

```typescript
import { SermonMetaHeader } from "@/editor/SermonMetaHeader";
```

`TextInput` import는 더 이상 직접 쓰지 않으면 제거한다(2번째 줄). `scaled` 도 제목 입력 제거 후 미사용이면 제거.

**Step 2: 메타 상태 추가** (`useState` 선언 묶음, `title` state 아래 `app/note/[id].tsx:21` 부근)

```typescript
  const [sermonDate, setSermonDate] = useState<string | null>(null);
  const [preacher, setPreacher] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [scripture, setScripture] = useState<string | null>(null);
```

**Step 3: 로드 시 메타 채우기** (`app/note/[id].tsx:84-89` 의 `if (note) { ... }` 블록)

```typescript
      if (note) {
        setTitle(note.title);
        setBody(
          note.body.length ? note.body : [{ type: "paragraph", text: "" }],
        );
        setSermonDate(note.sermonDate);
        setPreacher(note.preacher);
        setLocation(note.location);
        setScripture(note.scripture);
      }
```

**Step 4: `save` 콜백 시그니처 확장** (`app/note/[id].tsx:100-112`)

```typescript
  const save = useCallback(
    async (patch: {
      title: string | null;
      body: BlockNode[];
      citedRefs: string[];
      sermonDate: string | null;
      preacher: string | null;
      location: string | null;
      scripture: string | null;
    }) => {
      if (!id) return;
      const repo = await openNoteRepo();
      await repo.update(id, patch);
      setSaveErr(null);
    },
    [id],
  );
```

**Step 5: `useAutoSave` 호출 확장** (`app/note/[id].tsx:122`)

```typescript
  useAutoSave({
    title,
    body,
    sermonDate,
    preacher,
    location,
    scripture,
    save,
    onError,
  });
```

**Step 6: `handleExport` 가 메타를 포함하도록** (`app/note/[id].tsx:35-40` 의 `exportNote({...})`)

```typescript
      await exportNote({
        ...fresh,
        body,
        title,
        sermonDate,
        preacher,
        location,
        scripture,
        citedRefs: extractCitedRefs(body),
      });
```

그리고 `handleExport` 의 의존성 배열에 새 상태를 추가: `}, [id, body, title, sermonDate, preacher, location, scripture]);`

**Step 7: JSX 교체 — 제목 `TextInput` 을 헤더로** (`app/note/[id].tsx:158-176`)

기존의 `<TextInput style={[styles.titleInput, ...]} ... />` 블록 전체(158~175줄)를 삭제하고 다음으로 교체한다. `handleChangeTitle` 콜백은 재사용한다:

```tsx
      <SermonMetaHeader
        title={title}
        sermonDate={sermonDate}
        preacher={preacher}
        location={location}
        scripture={scripture}
        onChangeTitle={handleChangeTitle}
        onChangeSermonDate={setSermonDate}
        onChangePreacher={setPreacher}
        onChangeLocation={setLocation}
        onChangeScripture={setScripture}
      />
      <NoteEditor body={body} onChangeBody={setBody} />
```

`handleChangeTitle` 은 현재 `(next: string) => setTitle(next.length === 0 ? null : next)` 시그니처이므로 `onChangeTitle: (v: string | null) => void` 와 맞지 않는다. `handleChangeTitle` 을 다음으로 단순화한다 (`app/note/[id].tsx:47-49`):

```typescript
  const handleChangeTitle = useCallback((next: string | null) => {
    setTitle(next);
  }, []);
```

**Step 8: 미사용 스타일 정리** — `styles.titleInput` (`app/note/[id].tsx:208-213`) 이 더 이상 참조되지 않으면 삭제한다.

**Step 9: 타입체크 + 단위 테스트**

Run: `pnpm exec tsc --noEmit && pnpm jest`
Expected: 타입 에러 없음, 전체 테스트 PASS.

**Step 10: 커밋**

```bash
git add app/note/[id].tsx
git commit -m "feat(editor): wire sermon metadata header into phone editor screen"
```

---

## Task 11: 태블릿 편집 화면 연결 (`TabletWorkspace.tsx`)

폰과 동일하게 단독 제목 입력을 헤더로 교체한다.

**Files:**
- Modify: `src/workspace/TabletWorkspace.tsx`

**Step 1: import 추가** (`src/workspace/TabletWorkspace.tsx:12` 부근)

```typescript
import { SermonMetaHeader } from "@/editor/SermonMetaHeader";
```

**Step 2: 메타 상태 추가** (`title` state 아래, `src/workspace/TabletWorkspace.tsx:37`)

```typescript
  const [sermonDate, setSermonDate] = useState<string | null>(null);
  const [preacher, setPreacher] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [scripture, setScripture] = useState<string | null>(null);
```

**Step 3: 초기 로드 + 노트 전환 시 메타 채우기**

(a) 초기 로드 (`src/workspace/TabletWorkspace.tsx:54-60`, `if (first) { ... }`):

```typescript
      if (first) {
        setSelectedId(first.id);
        setTitle(first.title);
        setBody(
          first.body.length ? first.body : [{ type: "paragraph", text: "" }],
        );
        setSermonDate(first.sermonDate);
        setPreacher(first.preacher);
        setLocation(first.location);
        setScripture(first.scripture);
      }
```

(b) 노트 전환 (`src/workspace/TabletWorkspace.tsx:73-77`, `if (cancelled || !n) return; ...`):

```typescript
      if (cancelled || !n) return;
      setTitle(n.title);
      setBody(n.body.length ? n.body : [{ type: "paragraph", text: "" }]);
      setSermonDate(n.sermonDate);
      setPreacher(n.preacher);
      setLocation(n.location);
      setScripture(n.scripture);
      useAppStore.getState().setCurrentNoteId(n.id);
```

**Step 4: `save` 콜백 확장 + 낙관적 목록 갱신** (`src/workspace/TabletWorkspace.tsx:84-109`)

```typescript
  const save = useCallback(
    async (patch: {
      title: string | null;
      body: BlockNode[];
      citedRefs: string[];
      sermonDate: string | null;
      preacher: string | null;
      location: string | null;
      scripture: string | null;
    }) => {
      if (!selectedId) return;
      const repo = await openNoteRepo();
      await repo.update(selectedId, patch);
      setNotes((prev) =>
        prev.map((n) =>
          n.id === selectedId
            ? {
                ...n,
                title: patch.title,
                body: patch.body,
                citedRefs: patch.citedRefs,
                sermonDate: patch.sermonDate,
                preacher: patch.preacher,
                location: patch.location,
                scripture: patch.scripture,
                updatedAt: Date.now(),
              }
            : n,
        ),
      );
      setSaveErr(null);
    },
    [selectedId],
  );
```

**Step 5: `useAutoSave` 호출 확장** (`src/workspace/TabletWorkspace.tsx:111-119`)

```typescript
  useAutoSave({
    title,
    body,
    sermonDate,
    preacher,
    location,
    scripture,
    save,
    onError: (e) => {
      console.warn("autosave failed", e);
      setSaveErr("저장 실패");
    },
  });
```

**Step 6: `handleExport` 메타 포함** (`src/workspace/TabletWorkspace.tsx:149-154`)

```typescript
      await exportNote({
        ...fresh,
        body,
        title,
        sermonDate,
        preacher,
        location,
        scripture,
        citedRefs: extractCitedRefs(body),
      });
```

의존성 배열도 갱신: `}, [selectedId, body, title, sermonDate, preacher, location, scripture]);`

**Step 7: JSX 교체** (`src/workspace/TabletWorkspace.tsx:269-288`, `selectedId ? (<> ... </>) :` 내부)

기존 `<TextInput style={[styles.titleInput, ...]} ... />` 를 삭제하고 교체:

```tsx
          <>
            <SermonMetaHeader
              title={title}
              sermonDate={sermonDate}
              preacher={preacher}
              location={location}
              scripture={scripture}
              onChangeTitle={setTitle}
              onChangeSermonDate={setSermonDate}
              onChangePreacher={setPreacher}
              onChangeLocation={setLocation}
              onChangeScripture={setScripture}
            />
            <NoteEditor body={body} onChangeBody={setBody} />
          </>
```

> `onChangeTitle={setTitle}` 는 `(v: string | null) => void` 와 일치한다. 기존 인라인 `onChangeText` 의 빈 문자열→null 변환은 `SermonMetaHeader` 내부 `toNull` 이 담당하므로 불필요.

**Step 8: 미사용 정리** — `TextInput` import 및 `styles.titleInput` (`src/workspace/TabletWorkspace.tsx:369-374`) 이 더 이상 안 쓰이면 제거. `scaled` 가 다른 곳에서 쓰이면 유지(브레드크럼 등 확인 후 결정).

**Step 9: 타입체크 + 테스트**

Run: `pnpm exec tsc --noEmit && pnpm jest`
Expected: 타입 에러 없음, 전체 PASS.

**Step 10: 커밋**

```bash
git add src/workspace/TabletWorkspace.tsx
git commit -m "feat(editor): wire sermon metadata header into tablet workspace"
```

---

## Task 12: Markdown 내보내기/가져오기 왕복 보존

내보낸 `.md` frontmatter에 메타를 싣고, 가져올 때 복원한다.

**Files:**
- Modify: `src/markdown/serialize.ts:5-36`
- Modify: `src/markdown/parse.ts:11-30`
- Test: `src/markdown/__tests__/roundtrip.test.ts`

**Step 1: 실패하는 테스트 작성**

`src/markdown/__tests__/roundtrip.test.ts` 상단 `note` 객체에 메타 필드를 추가하고(기존 객체 `citedRefs` 줄 아래):

```typescript
  citedRefs: ["Col 3:20"],
  sermonDate: "2026-05-24",
  preacher: "홍길동 목사",
  location: "본당",
  scripture: "Col 3:20",
};
```

그리고 첫 번째 `it` 블록 안 `expect(back?.citedRefs)...` 아래에 단언 추가:

```typescript
    expect(back?.sermonDate).toBe("2026-05-24");
    expect(back?.preacher).toBe("홍길동 목사");
    expect(back?.location).toBe("본당");
    expect(back?.scripture).toBe("Col 3:20");
```

또한 두 번째/세 번째 `it` 블록의 `markdownToNote` 결과가 새 필드에 대해 `null` 기본값을 갖는지 확인하는 단언을 두 번째 `it` 에 추가:

```typescript
    expect(back?.sermonDate).toBeNull();
    expect(back?.preacher).toBeNull();
    expect(back?.location).toBeNull();
    expect(back?.scripture).toBeNull();
```

**Step 2: 테스트가 실패하는지 확인**

Run: `pnpm jest src/markdown/__tests__/roundtrip.test.ts`
Expected: FAIL — `note` 객체 타입 에러(누락 필드) 및 `back?.sermonDate` undefined.

**Step 3: serialize 구현** (`src/markdown/serialize.ts`)

`Frontmatter` 타입 확장:

```typescript
type Frontmatter = {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  citedRefs: string[];
  schemaVersion: number;
  sermonDate?: string;
  preacher?: string;
  location?: string;
  scripture?: string;
};
```

`noteToMarkdown` 의 `if (note.title) data.title = note.title;` 아래에 추가:

```typescript
  if (note.sermonDate) data.sermonDate = note.sermonDate;
  if (note.preacher) data.preacher = note.preacher;
  if (note.location) data.location = note.location;
  if (note.scripture) data.scripture = note.scripture;
```

**Step 4: parse 구현** (`src/markdown/parse.ts`)

`markdownToNote` 의 `return { ... }` 직전에 추출 로직 추가:

```typescript
  const sermonDate = typeof fm.sermonDate === "string" ? fm.sermonDate : null;
  const preacher = typeof fm.preacher === "string" ? fm.preacher : null;
  const location = typeof fm.location === "string" ? fm.location : null;
  const scripture = typeof fm.scripture === "string" ? fm.scripture : null;

  return {
    id,
    title,
    body: blocks,
    createdAt,
    updatedAt,
    citedRefs,
    sermonDate,
    preacher,
    location,
    scripture,
  };
```

**Step 5: 테스트 통과 확인**

Run: `pnpm jest src/markdown/__tests__/roundtrip.test.ts src/markdown/__tests__/serialize.test.ts`
Expected: PASS.

> `serialize.test.ts` 의 기존 `note` 객체도 `Note` 타입을 만족하도록 새 필드(또는 최소 `sermonDate: null` 등)를 추가해야 할 수 있다. 타입 에러가 나면 그 테스트의 fixture에 `sermonDate: null, preacher: null, location: null, scripture: null` 을 추가한다.

**Step 6: 커밋**

```bash
git add src/markdown/serialize.ts src/markdown/parse.ts src/markdown/__tests__/roundtrip.test.ts src/markdown/__tests__/serialize.test.ts
git commit -m "feat(markdown): round-trip sermon metadata through frontmatter"
```

---

## Task 13: 전체 검증 (자동 + 수동)

**Step 1: 전체 단위 테스트 + 타입체크**

Run (from `apps/ch-life/`):
```bash
pnpm jest && pnpm exec tsc --noEmit
```
Expected: 모든 테스트 PASS, 타입 에러 0.

**Step 2: 앱 실행 — 수동 UI 검증**

Run: `pnpm start` (또는 `pnpm ios` / `pnpm android`)

폰 시뮬레이터에서 노트 편집 화면(`/note/[id]`) 확인 체크리스트:
- [ ] 상단에 제목·날짜·설교자·장소·생명양식 라벨 필드가 항상 보인다.
- [ ] 제목/설교자/장소 입력 → 0.5초 후 자동저장, 앱 재진입 시 유지된다.
- [ ] 날짜 필드 탭 → 앱 내장 달력 모달이 열린다. 이전/다음 달 이동, 날짜 선택, "오늘" 버튼이 동작하고 선택값이 `2026년 5월 24일` 형식으로 표시된다.
- [ ] 생명양식에 유효한 본문(예: `요 3:16`) 입력 → ✓ 표시되고 📖 활성화. 📖 탭 → 본문 미리보기 모달이 뜬다.
- [ ] 생명양식에 잘못된 값 입력 → ✓ 없음, 📖 비활성(흐림).
- [ ] 4개 변형 테마(미니멀/종이/포커스/다크)에서 헤더 색·대비가 자연스럽다.
- [ ] 폰트 스케일 1.0~1.6 에서 레이아웃이 깨지지 않는다 (어르신 친화 큰 글자).
- [ ] 공유(↑) → 내보낸 `.md` frontmatter에 sermonDate/preacher/location/scripture가 포함된다.

태블릿(넓은 화면/iPad) 에서 `TabletWorkspace` 확인:
- [ ] 가운데 패널 상단에 동일한 헤더가 보인다.
- [ ] 노트 전환 시 각 노트의 메타가 올바르게 바뀐다.
- [ ] 자동저장 후 좌측 목록이 갱신된다.

> RN 컴포넌트 자동 테스트 라이브러리가 없어 위 UI 항목은 **수동 검증**이다. 자동화가 필요하면 별도 작업으로 `@testing-library/react-native` 도입을 제안한다.

**Step 3: 마무리 커밋(필요 시)**

수동 검증 중 사소한 스타일 수정이 생기면:

```bash
git add -A
git commit -m "fix(editor): polish sermon metadata header after manual verification"
```

---

## 요약 — 작업 순서

1. `Note` 타입 확장
2. DB 스키마 + 멱등 컬럼 마이그레이션
3. note-repo create/update/read
4. `calendar.ts` 순수 헬퍼
5. `scripture-field.ts` 순수 헬퍼
6. `DatePickerModal` (앱 내장 달력)
7. `ScripturePreviewModal` (본문 미리보기)
8. `SermonMetaHeader` (항상 보이는 라벨 필드)
9. `useAutoSave` 확장 + `buildSavePayload`
10. 폰 화면 연결
11. 태블릿 화면 연결
12. Markdown frontmatter 왕복
13. 전체 검증 (자동 + 수동)

각 Task는 RED → GREEN → COMMIT. 순수 로직(1·2·3·4·5·9·12)은 테스트로 보호하고, UI(6·7·8·10·11)는 얇게 유지 + 수동 검증한다.
