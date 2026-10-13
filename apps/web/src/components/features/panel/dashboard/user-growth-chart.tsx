import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface UserGrowthChartProps {
  data: {
    lastThreeMonths: Array<{ month: string; count: number }>;
  };
}

const chartConfig = {
  count: {
    label: "New users",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="i-hugeicons-chart-column size-5" />
          User Growth Trend
        </CardTitle>
        <h4 className="font-medium text-muted-foreground text-sm">Last 3 Months</h4>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-70 w-full" config={chartConfig}>
          <BarChart accessibilityLayer data={data.lastThreeMonths}>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="month"
              tickLine={false}
              tickMargin={10}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
