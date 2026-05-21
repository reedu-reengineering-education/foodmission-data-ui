"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
  BarChart,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { NoDataCard } from "@/components/ui/no-data-card";
import { AnalyticsFiltersBar } from "@/components/analytics-filters";
import { shoppingListApi } from "@/lib/analytics-api";
import { type SlListPatterns } from "@/lib/types";
import { useShoppingListFilters } from "@/hooks/use-analytics-filters";

export function ShoppingListListPatternsContent() {
  const { periodStart, setPeriodStart, periodEnd, setPeriodEnd } =
    useShoppingListFilters();

  const [loading, setLoading] = useState(true);
  const [patterns, setPatterns] = useState<SlListPatterns[]>([]);

  const filters = useMemo(
    () => ({
      periodStart: periodStart || undefined,
      periodEnd: periodEnd || undefined,
    }),
    [periodStart, periodEnd]
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const p = await shoppingListApi.listPatterns(filters);
      setPatterns(p);
    } catch (e) {
      console.error("Failed to fetch list patterns", e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const patternsTrend = [...patterns]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => ({
      date: r.date.slice(0, 10),
      avgItemsPerList: Math.round((r.avgItemsPerList ?? 0) * 10) / 10,
      avgListsPerUser: Math.round((r.avgListsPerUser ?? 0) * 100) / 100,
      foodProductPct: Math.round((r.foodProductPct ?? 0) * 10) / 10,
      genericFoodPct: Math.round((r.genericFoodPct ?? 0) * 10) / 10,
      totalLists: r.totalLists,
    }));

  const totalLists = patterns.reduce((s, r) => s + r.totalLists, 0);
  const latestAvgItems = patternsTrend.at(-1)?.avgItemsPerList ?? null;
  const latestAvgListsPerUser = patternsTrend.at(-1)?.avgListsPerUser ?? null;
  const latestFoodProductPct = patternsTrend.at(-1)?.foodProductPct ?? null;

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">List Patterns</h2>
        <p className="text-muted-foreground">
          How shopping lists are built and completed over time
        </p>
      </div>

      <AnalyticsFiltersBar
        periodStart={periodStart}
        periodEnd={periodEnd}
        onPeriodStartChange={setPeriodStart}
        onPeriodEndChange={setPeriodEnd}
        onApply={fetchData}
        showTypeOfMeal={false}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Shopping Lists</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLists.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all recorded periods</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Items / List</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestAvgItems !== null ? latestAvgItems : "—"}
            </div>
            <p className="text-xs text-muted-foreground">Latest period average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Lists / User</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestAvgListsPerUser !== null ? latestAvgListsPerUser : "—"}
            </div>
            <p className="text-xs text-muted-foreground">Latest period average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Branded Items %</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestFoodProductPct !== null ? `${latestFoodProductPct}%` : "—"}
            </div>
            <p className="text-xs text-muted-foreground">Food products vs generic</p>
          </CardContent>
        </Card>
      </div>

      {patternsTrend.length === 0 ? (
        <NoDataCard message="No published list patterns data available." />
      ) : (
        <>
        <Card>
          <CardHeader>
            <CardTitle>List Patterns Over Time</CardTitle>
            <CardDescription>
              Avg items per list and avg lists per user trend
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div style={{ minWidth: 400 }}>
              <ChartContainer
                config={{
                  avgItemsPerList: {
                    label: "Avg Items / List",
                    color: "var(--chart-1)",
                  },
                  avgListsPerUser: {
                    label: "Avg Lists / User",
                    color: "var(--chart-2)",
                  },
                }}
                className="h-[350px] w-full aspect-auto"
              >
                <ComposedChart data={patternsTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    yAxisId="items"
                    tick={{ fontSize: 11 }}
                    label={{
                      value: "Items",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <YAxis
                    yAxisId="rate"
                    orientation="right"
                    tick={{ fontSize: 11 }}
                    label={{ value: "%", angle: 90, position: "insideRight" }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area
                    yAxisId="items"
                    type="monotone"
                    dataKey="avgItemsPerList"
                    stroke="var(--chart-1)"
                    fill="var(--chart-1)"
                    fillOpacity={0.2}
                  />
                  <Line
                    yAxisId="rate"
                    type="monotone"
                    dataKey="avgListsPerUser"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ChartContainer>
            </div>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            {patternsTrend.length} data points · {totalLists.toLocaleString()} total
            lists
          </CardFooter>
        </Card>

        {/* Item type breakdown over time */}
        {patternsTrend.some((r) => r.foodProductPct > 0 || r.genericFoodPct > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Item Type Mix Over Time</CardTitle>
              <CardDescription>
                Branded food products vs generic foods (% of items)
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div style={{ minWidth: 400 }}>
                <ChartContainer
                  config={{
                    foodProductPct: { label: "Branded %", color: "var(--chart-3)" },
                    genericFoodPct: { label: "Generic %", color: "var(--chart-4)" },
                  }}
                  className="h-[280px] w-full aspect-auto"
                >
                  <BarChart data={patternsTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} unit="%" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="foodProductPct" fill="var(--chart-3)" stackId="a" />
                    <Bar dataKey="genericFoodPct" fill="var(--chart-4)" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        )}
        </>
      )}
    </div>
  );
}
