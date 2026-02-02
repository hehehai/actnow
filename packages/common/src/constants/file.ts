import type { util } from "zod";

export const IMAGE_MIME_TYPES: util.MimeTypes[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
] as const;

export const VIDEO_MIME_TYPES: util.MimeTypes[] = [
  "video/mp4",
  "video/webm",
] as const;

export const ALL_MIME_TYPES: util.MimeTypes[] = [
  ...IMAGE_MIME_TYPES,
  ...VIDEO_MIME_TYPES,
] as const;

export const MAX_SIZE_PUBLIC = 2 * 1024 * 1024; // 2MB (for public uploads like signup avatar)
export const MAX_SIZE_USER = 5 * 1024 * 1024; // 5MB
export const MAX_SIZE_ADMIN = 20 * 1024 * 1024; // 20MB
