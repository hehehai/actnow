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
import {
  changeEmailDialog,
  changePasswordDialog,
  setPasswordDialog,
  verifyEmailDialog,
} from "@/stores/handlers";
import { ProfileForm } from "./profile-form";

export function AccountTab() {
  const queryClient = useQueryClient();

  // Fetch profile data
  const { data: profile, isLoading: isProfileLoading } = useQuery(
    orpc.app.user.getProfile.queryOptions()
  );

  // Fetch sessions
  const { data: sessions = [] } = useQuery(
    orpc.app.user.getSessions.queryOptions()
  );

  // Fetch linked accounts
  const { data: linkedAccounts = [] } = useQuery(
    orpc.app.user.getLinkedAccounts.queryOptions()
  );

  // Revoke session mutation
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

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case "github":
        return "i-hugeicons-github";
      case "google":
        return "i-hugeicons-google";
      default:
        return "i-hugeicons-link-01";
    }
  };

  const handleEmailAction = () => {
    if (!profile?.email) return;
    if (profile.emailVerified) {
      changeEmailDialog.openWithPayload({ currentEmail: profile.email });
    } else {
      verifyEmailDialog.openWithPayload({ email: profile.email });
    }
  };

  const handlePasswordAction = () => {
    if (profile?.hasCredential) {
      changePasswordDialog.openWithPayload(undefined);
    } else {
      setPasswordDialog.openWithPayload(undefined);
    }
  };

  if (isProfileLoading || !profile) {
    return <AccountTabSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <section className="space-y-4">
        <h3 className="font-medium">Profile</h3>
        <ProfileForm profile={{ name: profile.name, image: profile.image }} />
      </section>

      {/* Account Info Section */}
      <section className="space-y-3">
        <h3 className="font-medium">Account</h3>
        <ItemGroup>
          {/* Email */}
          <Item size="sm" variant="muted">
            <ItemContent>
              <ItemTitle>
                Email
                {profile.emailVerified ? (
                  <Badge className="py-px" shape="dot" variant="default">
                    Verified
                  </Badge>
                ) : (
                  <Badge className="py-px" shape="dot" variant="secondary">
                    Unverified
                  </Badge>
                )}
              </ItemTitle>
              <ItemDescription>{profile.email}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                className="min-w-18"
                onClick={handleEmailAction}
                size="sm"
                variant="outline"
              >
                {profile.emailVerified ? "Edit" : "Verify"}
              </Button>
            </ItemActions>
          </Item>

          {/* Password */}
          <Item size="sm" variant="muted">
            <ItemContent>
              <ItemTitle>Password</ItemTitle>
              <ItemDescription>
                {profile.hasCredential
                  ? "Password is set"
                  : "No password set (using OAuth)"}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                className="min-w-18"
                onClick={handlePasswordAction}
                size="sm"
                variant="outline"
              >
                {profile.hasCredential ? "Change" : "Set Password"}
              </Button>
            </ItemActions>
          </Item>
        </ItemGroup>
      </section>

      {/* Sessions Section */}
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

      {/* Linked Accounts Section */}
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

function AccountTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile Section Skeleton */}
      <section className="space-y-4">
        <Skeleton className="h-5 w-16" />
        <div className="flex gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </section>

      {/* Account Section Skeleton */}
      <section className="space-y-3">
        <Skeleton className="h-5 w-20" />
        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </section>

      {/* Sessions Section Skeleton */}
      <section className="space-y-3">
        <Skeleton className="h-5 w-20" />
        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </section>
    </div>
  );
}
