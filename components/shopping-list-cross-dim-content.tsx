"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { NoDataCard } from "@/components/ui/no-data-card";
import { HorizontalBarChartCard } from "@/components/ui/horizontal-bar-chart-card";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { AnalyticsFiltersBar } from "@/components/analytics-filters";
import { shoppingListApi } from "@/lib/analytics-api";
import {
  type SlCrossDimPatterns,
  type SlCrossDimClassification,
  Dimension,
} from "@/lib/types";
import { DIMENSION_LABELS } from "@/lib/constants";
import { useShoppingListFilters } from "@/hooks/use-analytics-filters";
import { PAGE_TITLES } from "@/lib/page-titles";

export function ShoppingListCrossDimContent() {
  const {
    periodStart,
    setPeriodStart,
    periodEnd,
    setPeriodEnd,
    dim1,
    setDim1,
    dim2,
    setDim2,
  } = useShoppingListFilters(
    Dimension.AgeGroup,
    Dimension.AgeGroup,
    Dimension.Gender,
  );

  const [loading, setLoading] = useState(true);
  const [crossPatterns, setCrossPatterns] = useState<SlCrossDimPatterns[]>([]);
  const [crossClassification, setCrossClassification] = useState<
    SlCrossDimClassification[]
  >([]);

  const filters = useMemo(
    () => ({
      periodStart: periodStart || undefined,
      periodEnd: periodEnd || undefined,
    }),
    [periodStart, periodEnd],
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [cp, cc] = await Promise.all([
        shoppingListApi.crossDimPatterns({
          ...filters,
          dim1: dim1 || undefined,
          dim2: dim2 || undefined,
        }),
        shoppingListApi.crossDimClassification({
          ...filters,
          dim1: dim1 || undefined,
          dim2: dim2 || undefined,
        }),
      ]);
      setCrossPatterns(cp);
      setCrossClassification(cc);
    } catch (e) {
      console.error("Failed to fetch cross-dimensional data", e);
    } finally {
      setLoading(false);
    }
  }, [filters, dim1, dim2]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const dim1Label =
    DIMENSION_LABELS[dim1 as keyof typeof DIMENSION_LABELS] ?? dim1;
  const dim2Label =
    DIMENSION_LABELS[dim2 as keyof typeof DIMENSION_LABELS] ?? dim2;
  const crossLabel = `${dim1Label} × ${dim2Label}`;

  const crossPatternChart = Object.values(
    crossPatterns.reduce<
      Record<string, { label: string; avgItemsPerList: number; count: number }>
    >((acc, r) => {
      const label = `${r.dim1Value} × ${r.dim2Value}`;
      if (!acc[label]) acc[label] = { label, avgItemsPerList: 0, count: 0 };
      acc[label].avgItemsPerList += r.avgItemsPerList;
      acc[label].count++;
      return acc;
    }, {}),
  )
    .map((v) => ({
      label: v.label,
      avgItemsPerList:
        Math.round((v.avgItemsPerList / (v.count || 1)) * 10) / 10,
    }))
    .sort((a, b) => b.avgItemsPerList - a.avgItemsPerList);

  const crossClassificationChart = Object.values(
    crossClassification.reduce<
      Record<
        string,
        { label: string; avgUltraProcessedPct: number; count: number }
      >
    >((acc, r) => {
      const label = `${r.dim1Value} × ${r.dim2Value}`;
      if (!acc[label])
        acc[label] = { label, avgUltraProcessedPct: 0, count: 0 };
      acc[label].avgUltraProcessedPct += r.avgUltraProcessedPct ?? 0;
      acc[label].count++;
      return acc;
    }, {}),
  )
    .map((v) => ({
      label: v.label,
      avgUltraProcessedPct:
        Math.round((v.avgUltraProcessedPct / (v.count || 1)) * 10) / 10,
    }))
    .sort((a, b) => b.avgUltraProcessedPct - a.avgUltraProcessedPct);

  // KPI metrics
  const kpiGroupCount = Math.max(
    crossPatternChart.length,
    crossClassificationChart.length,
  );
  const kpiTotalLists = crossPatterns.reduce((s, d) => s + d.totalLists, 0);
  const kpiTopItemsGroup = crossPatternChart[0]?.label ?? "—";
  const kpiTopUltraGroup = crossClassificationChart[0]?.label ?? "—";

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
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {PAGE_TITLES.shoppingList.crossDimensionalAnalysis}
        </h2>
        <p className="text-muted-foreground">
          Shopping list patterns and nutrition across two demographic dimensions
        </p>
      </div>

      <AnalyticsFiltersBar
        periodStart={periodStart}
        periodEnd={periodEnd}
        onPeriodStartChange={setPeriodStart}
        onPeriodEndChange={setPeriodEnd}
        onApply={fetchData}
        showTypeOfMeal={false}
        showCrossDim
        dim1={dim1}
        dim2={dim2}
        onDim1Change={setDim1}
        onDim2Change={setDim2}
      />

      {crossPatternChart.length === 0 &&
      crossClassificationChart.length === 0 ? (
        <NoDataCard
          message={`No published cross-dimensional data for ${crossLabel}. Try Age Group x Gender (or Gender x Age Group) and keep date ranges within available published windows.`}
        />
      ) : (
        <>
          {/* KPIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Cross-dim Groups</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpiGroupCount}</div>
                <p className="text-xs text-muted-foreground">
                  Unique dimension combinations
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Shopping Lists</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpiTotalLists.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all group combinations
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Most Items Group</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="text-lg font-bold truncate"
                  title={kpiTopItemsGroup}
                >
                  {kpiTopItemsGroup}
                </div>
                <p className="text-xs text-muted-foreground">
                  Highest avg items per list
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Highest Ultra-Processed</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="text-lg font-bold truncate"
                  title={kpiTopUltraGroup}
                >
                  {kpiTopUltraGroup}
                </div>
                <p className="text-xs text-muted-foreground">
                  Most ultra-processed items group
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {crossPatternChart.length > 0 && (
              <HorizontalBarChartCard
                title={`List Patterns by ${crossLabel}`}
                description="Avg items per list per group combination"
                config={{
                  avgItemsPerList: {
                    label: "Avg Items / List",
                    color: "var(--chart-1)",
                  },
                }}
                data={crossPatternChart as unknown as Record<string, unknown>[]}
                bars={[{ dataKey: "avgItemsPerList", fill: "var(--chart-1)" }]}
                yAxisKey="label"
                yAxisWidth={160}
                footer="Groups with <20 users suppressed for privacy"
              />
            )}
          </div>

          {crossClassificationChart.length > 0 && (
            <HorizontalBarChartCard
              title={`Ultra-processed Items by ${crossLabel}`}
              description="Average % of NOVA group 4 items per group combination"
              config={{
                avgUltraProcessedPct: {
                  label: "Ultra-processed %",
                  color: "var(--chart-5)",
                },
              }}
              data={
                crossClassificationChart as unknown as Record<string, unknown>[]
              }
              bars={[
                { dataKey: "avgUltraProcessedPct", fill: "var(--chart-5)" },
              ]}
              yAxisKey="label"
              yAxisWidth={160}
              footer="Groups with <20 users suppressed for privacy"
            />
          )}
        </>
      )}
    </div>
  );
}
