import {
  UserRole,
  userBanSchema,
  userBatchDeleteSchema,
  userCreateSchema,
  userIdSchema,
  userListForFilterSchema,
  userListSchema,
  userUpdateSchema,
} from "@actnow/common";
import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNull,
  lte,
  max,
  or,
  type SQL,
} from "@actnow/db";
import { account, session, user } from "@actnow/db/schema/auth";
import { postLikes, posts } from "@actnow/db/schema/posts";
import { ORPCError } from "@orpc/server";
import { adminProcedure } from "../../index";
import {
  buildPaginationResult,
  generateId,
  getCountFromResult,
  getPaginationOffset,
  getSortOrder,
  hashPassword,
} from "../../lib/utils";

export const userRouter = {
  // List users for filter dropdown (lightweight)
  listForFilter: adminProcedure
    .input(userListForFilterSchema)
    .handler(async ({ input, context }) => {
      const { search, limit } = input;
      const { db } = context;

      // Build where conditions - only USER role
      const conditions: SQL[] = [eq(user.role, "USER")];

      if (search) {
        const searchCondition = or(
          ilike(user.name, `%${search}%`),
          ilike(user.email, `%${search}%`)
        );
        if (searchCondition) {
          conditions.push(searchCondition);
        }
      }

      const whereClause = and(...conditions);

      // Get users ordered by updatedAt desc
      const users = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        })
        .from(user)
        .where(whereClause)
        .orderBy(desc(user.updatedAt))
        .limit(limit);

      return users;
    }),

  // List users with pagination, search, filter, sort
  list: adminProcedure
    .input(userListSchema)
    .handler(async ({ input, context }) => {
      const { page, limit, search, role, status, dateFrom, dateTo, sortOrder } =
        input;
      const { db } = context;
      const offset = getPaginationOffset({ page, pageSize: limit });

      // Build where conditions
      const conditions: SQL[] = [];

      if (search) {
        const searchCondition = or(
          ilike(user.name, `%${search}%`),
          ilike(user.email, `%${search}%`)
        );
        if (searchCondition) {
          conditions.push(searchCondition);
        }
      }

      if (role) {
        conditions.push(eq(user.role, role));
      }

      if (status === "ban") {
        conditions.push(eq(user.banned, true));
      } else if (status === "normal") {
        conditions.push(eq(user.banned, false));
      }

      if (dateFrom) {
        conditions.push(gte(user.createdAt, dateFrom));
      }

      if (dateTo) {
        conditions.push(lte(user.createdAt, dateTo));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const totalResult = await db
        .select({ count: count() })
        .from(user)
        .where(whereClause);
      const total = getCountFromResult(totalResult);

      // Get users with lastSignedIn (most recent session createdAt)
      const users = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
          banned: user.banned,
          banReason: user.banReason,
          createdAt: user.createdAt,
          lastSignedIn: max(session.createdAt),
        })
        .from(user)
        .leftJoin(session, eq(user.id, session.userId))
        .where(whereClause)
        .groupBy(user.id)
        .orderBy(getSortOrder(user.createdAt, sortOrder))
        .limit(limit)
        .offset(offset);

      return buildPaginationResult(users, total, { page, pageSize: limit });
    }),

  // Get user by ID with sessions and accounts
  getById: adminProcedure
    .input(userIdSchema)
    .handler(async ({ input, context }) => {
      const { db } = context;

      const userData = await db.query.user.findFirst({
        where: eq(user.id, input.id),
        with: {
          sessions: {
            columns: {
              id: true,
              createdAt: true,
              expiresAt: true,
              ipAddress: true,
              userAgent: true,
            },
          },
          accounts: {
            columns: {
              id: true,
              providerId: true,
              accountId: true,
              createdAt: true,
            },
          },
        },
      });

      if (!userData) {
        throw new ORPCError("NOT_FOUND", { message: "User not found" });
      }

      return userData;
    }),

  // Get user post statistics
  getUserStats: adminProcedure
    .input(userIdSchema)
    .handler(async ({ input, context }) => {
      const { db } = context;

      const totalResult = await db
        .select({ count: count() })
        .from(posts)
        .where(and(eq(posts.createdById, input.id), isNull(posts.deletedAt)));

      const approvedResult = await db
        .select({ count: count() })
        .from(posts)
        .where(
          and(
            eq(posts.createdById, input.id),
            eq(posts.isPublic, true),
            isNull(posts.deletedAt)
          )
        );

      return {
        totalPosts: getCountFromResult(totalResult),
        publicPosts: getCountFromResult(approvedResult),
      };
    }),

  // Create user
  create: adminProcedure
    .input(userCreateSchema)
    .handler(async ({ input, context }) => {
      const { password, ...userData } = input;
      const { db } = context;

      // Check if email already exists
      const existing = await db.query.user.findFirst({
        where: eq(user.email, input.email),
      });

      if (existing) {
        throw new ORPCError("CONFLICT", { message: "Email already exists" });
      }

      const userId = generateId();
      const hashedPassword = await hashPassword(password);

      // Create user
      const [newUser] = await db
        .insert(user)
        .values({
          id: userId,
          ...userData,
          emailVerified: true,
        })
        .returning();

      // Create account with password
      await db.insert(account).values({
        id: generateId(),
        accountId: userId,
        providerId: "credential",
        userId,
        password: hashedPassword,
      });

      return newUser;
    }),

  // Update user
  update: adminProcedure
    .input(userUpdateSchema)
    .handler(async ({ input, context }) => {
      const { id, password, ...updateData } = input;
      const { db } = context;

      // Check if user exists
      const existing = await db.query.user.findFirst({
        where: eq(user.id, id),
      });

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "User not found" });
      }

      // Check email uniqueness if email is being updated
      if (updateData.email && updateData.email !== existing.email) {
        const emailExists = await db.query.user.findFirst({
          where: eq(user.email, updateData.email),
        });

        if (emailExists) {
          throw new ORPCError("CONFLICT", { message: "Email already exists" });
        }
      }

      // Update user
      const [updated] = await db
        .update(user)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(user.id, id))
        .returning();

      // Update password if provided
      if (password) {
        const hashedPassword = await hashPassword(password);
        await db
          .update(account)
          .set({
            password: hashedPassword,
            updatedAt: new Date(),
          })
          .where(
            and(eq(account.userId, id), eq(account.providerId, "credential"))
          );
      }

      return updated;
    }),

  // Delete user (physical delete) - Admin users cannot be deleted
  delete: adminProcedure
    .input(userIdSchema)
    .handler(async ({ input, context }) => {
      const { db } = context;

      const existing = await db.query.user.findFirst({
        where: eq(user.id, input.id),
      });

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "User not found" });
      }

      // Prevent deletion of admin users
      if (existing.role === UserRole.ADMIN) {
        throw new ORPCError("FORBIDDEN", {
          message: "Admin users cannot be deleted. Use ban instead.",
        });
      }

      // Delete all user likes
      await db.delete(postLikes).where(eq(postLikes.userId, input.id));

      // Soft delete user posts
      await db
        .update(posts)
        .set({ deletedAt: new Date(), isPublic: false })
        .where(eq(posts.createdById, input.id));

      // Delete user (cascade will handle sessions and accounts)
      await db.delete(user).where(eq(user.id, input.id));

      return { success: true };
    }),

  // Batch delete users (physical delete) - Admin users are excluded
  batchDelete: adminProcedure
    .input(userBatchDeleteSchema)
    .handler(async ({ input, context }) => {
      const { ids } = input;
      const { db } = context;

      // Get users to check for admins
      const usersToDelete = await db
        .select({ id: user.id, role: user.role })
        .from(user)
        .where(inArray(user.id, ids));

      // Filter out admin users
      const nonAdminIds = usersToDelete
        .filter((u) => u.role !== UserRole.ADMIN)
        .map((u) => u.id);

      if (nonAdminIds.length === 0) {
        throw new ORPCError("FORBIDDEN", {
          message: "No users can be deleted. Admin users cannot be deleted.",
        });
      }

      // Delete all likes for these users
      await db.delete(postLikes).where(inArray(postLikes.userId, nonAdminIds));

      // Soft delete posts for these users
      await db
        .update(posts)
        .set({ deletedAt: new Date(), isPublic: false })
        .where(inArray(posts.createdById, nonAdminIds));

      // Delete users (cascade will handle sessions and accounts)
      await db.delete(user).where(inArray(user.id, nonAdminIds));

      const skippedCount = ids.length - nonAdminIds.length;
      return {
        success: true,
        deletedCount: nonAdminIds.length,
        skippedCount,
      };
    }),

  // Ban user
  ban: adminProcedure
    .input(userBanSchema)
    .handler(async ({ input, context }) => {
      const { id, reason, expiresAt } = input;
      const { db } = context;

      const existing = await db.query.user.findFirst({
        where: eq(user.id, id),
      });

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "User not found" });
      }

      const [updated] = await db
        .update(user)
        .set({
          banned: true,
          banReason: reason,
          banExpires: expiresAt ?? null,
          updatedAt: new Date(),
        })
        .where(eq(user.id, id))
        .returning();

      // Invalidate all user sessions
      await db.delete(session).where(eq(session.userId, id));

      return updated;
    }),

  // Unban user
  unban: adminProcedure
    .input(userIdSchema)
    .handler(async ({ input, context }) => {
      const { db } = context;

      const existing = await db.query.user.findFirst({
        where: eq(user.id, input.id),
      });

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "User not found" });
      }

      const [updated] = await db
        .update(user)
        .set({
          banned: false,
          banReason: null,
          banExpires: null,
          updatedAt: new Date(),
        })
        .where(eq(user.id, input.id))
        .returning();

      return updated;
    }),
};
