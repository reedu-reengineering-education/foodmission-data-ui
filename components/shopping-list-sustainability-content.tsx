"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { NoDataCard } from "@/components/ui/no-data-card";
import { BarChartCard } from "@/components/ui/bar-chart-card";
import { AreaChartCard } from "@/components/ui/area-chart-card";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { AnalyticsFiltersBar } from "@/components/analytics-filters";
import { shoppingListApi } from "@/lib/analytics-api";
import { type SlClassification, type SlSustainability } from "@/lib/types";
import { useShoppingListFilters } from "@/hooks/use-analytics-filters";
import {
  aggregateDistribution,
  buildGradeSeries,
  buildNovaSeries,
  buildShoppingSustainabilityTrend,
  normalizeGradeTotals,
} from "@/lib/metrics-transforms";
import { PAGE_TITLES } from "@/lib/page-titles";

export function ShoppingListSustainabilityContent() {
  const { periodStart, setPeriodStart, periodEnd, setPeriodEnd } =
    useShoppingListFilters();

  const [loading, setLoading] = useState(true);
  const [sustainability, setSustainability] = useState<SlSustainability[]>([]);
  const [classification, setClassification] = useState<SlClassification[]>([]);

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
      const [s, c] = await Promise.all([
        shoppingListApi.sustainability(filters),
        shoppingListApi.classification(filters),
      ]);
      setSustainability(s);
      setClassification(c);
    } catch (e) {
      console.error("Failed to fetch sustainability", e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const nutriScoreData = buildGradeSeries(
    normalizeGradeTotals(
      aggregateDistribution(sustainability, (row) => row.nutriScoreDistribution),
    ),
  );
  const ecoScoreData = buildGradeSeries(
    normalizeGradeTotals(
      aggregateDistribution(sustainability, (row) => row.ecoScoreDistribution),
    ),
  );
  const novaData = buildNovaSeries(classification, (row) => row.novaDistribution);

  const sustainTrend = buildShoppingSustainabilityTrend(
    sustainability.map((row) => ({
      ...row,
      vegetarianItemPct: null,
      veganItemPct: null,
      avgUltraProcessedPct: null,
    })),
  );

  const classificationTrend = [...classification]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((row) => ({
      date: row.date.slice(0, 10),
      vegetarianPct: Math.round((row.vegetarianPct ?? 0) * 10) / 10,
      veganPct: Math.round((row.veganPct ?? 0) * 10) / 10,
      avgUltraProcessedPct: Math.round((row.avgUltraProcessedPct ?? 0) * 10) / 10,
    }));

  const latest = [...sustainability].sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;
  const latestClassification =
    [...classification].sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {PAGE_TITLES.shoppingList.sustainability}
        </h2>
        <p className="text-muted-foreground">
          Nutri-Score and Eco-Score grade distributions for listed items
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

      {nutriScoreData.length === 0 && ecoScoreData.length === 0 && novaData.length === 0 && sustainTrend.length === 0 && classificationTrend.length === 0 ? (
        <NoDataCard message="No published sustainability data available." />
      ) : (
        <>
          {/* KPI cards */}
          {(latest || latestClassification) && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2"><CardDescription>Avg CO₂ / Item</CardDescription></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latest?.avgCarbonFootprint != null
                      ? `${Math.round((latest.avgCarbonFootprint ?? 0) * 100) / 100} kg`
                      : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">Latest period, per item</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardDescription>Vegetarian Items</CardDescription></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latestClassification?.vegetarianPct != null
                      ? `${Math.round((latestClassification.vegetarianPct ?? 0) * 10) / 10}%`
                      : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">Latest period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardDescription>Vegan Items</CardDescription></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latestClassification?.veganPct != null
                      ? `${Math.round((latestClassification.veganPct ?? 0) * 10) / 10}%`
                      : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">Latest period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardDescription>Ultra-processed (NOVA 4)</CardDescription></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latestClassification?.avgUltraProcessedPct != null
                      ? `${Math.round((latestClassification.avgUltraProcessedPct ?? 0) * 10) / 10}%`
                      : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">Latest period</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Score distributions */}
          <div className="grid gap-4 md:grid-cols-2">
            {nutriScoreData.length > 0 && (
              <BarChartCard
                title="Nutri-Score Distribution"
                description="Items by Nutri-Score grade (A–E)"
                config={{ count: { label: "Items", color: "var(--chart-2)" } }}
                data={nutriScoreData as unknown as Record<string, unknown>[]}
                bars={[{ dataKey: "count", fill: "var(--chart-2)" }]}
                xAxisKey="grade"
                height="h-[280px]"
              />
            )}
            {ecoScoreData.length > 0 && (
              <BarChartCard
                title="Eco-Score Distribution"
                description="Items by Eco-Score grade (A–E)"
                config={{ count: { label: "Items", color: "var(--chart-4)" } }}
                data={ecoScoreData as unknown as Record<string, unknown>[]}
                bars={[{ dataKey: "count", fill: "var(--chart-4)" }]}
                xAxisKey="grade"
                height="h-[280px]"
              />
            )}
          </div>

          {/* NOVA distribution */}
          {novaData.length > 0 && (
            <BarChartCard
              title="NOVA Food Processing Distribution"
              description="Items by NOVA group — Group 4 = ultra-processed"
              config={{ count: { label: "Items", color: "var(--chart-5)" } }}
              data={novaData as unknown as Record<string, unknown>[]}
              bars={[{ dataKey: "count", fill: "var(--chart-5)" }]}
              xAxisKey="group"
              height="h-[260px]"
              footer="Group 1: unprocessed · Group 2: culinary ingredients · Group 3: processed · Group 4: ultra-processed"
            />
          )}

          {/* Trends */}
          {sustainTrend.length > 1 && (
            <AreaChartCard
              title="Carbon Footprint Trend"
              description="Average CO₂ per item over time (kg)"
              config={{ avgCarbonFootprint: { label: "Avg CO₂ (kg)", color: "var(--chart-3)" } }}
              data={sustainTrend as unknown as Record<string, unknown>[]}
              areas={[{ dataKey: "avgCarbonFootprint", stroke: "var(--chart-3)", fill: "var(--chart-3)", fillOpacity: 0.2 }]}
            />
          )}
          {classificationTrend.length > 1 && (
            <>
              <AreaChartCard
                title="Diet & Processing Trends"
                description="Vegetarian, vegan, and ultra-processed item % over time"
                config={{
                  vegetarianPct: { label: "Vegetarian %", color: "var(--chart-2)" },
                  veganPct: { label: "Vegan %", color: "var(--chart-4)" },
                  avgUltraProcessedPct: { label: "Ultra-processed %", color: "var(--chart-1)" },
                }}
                data={classificationTrend as unknown as Record<string, unknown>[]}
                areas={[
                  { dataKey: "vegetarianPct", stroke: "var(--chart-2)", fill: "var(--chart-2)", fillOpacity: 0.15 },
                  { dataKey: "veganPct", stroke: "var(--chart-4)", fill: "var(--chart-4)", fillOpacity: 0.15 },
                  { dataKey: "avgUltraProcessedPct", stroke: "var(--chart-1)", fill: "var(--chart-1)", fillOpacity: 0.1 },
                ]}
                showLegend
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
