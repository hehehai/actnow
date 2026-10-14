import { UserRole } from "@actnow/common";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
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
  const isAdmin = user.role === UserRole.ADMIN;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            className="flex max-w-44 items-center rounded-full pl-2.5 sm:pl-3"
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
            <span className="hidden truncate sm:inline">
              {displayUser.name}
            </span>
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="w-52 rounded-2xl">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-2 font-normal">
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

        <DropdownMenuGroup>
          {isAdmin && (
            <DropdownMenuItem onClick={() => navigate({ to: "/panel" })}>
              <span className="i-hugeicons-dashboard-browsing" />
              Content management
            </DropdownMenuItem>
          )}

          <DropdownMenuItem render={<Link to="/account" />}>
            <span className="i-hugeicons-home-01" />
            Your space
          </DropdownMenuItem>

          <DropdownMenuItem render={<Link to="/account/profile" />}>
            <span className="i-hugeicons-user-account" />
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem render={<Link to="/account/subscription" />}>
            <span className="i-hugeicons-credit-card" />
            Subscription
          </DropdownMenuItem>

          <DropdownMenuItem render={<Link to="/account/settings" />}>
            <span className="i-hugeicons-account-setting-03" />
            Settings
          </DropdownMenuItem>

          <DropdownMenuItem render={<Link to="/feedback" />}>
            <span className="i-hugeicons-chat-feedback-01" />
            Feedback
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

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
