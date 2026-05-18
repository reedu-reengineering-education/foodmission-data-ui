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
} from "recharts";
import { AnalyticsFiltersBar } from "@/components/analytics-filters";
import { BarChartCard } from "@/components/ui/bar-chart-card";
import { analyticsApi } from "@/lib/analytics-api";
import { type MealClassification, type DemographicClassification } from "@/lib/types";
import { DIMENSION_LABELS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { NoDataCard } from "@/components/ui/no-data-card";
import { useAnalyticsFiltersWithDimension } from "@/hooks/use-analytics-filters";

export function MealClassificationContent() {
  const { periodStart, setPeriodStart, periodEnd, setPeriodEnd, typeOfMeal, setTypeOfMeal, dimension, setDimension } = useAnalyticsFiltersWithDimension("ageGroup");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MealClassification[]>([]);
  const [demoData, setDemoData] = useState<DemographicClassification[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        periodStart: periodStart || undefined,
        periodEnd: periodEnd || undefined,
        typeOfMeal: typeOfMeal || undefined,
      };
      const [classification, demographic] = await Promise.all([
        analyticsApi.mealClassification(filters),
        analyticsApi.demographicClassification({
          ...filters,
          dimension: dimension || undefined,
        }),
      ]);
      setData(classification);
      setDemoData(demographic);
    } catch (e) {
      console.error("Failed to fetch meal classification", e);
    } finally {
      setLoading(false);
    }
  }, [periodStart, periodEnd, typeOfMeal, dimension]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- derived ---

  // Trend over time
  const trendMap: Record<
    string,
    {
      vegPct: number;
      veganPct: number;
      ultraPct: number;
      meals: number;
      ultraCount: number;
    }
  > = {};
  for (const row of data) {
    const d = row.date.slice(0, 10);
    if (!trendMap[d])
      trendMap[d] = {
        vegPct: 0,
        veganPct: 0,
        ultraPct: 0,
        meals: 0,
        ultraCount: 0,
      };
    const b = trendMap[d];
    b.vegPct += row.vegetarianPct * row.totalMeals;
    b.veganPct += row.veganPct * row.totalMeals;
    if (row.avgUltraProcessedPct != null) {
      b.ultraPct += row.avgUltraProcessedPct * row.totalMeals;
      b.ultraCount += row.totalMeals;
    }
    b.meals += row.totalMeals;
  }
  const trendData = Object.entries(trendMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      date,
      vegetarianPct: Math.round((v.vegPct / (v.meals || 1)) * 10) / 10,
      veganPct: Math.round((v.veganPct / (v.meals || 1)) * 10) / 10,
      ultraProcessedPct:
        v.ultraCount > 0
          ? Math.round((v.ultraPct / v.ultraCount) * 10) / 10
          : null,
    }));

  // NOVA distribution aggregate
  const novaAgg: Record<string, number> = {};
  for (const row of data) {
    if (row.novaDistribution) {
      for (const [group, count] of Object.entries(row.novaDistribution)) {
        novaAgg[group] = (novaAgg[group] ?? 0) + (count as number);
      }
    }
  }
  const novaData = ["1", "2", "3", "4"]
    .filter((g) => novaAgg[g] != null)
    .map((g) => ({
      group: `NOVA ${g}`,
      count: novaAgg[g] ?? 0,
    }));

  const novaLabels: Record<string, string> = {
    "NOVA 1": "Unprocessed",
    "NOVA 2": "Processed Ingredients",
    "NOVA 3": "Processed Foods",
    "NOVA 4": "Ultra-processed",
  };

  // By meal type
  const byMealType: Record<
    string,
    {
      veg: number;
      vegan: number;
      ultra: number;
      meals: number;
      ultraCount: number;
    }
  > = {};
  for (const row of data) {
    if (!byMealType[row.typeOfMeal])
      byMealType[row.typeOfMeal] = {
        veg: 0,
        vegan: 0,
        ultra: 0,
        meals: 0,
        ultraCount: 0,
      };
    const b = byMealType[row.typeOfMeal];
    b.veg += row.vegetarianPct * row.totalMeals;
    b.vegan += row.veganPct * row.totalMeals;
    if (row.avgUltraProcessedPct != null) {
      b.ultra += row.avgUltraProcessedPct * row.totalMeals;
      b.ultraCount += row.totalMeals;
    }
    b.meals += row.totalMeals;
  }
  const mealTypeData = Object.entries(byMealType).map(([meal, v]) => ({
    meal: meal.charAt(0) + meal.slice(1).toLowerCase().replace("_", " "),
    vegetarianPct: Math.round((v.veg / (v.meals || 1)) * 10) / 10,
    veganPct: Math.round((v.vegan / (v.meals || 1)) * 10) / 10,
    ultraProcessedPct:
      v.ultraCount > 0 ? Math.round((v.ultra / v.ultraCount) * 10) / 10 : 0,
  }));

  // Demographic breakdown
  const dimKey = dimension as keyof DemographicClassification;
  const demoGrouped: Record<
    string,
    {
      veg: number;
      vegan: number;
      ultra: number;
      meals: number;
      ultraCount: number;
    }
  > = {};
  for (const row of demoData) {
    const val = (row[dimKey] as string) ?? "Unknown";
    if (!demoGrouped[val])
      demoGrouped[val] = {
        veg: 0,
        vegan: 0,
        ultra: 0,
        meals: 0,
        ultraCount: 0,
      };
    const b = demoGrouped[val];
    b.veg += row.vegetarianPct * row.totalMeals;
    b.vegan += row.veganPct * row.totalMeals;
    if (row.avgUltraProcessedPct != null) {
      b.ultra += row.avgUltraProcessedPct * row.totalMeals;
      b.ultraCount += row.totalMeals;
    }
    b.meals += row.totalMeals;
  }
  const demoChartData = Object.entries(demoGrouped).map(([label, v]) => ({
    label: label === "__null__" ? "Not specified" : label,
    vegetarianPct: Math.round((v.veg / (v.meals || 1)) * 10) / 10,
    veganPct: Math.round((v.vegan / (v.meals || 1)) * 10) / 10,
    ultraProcessedPct:
      v.ultraCount > 0 ? Math.round((v.ultra / v.ultraCount) * 10) / 10 : 0,
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
        <h2 className="text-2xl font-bold tracking-tight">
          Meal Classification
        </h2>
        <p className="text-muted-foreground">
          Vegetarian/vegan rates, ultra-processed % &amp; NOVA food processing
          distribution
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
        showDimension
        dimension={dimension}
        onDimensionChange={setDimension}
      />

      {data.length === 0 ? (
        <NoDataCard message="No published classification data available." />
      ) : (
        <>
          {/* Vegetarian / Vegan / Ultra-Processed Trend */}
          <Card>
            <CardHeader>
              <CardTitle>
                Vegetarian, Vegan &amp; Ultra-Processed Trends
              </CardTitle>
              <CardDescription>
                Percentage rates over time across all meals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  vegetarianPct: {
                    label: "Vegetarian %",
                    color: "var(--chart-1)",
                  },
                  veganPct: {
                    label: "Vegan %",
                    color: "var(--chart-2)",
                  },
                  ultraProcessedPct: {
                    label: "Ultra-Processed %",
                    color: "var(--chart-3)",
                  },
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
                  <Line
                    type="monotone"
                    dataKey="vegetarianPct"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="veganPct"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="ultraProcessedPct"
                    stroke="var(--chart-3)"
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              {data.reduce((s, d) => s + d.totalMeals, 0)} total meals analyzed
            </CardFooter>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {/* NOVA Distribution */}
            {novaData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>NOVA Food Processing Groups</CardTitle>
                  <CardDescription>
                    Distribution of food items by NOVA classification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: {
                        label: "Count",
                        color: "var(--chart-4)",
                      },
                    }}
                  className="h-[300px] w-full aspect-auto"
                >
                  <BarChart data={novaData}>
                    <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="group" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value, name, props) => {
                              const group = props?.payload?.group as string;
                              const label = novaLabels[group] ?? group;
                              return `${label}: ${value}`;
                            }}
                          />
                        }
                      />
                      <Bar
                        dataKey="count"
                        fill="var(--chart-4)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  NOVA 1 = unprocessed, NOVA 4 = ultra-processed
                </CardFooter>
              </Card>
            )}

            {/* By Meal Type */}
            <BarChartCard
              title="Classification by Meal Type"
              description="Vegetarian/vegan % by meal type"
              config={{
                vegetarianPct: { label: "Vegetarian %", color: "var(--chart-1)" },
                veganPct: { label: "Vegan %", color: "var(--chart-2)" },
              }}
              data={mealTypeData as unknown as Record<string, unknown>[]}
              bars={[
                { dataKey: "vegetarianPct", fill: "var(--chart-1)" },
                { dataKey: "veganPct", fill: "var(--chart-2)" },
              ]}
              xAxisKey="meal"
              showLegend
              height="h-[300px]"
            />
          </div>

          {/* Demographic Breakdown */}
          {demoChartData.length > 0 && (
            <BarChartCard
              title={`Classification by ${DIMENSION_LABELS[dimension] ?? dimension}`}
              description="Vegetarian/vegan rates by demographic group (k≥5 anonymity)"
              config={{
                vegetarianPct: { label: "Vegetarian %", color: "var(--chart-1)" },
                veganPct: { label: "Vegan %", color: "var(--chart-2)" },
                ultraProcessedPct: { label: "Ultra-Processed %", color: "var(--chart-3)" },
              }}
              data={demoChartData as unknown as Record<string, unknown>[]}
              bars={[
                { dataKey: "vegetarianPct", fill: "var(--chart-1)" },
                { dataKey: "veganPct", fill: "var(--chart-2)" },
                { dataKey: "ultraProcessedPct", fill: "var(--chart-3)" },
              ]}
              xAxisKey="label"
              yAxisLabel="%"
              showLegend
              footer="Groups with fewer than 5 users are suppressed for privacy"
            />
          )}
        </>
      )}
    </div>
  );
}
