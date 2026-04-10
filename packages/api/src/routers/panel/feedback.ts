import {
  feedbackDeleteSchema,
  feedbackIdSchema,
  feedbackListSchema,
  feedbackReplySchema,
} from "@actnow/common";
import { and, count, desc, eq, ilike, isNull, or, type SQL } from "@actnow/db";
import { user } from "@actnow/db/schema/auth";
import { feedbacks } from "@actnow/db/schema/feedback";
import { ORPCError } from "@orpc/server";
import { adminProcedure } from "../../index";
import {
  buildPaginationResult,
  combineFilters,
  getCountFromResult,
  getPaginationOffset,
  getSortOrder,
} from "../../lib/utils";

export const feedbackPanelRouter = {
  list: adminProcedure
    .input(feedbackListSchema)
    .handler(async ({ input, context }) => {
      const { db } = context;
      const { page, pageSize, search, status, userId, sortBy, sortOrder } =
        input;

      const offset = getPaginationOffset({ page, pageSize });

      const conditions: Array<SQL | undefined> = [isNull(feedbacks.deletedAt)];

      if (status !== "ALL") {
        conditions.push(eq(feedbacks.status, status));
      }

      if (userId) {
        conditions.push(eq(feedbacks.createdById, userId));
      }

      if (search) {
        const likeSearch = `%${search}%`;
        conditions.push(
          or(
            ilike(feedbacks.title, likeSearch),
            ilike(feedbacks.content, likeSearch)
          )
        );
      }

      const whereClause = combineFilters(conditions);

      const total = getCountFromResult(
        await db.select({ count: count() }).from(feedbacks).where(whereClause)
      );

      const rows = await db
        .select({
          id: feedbacks.id,
          title: feedbacks.title,
          content: feedbacks.content,
          snapshots: feedbacks.snapshots,
          status: feedbacks.status,
          replyContent: feedbacks.replyContent,
          repliedAt: feedbacks.repliedAt,
          createdAt: feedbacks.createdAt,
          updatedAt: feedbacks.updatedAt,
          userId: user.id,
          userName: user.name,
          userImage: user.image,
          email: user.email,
        })
        .from(feedbacks)
        .leftJoin(user, eq(feedbacks.createdById, user.id))
        .where(whereClause)
        .orderBy(
          getSortOrder(
            sortBy === "updatedAt" ? feedbacks.updatedAt : feedbacks.createdAt,
            sortOrder
          ),
          desc(feedbacks.id)
        )
        .limit(pageSize)
        .offset(offset);

      return buildPaginationResult(rows, total, { page, pageSize });
    }),

  getById: adminProcedure
    .input(feedbackIdSchema)
    .handler(async ({ input, context }) => {
      const { db } = context;

      const rows = await db
        .select({
          id: feedbacks.id,
          title: feedbacks.title,
          content: feedbacks.content,
          snapshots: feedbacks.snapshots,
          status: feedbacks.status,
          replyContent: feedbacks.replyContent,
          repliedAt: feedbacks.repliedAt,
          createdAt: feedbacks.createdAt,
          updatedAt: feedbacks.updatedAt,
          userId: user.id,
          userName: user.name,
          userImage: user.image,
          email: user.email,
        })
        .from(feedbacks)
        .leftJoin(user, eq(feedbacks.createdById, user.id))
        .where(and(eq(feedbacks.id, input.id), isNull(feedbacks.deletedAt)))
        .limit(1);

      const feedback = rows[0];
      if (!feedback) {
        throw new ORPCError("NOT_FOUND", { message: "Feedback not found" });
      }

      return feedback;
    }),

  reply: adminProcedure
    .input(feedbackReplySchema)
    .handler(async ({ input, context }) => {
      const { db } = context;

      const existing = await db.query.feedbacks.findFirst({
        where: and(eq(feedbacks.id, input.id), isNull(feedbacks.deletedAt)),
      });

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Feedback not found" });
      }

      const [updated] = await db
        .update(feedbacks)
        .set({
          replyContent: input.replyContent.trim(),
          status: "REPLIED",
          repliedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(feedbacks.id, input.id))
        .returning();

      return updated;
    }),

  delete: adminProcedure
    .input(feedbackDeleteSchema)
    .handler(async ({ input, context }) => {
      const { db } = context;

      const existing = await db.query.feedbacks.findFirst({
        where: and(eq(feedbacks.id, input.id), isNull(feedbacks.deletedAt)),
      });

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Feedback not found" });
      }

      await db
        .update(feedbacks)
        .set({ deletedAt: new Date() })
        .where(eq(feedbacks.id, input.id));

      return { success: true };
    }),
};
