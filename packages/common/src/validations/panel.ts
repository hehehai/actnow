import { z } from "zod";
import { paginationSchema } from "./common";

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

// ============ Post Schemas ============

export const postListSchema = paginationSchema.extend({
  search: z.string().optional(),
  status: z.enum(["all", "draft", "published"]).default("all"),
  sortBy: z.enum(["createdAt", "publishedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
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
  title: z.string().trim().min(1, "Title is required").max(160),
  description: z.string().max(500).default(""),
  cover: z.url("Invalid cover URL").nullable().optional(),
  content: z.string().trim().min(1, "Content is required"),
  status: z.enum(["draft", "published"]).default("draft"),
});

// Type exports
export type UserList = z.infer<typeof userListSchema>;
export type UserCreate = z.infer<typeof userCreateSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type UserBan = z.infer<typeof userBanSchema>;
export type UserBatchDelete = z.infer<typeof userBatchDeleteSchema>;
export type UserListForFilter = z.infer<typeof userListForFilterSchema>;
export type PostList = z.infer<typeof postListSchema>;
export type PostAdminUpsert = z.infer<typeof postAdminUpsertSchema>;
export type PostId = z.infer<typeof postIdSchema>;
export type PostBatchDelete = z.infer<typeof postBatchDeleteSchema>;
