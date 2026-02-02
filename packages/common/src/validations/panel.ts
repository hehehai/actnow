import { z } from "zod";
import { paginationSchema, slugSchema } from "./common";

// User list query
export const userListSchema = paginationSchema.extend({
  search: z.string().optional(),
  role: z.enum(["ADMIN", "USER"]).optional(),
  status: z.enum(["normal", "ban"]).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// User create
export const userCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email"),
  role: z.enum(["ADMIN", "USER"]).default("USER"),
  image: z.url().nullable().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// User update
export const userUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  role: z.enum(["ADMIN", "USER"]).optional(),
  image: z.url().nullable().optional(),
  password: z.string().min(8).optional(),
});

// User form schema (for client-side validation)
export const userFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email"),
    role: z.enum(["ADMIN", "USER"]),
    image: z.url().nullable(),
    password: z.string(),
    mode: z.enum(["create", "edit"]),
  })
  .refine(
    (data) => {
      if (data.mode === "create") {
        return data.password && data.password.length >= 8;
      }
      return (
        !data.password ||
        data.password.length === 0 ||
        data.password.length >= 8
      );
    },
    {
      message: "Password must be at least 8 characters",
      path: ["password"],
    }
  );

export type UserFormData = z.infer<typeof userFormSchema>;

// User ban
export const userBanSchema = z.object({
  id: z.string(),
  reason: z.string().min(1, "Ban reason is required"),
  expiresAt: z.coerce.date().optional(),
});

// User ID schema
export const userIdSchema = z.object({
  id: z.string(),
});

// Batch delete users
export const userBatchDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one user ID is required"),
});

// User list for filter dropdown (lightweight)
export const userListForFilterSchema = z.object({
  search: z.string().optional(),
  limit: z.number().min(1).max(50).default(20),
});

// Stats period
export const statPeriodSchema = z.object({
  period: z.enum(["24h", "7d", "15d", "30d"]).default("24h"),
});

// Like leaderboard range
export const likeLeaderboardRangeEnum = z.enum([
  "today",
  "yesterday",
  "this_week",
  "last_week",
  "this_month",
  "last_month",
  "this_year",
]);

export const likeLeaderboardSchema = z.object({
  range: likeLeaderboardRangeEnum.default("today"),
  limit: z.number().min(1).max(50).default(10),
});

// ============ Post Schemas ============

export const postListSchema = paginationSchema.extend({
  search: z.string().optional(),
  visibility: z.enum(["public", "all"]).default("all"),
  sortBy: z
    .enum(["createdAt", "updatedAt", "likes", "visits"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  tagIds: z.array(z.string()).optional(),
  createdById: z.string().optional(),
});

export const postIdSchema = z.object({
  id: z.string(),
});

export const postBatchDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one post ID is required"),
});

export const postAdminUpsertSchema = z.object({
  id: z.string().optional(),
  prompt: z.string().max(1000).optional(),
  comment: z.string().min(1, "Comment is required").max(500),
  media: z.array(z.string().url("Invalid media URL")).max(10).optional(),
  isPublic: z.boolean().default(false),
  tagIds: z.array(z.string()).default([]),
});

// Tag type enum
export const tagTypeSchema = z.enum(["platform", "model", "style"]);

// Tag ID schema
export const tagIdSchema = z.object({
  id: z.string(),
});

// Tag list query
export const tagListSchema = paginationSchema.extend({
  search: z.string().optional(),
  type: tagTypeSchema.optional(),
  sortBy: z.enum(["createdAt", "name"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Tag upsert (id optional - no id = create, with id = update)
export const tagUpsertSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required").max(100),
  value: slugSchema,
  type: tagTypeSchema,
  description: z.string().nullable().optional(),
  tipMedia: z.url().nullable().optional(),
});

// Batch delete tags
export const tagBatchDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one tag ID is required"),
});

// Tag list for select dropdown (lightweight, no pagination)
export const tagListForSelectSchema = z.object({
  search: z.string().optional(),
  type: tagTypeSchema.optional(),
  limit: z.number().min(1).max(100).default(50),
});

// Tag list by IDs (for fetching specific tags)
export const tagListByIdsSchema = z.object({
  ids: z.array(z.string()),
});

// Type exports
export type UserList = z.infer<typeof userListSchema>;
export type UserCreate = z.infer<typeof userCreateSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type UserBan = z.infer<typeof userBanSchema>;
export type UserBatchDelete = z.infer<typeof userBatchDeleteSchema>;
export type UserListForFilter = z.infer<typeof userListForFilterSchema>;
export type StatPeriod = z.infer<typeof statPeriodSchema>;
export type LikeLeaderboardRange = z.infer<typeof likeLeaderboardRangeEnum>;
export type LikeLeaderboard = z.infer<typeof likeLeaderboardSchema>;
export type PostList = z.infer<typeof postListSchema>;
export type PostAdminUpsert = z.infer<typeof postAdminUpsertSchema>;
export type PostId = z.infer<typeof postIdSchema>;
export type PostBatchDelete = z.infer<typeof postBatchDeleteSchema>;
export type TagType = z.infer<typeof tagTypeSchema>;
export type TagList = z.infer<typeof tagListSchema>;
export type TagUpsert = z.infer<typeof tagUpsertSchema>;
export type TagBatchDelete = z.infer<typeof tagBatchDeleteSchema>;
export type TagListForSelect = z.infer<typeof tagListForSelectSchema>;
export type TagListByIds = z.infer<typeof tagListByIdsSchema>;
