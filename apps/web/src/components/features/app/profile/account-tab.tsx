import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";
import {
  changeEmailDialog,
  changePasswordDialog,
  setPasswordDialog,
  verifyEmailDialog,
} from "@/stores/handlers";
import { ProfileForm } from "./profile-form";

export function AccountTab() {
  const { data: profile, isLoading } = useQuery(
    orpc.app.user.getProfile.queryOptions()
  );

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

  if (isLoading || !profile) {
    return <AccountTabSkeleton />;
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h3 className="font-medium">Profile</h3>
        <ProfileForm
          profile={{
            name: profile.name,
            image: profile.image,
            bio: profile.bio,
            socialLinks: profile.socialLinks,
          }}
        />
      </section>

      <section className="space-y-3">
        <h3 className="font-medium">Account</h3>
        <ItemGroup>
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
    </div>
  );
}

function AccountTabSkeleton() {
  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <Skeleton className="h-5 w-16" />
        <div className="flex gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <Skeleton className="h-5 w-20" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </section>
    </div>
  );
}
