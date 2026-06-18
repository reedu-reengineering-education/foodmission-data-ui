"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { NoDataCard } from "@/components/ui/no-data-card";
import { PieChartCard } from "@/components/ui/pie-chart-card";
import { AreaChartCard } from "@/components/ui/area-chart-card";
import { AnalyticsFiltersBar } from "@/components/analytics-filters";
import { recipeApi } from "@/lib/analytics-api";
import { type RecipeDietDistribution, type RecipeDietTrend } from "@/lib/types";
import { useRecipeFilters } from "@/hooks/use-analytics-filters";
import { PAGE_TITLES } from "@/lib/page-titles";

const DIET_LABELS: Record<string, string> = {
  veganCount: "Vegan",
  vegetarianCount: "Vegetarian",
  pescatarianCount: "Pescatarian",
  meatBasedCount: "Meat-based",
  glutenFreeCount: "Gluten-free",
  lactoseFreeCount: "Lactose-free",
  lowCarbCount: "Low-carb",
  highProteinCount: "High-protein",
  ketoCount: "Keto",
};

export function RecipeDietLifestyleContent() {
  const { periodStart, setPeriodStart, periodEnd, setPeriodEnd } =
    useRecipeFilters();

  const [loading, setLoading] = useState(true);
  const [distribution, setDistribution] = useState<RecipeDietDistribution[]>([]);
  const [trend, setTrend] = useState<RecipeDietTrend[]>([]);

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
      const [d, t] = await Promise.all([
        recipeApi.dietDistribution(filters),
        recipeApi.dietTrend(filters),
      ]);
      setDistribution(d);
      setTrend(t);
    } catch (e) {
      console.error("Failed to fetch recipe diet & lifestyle", e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const trendSeries = [...trend]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((row) => ({
      date: row.date.slice(0, 10),
      vegan: row.totalRecipes > 0 ? Math.round((row.veganCount / row.totalRecipes) * 1000) / 10 : 0,
      vegetarian: row.totalRecipes > 0 ? Math.round((row.vegetarianCount / row.totalRecipes) * 1000) / 10 : 0,
      glutenFree: row.totalRecipes > 0 ? Math.round((row.glutenFreeCount / row.totalRecipes) * 1000) / 10 : 0,
      highProtein: row.totalRecipes > 0 ? Math.round((row.highProteinCount / row.totalRecipes) * 1000) / 10 : 0,
    }));

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[320px]" />
          <Skeleton className="h-[320px]" />
        </div>
        <Skeleton className="h-[280px]" />
      </div>
    );
  }

  const hasData = distribution.length > 0 || trend.length > 0;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {PAGE_TITLES.recipes.dietLifestyle}
        </h2>
        <p className="text-muted-foreground">
          Dietary label distribution and lifestyle trend analysis
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
        <NoDataCard message="No diet & lifestyle data available." />
      ) : (
        <>
          {/* Donut distribution */}
          {distribution.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <PieChartCard
                title="Diet Distribution"
                description="Proportion of recipes by dietary label"
                data={distribution.map((d) => ({ name: d.label, value: d.count }))}
                dataKey="value"
                nameKey="name"
                innerRadius={65}
                outerRadius={100}
              />
              <PieChartCard
                title="Diet Distribution (%)"
                description="Percentage breakdown across dietary categories"
                data={distribution.map((d) => ({ name: d.label, value: d.pct }))}
                dataKey="value"
                nameKey="name"
                innerRadius={65}
                outerRadius={100}
                footer={`Based on ${distribution.reduce((s, d) => s + d.count, 0).toLocaleString()} recipes`}
              />
            </div>
          )}

          {/* Trend over time */}
          {trendSeries.length > 1 && (
            <AreaChartCard
              title="Dietary Trend Over Time"
              description="% of recipes matching each dietary label per period"
              config={{
                vegan: { label: "Vegan %", color: "var(--chart-4)" },
                vegetarian: { label: "Vegetarian %", color: "var(--chart-2)" },
                glutenFree: { label: "Gluten-free %", color: "var(--chart-3)" },
                highProtein: { label: "High-protein %", color: "var(--chart-1)" },
              }}
              data={trendSeries as unknown as Record<string, unknown>[]}
              areas={[
                { dataKey: "vegan", stroke: "var(--chart-4)", fill: "var(--chart-4)", fillOpacity: 0.15 },
                { dataKey: "vegetarian", stroke: "var(--chart-2)", fill: "var(--chart-2)", fillOpacity: 0.15 },
                { dataKey: "glutenFree", stroke: "var(--chart-3)", fill: "var(--chart-3)", fillOpacity: 0.15 },
                { dataKey: "highProtein", stroke: "var(--chart-1)", fill: "var(--chart-1)", fillOpacity: 0.1 },
              ]}
              showLegend
            />
          )}

          {/* Full distribution table-style */}
          {distribution.length > 0 && (
            <div className="grid gap-2">
              {distribution.map((d) => (
                <div
                  key={d.label}
                  className="flex items-center justify-between rounded-md border px-4 py-2"
                >
                  <span className="text-sm font-medium capitalize">{d.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {d.count.toLocaleString()} recipes &nbsp;·&nbsp; {d.pct.toFixed(1)}%
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
