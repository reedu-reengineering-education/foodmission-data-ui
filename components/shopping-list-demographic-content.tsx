"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { NoDataCard } from "@/components/ui/no-data-card";
import { HorizontalBarChartCard } from "@/components/ui/horizontal-bar-chart-card";
import { BarChartCard } from "@/components/ui/bar-chart-card";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { AnalyticsFiltersBar } from "@/components/analytics-filters";
import { shoppingListApi } from "@/lib/analytics-api";
import {
  type SlDemographicPatterns,
  type SlDemographicClassification,
} from "@/lib/types";
import { DIMENSION_LABELS } from "@/lib/constants";
import { useShoppingListFilters } from "@/hooks/use-analytics-filters";
import { PAGE_TITLES } from "@/lib/page-titles";

const NOVA_GROUPS = ["1", "2", "3", "4"];

export function ShoppingListDemographicContent() {
  const {
    periodStart,
    setPeriodStart,
    periodEnd,
    setPeriodEnd,
    dimension,
    setDimension,
  } = useShoppingListFilters();

  const [loading, setLoading] = useState(true);
  const [demoPatterns, setDemoPatterns] = useState<SlDemographicPatterns[]>([]);
  const [demoClassification, setDemoClassification] = useState<SlDemographicClassification[]>([]);

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
      const [dp, dc] = await Promise.all([
        shoppingListApi.demographicPatterns({
          ...filters,
          dimension: dimension || undefined,
        }),
        shoppingListApi.demographicClassification({
          ...filters,
          dimension: dimension || undefined,
        }),
      ]);
      setDemoPatterns(dp);
      setDemoClassification(dc);
    } catch (e) {
      console.error("Failed to fetch demographic insights", e);
    } finally {
      setLoading(false);
    }
  }, [filters, dimension]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const dimLabel =
    DIMENSION_LABELS[dimension as keyof typeof DIMENSION_LABELS] ?? dimension;

  // Use dimensionValue directly from new API shape
  const demoPatternsByDim = Object.values(
    demoPatterns.reduce<
      Record<string, { label: string; avgItemsPerList: number; totalLists: number; count: number }>
    >((acc, r) => {
      const label = r.dimensionValue === "__null__" ? "Not specified" : r.dimensionValue;
      if (!acc[label]) acc[label] = { label, avgItemsPerList: 0, totalLists: 0, count: 0 };
      acc[label].avgItemsPerList += r.avgItemsPerList;
      acc[label].totalLists += r.totalLists;
      acc[label].count++;
      return acc;
    }, {})
  )
    .map((v) => ({
      label: v.label,
      avgItemsPerList: Math.round((v.avgItemsPerList / (v.count || 1)) * 10) / 10,
      totalLists: v.totalLists,
    }))
    .sort((a, b) => b.totalLists - a.totalLists);

  const demoUltraProcessedByDim = Object.values(
    demoClassification.reduce<
      Record<string, { label: string; avgUltraProcessedPct: number; count: number }>
    >((acc, r) => {
      const label = r.dimensionValue === "__null__" ? "Not specified" : r.dimensionValue;
      if (!acc[label]) acc[label] = { label, avgUltraProcessedPct: 0, count: 0 };
      acc[label].avgUltraProcessedPct += r.avgUltraProcessedPct ?? 0;
      acc[label].count++;
      return acc;
    }, {})
  )
    .map((v) => ({
      label: v.label,
      avgUltraProcessedPct: Math.round((v.avgUltraProcessedPct / (v.count || 1)) * 10) / 10,
    }))
    .sort((a, b) => b.avgUltraProcessedPct - a.avgUltraProcessedPct);

  // NOVA distribution aggregated over all cohorts
  const novaAgg: Record<string, number> = {};
  for (const r of demoClassification) {
    if (r.novaDistribution) {
      for (const [g, count] of Object.entries(r.novaDistribution)) {
        novaAgg[g] = (novaAgg[g] ?? 0) + (count as number);
      }
    }
  }
  const novaData = NOVA_GROUPS.map((g) => ({
    group: `Group ${g}`,
    count: novaAgg[g] ?? 0,
  })).filter((x) => x.count > 0);

  // KPI metrics
  const kpiGroups = demoPatternsByDim.length;
  const kpiTotalLists = demoPatterns.reduce((s, d) => s + d.totalLists, 0);
  const kpiMostListsGroup = demoPatternsByDim[0]?.label ?? "—";
  const kpiHighestUltraGroup = demoUltraProcessedByDim[0]?.label ?? "—";

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
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[350px]" />
          <Skeleton className="h-[350px]" />
        </div>
        <Skeleton className="h-[350px]" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {PAGE_TITLES.shoppingList.demographicInsights}
        </h2>
        <p className="text-muted-foreground">
          Shopping list patterns and nutrition by demographic group
        </p>
      </div>

      <AnalyticsFiltersBar
        periodStart={periodStart}
        periodEnd={periodEnd}
        onPeriodStartChange={setPeriodStart}
        onPeriodEndChange={setPeriodEnd}
        onApply={fetchData}
        showTypeOfMeal={false}
        showDimension
        dimension={dimension}
        onDimensionChange={setDimension}
      />

      {demoPatternsByDim.length === 0 && demoUltraProcessedByDim.length === 0 && novaData.length === 0 ? (
        <NoDataCard message="No published demographic insights data available." />
      ) : (
        <>
          {/* KPIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Demographic Groups</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpiGroups}</div>
                <p className="text-xs text-muted-foreground">Distinct values for selected dimension</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Shopping Lists</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpiTotalLists.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Across all demographic groups</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Most Active Group</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold truncate" title={kpiMostListsGroup}>{kpiMostListsGroup}</div>
                <p className="text-xs text-muted-foreground">Most shopping lists recorded</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Highest Ultra-Processed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold truncate" title={kpiHighestUltraGroup}>{kpiHighestUltraGroup}</div>
                <p className="text-xs text-muted-foreground">Group with most ultra-processed items</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {demoPatternsByDim.length > 0 && (
              <HorizontalBarChartCard
                title={`List Patterns by ${dimLabel}`}
                description="Avg items per list"
                config={{ avgItemsPerList: { label: "Avg Items / List", color: "var(--chart-1)" } }}
                data={demoPatternsByDim as unknown as Record<string, unknown>[]}
                bars={[{ dataKey: "avgItemsPerList", fill: "var(--chart-1)" }]}
                yAxisKey="label"
                yAxisWidth={120}
                height="h-[300px]"
              />
            )}
          </div>

          {demoUltraProcessedByDim.length > 0 && (
            <HorizontalBarChartCard
              title={`Ultra-processed Items by ${dimLabel}`}
              description="Average % of NOVA group 4 items per demographic group"
              config={{ avgUltraProcessedPct: { label: "Ultra-processed %", color: "var(--chart-5)" } }}
              data={demoUltraProcessedByDim as unknown as Record<string, unknown>[]}
              bars={[{ dataKey: "avgUltraProcessedPct", fill: "var(--chart-5)" }]}
              yAxisKey="label"
              yAxisWidth={120}
              height="h-[300px]"
            />
          )}

          {novaData.length > 0 && (
            <BarChartCard
              title={`NOVA Distribution across ${dimLabel} groups`}
              description="Food processing level breakdown (aggregated)"
              config={{ count: { label: "Items", color: "var(--chart-2)" } }}
              data={novaData as unknown as Record<string, unknown>[]}
              bars={[{ dataKey: "count", fill: "var(--chart-2)" }]}
              xAxisKey="group"
              height="h-[260px]"
              footer="Group 1: unprocessed · Group 4: ultra-processed"
            />
          )}
        </>
      )}
    </div>
  );
}
