import { updateProfileSchema, userPublicProfileSchema } from "@actnow/common";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../../index";
import {
  deleteAllUserFeedbackService,
  ensureBillingCustomerService,
  getCurrentProfileService,
  getLinkedAccountsService,
  getPublicProfileService,
  getUserSessionsService,
  revokeSessionService,
  setPasswordService,
  syncBillingSnapshotService,
  updateProfileService,
} from "../../services/app/user-service";

export const appUserRouter = {
  publicProfile: publicProcedure
    .input(userPublicProfileSchema)
    .handler(async ({ context, input }) =>
      getPublicProfileService(context, input)
    ),

  getProfile: protectedProcedure.handler(async ({ context }) =>
    getCurrentProfileService(context)
  ),

  ensureBillingCustomer: protectedProcedure.handler(async ({ context }) =>
    ensureBillingCustomerService(context)
  ),

  syncBillingSnapshot: protectedProcedure.handler(async ({ context }) =>
    syncBillingSnapshotService(context)
  ),

  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .handler(async ({ context, input }) =>
      updateProfileService(context, input)
    ),

  getSessions: protectedProcedure.handler(async ({ context }) =>
    getUserSessionsService(context)
  ),

  getLinkedAccounts: protectedProcedure.handler(async ({ context }) =>
    getLinkedAccountsService(context)
  ),

  revokeSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .handler(async ({ context, input }) =>
      revokeSessionService(context, input)
    ),

  deleteAllFeedback: protectedProcedure.handler(async ({ context }) =>
    deleteAllUserFeedbackService(context)
  ),

  setPassword: protectedProcedure
    .input(z.object({ newPassword: z.string().min(8) }))
    .handler(async ({ context, input }) => setPasswordService(context, input)),
};
