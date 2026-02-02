import z from "zod";
import {
  ALL_MIME_TYPES,
  IMAGE_MIME_TYPES,
  MAX_SIZE_ADMIN,
  MAX_SIZE_PUBLIC,
  MAX_SIZE_USER,
} from "../constants/file";

export const uploadUrlSchema = z.string().min(1);

export type UploadUrlSchema = z.infer<typeof uploadUrlSchema>;

export const publicUploadSchema = z.object({
  file: z
    .file()
    .max(MAX_SIZE_PUBLIC, "File size exceeds 2MB limit")
    .mime(IMAGE_MIME_TYPES, "Only image files are allowed"),
});

export type PublicUploadSchema = z.infer<typeof publicUploadSchema>;

export const userUploadSchema = z.object({
  file: z
    .file()
    .max(MAX_SIZE_USER, "File size exceeds 5MB limit")
    .mime(IMAGE_MIME_TYPES, "Only image files are allowed"),
});

export const adminUploadSchema = z.object({
  file: z
    .file()
    .max(MAX_SIZE_ADMIN, "File size exceeds 20MB limit")
    .mime(ALL_MIME_TYPES, "Only image and video files are allowed"),
});

export type AdminUploadSchema = z.infer<typeof adminUploadSchema>;

export const getFileUrlSchema = z.object({
  fileName: z.string().min(1),
  expiresIn: z.number().min(60).max(86_400).optional().default(3600), // max: 86400 seconds (1 day)
});

export type GetFileUrlSchema = z.infer<typeof getFileUrlSchema>;
