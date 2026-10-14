import type { PostFeedSortType } from "@actnow/common";
import {
  type InfiniteData,
  useQueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import InViewLoader from "@/components/shared/in-view-loader";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/lib/orpc";
import type { PostFeedOutput } from "@/lib/orpc-types";
import { updateInfiniteQueryItem } from "@/lib/query-helpers";
import { postFormDialog } from "@/stores/handlers";
import { FeedEmpty } from "./feed-empty";
import { FeedList } from "./feed-list";
import type { FeedItem } from "./feed-types";

const MAX_UNAUTH_ITEMS = 36;

interface FeedSectionProps {
  sort: PostFeedSortType;
  tagSlugs?: string[];
}

export function FeedSection({ sort, tagSlugs }: FeedSectionProps) {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const infiniteOptions = useMemo(
    () =>
      orpc.app.post.list.infiniteOptions({
        input: (pageParam) => ({
          cursor: pageParam,
          limit: 12,
          sort,
          tagSlugs,
          visibility: "public",
        }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      }),
    [sort, tagSlugs]
  );

  const query = useSuspenseInfiniteQuery(infiniteOptions);
  const data = query.data as InfiniteData<PostFeedOutput>;
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  const allItems = data.pages.flatMap((page) =>
    page.items.map((item) => {
      const typedItem = item as Partial<FeedItem>;
      return { ...item, liked: typedItem.liked ?? false } as FeedItem;
    })
  );

  const isAuthenticated = !!session;
  const displayItems = isAuthenticated
    ? allItems
    : allItems.slice(0, MAX_UNAUTH_ITEMS);

  const canLoadMore = isAuthenticated
    ? hasNextPage
    : hasNextPage && allItems.length < MAX_UNAUTH_ITEMS;

  const handleLikeChange = useCallback(
    (postId: string, liked: boolean) => {
      updateInfiniteQueryItem<FeedItem>(
        queryClient,
        infiniteOptions.queryKey,
        postId,
        (item) => ({
          ...item,
          liked,
          post: {
            ...item.post,
            likes: Math.max(item.post.likes + (liked ? 1 : -1), 0),
          },
        }),
        (item) => item.post.id
      );
    },
    [queryClient, infiniteOptions.queryKey]
  );

  if (displayItems.length === 0 && !isFetchingNextPage) {
    return (
      <section className="container mx-auto max-w-7xl px-4 py-10">
        <FeedEmpty />
      </section>
    );
  }

  return (
    <section
      className="container mx-auto max-w-7xl px-4 pt-7 pb-16"
      id="community-feed"
    >
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
        <main className="min-w-0">
          <FeedList items={displayItems} onLikeChange={handleLikeChange} />
          {(canLoadMore || isFetchingNextPage) && (
            <InViewLoader
              className="flex items-center justify-center py-8"
              loadCondition={canLoadMore && !isFetchingNextPage}
              loadFn={fetchNextPage}
            >
              {isFetchingNextPage && (
                <span className="i-hugeicons-loading-01 animate-spin text-2xl text-muted-foreground" />
              )}
            </InViewLoader>
          )}
        </main>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <section className="rounded-3xl border border-border bg-card p-5 shadow-(--shadow-card)">
              <p className="font-medium text-[11px] text-brand uppercase tracking-[0.16em]">
                Make it yours
              </p>
              <h2 className="mt-2 text-balance font-medium text-2xl leading-tight tracking-tight">
                An idea is better when it&apos;s in motion.
              </h2>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                Save something that inspires you, add your perspective, or share
                what you&apos;re working on.
              </p>
              <Button
                className="mt-5 h-11 w-full rounded-xl"
                onClick={() => {
                  if (!session) {
                    void navigate({ to: "/signin" });
                    return;
                  }
                  postFormDialog.openWithPayload({ mode: "create" });
                }}
              >
                <span className="i-hugeicons-pencil-edit-01 size-4" /> Share an
                idea
              </Button>
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
                  Membership and pricing{" "}
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
