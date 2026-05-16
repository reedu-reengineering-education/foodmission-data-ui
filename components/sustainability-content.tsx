"use client";

import { useEffect, useState, useCallback } from "react";
import { AnalyticsFiltersBar } from "@/components/analytics-filters";
import { BarChartCard } from "@/components/ui/bar-chart-card";
import { AreaChartCard } from "@/components/ui/area-chart-card";
import { analyticsApi } from "@/lib/analytics-api";
import { type Sustainability } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { NoDataCard } from "@/components/ui/no-data-card";
import { useAnalyticsFilters } from "@/hooks/use-analytics-filters";

export function SustainabilityContent() {
  const { periodStart, setPeriodStart, periodEnd, setPeriodEnd, typeOfMeal, setTypeOfMeal } = useAnalyticsFilters();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Sustainability[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await analyticsApi.sustainability({
        periodStart: periodStart || undefined,
        periodEnd: periodEnd || undefined,
        typeOfMeal: typeOfMeal || undefined,
      });
      setData(result);
    } catch (e) {
      console.error("Failed to fetch sustainability", e);
    } finally {
      setLoading(false);
    }
  }, [periodStart, periodEnd, typeOfMeal]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- derived ---

  // Nutri-Score distribution (aggregate across all rows)
  const nutriScoreAgg: Record<string, number> = {};
  const ecoScoreAgg: Record<string, number> = {};
  for (const row of data) {
    if (row.nutriScoreDistribution) {
      for (const [grade, count] of Object.entries(
        row.nutriScoreDistribution,
      )) {
        nutriScoreAgg[grade] = (nutriScoreAgg[grade] ?? 0) + (count as number);
      }
    }
    if (row.ecoScoreDistribution) {
      for (const [grade, count] of Object.entries(
        row.ecoScoreDistribution,
      )) {
        ecoScoreAgg[grade] = (ecoScoreAgg[grade] ?? 0) + (count as number);
      }
    }
  }

  const GRADES = ["A", "B", "C", "D", "E"];
  const gradeCount = (agg: Record<string, number>, g: string) =>
    (agg[g.toLowerCase()] ?? 0) + (agg[g] ?? 0);

  const nutriScoreData = GRADES
    .filter((g) => gradeCount(nutriScoreAgg, g) > 0)
    .map((g) => ({ grade: g, count: gradeCount(nutriScoreAgg, g) }));

  const ecoScoreData = GRADES
    .filter((g) => gradeCount(ecoScoreAgg, g) > 0)
    .map((g) => ({ grade: g, count: gradeCount(ecoScoreAgg, g) }));

  // Nutri-Score trend over time (stacked area)
  const nutriTrendMap: Record<string, Record<string, number>> = {};
  for (const row of data) {
    if (!row.nutriScoreDistribution) continue;
    const d = row.date.slice(0, 10);
    if (!nutriTrendMap[d]) nutriTrendMap[d] = {};
    for (const [grade, count] of Object.entries(row.nutriScoreDistribution)) {
      const g = grade.toUpperCase();
      nutriTrendMap[d][g] = (nutriTrendMap[d][g] ?? 0) + (count as number);
    }
  }
  const nutriTrendData = Object.entries(nutriTrendMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, grades]) => ({ date, ...grades }));

  // Eco-Score trend over time (stacked area)
  const ecoTrendMap: Record<string, Record<string, number>> = {};
  for (const row of data) {
    if (!row.ecoScoreDistribution) continue;
    const d = row.date.slice(0, 10);
    if (!ecoTrendMap[d]) ecoTrendMap[d] = {};
    for (const [grade, count] of Object.entries(row.ecoScoreDistribution)) {
      const g = grade.toUpperCase();
      ecoTrendMap[d][g] = (ecoTrendMap[d][g] ?? 0) + (count as number);
    }
  }
  const ecoTrendData = Object.entries(ecoTrendMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, grades]) => ({ date, ...grades }));

  const gradeColors: Record<string, string> = {
    A: "var(--chart-1)",
    B: "var(--chart-2)",
    C: "var(--chart-4)",
    D: "var(--chart-3)",
    E: "var(--chart-5)",
  };

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
          Sustainability Dashboard
        </h2>
        <p className="text-muted-foreground">
          Nutri-Score &amp; Eco-Score distributions and trends
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
        <NoDataCard message="No published sustainability data available." />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Nutri-Score Distribution */}
            {nutriScoreData.length > 0 && (
              <BarChartCard
                title="Nutri-Score Distribution"
                description="Number of meals by Nutri-Score grade (A–E)"
                config={{ count: { label: "Meals", color: "var(--chart-2)" } }}
                data={nutriScoreData as unknown as Record<string, unknown>[]}
                bars={[{ dataKey: "count", fill: "var(--chart-2)" }]}
                xAxisKey="grade"
                height="h-[300px] w-full aspect-auto"
                footer="Grade A = highest nutritional quality"
              />
            )}

            {/* Eco-Score Distribution */}
            {ecoScoreData.length > 0 && (
              <BarChartCard
                title="Eco-Score Distribution"
                description="Number of meals by Eco-Score grade (A–E)"
                config={{ count: { label: "Meals", color: "var(--chart-4)" } }}
                data={ecoScoreData as unknown as Record<string, unknown>[]}
                bars={[{ dataKey: "count", fill: "var(--chart-4)" }]}
                xAxisKey="grade"
                height="h-[300px] w-full aspect-auto"
                footer="Grade A = lowest environmental impact"
              />
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Nutri-Score Trend Over Time */}
            {nutriTrendData.length > 0 && (
              <AreaChartCard
                title="Nutri-Score Trend"
                description="How the A–E grade distribution shifts over time"
                config={Object.fromEntries(GRADES.map((g) => [g, { label: `Grade ${g}`, color: gradeColors[g] }]))}
                data={nutriTrendData as unknown as Record<string, unknown>[]}
                areas={GRADES.map((g) => ({
                  dataKey: g,
                  stroke: gradeColors[g],
                  fill: gradeColors[g],
                  fillOpacity: 0.5,
                  stackId: "1",
                }))}
                showLegend
              />
            )}

            {/* Eco-Score Trend Over Time */}
            {ecoTrendData.length > 0 && (
              <AreaChartCard
                title="Eco-Score Trend"
                description="How the A–E grade distribution shifts over time"
                config={Object.fromEntries(GRADES.map((g) => [g, { label: `Grade ${g}`, color: gradeColors[g] }]))}
                data={ecoTrendData as unknown as Record<string, unknown>[]}
                areas={GRADES.map((g) => ({
                  dataKey: g,
                  stroke: gradeColors[g],
                  fill: gradeColors[g],
                  fillOpacity: 0.5,
                  stackId: "1",
                }))}
                showLegend
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
