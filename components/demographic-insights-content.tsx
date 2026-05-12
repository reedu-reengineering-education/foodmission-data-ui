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
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { AnalyticsFiltersBar } from "@/components/analytics-filters";
import {
  analyticsApi,
  type CrossDimNutrition,
  type CrossDimClassification,
  type CrossDimPatterns,
  DIMENSION_LABELS,
} from "@/lib/analytics-api";
import { Skeleton } from "@/components/ui/skeleton";

export function DemographicInsightsContent() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [typeOfMeal, setTypeOfMeal] = useState("");
  const [dim1, setDim1] = useState("ageGroup");
  const [dim2, setDim2] = useState("gender");
  const [loading, setLoading] = useState(true);
  const [nutrition, setNutrition] = useState<CrossDimNutrition[]>([]);
  const [classification, setClassification] = useState<
    CrossDimClassification[]
  >([]);
  const [patterns, setPatterns] = useState<CrossDimPatterns[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        from: from || undefined,
        to: to || undefined,
        typeOfMeal: typeOfMeal || undefined,
        dim1: dim1 || undefined,
        dim2: dim2 || undefined,
      };
      const [n, c, p] = await Promise.all([
        analyticsApi.crossDimNutrition(filters),
        analyticsApi.crossDimClassification(filters),
        analyticsApi.crossDimPatterns(filters),
      ]);
      setNutrition(n);
      setClassification(c);
      setPatterns(p);
    } catch (e) {
      console.error("Failed to fetch cross-dimensional data", e);
    } finally {
      setLoading(false);
    }
  }, [from, to, typeOfMeal, dim1, dim2]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- derived ---

  // Nutrition by cross-dim group
  const nutritionGrouped: Record<
    string,
    { calories: number; proteins: number; fat: number; carbs: number; count: number }
  > = {};
  for (const row of nutrition) {
    const key = `${row.dim1Value} × ${row.dim2Value}`;
    if (!nutritionGrouped[key])
      nutritionGrouped[key] = { calories: 0, proteins: 0, fat: 0, carbs: 0, count: 0 };
    const b = nutritionGrouped[key];
    b.calories += (row.avgCalories ?? 0) * row.mealCount;
    b.proteins += (row.avgProteins ?? 0) * row.mealCount;
    b.fat += (row.avgFat ?? 0) * row.mealCount;
    b.carbs += (row.avgCarbs ?? 0) * row.mealCount;
    b.count += row.mealCount;
  }
  const nutritionChart = Object.entries(nutritionGrouped)
    .map(([label, v]) => ({
      label: label.replace(/__null__/g, "N/A"),
      avgCalories: Math.round(v.calories / (v.count || 1)),
      avgProteins: Math.round((v.proteins / (v.count || 1)) * 10) / 10,
      avgFat: Math.round((v.fat / (v.count || 1)) * 10) / 10,
      avgCarbs: Math.round((v.carbs / (v.count || 1)) * 10) / 10,
    }))
    .sort((a, b) => b.avgCalories - a.avgCalories);

  // Classification by cross-dim group
  const classGrouped: Record<
    string,
    { veg: number; vegan: number; ultra: number; meals: number; ultraCount: number }
  > = {};
  for (const row of classification) {
    const key = `${row.dim1Value} × ${row.dim2Value}`;
    if (!classGrouped[key])
      classGrouped[key] = { veg: 0, vegan: 0, ultra: 0, meals: 0, ultraCount: 0 };
    const b = classGrouped[key];
    b.veg += row.vegetarianPct * row.totalMeals;
    b.vegan += row.veganPct * row.totalMeals;
    if (row.avgUltraProcessedPct != null) {
      b.ultra += row.avgUltraProcessedPct * row.totalMeals;
      b.ultraCount += row.totalMeals;
    }
    b.meals += row.totalMeals;
  }
  const classChart = Object.entries(classGrouped)
    .map(([label, v]) => ({
      label: label.replace(/__null__/g, "N/A"),
      vegetarianPct: Math.round((v.veg / (v.meals || 1)) * 10) / 10,
      veganPct: Math.round((v.vegan / (v.meals || 1)) * 10) / 10,
      ultraProcessedPct:
        v.ultraCount > 0
          ? Math.round((v.ultra / v.ultraCount) * 10) / 10
          : 0,
    }))
    .sort((a, b) => b.vegetarianPct - a.vegetarianPct);

  // Patterns by cross-dim group
  const patternGrouped: Record<
    string,
    { pantry: number; eatenOut: number; items: number; meals: number }
  > = {};
  for (const row of patterns) {
    const key = `${row.dim1Value} × ${row.dim2Value}`;
    if (!patternGrouped[key])
      patternGrouped[key] = { pantry: 0, eatenOut: 0, items: 0, meals: 0 };
    const b = patternGrouped[key];
    b.pantry += row.mealsFromPantryPct * row.totalMeals;
    b.eatenOut += row.mealsEatenOutPct * row.totalMeals;
    b.items += row.avgItemsPerMeal * row.totalMeals;
    b.meals += row.totalMeals;
  }
  const patternChart = Object.entries(patternGrouped)
    .map(([label, v]) => ({
      label: label.replace(/__null__/g, "N/A"),
      pantryPct: Math.round((v.pantry / (v.meals || 1)) * 10) / 10,
      eatenOutPct: Math.round((v.eatenOut / (v.meals || 1)) * 10) / 10,
      avgItemsPerMeal: Math.round((v.items / (v.meals || 1)) * 10) / 10,
    }))
    .sort((a, b) => b.pantryPct - a.pantryPct);

  const dim1Label = DIMENSION_LABELS[dim1] ?? dim1;
  const dim2Label = DIMENSION_LABELS[dim2] ?? dim2;
  const crossLabel = `${dim1Label} × ${dim2Label}`;

  const noData =
    nutrition.length === 0 &&
    classification.length === 0 &&
    patterns.length === 0;

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Demographic Insights
        </h2>
        <p className="text-muted-foreground">
          Cross-dimensional analysis — combine two demographic dimensions
          (k≥20 anonymity)
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
        showCrossDim
        dim1={dim1}
        dim2={dim2}
        onDim1Change={setDim1}
        onDim2Change={setDim2}
      />

      {noData ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-muted-foreground">
              No published cross-dimensional data for{" "}
              <strong>{crossLabel}</strong>. Try different dimension
              combinations or date ranges.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Cross-dim Nutrition */}
          {nutritionChart.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Nutrition by {crossLabel}</CardTitle>
                <CardDescription>
                  Average calories for each {dim1Label}/{dim2Label} combination
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    avgCalories: {
                      label: "Avg Calories",
                      color: "var(--chart-1)",
                    },
                    avgProteins: {
                      label: "Protein (g)",
                      color: "var(--chart-2)",
                    },
                    avgFat: { label: "Fat (g)", color: "var(--chart-3)" },
                    avgCarbs: {
                      label: "Carbs (g)",
                      color: "var(--chart-4)",
                    },
                  }}
                  className="h-[400px]"
                >
                  <BarChart
                    data={nutritionChart}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis
                      dataKey="label"
                      type="category"
                      width={180}
                      tick={{ fontSize: 10 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="avgCalories"
                      fill="var(--chart-1)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Cross-dimensional groups with &lt;20 users suppressed for
                privacy
              </CardFooter>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {/* Cross-dim Classification */}
            {classChart.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Classification by {crossLabel}
                  </CardTitle>
                  <CardDescription>
                    Vegetarian/vegan % per group
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      vegetarianPct: {
                        label: "Vegetarian %",
                        color: "var(--chart-1)",
                      },
                      veganPct: {
                        label: "Vegan %",
                        color: "var(--chart-2)",
                      },
                    }}
                    className="h-[350px]"
                  >
                    <BarChart data={classChart} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis
                        dataKey="label"
                        type="category"
                        width={160}
                        tick={{ fontSize: 10 }}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                      />
                      <ChartLegend
                        content={<ChartLegendContent />}
                      />
                      <Bar
                        dataKey="vegetarianPct"
                        fill="var(--chart-1)"
                        radius={[0, 4, 4, 0]}
                      />
                      <Bar
                        dataKey="veganPct"
                        fill="var(--chart-2)"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Cross-dim Patterns */}
            {patternChart.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Patterns by {crossLabel}</CardTitle>
                  <CardDescription>
                    Pantry usage &amp; eating out % per group
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      pantryPct: {
                        label: "Pantry %",
                        color: "var(--chart-1)",
                      },
                      eatenOutPct: {
                        label: "Eaten Out %",
                        color: "var(--chart-3)",
                      },
                    }}
                    className="h-[350px]"
                  >
                    <BarChart data={patternChart} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis
                        dataKey="label"
                        type="category"
                        width={160}
                        tick={{ fontSize: 10 }}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                      />
                      <ChartLegend
                        content={<ChartLegendContent />}
                      />
                      <Bar
                        dataKey="pantryPct"
                        fill="var(--chart-1)"
                        radius={[0, 4, 4, 0]}
                      />
                      <Bar
                        dataKey="eatenOutPct"
                        fill="var(--chart-3)"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Macro comparison */}
          {nutritionChart.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Macronutrient Comparison</CardTitle>
                <CardDescription>
                  Protein, fat &amp; carbs (g) for each {crossLabel}{" "}
                  combination
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    avgProteins: {
                      label: "Protein (g)",
                      color: "var(--chart-2)",
                    },
                    avgFat: {
                      label: "Fat (g)",
                      color: "var(--chart-3)",
                    },
                    avgCarbs: {
                      label: "Carbs (g)",
                      color: "var(--chart-4)",
                    },
                  }}
                  className="h-[400px]"
                >
                  <BarChart data={nutritionChart} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis
                      dataKey="label"
                      type="category"
                      width={180}
                      tick={{ fontSize: 10 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="avgProteins"
                      fill="var(--chart-2)"
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey="avgFat"
                      fill="var(--chart-3)"
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey="avgCarbs"
                      fill="var(--chart-4)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
