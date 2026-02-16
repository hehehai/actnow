import {
  userBanSchema,
  userBatchDeleteSchema,
  userCreateSchema,
  userIdSchema,
  userListForFilterSchema,
  userListSchema,
  userUpdateSchema,
} from "@actnow/common";
import { adminProcedure } from "../../index";
import {
  banUserService,
  batchDeleteUsersService,
  createUserService,
  deleteUserService,
  getUserByIdService,
  getUserStatsService,
  listUsersForFilterService,
  listUsersService,
  unbanUserService,
  updateUserService,
} from "../../services/panel/user-service";

export const userRouter = {
  listForFilter: adminProcedure
    .input(userListForFilterSchema)
    .handler(async ({ context, input }) =>
      listUsersForFilterService(context, input)
    ),

  list: adminProcedure
    .input(userListSchema)
    .handler(async ({ context, input }) => listUsersService(context, input)),

  getById: adminProcedure
    .input(userIdSchema)
    .handler(async ({ context, input }) => getUserByIdService(context, input)),

  getUserStats: adminProcedure
    .input(userIdSchema)
    .handler(async ({ context, input }) => getUserStatsService(context, input)),

  create: adminProcedure
    .input(userCreateSchema)
    .handler(async ({ context, input }) => createUserService(context, input)),

  update: adminProcedure
    .input(userUpdateSchema)
    .handler(async ({ context, input }) => updateUserService(context, input)),

  delete: adminProcedure
    .input(userIdSchema)
    .handler(async ({ context, input }) => deleteUserService(context, input)),

  batchDelete: adminProcedure
    .input(userBatchDeleteSchema)
    .handler(async ({ context, input }) =>
      batchDeleteUsersService(context, input)
    ),

  ban: adminProcedure
    .input(userBanSchema)
    .handler(async ({ context, input }) => banUserService(context, input)),

  unban: adminProcedure
    .input(userIdSchema)
    .handler(async ({ context, input }) => unbanUserService(context, input)),
};
