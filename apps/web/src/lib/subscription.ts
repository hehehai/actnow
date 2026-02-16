import {
  getEffectiveSubscriptionPlan,
  normalizeSubscriptionPlan,
  normalizeSubscriptionStatus,
  SUBSCRIPTION_PLAN_FEATURES,
  SubscriptionCycle,
  SubscriptionPlan,
  type SubscriptionPlanType,
} from "@actnow/common";

export type SubscriptionSnapshot = {
  plan?: string | null;
  status?: string | null;
  cycle?: string | null;
  periodEnd?: string | Date | null;
  updatedAt?: string | Date | null;
};

export const BILLING_CYCLE_OPTIONS = [
  { id: SubscriptionCycle.MONTHLY, label: "Monthly" },
  { id: SubscriptionCycle.YEARLY, label: "Yearly" },
] as const;

export type BillingCycleId = (typeof BILLING_CYCLE_OPTIONS)[number]["id"];

export const PLAN_CARD_DEFINITIONS: Record<
  SubscriptionPlanType,
  {
    id: string;
    description: string;
    features: string[];
  }
> = {
  [SubscriptionPlan.FREE]: {
    id: "free",
    description: "Start for free with public posting.",
    features: ["Up to 20 posts", "Public posts only"],
  },
  [SubscriptionPlan.PRO]: {
    id: "pro",
    description: "For active creators with private drafting needs.",
    features: ["Up to 3000 posts", "Private posts enabled"],
  },
  [SubscriptionPlan.PRO_PLUS]: {
    id: "pro_plus",
    description: "For power users managing large content libraries.",
    features: ["Up to 10000 posts", "Private posts enabled"],
  },
};

const STATUS_LABELS: Record<string, string> = {
  FREE: "Free",
  ACTIVE: "Active",
  TRIALING: "Trialing",
  PAST_DUE: "Past Due",
  CANCELED: "Canceled",
};

export function getPlanLabel(plan?: string | null): string {
  return SUBSCRIPTION_PLAN_FEATURES[normalizeSubscriptionPlan(plan)].label;
}

export function getSubscriptionStatusLabel(status?: string | null): string {
  const normalizedStatus = normalizeSubscriptionStatus(status);
  return STATUS_LABELS[normalizedStatus] ?? normalizedStatus;
}

export function getSubscriptionStatusVariant(
  status?: string | null
): "default" | "secondary" | "destructive" | "outline" {
  const normalizedStatus = normalizeSubscriptionStatus(status);
  if (normalizedStatus === "ACTIVE") return "default";
  if (normalizedStatus === "TRIALING") return "secondary";
  if (normalizedStatus === "PAST_DUE") return "destructive";
  if (normalizedStatus === "CANCELED") return "outline";
  return "secondary";
}

export function getBillingCycleLabel(cycle?: string | null): string {
  if (cycle === SubscriptionCycle.MONTHLY) return "Monthly";
  if (cycle === SubscriptionCycle.YEARLY) return "Yearly";
  return "—";
}

export function getCheckoutSlug(
  plan: SubscriptionPlanType,
  cycle: BillingCycleId
) {
  if (plan === SubscriptionPlan.PRO) {
    return cycle === SubscriptionCycle.YEARLY ? "pro-yearly" : "pro-monthly";
  }
  if (plan === SubscriptionPlan.PRO_PLUS) {
    return cycle === SubscriptionCycle.YEARLY
      ? "pro-plus-yearly"
      : "pro-plus-monthly";
  }
  return null;
}

export function getEffectivePlan(snapshot?: SubscriptionSnapshot | null) {
  return getEffectiveSubscriptionPlan({
    plan: snapshot?.plan,
    status: snapshot?.status,
  });
}
