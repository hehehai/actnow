import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { getInitials } from "@/lib/formatters";
import { orpc } from "@/lib/orpc";
import { authQueryOptions } from "@/lib/queries";
import { cn } from "@/lib/utils";

const accountItems = [
  {
    to: "/account",
    label: "Overview",
    icon: "i-hugeicons-home-01",
    exact: true,
  },
  {
    to: "/likes",
    label: "Liked posts",
    icon: "i-hugeicons-heart",
    exact: false,
  },
  {
    to: "/feedback",
    label: "Feedback",
    icon: "i-hugeicons-chat-feedback-01",
    exact: false,
  },
  {
    to: "/account/settings",
    label: "Settings",
    icon: "i-hugeicons-settings-01",
    exact: false,
  },
] as const;

export function AccountSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: user } = useSuspenseQuery(authQueryOptions());
  const { data: profile } = useQuery(orpc.app.user.getProfile.queryOptions());
  const displayUser = {
    ...user,
    name: profile?.name ?? user?.name ?? "Member",
    email: profile?.email ?? user?.email ?? "",
    image: profile?.image ?? user?.image,
  };
  const activeItem = accountItems.find((item) =>
    item.exact
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to)
  );

  const signOut = async () => {
    await authClient.signOut();
    await navigate({ to: "/" });
  };

  return (
    <aside className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-5">
        <Link
          className="flex flex-col items-center text-center"
          params={{ userSlug: displayUser.id ?? "" }}
          to="/$userSlug"
        >
          <Avatar className="size-16 rounded-2xl">
            {displayUser.image && (
              <AvatarImage alt={displayUser.name} src={displayUser.image} />
            )}
            <AvatarFallback className="text-lg">
              {getInitials(displayUser.name, { fallback: "A" })}
            </AvatarFallback>
          </Avatar>
          <span className="mt-3 max-w-full truncate font-medium">
            {displayUser.name}
          </span>
          <span className="mt-1 max-w-full truncate text-muted-foreground text-xs">
            {displayUser.email}
          </span>
        </Link>
        <Button
          className="mt-4 w-full rounded-xl"
          onClick={signOut}
          variant="outline"
        >
          Sign out
        </Button>
      </section>

      <div className="lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                className="min-h-11 w-full justify-between rounded-xl"
                variant="outline"
              />
            }
          >
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "size-4",
                  activeItem?.icon ?? "i-hugeicons-menu-01"
                )}
              />
              {activeItem?.label ?? "Account menu"}
            </span>
            <span className="i-hugeicons-unfold-more size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-52">
            {accountItems.map((item) => (
              <DropdownMenuItem key={item.to} render={<Link to={item.to} />}>
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="hidden lg:block">
        <p className="mb-2 px-1 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.16em]">
          Your space
        </p>
        <nav aria-label="Account navigation" className="space-y-1">
          {accountItems.map((item) => {
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <Link
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition",
                  active
                    ? "bg-card font-medium text-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-card/70 hover:text-foreground"
                )}
                key={item.to}
                to={item.to}
              >
                <span className={cn(item.icon, "size-4")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
