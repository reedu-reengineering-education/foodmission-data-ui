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
import { type SlSustainability } from "@/lib/types";
import { useShoppingListFilters } from "@/hooks/use-analytics-filters";

const GRADES = ["A", "B", "C", "D", "E"];

function normalizeGradeAgg(
  raw: Record<string, number>
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw)) {
    const key = k.trim().toUpperCase();
    out[key] = (out[key] ?? 0) + v;
  }
  return out;
}

export function ShoppingListSustainabilityContent() {
  const { periodStart, setPeriodStart, periodEnd, setPeriodEnd } =
    useShoppingListFilters();

  const [loading, setLoading] = useState(true);
  const [sustainability, setSustainability] = useState<SlSustainability[]>([]);

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
      const s = await shoppingListApi.sustainability(filters);
      setSustainability(s);
    } catch (e) {
      console.error("Failed to fetch sustainability", e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const nutriScoreAggRaw: Record<string, number> = {};
  const ecoScoreAggRaw: Record<string, number> = {};
  const novaAggRaw: Record<string, number> = {};
  for (const row of sustainability) {
    if (row.nutriScoreDistribution) {
      for (const [g, count] of Object.entries(row.nutriScoreDistribution)) {
        nutriScoreAggRaw[g] = (nutriScoreAggRaw[g] ?? 0) + (count as number);
      }
    }
    if (row.ecoScoreDistribution) {
      for (const [g, count] of Object.entries(row.ecoScoreDistribution)) {
        ecoScoreAggRaw[g] = (ecoScoreAggRaw[g] ?? 0) + (count as number);
      }
    }
    if (row.novaDistribution) {
      for (const [g, count] of Object.entries(row.novaDistribution)) {
        novaAggRaw[g] = (novaAggRaw[g] ?? 0) + (count as number);
      }
    }
  }
  const nutriScoreAgg = normalizeGradeAgg(nutriScoreAggRaw);
  const ecoScoreAgg = normalizeGradeAgg(ecoScoreAggRaw);
  const nutriScoreData = GRADES.map((g) => ({
    grade: g,
    count: nutriScoreAgg[g] ?? 0,
  })).filter((x) => x.count > 0);
  const ecoScoreData = GRADES.map((g) => ({
    grade: g,
    count: ecoScoreAgg[g] ?? 0,
  })).filter((x) => x.count > 0);
  const novaData = ["1", "2", "3", "4"].map((g) => ({
    group: `Group ${g}`,
    count: novaAggRaw[g] ?? 0,
  })).filter((x) => x.count > 0);

  // Trend data for carbon footprint, vegan/veg pct, ultra-processed
  const sustainTrend = [...sustainability]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => ({
      date: r.date.slice(0, 10),
      avgCarbonFootprint: Math.round((r.avgCarbonFootprint ?? 0) * 100) / 100,
      vegetarianItemPct: Math.round((r.vegetarianItemPct ?? 0) * 10) / 10,
      veganItemPct: Math.round((r.veganItemPct ?? 0) * 10) / 10,
      avgUltraProcessedPct: Math.round((r.avgUltraProcessedPct ?? 0) * 10) / 10,
    }));

  const latest = [...sustainability].sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;

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
        <h2 className="text-2xl font-bold tracking-tight">Sustainability</h2>
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

      {nutriScoreData.length === 0 && ecoScoreData.length === 0 && novaData.length === 0 && sustainTrend.length === 0 ? (
        <NoDataCard message="No published sustainability data available." />
      ) : (
        <>
          {/* KPI cards */}
          {latest && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2"><CardDescription>Avg CO₂ / Item</CardDescription></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latest.avgCarbonFootprint !== null ? `${Math.round((latest.avgCarbonFootprint ?? 0) * 100) / 100} kg` : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">Latest period, per item</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardDescription>Vegetarian Items</CardDescription></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latest.vegetarianItemPct !== null ? `${Math.round((latest.vegetarianItemPct ?? 0) * 10) / 10}%` : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">Latest period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardDescription>Vegan Items</CardDescription></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latest.veganItemPct !== null ? `${Math.round((latest.veganItemPct ?? 0) * 10) / 10}%` : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">Latest period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardDescription>Ultra-processed (NOVA 4)</CardDescription></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latest.avgUltraProcessedPct !== null ? `${Math.round((latest.avgUltraProcessedPct ?? 0) * 10) / 10}%` : "—"}
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
            <>
              <AreaChartCard
                title="Carbon Footprint Trend"
                description="Average CO₂ per item over time (kg)"
                config={{ avgCarbonFootprint: { label: "Avg CO₂ (kg)", color: "var(--chart-3)" } }}
                data={sustainTrend as unknown as Record<string, unknown>[]}
                areas={[{ dataKey: "avgCarbonFootprint", stroke: "var(--chart-3)", fill: "var(--chart-3)", fillOpacity: 0.2 }]}
              />
              <AreaChartCard
                title="Diet & Processing Trends"
                description="Vegetarian, vegan, and ultra-processed item % over time"
                config={{
                  vegetarianItemPct: { label: "Vegetarian %", color: "var(--chart-2)" },
                  veganItemPct: { label: "Vegan %", color: "var(--chart-4)" },
                  avgUltraProcessedPct: { label: "Ultra-processed %", color: "var(--chart-1)" },
                }}
                data={sustainTrend as unknown as Record<string, unknown>[]}
                areas={[
                  { dataKey: "vegetarianItemPct", stroke: "var(--chart-2)", fill: "var(--chart-2)", fillOpacity: 0.15 },
                  { dataKey: "veganItemPct", stroke: "var(--chart-4)", fill: "var(--chart-4)", fillOpacity: 0.15 },
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
