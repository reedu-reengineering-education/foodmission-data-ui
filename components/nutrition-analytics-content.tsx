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
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { AnalyticsFiltersBar } from "@/components/analytics-filters";
import { BarChartCard } from "@/components/ui/bar-chart-card";
import { AreaChartCard } from "@/components/ui/area-chart-card";
import { analyticsApi } from "@/lib/analytics-api";
import { type DailyNutrition, type DemographicNutrition } from "@/lib/types";
import { DIMENSION_LABELS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { NoDataCard } from "@/components/ui/no-data-card";
import { useAnalyticsFiltersWithDimension } from "@/hooks/use-analytics-filters";
import { useSourceCapabilities } from "@/hooks/use-source-capabilities";
import { PAGE_TITLES } from "@/lib/page-titles";

export function NutritionAnalyticsContent() {
  const { periodStart, setPeriodStart, periodEnd, setPeriodEnd, typeOfMeal, setTypeOfMeal, dimension: demoDimension, setDimension: setDemoDimension } = useAnalyticsFiltersWithDimension();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DailyNutrition[]>([]);
  const [demoData, setDemoData] = useState<DemographicNutrition[]>([]);
  const { capabilities } = useSourceCapabilities("meal-log");

  const fetchData = useCallback(async () => {
    setLoading(true);
    if (!capabilities.supportsNutrition) {
      setData([]);
      setDemoData([]);
      setLoading(false);
      return;
    }
    try {
      const filters = {
        periodStart: periodStart || undefined,
        periodEnd: periodEnd || undefined,
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
  }, [periodStart, periodEnd, typeOfMeal, demoDimension, capabilities.supportsNutrition]);

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
        (bucket.avgFat * bucket.mealCount + (row.avgFat ?? 0) * row.mealCount) /
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
    {
      calories: number;
      proteins: number;
      fat: number;
      carbs: number;
      count: number;
    }
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
    meal: meal.charAt(0) + meal.slice(1).toLowerCase().replace("_", " "),
    avgCalories: Math.round(v.calories / (v.count || 1)),
    avgProteins: Math.round((v.proteins / (v.count || 1)) * 10) / 10,
    avgFat: Math.round((v.fat / (v.count || 1)) * 10) / 10,
    avgCarbs: Math.round((v.carbs / (v.count || 1)) * 10) / 10,
  }));

  // Demographic breakdown
  const demoGrouped = demoData.reduce<
    Record<
      string,
      {
        calories: number;
        proteins: number;
        fat: number;
        carbs: number;
        count: number;
      }
    >
  >((acc, row) => {
    const val = row.dimensionValue ?? "Unknown";
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
            {PAGE_TITLES.mealLog.nutritionAnalytics}
          </h2>
          <p className="text-muted-foreground">
            Daily nutrition averages, macro breakdowns &amp; demographic
            comparisons
          </p>
        </div>
      </div>

      <AnalyticsFiltersBar
        periodStart={periodStart}
        periodEnd={periodEnd}
        typeOfMeal={typeOfMeal}
        onPeriodStartChange={setPeriodStart}
        onPeriodEndChange={setPeriodEnd}
        onTypeOfMealChange={setTypeOfMeal}
        onApply={fetchData}
        showDimension
        dimension={demoDimension}
        onDimensionChange={setDemoDimension}
      />

      {!capabilities.supportsNutrition ? (
        <NoDataCard message="Nutrition analytics is not available for this source." />
      ) : data.length === 0 ? (
        <NoDataCard message="No published nutrition data available for the selected filters." />
      ) : (
        <>
          {/* Calorie Trend */}
          <AreaChartCard
            title="Daily Average Calorie Trend"
            description="Weighted average calories per meal across all users over time"
            config={{ avgCalories: { label: "Avg Calories", color: "var(--chart-1)" } }}
            data={trendData as unknown as Record<string, unknown>[]}
            areas={[{ dataKey: "avgCalories", stroke: "var(--chart-1)", fill: "var(--chart-1)", fillOpacity: 0.3 }]}
            yAxisLabel="kcal"
            footer={`${trendData.length} data points · ${data.reduce((s, d) => s + d.mealCount, 0)} total meals`}
          />

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
                className="h-[350px] w-full aspect-auto"
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
          <BarChartCard
            title="Nutrition by Meal Type"
            description="Average calories per meal type"
            config={{ avgCalories: { label: "Avg Calories", color: "var(--chart-1)" } }}
            data={mealTypeData as unknown as Record<string, unknown>[]}
            bars={[{ dataKey: "avgCalories", fill: "var(--chart-1)" }]}
            xAxisKey="meal"
          />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
                    className="h-[350px] w-full aspect-auto"
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
              <BarChartCard
                title={`Nutrition by ${DIMENSION_LABELS[demoDimension] ?? demoDimension}`}
                description="Average calories per demographic group (k≥5 anonymity)"
                config={{
                  avgCalories: { label: "Avg Calories", color: "var(--chart-1)" },
                  avgProteins: { label: "Protein (g)", color: "var(--chart-2)" },
                  avgFat: { label: "Fat (g)", color: "var(--chart-3)" },
                  avgCarbs: { label: "Carbs (g)", color: "var(--chart-4)" },
                }}
                data={demoChartData as unknown as Record<string, unknown>[]}
                bars={[
                  { dataKey: "avgCalories", fill: "var(--chart-1)" },
                  { dataKey: "avgProteins", fill: "var(--chart-2)" },
                  { dataKey: "avgFat", fill: "var(--chart-3)" },
                  { dataKey: "avgCarbs", fill: "var(--chart-4)" },
                ]}
                xAxisKey="label"
                showLegend
                footer="Groups with fewer than 5 users are suppressed for privacy"
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
