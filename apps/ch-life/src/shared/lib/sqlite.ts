import * as SQLite from "expo-sqlite";

// 저장소 어댑터가 기대하는 최소 실행 인터페이스. 프로덕션은 expo-sqlite,
// 테스트는 better-sqlite3가 같은 모양으로 구현한다.
export type DbAdapter = {
  execAsync: (sql: string) => Promise<void>;
  runAsync: (sql: string, params?: unknown[]) => Promise<unknown>;
  getAllAsync: <T>(sql: string, params?: unknown[]) => Promise<T[]>;
  getFirstAsync: <T>(sql: string, params?: unknown[]) => Promise<T | null>;
};

export type Migration = (db: DbAdapter) => Promise<void>;

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

/**
 * 파일 DB를 여는 지연 어댑터. 첫 질의 때 한 번만 열고 마이그레이션을 순서대로
 * 실행한다 — 부팅 렌더를 막지 않고(`RULE-OTA-002`), 어떤 마이그레이션을 어떤
 * 순서로 돌릴지는 호출한 Composition Root가 정한다.
 */
export function openSqliteDatabase(
  name: string,
  migrations: ReadonlyArray<Migration>,
): DbAdapter {
  let ready: Promise<DbAdapter> | null = null;
  const open = () => {
    if (!ready) {
      ready = (async () => {
        const adapter = adapterFromExpoDb(await SQLite.openDatabaseAsync(name));
        for (const migrate of migrations) await migrate(adapter);
        return adapter;
      })();
    }
    return ready;
  };
  return {
    execAsync: async (sql) => (await open()).execAsync(sql),
    runAsync: async (sql, params) => (await open()).runAsync(sql, params),
    getAllAsync: async <T,>(sql: string, params?: unknown[]) =>
      (await open()).getAllAsync<T>(sql, params),
    getFirstAsync: async <T,>(sql: string, params?: unknown[]) =>
      (await open()).getFirstAsync<T>(sql, params),
  };
}
