import {
  postAdminUpsertSchema,
  postBatchDeleteSchema,
  postIdSchema,
  postListSchema,
} from "@actnow/common";
import { and, count, eq, ilike, inArray, isNull, or } from "@actnow/db";
import { user } from "@actnow/db/schema/auth";
import { posts } from "@actnow/db/schema/posts";
import { ORPCError } from "@orpc/server";
import { adminProcedure } from "../../index";
import {
  buildPaginationResult,
  generateId,
  getCountFromResult,
  getPaginationOffset,
  getSortOrder,
  handleDbError,
} from "../../lib/utils";

const selectPost = {
  id: posts.id,
  title: posts.title,
  description: posts.description,
  cover: posts.cover,
  content: posts.content,
  status: posts.status,
  createdAt: posts.createdAt,
  publishedAt: posts.publishedAt,
  createdById: posts.createdById,
};

export const postRouter = {
  list: adminProcedure
    .input(postListSchema)
    .handler(async ({ input, context }) => {
      const { page, limit, search, status, sortBy, sortOrder, createdById } =
        input;
      const { db } = context;
      const conditions = [isNull(posts.deletedAt)];
      if (status !== "all") conditions.push(eq(posts.status, status));
      if (createdById) conditions.push(eq(posts.createdById, createdById));
      if (search) {
        const term = `%${search}%`;
        conditions.push(
          or(ilike(posts.title, term), ilike(posts.description, term))!
        );
      }
      const whereClause = and(...conditions);
      const offset = getPaginationOffset({ page, pageSize: limit });
      const total = getCountFromResult(
        await db.select({ count: count() }).from(posts).where(whereClause)
      );
      const rows = await db
        .select({
          post: selectPost,
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
        .orderBy(
          getSortOrder(
            sortBy === "publishedAt" ? posts.publishedAt : posts.createdAt,
            sortOrder
          )
        )
        .limit(limit)
        .offset(offset);
      return buildPaginationResult(rows, total, { page, pageSize: limit });
    }),

  getById: adminProcedure
    .input(postIdSchema)
    .handler(async ({ input, context }) => {
      const [row] = await context.db
        .select({
          post: selectPost,
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
      if (!row) throw new ORPCError("NOT_FOUND", { message: "Post not found" });
      return row;
    }),

  upsert: adminProcedure
    .input(postAdminUpsertSchema)
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const adminId = session?.user?.id;
      if (!adminId) throw new ORPCError("UNAUTHORIZED");

      try {
        const existing = input.id
          ? await db.query.posts.findFirst({
              where: and(eq(posts.id, input.id), isNull(posts.deletedAt)),
            })
          : null;
        if (input.id && !existing) {
          throw new ORPCError("NOT_FOUND", { message: "Post not found" });
        }
        const publishedAt =
          input.status === "published"
            ? existing?.status === "published" && existing.publishedAt
              ? existing.publishedAt
              : new Date()
            : null;
        const legacy = {
          prompt: input.content,
          comment: input.title,
          media: input.cover ? [input.cover] : [],
          isPublic: input.status === "published",
          updatedAt: new Date(),
        };

        if (input.id) {
          await db
            .update(posts)
            .set({
              title: input.title,
              description: input.description,
              cover: input.cover,
              content: input.content,
              status: input.status,
              publishedAt,
              ...legacy,
            })
            .where(eq(posts.id, input.id));
          return db
            .select({
              post: selectPost,
              author: {
                id: user.id,
                name: user.name,
                image: user.image,
                email: user.email,
              },
            })
            .from(posts)
            .leftJoin(user, eq(posts.createdById, user.id))
            .where(eq(posts.id, input.id))
            .then((rows) => rows[0]);
        }

        const postId = generateId();
        await db.insert(posts).values({
          id: postId,
          title: input.title,
          description: input.description,
          cover: input.cover,
          content: input.content,
          status: input.status,
          publishedAt,
          createdById: adminId,
          ...legacy,
        });
        return db
          .select({
            post: selectPost,
            author: {
              id: user.id,
              name: user.name,
              image: user.image,
              email: user.email,
            },
          })
          .from(posts)
          .leftJoin(user, eq(posts.createdById, user.id))
          .where(eq(posts.id, postId))
          .then((rows) => rows[0]);
      } catch (error) {
        return handleDbError(error);
      }
    }),

  delete: adminProcedure
    .input(postIdSchema)
    .handler(async ({ input, context }) => {
      const [existing] = await context.db
        .select({ id: posts.id })
        .from(posts)
        .where(and(eq(posts.id, input.id), isNull(posts.deletedAt)))
        .limit(1);
      if (!existing)
        throw new ORPCError("NOT_FOUND", { message: "Post not found" });
      await context.db
        .update(posts)
        .set({ deletedAt: new Date(), status: "draft", isPublic: false })
        .where(eq(posts.id, input.id));
      return { success: true };
    }),

  batchDelete: adminProcedure
    .input(postBatchDeleteSchema)
    .handler(async ({ input, context }) => {
      await context.db
        .update(posts)
        .set({ deletedAt: new Date(), status: "draft", isPublic: false })
        .where(inArray(posts.id, input.ids));
      return { success: true };
    }),
};
