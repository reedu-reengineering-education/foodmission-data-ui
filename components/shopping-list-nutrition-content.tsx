"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { NoDataCard } from "@/components/ui/no-data-card";
import { AreaChartCard } from "@/components/ui/area-chart-card";
import { BarChartCard } from "@/components/ui/bar-chart-card";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { AnalyticsFiltersBar } from "@/components/analytics-filters";
import { shoppingListApi } from "@/lib/analytics-api";
import { type SlNutritionProfile } from "@/lib/types";
import { useShoppingListFilters } from "@/hooks/use-analytics-filters";

export function ShoppingListNutritionContent() {
  const { periodStart, setPeriodStart, periodEnd, setPeriodEnd } =
    useShoppingListFilters();

  const [loading, setLoading] = useState(true);
  const [nutrition, setNutrition] = useState<SlNutritionProfile[]>([]);

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
      const n = await shoppingListApi.nutritionProfile(filters);
      setNutrition(n);
    } catch (e) {
      console.error("Failed to fetch nutrition profile", e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const nutritionTrend = [...nutrition]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => ({
      date: r.date.slice(0, 10),
      avgCaloriesPer100g: Math.round(r.avgCaloriesPer100g ?? 0),
      avgProteinsPer100g: Math.round((r.avgProteinsPer100g ?? 0) * 10) / 10,
      avgCarbsPer100g: Math.round((r.avgCarbsPer100g ?? 0) * 10) / 10,
      avgFatPer100g: Math.round((r.avgFatPer100g ?? 0) * 10) / 10,
      avgFiberPer100g: Math.round((r.avgFiberPer100g ?? 0) * 10) / 10,
      avgSugarPer100g: Math.round((r.avgSugarPer100g ?? 0) * 10) / 10,
      avgSaturatedFatPer100g: Math.round((r.avgSaturatedFatPer100g ?? 0) * 10) / 10,
      avgSodiumPer100g: Math.round((r.avgSodiumPer100g ?? 0) * 10) / 10,
    }));

  // Latest snapshot bar chart
  const latest = nutrition.length > 0
    ? [...nutrition].sort((a, b) => b.date.localeCompare(a.date))[0]
    : null;
  const snapshotData = latest
    ? [
        { macro: "Energy (kcal)", value: Math.round(latest.avgCaloriesPer100g ?? 0) },
        { macro: "Protein (g)", value: Math.round((latest.avgProteinsPer100g ?? 0) * 10) / 10 },
        { macro: "Carbs (g)", value: Math.round((latest.avgCarbsPer100g ?? 0) * 10) / 10 },
        { macro: "Fat (g)", value: Math.round((latest.avgFatPer100g ?? 0) * 10) / 10 },
        { macro: "Fiber (g)", value: Math.round((latest.avgFiberPer100g ?? 0) * 10) / 10 },
        { macro: "Sugar (g)", value: Math.round((latest.avgSugarPer100g ?? 0) * 10) / 10 },
        { macro: "Sat. Fat (g)", value: Math.round((latest.avgSaturatedFatPer100g ?? 0) * 10) / 10 },
        { macro: "Sodium (g)", value: Math.round((latest.avgSodiumPer100g ?? 0) * 100) / 100 },
      ].filter((d) => d.value > 0)
    : [];

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Nutrition Profile</h2>
        <p className="text-muted-foreground">
          Average nutritional values per 100g across all listed items
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

      {nutritionTrend.length === 0 ? (
        <NoDataCard message="No published nutrition profile data available." />
      ) : (
        <>
          {/* KPI cards */}
          {latest && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2"><CardDescription>Avg Energy</CardDescription></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(latest.avgCaloriesPer100g ?? 0)} kcal</div>
                  <p className="text-xs text-muted-foreground">per 100g, latest period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardDescription>Avg Protein</CardDescription></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round((latest.avgProteinsPer100g ?? 0) * 10) / 10} g</div>
                  <p className="text-xs text-muted-foreground">per 100g, latest period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardDescription>Avg Carbs</CardDescription></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round((latest.avgCarbsPer100g ?? 0) * 10) / 10} g</div>
                  <p className="text-xs text-muted-foreground">per 100g, latest period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardDescription>Avg Fat</CardDescription></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round((latest.avgFatPer100g ?? 0) * 10) / 10} g</div>
                  <p className="text-xs text-muted-foreground">per 100g, latest period</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Latest snapshot */}
          {snapshotData.length > 0 && (
            <BarChartCard
              title="Latest Nutritional Profile"
              description="Average values per 100g — most recent period"
              config={{ value: { label: "Value", color: "var(--chart-1)" } }}
              data={snapshotData as unknown as Record<string, unknown>[]}
              bars={[{ dataKey: "value", fill: "var(--chart-1)" }]}
              xAxisKey="macro"
              height="h-[240px]"
              footer="Energy in kcal; all other values in grams per 100g"
            />
          )}

          {/* Calorie trend */}
          <AreaChartCard
            title="Calorie Trend (per 100g)"
            description="Average energy over time"
            config={{
              avgCaloriesPer100g: { label: "Avg kcal / 100g", color: "var(--chart-1)" },
            }}
            data={nutritionTrend as unknown as Record<string, unknown>[]}
            areas={[{ dataKey: "avgCaloriesPer100g", stroke: "var(--chart-1)", fill: "var(--chart-1)", fillOpacity: 0.2 }]}
          />

          {/* Macros trend */}
          <AreaChartCard
            title="Macronutrient Trend (per 100g)"
            description="Average protein, carbs and fat over time"
            config={{
              avgProteinsPer100g: { label: "Protein (g)", color: "var(--chart-2)" },
              avgCarbsPer100g: { label: "Carbs (g)", color: "var(--chart-3)" },
              avgFatPer100g: { label: "Fat (g)", color: "var(--chart-4)" },
              avgFiberPer100g: { label: "Fiber (g)", color: "var(--chart-5)" },
            }}
            data={nutritionTrend as unknown as Record<string, unknown>[]}
            areas={[
              { dataKey: "avgProteinsPer100g", stroke: "var(--chart-2)", fill: "var(--chart-2)", fillOpacity: 0.12 },
              { dataKey: "avgCarbsPer100g", stroke: "var(--chart-3)", fill: "var(--chart-3)", fillOpacity: 0.12 },
              { dataKey: "avgFatPer100g", stroke: "var(--chart-4)", fill: "var(--chart-4)", fillOpacity: 0.12 },
              { dataKey: "avgFiberPer100g", stroke: "var(--chart-5)", fill: "var(--chart-5)", fillOpacity: 0.12 },
            ]}
            showLegend
          />
        </>
      )}
    </div>
  );
}
