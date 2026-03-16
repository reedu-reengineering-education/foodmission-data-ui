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
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { AnalyticsFiltersBar } from "@/components/analytics-filters";
import {
  analyticsApi,
  type DailyNutrition,
  type DemographicNutrition,
  DIMENSION_LABELS,
} from "@/lib/analytics-api";
import { Skeleton } from "@/components/ui/skeleton";

export function NutritionAnalyticsContent() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [typeOfMeal, setTypeOfMeal] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DailyNutrition[]>([]);
  const [demoData, setDemoData] = useState<DemographicNutrition[]>([]);
  const [demoDimension, setDemoDimension] = useState("ageGroup");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        from: from || undefined,
        to: to || undefined,
        typeOfMeal: typeOfMeal || undefined,
      };
      const [nutrition, demographic] = await Promise.all([
        analyticsApi.nutrition(filters),
        analyticsApi.demographicNutrition({
          ...filters,
          dimension: demoDimension || undefined,
        }),
      ]);
      setData(nutrition);
      setDemoData(demographic);
    } catch (e) {
      console.error("Failed to fetch nutrition analytics", e);
    } finally {
      setLoading(false);
    }
  }, [from, to, typeOfMeal, demoDimension]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- derived chart data ---

  // Group by date for trend line
  const trendData = data
    .reduce<
      {
        date: string;
        avgCalories: number;
        avgProteins: number;
        avgFat: number;
        avgCarbs: number;
        mealCount: number;
      }[]
    >((acc, row) => {
      const dateStr = row.date.slice(0, 10);
      let bucket = acc.find((b) => b.date === dateStr);
      if (!bucket) {
        bucket = {
          date: dateStr,
          avgCalories: 0,
          avgProteins: 0,
          avgFat: 0,
          avgCarbs: 0,
          mealCount: 0,
        };
        acc.push(bucket);
      }
      // weighted avg by mealCount
      const total = bucket.mealCount + row.mealCount;
      bucket.avgCalories =
        (bucket.avgCalories * bucket.mealCount +
          (row.avgCalories ?? 0) * row.mealCount) /
        total;
      bucket.avgProteins =
        (bucket.avgProteins * bucket.mealCount +
          (row.avgProteins ?? 0) * row.mealCount) /
        total;
      bucket.avgFat =
        (bucket.avgFat * bucket.mealCount +
          (row.avgFat ?? 0) * row.mealCount) /
        total;
      bucket.avgCarbs =
        (bucket.avgCarbs * bucket.mealCount +
          (row.avgCarbs ?? 0) * row.mealCount) /
        total;
      bucket.mealCount = total;
      return acc;
    }, [])
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({
      ...d,
      avgCalories: Math.round(d.avgCalories),
      avgProteins: Math.round(d.avgProteins * 10) / 10,
      avgFat: Math.round(d.avgFat * 10) / 10,
      avgCarbs: Math.round(d.avgCarbs * 10) / 10,
    }));

  // Group by typeOfMeal for breakdown bar
  const mealTypeTotals: Record<
    string,
    { calories: number; proteins: number; fat: number; carbs: number; count: number }
  > = {};
  for (const row of data) {
    if (!mealTypeTotals[row.typeOfMeal]) {
      mealTypeTotals[row.typeOfMeal] = {
        calories: 0,
        proteins: 0,
        fat: 0,
        carbs: 0,
        count: 0,
      };
    }
    const b = mealTypeTotals[row.typeOfMeal];
    b.calories += (row.avgCalories ?? 0) * row.mealCount;
    b.proteins += (row.avgProteins ?? 0) * row.mealCount;
    b.fat += (row.avgFat ?? 0) * row.mealCount;
    b.carbs += (row.avgCarbs ?? 0) * row.mealCount;
    b.count += row.mealCount;
  }

  const mealTypeData = Object.entries(mealTypeTotals).map(([meal, v]) => ({
    meal:
      meal.charAt(0) + meal.slice(1).toLowerCase().replace("_", " "),
    avgCalories: Math.round(v.calories / (v.count || 1)),
    avgProteins: Math.round((v.proteins / (v.count || 1)) * 10) / 10,
    avgFat: Math.round((v.fat / (v.count || 1)) * 10) / 10,
    avgCarbs: Math.round((v.carbs / (v.count || 1)) * 10) / 10,
  }));

  // Demographic breakdown
  const dimKey = demoDimension as keyof DemographicNutrition;
  const demoGrouped = demoData.reduce<
    Record<string, { calories: number; proteins: number; fat: number; carbs: number; count: number }>
  >((acc, row) => {
    const val = (row[dimKey] as string) ?? "Unknown";
    if (!acc[val])
      acc[val] = { calories: 0, proteins: 0, fat: 0, carbs: 0, count: 0 };
    acc[val].calories += (row.avgCalories ?? 0) * row.mealCount;
    acc[val].proteins += (row.avgProteins ?? 0) * row.mealCount;
    acc[val].fat += (row.avgFat ?? 0) * row.mealCount;
    acc[val].carbs += (row.avgCarbs ?? 0) * row.mealCount;
    acc[val].count += row.mealCount;
    return acc;
  }, {});

  const demoChartData = Object.entries(demoGrouped).map(([label, vals]) => ({
    label: label === "__null__" ? "Not specified" : label,
    avgCalories: Math.round(vals.calories / (vals.count || 1)),
    avgProteins: Math.round((vals.proteins / (vals.count || 1)) * 10) / 10,
    avgFat: Math.round((vals.fat / (vals.count || 1)) * 10) / 10,
    avgCarbs: Math.round((vals.carbs / (vals.count || 1)) * 10) / 10,
  }));

  // Percentile data (latest data points)
  const percentileData = data
    .filter(
      (d) =>
        d.p25Calories !== null &&
        d.p50Calories !== null &&
        d.p75Calories !== null,
    )
    .slice(-30)
    .map((d) => ({
      date: d.date.slice(0, 10),
      meal: d.typeOfMeal,
      p25: Math.round(d.p25Calories ?? 0),
      p50: Math.round(d.p50Calories ?? 0),
      p75: Math.round(d.p75Calories ?? 0),
    }));

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[400px] w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[350px]" />
          <Skeleton className="h-[350px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Nutrition Analytics
          </h2>
          <p className="text-muted-foreground">
            Daily nutrition averages, macro breakdowns &amp; demographic
            comparisons
          </p>
        </div>
      </div>

      <AnalyticsFiltersBar
        from={from}
        to={to}
        typeOfMeal={typeOfMeal}
        onFromChange={setFrom}
        onToChange={setTo}
        onTypeOfMealChange={setTypeOfMeal}
        onApply={fetchData}
        showDimension
        dimension={demoDimension}
        onDimensionChange={setDemoDimension}
      />

      {data.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-muted-foreground">
              No published nutrition data available for the selected filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Calorie Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Average Calorie Trend</CardTitle>
              <CardDescription>
                Weighted average calories per meal across all users over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  avgCalories: {
                    label: "Avg Calories",
                    color: "var(--chart-1)",
                  },
                }}
                className="h-[350px] w-full aspect-auto"
              >
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    label={{
                      value: "kcal",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="avgCalories"
                    stroke="var(--chart-1)"
                    fill="var(--chart-1)"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              {trendData.length} data points · {data.reduce((s, d) => s + d.mealCount, 0)} total meals
            </CardFooter>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Macronutrient Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Macronutrient Trends</CardTitle>
                <CardDescription>
                  Average protein, fat &amp; carbs (g) over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    avgProteins: {
                      label: "Protein (g)",
                      color: "var(--chart-2)",
                    },
                    avgFat: { label: "Fat (g)", color: "var(--chart-3)" },
                    avgCarbs: { label: "Carbs (g)", color: "var(--chart-4)" },
                  }}
                  className="h-[350px]"
                >
                  <LineChart data={trendData}>
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
                    <Line
                      type="monotone"
                      dataKey="avgProteins"
                      stroke="var(--chart-2)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgFat"
                      stroke="var(--chart-3)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgCarbs"
                      stroke="var(--chart-4)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* By Meal Type */}
            <Card>
              <CardHeader>
                <CardTitle>Nutrition by Meal Type</CardTitle>
                <CardDescription>
                  Average calories per meal type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    avgCalories: {
                      label: "Avg Calories",
                      color: "var(--chart-1)",
                    },
                  }}
                  className="h-[350px]"
                >
                  <BarChart data={mealTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="meal" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="avgCalories"
                      fill="var(--chart-1)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Calorie Percentiles */}
          {percentileData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Calorie Distribution (Percentiles)</CardTitle>
                <CardDescription>
                  25th, 50th (median), and 75th percentile of calories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    p25: { label: "25th %ile", color: "var(--chart-3)" },
                    p50: { label: "Median", color: "var(--chart-1)" },
                    p75: { label: "75th %ile", color: "var(--chart-5)" },
                  }}
                  className="h-[350px]"
                >
                  <LineChart data={percentileData}>
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
                    <Line
                      type="monotone"
                      dataKey="p75"
                      stroke="var(--chart-5)"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="p50"
                      stroke="var(--chart-1)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="p25"
                      stroke="var(--chart-3)"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Demographic Breakdown */}
          {demoChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Nutrition by {DIMENSION_LABELS[demoDimension] ?? demoDimension}
                </CardTitle>
                <CardDescription>
                  Average calories per demographic group (k≥5 anonymity)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    avgCalories: {
                      label: "Avg Calories",
                      color: "var(--chart-1)",
                    },
                    avgProteins: {
                      label: "Protein (g)",
                      color: "var(--chart-2)",
                    },
                    avgFat: { label: "Fat (g)", color: "var(--chart-3)" },
                    avgCarbs: { label: "Carbs (g)", color: "var(--chart-4)" },
                  }}
                  className="h-[350px]"
                >
                  <BarChart data={demoChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="avgCalories"
                      fill="var(--chart-1)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="avgProteins"
                      fill="var(--chart-2)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="avgFat"
                      fill="var(--chart-3)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="avgCarbs"
                      fill="var(--chart-4)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Groups with fewer than 5 users are suppressed for privacy
              </CardFooter>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
