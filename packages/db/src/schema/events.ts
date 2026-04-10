import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth";
import { CURRENT_TIMESTAMP_MS, jsonText, timestampMs } from "./helpers";

export const EVENT_TYPES = [
  "POST_LIKED",
  "POST_UNLIKED",
  "POST_VIEWED",
] as const;

export const eventLogs = sqliteTable(
  "event_logs",
  {
    id: text("id").primaryKey(),
    eventType: text("event_type", { enum: EVENT_TYPES }).notNull(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    targetId: text("target_id"),
    targetType: text("target_type"),
    metadata: jsonText<Record<string, unknown> | null>("metadata"),
    createdAt: timestampMs("created_at")
      .default(CURRENT_TIMESTAMP_MS)
      .notNull(),
  },
  (table) => [
    index("event_logs_type_created_at_idx").on(
      table.eventType,
      table.createdAt
    ),
    index("event_logs_target_idx").on(table.targetType, table.targetId),
    index("event_logs_user_created_at_idx").on(table.userId, table.createdAt),
  ]
);

export type EventLog = typeof eventLogs.$inferSelect;
export type NewEventLog = typeof eventLogs.$inferInsert;
