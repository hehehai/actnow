import { relations, sql } from "drizzle-orm";
import {
  index,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { CURRENT_TIMESTAMP_MS, timestampMs } from "./helpers";
import { posts } from "./posts";

export const TAG_TYPES = ["platform", "model", "style"] as const;

export const tags = sqliteTable(
  "tags",
  {
    id: text("id").primaryKey(),
    name: text("name", { length: 100 }).notNull(),
    value: text("value", { length: 100 }).notNull(),
    type: text("type", { enum: TAG_TYPES }).notNull(),
    description: text("description"),
    tipMedia: text("tip_media"),
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
    index("tags_type_idx").on(table.type),
    index("tags_name_idx").on(table.name),
    uniqueIndex("tags_value_type_unique")
      .on(table.value, table.type)
      .where(sql`${table.deletedAt} IS NULL`),
  ]
);

export const postTags = sqliteTable(
  "post_tags",
  {
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: timestampMs("created_at")
      .default(CURRENT_TIMESTAMP_MS)
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.tagId] }),
    index("post_tags_post_id_idx").on(table.postId),
    index("post_tags_tag_id_idx").on(table.tagId),
  ]
);

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type TagType = (typeof TAG_TYPES)[number];
export type PostTag = typeof postTags.$inferSelect;
