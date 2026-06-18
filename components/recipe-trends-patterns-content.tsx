"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { NoDataCard } from "@/components/ui/no-data-card";
import { BarChartCard } from "@/components/ui/bar-chart-card";
import { AreaChartCard } from "@/components/ui/area-chart-card";
import { HorizontalBarChartCard } from "@/components/ui/horizontal-bar-chart-card";
import { PieChartCard } from "@/components/ui/pie-chart-card";
import { AnalyticsFiltersBar } from "@/components/analytics-filters";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { recipeApi } from "@/lib/analytics-api";
import {
  type RecipeCuisineTrend,
  type RecipeCookingPatterns,
  type RecipeDifficultyDistribution,
  type RecipeUsageAnalytics,
} from "@/lib/types";
import { useRecipeFilters } from "@/hooks/use-analytics-filters";
import { PAGE_TITLES } from "@/lib/page-titles";

export function RecipeTrendsPatternsContent() {
  const { periodStart, setPeriodStart, periodEnd, setPeriodEnd } =
    useRecipeFilters();

  const [loading, setLoading] = useState(true);
  const [cuisines, setCuisines] = useState<RecipeCuisineTrend[]>([]);
  const [cookingPatterns, setCookingPatterns] = useState<
    RecipeCookingPatterns[]
  >([]);
  const [difficulty, setDifficulty] = useState<RecipeDifficultyDistribution[]>(
    [],
  );
  const [usage, setUsage] = useState<RecipeUsageAnalytics[]>([]);

  const filters = useMemo(
    () => ({
      periodStart: periodStart || undefined,
      periodEnd: periodEnd || undefined,
    }),
    [periodStart, periodEnd],
  );

  const asArray = <T,>(value: unknown): T[] => {
    if (Array.isArray(value)) {
      return value as T[];
    }
    if (
      value &&
      typeof value === "object" &&
      "data" in value &&
      Array.isArray((value as { data?: unknown }).data)
    ) {
      return (value as { data: T[] }).data;
    }
    return [];
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [c, cp, d, u] = await Promise.all([
        recipeApi.cuisineTrends(filters),
        recipeApi.cookingPatterns(filters),
        recipeApi.difficultyDistribution(filters),
        recipeApi.usageAnalytics(filters),
      ]);
      setCuisines(asArray<RecipeCuisineTrend>(c));
      setCookingPatterns(asArray<RecipeCookingPatterns>(cp));
      setDifficulty(asArray<RecipeDifficultyDistribution>(d));
      setUsage(asArray<RecipeUsageAnalytics>(u));
    } catch (e) {
      console.error("Failed to fetch recipe trends & patterns", e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const latestPatterns =
    [...cookingPatterns].sort((a, b) => b.date.localeCompare(a.date))[0] ??
    null;

  const timeTrend = [...cookingPatterns]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((row) => ({
      date: row.date.slice(0, 10),
      avgCookTime: Math.round(row.avgCookTime ?? 0),
      avgPrepTime: Math.round(row.avgPrepTime ?? 0),
    }));

  const usageTrend = [...usage]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((row) => ({
      date: row.date.slice(0, 10),
      recipesCooked: row.recipesCooked,
      repeatPct: Math.round((row.repeatCookedPct ?? 0) * 10) / 10,
    }));

  const cuisineData = [...cuisines]
    .sort((a, b) => b.recipeCount - a.recipeCount)
    .slice(0, 15)
    .map((c) => ({ name: c.cuisine, count: c.recipeCount }));

  const cuisineCookedData = [...cuisines]
    .sort((a, b) => b.cookedCount - a.cookedCount)
    .slice(0, 10)
    .map((c) => ({ name: c.cuisine, count: c.cookedCount }));

  const cookTimeDist = latestPatterns
    ? [
        {
          name: "Quick (≤30 min)",
          value: Math.round((latestPatterns.quickMealsPct ?? 0) * 10) / 10,
        },
        {
          name: "Medium (30–60 min)",
          value: Math.round((latestPatterns.mediumMealsPct ?? 0) * 10) / 10,
        },
        {
          name: "Long (>60 min)",
          value: Math.round((latestPatterns.longMealsPct ?? 0) * 10) / 10,
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[100px]" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[340px]" />
          <Skeleton className="h-[340px]" />
        </div>
        <Skeleton className="h-[280px]" />
      </div>
    );
  }

  const hasData =
    cuisines.length > 0 ||
    cookingPatterns.length > 0 ||
    difficulty.length > 0 ||
    usage.length > 0;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {PAGE_TITLES.recipes.trendsPatterns}
        </h2>
        <p className="text-muted-foreground">
          Cuisine popularity, cooking time distribution, difficulty, and usage
          analytics
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

      {!hasData ? (
        <NoDataCard message="No trends & patterns data available." />
      ) : (
        <>
          {/* Cooking time KPIs */}
          {latestPatterns && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Avg Cook Time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latestPatterns.avgCookTime != null
                      ? `${Math.round(latestPatterns.avgCookTime)} min`
                      : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">Latest period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Avg Prep Time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latestPatterns.avgPrepTime != null
                      ? `${Math.round(latestPatterns.avgPrepTime)} min`
                      : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">Latest period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Quick Meals (≤30 min)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latestPatterns.quickMealsPct != null
                      ? `${Math.round((latestPatterns.quickMealsPct ?? 0) * 10) / 10}%`
                      : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Of all recipes
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Long Meals (&gt;60 min)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latestPatterns.longMealsPct != null
                      ? `${Math.round((latestPatterns.longMealsPct ?? 0) * 10) / 10}%`
                      : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Of all recipes
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Cuisine popularity + most cooked */}
          <div className="grid gap-4 md:grid-cols-2">
            {cuisineData.length > 0 && (
              <HorizontalBarChartCard
                title="Most Popular Cuisines"
                description="Top cuisines by number of recipes"
                config={{
                  count: { label: "Recipes", color: "var(--chart-1)" },
                }}
                data={cuisineData}
                bars={[{ dataKey: "count", fill: "var(--chart-1)" }]}
                yAxisKey="name"
                yAxisWidth={130}
                height={cuisineData.length * 32 + 40}
              />
            )}
            {cuisineCookedData.length > 0 && (
              <HorizontalBarChartCard
                title="Most Cooked Cuisines"
                description="Top cuisines by times actually cooked by users"
                config={{
                  count: { label: "Times cooked", color: "var(--chart-3)" },
                }}
                data={cuisineCookedData}
                bars={[{ dataKey: "count", fill: "var(--chart-3)" }]}
                yAxisKey="name"
                yAxisWidth={130}
                height={cuisineCookedData.length * 32 + 40}
              />
            )}
          </div>

          {/* Cooking time distribution + Difficulty */}
          <div className="grid gap-4 md:grid-cols-2">
            {cookTimeDist.length > 0 && (
              <PieChartCard
                title="Cooking Time Distribution"
                description="Quick, medium, and long recipe breakdown"
                data={cookTimeDist}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={95}
              />
            )}
            {difficulty.length > 0 && (
              <PieChartCard
                title="Difficulty Distribution"
                description="Easy, medium, and hard recipe breakdown"
                data={difficulty.map((d) => ({
                  name: d.difficulty,
                  value: d.count,
                }))}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={95}
                footer={`${difficulty.length} difficulty levels · ${difficulty.reduce((s, d) => s + d.count, 0).toLocaleString()} recipes`}
              />
            )}
          </div>

          {/* Cook time trend */}
          {timeTrend.length > 1 && (
            <AreaChartCard
              title="Cooking & Prep Time Trend"
              description="Average cook and prep time per recipe over time (minutes)"
              config={{
                avgCookTime: {
                  label: "Cook time (min)",
                  color: "var(--chart-2)",
                },
                avgPrepTime: {
                  label: "Prep time (min)",
                  color: "var(--chart-5)",
                },
              }}
              data={timeTrend as unknown as Record<string, unknown>[]}
              areas={[
                {
                  dataKey: "avgCookTime",
                  stroke: "var(--chart-2)",
                  fill: "var(--chart-2)",
                  fillOpacity: 0.2,
                },
                {
                  dataKey: "avgPrepTime",
                  stroke: "var(--chart-5)",
                  fill: "var(--chart-5)",
                  fillOpacity: 0.15,
                },
              ]}
              showLegend
            />
          )}

          {/* Usage trend */}
          {usageTrend.length > 1 && (
            <AreaChartCard
              title="Cooking Activity Over Time"
              description="Recipes cooked and repeat-cook rate per period"
              config={{
                recipesCooked: {
                  label: "Recipes cooked",
                  color: "var(--chart-1)",
                },
                repeatPct: { label: "Repeat-cook %", color: "var(--chart-4)" },
              }}
              data={usageTrend as unknown as Record<string, unknown>[]}
              areas={[
                {
                  dataKey: "recipesCooked",
                  stroke: "var(--chart-1)",
                  fill: "var(--chart-1)",
                  fillOpacity: 0.2,
                },
                {
                  dataKey: "repeatPct",
                  stroke: "var(--chart-4)",
                  fill: "var(--chart-4)",
                  fillOpacity: 0.15,
                },
              ]}
              showLegend
            />
          )}

          {/* Difficulty breakdown rows */}
          {difficulty.length > 0 && (
            <div className="grid gap-2">
              {difficulty.map((d) => (
                <div
                  key={d.difficulty}
                  className="flex items-center justify-between rounded-md border px-4 py-2"
                >
                  <span className="text-sm font-medium capitalize">
                    {d.difficulty}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {d.count.toLocaleString()} recipes &nbsp;·&nbsp;{" "}
                    {d.pct.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
