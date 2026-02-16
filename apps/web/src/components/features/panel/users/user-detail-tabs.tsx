import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { SubscriptionStatusBadge } from "@/components/features/common/subscription/subscription-status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDateTime } from "@/lib/formatters";
import type { client } from "@/lib/orpc";
import { getBillingCycleLabel, getPlanLabel } from "@/lib/subscription";

type UserDetailResponse = Awaited<ReturnType<typeof client.panel.user.getById>>;
type UserDetail = NonNullable<UserDetailResponse>;

interface UserDetailTabsProps {
  user: UserDetail;
}

export function UserDetailTabs({ user }: UserDetailTabsProps) {
  const [detailTab, setDetailTab] = useState("subscription");

  const subscription = user.subscription ?? {
    plan: "FREE",
    status: "FREE",
    cycle: null,
    periodEnd: null,
    updatedAt: null,
  };

  const sortedSessions = [...(user.sessions ?? [])].sort((a, b) => {
    const aLastActive = new Date(a.updatedAt ?? a.createdAt).getTime();
    const bLastActive = new Date(b.updatedAt ?? b.createdAt).getTime();
    return bLastActive - aLastActive;
  });

  return (
    <section>
      <Tabs onValueChange={setDetailTab} value={detailTab}>
        <TabsList className="mb-3">
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-2" value="subscription">
          <InfoRow label="Plan" value={getPlanLabel(subscription.plan)} />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <SubscriptionStatusBadge status={subscription.status} />
          </div>
          <InfoRow
            label="Cycle"
            value={getBillingCycleLabel(subscription.cycle)}
          />
          <InfoRow
            label="Period End"
            value={formatDateTime(subscription.periodEnd, "-")}
          />
          <InfoRow
            label="Updated"
            value={formatDateTime(subscription.updatedAt, "-")}
          />
        </TabsContent>

        <TabsContent className="space-y-6" value="security">
          <div>
            <h3 className="mb-3 font-medium text-sm">
              Accounts ({user.accounts?.length ?? 0})
            </h3>
            {user.accounts && user.accounts.length > 0 ? (
              <div className="space-y-2">
                {user.accounts.map((account) => (
                  <div
                    className="flex items-center justify-between rounded-lg border p-3"
                    key={account.id}
                  >
                    <div className="flex items-center gap-2">
                      <ProviderIcon providerId={account.providerId} />
                      <span className="font-medium text-sm capitalize">
                        {account.providerId}
                      </span>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {account.createdAt
                        ? formatDistanceToNow(new Date(account.createdAt), {
                            addSuffix: true,
                          })
                        : "-"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No accounts</p>
            )}
          </div>

          <div>
            <h3 className="mb-3 font-medium text-sm">
              Sessions ({sortedSessions.length})
            </h3>
            {sortedSessions.length > 0 ? (
              <div className="space-y-2">
                {sortedSessions.map((session) => (
                  <div className="rounded-lg border p-3" key={session.id}>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">
                        {session.updatedAt
                          ? formatDistanceToNow(new Date(session.updatedAt), {
                              addSuffix: true,
                            })
                          : "-"}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        Expires{" "}
                        {session.expiresAt
                          ? formatDistanceToNow(new Date(session.expiresAt), {
                              addSuffix: true,
                            })
                          : "-"}
                      </span>
                    </div>
                    {session.ipAddress && (
                      <p className="mt-1 text-xs">IP: {session.ipAddress}</p>
                    )}
                    {session.userAgent && (
                      <Tooltip>
                        <TooltipTrigger>
                          <p className="mt-1 max-w-xl cursor-help truncate text-muted-foreground text-xs">
                            {session.userAgent}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          {session.userAgent}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No active sessions
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function ProviderIcon({ providerId }: { providerId: string }) {
  switch (providerId) {
    case "github":
      return <span className="i-hugeicons-github size-4" />;
    case "google":
      return <span className="i-hugeicons-google size-4" />;
    case "credential":
      return <span className="i-hugeicons-key-01 size-4" />;
    default:
      return <span className="i-hugeicons-link-01 size-4" />;
  }
}
