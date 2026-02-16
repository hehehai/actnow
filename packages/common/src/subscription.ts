export const SubscriptionPlan = {
  FREE: "FREE",
  PRO: "PRO",
  PRO_PLUS: "PRO_PLUS",
} as const;

export type SubscriptionPlanType =
  (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

export const SubscriptionCycle = {
  MONTHLY: "monthly",
  YEARLY: "yearly",
} as const;

export type SubscriptionCycleType =
  (typeof SubscriptionCycle)[keyof typeof SubscriptionCycle];

export const SubscriptionStatus = {
  FREE: "FREE",
  ACTIVE: "ACTIVE",
  TRIALING: "TRIALING",
  PAST_DUE: "PAST_DUE",
  CANCELED: "CANCELED",
} as const;

export type SubscriptionStatusType =
  (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const SUBSCRIPTION_PLAN_FEATURES: Record<
  SubscriptionPlanType,
  {
    label: string;
    maxPosts: number;
    canPrivate: boolean;
  }
> = {
  [SubscriptionPlan.FREE]: {
    label: "Free",
    maxPosts: 20,
    canPrivate: false,
  },
  [SubscriptionPlan.PRO]: {
    label: "Pro",
    maxPosts: 3000,
    canPrivate: true,
  },
  [SubscriptionPlan.PRO_PLUS]: {
    label: "Pro+",
    maxPosts: 10_000,
    canPrivate: true,
  },
};

export function normalizeSubscriptionPlan(
  plan?: string | null
): SubscriptionPlanType {
  if (plan === SubscriptionPlan.PRO || plan === SubscriptionPlan.PRO_PLUS) {
    return plan;
  }
  return SubscriptionPlan.FREE;
}

export function normalizeSubscriptionStatus(
  status?: string | null
): SubscriptionStatusType {
  const upper = status?.toUpperCase();
  if (!upper) {
    return SubscriptionStatus.FREE;
  }

  if (upper === SubscriptionStatus.ACTIVE) {
    return SubscriptionStatus.ACTIVE;
  }

  if (upper === SubscriptionStatus.TRIALING) {
    return SubscriptionStatus.TRIALING;
  }

  if (upper === SubscriptionStatus.PAST_DUE) {
    return SubscriptionStatus.PAST_DUE;
  }

  if (upper === SubscriptionStatus.CANCELED) {
    return SubscriptionStatus.CANCELED;
  }

  if (upper === SubscriptionStatus.FREE) {
    return SubscriptionStatus.FREE;
  }

  return SubscriptionStatus.FREE;
}

export function isSubscriptionEntitled(status?: string | null): boolean {
  const normalizedStatus = normalizeSubscriptionStatus(status);
  return (
    normalizedStatus === SubscriptionStatus.ACTIVE ||
    normalizedStatus === SubscriptionStatus.TRIALING
  );
}

export function getEffectiveSubscriptionPlan(input: {
  plan?: string | null;
  status?: string | null;
}): SubscriptionPlanType {
  if (!isSubscriptionEntitled(input.status)) {
    return SubscriptionPlan.FREE;
  }
  return normalizeSubscriptionPlan(input.plan);
}
