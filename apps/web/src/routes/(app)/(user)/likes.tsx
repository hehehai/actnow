import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import { PostCard } from "@/components/features/app/post/post-card";
import InViewLoader from "@/components/shared/in-view-loader";
import { orpc } from "@/lib/orpc";
import type { UserLikesOutput } from "@/lib/orpc-types";
import { authQueryOptions } from "@/lib/queries";
import { createPageMeta } from "@/lib/seo";

const likesMeta = createPageMeta({
  title: "My Likes",
  description: "Your saved design inspirations on Refto.",
  url: "/likes",
  noIndex: true,
});

export const Route = createFileRoute("/(app)/(user)/likes")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(authQueryOptions());
    if (!user) {
      throw redirect({ to: "/signin" });
    }
  },
  component: LikesComponent,
  head: () => ({
    meta: likesMeta.meta,
    links: likesMeta.links,
  }),
});

function LikesComponent() {
  const queryClient = useQueryClient();

  const infiniteOptions = useMemo(
    () =>
      orpc.app.like.getUserLikes.infiniteOptions({
        input: (pageParam) => ({ cursor: pageParam, limit: 12 }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      }),
    []
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery(infiniteOptions);

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  const handleLikeChange = useCallback(
    (postId: string, liked: boolean) => {
      if (!liked) {
        queryClient.setQueryData(
          infiniteOptions.queryKey,
          (
            oldData:
              | { pages: UserLikesOutput[]; pageParams: (string | undefined)[] }
              | undefined
          ) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                items: page.items.filter((item) => item.post.id !== postId),
              })),
            };
          }
        );
      }
    },
    [queryClient, infiniteOptions.queryKey]
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-balance font-bold text-2xl">My Likes</h1>

      {items.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <span className="i-hugeicons-heart text-4xl" />
          <p className="mt-2 text-pretty">
            You haven&apos;t liked any posts yet.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <PostCard
                author={item.author}
                key={item.post.id}
                liked
                onLikeChange={(liked) => handleLikeChange(item.post.id, liked)}
                post={{
                  ...item.post,
                  createdAt: new Date(item.post.createdAt),
                }}
                tags={item.post.tags ?? []}
              />
            ))}
          </div>

          {(hasNextPage || isFetchingNextPage) && (
            <InViewLoader
              className="flex items-center justify-center py-8"
              loadCondition={hasNextPage && !isFetchingNextPage}
              loadFn={fetchNextPage}
            >
              {isFetchingNextPage && (
                <span className="i-hugeicons-loading-01 animate-spin text-2xl text-muted-foreground" />
              )}
            </InViewLoader>
          )}
        </>
      )}
    </div>
  );
}
