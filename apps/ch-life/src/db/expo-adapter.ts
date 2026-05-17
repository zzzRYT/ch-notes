import type * as SQLite from "expo-sqlite";
import { getDb } from "./index";
import { makeNoteRepo, type DbAdapter, type NoteRepo } from "./note-repo";

function adapterFromExpoDb(db: SQLite.SQLiteDatabase): DbAdapter {
  return {
    execAsync: (sql) => db.execAsync(sql),
    runAsync: async (sql, params = []) => {
      await db.runAsync(sql, params as never);
    },
    getAllAsync: async <T,>(sql: string, params: unknown[] = []) =>
      (await db.getAllAsync(sql, params as never)) as T[],
    getFirstAsync: async <T,>(sql: string, params: unknown[] = []) => {
      const r = await db.getFirstAsync(sql, params as never);
      return (r as T | null) ?? null;
    },
  };
}

export async function openNoteRepo(): Promise<NoteRepo> {
  const db = await getDb();
  return makeNoteRepo(adapterFromExpoDb(db));
}
