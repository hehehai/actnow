import { SubscriptionPlan, SubscriptionStatus } from "@actnow/common";

type PolarProductEnvKey =
  | "POLAR_PRODUCT_PRO_MONTHLY_ID"
  | "POLAR_PRODUCT_PRO_YEARLY_ID"
  | "POLAR_PRODUCT_PRO_PLUS_MONTHLY_ID"
  | "POLAR_PRODUCT_PRO_PLUS_YEARLY_ID";

export type PolarActiveSubscriptionLike = {
  productId: string;
  status: string;
  recurringInterval: string;
  currentPeriodEnd: Date | null;
};

export type SubscriptionSnapshot = {
  plan: string;
  status: string;
  cycle: string | null;
  currentPeriodEnd: Date | null;
};

function getEnvValue(key: PolarProductEnvKey): string {
  return process.env[key] ?? "";
}

export function getPolarPlanByProductIdMap(): Map<string, string> {
  const proMonthlyProductId = getEnvValue("POLAR_PRODUCT_PRO_MONTHLY_ID");
  const proYearlyProductId = getEnvValue("POLAR_PRODUCT_PRO_YEARLY_ID");
  const proPlusMonthlyProductId = getEnvValue(
    "POLAR_PRODUCT_PRO_PLUS_MONTHLY_ID"
  );
  const proPlusYearlyProductId = getEnvValue(
    "POLAR_PRODUCT_PRO_PLUS_YEARLY_ID"
  );

  const map = new Map<string, string>();

  if (proMonthlyProductId) {
    map.set(proMonthlyProductId, SubscriptionPlan.PRO);
  }

  if (proYearlyProductId) {
    map.set(proYearlyProductId, SubscriptionPlan.PRO);
  }

  if (proPlusMonthlyProductId) {
    map.set(proPlusMonthlyProductId, SubscriptionPlan.PRO_PLUS);
  }

  if (proPlusYearlyProductId) {
    map.set(proPlusYearlyProductId, SubscriptionPlan.PRO_PLUS);
  }

  return map;
}

function getPlanRank(plan: string): number {
  if (plan === SubscriptionPlan.PRO_PLUS) return 2;
  if (plan === SubscriptionPlan.PRO) return 1;
  return 0;
}

function normalizeCycle(interval?: string | null): string | null {
  if (interval === "month") {
    return "monthly";
  }
  if (interval === "year") {
    return "yearly";
  }
  return null;
}

function normalizeStatus(status?: string | null): string {
  const normalized = status?.toUpperCase();
  if (normalized === "ACTIVE") {
    return SubscriptionStatus.ACTIVE;
  }
  if (normalized === "TRIALING") {
    return SubscriptionStatus.TRIALING;
  }
  if (normalized === "PAST_DUE") {
    return SubscriptionStatus.PAST_DUE;
  }
  if (normalized === "CANCELED") {
    return SubscriptionStatus.CANCELED;
  }
  return SubscriptionStatus.FREE;
}

export function getSnapshotFromSubscriptions(
  subscriptions: PolarActiveSubscriptionLike[],
  planByProductId: Map<string, string>
): SubscriptionSnapshot {
  if (!subscriptions.length) {
    return {
      plan: SubscriptionPlan.FREE,
      status: SubscriptionStatus.FREE,
      cycle: null,
      currentPeriodEnd: null,
    };
  }

  let selected = subscriptions[0];
  let selectedPlan =
    planByProductId.get(selected.productId) ?? SubscriptionPlan.FREE;

  for (const subscription of subscriptions.slice(1)) {
    const plan =
      planByProductId.get(subscription.productId) ?? SubscriptionPlan.FREE;
    if (getPlanRank(plan) > getPlanRank(selectedPlan)) {
      selected = subscription;
      selectedPlan = plan;
    }
  }

  return {
    plan: selectedPlan,
    status: normalizeStatus(selected.status),
    cycle: normalizeCycle(selected.recurringInterval),
    currentPeriodEnd: selected.currentPeriodEnd ?? null,
  };
}
