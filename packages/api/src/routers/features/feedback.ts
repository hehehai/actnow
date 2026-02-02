import {
  feedbackCreateSchema,
  feedbackDeleteSchema,
  feedbackUpdateSchema,
} from "@actnow/common";
import { and, eq, isNull } from "@actnow/db";
import { feedbacks } from "@actnow/db/schema/feedback";
import { ORPCError } from "@orpc/server";
import { protectedProcedure } from "../../index";
import { generateId } from "../../lib/utils";

function sanitizeSnapshots(snapshots?: string[]) {
  return (snapshots ?? []).slice(0, 3);
}

export const feedbackRouter = {
  list: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;
    const { db } = context;

    return db.query.feedbacks.findMany({
      where: and(
        eq(feedbacks.createdById, userId),
        isNull(feedbacks.deletedAt)
      ),
      orderBy: (feedback, { desc: descFn }) => [descFn(feedback.createdAt)],
    });
  }),

  create: protectedProcedure
    .input(feedbackCreateSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const { db } = context;

      const [created] = await db
        .insert(feedbacks)
        .values({
          id: generateId(),
          title: input.title.trim(),
          content: input.content.trim(),
          snapshots: sanitizeSnapshots(input.snapshots),
          createdById: userId,
        })
        .returning();

      return created;
    }),

  update: protectedProcedure
    .input(feedbackUpdateSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const { db } = context;

      const existing = await db.query.feedbacks.findFirst({
        where: and(
          eq(feedbacks.id, input.id),
          eq(feedbacks.createdById, userId),
          isNull(feedbacks.deletedAt)
        ),
      });

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Feedback not found" });
      }

      if (existing.status !== "PENDING") {
        throw new ORPCError("FORBIDDEN", {
          message: "Only pending feedback can be updated",
        });
      }

      const updates: Partial<typeof feedbacks.$inferInsert> = {};

      if (input.title !== undefined) {
        updates.title = input.title.trim();
      }
      if (input.content !== undefined) {
        updates.content = input.content.trim();
      }
      if (input.snapshots) {
        updates.snapshots = sanitizeSnapshots(input.snapshots);
      }

      if (Object.keys(updates).length === 0) {
        return existing;
      }

      const [updated] = await db
        .update(feedbacks)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(feedbacks.id, input.id))
        .returning();

      return updated;
    }),

  delete: protectedProcedure
    .input(feedbackDeleteSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const { db } = context;

      const existing = await db.query.feedbacks.findFirst({
        where: and(
          eq(feedbacks.id, input.id),
          eq(feedbacks.createdById, userId),
          isNull(feedbacks.deletedAt)
        ),
      });

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Feedback not found" });
      }

      const [deleted] = await db
        .update(feedbacks)
        .set({ deletedAt: new Date() })
        .where(eq(feedbacks.id, input.id))
        .returning({ id: feedbacks.id });

      return { id: deleted.id };
    }),
};
