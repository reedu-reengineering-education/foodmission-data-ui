"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ZAxis,
  Tooltip,
  Cell,
} from "recharts";
import { AnalyticsFiltersBar } from "@/components/analytics-filters";
import { HorizontalBarChartCard } from "@/components/ui/horizontal-bar-chart-card";
import { analyticsApi } from "@/lib/analytics-api";
import { type FoodPopularity } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { NoDataCard } from "@/components/ui/no-data-card";
import { useAnalyticsFilters } from "@/hooks/use-analytics-filters";
import { PAGE_TITLES } from "@/lib/page-titles";

export function FoodPopularityContent() {
  const {
    periodStart,
    setPeriodStart,
    periodEnd,
    setPeriodEnd,
    typeOfMeal,
    setTypeOfMeal,
  } = useAnalyticsFilters();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FoodPopularity[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await analyticsApi.foodPopularity({
        periodStart: periodStart || undefined,
        periodEnd: periodEnd || undefined,
        typeOfMeal: typeOfMeal || undefined,
        limit: "30",
      });
      setData(result);
    } catch (e) {
      console.error("Failed to fetch food popularity", e);
    } finally {
      setLoading(false);
    }
  }, [periodStart, periodEnd, typeOfMeal]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Aggregate by foodName across dates
  const foodAgg: Record<
    string,
    {
      foodName: string;
      foodGroup: string;
      frequency: number;
      uniqueUsers: number;
      totalQuantity: number;
      quantityCount: number;
      predominantUnit: string;
    }
  > = {};
  for (const row of data) {
    const key = row.foodName;
    if (!foodAgg[key]) {
      foodAgg[key] = {
        foodName: row.foodName,
        foodGroup: row.foodGroup ?? "Other",
        frequency: 0,
        uniqueUsers: 0,
        totalQuantity: 0,
        quantityCount: 0,
        predominantUnit: row.predominantUnit ?? "",
      };
    }
    foodAgg[key].frequency += row.frequency;
    foodAgg[key].uniqueUsers = Math.max(
      foodAgg[key].uniqueUsers,
      row.uniqueUsers,
    );
    if (row.avgQuantity > 0) {
      foodAgg[key].totalQuantity += row.avgQuantity * row.frequency;
      foodAgg[key].quantityCount += row.frequency;
    }
  }

  const topFoods = Object.values(foodAgg)
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 20);

  // Average quantity data for top foods
  const quantityData = topFoods
    .filter((f) => f.quantityCount > 0)
    .map((f) => ({
      foodName: f.foodName,
      avgQuantity: Math.round((f.totalQuantity / f.quantityCount) * 10) / 10,
      unit: f.predominantUnit || "units",
    }))
    .slice(0, 15);

  // Scatter data: frequency vs unique users
  const scatterData = Object.values(foodAgg).map((f) => ({
    foodName: f.foodName,
    frequency: f.frequency,
    uniqueUsers: f.uniqueUsers,
  }));

  // KPI metrics
  const kpiUniqueFoods = Object.keys(foodAgg).length;
  const kpiTotalFrequency = data.reduce((s, d) => s + d.frequency, 0);
  const kpiFoodGroups = new Set(data.map((d) => d.foodGroup).filter(Boolean))
    .size;
  const kpiTopFood = topFoods[0]?.foodName ?? "—";

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {PAGE_TITLES.mealLog.foodPopularity}
        </h2>
        <p className="text-muted-foreground">
          Most consumed foods and food group distribution
        </p>
      </div>

      <AnalyticsFiltersBar
        periodStart={periodStart}
        periodEnd={periodEnd}
        typeOfMeal={typeOfMeal}
        onPeriodStartChange={setPeriodStart}
        onPeriodEndChange={setPeriodEnd}
        onTypeOfMealChange={setTypeOfMeal}
        onApply={fetchData}
      />

      {topFoods.length === 0 ? (
        <NoDataCard message="No published food popularity data available." />
      ) : (
        <>
          {/* KPIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Unique Foods Tracked</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpiUniqueFoods}</div>
                <p className="text-xs text-muted-foreground">
                  Distinct foods across all results
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Consumption Events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpiTotalFrequency.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all foods &amp; dates
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Food Groups</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpiFoodGroups}</div>
                <p className="text-xs text-muted-foreground">
                  Distinct food groups represented
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Top Consumed Food</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold truncate" title={kpiTopFood}>
                  {kpiTopFood}
                </div>
                <p className="text-xs text-muted-foreground">
                  Most frequently logged food item
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Foods Horizontal Bar */}
          <HorizontalBarChartCard
            title="Top 20 Most Consumed Foods"
            description="Ranked by total consumption frequency (≥5 unique users each)"
            config={{
              frequency: { label: "Frequency", color: "var(--chart-1)" },
            }}
            data={topFoods as unknown as Record<string, unknown>[]}
            bars={[{ dataKey: "frequency", fill: "var(--chart-1)" }]}
            yAxisKey="foodName"
            yAxisWidth={160}
            height="h-[600px]"
            footer="Only foods consumed by ≥5 unique users are shown"
          />

          {/* Average Quantity per Food */}
          {quantityData.length > 0 && (
            <HorizontalBarChartCard
              title="Average Quantity per Food"
              description="How much of each food is consumed on average per meal"
              config={{
                avgQuantity: { label: "Avg Quantity", color: "var(--chart-2)" },
              }}
              data={quantityData as unknown as Record<string, unknown>[]}
              bars={[{ dataKey: "avgQuantity", fill: "var(--chart-2)" }]}
              yAxisKey="foodName"
              yAxisWidth={160}
              height="h-[450px]"
              tooltipFormatter={(value, _name, item) =>
                `${value} ${(item.payload as Record<string, string>).unit}`
              }
              footer="Quantity shown in the predominant unit for each food"
            />
          )}

          {/* Frequency vs Unique Users Scatter */}
          <Card>
            <CardHeader>
              <CardTitle>Frequency vs. Reach</CardTitle>
              <CardDescription>
                Each dot is a food — high frequency + few users = niche
                favorites, wide reach = mainstream staples
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div style={{ minWidth: 400 }}>
                <ChartContainer
                  config={{
                    uniqueUsers: {
                      label: "Unique Users",
                      color: "var(--chart-4)",
                    },
                  }}
                  className="h-[350px] w-full aspect-auto"
                >
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="frequency"
                      type="number"
                      name="Frequency"
                      tick={{ fontSize: 11 }}
                      label={{
                        value: "Total Frequency",
                        position: "insideBottom",
                        offset: -5,
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      dataKey="uniqueUsers"
                      type="number"
                      name="Unique Users"
                      tick={{ fontSize: 11 }}
                      label={{
                        value: "Unique Users",
                        angle: -90,
                        position: "insideLeft",
                        fontSize: 12,
                      }}
                    />
                    <ZAxis range={[40, 40]} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload as {
                          foodName: string;
                          frequency: number;
                          uniqueUsers: number;
                        };
                        return (
                          <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
                            <p className="font-medium">{d.foodName}</p>
                            <p className="text-muted-foreground">
                              Frequency: {d.frequency}
                            </p>
                            <p className="text-muted-foreground">
                              Users: {d.uniqueUsers}
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Scatter data={scatterData} fill="var(--chart-4)">
                      {scatterData.map((entry) => (
                        <Cell
                          key={entry.foodName}
                          fill={
                            topFoods.some((f) => f.foodName === entry.foodName)
                              ? "var(--chart-1)"
                              : "var(--chart-4)"
                          }
                          fillOpacity={0.7}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ChartContainer>
              </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Top-20 foods highlighted in blue
            </CardFooter>
          </Card>

          {/* Unique Users per Food */}
          <HorizontalBarChartCard
            title="Unique Users per Top Food"
            description="Number of distinct users who consumed each food"
            config={{
              uniqueUsers: { label: "Unique Users", color: "var(--chart-3)" },
            }}
            data={topFoods.slice(0, 15) as unknown as Record<string, unknown>[]}
            bars={[{ dataKey: "uniqueUsers", fill: "var(--chart-3)" }]}
            yAxisKey="foodName"
            yAxisWidth={160}
            height="h-[400px]"
          />
        </>
      )}
    </div>
  );
}
