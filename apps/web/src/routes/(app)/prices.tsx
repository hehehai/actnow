import {
  SUBSCRIPTION_PLAN_FEATURES,
  SubscriptionPlan,
  type SubscriptionPlanType,
} from "@actnow/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { SubscriptionStatusBadge } from "@/components/features/common/subscription/subscription-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { client, orpc } from "@/lib/orpc";
import { createPageMeta } from "@/lib/seo";
import {
  BILLING_CYCLE_OPTIONS,
  type BillingCycleId,
  getBillingCycleLabel,
  getCheckoutSlug,
  getEffectivePlan,
  getPlanLabel,
  PLAN_CARD_DEFINITIONS,
} from "@/lib/subscription";
import {
  getFirstSubscriptionSnapshot,
  getSessionSubscriptionSnapshot,
} from "@/lib/subscription-snapshot";

const pricingMeta = createPageMeta({
  title: "Pricing",
  description: "Choose a plan that fits your workflow.",
  url: "/prices",
});

const pricingSearchSchema = z.object({
  checkout_id: z.string().optional(),
});

export const Route = createFileRoute("/(app)/prices")({
  validateSearch: pricingSearchSchema,
  component: PricingPage,
  head: () => ({
    meta: pricingMeta.meta,
    links: pricingMeta.links,
  }),
});

function PricingPage() {
  const { data: session } = authClient.useSession();
  const { checkout_id: checkoutId } = Route.useSearch();
  const isAuthed = Boolean(session?.user);
  const queryClient = useQueryClient();
  const [billingCycle, setBillingCycle] = useState<BillingCycleId>("monthly");

  const { data: profile } = useQuery({
    ...orpc.app.user.getProfile.queryOptions(),
    enabled: isAuthed,
    staleTime: checkoutId ? 0 : undefined,
    refetchOnMount: checkoutId ? "always" : undefined,
    refetchOnWindowFocus: checkoutId ? true : undefined,
  });

  const { data: syncedSnapshotResponse } = useQuery({
    queryKey: ["billing", "sync-snapshot", checkoutId ?? null],
    enabled: isAuthed && Boolean(checkoutId),
    queryFn: async () => {
      const result = await client.app.user.syncBillingSnapshot();
      await queryClient.invalidateQueries({
        queryKey: orpc.app.user.getProfile.key(),
      });
      return result;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const sessionSnapshot = getSessionSubscriptionSnapshot(session?.user);
  const currentSnapshot = getFirstSubscriptionSnapshot(
    syncedSnapshotResponse?.subscription,
    profile?.subscription,
    sessionSnapshot
  );
  const currentPlan = getEffectivePlan(currentSnapshot);
  const currentStatus = currentSnapshot?.status;
  const currentCycle = currentSnapshot?.cycle;

  const checkoutMutation = useMutation({
    mutationFn: async (slug: string) => {
      await client.app.user.ensureBillingCustomer();

      const result = await authClient.checkout({ slug });
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onSuccess: (checkoutData) => {
      if (checkoutData?.url) {
        window.location.href = checkoutData.url;
      }
    },
  });

  const portalMutation = useMutation({
    mutationFn: async () => {
      const result = await authClient.customer.portal({ redirect: true });
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onSuccess: (portalData) => {
      if (portalData?.url) {
        window.location.href = portalData.url;
      }
    },
  });

  const handleCheckout = async (plan: SubscriptionPlanType) => {
    const slug = getCheckoutSlug(plan, billingCycle);
    if (!slug) return;

    try {
      await checkoutMutation.mutateAsync(slug);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to open checkout"
      );
    }
  };

  const handleOpenPortal = async () => {
    try {
      await portalMutation.mutateAsync();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to open billing portal"
      );
    }
  };

  return (
    <div className="container mx-auto flex flex-col gap-8 px-4 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-balance font-semibold text-3xl">Pricing</h1>
        <p className="mt-3 text-pretty text-muted-foreground text-sm">
          Choose your plan. Upgrade or manage billing at any time.
        </p>
      </div>

      <div className="mx-auto inline-flex rounded-lg border bg-muted/40 p-1">
        {BILLING_CYCLE_OPTIONS.map((option) => {
          const isActive = billingCycle === option.id;
          return (
            <button
              className={
                isActive
                  ? "rounded-md bg-background px-4 py-2 font-medium text-sm shadow-sm"
                  : "rounded-md px-4 py-2 text-muted-foreground text-sm"
              }
              key={option.id}
              onClick={() => setBillingCycle(option.id)}
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          SubscriptionPlan.FREE,
          SubscriptionPlan.PRO,
          SubscriptionPlan.PRO_PLUS,
        ].map((plan) => {
          const definition = PLAN_CARD_DEFINITIONS[plan];
          const features = SUBSCRIPTION_PLAN_FEATURES[plan];
          const isCurrent = currentPlan === plan;

          return (
            <Card key={plan}>
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-balance text-base">
                    {features.label}
                  </CardTitle>
                  {isCurrent && (
                    <SubscriptionStatusBadge status={currentStatus} />
                  )}
                </div>
                <p className="text-pretty text-muted-foreground text-sm">
                  {definition.description}
                </p>
                <p className="font-semibold text-2xl tabular-nums">
                  {plan === SubscriptionPlan.FREE
                    ? "Free"
                    : billingCycle === "yearly"
                      ? "Yearly"
                      : "Monthly"}
                </p>
              </CardHeader>

              <CardContent className="space-y-2 text-sm">
                {definition.features.map((feature) => (
                  <div className="flex items-center gap-2" key={feature}>
                    <span className="i-hugeicons-checkmark-circle-02 size-4 text-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <span className="i-hugeicons-checkmark-circle-02 size-4 text-primary" />
                  <span>Max posts: {features.maxPosts.toLocaleString()}</span>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-2">
                {isAuthed ? (
                  plan === SubscriptionPlan.FREE ? (
                    <Button
                      disabled={isCurrent || portalMutation.isPending}
                      onClick={handleOpenPortal}
                      variant="outline"
                    >
                      {isCurrent ? "Current plan" : "Manage in portal"}
                    </Button>
                  ) : isCurrent ? (
                    <Button
                      disabled={portalMutation.isPending}
                      onClick={handleOpenPortal}
                      variant="outline"
                    >
                      {portalMutation.isPending
                        ? "Opening..."
                        : "Manage Subscription"}
                    </Button>
                  ) : (
                    <Button
                      disabled={checkoutMutation.isPending}
                      onClick={() => handleCheckout(plan)}
                    >
                      {checkoutMutation.isPending
                        ? "Redirecting..."
                        : "Upgrade"}
                    </Button>
                  )
                ) : (
                  <Button nativeButton={false} render={<Link to="/signin" />}>
                    Sign in to continue
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {isAuthed && (
        <div className="rounded-xl border bg-card p-4 text-sm">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>
              Current Plan: <strong>{getPlanLabel(currentPlan)}</strong>
            </span>
            <span>
              Status: <SubscriptionStatusBadge status={currentStatus} />
            </span>
            <span>Cycle: {getBillingCycleLabel(currentCycle)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
