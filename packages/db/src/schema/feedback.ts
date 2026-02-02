import { relations, sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const feedbackStatusEnum = pgEnum("feedback_status", [
  "PENDING",
  "REPLIED",
]);

export const feedbacks = pgTable(
  "feedbacks",
  {
    id: text("id").primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    content: text("content"),
    snapshots: jsonb("snapshots")
      .$type<string[]>()
      .default(sql`'[]'::jsonb`)
      .notNull(),
    status: feedbackStatusEnum("status").default("PENDING").notNull(),
    replyContent: text("reply_content"),
    repliedAt: timestamp("replied_at"),
    createdById: text("created_by_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
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
