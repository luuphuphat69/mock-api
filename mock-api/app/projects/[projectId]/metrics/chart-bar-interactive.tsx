"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

// 1. Match the exact API shape you provided
type MonthlyItem = {
  date: string;           // "07-12-2025"
  totalRequests: number;
  totalSuccess: number;
  totalFailed: number;
};

// 2. Update config to have colors for Success and Failed
const chartConfig = {
  totalRequests: {
    label: "Total Requests",
    color: "hsl(var(--foreground))", // Neutral color
  },
  success: {
    label: "Success",
    color: "#22c55e", // Green-500
  },
  failed: {
    label: "Failed",
    color: "#ef4444", // Red-500
  },
} satisfies ChartConfig;

export function ChartBarInteractive({
  monthlyData = [],
}: {
  monthlyData: MonthlyItem[];
}) {
  // ---- Normalize API data into a lookup map ----
  const map = React.useMemo(() => {
    // Map keys will be "YYYY-MM-DD"
    const m = new Map<string, { success: number; failed: number }>();

    monthlyData?.forEach((item) => {
      // Parse "07-12-2025" (DD-MM-YYYY)
      const [day, month, year] = item.date.split("-");
      // Create standard "2025-12-07" key
      const isoKey = `${year}-${month}-${day}`;

      m.set(isoKey, {
        success: item.totalSuccess,
        failed: item.totalFailed,
      });
    });
    return m;
  }, [monthlyData]);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // ---- Build the continuous timeline for the month ----
  const filledChartData = React.useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const arr = [];

    for (let day = 1; day <= daysInMonth; day++) {
      // Generate "YYYY-MM-DD" to match the map keys
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      const data = map.get(dateStr);

      arr.push({
        date: dateStr,
        success: data?.success ?? 0,
        failed: data?.failed ?? 0,
      });
    }
    return arr;
  }, [map, currentYear, currentMonth]);

  const totalRequests = React.useMemo(() => {
    return filledChartData.reduce((acc, cur) => acc + cur.success + cur.failed, 0);
  }, [filledChartData]);

  return (
    <Card className="py-0 mt-10">
      <CardHeader className="border-b !p-0 flex flex-col sm:flex-row">
        <div className="flex-1 px-6 pt-4 pb-3 sm:py-4">
          <CardTitle>Daily Requests</CardTitle>
          <CardDescription>
            Showing request volume for {now.toLocaleString('default', { month: 'long' })} {currentYear}
          </CardDescription>
        </div>

        <div className="px-6 py-4 sm:px-8 sm:py-6 border-t sm:border-l sm:border-t-0">
          <span className="text-muted-foreground text-xs block">Total</span>
          <span className="text-2xl sm:text-3xl font-bold">
            {totalRequests.toLocaleString()}
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <BarChart
            accessibilityLayer
            data={filledChartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={2}
              tickFormatter={(value: string) => {
                const d = new Date(value);
                return `${d.getDate()}`;
              }}
            />

            {/* Custom Tooltip that shows Success vs Failed */}
            <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />

            {/* Add Legend to explain colors */}
            <ChartLegend content={<ChartLegendContent />} />

            {/* STACKED BARS: Use stackId="a" on both to stack them */}
            <Bar
              dataKey="success"
              stackId="a"
              fill="var(--color-success)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="failed"
              stackId="a"
              fill="var(--color-failed)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}