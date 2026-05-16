"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { AnalyticsFiltersBar } from "@/components/analytics-filters";
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
              <Card>
                <CardHeader>
                  <CardTitle>Nutri-Score Distribution</CardTitle>
                  <CardDescription>
                    Number of meals by Nutri-Score grade (A–E)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: {
                        label: "Meals",
                        color: "var(--chart-2)",
                      },
                    }}
                    className="h-[300px] w-full aspect-auto"
                  >
                    <BarChart data={nutriScoreData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="grade" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="count"
                        fill="var(--chart-2)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  Grade A = highest nutritional quality
                </CardFooter>
              </Card>
            )}

            {/* Eco-Score Distribution */}
            {ecoScoreData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Eco-Score Distribution</CardTitle>
                  <CardDescription>
                    Number of meals by Eco-Score grade (A–E)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: {
                        label: "Meals",
                        color: "var(--chart-4)",
                      },
                    }}
                    className="h-[300px] w-full aspect-auto"
                  >
                    <BarChart data={ecoScoreData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="grade" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="count"
                        fill="var(--chart-4)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  Grade A = lowest environmental impact
                </CardFooter>
              </Card>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Nutri-Score Trend Over Time */}
            {nutriTrendData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Nutri-Score Trend</CardTitle>
                  <CardDescription>
                    How the A–E grade distribution shifts over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={Object.fromEntries(
                      GRADES.map((g) => [
                        g,
                        { label: `Grade ${g}`, color: gradeColors[g] },
                      ]),
                    )}
                    className="h-[350px] w-full aspect-auto"
                  >
                    <AreaChart data={nutriTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis tick={{ fontSize: 11 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      {GRADES.map((g) => (
                        <Area
                          key={g}
                          type="monotone"
                          dataKey={g}
                          stackId="1"
                          stroke={gradeColors[g]}
                          fill={gradeColors[g]}
                          fillOpacity={0.5}
                        />
                      ))}
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Eco-Score Trend Over Time */}
            {ecoTrendData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Eco-Score Trend</CardTitle>
                  <CardDescription>
                    How the A–E grade distribution shifts over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={Object.fromEntries(
                      GRADES.map((g) => [
                        g,
                        { label: `Grade ${g}`, color: gradeColors[g] },
                      ]),
                    )}
                    className="h-[350px] w-full aspect-auto"
                  >
                    <AreaChart data={ecoTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis tick={{ fontSize: 11 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      {GRADES.map((g) => (
                        <Area
                          key={g}
                          type="monotone"
                          dataKey={g}
                          stackId="1"
                          stroke={gradeColors[g]}
                          fill={gradeColors[g]}
                          fillOpacity={0.5}
                        />
                      ))}
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
