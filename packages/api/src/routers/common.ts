import {
  adminUploadSchema,
  getFileUrlSchema,
  publicUploadSchema,
  uploadUrlSchema,
  userUploadSchema,
} from "@actnow/common";
import { adminProcedure, protectedProcedure, publicProcedure } from "../index";
import {
  getDownloadSignedUrl,
  getUploadSignedUrl,
  uploadR2File,
} from "../lib/r2";

export const commonRouter = {
  getUploadUrl: protectedProcedure
    .input(uploadUrlSchema)
    .handler(async ({ input }) => getUploadSignedUrl(input)),

  /**
   * Public file upload for unauthenticated users (max 2MB, images only)
   * Used for signup avatar upload
   */
  publicUpload: publicProcedure
    .input(publicUploadSchema)
    .handler(async ({ input }) => uploadR2File(input.file, input.file.name)),

  /**
   * Direct file upload for user (max 5MB, images only)
   */
  upload: protectedProcedure
    .input(userUploadSchema)
    .handler(async ({ input }) => uploadR2File(input.file, input.file.name)),

  /**
   * Direct file upload for admin (max 20MB, images + videos)
   */
  adminUpload: adminProcedure
    .input(adminUploadSchema)
    .handler(async ({ input }) => uploadR2File(input.file, input.file.name)),

  /**
   * Get pre-signed download URL for private files
   */
  getFileUrl: protectedProcedure
    .input(getFileUrlSchema)
    .handler(async ({ input }) => {
      const url = await getDownloadSignedUrl(input.fileName, input.expiresIn);
      return { url };
    }),
};
