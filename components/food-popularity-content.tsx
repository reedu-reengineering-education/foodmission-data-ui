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
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { AnalyticsFiltersBar } from "@/components/analytics-filters";
import { analyticsApi, type FoodPopularity } from "@/lib/analytics-api";
import { Skeleton } from "@/components/ui/skeleton";

export function FoodPopularityContent() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [typeOfMeal, setTypeOfMeal] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FoodPopularity[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await analyticsApi.foodPopularity({
        from: from || undefined,
        to: to || undefined,
        typeOfMeal: typeOfMeal || undefined,
        limit: "30",
      });
      setData(result);
    } catch (e) {
      console.error("Failed to fetch food popularity", e);
    } finally {
      setLoading(false);
    }
  }, [from, to, typeOfMeal]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Aggregate by foodName across dates
  const foodAgg: Record<
    string,
    { foodName: string; foodGroup: string; frequency: number; uniqueUsers: number }
  > = {};
  for (const row of data) {
    const key = row.foodName;
    if (!foodAgg[key]) {
      foodAgg[key] = {
        foodName: row.foodName,
        foodGroup: row.foodGroup ?? "Other",
        frequency: 0,
        uniqueUsers: 0,
      };
    }
    foodAgg[key].frequency += row.frequency;
    foodAgg[key].uniqueUsers = Math.max(
      foodAgg[key].uniqueUsers,
      row.uniqueUsers,
    );
  }

  const topFoods = Object.values(foodAgg)
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 20);

  // Group by food group
  const groupAgg: Record<string, number> = {};
  for (const row of data) {
    const g = row.foodGroup ?? "Other";
    groupAgg[g] = (groupAgg[g] ?? 0) + row.frequency;
  }
  const foodGroupData = Object.entries(groupAgg)
    .map(([group, freq]) => ({ group, frequency: freq }))
    .sort((a, b) => b.frequency - a.frequency);

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
        from={from}
        to={to}
        typeOfMeal={typeOfMeal}
        onFromChange={setFrom}
        onToChange={setTo}
        onTypeOfMealChange={setTypeOfMeal}
        onApply={fetchData}
      />

      {topFoods.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-muted-foreground">
              No published food popularity data available.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Top Foods Horizontal Bar */}
          <Card>
            <CardHeader>
              <CardTitle>Top 20 Most Consumed Foods</CardTitle>
              <CardDescription>
                Ranked by total consumption frequency (≥5 unique users each)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  frequency: {
                    label: "Frequency",
                    color: "var(--chart-1)",
                  },
                }}
                className="h-[600px]"
              >
                <BarChart data={topFoods} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    dataKey="foodName"
                    type="category"
                    width={160}
                    tick={{ fontSize: 11 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="frequency"
                    fill="var(--chart-1)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Only foods consumed by ≥5 unique users are shown
            </CardFooter>
          </Card>

          {/* Food Group Distribution */}
          {foodGroupData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Food Group Distribution</CardTitle>
                <CardDescription>
                  Total consumption frequency by food group
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    frequency: {
                      label: "Frequency",
                      color: "var(--chart-2)",
                    },
                  }}
                  className="h-[350px]"
                >
                  <BarChart data={foodGroupData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="group"
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="frequency"
                      fill="var(--chart-2)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Unique Users per Food */}
          <Card>
            <CardHeader>
              <CardTitle>Unique Users per Top Food</CardTitle>
              <CardDescription>
                Number of distinct users who consumed each food
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  uniqueUsers: {
                    label: "Unique Users",
                    color: "var(--chart-3)",
                  },
                }}
                className="h-[400px]"
              >
                <BarChart data={topFoods.slice(0, 15)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    dataKey="foodName"
                    type="category"
                    width={160}
                    tick={{ fontSize: 11 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="uniqueUsers"
                    fill="var(--chart-3)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
