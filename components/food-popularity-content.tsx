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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ZAxis, Tooltip, Cell } from "recharts";
import { AnalyticsFiltersBar } from "@/components/analytics-filters";
import { HorizontalBarChartCard } from "@/components/ui/horizontal-bar-chart-card";
import { analyticsApi } from "@/lib/analytics-api";
import { type FoodPopularity } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { NoDataCard } from "@/components/ui/no-data-card";
import { useAnalyticsFilters } from "@/hooks/use-analytics-filters";

export function FoodPopularityContent() {
  const { periodStart, setPeriodStart, periodEnd, setPeriodEnd, typeOfMeal, setTypeOfMeal } = useAnalyticsFilters();
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

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Food Popularity</h2>
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
          {/* Top Foods Horizontal Bar */}
          <HorizontalBarChartCard
            title="Top 20 Most Consumed Foods"
            description="Ranked by total consumption frequency (≥5 unique users each)"
            config={{ frequency: { label: "Frequency", color: "var(--chart-1)" } }}
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
              config={{ avgQuantity: { label: "Avg Quantity", color: "var(--chart-2)" } }}
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
            <CardContent>
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
                          topFoods.some(
                            (f) => f.foodName === entry.foodName,
                          )
                            ? "var(--chart-1)"
                            : "var(--chart-4)"
                        }
                        fillOpacity={0.7}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Top-20 foods highlighted in blue
            </CardFooter>
          </Card>

          {/* Unique Users per Food */}
          <HorizontalBarChartCard
            title="Unique Users per Top Food"
            description="Number of distinct users who consumed each food"
            config={{ uniqueUsers: { label: "Unique Users", color: "var(--chart-3)" } }}
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
