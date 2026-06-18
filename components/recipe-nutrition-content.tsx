"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { NoDataCard } from "@/components/ui/no-data-card";
import { BarChartCard } from "@/components/ui/bar-chart-card";
import { AreaChartCard } from "@/components/ui/area-chart-card";
import { HorizontalBarChartCard } from "@/components/ui/horizontal-bar-chart-card";
import { AnalyticsFiltersBar } from "@/components/analytics-filters";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { recipeApi } from "@/lib/analytics-api";
import { type RecipeNutrition } from "@/lib/types";
import { useRecipeFilters } from "@/hooks/use-analytics-filters";
import { aggregateDistribution, buildGradeSeries, normalizeGradeTotals } from "@/lib/metrics-transforms";
import { PAGE_TITLES } from "@/lib/page-titles";

export function RecipeNutritionContent() {
  const { periodStart, setPeriodStart, periodEnd, setPeriodEnd } =
    useRecipeFilters();

  const [loading, setLoading] = useState(true);
  const [nutrition, setNutrition] = useState<RecipeNutrition[]>([]);

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
      const n = await recipeApi.nutrition(filters);
      setNutrition(n);
    } catch (e) {
      console.error("Failed to fetch recipe nutrition", e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const latest = [...nutrition].sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;

  const macroTrend = [...nutrition]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((row) => ({
      date: row.date.slice(0, 10),
      protein: Math.round((row.avgProtein ?? 0) * 10) / 10,
      carbs: Math.round((row.avgCarbs ?? 0) * 10) / 10,
      fat: Math.round((row.avgFat ?? 0) * 10) / 10,
      fiber: Math.round((row.avgFiber ?? 0) * 10) / 10,
    }));

  const calorieTrend = [...nutrition]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((row) => ({
      date: row.date.slice(0, 10),
      avgCalories: Math.round(row.avgCalories ?? 0),
    }));

  const nutriScoreData = buildGradeSeries(
    normalizeGradeTotals(
      aggregateDistribution(nutrition, (row) => row.nutriScoreDistribution),
    ),
  );

  const highestProteinData = (latest?.highestProteinRecipes ?? []).map((r) => ({
    name: r.title,
    count: Math.round(r.protein * 10) / 10,
  }));

  const lowestCalorieData = (latest?.lowestCalorieRecipes ?? []).map((r) => ({
    name: r.title,
    count: Math.round(r.calories),
  }));

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[100px]" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  const hasData = nutrition.length > 0;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {PAGE_TITLES.recipes.nutrition}
        </h2>
        <p className="text-muted-foreground">
          Average macro distribution, Nutri-Score, and standout recipes
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
        <NoDataCard message="No nutrition data available." />
      ) : (
        <>
          {/* KPI cards */}
          {latest && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2"><CardDescription>Avg Calories / Recipe</CardDescription></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latest.avgCalories != null ? `${Math.round(latest.avgCalories)} kcal` : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">Latest period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardDescription>Avg Protein / Recipe</CardDescription></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latest.avgProtein != null ? `${Math.round(latest.avgProtein)} g` : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">Latest period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardDescription>Avg Carbs / Recipe</CardDescription></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latest.avgCarbs != null ? `${Math.round(latest.avgCarbs)} g` : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">Latest period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardDescription>Avg Fat / Recipe</CardDescription></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latest.avgFat != null ? `${Math.round(latest.avgFat)} g` : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">Latest period</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Calorie trend */}
          {calorieTrend.length > 1 && (
            <AreaChartCard
              title="Average Calories per Recipe Over Time"
              description="Average kcal per recipe per period"
              config={{ avgCalories: { label: "Avg Calories (kcal)", color: "var(--chart-1)" } }}
              data={calorieTrend as unknown as Record<string, unknown>[]}
              areas={[{ dataKey: "avgCalories", stroke: "var(--chart-1)", fill: "var(--chart-1)", fillOpacity: 0.2 }]}
            />
          )}

          {/* Macro trend */}
          {macroTrend.length > 1 && (
            <AreaChartCard
              title="Macro Distribution Over Time"
              description="Average protein, carbs, fat, and fiber per recipe (g)"
              config={{
                protein: { label: "Protein (g)", color: "var(--chart-2)" },
                carbs: { label: "Carbs (g)", color: "var(--chart-3)" },
                fat: { label: "Fat (g)", color: "var(--chart-1)" },
                fiber: { label: "Fiber (g)", color: "var(--chart-4)" },
              }}
              data={macroTrend as unknown as Record<string, unknown>[]}
              areas={[
                { dataKey: "protein", stroke: "var(--chart-2)", fill: "var(--chart-2)", fillOpacity: 0.15 },
                { dataKey: "carbs", stroke: "var(--chart-3)", fill: "var(--chart-3)", fillOpacity: 0.15 },
                { dataKey: "fat", stroke: "var(--chart-1)", fill: "var(--chart-1)", fillOpacity: 0.1 },
                { dataKey: "fiber", stroke: "var(--chart-4)", fill: "var(--chart-4)", fillOpacity: 0.1 },
              ]}
              showLegend
            />
          )}

          {/* Nutri-Score */}
          {nutriScoreData.length > 0 && (
            <BarChartCard
              title="Nutri-Score Distribution"
              description="Recipes by Nutri-Score grade (A–E)"
              config={{ count: { label: "Recipes", color: "var(--chart-2)" } }}
              data={nutriScoreData as unknown as Record<string, unknown>[]}
              bars={[{ dataKey: "count", fill: "var(--chart-2)" }]}
              xAxisKey="grade"
              height="h-[260px]"
            />
          )}

          {/* Standout recipes */}
          <div className="grid gap-4 md:grid-cols-2">
            {highestProteinData.length > 0 && (
              <HorizontalBarChartCard
                title="Highest Protein Recipes"
                description="Top recipes by average protein content (g)"
                config={{ count: { label: "Protein (g)", color: "var(--chart-2)" } }}
                data={highestProteinData}
                bars={[{ dataKey: "count", fill: "var(--chart-2)" }]}
                yAxisKey="name"
                yAxisWidth={160}
                height={highestProteinData.length * 36 + 40}
              />
            )}
            {lowestCalorieData.length > 0 && (
              <HorizontalBarChartCard
                title="Lowest Calorie Recipes"
                description="Top recipes with the fewest calories (kcal)"
                config={{ count: { label: "Calories (kcal)", color: "var(--chart-3)" } }}
                data={lowestCalorieData}
                bars={[{ dataKey: "count", fill: "var(--chart-3)" }]}
                yAxisKey="name"
                yAxisWidth={160}
                height={lowestCalorieData.length * 36 + 40}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
