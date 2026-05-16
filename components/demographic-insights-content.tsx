"use client";

import { useEffect, useState, useCallback } from "react";
import { AnalyticsFiltersBar } from "@/components/analytics-filters";
import { HorizontalBarChartCard } from "@/components/ui/horizontal-bar-chart-card";
import { analyticsApi } from "@/lib/analytics-api";
import {
  type CrossDimNutrition,
  type CrossDimClassification,
  type CrossDimPatterns,
} from "@/lib/types";
import { DIMENSION_LABELS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { NoDataCard } from "@/components/ui/no-data-card";
import { useAnalyticsFiltersWithCrossDim } from "@/hooks/use-analytics-filters";

export function DemographicInsightsContent() {
  const { periodStart, setPeriodStart, periodEnd, setPeriodEnd, typeOfMeal, setTypeOfMeal, dim1, setDim1, dim2, setDim2 } = useAnalyticsFiltersWithCrossDim("ageGroup", "gender");
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
        periodStart: periodStart || undefined,
        periodEnd: periodEnd || undefined,
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
  }, [periodStart, periodEnd, typeOfMeal, dim1, dim2]);

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
        periodStart={periodStart}
        periodEnd={periodEnd}
        typeOfMeal={typeOfMeal}
        onPeriodStartChange={setPeriodStart}
        onPeriodEndChange={setPeriodEnd}
        onTypeOfMealChange={setTypeOfMeal}
        onApply={fetchData}
        showCrossDim
        dim1={dim1}
        dim2={dim2}
        onDim1Change={setDim1}
        onDim2Change={setDim2}
      />

      {noData ? (
        <NoDataCard
          message={`No published cross-dimensional data for ${crossLabel}. Try different dimension combinations or date ranges.`}
        />
      ) : (
        <>
          {/* Cross-dim Nutrition */}
          {nutritionChart.length > 0 && (
            <HorizontalBarChartCard
              title={`Nutrition by ${crossLabel}`}
              description={`Average calories for each ${dim1Label}/${dim2Label} combination`}
              config={{
                avgCalories: { label: "Avg Calories", color: "var(--chart-1)" },
                avgProteins: { label: "Protein (g)", color: "var(--chart-2)" },
                avgFat: { label: "Fat (g)", color: "var(--chart-3)" },
                avgCarbs: { label: "Carbs (g)", color: "var(--chart-4)" },
              }}
              data={nutritionChart as unknown as Record<string, unknown>[]}
              bars={[{ dataKey: "avgCalories", fill: "var(--chart-1)" }]}
              yAxisKey="label"
              yAxisWidth={180}
              height="h-[400px]"
              showLegend
              footer="Cross-dimensional groups with <20 users suppressed for privacy"
            />
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {/* Cross-dim Classification */}
            {classChart.length > 0 && (
              <HorizontalBarChartCard
                title={`Classification by ${crossLabel}`}
                description="Vegetarian/vegan % per group"
                config={{
                  vegetarianPct: { label: "Vegetarian %", color: "var(--chart-1)" },
                  veganPct: { label: "Vegan %", color: "var(--chart-2)" },
                }}
                data={classChart as unknown as Record<string, unknown>[]}
                bars={[
                  { dataKey: "vegetarianPct", fill: "var(--chart-1)" },
                  { dataKey: "veganPct", fill: "var(--chart-2)" },
                ]}
                yAxisKey="label"
                yAxisWidth={160}
                height="h-[350px]"
                showLegend
              />
            )}

            {/* Cross-dim Patterns */}
            {patternChart.length > 0 && (
              <HorizontalBarChartCard
                title={`Patterns by ${crossLabel}`}
                description="Pantry usage & eating out % per group"
                config={{
                  pantryPct: { label: "Pantry %", color: "var(--chart-1)" },
                  eatenOutPct: { label: "Eaten Out %", color: "var(--chart-3)" },
                }}
                data={patternChart as unknown as Record<string, unknown>[]}
                bars={[
                  { dataKey: "pantryPct", fill: "var(--chart-1)" },
                  { dataKey: "eatenOutPct", fill: "var(--chart-3)" },
                ]}
                yAxisKey="label"
                yAxisWidth={160}
                height="h-[350px]"
                showLegend
              />
            )}
          </div>

          {/* Macro comparison */}
          {nutritionChart.length > 0 && (
            <HorizontalBarChartCard
              title="Macronutrient Comparison"
              description={`Protein, fat & carbs (g) for each ${crossLabel} combination`}
              config={{
                avgProteins: { label: "Protein (g)", color: "var(--chart-2)" },
                avgFat: { label: "Fat (g)", color: "var(--chart-3)" },
                avgCarbs: { label: "Carbs (g)", color: "var(--chart-4)" },
              }}
              data={nutritionChart as unknown as Record<string, unknown>[]}
              bars={[
                { dataKey: "avgProteins", fill: "var(--chart-2)" },
                { dataKey: "avgFat", fill: "var(--chart-3)" },
                { dataKey: "avgCarbs", fill: "var(--chart-4)" },
              ]}
              yAxisKey="label"
              yAxisWidth={180}
              height="h-[400px]"
              showLegend
            />
          )}
        </>
      )}
    </div>
  );
}
