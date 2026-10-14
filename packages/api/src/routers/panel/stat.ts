import { getMonthRange } from "@actnow/common";
import { and, count, eq, gte, isNull, lt } from "@actnow/db";
import { user } from "@actnow/db/schema/auth";
import { posts } from "@actnow/db/schema/posts";
import { adminProcedure } from "../../index";
import { calculateChangePercent, getCountFromResult } from "../../lib/utils";

export const statRouter = {
  getDashboardStats: adminProcedure.handler(async ({ context }) => {
    const { db } = context;
    const thisMonth = getMonthRange(0);
    const lastMonth = getMonthRange(1);

    const totalPosts = getCountFromResult(
      await db
        .select({ count: count() })
        .from(posts)
        .where(isNull(posts.deletedAt))
    );
    const publishedPosts = getCountFromResult(
      await db
        .select({ count: count() })
        .from(posts)
        .where(and(isNull(posts.deletedAt), eq(posts.status, "published")))
    );
    const draftPosts = getCountFromResult(
      await db
        .select({ count: count() })
        .from(posts)
        .where(and(isNull(posts.deletedAt), eq(posts.status, "draft")))
    );
    const thisMonthPosts = getCountFromResult(
      await db
        .select({ count: count() })
        .from(posts)
        .where(
          and(isNull(posts.deletedAt), gte(posts.createdAt, thisMonth.start))
        )
    );
    const lastMonthPosts = getCountFromResult(
      await db
        .select({ count: count() })
        .from(posts)
        .where(
          and(
            isNull(posts.deletedAt),
            gte(posts.createdAt, lastMonth.start),
            lt(posts.createdAt, lastMonth.end)
          )
        )
    );

    const totalUsers = getCountFromResult(
      await db.select({ count: count() }).from(user)
    );
    const thisMonthUsers = getCountFromResult(
      await db
        .select({ count: count() })
        .from(user)
        .where(gte(user.createdAt, thisMonth.start))
    );
    const lastMonthUsers = getCountFromResult(
      await db
        .select({ count: count() })
        .from(user)
        .where(
          and(
            gte(user.createdAt, lastMonth.start),
            lt(user.createdAt, lastMonth.end)
          )
        )
    );

    return {
      posts: {
        total: totalPosts,
        published: publishedPosts,
        draft: draftPosts,
        currentMonth: thisMonthPosts,
        previousMonth: lastMonthPosts,
        changePercent: calculateChangePercent(thisMonthPosts, lastMonthPosts),
      },
      users: {
        total: totalUsers,
        currentMonth: thisMonthUsers,
        previousMonth: lastMonthUsers,
        changePercent: calculateChangePercent(thisMonthUsers, lastMonthUsers),
      },
    };
  }),

  getUserGrowthChart: adminProcedure.handler(async ({ context }) => {
    const { db } = context;
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ] as const;
    const lastThreeMonths: Array<{ month: string; count: number }> = [];

    for (let i = 2; i >= 0; i--) {
      const range = getMonthRange(i);
      const monthCount = getCountFromResult(
        await db
          .select({ count: count() })
          .from(user)
          .where(
            and(
              gte(user.createdAt, range.start),
              lt(user.createdAt, new Date(range.end.getTime() + 1))
            )
          )
      );
      lastThreeMonths.push({
        month: monthNames[new Date(range.start).getMonth()] ?? "",
        count: monthCount,
      });
    }

    return lastThreeMonths;
  }),
};
