import { site, UserRole } from "@actnow/common";
import { Link } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGlobalHotkeys } from "@/hooks/use-global-hotkeys";
import { SiteFilterButton } from "./site-filter-button";
import { SiteHeaderUser } from "./site-header-user";
import { SiteMobileNav, SiteNav } from "./site-nav";

const loadFilterDialog = () =>
  import("@/components/features/app/filter/filter-dialog");
const LazyFilterDialog = lazy(() =>
  loadFilterDialog().then((module) => ({ default: module.FilterDialog }))
);

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchMounted, setSearchMounted] = useState(false);
  const openSearch = useCallback(() => {
    setSearchMounted(true);
    setSearchOpen(true);
  }, []);
  const prefetchSearch = useCallback(() => {
    void loadFilterDialog();
  }, []);
  useGlobalHotkeys(openSearch);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-app pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="container mx-auto flex min-h-15 max-w-7xl items-center gap-x-2 px-4 sm:gap-x-6 lg:gap-x-8">
        <Link
          aria-label={site.siteName}
          className="group flex min-w-0 shrink-0 items-center gap-2.5"
          to="/"
        >
          <img
            alt=""
            className="size-8 shrink-0"
            decoding="async"
            src="/images/logo.svg"
          />
          <span className="truncate font-medium text-base sm:text-lg lg:max-xl:hidden">
            {site.siteName}
          </span>
        </Link>

        <SiteMobileNav user={Boolean(user)} />
        <SiteNav />

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <SiteFilterButton
            onFocus={prefetchSearch}
            onOpen={openSearch}
            onPointerEnter={prefetchSearch}
          />
          {searchMounted ? (
            <Suspense fallback={null}>
              <LazyFilterDialog
                onOpenChange={setSearchOpen}
                open={searchOpen}
              />
            </Suspense>
          ) : null}
          {user ? (
            <>
              {user.role === UserRole.ADMIN && (
                <Button
                  className="rounded-full max-sm:size-9 max-sm:px-0"
                  nativeButton={false}
                  render={<Link to="/panel" />}
                >
                  <span className="i-hugeicons-edit-table size-4" />
                  <span className="max-sm:hidden">Manage content</span>
                </Button>
              )}
              <SiteHeaderUser initialUser={user} />
            </>
          ) : (
            <>
              <Button
                className="hidden rounded-full sm:inline-flex"
                nativeButton={false}
                render={<Link to="/signin" />}
                variant="outline"
              >
                Sign in
              </Button>
              <Button
                className="rounded-full max-sm:h-9 max-sm:px-3 max-sm:text-xs"
                nativeButton={false}
                render={<Link to="/signup" />}
              >
                Join free
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
