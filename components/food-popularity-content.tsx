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
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ScatterChart, Scatter, ZAxis, Tooltip, Cell } from "recharts";
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

          {/* Average Quantity per Food */}
          {quantityData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Average Quantity per Food</CardTitle>
                <CardDescription>
                  How much of each food is consumed on average per meal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    avgQuantity: {
                      label: "Avg Quantity",
                      color: "var(--chart-2)",
                    },
                  }}
                  className="h-[450px] w-full aspect-auto"
                >
                  <BarChart data={quantityData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis
                      dataKey="foodName"
                      type="category"
                      width={160}
                      tick={{ fontSize: 11 }}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, _name, item) =>
                            `${value} ${(item.payload as Record<string, string>).unit}`
                          }
                        />
                      }
                    />
                    <Bar
                      dataKey="avgQuantity"
                      fill="var(--chart-2)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Quantity shown in the predominant unit for each food
              </CardFooter>
            </Card>
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
                  <ZAxis dataKey="foodName" name="Food" />
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
