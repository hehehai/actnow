import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// Event type enum - extensible for future events
export const eventTypeEnum = pgEnum("event_type", [
  "POST_LIKED",
  "POST_UNLIKED",
  "POST_VIEWED",
]);

// Generic event logs table for tracking various business events
export const eventLogs = pgTable(
  "event_logs",
  {
    id: text("id").primaryKey(),
    eventType: eventTypeEnum("event_type").notNull(),

    // Generic association fields (used based on event type)
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    targetId: text("target_id"), // Target object ID (postId, tagId, etc.)
    targetType: text("target_type"), // Target type ("post", "tag", etc.)

    // Extra data (JSON format for event-specific data)
    metadata: jsonb("metadata"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
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

// Type exports
export type EventLog = typeof eventLogs.$inferSelect;
export type NewEventLog = typeof eventLogs.$inferInsert;
