import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type DbType = ReturnType<typeof drizzle<typeof schema>>;

function resolveConnectionString(connectionString?: string): string {
  const value = connectionString ?? process.env.DATABASE_URL;
  if (!value) {
    throw new Error("DATABASE_URL is not set");
  }
  return value;
}

const dbCache = new Map<string, DbType>();

export function createDb(connectionString?: string): DbType {
  const connStr = resolveConnectionString(connectionString);
  const cached = dbCache.get(connStr);
  if (cached) {
    return cached;
  }

  const sql = postgres(connStr, {
    prepare: false,
  });
  const database = drizzle(sql, { schema });
  dbCache.set(connStr, database);
  return database;
}

export const db = createDb();

// 重新导出 drizzle-orm 操作符，确保整个项目使用同一个 drizzle-orm 实例
export {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNull,
  lt,
  lte,
  max,
  ne,
  not,
  or,
  type SQL,
  sql,
} from "drizzle-orm";
export type { PgColumn } from "drizzle-orm/pg-core";
