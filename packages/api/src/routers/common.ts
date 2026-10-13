import {
  adminUploadSchema,
  publicUploadSchema,
  userUploadSchema,
} from "@actnow/common";
import { adminProcedure, protectedProcedure, publicProcedure } from "../index";
import { uploadR2File } from "../lib/r2";

export const commonRouter = {
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
};
