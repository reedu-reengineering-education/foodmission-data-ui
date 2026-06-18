"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { NoDataCard } from "@/components/ui/no-data-card";
import { BarChartCard } from "@/components/ui/bar-chart-card";
import { AreaChartCard } from "@/components/ui/area-chart-card";
import { PieChartCard } from "@/components/ui/pie-chart-card";
import { AnalyticsFiltersBar } from "@/components/analytics-filters";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { recipeApi } from "@/lib/analytics-api";
import { type RecipeSustainability } from "@/lib/types";
import { useRecipeFilters } from "@/hooks/use-analytics-filters";
import { aggregateDistribution, buildGradeSeries, normalizeGradeTotals } from "@/lib/metrics-transforms";
import { PAGE_TITLES } from "@/lib/page-titles";

export function RecipeSustainabilityContent() {
  const { periodStart, setPeriodStart, periodEnd, setPeriodEnd } =
    useRecipeFilters();

  const [loading, setLoading] = useState(true);
  const [sustainability, setSustainability] = useState<RecipeSustainability[]>([]);

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
      const s = await recipeApi.sustainability(filters);
      setSustainability(s);
    } catch (e) {
      console.error("Failed to fetch recipe sustainability", e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const latest = [...sustainability].sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;

  const ecoScoreData = buildGradeSeries(
    normalizeGradeTotals(
      aggregateDistribution(sustainability, (row) => row.ecoScoreDistribution),
    ),
  );

  const co2Trend = [...sustainability]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((row) => ({
      date: row.date.slice(0, 10),
      avgCo2: Math.round((row.avgCo2Footprint ?? 0) * 100) / 100,
      avgWater: Math.round(row.avgWaterFootprint ?? 0),
    }));

  const plantAnimalData =
    latest?.plantBasedPct != null && latest?.animalBasedPct != null
      ? [
          { name: "Plant-based", value: Math.round((latest.plantBasedPct ?? 0) * 10) / 10 },
          { name: "Animal-based", value: Math.round((latest.animalBasedPct ?? 0) * 10) / 10 },
        ]
      : [];

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

  const hasData = sustainability.length > 0;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {PAGE_TITLES.recipes.sustainability}
        </h2>
        <p className="text-muted-foreground">
          Eco-Score, CO₂ footprint, water usage, and plant-vs-animal ratio
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
        <NoDataCard message="No sustainability data available." />
      ) : (
        <>
          {/* KPI cards */}
          {latest && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2"><CardDescription>Avg Eco-Score</CardDescription></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latest.avgEcoScore != null
                      ? Math.round((latest.avgEcoScore ?? 0) * 10) / 10
                      : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">Latest period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardDescription>Avg CO₂ / Recipe</CardDescription></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latest.avgCo2Footprint != null
                      ? `${Math.round((latest.avgCo2Footprint ?? 0) * 100) / 100} kg`
                      : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">CO₂ equivalent</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardDescription>Avg Water / Recipe</CardDescription></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latest.avgWaterFootprint != null
                      ? `${Math.round(latest.avgWaterFootprint ?? 0)} L`
                      : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">Water footprint</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardDescription>Seasonal Ingredients</CardDescription></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latest.seasonalIngredientPct != null
                      ? `${Math.round((latest.seasonalIngredientPct ?? 0) * 10) / 10}%`
                      : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {latest.localIngredientPct != null
                      ? `${Math.round((latest.localIngredientPct ?? 0) * 10) / 10}% local`
                      : ""}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Eco-Score + Plant/Animal donut */}
          <div className="grid gap-4 md:grid-cols-2">
            {ecoScoreData.length > 0 && (
              <BarChartCard
                title="Eco-Score Distribution"
                description="Recipes by Eco-Score grade (A–E)"
                config={{ count: { label: "Recipes", color: "var(--chart-4)" } }}
                data={ecoScoreData as unknown as Record<string, unknown>[]}
                bars={[{ dataKey: "count", fill: "var(--chart-4)" }]}
                xAxisKey="grade"
                height="h-[280px]"
              />
            )}
            {plantAnimalData.length > 0 && (
              <PieChartCard
                title="Plant-Based vs Animal-Based"
                description="Recipe split by primary ingredient type"
                data={plantAnimalData}
                dataKey="value"
                nameKey="name"
                innerRadius={65}
                outerRadius={100}
              />
            )}
          </div>

          {/* CO₂ & Water trend */}
          {co2Trend.length > 1 && (
            <AreaChartCard
              title="CO₂ & Water Footprint Trend"
              description="Average CO₂ (kg) and water (L) per recipe over time"
              config={{
                avgCo2: { label: "CO₂ (kg)", color: "var(--chart-3)" },
                avgWater: { label: "Water (L)", color: "var(--chart-2)" },
              }}
              data={co2Trend as unknown as Record<string, unknown>[]}
              areas={[
                { dataKey: "avgCo2", stroke: "var(--chart-3)", fill: "var(--chart-3)", fillOpacity: 0.2 },
                { dataKey: "avgWater", stroke: "var(--chart-2)", fill: "var(--chart-2)", fillOpacity: 0.15 },
              ]}
              showLegend
            />
          )}
        </>
      )}
    </div>
  );
}
