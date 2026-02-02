import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { LikeLeaderboard } from "@/components/features/panel/dashboard/like-leaderboard";
import { StatCards } from "@/components/features/panel/dashboard/stat-cards";
import { UserGrowthChart } from "@/components/features/panel/dashboard/user-growth-chart";
import { NavMainHeader } from "@/components/features/panel/layout/nav-main-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";
import { createPageMeta } from "@/lib/seo";

const dashboardMeta = createPageMeta({
  title: "Admin Dashboard",
  description: "Refto admin dashboard.",
  url: "/panel",
  noIndex: true,
});

export const Route = createFileRoute("/(admin)/panel/")({
  component: RouteComponent,
  head: () => ({
    meta: dashboardMeta.meta,
    links: dashboardMeta.links,
  }),
});

function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="size-4" />
              <Skeleton className="h-4 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-9 w-24" />
            <div className="mt-1 flex items-center gap-1.5">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function UserGrowthChartSkeleton() {
  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="size-5" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_220px]">
          <Skeleton className="h-70 w-full" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton className="h-10 w-full" key={i} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RouteComponent() {
  const { data: dashboardStats, isLoading: statsLoading } = useQuery(
    orpc.panel.stat.getDashboardStats.queryOptions()
  );

  const { data: userGrowthData, isLoading: growthLoading } = useQuery(
    orpc.panel.stat.getUserGrowthChart.queryOptions()
  );

  return (
    <div className="w-full">
      <NavMainHeader left={<h2 className="font-semibold">Dashboard</h2>} />
      <div className="space-y-6 p-6">
        {/* Stat Cards */}
        {statsLoading || !dashboardStats ? (
          <StatCardsSkeleton />
        ) : (
          <StatCards data={dashboardStats} />
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* User Growth Chart (2/3 width) */}
          {growthLoading || !userGrowthData ? (
            <UserGrowthChartSkeleton />
          ) : (
            <UserGrowthChart data={userGrowthData} />
          )}

          {/* Like Leaderboard (1/3 width) */}
          <LikeLeaderboard />
        </div>
      </div>
    </div>
  );
}
