import type { db as DbType } from "../index";

const MAX_D1_SQL_VARIABLES = 90;

type InsertableTable = Parameters<DbType["insert"]>[0] & {
  $inferInsert: Record<string, unknown>;
};

export async function insertInBatches<TTable extends InsertableTable>(
  db: typeof DbType,
  table: TTable,
  records: TTable["$inferInsert"][]
) {
  if (records.length === 0) {
    return;
  }

  const variablesPerRow = Math.max(1, Object.keys(records[0]!).length);
  const batchSize = Math.max(
    1,
    Math.floor(MAX_D1_SQL_VARIABLES / variablesPerRow)
  );

  for (let index = 0; index < records.length; index += batchSize) {
    await db
      .insert(table)
      .values(records.slice(index, index + batchSize))
      .onConflictDoNothing();
  }
}
