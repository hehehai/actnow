import {
  tagBatchDeleteSchema,
  tagIdSchema,
  tagListByIdsSchema,
  tagListForSelectSchema,
  tagListSchema,
  tagUpsertSchema,
} from "@actnow/common";
import {
  and,
  count,
  eq,
  ilike,
  inArray,
  isNull,
  not,
  or,
  type SQL,
} from "@actnow/db";
import { tags } from "@actnow/db/schema/tags";
import { ORPCError } from "@orpc/server";
import { adminProcedure, protectedProcedure } from "../../index";
import {
  buildPaginationResult,
  combineFilters,
  generateId,
  getCountFromResult,
  getPaginationOffset,
  getSortOrder,
  handleDbError,
} from "../../lib/utils";

export const tagRouter = {
  // List tags with pagination, search, filter, sort
  list: adminProcedure
    .input(tagListSchema)
    .handler(async ({ input, context }) => {
      const { page, limit, search, type, sortBy, sortOrder } = input;
      const { db } = context;
      const offset = getPaginationOffset({ page, pageSize: limit });

      // Build where conditions
      const conditions: SQL[] = [isNull(tags.deletedAt)];

      if (search) {
        const searchCondition = or(
          ilike(tags.name, `%${search}%`),
          ilike(tags.value, `%${search}%`)
        );
        if (searchCondition) {
          conditions.push(searchCondition);
        }
      }

      if (type) {
        conditions.push(eq(tags.type, type));
      }

      const whereClause = combineFilters(conditions);

      // Get total count
      const totalResult = await db
        .select({ count: count() })
        .from(tags)
        .where(whereClause);
      const total = getCountFromResult(totalResult);

      // Build order by
      const sortColumn = sortBy === "name" ? tags.name : tags.createdAt;

      // Get tags
      const tagList = await db
        .select()
        .from(tags)
        .where(whereClause)
        .orderBy(getSortOrder(sortColumn, sortOrder))
        .limit(limit)
        .offset(offset);

      return buildPaginationResult(tagList, total, { page, pageSize: limit });
    }),

  // Get tag by ID
  getById: adminProcedure
    .input(tagIdSchema)
    .handler(async ({ input, context }) => {
      const { db } = context;

      const tag = await db.query.tags.findFirst({
        where: and(eq(tags.id, input.id), isNull(tags.deletedAt)),
      });

      if (!tag) {
        throw new ORPCError("NOT_FOUND", { message: "Tag not found" });
      }

      return tag;
    }),

  // Upsert tag (create if no id, update if id provided)
  upsert: adminProcedure
    .input(tagUpsertSchema)
    .handler(async ({ input, context }) => {
      const { id, value, type, ...data } = input;
      const { db } = context;

      try {
        // Check value+type uniqueness among non-deleted tags
        const valueConditions = [
          eq(tags.value, value),
          eq(tags.type, type),
          isNull(tags.deletedAt),
        ];
        if (id) {
          valueConditions.push(not(eq(tags.id, id)));
        }

        const existingValue = await db.query.tags.findFirst({
          where: combineFilters(valueConditions),
        });

        if (existingValue) {
          throw new ORPCError("CONFLICT", {
            message: "Tag with this value and type already exists",
          });
        }

        if (id) {
          // UPDATE
          const existing = await db.query.tags.findFirst({
            where: and(eq(tags.id, id), isNull(tags.deletedAt)),
          });

          if (!existing) {
            throw new ORPCError("NOT_FOUND", { message: "Tag not found" });
          }

          const [updated] = await db
            .update(tags)
            .set({
              ...data,
              value,
              type,
              updatedAt: new Date(),
            })
            .where(eq(tags.id, id))
            .returning();

          return updated;
        }

        // CREATE
        const tagId = generateId();

        const [newTag] = await db
          .insert(tags)
          .values({
            id: tagId,
            ...data,
            value,
            type,
          })
          .returning();

        return newTag;
      } catch (error) {
        return handleDbError(error);
      }
    }),

  // Soft delete tag
  delete: adminProcedure
    .input(tagIdSchema)
    .handler(async ({ input, context }) => {
      const { db } = context;

      const existing = await db.query.tags.findFirst({
        where: and(eq(tags.id, input.id), isNull(tags.deletedAt)),
      });

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Tag not found" });
      }

      const [updated] = await db
        .update(tags)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(tags.id, input.id))
        .returning();

      return updated;
    }),

  // Batch soft delete tags
  batchDelete: adminProcedure
    .input(tagBatchDeleteSchema)
    .handler(async ({ input, context }) => {
      const { ids } = input;
      const { db } = context;

      await db
        .update(tags)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(inArray(tags.id, ids), isNull(tags.deletedAt)));

      return { success: true, deletedCount: ids.length };
    }),

  // List tags for select dropdown (lightweight, no pagination)
  listForSelect: protectedProcedure
    .input(tagListForSelectSchema)
    .handler(async ({ input, context }) => {
      const { search, type, limit } = input;
      const { db } = context;

      // Build where conditions
      const conditions: SQL[] = [isNull(tags.deletedAt)];

      if (search) {
        const searchCondition = or(
          ilike(tags.name, `%${search}%`),
          ilike(tags.value, `%${search}%`)
        );
        if (searchCondition) {
          conditions.push(searchCondition);
        }
      }

      if (type) {
        conditions.push(eq(tags.type, type));
      }

      const whereClause = combineFilters(conditions);

      const tagList = await db
        .select({
          id: tags.id,
          name: tags.name,
          value: tags.value,
          type: tags.type,
          description: tags.description,
          tipMedia: tags.tipMedia,
        })
        .from(tags)
        .where(whereClause)
        .orderBy(tags.type, tags.name)
        .limit(limit);

      return tagList;
    }),

  // List tags by IDs (for fetching specific tags)
  listByIds: protectedProcedure
    .input(tagListByIdsSchema)
    .handler(async ({ input, context }) => {
      const { ids } = input;
      const { db } = context;

      if (ids.length === 0) {
        return [];
      }

      const tagList = await db
        .select({
          id: tags.id,
          name: tags.name,
          value: tags.value,
          type: tags.type,
        })
        .from(tags)
        .where(and(inArray(tags.id, ids), isNull(tags.deletedAt)));

      return tagList;
    }),
};
