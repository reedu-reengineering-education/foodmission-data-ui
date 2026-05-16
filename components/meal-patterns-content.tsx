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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts";
import { AnalyticsFiltersBar } from "@/components/analytics-filters";
import { analyticsApi } from "@/lib/analytics-api";
import { type MealPatterns } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { NoDataCard } from "@/components/ui/no-data-card";
import { useAnalyticsFilters } from "@/hooks/use-analytics-filters";

export function MealPatternsContent() {
  const { periodStart, setPeriodStart, periodEnd, setPeriodEnd, typeOfMeal, setTypeOfMeal } = useAnalyticsFilters();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MealPatterns[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await analyticsApi.mealPatterns({
        periodStart: periodStart || undefined,
        periodEnd: periodEnd || undefined,
        typeOfMeal: typeOfMeal || undefined,
      });
      setData(result);
    } catch (e) {
      console.error("Failed to fetch meal patterns", e);
    } finally {
      setLoading(false);
    }
  }, [periodStart, periodEnd, typeOfMeal]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- derived ---

  // Trend by date
  const trendMap: Record<
    string,
    {
      pantryPct: number;
      eatenOutPct: number;
      avgItems: number;
      meals: number;
      count: number;
    }
  > = {};
  for (const row of data) {
    const d = row.date.slice(0, 10);
    if (!trendMap[d])
      trendMap[d] = {
        pantryPct: 0,
        eatenOutPct: 0,
        avgItems: 0,
        meals: 0,
        count: 0,
      };
    const b = trendMap[d];
    b.pantryPct += row.mealsFromPantryPct * row.totalMeals;
    b.eatenOutPct += row.mealsEatenOutPct * row.totalMeals;
    b.avgItems += row.avgItemsPerMeal * row.totalMeals;
    b.meals += row.totalMeals;
    b.count++;
  }
  const trendData = Object.entries(trendMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      date,
      pantryPct: Math.round((v.pantryPct / (v.meals || 1)) * 10) / 10,
      eatenOutPct: Math.round((v.eatenOutPct / (v.meals || 1)) * 10) / 10,
      avgItemsPerMeal:
        Math.round((v.avgItems / (v.meals || 1)) * 10) / 10,
      totalMeals: v.meals,
    }));

  // By meal type
  const byMealType: Record<
    string,
    { pantry: number; eatenOut: number; items: number; meals: number }
  > = {};
  for (const row of data) {
    if (!byMealType[row.typeOfMeal])
      byMealType[row.typeOfMeal] = { pantry: 0, eatenOut: 0, items: 0, meals: 0 };
    const b = byMealType[row.typeOfMeal];
    b.pantry += row.mealsFromPantryPct * row.totalMeals;
    b.eatenOut += row.mealsEatenOutPct * row.totalMeals;
    b.items += row.avgItemsPerMeal * row.totalMeals;
    b.meals += row.totalMeals;
  }
  const mealTypeData = Object.entries(byMealType).map(([meal, v]) => ({
    meal: meal.charAt(0) + meal.slice(1).toLowerCase().replace("_", " "),
    pantryPct: Math.round((v.pantry / (v.meals || 1)) * 10) / 10,
    eatenOutPct: Math.round((v.eatenOut / (v.meals || 1)) * 10) / 10,
    avgItemsPerMeal: Math.round((v.items / (v.meals || 1)) * 10) / 10,
  }));

  // Total meals over time (daily)
  const totalMealsTrend = Object.entries(trendMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, totalMeals: v.meals }));

  // Meal volume by type over time (stacked area)
  const mealTypesByDate: Record<string, Record<string, number>> = {};
  const allMealTypes = new Set<string>();
  for (const row of data) {
    const d = row.date.slice(0, 10);
    if (!mealTypesByDate[d]) mealTypesByDate[d] = {};
    const label =
      row.typeOfMeal.charAt(0) +
      row.typeOfMeal.slice(1).toLowerCase().replace("_", " ");
    allMealTypes.add(label);
    mealTypesByDate[d][label] =
      (mealTypesByDate[d][label] ?? 0) + row.totalMeals;
  }
  const mealVolumeByType = Object.entries(mealTypesByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, types]) => ({ date, ...types }));
  const mealTypeKeys = Array.from(allMealTypes).sort();

  // Meal complexity by meal type (avg items per meal)
  const complexityData = Object.entries(byMealType).map(([meal, v]) => ({
    meal: meal.charAt(0) + meal.slice(1).toLowerCase().replace("_", " "),
    avgItemsPerMeal: Math.round((v.items / (v.meals || 1)) * 10) / 10,
  }));

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Meal Patterns</h2>
        <p className="text-muted-foreground">
          Pantry usage, eating out rates, meal volume &amp; complexity
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

      {data.length === 0 ? (
        <NoDataCard message="No published meal pattern data available." />
      ) : (
        <>
          {/* Pantry & Eaten-Out Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Pantry Usage &amp; Eating Out Trends</CardTitle>
              <CardDescription>
                Percentage of meals from pantry vs eaten out over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  pantryPct: {
                    label: "From Pantry %",
                    color: "var(--chart-1)",
                  },
                  eatenOutPct: {
                    label: "Eaten Out %",
                    color: "var(--chart-3)",
                  },
                }}
                className="h-[350px]"
              >
                <ComposedChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    label={{
                      value: "%",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area
                    type="monotone"
                    dataKey="pantryPct"
                    stroke="var(--chart-1)"
                    fill="var(--chart-1)"
                    fillOpacity={0.3}
                  />
                  <Line
                    type="monotone"
                    dataKey="eatenOutPct"
                    stroke="var(--chart-3)"
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              {trendData.length} days · {data.reduce((s, d) => s + d.totalMeals, 0)} total meals
            </CardFooter>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Items per Meal Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Average Items per Meal</CardTitle>
                <CardDescription>
                  Number of food items per meal over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    avgItemsPerMeal: {
                      label: "Items/Meal",
                      color: "var(--chart-4)",
                    },
                  }}
                  className="h-[350px]"
                >
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="avgItemsPerMeal"
                      stroke="var(--chart-4)"
                      fill="var(--chart-4)"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* By Meal Type */}
            <Card>
              <CardHeader>
                <CardTitle>Patterns by Meal Type</CardTitle>
                <CardDescription>
                  Pantry % and eating out % by meal type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    pantryPct: {
                      label: "Pantry %",
                      color: "var(--chart-1)",
                    },
                    eatenOutPct: {
                      label: "Eaten Out %",
                      color: "var(--chart-3)",
                    },
                  }}
                  className="h-[350px]"
                >
                  <BarChart data={mealTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="meal" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="pantryPct"
                      fill="var(--chart-1)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="eatenOutPct"
                      fill="var(--chart-3)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Total Meals Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Total Meals Over Time</CardTitle>
              <CardDescription>
                Daily meal logging volume — spot weekday/weekend patterns and
                growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  totalMeals: {
                    label: "Total Meals",
                    color: "var(--chart-5)",
                  },
                }}
                className="h-[300px] w-full aspect-auto"
              >
                <AreaChart data={totalMealsTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="totalMeals"
                    stroke="var(--chart-5)"
                    fill="var(--chart-5)"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Meal Volume by Type (stacked area) */}
            {mealVolumeByType.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Meal Volume by Type</CardTitle>
                  <CardDescription>
                    How total meals break down across meal types over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={Object.fromEntries(
                      mealTypeKeys.map((mt, i) => [
                        mt,
                        {
                          label: mt,
                          color: `var(--chart-${(i % 5) + 1})`,
                        },
                      ]),
                    )}
                    className="h-[350px] w-full aspect-auto"
                  >
                    <AreaChart data={mealVolumeByType}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis tick={{ fontSize: 11 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      {mealTypeKeys.map((mt, i) => (
                        <Area
                          key={mt}
                          type="monotone"
                          dataKey={mt}
                          stackId="1"
                          stroke={`var(--chart-${(i % 5) + 1})`}
                          fill={`var(--chart-${(i % 5) + 1})`}
                          fillOpacity={0.4}
                        />
                      ))}
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Meal Complexity by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Meal Complexity by Type</CardTitle>
                <CardDescription>
                  Average number of food items per meal — are dinners more
                  complex than snacks?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    avgItemsPerMeal: {
                      label: "Avg Items/Meal",
                      color: "var(--chart-2)",
                    },
                  }}
                  className="h-[350px] w-full aspect-auto"
                >
                  <BarChart data={complexityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="meal" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="avgItemsPerMeal"
                      fill="var(--chart-2)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
