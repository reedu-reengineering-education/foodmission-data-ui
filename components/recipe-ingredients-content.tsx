"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { NoDataCard } from "@/components/ui/no-data-card";
import { HorizontalBarChartCard } from "@/components/ui/horizontal-bar-chart-card";
import { PieChartCard } from "@/components/ui/pie-chart-card";
import { AnalyticsFiltersBar } from "@/components/analytics-filters";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { recipeApi } from "@/lib/analytics-api";
import {
  type RecipeTopIngredient,
  type RecipeIngredientCategory,
  type RecipeDiversityMetrics,
} from "@/lib/types";
import { useRecipeFilters } from "@/hooks/use-analytics-filters";
import { PAGE_TITLES } from "@/lib/page-titles";

export function RecipeIngredientsContent() {
  const { periodStart, setPeriodStart, periodEnd, setPeriodEnd } =
    useRecipeFilters();

  const [loading, setLoading] = useState(true);
  const [topIngredients, setTopIngredients] = useState<RecipeTopIngredient[]>([]);
  const [ingredientCategories, setIngredientCategories] = useState<RecipeIngredientCategory[]>([]);
  const [diversity, setDiversity] = useState<RecipeDiversityMetrics | null>(null);

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
      const [ti, ic, d] = await Promise.all([
        recipeApi.topIngredients(filters),
        recipeApi.ingredientCategories(filters),
        recipeApi.diversityMetrics(filters),
      ]);
      setTopIngredients(ti);
      setIngredientCategories(ic);
      setDiversity(d);
    } catch (e) {
      console.error("Failed to fetch recipe ingredients", e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const topIngredientData = topIngredients.slice(0, 20).map((i) => ({
    name: i.ingredientName,
    count: i.usageCount,
  }));

  const categoryPieData = ingredientCategories.map((c) => ({
    name: c.category,
    value: c.recipeCount,
  }));

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[100px]" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  const hasData =
    topIngredients.length > 0 || ingredientCategories.length > 0 || diversity !== null;

  const uniqueIngredients =
    typeof diversity?.uniqueIngredients === "number" ? diversity.uniqueIngredients : 0;
  const totalCuisines =
    typeof diversity?.totalCuisines === "number" ? diversity.totalCuisines : 0;
  const cuisineDiversityScore =
    typeof diversity?.cuisineDiversityScore === "number"
      ? diversity.cuisineDiversityScore
      : 0;
  const recipesWithVegetablesPct =
    typeof diversity?.recipesWithVegetablesPct === "number"
      ? diversity.recipesWithVegetablesPct
      : 0;
  const recipesWithLegumesPct =
    typeof diversity?.recipesWithLegumesPct === "number"
      ? diversity.recipesWithLegumesPct
      : 0;
  const recipesWithWholeGrainsPct =
    typeof diversity?.recipesWithWholeGrainsPct === "number"
      ? diversity.recipesWithWholeGrainsPct
      : 0;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {PAGE_TITLES.recipes.ingredients}
        </h2>
        <p className="text-muted-foreground">
          Most-used ingredients, category breakdown, and collection diversity
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

      {!hasData ? (
        <NoDataCard message="No ingredient data available." />
      ) : (
        <>
          {/* Diversity KPIs */}
          {diversity && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2"><CardDescription>Unique Ingredients</CardDescription></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {uniqueIngredients.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Across all recipes</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardDescription>Cuisines Covered</CardDescription></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCuisines}</div>
                  <p className="text-xs text-muted-foreground">
                    Diversity score: {cuisineDiversityScore.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardDescription>Recipes with Vegetables</CardDescription></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {recipesWithVegetablesPct.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Legumes: {recipesWithLegumesPct.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardDescription>Whole Grains</CardDescription></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {recipesWithWholeGrainsPct.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Recipes containing whole grains</p>
                </CardContent>
              </Card>
            </div>
          )}

          {diversity && (
            <div className="rounded-md border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              Your recipe collection contains{" "}
              <span className="font-semibold text-foreground">
                {uniqueIngredients.toLocaleString()} unique ingredients
              </span>{" "}
              across{" "}
              <span className="font-semibold text-foreground">
                {totalCuisines} cuisines
              </span>
              .
            </div>
          )}

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            {topIngredientData.length > 0 && (
              <HorizontalBarChartCard
                title="Most Used Ingredients"
                description="Top 20 ingredients by total usage across recipes"
                config={{ count: { label: "Usage count", color: "var(--chart-1)" } }}
                data={topIngredientData}
                bars={[{ dataKey: "count", fill: "var(--chart-1)" }]}
                yAxisKey="name"
                yAxisWidth={120}
                height={topIngredientData.length * 32 + 40}
              />
            )}
            {categoryPieData.length > 0 && (
              <PieChartCard
                title="Ingredient Categories"
                description="Recipe count per ingredient category"
                data={categoryPieData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={95}
              />
            )}
          </div>

          {/* Ingredient category detail */}
          {ingredientCategories.length > 0 && (
            <HorizontalBarChartCard
              title="Ingredient Categories — Recipe Reach"
              description="Number of recipes containing each ingredient category"
              config={{ recipeCount: { label: "Recipes", color: "var(--chart-2)" } }}
              data={ingredientCategories.map((c) => ({
                name: c.category,
                recipeCount: c.recipeCount,
              }))}
              bars={[{ dataKey: "recipeCount", fill: "var(--chart-2)" }]}
              yAxisKey="name"
              yAxisWidth={140}
              height={ingredientCategories.length * 36 + 40}
            />
          )}
        </>
      )}
    </div>
  );
}
