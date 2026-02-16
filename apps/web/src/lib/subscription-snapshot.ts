import type { SubscriptionSnapshot } from "./subscription";

type SessionSubscriptionFields = {
  subscriptionPlan?: string | null;
  subscriptionStatus?: string | null;
  subscriptionCycle?: string | null;
  subscriptionCurrentPeriodEnd?: string | Date | null;
  subscriptionUpdatedAt?: string | Date | null;
};

export function getSessionSubscriptionSnapshot(
  user?: SessionSubscriptionFields | null
): SubscriptionSnapshot | null {
  if (!user) {
    return null;
  }

  return {
    plan: user.subscriptionPlan,
    status: user.subscriptionStatus,
    cycle: user.subscriptionCycle,
    periodEnd: user.subscriptionCurrentPeriodEnd,
    updatedAt: user.subscriptionUpdatedAt,
  };
}

export function getFirstSubscriptionSnapshot(
  ...snapshots: Array<SubscriptionSnapshot | null | undefined>
) {
  return snapshots.find((snapshot) => Boolean(snapshot)) ?? null;
}
