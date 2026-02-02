import {
  updateProfileSchema,
  userPopularSchema,
  userPublicProfileSchema,
} from "@actnow/common";
import { and, desc, eq, inArray, isNull, ne, sql } from "@actnow/db";
import { account, session, user } from "@actnow/db/schema/auth";
import { feedbacks } from "@actnow/db/schema/feedback";
import { postLikes, posts } from "@actnow/db/schema/posts";
import { postTags, tags } from "@actnow/db/schema/tags";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../../index";
import { generateId, hashPassword } from "../../lib/utils";

export const appUserRouter = {
  popular: publicProcedure
    .input(userPopularSchema)
    .handler(async ({ input, context }) => {
      const { limit } = input;
      const { db } = context;

      const totalLikes = sql<number>`COALESCE(SUM(${posts.likes}), 0)`;
      const totalPosts = sql<number>`COUNT(${posts.id})`;

      const users = await db
        .select({
          id: user.id,
          name: user.name,
          image: user.image,
          totalLikes,
          totalPosts,
        })
        .from(posts)
        .innerJoin(user, eq(posts.createdById, user.id))
        .where(and(eq(posts.isPublic, true), isNull(posts.deletedAt)))
        .groupBy(user.id)
        .orderBy(desc(totalLikes))
        .limit(limit);

      return users;
    }),
  publicProfile: publicProcedure
    .input(userPublicProfileSchema)
    .handler(async ({ input, context }) => {
      const { db } = context;

      const profile = await db.query.user.findFirst({
        where: eq(user.id, input.id),
        columns: {
          id: true,
          name: true,
          image: true,
          createdAt: true,
        },
      });

      if (!profile) {
        throw new ORPCError("NOT_FOUND", { message: "User not found" });
      }

      const postRows = await db
        .select({
          post: {
            id: posts.id,
            prompt: posts.prompt,
            comment: posts.comment,
            media: posts.media,
            likes: posts.likes,
            visits: posts.visits,
            isPublic: posts.isPublic,
            createdAt: posts.createdAt,
            updatedAt: posts.updatedAt,
          },
          author: {
            id: user.id,
            name: user.name,
            image: user.image,
          },
        })
        .from(posts)
        .leftJoin(user, eq(posts.createdById, user.id))
        .where(
          and(
            eq(posts.createdById, input.id),
            eq(posts.isPublic, true),
            isNull(posts.deletedAt)
          )
        )
        .orderBy(desc(posts.createdAt));

      const postIds = postRows.map((row) => row.post.id);
      const tagRows = postIds.length
        ? await db
            .select({
              postId: postTags.postId,
              id: tags.id,
              name: tags.name,
              value: tags.value,
              type: tags.type,
            })
            .from(postTags)
            .innerJoin(tags, eq(postTags.tagId, tags.id))
            .where(inArray(postTags.postId, postIds))
        : [];

      const tagMap = new Map<string, typeof tagRows>();
      for (const tag of tagRows) {
        const existing = tagMap.get(tag.postId);
        if (existing) {
          existing.push(tag);
        } else {
          tagMap.set(tag.postId, [tag]);
        }
      }

      const postsWithTags = postRows.map((record) => ({
        ...record,
        tags:
          tagMap.get(record.post.id)?.map((tag) => ({
            id: tag.id,
            name: tag.name,
            value: tag.value,
            type: tag.type,
          })) ?? [],
      }));

      return { user: profile, posts: postsWithTags };
    }),

  // Get current user profile
  getProfile: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;
    const { db } = context;

    const profile = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    // Check if user has credential (password) account
    const credentialAccount = await db.query.account.findFirst({
      where: and(
        eq(account.userId, userId),
        eq(account.providerId, "credential")
      ),
      columns: { id: true },
    });

    return {
      ...profile,
      hasCredential: !!credentialAccount,
    };
  }),

  // Update user profile (name, image)
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const { db } = context;

      const updateData: { name?: string; image?: string | null } = {};

      if (input.name !== undefined) {
        updateData.name = input.name;
      }

      if (input.image !== undefined) {
        updateData.image = input.image;
      }

      if (Object.keys(updateData).length === 0) {
        // Nothing to update, return current profile
        return await db.query.user.findFirst({
          where: eq(user.id, userId),
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        });
      }

      const [updated] = await db
        .update(user)
        .set(updateData)
        .where(eq(user.id, userId))
        .returning({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        });

      return updated;
    }),

  // Get user's active sessions (latest 5)
  getSessions: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;
    const { db } = context;

    const sessions = await db.query.session.findMany({
      where: eq(session.userId, userId),
      orderBy: (s, { desc }) => [desc(s.createdAt)],
      columns: {
        id: true,
        token: false,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
      },
      limit: 5,
    });

    // Mark current session
    const currentSessionId = context.session.session.id;

    return sessions.map((s) => ({
      ...s,
      isCurrent: s.id === currentSessionId,
    }));
  }),

  // Get linked OAuth accounts
  getLinkedAccounts: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;
    const { db } = context;

    const accounts = await db.query.account.findMany({
      where: eq(account.userId, userId),
      columns: {
        id: true,
        providerId: true,
        accountId: true,
        createdAt: true,
      },
    });

    return accounts;
  }),

  // Revoke a session
  revokeSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const currentSessionId = context.session.session.id;
      const { db } = context;

      // Cannot revoke current session
      if (input.sessionId === currentSessionId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Cannot revoke current session",
        });
      }

      // Verify session belongs to user and delete it
      const result = await db
        .delete(session)
        .where(
          and(
            eq(session.id, input.sessionId),
            eq(session.userId, userId),
            ne(session.id, currentSessionId)
          )
        )
        .returning({ id: session.id });

      if (result.length === 0) {
        throw new ORPCError("NOT_FOUND", {
          message: "Session not found",
        });
      }

      return { success: true };
    }),

  // Delete all user posts (soft delete)
  deleteAllPosts: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;
    const { db } = context;

    const result = await db
      .update(posts)
      .set({ deletedAt: new Date(), isPublic: false })
      .where(and(eq(posts.createdById, userId), isNull(posts.deletedAt)))
      .returning({ id: posts.id });

    return { deletedCount: result.length };
  }),

  // Delete all user feedback (soft delete)
  deleteAllFeedback: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;
    const { db } = context;

    const result = await db
      .update(feedbacks)
      .set({ deletedAt: new Date() })
      .where(
        and(eq(feedbacks.createdById, userId), isNull(feedbacks.deletedAt))
      )
      .returning({ id: feedbacks.id });

    return { deletedCount: result.length };
  }),

  // Delete all user likes
  deleteAllLikes: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;
    const { db } = context;

    const result = await db
      .delete(postLikes)
      .where(eq(postLikes.userId, userId))
      .returning({ id: postLikes.id });

    return { deletedCount: result.length };
  }),

  // Set password for users without credential account (OAuth-only users)
  setPassword: protectedProcedure
    .input(z.object({ newPassword: z.string().min(8) }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const { db } = context;

      // Check if user already has a credential account
      const existingCredential = await db.query.account.findFirst({
        where: and(
          eq(account.userId, userId),
          eq(account.providerId, "credential")
        ),
        columns: { id: true },
      });

      if (existingCredential) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Password already set. Use change password instead.",
        });
      }

      // Create credential account with password
      const hashedPassword = await hashPassword(input.newPassword);

      await db.insert(account).values({
        id: generateId(),
        accountId: userId,
        providerId: "credential",
        userId,
        password: hashedPassword,
      });

      return { success: true };
    }),
};
