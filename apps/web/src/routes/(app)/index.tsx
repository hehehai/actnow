import { PostFeedSort, site } from "@actnow/common";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { FeedSection } from "@/components/features/app/home/feed-section";
import { HeroSection } from "@/components/features/app/home/hero-section";
import { HomeSkeleton } from "@/components/features/app/home/home-skeleton";
import { orpc } from "@/lib/orpc";
import { createPageMeta } from "@/lib/seo";

const searchSchema = z.object({
  sort: z
    .enum([PostFeedSort.LATEST, PostFeedSort.POPULAR])
    .optional()
    .default(PostFeedSort.LATEST),
  tag: z.string().optional(), // comma separated tag slugs
});

const homeMeta = createPageMeta({
  description: `${site.description} Discover curated website designs.`,
  url: "/",
});

export const Route = createFileRoute("/(app)/")({
  component: HomeComponent,
  pendingComponent: HomeSkeleton,
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    sort: search.sort,
    tagSlugs: search.tag?.split(",").filter(Boolean),
  }),
  head: () => ({
    meta: homeMeta.meta,
    links: homeMeta.links,
  }),
  loader: async ({ context, deps }) => {
    const { sort, tagSlugs } = deps;
    await context.queryClient.prefetchInfiniteQuery(
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
      })
    );
  },
});

function HomeComponent() {
  const { sort, tag } = Route.useSearch();
  const tagSlugs = tag?.split(",").filter(Boolean);

  return (
    <div className="flex flex-col">
      <HeroSection currentTagSlugs={tagSlugs} sort={sort} />

      <FeedSection sort={sort} tagSlugs={tagSlugs} />
    </div>
  );
}
