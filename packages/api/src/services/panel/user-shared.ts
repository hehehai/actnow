import { eq, gte, ilike, lte, or, type SQL } from "@actnow/db";
import { user } from "@actnow/db/schema/auth";

interface BuildUserListConditionsInput {
  search?: string;
  role?: string;
  status?: "ban" | "normal" | undefined;
  dateFrom?: Date;
  dateTo?: Date;
}

export function buildUserListConditions({
  search,
  role,
  status,
  dateFrom,
  dateTo,
}: BuildUserListConditionsInput): SQL[] {
  const conditions: SQL[] = [];

  if (search) {
    const searchCondition = or(
      ilike(user.name, `%${search}%`),
      ilike(user.email, `%${search}%`)
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (role) {
    conditions.push(eq(user.role, role));
  }

  if (status === "ban") {
    conditions.push(eq(user.banned, true));
  } else if (status === "normal") {
    conditions.push(eq(user.banned, false));
  }

  if (dateFrom) {
    conditions.push(gte(user.createdAt, dateFrom));
  }

  if (dateTo) {
    conditions.push(lte(user.createdAt, dateTo));
  }

  return conditions;
}

interface UserSubscriptionSnapshotInput {
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionCycle: string | null;
  subscriptionCurrentPeriodEnd: Date | null;
  subscriptionUpdatedAt?: Date | null;
}

export function mapUserSubscriptionSnapshot(
  record: UserSubscriptionSnapshotInput
) {
  return {
    plan: record.subscriptionPlan,
    status: record.subscriptionStatus,
    cycle: record.subscriptionCycle,
    periodEnd: record.subscriptionCurrentPeriodEnd,
    updatedAt: record.subscriptionUpdatedAt ?? null,
  };
}

interface UserListRow {
  id: string;
  name: string;
  email: string;
  role: string | null;
  image: string | null;
  banned: boolean | null;
  banReason: string | null;
  createdAt: Date;
  lastSignedIn: Date | null;
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionCycle: string | null;
  subscriptionPeriodEnd: Date | null;
}

export function mapPanelUserListItem(row: UserListRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role ?? "USER",
    image: row.image,
    banned: row.banned,
    banReason: row.banReason,
    createdAt: row.createdAt,
    lastSignedIn: row.lastSignedIn,
    subscription: {
      plan: row.subscriptionPlan,
      status: row.subscriptionStatus,
      cycle: row.subscriptionCycle,
      periodEnd: row.subscriptionPeriodEnd,
    },
  };
}
