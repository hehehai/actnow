import { relations, sql } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { posts } from "./posts";

// Tag type enum
export const tagTypeEnum = pgEnum("tag_type", ["platform", "model", "style"]);

// Tags table
export const tags = pgTable(
  "tags",
  {
    id: text("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    value: varchar("value", { length: 100 }).notNull(),
    type: tagTypeEnum("type").notNull(),
    description: text("description"),
    tipMedia: text("tip_media"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("tags_type_idx").on(table.type),
    index("tags_name_idx").on(table.name),
    // Partial unique index: value + type must be unique for non-deleted records
    uniqueIndex("tags_value_type_unique")
      .on(table.value, table.type)
      .where(sql`${table.deletedAt} IS NULL`),
  ]
);

// Post-Tag junction table
export const postTags = pgTable(
  "post_tags",
  {
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.tagId] }),
    index("post_tags_post_id_idx").on(table.postId),
    index("post_tags_tag_id_idx").on(table.tagId),
  ]
);

// Relations
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

// Type exports
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type TagType = (typeof tagTypeEnum.enumValues)[number];
export type PostTag = typeof postTags.$inferSelect;
