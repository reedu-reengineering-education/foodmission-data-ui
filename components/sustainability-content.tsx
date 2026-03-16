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
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { AnalyticsFiltersBar } from "@/components/analytics-filters";
import { analyticsApi, type Sustainability } from "@/lib/analytics-api";
import { Skeleton } from "@/components/ui/skeleton";

export function SustainabilityContent() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [typeOfMeal, setTypeOfMeal] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Sustainability[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await analyticsApi.sustainability({
        from: from || undefined,
        to: to || undefined,
        typeOfMeal: typeOfMeal || undefined,
      });
      setData(result);
    } catch (e) {
      console.error("Failed to fetch sustainability", e);
    } finally {
      setLoading(false);
    }
  }, [from, to, typeOfMeal]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- derived ---

  // Trend: sustainability score & carbon footprint by date
  const trendMap: Record<
    string,
    {
      susScore: number;
      carbon: number;
      susCount: number;
      carbonCount: number;
      meals: number;
    }
  > = {};
  for (const row of data) {
    const d = row.date.slice(0, 10);
    if (!trendMap[d])
      trendMap[d] = {
        susScore: 0,
        carbon: 0,
        susCount: 0,
        carbonCount: 0,
        meals: 0,
      };
    const b = trendMap[d];
    if (row.avgSustainabilityScore != null) {
      b.susScore += row.avgSustainabilityScore * row.userCount;
      b.susCount += row.userCount;
    }
    if (row.avgCarbonFootprint != null) {
      b.carbon += row.avgCarbonFootprint * row.userCount;
      b.carbonCount += row.userCount;
    }
    b.meals += row.userCount;
  }
  const trendData = Object.entries(trendMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      date,
      sustainabilityScore:
        v.susCount > 0
          ? Math.round((v.susScore / v.susCount) * 10) / 10
          : null,
      carbonFootprint:
        v.carbonCount > 0
          ? Math.round((v.carbon / v.carbonCount) * 10) / 10
          : null,
    }));

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

  const nutriScoreData = ["A", "B", "C", "D", "E"]
    .filter((g) => nutriScoreAgg[g.toLowerCase()] != null || nutriScoreAgg[g] != null)
    .map((g) => ({
      grade: g,
      count: (nutriScoreAgg[g.toLowerCase()] ?? 0) + (nutriScoreAgg[g] ?? 0),
    }));

  const ecoScoreData = ["A", "B", "C", "D", "E"]
    .filter((g) => ecoScoreAgg[g.toLowerCase()] != null || ecoScoreAgg[g] != null)
    .map((g) => ({
      grade: g,
      count: (ecoScoreAgg[g.toLowerCase()] ?? 0) + (ecoScoreAgg[g] ?? 0),
    }));

  // By meal type
  const byMealType: Record<
    string,
    { susSum: number; carbonSum: number; count: number }
  > = {};
  for (const row of data) {
    if (!byMealType[row.typeOfMeal])
      byMealType[row.typeOfMeal] = { susSum: 0, carbonSum: 0, count: 0 };
    const b = byMealType[row.typeOfMeal];
    b.susSum += (row.avgSustainabilityScore ?? 0) * row.userCount;
    b.carbonSum += (row.avgCarbonFootprint ?? 0) * row.userCount;
    b.count += row.userCount;
  }
  const mealTypeData = Object.entries(byMealType).map(([meal, v]) => ({
    meal: meal.charAt(0) + meal.slice(1).toLowerCase().replace("_", " "),
    sustainabilityScore:
      Math.round((v.susSum / (v.count || 1)) * 10) / 10,
    carbonFootprint:
      Math.round((v.carbonSum / (v.count || 1)) * 10) / 10,
  }));

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
          Carbon footprint, sustainability scores &amp; nutri/eco-score
          distributions
        </p>
      </div>

      <AnalyticsFiltersBar
        from={from}
        to={to}
        typeOfMeal={typeOfMeal}
        onFromChange={setFrom}
        onToChange={setTo}
        onTypeOfMealChange={setTypeOfMeal}
        onApply={fetchData}
      />

      {data.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-muted-foreground">
              No published sustainability data available.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Sustainability Score Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Sustainability Score Trend</CardTitle>
              <CardDescription>
                Average sustainability score over time (higher is better)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  sustainabilityScore: {
                    label: "Sustainability Score",
                    color: "var(--chart-1)",
                  },
                }}
                className="h-[350px]"
              >
                <AreaChart data={trendData}>
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
                  <Area
                    type="monotone"
                    dataKey="sustainabilityScore"
                    stroke="var(--chart-1)"
                    fill="var(--chart-1)"
                    fillOpacity={0.3}
                    connectNulls
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Carbon Footprint Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Carbon Footprint Trend</CardTitle>
              <CardDescription>
                Average carbon footprint per meal over time (lower is better)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  carbonFootprint: {
                    label: "Carbon Footprint",
                    color: "var(--chart-3)",
                  },
                }}
                className="h-[350px]"
              >
                <LineChart data={trendData}>
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
                  <Line
                    type="monotone"
                    dataKey="carbonFootprint"
                    stroke="var(--chart-3)"
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

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
                    className="h-[300px]"
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
                    className="h-[300px]"
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

          {/* By Meal Type */}
          <Card>
            <CardHeader>
              <CardTitle>Sustainability by Meal Type</CardTitle>
              <CardDescription>
                Average sustainability score and carbon footprint by meal type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  sustainabilityScore: {
                    label: "Sustainability",
                    color: "var(--chart-1)",
                  },
                  carbonFootprint: {
                    label: "Carbon Footprint",
                    color: "var(--chart-3)",
                  },
                }}
                className="h-[350px]"
              >
                <BarChart data={mealTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="meal" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="sustainabilityScore"
                    fill="var(--chart-1)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="carbonFootprint"
                    fill="var(--chart-3)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
