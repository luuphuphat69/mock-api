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

type MonthlyItem = {
  date: string;
  totalRequests: number;
  totalSuccess: number;
  totalFailed: number;
};

const chartConfig = {
  totalRequests: {
    label: "Total Requests",
    color: "oklch(20% 0.02 250)", 
  },
  success: {
    label: "Success",
    color: "oklch(60% 0.15 150)", // Professional Green
  },
  failed: {
    label: "Failed",
    color: "oklch(60% 0.15 25)",  // Professional Red
  },
} satisfies ChartConfig;

export function ChartBarInteractive({
  monthlyData = [],
}: {
  monthlyData: MonthlyItem[];
}) {
  const map = React.useMemo(() => {
    const m = new Map<string, { success: number; failed: number }>();

    monthlyData?.forEach((item) => {
      const [day, month, year] = item.date.split("-");
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

  const filledChartData = React.useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const arr = [];

    for (let day = 1; day <= daysInMonth; day++) {
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
    <Card className="bg-white border-border shadow-none rounded-xl overflow-hidden mt-10">
      <CardHeader className="border-b border-border/50 bg-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
            Daily Requests
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            Activity for {now.toLocaleString('default', { month: 'long' })} {currentYear}
          </CardDescription>
        </div>

        <div className="flex flex-col sm:items-end">
          <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground mb-1">
            Total Requests
          </span>
          <span className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
            {totalRequests.toLocaleString()}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={filledChartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="oklch(90% 0.01 250)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              minTickGap={20}
              className="text-[11px] font-medium text-muted-foreground"
              tickFormatter={(value: string) => {
                const d = new Date(value);
                return `${d.getDate()}`;
              }}
            />

            <ChartTooltip 
              cursor={{ fill: 'oklch(97% 0.01 250)' }}
              content={<ChartTooltipContent indicator="dot" className="bg-white border-border shadow-xl rounded-lg p-3" />} 
            />
            
            <ChartLegend 
              content={<ChartLegendContent />} 
              className="mt-6 flex justify-center gap-6"
            />

            <Bar
              dataKey="success"
              stackId="a"
              fill="var(--color-success)"
              radius={[0, 0, 2, 2]}
              barSize={12}
            />
            <Bar
              dataKey="failed"
              stackId="a"
              fill="var(--color-failed)"
              radius={[2, 2, 0, 0]}
              barSize={12}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}