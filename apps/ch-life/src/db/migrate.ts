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
