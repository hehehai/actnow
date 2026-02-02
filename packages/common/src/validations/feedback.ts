import { z } from "zod";

const snapshotsArraySchema = z
  .array(z.string().url("Invalid snapshot URL"))
  .max(3, "You can provide up to 3 snapshots");

const snapshotsTransform = snapshotsArraySchema
  .optional()
  .transform((value) => value?.slice(0, 3) ?? []);

export const feedbackStatusFilterSchema = z.enum(["ALL", "PENDING", "REPLIED"]);
export type FeedbackStatusFilter = z.infer<typeof feedbackStatusFilterSchema>;

export const feedbackCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z
    .string()
    .min(1, "Content is required")
    .max(2000, "Content must be less than 2000 characters"),
  snapshots: snapshotsTransform,
});

export const feedbackUpdateSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(2000).optional(),
  snapshots: snapshotsTransform,
});

export const feedbackIdSchema = z.object({
  id: z.string(),
});

export const feedbackDeleteSchema = feedbackIdSchema;

export const feedbackReplySchema = z.object({
  id: z.string(),
  replyContent: z
    .string()
    .min(1, "Reply is required")
    .max(2000, "Reply must be less than 2000 characters"),
});

const adminPaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
});

export const feedbackListSchema = adminPaginationSchema.extend({
  search: z.string().optional(),
  status: feedbackStatusFilterSchema.default("PENDING"),
  userId: z.string().optional(),
  sortBy: z.enum(["createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type FeedbackListInput = z.infer<typeof feedbackListSchema>;
export type FeedbackCreate = z.infer<typeof feedbackCreateSchema>;
export type FeedbackUpdate = z.infer<typeof feedbackUpdateSchema>;
export type FeedbackReply = z.infer<typeof feedbackReplySchema>;
