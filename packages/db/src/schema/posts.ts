import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { user } from "./auth";
import { CURRENT_TIMESTAMP_MS, jsonText, timestampMs } from "./helpers";

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  prompt: text("prompt").default("").notNull(),
  comment: text("comment").notNull(),
  media: jsonText<string[]>("media").default(sql`'[]'`).notNull(),
  isPublic: integer("is_public", { mode: "boolean" }).default(false).notNull(),
  likes: integer("likes").default(0).notNull(),
  visits: integer("visits").default(0).notNull(),
  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestampMs("created_at").default(CURRENT_TIMESTAMP_MS).notNull(),
  updatedAt: timestampMs("updated_at")
    .default(CURRENT_TIMESTAMP_MS)
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: timestampMs("deleted_at"),
});

export const postLikes = sqliteTable(
  "post_likes",
  {
    id: text("id").primaryKey(),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestampMs("created_at")
      .default(CURRENT_TIMESTAMP_MS)
      .notNull(),
  },
  (table) => [
    uniqueIndex("post_likes_user_post_unique").on(table.postId, table.userId),
    index("post_likes_post_id_idx").on(table.postId),
    index("post_likes_user_id_idx").on(table.userId),
  ]
);

export const postsRelations = relations(posts, ({ one, many }) => ({
  createdBy: one(user, {
    fields: [posts.createdById],
    references: [user.id],
  }),
  likes: many(postLikes),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, {
    fields: [postLikes.postId],
    references: [posts.id],
  }),
  user: one(user, {
    fields: [postLikes.userId],
    references: [user.id],
  }),
}));

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type PostLike = typeof postLikes.$inferSelect;
