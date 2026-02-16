import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { confirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { client, orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";

export function SessionTab() {
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading: isSessionsLoading } = useQuery(
    orpc.app.user.getSessions.queryOptions()
  );
  const { data: linkedAccounts = [], isLoading: isLinkedLoading } = useQuery(
    orpc.app.user.getLinkedAccounts.queryOptions()
  );

  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId: string) =>
      client.app.user.revokeSession({ sessionId }),
    onSuccess: () => {
      toast.success("Session revoked");
      queryClient.invalidateQueries({
        queryKey: orpc.app.user.getSessions.key(),
      });
    },
  });

  const handleRevokeSession = (sessionId: string) => {
    confirmDialog.openWithPayload({
      title: "Revoke Session",
      description:
        "Are you sure you want to revoke this session? The device will be signed out.",
      confirmText: "Revoke",
      variant: "destructive",
      onConfirm: async () => {
        await revokeSessionMutation.mutateAsync(sessionId);
      },
    });
  };

  if (isSessionsLoading || isLinkedLoading) {
    return <SessionTabSkeleton />;
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="font-medium">Sessions</h3>
        <ItemGroup>
          {sessions.map((session) => (
            <Item key={session.id} size="sm" variant="muted">
              <ItemContent>
                <ItemTitle>
                  {session.isCurrent ? "Current Session" : "Session"}
                  {session.isCurrent && (
                    <Badge className="py-px" shape="bar" variant="secondary">
                      Active
                    </Badge>
                  )}
                </ItemTitle>
                {session.userAgent && (
                  <ItemDescription className="line-clamp-1">
                    {session.userAgent}
                  </ItemDescription>
                )}
                <ItemDescription>
                  {session.ipAddress && `${session.ipAddress} · `}
                  {new Date(session.createdAt).toLocaleDateString()}
                </ItemDescription>
              </ItemContent>
              {!session.isCurrent && (
                <ItemActions>
                  <Button
                    className="min-w-18"
                    onClick={() => handleRevokeSession(session.id)}
                    size="sm"
                    variant="outline"
                  >
                    Revoke
                  </Button>
                </ItemActions>
              )}
            </Item>
          ))}
        </ItemGroup>
      </section>

      {linkedAccounts.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-medium">Linked Accounts</h3>
          <ItemGroup>
            {linkedAccounts.map((account) => (
              <Item key={account.id} size="sm" variant="muted">
                <ItemMedia variant="icon">
                  <span
                    className={cn(
                      getProviderIcon(account.providerId),
                      "size-4"
                    )}
                  />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="capitalize">
                    {account.providerId}
                  </ItemTitle>
                  <ItemDescription>{account.accountId}</ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        </section>
      )}
    </div>
  );
}

function getProviderIcon(providerId: string) {
  switch (providerId) {
    case "github":
      return "i-hugeicons-github";
    case "google":
      return "i-hugeicons-google";
    default:
      return "i-hugeicons-link-01";
  }
}

function SessionTabSkeleton() {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <Skeleton className="h-5 w-20" />
        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </section>
    </div>
  );
}
