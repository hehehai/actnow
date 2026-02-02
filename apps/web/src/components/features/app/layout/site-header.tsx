import { site } from "@actnow/common";
import { Link, useNavigate } from "@tanstack/react-router";
import { SendIcon } from "@/components/shared/icons/send";
import { Button } from "@/components/ui/button";
import { postFormDialog } from "@/stores/handlers";
import { SiteFilterButton } from "./site-filter-button";
import { SiteHeaderMenu } from "./site-header-menu";
import { SiteHeaderUser } from "./site-header-user";

export interface SiteHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role?: string | null;
  } | null;
}

export function SiteHeader({ user }: SiteHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="w-full">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Left: Logo */}
        <Link className="font-semibold text-3xl" to="/">
          {site.siteName}
        </Link>

        {/* Right: Auth buttons + Menu */}
        <div className="flex items-center gap-2.5">
          <SiteFilterButton />
          <Button
            className="rounded-full"
            onClick={() => {
              if (!user) {
                navigate({ to: "/signin" });
                return;
              }
              postFormDialog.openWithPayload({ mode: "create" });
            }}
            variant="default"
          >
            <SendIcon />
            Create Post
          </Button>
          {user ? (
            <SiteHeaderUser initialUser={user} />
          ) : (
            <>
              <Button
                className="rounded-full"
                nativeButton={false}
                render={<Link to="/signin" />}
                variant="default"
              >
                Signin
              </Button>
              <Button
                className="rounded-full"
                nativeButton={false}
                render={<Link to="/signup" />}
                variant="secondary"
              >
                Signup
              </Button>
              <SiteHeaderMenu />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
