import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  icon: string;
  value: number;
  currentMonth: number;
  changePercent: number;
}

function StatCard({
  title,
  icon,
  value,
  currentMonth,
  changePercent,
}: StatCardProps) {
  const isPositive = changePercent >= 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
          <span className={cn(icon, "size-4")} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-semibold text-3xl tabular-nums">
          {value.toLocaleString()}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-sm">
          <span
            className={cn(
              "font-medium",
              isPositive ? "text-green-600" : "text-red-600"
            )}
          >
            {isPositive ? "+" : ""}
            {changePercent}%({currentMonth})
          </span>
          <span className="text-muted-foreground">vs Last Month</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatCardsProps {
  data: {
    posts: {
      total: number;
      currentMonth: number;
      previousMonth: number;
      changePercent: number;
      public?: number;
    };
    likes: {
      total: number;
      currentMonth: number;
      previousMonth: number;
      changePercent: number;
    };
    users: {
      total: number;
      currentMonth: number;
      previousMonth: number;
      changePercent: number;
    };
  };
}

export function StatCards({ data }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        changePercent={data.posts.changePercent}
        currentMonth={data.posts.currentMonth}
        icon="i-hugeicons-task-daily-02"
        title="Total Posts"
        value={data.posts.total}
      />
      <StatCard
        changePercent={data.likes.changePercent}
        currentMonth={data.likes.currentMonth}
        icon="i-hugeicons-favourite"
        title="Total Likes"
        value={data.likes.total}
      />
      <StatCard
        changePercent={data.users.changePercent}
        currentMonth={data.users.currentMonth}
        icon="i-hugeicons-user-group"
        title="Total Users"
        value={data.users.total}
      />
    </div>
  );
}
