import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { WeeklySection } from "@/components/features/app/weekly/weekly-section";
import { orpc } from "@/lib/orpc";
import { createPageMeta } from "@/lib/seo";

const weeklyMeta = createPageMeta({
  title: "Weekly Top",
  description:
    "Check the most liked posts this week and discover categories everyone talks about.",
  url: "/weekly",
});

export const Route = createFileRoute("/(app)/weekly")({
  component: WeeklyPage,
  head: () => ({
    meta: weeklyMeta.meta,
    links: weeklyMeta.links,
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      orpc.app.post.trending.queryOptions({
        input: { postsLimit: 6, tagsLimit: 12 },
      })
    );
  },
});

function WeeklyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-10">
        <h1 className="mb-2 text-balance font-bold text-3xl">
          Weekly Highlights
        </h1>
        <p className="text-pretty text-muted-foreground">
          See what the community is shipping and the tags gaining momentum.
        </p>
      </header>

      <Suspense fallback={<WeeklyLoadingSkeleton />}>
        <WeeklySection />
      </Suspense>
    </div>
  );
}

function WeeklyLoadingSkeleton() {
  return (
    <div className="space-y-16">
      {[0, 1, 2].map((weekIdx) => (
        <section key={weekIdx}>
          {/* Week header skeleton */}
          <div className="mb-6">
            <div className="h-6 w-40 animate-pulse rounded bg-muted" />
          </div>
          {/* Grid skeleton */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div className="overflow-hidden rounded-2xl bg-card" key={i}>
                <div className="bg-muted p-3">
                  <div className="aspect-video animate-pulse rounded-[10px] bg-muted-foreground/10" />
                </div>
                <div className="flex items-center gap-2 bg-muted px-3 pb-1.5">
                  <div className="size-5.5 animate-pulse rounded bg-muted-foreground/10" />
                  <div className="h-4 w-24 animate-pulse rounded bg-muted-foreground/10" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
