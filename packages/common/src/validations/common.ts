import { z } from "zod";

/**
 * Common reusable Zod validators
 */

// Email validation
export const emailSchema = z.email("Please enter a valid email address");

// Password validation with comprehensive rules
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// Simple password (no complexity requirements, just min length)
export const simplePasswordSchema = z.string().min(1, "Password is required");

// Image validation
export const imageSchema = z
  .file()
  .max(5_000_000, "Image size must be less than 5MB")
  .mime(["image/jpeg", "image/png", "image/webp"]);

// URL validation
export const urlSchema = z.url("Please enter a valid URL");

// Optional URL (empty string or valid URL)
export const optionalUrlSchema = z
  .string()
  .transform((val) => val.trim())
  .refine((val) => val === "" || z.string().safeParse(val).success, {
    message: "Please enter a valid URL",
  });

// UUID validation
export const uuidSchema = z.uuid("Invalid ID format");

// Pagination schemas
export const paginationSchema = z.object({
  page: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(100).default(10),
});

export const cursorPaginationSchema = z.object({
  cursor: z.string().nullish(),
  limit: z.number().int().min(1).max(100).default(10),
});

// Name fields
export const nameSchema = z.string().min(1, "Name is required").max(100);

// Search query
export const searchSchema = z.string().max(200).optional();

/**
 * Helper to create a password confirmation schema
 */
export function createPasswordConfirmationSchema(passwordField = "password") {
  return z
    .object({
      [passwordField]: passwordSchema,
      passwordConfirmation: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data[passwordField] === data.passwordConfirmation, {
      message: "Passwords do not match",
      path: ["passwordConfirmation"],
    });
}

// Slug validation schema - URL-friendly identifier
export const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .max(255, "Slug must be 255 characters or less")
  .regex(
    /^[a-z0-9]+(?:[_-][a-z0-9]+)*$/,
    "Slug must be lowercase alphanumeric with hyphens or underscores"
  );
