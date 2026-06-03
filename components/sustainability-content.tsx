"use client";

import { useEffect, useState, useCallback } from "react";
import { AnalyticsFiltersBar } from "@/components/analytics-filters";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { BarChartCard } from "@/components/ui/bar-chart-card";
import { AreaChartCard } from "@/components/ui/area-chart-card";
import { analyticsApi } from "@/lib/analytics-api";
import { type Sustainability } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { NoDataCard } from "@/components/ui/no-data-card";
import { useAnalyticsFilters } from "@/hooks/use-analytics-filters";
import {
  aggregateDistribution,
  buildGradeSeries,
  buildGradeTrend,
  normalizeGradeTotals,
  SCORE_GRADES,
} from "@/lib/metrics-transforms";
import { PAGE_TITLES } from "@/lib/page-titles";

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
  const nutriScoreData = buildGradeSeries(
    normalizeGradeTotals(
      aggregateDistribution(data, (row) => row.nutriScoreDistribution),
    ),
  );

  const ecoScoreData = buildGradeSeries(
    normalizeGradeTotals(
      aggregateDistribution(data, (row) => row.ecoScoreDistribution),
    ),
  );

  const nutriTrendData = buildGradeTrend(
    data,
    (row) => row.date,
    (row) => row.nutriScoreDistribution,
  );

  const ecoTrendData = buildGradeTrend(
    data,
    (row) => row.date,
    (row) => row.ecoScoreDistribution,
  );

  const gradeColors: Record<string, string> = {
    A: "var(--chart-1)",
    B: "var(--chart-2)",
    C: "var(--chart-4)",
    D: "var(--chart-3)",
    E: "var(--chart-5)",
  };

  // KPI metrics
  const kpiDataPoints = data.length;
  const totalNutriCount = nutriScoreData.reduce((s, d) => s + d.count, 0);
  const kpiGradeANutriPct = totalNutriCount > 0
    ? Math.round((nutriScoreData.find(d => d.grade === "A")?.count ?? 0) / totalNutriCount * 100)
    : null;
  const totalEcoCount = ecoScoreData.reduce((s, d) => s + d.count, 0);
  const kpiGradeAEcoPct = totalEcoCount > 0
    ? Math.round((ecoScoreData.find(d => d.grade === "A")?.count ?? 0) / totalEcoCount * 100)
    : null;
  const kpiAvgCarbon = (() => {
    const rows = data.filter(d => d.avgCarbonFootprint != null);
    if (!rows.length) return null;
    return Math.round(rows.reduce((s, d) => s + (d.avgCarbonFootprint ?? 0), 0) / rows.length * 100) / 100;
  })();

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {PAGE_TITLES.mealLog.sustainability}
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
          {/* KPIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Data Points</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpiDataPoints}</div>
                <p className="text-xs text-muted-foreground">Dates with sustainability data</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Nutri-Score Grade A</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpiGradeANutriPct != null ? `${kpiGradeANutriPct}%` : "—"}</div>
                <p className="text-xs text-muted-foreground">Best nutritional quality grade</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Eco-Score Grade A</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpiGradeAEcoPct != null ? `${kpiGradeAEcoPct}%` : "—"}</div>
                <p className="text-xs text-muted-foreground">Lowest environmental impact grade</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Avg Carbon Footprint</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpiAvgCarbon != null ? `${kpiAvgCarbon} kg` : "—"}</div>
                <p className="text-xs text-muted-foreground">Average CO₂ per meal entry</p>
              </CardContent>
            </Card>
          </div>

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
                height="h-[300px]"
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
                height="h-[300px]"
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
                config={Object.fromEntries(SCORE_GRADES.map((g) => [g, { label: `Grade ${g}`, color: gradeColors[g] }]))}
                data={nutriTrendData as unknown as Record<string, unknown>[]}
                areas={SCORE_GRADES.map((g) => ({
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
                config={Object.fromEntries(SCORE_GRADES.map((g) => [g, { label: `Grade ${g}`, color: gradeColors[g] }]))}
                data={ecoTrendData as unknown as Record<string, unknown>[]}
                areas={SCORE_GRADES.map((g) => ({
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
