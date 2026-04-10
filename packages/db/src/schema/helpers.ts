import { sql } from "drizzle-orm";
import { integer, text } from "drizzle-orm/sqlite-core";

export const CURRENT_TIMESTAMP_MS = sql`(cast((julianday('now') - 2440587.5) * 86400000 as integer))`;

export function timestampMs(name: string) {
  return integer(name, { mode: "timestamp_ms" });
}

export function jsonText<T>(name: string) {
  return text(name, { mode: "json" }).$type<T>();
}
