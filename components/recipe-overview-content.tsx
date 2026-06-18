"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { NoDataCard } from "@/components/ui/no-data-card";
import { HorizontalBarChartCard } from "@/components/ui/horizontal-bar-chart-card";
import { AnalyticsFiltersBar } from "@/components/analytics-filters";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { recipeApi } from "@/lib/analytics-api";
import { type RecipeSummary } from "@/lib/types";
import { useRecipeFilters } from "@/hooks/use-analytics-filters";
import { PAGE_TITLES } from "@/lib/page-titles";

export function RecipeOverviewContent() {
  const { periodStart, setPeriodStart, periodEnd, setPeriodEnd } =
    useRecipeFilters();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<RecipeSummary | null>(null);

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
      const s = await recipeApi.summary(filters);
      setSummary(s);
    } catch (e) {
      console.error("Failed to fetch recipe overview", e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  const hasData = summary !== null;

  const mostViewedData = (summary?.mostViewedRecipes ?? []).map((r) => ({
    name: r.title,
    count: r.viewCount,
  }));

  const mostCookedData = (summary?.mostCookedRecipes ?? []).map((r) => ({
    name: r.title,
    count: r.cookCount,
  }));

  const mostSavedData = (summary?.mostSavedRecipes ?? []).map((r) => ({
    name: r.title,
    count: r.savedCount,
  }));

  const highestRatedData = (summary?.highestRatedRecipes ?? []).map((r) => ({
    name: r.title,
    count: Math.round(r.rating * 10) / 10,
  }));

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {PAGE_TITLES.recipes.overview}
        </h2>
        <p className="text-muted-foreground">
          Total recipe stats, popularity rankings, and trending recipes
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
        <NoDataCard message="No recipe overview data available." />
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Recipes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.totalRecipes.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">In collection</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>New (last 7 days)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.newRecipes7d}</div>
                <p className="text-xs text-muted-foreground">
                  {summary.newRecipes30d} in last 30 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active Recipes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.activeRecipes.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary.archivedRecipes} archived / unused
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Average Rating</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.avgRating.toFixed(1)} ★
                </div>
                <p className="text-xs text-muted-foreground">Across all recipes</p>
              </CardContent>
            </Card>
          </div>

          {/* Popularity charts */}
          <div className="grid gap-4 md:grid-cols-2">
            {mostViewedData.length > 0 && (
              <HorizontalBarChartCard
                title="Most Viewed Recipes"
                description="Top recipes by total view count"
                config={{ count: { label: "Views", color: "var(--chart-1)" } }}
                data={mostViewedData}
                bars={[{ dataKey: "count", fill: "var(--chart-1)" }]}
                yAxisKey="name"
                yAxisWidth={160}
                height={mostViewedData.length * 36 + 40}
              />
            )}
            {mostCookedData.length > 0 && (
              <HorizontalBarChartCard
                title="Most Cooked Recipes"
                description="Top recipes by number of times cooked"
                config={{ count: { label: "Times cooked", color: "var(--chart-2)" } }}
                data={mostCookedData}
                bars={[{ dataKey: "count", fill: "var(--chart-2)" }]}
                yAxisKey="name"
                yAxisWidth={160}
                height={mostCookedData.length * 36 + 40}
              />
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {mostSavedData.length > 0 && (
              <HorizontalBarChartCard
                title="Most Saved Recipes"
                description="Top recipes by number of saves / bookmarks"
                config={{ count: { label: "Saves", color: "var(--chart-3)" } }}
                data={mostSavedData}
                bars={[{ dataKey: "count", fill: "var(--chart-3)" }]}
                yAxisKey="name"
                yAxisWidth={160}
                height={mostSavedData.length * 36 + 40}
              />
            )}
            {highestRatedData.length > 0 && (
              <HorizontalBarChartCard
                title="Highest Rated Recipes"
                description="Top recipes by average user rating"
                config={{ count: { label: "Avg rating", color: "var(--chart-4)" } }}
                data={highestRatedData}
                bars={[{ dataKey: "count", fill: "var(--chart-4)" }]}
                yAxisKey="name"
                yAxisWidth={160}
                height={highestRatedData.length * 36 + 40}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
