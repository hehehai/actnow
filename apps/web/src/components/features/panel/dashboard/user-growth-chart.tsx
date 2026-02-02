import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface UserGrowthChartProps {
  data: {
    thisWeek: Array<{ day: string; count: number }>;
    lastWeek: Array<{ day: string; count: number }>;
    lastThreeMonths: Array<{ month: string; count: number }>;
  };
}

const chartConfig = {
  thisWeek: {
    label: "This Week",
    color: "hsl(var(--chart-1))",
  },
  lastWeek: {
    label: "Last Week",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  const chartData = useMemo(
    () =>
      data.thisWeek.map((item, index) => ({
        day: item.day,
        thisWeek: item.count,
        lastWeek: data.lastWeek[index]?.count ?? 0,
      })),
    [data.thisWeek, data.lastWeek]
  );

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="i-hugeicons-chart-column size-5" />
          User Growth Trend
        </CardTitle>
        <h4 className="font-medium text-muted-foreground text-sm">
          Last 3 Months
        </h4>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_220px]">
          {/* Bar Chart */}
          <ChartContainer className="h-70 w-full" config={chartConfig}>
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="day"
                tickLine={false}
                tickMargin={10}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="thisWeek" fill="var(--color-thisWeek)" radius={4} />
              <Bar dataKey="lastWeek" fill="var(--color-lastWeek)" radius={4} />
            </BarChart>
          </ChartContainer>

          {/* Last 3 Months List */}
          <div className="flex w-full flex-col">
            <div className="flex flex-col gap-3">
              {data.lastThreeMonths.map((item) => (
                <div
                  className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                  key={item.month}
                >
                  <span className="font-medium text-sm">{item.month}</span>
                  <span className="font-semibold text-sm tabular-nums">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
