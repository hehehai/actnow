import {
  postLikeStatusSchema,
  postLikesFeedSchema,
  togglePostLikeSchema,
} from "@actnow/common";
import { and, desc, eq, inArray, isNull, lt, sql } from "@actnow/db";
import { user } from "@actnow/db/schema/auth";
import { eventLogs } from "@actnow/db/schema/events";
import { postLikes, posts } from "@actnow/db/schema/posts";
import { postTags, tags } from "@actnow/db/schema/tags";
import { ORPCError } from "@orpc/server";
import { protectedProcedure } from "../../index";
import { combineFilters, generateId } from "../../lib/utils";
import { groupTagsByPost } from "../../services/app/post-shared";

export const likeRouter = {
  toggleLike: protectedProcedure
    .input(togglePostLikeSchema)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const userId = session.user.id;

      const post = await db.query.posts.findFirst({
        where: eq(posts.id, input.postId),
      });

      if (!post || post.deletedAt) {
        throw new ORPCError("NOT_FOUND", { message: "Post not found" });
      }

      if (!post.isPublic && post.createdById !== userId) {
        throw new ORPCError("FORBIDDEN", {
          message: "Cannot like a private post",
        });
      }

      const existing = await db.query.postLikes.findFirst({
        where: and(
          eq(postLikes.postId, input.postId),
          eq(postLikes.userId, userId)
        ),
      });

      if (existing) {
        await db.transaction(async (tx) => {
          await tx.delete(postLikes).where(eq(postLikes.id, existing.id));
          await tx
            .update(posts)
            .set({
              likes: sql<number>`max(${posts.likes} - 1, 0)`,
              updatedAt: new Date(),
            })
            .where(eq(posts.id, input.postId));
        });

        await db.insert(eventLogs).values({
          id: generateId(),
          eventType: "POST_UNLIKED",
          userId,
          targetId: input.postId,
          targetType: "post",
        });

        return { liked: false, postId: input.postId };
      }

      await db.transaction(async (tx) => {
        await tx.insert(postLikes).values({
          id: generateId(),
          postId: input.postId,
          userId,
        });
        await tx
          .update(posts)
          .set({
            likes: sql`${posts.likes} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(posts.id, input.postId));
      });

      await db.insert(eventLogs).values({
        id: generateId(),
        eventType: "POST_LIKED",
        userId,
        targetId: input.postId,
        targetType: "post",
      });

      return { liked: true, postId: input.postId };
    }),

  getUserLikes: protectedProcedure
    .input(postLikesFeedSchema)
    .handler(async ({ input, context }) => {
      const { cursor, limit } = input;
      const { db, session } = context;
      const userId = session.user.id;

      const cursorCondition = cursor
        ? lt(postLikes.createdAt, new Date(cursor))
        : undefined;

      const conditions = [
        eq(postLikes.userId, userId),
        isNull(posts.deletedAt),
      ];
      if (cursorCondition) {
        conditions.push(cursorCondition);
      }

      const whereClause = combineFilters(conditions);

      const likes = await db
        .select({
          likeId: postLikes.id,
          likedAt: postLikes.createdAt,
          post: {
            id: posts.id,
            prompt: posts.prompt,
            comment: posts.comment,
            media: posts.media,
            isPublic: posts.isPublic,
            likes: posts.likes,
            visits: posts.visits,
            createdAt: posts.createdAt,
            updatedAt: posts.updatedAt,
          },
          author: {
            id: user.id,
            name: user.name,
            image: user.image,
          },
        })
        .from(postLikes)
        .innerJoin(posts, eq(postLikes.postId, posts.id))
        .leftJoin(user, eq(posts.createdById, user.id))
        .where(whereClause)
        .orderBy(desc(postLikes.createdAt))
        .limit(limit + 1);

      const hasMore = likes.length > limit;
      const items = hasMore ? likes.slice(0, limit) : likes;
      const postIds = items.map((item) => item.post.id);

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

      const tagMap = groupTagsByPost(tagRows);

      const resultItems = items.map((item) => ({
        post: {
          ...item.post,
          tags:
            tagMap.get(item.post.id)?.map((tag) => ({
              id: tag.id,
              name: tag.name,
              value: tag.value,
              type: tag.type,
            })) ?? [],
        },
        author: item.author,
        liked: true,
        likedAt: item.likedAt,
      }));

      const nextCursor =
        hasMore && resultItems.length
          ? (resultItems.at(-1)?.likedAt.toISOString() ?? null)
          : null;

      return {
        items: resultItems,
        nextCursor,
        hasMore,
      };
    }),

  checkLikeStatus: protectedProcedure
    .input(postLikeStatusSchema)
    .handler(async ({ input, context }) => {
      const { postIds } = input;
      if (!postIds.length) {
        return {};
      }

      const { db, session } = context;
      const userId = session.user.id;

      const likes = await db
        .select({ postId: postLikes.postId })
        .from(postLikes)
        .where(
          and(eq(postLikes.userId, userId), inArray(postLikes.postId, postIds))
        );

      const likedSet = new Set(likes.map((like) => like.postId));
      return postIds.reduce<Record<string, boolean>>((acc, id) => {
        acc[id] = likedSet.has(id);
        return acc;
      }, {});
    }),
};
