import { z } from "zod";

// Cursor-based pagination for infinite scroll
const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(50).default(12),
});

export const PostFeedSort = {
  LATEST: "latest",
} as const;

export type PostFeedSortType = (typeof PostFeedSort)[keyof typeof PostFeedSort];

// ============ Post Schemas ============

export const postFeedSchema = cursorPaginationSchema.extend({
  sort: z.enum([PostFeedSort.LATEST]).default(PostFeedSort.LATEST),
  search: z.string().max(200).optional(),
});

export const postDetailSchema = z.object({
  id: z.string(),
});

export const postSearchSchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.number().min(1).max(20).default(10),
});

// ============ User Profile Schemas ============

export const socialPlatformSchema = z.enum([
  "x",
  "website",
  "facebook",
  "instagram",
]);

export const socialLinkSchema = z.object({
  platform: socialPlatformSchema,
  url: z.url("Invalid social link URL"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  image: z.url("Invalid image URL").nullable().optional(),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
  socialLinks: z
    .array(socialLinkSchema)
    .max(4, "At most 4 social links are allowed")
    .refine(
      (links) =>
        new Set(links.map((link) => link.platform)).size === links.length,
      "Social platforms must be unique"
    )
    .optional(),
});

export const userPublicProfileSchema = z.object({
  id: z.string(),
});

// ============ Type Exports ============

export type PostFeed = z.infer<typeof postFeedSchema>;
export type PostDetail = z.infer<typeof postDetailSchema>;
export type PostSearch = z.infer<typeof postSearchSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type SocialLink = z.infer<typeof socialLinkSchema>;
export type UserPublicProfileInput = z.infer<typeof userPublicProfileSchema>;
