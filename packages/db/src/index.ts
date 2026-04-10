import { getBinding } from "@actnow/common/runtime-env";
import { type AnyColumn, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

type D1Client = Parameters<typeof drizzle>[0];

export type DbType = ReturnType<typeof drizzle<typeof schema>>;

const dbCache = new WeakMap<object, DbType>();

function resolveClient(database?: D1Client): D1Client {
  return database ?? getBinding<D1Client>("DB");
}

export function createDb(database?: D1Client): DbType {
  const client = resolveClient(database);
  const cached = dbCache.get(client as object);
  if (cached) {
    return cached;
  }

  const db = drizzle(client, { schema });
  dbCache.set(client as object, db);
  return db;
}

export const db = new Proxy({} as DbType, {
  get(_target, property, receiver) {
    return Reflect.get(createDb(), property, receiver);
  },
});

export function ilike(column: AnyColumn, value: string) {
  return sql`lower(${column}) like ${value.toLowerCase()}`;
}

export {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  isNull,
  like,
  lt,
  lte,
  max,
  ne,
  not,
  or,
  type SQL,
  sql,
} from "drizzle-orm";
