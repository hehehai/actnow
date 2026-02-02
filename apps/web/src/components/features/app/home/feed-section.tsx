import type { PostFeedSortType } from "@actnow/common";
import {
  type InfiniteData,
  useQueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import InViewLoader from "@/components/shared/in-view-loader";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/lib/orpc";
import type { PostFeedOutput } from "@/lib/orpc-types";
import { updateInfiniteQueryItem } from "@/lib/query-helpers";
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
      <section className="container mx-auto px-4 py-8">
        <FeedEmpty />
      </section>
    );
  }

  return (
    <section className="container mx-auto p-4">
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
    </section>
  );
}
