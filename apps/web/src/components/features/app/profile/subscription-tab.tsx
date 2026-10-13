import { SubscriptionPlan } from "@actnow/common";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { SubscriptionStatusBadge } from "@/components/features/common/subscription/subscription-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { formatDateTime } from "@/lib/formatters";
import { orpc } from "@/lib/orpc";
import {
  getBillingCycleLabel,
  getPlanLabel,
  getSubscriptionStatusLabel,
} from "@/lib/subscription";
import { getSessionSubscriptionSnapshot } from "@/lib/subscription-snapshot";

type PolarOrder = {
  id: string;
  created_at: Date | string | null;
  status: string;
  total_amount: number;
  currency: string;
  product?: {
    name?: string | null;
  } | null;
};

export function SubscriptionTab() {
  const { data: session } = authClient.useSession();

  const { data: profile } = useQuery({
    ...orpc.app.user.getProfile.queryOptions(),
    enabled: !!session,
  });

  const { data: customerState, isLoading: isStateLoading } = useQuery({
    queryKey: ["polar", "customer-state"],
    queryFn: async () => {
      const result = await authClient.customer.state();
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    enabled: !!session,
  });

  const { data: ordersData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ["polar", "orders"],
    queryFn: async () => {
      const result = await authClient.customer.orders.list({
        query: {
          limit: 10,
          productBillingType: "recurring",
        },
      });
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    enabled: !!session,
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

  const handleOpenPortal = async () => {
    try {
      await portalMutation.mutateAsync();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to open billing portal"
      );
    }
  };

  if (!session) {
    return (
      <div className="space-y-4">
        <h3 className="text-balance font-medium">Subscription</h3>
        <p className="text-pretty text-muted-foreground text-sm">
          Sign in to manage your subscription details.
        </p>
        <Button nativeButton={false} render={<Link to="/signin" />}>
          Sign in
        </Button>
      </div>
    );
  }

  const activeSubscription = customerState?.active_subscriptions?.[0];
  const sessionSnapshot = getSessionSubscriptionSnapshot(session.user);
  const snapshot = profile?.subscription ?? sessionSnapshot;
  const plan = snapshot?.plan ?? SubscriptionPlan.FREE;
  const status = activeSubscription?.status ?? snapshot?.status ?? "FREE";
  const cycle =
    activeSubscription?.recurring_interval === "year"
      ? "yearly"
      : activeSubscription?.recurring_interval === "month"
        ? "monthly"
        : snapshot?.cycle;
  const periodEnd =
    activeSubscription?.current_period_end ?? snapshot?.periodEnd;
  const orders = (ordersData?.items ?? []) as PolarOrder[];

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div>
          <h3 className="text-balance font-medium">Current Plan</h3>
          <p className="text-pretty text-muted-foreground text-sm">
            Review your current entitlement and renewal details.
          </p>
        </div>

        <Card>
          <CardHeader className="flex items-start justify-between gap-3 sm:flex-row">
            <div className="space-y-1">
              <CardTitle className="text-balance">
                {getPlanLabel(plan)}
              </CardTitle>
              <CardDescription className="text-pretty">
                Manage billing and subscription lifecycle in Polar customer
                portal.
              </CardDescription>
            </div>
            <SubscriptionStatusBadge status={status} />
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoRow label="Plan" value={getPlanLabel(plan)} />
            <InfoRow
              label="Status"
              value={getSubscriptionStatusLabel(status)}
            />
            <InfoRow
              label="Billing Cycle"
              value={getBillingCycleLabel(cycle)}
            />
            <InfoRow
              label="Current Period End"
              value={formatDateTime(periodEnd, "—")}
            />
          </CardContent>
          <CardFooter>
            <Button
              disabled={portalMutation.isPending}
              onClick={handleOpenPortal}
              variant="outline"
            >
              {portalMutation.isPending ? "Opening..." : "Manage Subscription"}
            </Button>
          </CardFooter>
        </Card>
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-balance font-medium">Billing History</h3>
          <p className="text-pretty text-muted-foreground text-sm">
            Recent subscription-related orders from Polar.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
                    key={order.id}
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        {order.product?.name ?? "Subscription"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatDateTime(order.created_at, "—")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {order.status.replaceAll("_", " ").toUpperCase()}
                      </Badge>
                      <span className="font-medium tabular-nums">
                        {formatOrderAmount(order.total_amount, order.currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No billing history yet.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {(isStateLoading || isOrdersLoading) && (
        <p className="text-muted-foreground text-sm">Loading subscription...</p>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function formatOrderAmount(amountInCents: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountInCents / 100);
}
