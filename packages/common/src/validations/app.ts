import { z } from "zod";

// Cursor-based pagination for infinite scroll
const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(50).default(12),
});

export const PostFeedSort = {
  LATEST: "latest",
  POPULAR: "popular",
} as const;

export type PostFeedSortType = (typeof PostFeedSort)[keyof typeof PostFeedSort];

// ============ Post Schemas ============

export const postFeedSchema = cursorPaginationSchema.extend({
  sort: z
    .enum([PostFeedSort.LATEST, PostFeedSort.POPULAR])
    .default(PostFeedSort.LATEST),
  tagSlugs: z.array(z.string()).optional(),
  search: z.string().max(200).optional(),
  visibility: z.enum(["public", "all"]).default("public"),
});

export const postDetailSchema = z.object({
  id: z.string(),
});

export const postUpsertSchema = z.object({
  id: z.string().optional(),
  prompt: z.string().max(1000).optional(),
  comment: z.string().min(1, "Comment is required").max(500),
  media: z.array(z.url("Invalid media URL")).max(10).optional(),
  isPublic: z.boolean().default(false),
  tagIds: z.array(z.string()).default([]),
});

export const postDeleteSchema = z.object({
  id: z.string(),
});

export const postVisibilitySchema = z.object({
  id: z.string(),
  isPublic: z.boolean(),
});

export const postSearchSchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.number().min(1).max(20).default(10),
});

export const userPopularSchema = z.object({
  limit: z.number().min(1).max(10).default(3),
});

export const postTrendingSchema = z.object({
  postsLimit: z.number().min(1).max(20).default(6),
  tagsLimit: z.number().min(1).max(20).default(6),
});

export const postTagsByTypeSchema = z.object({
  type: z.enum(["platform", "model", "style"]),
});

export const postTrackViewSchema = z.object({
  postId: z.string(),
});

export const postSimilarSchema = z.object({
  postId: z.string(),
  tagIds: z.array(z.string()),
  limit: z.number().min(1).max(20).default(6),
});

// ============ Like Schemas ============

export const togglePostLikeSchema = z.object({
  postId: z.string(),
});

export const postLikesFeedSchema = cursorPaginationSchema;

export const postLikeStatusSchema = z.object({
  postIds: z.array(z.string()),
});

// ============ User Profile Schemas ============

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  image: z.url("Invalid image URL").nullable().optional(),
});

// ============ Tag Schemas ============

export const tagsByTypeSchema = postTagsByTypeSchema;

export const userPublicProfileSchema = z.object({
  id: z.string(),
});

// ============ Type Exports ============

export type PostFeed = z.infer<typeof postFeedSchema>;
export type PostDetail = z.infer<typeof postDetailSchema>;
export type PostUpsert = z.infer<typeof postUpsertSchema>;
export type PostDelete = z.infer<typeof postDeleteSchema>;
export type PostVisibility = z.infer<typeof postVisibilitySchema>;
export type PostSearch = z.infer<typeof postSearchSchema>;
export type UserPopular = z.infer<typeof userPopularSchema>;
export type PostTrending = z.infer<typeof postTrendingSchema>;
export type TogglePostLike = z.infer<typeof togglePostLikeSchema>;
export type PostLikesFeed = z.infer<typeof postLikesFeedSchema>;
export type PostLikeStatus = z.infer<typeof postLikeStatusSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type TagsByType = z.infer<typeof postTagsByTypeSchema>;
export type UserPublicProfileInput = z.infer<typeof userPublicProfileSchema>;
export type PostSimilar = z.infer<typeof postSimilarSchema>;
