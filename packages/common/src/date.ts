export type DateRange = { start: Date; end: Date };

export function getMonthRange(monthsAgo: number): DateRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const end = new Date(
    now.getFullYear(),
    now.getMonth() - monthsAgo + 1,
    0,
    23,
    59,
    59,
    999
  );
  return { start, end };
}

export function getDayStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export type LeaderboardRange =
  | "today"
  | "yesterday"
  | "this_month"
  | "last_month"
  | "this_year";

export function getLeaderboardTimeRange(
  range: LeaderboardRange | string
): DateRange {
  const now = new Date();
  const today = getDayStart(now);

  switch (range) {
    case "today":
      return { start: today, end: now };
    case "yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { start: yesterday, end: today };
    }
    case "this_month":
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now,
      };
    case "last_month": {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: lastMonthStart, end: thisMonthStart };
    }
    case "this_year":
      return { start: new Date(now.getFullYear(), 0, 1), end: now };
    default:
      return { start: today, end: now };
  }
}
