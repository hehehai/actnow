import { relations, sql } from "drizzle-orm";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth";
import { CURRENT_TIMESTAMP_MS, jsonText, timestampMs } from "./helpers";

export const FEEDBACK_STATUSES = ["PENDING", "REPLIED"] as const;

export const feedbacks = sqliteTable(
  "feedbacks",
  {
    id: text("id").primaryKey(),
    title: text("title", { length: 200 }).notNull(),
    content: text("content"),
    snapshots: jsonText<string[]>("snapshots").default(sql`'[]'`).notNull(),
    status: text("status", { enum: FEEDBACK_STATUSES })
      .default("PENDING")
      .notNull(),
    replyContent: text("reply_content"),
    repliedAt: timestampMs("replied_at"),
    createdById: text("created_by_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestampMs("created_at")
      .default(CURRENT_TIMESTAMP_MS)
      .notNull(),
    updatedAt: timestampMs("updated_at")
      .default(CURRENT_TIMESTAMP_MS)
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestampMs("deleted_at"),
  },
  (table) => [
    index("feedbacks_created_by_idx").on(table.createdById),
    index("feedbacks_status_idx").on(table.status),
  ]
);

export const feedbacksRelations = relations(feedbacks, ({ one }) => ({
  createdBy: one(user, {
    fields: [feedbacks.createdById],
    references: [user.id],
  }),
}));

export type Feedback = typeof feedbacks.$inferSelect;
export type NewFeedback = typeof feedbacks.$inferInsert;
