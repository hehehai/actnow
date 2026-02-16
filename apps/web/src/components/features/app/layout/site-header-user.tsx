import { site, UserRole } from "@actnow/common";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { getInitials } from "@/lib/formatters";
import { orpc } from "@/lib/orpc";
import { getPlanLabel, getSubscriptionStatusLabel } from "@/lib/subscription";
import {
  getFirstSubscriptionSnapshot,
  getSessionSubscriptionSnapshot,
} from "@/lib/subscription-snapshot";
import { userProfileDialog } from "@/stores/handlers";

interface SiteHeaderUserProps {
  initialUser: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role?: string | null;
  };
}

export function SiteHeaderUser({ initialUser }: SiteHeaderUserProps) {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  // Use session data if available, otherwise use initial user data from server
  const user = session?.user ?? initialUser;
  const { data: profile } = useQuery({
    ...orpc.app.user.getProfile.queryOptions(),
    enabled: !!user?.id,
  });
  const displayUser = {
    ...user,
    name: profile?.name ?? user.name,
    email: profile?.email ?? user.email,
    image: profile?.image ?? user.image,
  };
  const subscription = getFirstSubscriptionSnapshot(
    profile?.subscription,
    getSessionSubscriptionSnapshot(session?.user)
  );
  const subscriptionSummary = subscription
    ? `${getPlanLabel(subscription.plan)} · ${getSubscriptionStatusLabel(
        subscription.status
      )}`
    : "Free";

  const isAdmin = user.role === UserRole.ADMIN;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            className="flex items-center rounded-full pl-3"
            variant="secondary"
          >
            <Avatar className="size-5" size="sm">
              <AvatarImage
                alt={displayUser.name}
                size="sm"
                src={displayUser.image ?? undefined}
              />
              <AvatarFallback className="text-xs">
                {getInitials(displayUser.name, { fallback: "?" })}
              </AvatarFallback>
            </Avatar>
            {displayUser.name}
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="rouned-xl w-50">
        {/* User info section */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-1.5 font-normal">
            <Avatar className="size-8">
              <AvatarImage
                alt={displayUser.name}
                src={displayUser.image ?? undefined}
              />
              <AvatarFallback className="text-xs">
                {getInitials(displayUser.name, { fallback: "?" })}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5">
              <p className="font-medium text-xs leading-none">
                {displayUser.name}
              </p>
              <p className="truncate text-muted-foreground text-xs">
                {displayUser.email}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* User actions */}
        <DropdownMenuGroup>
          {/* Settings - will open dialog */}

          {user?.id && (
            <DropdownMenuItem
              render={<Link params={{ userSlug: user.id }} to="/$userSlug" />}
            >
              <span className="i-hugeicons-user-account" />
              Profile
            </DropdownMenuItem>
          )}

          <DropdownMenuItem render={<Link to="/prices" />}>
            <span className="i-hugeicons-credit-card" />
            <span>Prices</span>
            <span className="ml-auto text-muted-foreground text-xs">
              {subscriptionSummary}
            </span>
          </DropdownMenuItem>

          {/* Admin Dashboard */}
          {isAdmin && (
            <DropdownMenuItem onClick={() => navigate({ to: "/panel" })}>
              <span className="i-hugeicons-dashboard-square-02" />
              Dashboard
            </DropdownMenuItem>
          )}

          {/* My Feedback */}
          <DropdownMenuItem render={<Link to="/feedback" />}>
            <span className="i-hugeicons-chat-feedback-01" />
            Feedback
          </DropdownMenuItem>

          {/* My Likes */}
          <DropdownMenuItem render={<Link to="/likes" />}>
            <span className="i-hugeicons-thumbs-up-rectangle" />
            Likes
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              userProfileDialog.openWithPayload(undefined);
            }}
          >
            <span className="i-hugeicons-account-setting-03" />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Theme toggle */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-foreground">
              <span className="i-hugeicons-cinnamon-roll text-sm" />
              <span className="text-xs">Theme</span>
            </div>
            <ThemeToggle />
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Links */}
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link to="/about" />}>
            <span className="i-hugeicons-information-circle" />
            About
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => window.open(site.githubUrl, "_blank", "noopener")}
            render={
              <a
                href={site.githubUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="i-hugeicons-github" />
                GitHub
              </a>
            }
          />
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Sign out */}
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    navigate({ to: "/" });
                  },
                },
              });
            }}
            variant="destructive"
          >
            <span className="i-hugeicons-logout-01" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
