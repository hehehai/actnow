import {
  getLeaderboardTimeRange,
  getMonthRange,
  getWeekStart,
  likeLeaderboardSchema,
  statPeriodSchema,
} from "@actnow/common";
import { and, count, desc, eq, gte, isNull, lt, sql } from "@actnow/db";
import { user } from "@actnow/db/schema/auth";
import { eventLogs } from "@actnow/db/schema/events";
import { postLikes, posts } from "@actnow/db/schema/posts";
import { adminProcedure } from "../../index";
import {
  calculateChangePercent,
  getCountFromResult,
  getTimeRange,
} from "../../lib/utils";

export const statRouter = {
  getStats: adminProcedure
    .input(statPeriodSchema)
    .handler(async ({ input, context }) => {
      const { period } = input;
      const { db } = context;
      const { currentStart, previousStart, previousEnd } = getTimeRange(period);

      const totalUsers = getCountFromResult(
        await db.select({ count: count() }).from(user)
      );

      const newUsers = getCountFromResult(
        await db
          .select({ count: count() })
          .from(user)
          .where(gte(user.createdAt, currentStart))
      );

      const previousUsers = getCountFromResult(
        await db
          .select({ count: count() })
          .from(user)
          .where(
            and(
              gte(user.createdAt, previousStart),
              lt(user.createdAt, previousEnd)
            )
          )
      );

      const totalPosts = getCountFromResult(
        await db
          .select({ count: count() })
          .from(posts)
          .where(isNull(posts.deletedAt))
      );

      const publicPosts = getCountFromResult(
        await db
          .select({ count: count() })
          .from(posts)
          .where(and(isNull(posts.deletedAt), eq(posts.isPublic, true)))
      );

      const newPosts = getCountFromResult(
        await db
          .select({ count: count() })
          .from(posts)
          .where(
            and(gte(posts.createdAt, currentStart), isNull(posts.deletedAt))
          )
      );

      const previousPosts = getCountFromResult(
        await db
          .select({ count: count() })
          .from(posts)
          .where(
            and(
              gte(posts.createdAt, previousStart),
              lt(posts.createdAt, previousEnd),
              isNull(posts.deletedAt)
            )
          )
      );

      const totalLikes = getCountFromResult(
        await db.select({ count: count() }).from(postLikes)
      );

      const newLikes = getCountFromResult(
        await db
          .select({ count: count() })
          .from(eventLogs)
          .where(
            and(
              eq(eventLogs.eventType, "POST_LIKED"),
              gte(eventLogs.createdAt, currentStart)
            )
          )
      );

      const previousLikes = getCountFromResult(
        await db
          .select({ count: count() })
          .from(eventLogs)
          .where(
            and(
              eq(eventLogs.eventType, "POST_LIKED"),
              gte(eventLogs.createdAt, previousStart),
              lt(eventLogs.createdAt, previousEnd)
            )
          )
      );

      return {
        users: {
          total: totalUsers,
          newCount: newUsers,
          previousCount: previousUsers,
          changePercent: calculateChangePercent(newUsers, previousUsers),
        },
        posts: {
          total: totalPosts,
          public: publicPosts,
          newCount: newPosts,
          previousCount: previousPosts,
          changePercent: calculateChangePercent(newPosts, previousPosts),
        },
        likes: {
          total: totalLikes,
          newCount: newLikes,
          previousCount: previousLikes,
          changePercent: calculateChangePercent(newLikes, previousLikes),
        },
      };
    }),

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

    const totalLikes = getCountFromResult(
      await db.select({ count: count() }).from(postLikes)
    );
    const thisMonthLikes = getCountFromResult(
      await db
        .select({ count: count() })
        .from(eventLogs)
        .where(
          and(
            eq(eventLogs.eventType, "POST_LIKED"),
            gte(eventLogs.createdAt, thisMonth.start)
          )
        )
    );
    const lastMonthLikes = getCountFromResult(
      await db
        .select({ count: count() })
        .from(eventLogs)
        .where(
          and(
            eq(eventLogs.eventType, "POST_LIKED"),
            gte(eventLogs.createdAt, lastMonth.start),
            lt(eventLogs.createdAt, lastMonth.end)
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
        currentMonth: thisMonthPosts,
        previousMonth: lastMonthPosts,
        changePercent: calculateChangePercent(thisMonthPosts, lastMonthPosts),
      },
      likes: {
        total: totalLikes,
        currentMonth: thisMonthLikes,
        previousMonth: lastMonthLikes,
        changePercent: calculateChangePercent(thisMonthLikes, lastMonthLikes),
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
    const now = new Date();
    const thisWeekStart = getWeekStart(now);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

    const thisWeekData: Array<{ day: string; count: number }> = [];
    const lastWeekData: Array<{ day: string; count: number }> = [];

    for (let i = 0; i < 7; i++) {
      const thisWeekDayStart = new Date(thisWeekStart);
      thisWeekDayStart.setDate(thisWeekDayStart.getDate() + i);
      const thisWeekDayEnd = new Date(thisWeekDayStart);
      thisWeekDayEnd.setDate(thisWeekDayEnd.getDate() + 1);

      const thisWeekCount = getCountFromResult(
        await db
          .select({ count: count() })
          .from(user)
          .where(
            and(
              gte(user.createdAt, thisWeekDayStart),
              lt(user.createdAt, thisWeekDayEnd)
            )
          )
      );
      thisWeekData.push({ day: dayNames[i] ?? "", count: thisWeekCount });

      const lastWeekDayStart = new Date(lastWeekStart);
      lastWeekDayStart.setDate(lastWeekDayStart.getDate() + i);
      const lastWeekDayEnd = new Date(lastWeekDayStart);
      lastWeekDayEnd.setDate(lastWeekDayEnd.getDate() + 1);

      const lastWeekCount = getCountFromResult(
        await db
          .select({ count: count() })
          .from(user)
          .where(
            and(
              gte(user.createdAt, lastWeekDayStart),
              lt(user.createdAt, lastWeekDayEnd)
            )
          )
      );
      lastWeekData.push({ day: dayNames[i] ?? "", count: lastWeekCount });
    }

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
      const monthIndex = new Date(range.start).getMonth();
      lastThreeMonths.push({
        month: monthNames[monthIndex] ?? "",
        count: monthCount,
      });
    }

    return {
      thisWeek: thisWeekData,
      lastWeek: lastWeekData,
      lastThreeMonths,
    };
  }),

  getLikeLeaderboard: adminProcedure
    .input(likeLeaderboardSchema)
    .handler(async ({ input, context }) => {
      const { range, limit } = input;
      const { db } = context;
      const { start, end } = getLeaderboardTimeRange(range);

      const likeCount = sql<number>`COUNT(${postLikes.postId})`;

      const leaderboard = await db
        .select({
          userId: user.id,
          userName: user.name,
          userImage: user.image,
          likeCount,
        })
        .from(postLikes)
        .innerJoin(posts, eq(postLikes.postId, posts.id))
        .innerJoin(user, eq(posts.createdById, user.id))
        .where(
          and(
            gte(postLikes.createdAt, start),
            lt(postLikes.createdAt, end),
            isNull(posts.deletedAt)
          )
        )
        .groupBy(user.id)
        .orderBy(desc(likeCount))
        .limit(limit);

      return leaderboard.map((entry) => ({
        user: {
          id: entry.userId,
          name: entry.userName,
          image: entry.userImage,
        },
        likeCount: entry.likeCount,
      }));
    }),
};
