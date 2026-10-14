import { site } from "@actnow/common";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { FeedSection } from "@/components/features/app/home/feed-section";
import { HeroSection } from "@/components/features/app/home/hero-section";
import { HomeSkeleton } from "@/components/features/app/home/home-skeleton";
import { orpc } from "@/lib/orpc";
import { createPageMeta } from "@/lib/seo";

const searchSchema = z.object({ q: z.string().optional() });
const homeMeta = createPageMeta({
  description: `${site.description} Latest published content.`,
  url: "/",
});

export const Route = createFileRoute("/(app)/")({
  component: HomeComponent,
  pendingComponent: HomeSkeleton,
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ search: search.q }),
  head: () => ({ meta: homeMeta.meta, links: homeMeta.links }),
  loader: async ({ context, deps }) => {
    await context.queryClient.prefetchInfiniteQuery(
      orpc.app.post.list.infiniteOptions({
        input: (cursor) => ({
          cursor,
          limit: 12,
          sort: "latest",
          search: deps.search,
        }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      })
    );
  },
});

function HomeComponent() {
  const { q } = Route.useSearch();
  return (
    <div className="flex flex-col">
      <HeroSection />
      <FeedSection search={q} />
    </div>
  );
}
