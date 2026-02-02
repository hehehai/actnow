import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const posts = pgTable("posts", {
  id: text("id").primaryKey(),
  prompt: text("prompt").default("").notNull(),
  comment: text("comment").notNull(),
  media: jsonb("media").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  likes: integer("likes").default(0).notNull(),
  visits: integer("visits").default(0).notNull(),
  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const postLikes = pgTable(
  "post_likes",
  {
    id: text("id").primaryKey(),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
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
