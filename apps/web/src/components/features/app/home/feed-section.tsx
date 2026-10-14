import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import InViewLoader from "@/components/shared/in-view-loader";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/lib/orpc";
import { FeedEmpty } from "./feed-empty";
import { FeedList } from "./feed-list";

export function FeedSection({ search }: { search?: string }) {
  const { data: session } = authClient.useSession();
  const query = useSuspenseInfiniteQuery(
    orpc.app.post.list.infiniteOptions({
      input: (cursor) => ({ cursor, limit: 12, sort: "latest", search }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    })
  );
  const items = query.data.pages.flatMap((page) => page.items);

  if (items.length === 0 && !query.isFetchingNextPage) {
    return (
      <section className="container mx-auto max-w-7xl px-4 py-10">
        <FeedEmpty />
      </section>
    );
  }

  return (
    <section
      className="container mx-auto max-w-7xl px-4 pt-7 pb-16"
      id="content-feed"
    >
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
        <main className="min-w-0">
          <FeedList items={items} />
          {(query.hasNextPage || query.isFetchingNextPage) && (
            <InViewLoader
              className="flex items-center justify-center py-8"
              loadCondition={Boolean(
                query.hasNextPage && !query.isFetchingNextPage
              )}
              loadFn={query.fetchNextPage}
            >
              {query.isFetchingNextPage && (
                <span className="i-hugeicons-loading-01 animate-spin text-2xl text-muted-foreground" />
              )}
            </InViewLoader>
          )}
        </main>
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <section className="rounded-3xl border border-border bg-card p-5">
              <p className="font-medium text-[11px] text-brand uppercase tracking-[0.16em]">
                Actnow
              </p>
              <h2 className="mt-2 text-balance font-medium text-2xl leading-tight tracking-tight">
                A simple home for useful content.
              </h2>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                Browse published writing and ideas from the Actnow team.
              </p>
              {session?.user?.role === "admin" && (
                <Button
                  className="mt-5 h-11 w-full rounded-xl"
                  nativeButton={false}
                  render={<Link to="/panel" />}
                >
                  Manage content
                </Button>
              )}
            </section>
            <section className="rounded-3xl border border-border bg-card p-5">
              <h2 className="font-medium text-sm">Explore Actnow</h2>
              <div className="mt-3 divide-y divide-border">
                <Link
                  className="flex items-center justify-between py-3 text-sm transition hover:text-brand"
                  to="/about"
                >
                  About the community{" "}
                  <span className="i-hugeicons-arrow-up-right-01 size-4 text-muted-foreground" />
                </Link>
                <Link
                  className="flex items-center justify-between py-3 text-sm transition hover:text-brand"
                  to="/prices"
                >
                  Plans and pricing{" "}
                  <span className="i-hugeicons-arrow-up-right-01 size-4 text-muted-foreground" />
                </Link>
              </div>
            </section>
          </div>
        </aside>
      </div>
    </section>
  );
}
