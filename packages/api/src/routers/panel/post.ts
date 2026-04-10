import {
  postAdminUpsertSchema,
  postBatchDeleteSchema,
  postIdSchema,
  postListSchema,
} from "@actnow/common";
import {
  and,
  count,
  eq,
  ilike,
  inArray,
  isNull,
  or,
  type SQL,
} from "@actnow/db";
import { user } from "@actnow/db/schema/auth";
import { postLikes, posts } from "@actnow/db/schema/posts";
import { postTags, tags } from "@actnow/db/schema/tags";
import { ORPCError } from "@orpc/server";
import { adminProcedure } from "../../index";
import {
  buildPaginationResult,
  combineFilters,
  generateId,
  getCountFromResult,
  getPaginationOffset,
  getSortOrder,
  handleDbError,
} from "../../lib/utils";
import { groupTagsByPost, syncPostTags } from "../../services/app/post-shared";

export const postRouter = {
  list: adminProcedure
    .input(postListSchema)
    .handler(async ({ input, context }) => {
      const {
        page,
        limit,
        search,
        visibility,
        sortBy,
        sortOrder,
        tagIds,
        createdById,
      } = input;
      const { db } = context;
      const offset = getPaginationOffset({ page, pageSize: limit });

      let filteredIds: string[] | undefined;
      if (tagIds?.length) {
        const rows = await db
          .select({ postId: postTags.postId })
          .from(postTags)
          .where(inArray(postTags.tagId, tagIds));
        filteredIds = rows.map((row: { postId: string }) => row.postId);
        if (!filteredIds.length) {
          return buildPaginationResult([], 0, { page, pageSize: limit });
        }
      }

      const conditions: Array<SQL | undefined> = [isNull(posts.deletedAt)];
      if (visibility === "public") {
        conditions.push(eq(posts.isPublic, true));
      }
      if (search) {
        const term = `%${search}%`;
        conditions.push(
          or(ilike(posts.comment, term), ilike(posts.prompt, term))
        );
      }
      if (filteredIds) {
        conditions.push(inArray(posts.id, filteredIds));
      }
      if (createdById) {
        conditions.push(eq(posts.createdById, createdById));
      }

      const whereClause = combineFilters(conditions);

      const total = getCountFromResult(
        await db.select({ count: count() }).from(posts).where(whereClause)
      );

      const sortColumn =
        sortBy === "updatedAt"
          ? posts.updatedAt
          : sortBy === "likes"
            ? posts.likes
            : sortBy === "visits"
              ? posts.visits
              : posts.createdAt;

      const rows = await db
        .select({
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
            email: user.email,
          },
        })
        .from(posts)
        .leftJoin(user, eq(posts.createdById, user.id))
        .where(whereClause)
        .orderBy(getSortOrder(sortColumn, sortOrder))
        .limit(limit)
        .offset(offset);

      const postIds = rows.map((row) => row.post.id);

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

      const items = rows.map((record) => ({
        ...record,
        tags:
          tagMap.get(record.post.id)?.map((tag) => ({
            id: tag.id,
            name: tag.name,
            value: tag.value,
            type: tag.type,
          })) ?? [],
      }));

      return buildPaginationResult(items, total, { page, pageSize: limit });
    }),

  getById: adminProcedure
    .input(postIdSchema)
    .handler(async ({ input, context }) => {
      const { db } = context;
      const post = await db
        .select({
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
            email: user.email,
          },
        })
        .from(posts)
        .leftJoin(user, eq(posts.createdById, user.id))
        .where(and(eq(posts.id, input.id), isNull(posts.deletedAt)))
        .limit(1);

      if (!post.length) {
        throw new ORPCError("NOT_FOUND", { message: "Post not found" });
      }

      const tagRows = await db
        .select({
          id: tags.id,
          name: tags.name,
          value: tags.value,
          type: tags.type,
        })
        .from(postTags)
        .innerJoin(tags, eq(postTags.tagId, tags.id))
        .where(eq(postTags.postId, input.id));

      return {
        ...post[0],
        tags: tagRows,
      };
    }),

  upsert: adminProcedure
    .input(postAdminUpsertSchema)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const { id, tagIds, ...data } = input;
      const adminId = session?.user?.id;

      if (!adminId) {
        throw new ORPCError("UNAUTHORIZED");
      }

      try {
        if (id) {
          const existing = await db.query.posts.findFirst({
            where: and(eq(posts.id, id), isNull(posts.deletedAt)),
          });

          if (!existing) {
            throw new ORPCError("NOT_FOUND", { message: "Post not found" });
          }

          await db.transaction(async (tx) => {
            await tx
              .update(posts)
              .set({
                prompt: data.prompt ?? existing.prompt,
                comment: data.comment,
                media: data.media ?? [],
                isPublic:
                  data.isPublic !== undefined
                    ? data.isPublic
                    : existing.isPublic,
                updatedAt: new Date(),
              })
              .where(eq(posts.id, id));

            if (tagIds) {
              await syncPostTags(tx, id, tagIds);
            }
          });

          return await db.query.posts.findFirst({
            where: eq(posts.id, id),
          });
        }

        const postId = generateId();

        await db.transaction(async (tx) => {
          await tx.insert(posts).values({
            id: postId,
            prompt: data.prompt ?? "",
            comment: data.comment,
            media: data.media ?? [],
            isPublic: data.isPublic ?? false,
            createdById: adminId,
          });
          if (tagIds?.length) {
            await syncPostTags(tx, postId, tagIds);
          }
        });

        return await db.query.posts.findFirst({
          where: eq(posts.id, postId),
        });
      } catch (error) {
        return handleDbError(error);
      }
    }),

  delete: adminProcedure
    .input(postIdSchema)
    .handler(async ({ input, context }) => {
      const { db } = context;
      const existing = await db.query.posts.findFirst({
        where: eq(posts.id, input.id),
      });

      if (!existing || existing.deletedAt) {
        throw new ORPCError("NOT_FOUND", { message: "Post not found" });
      }

      await db
        .update(posts)
        .set({ deletedAt: new Date(), isPublic: false })
        .where(eq(posts.id, input.id));

      await db.delete(postLikes).where(eq(postLikes.postId, input.id));

      return { success: true };
    }),

  batchDelete: adminProcedure
    .input(postBatchDeleteSchema)
    .handler(async ({ input, context }) => {
      const { db } = context;
      await db
        .update(posts)
        .set({ deletedAt: new Date(), isPublic: false })
        .where(inArray(posts.id, input.ids));
      await db.delete(postLikes).where(inArray(postLikes.postId, input.ids));
      return { success: true };
    }),
};
