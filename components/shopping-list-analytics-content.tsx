"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
  Line,
  Area,
  AreaChart,
  ComposedChart,
  Cell,
  Pie,
  PieChart,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { NoDataCard } from "@/components/ui/no-data-card";
import { AnalyticsFiltersBar } from "@/components/analytics-filters";
import { shoppingListApi } from "@/lib/analytics-api";
import {
  type SlItemPopularity,
  type SlCategoryPopularity,
  type SlListPatterns,
  type SlNutritionProfile,
  type SlSustainability,
  type SlFoodGroups,
  type SlDemographicPatterns,
  type SlDemographicNutrition,
} from "@/lib/types";
import { DIMENSION_LABELS, PIE_COLORS } from "@/lib/constants";
import { useAnalyticsFiltersWithDimension } from "@/hooks/use-analytics-filters";

// ── helpers ───────────────────────────────────────────────

const GRADES = ["A", "B", "C", "D", "E"];
function gradeCount(agg: Record<string, number>, g: string) {
  return (agg[g.toLowerCase()] ?? 0) + (agg[g] ?? 0);
}

// ── Main component ────────────────────────────────────────

export function ShoppingListAnalyticsContent() {
  const {
    periodStart, setPeriodStart,
    periodEnd, setPeriodEnd,
    typeOfMeal: _unused,
    setTypeOfMeal: _setUnused,
    dimension,
    setDimension,
  } = useAnalyticsFiltersWithDimension("ageGroup");

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<SlItemPopularity[]>([]);
  const [categories, setCategories] = useState<SlCategoryPopularity[]>([]);
  const [patterns, setPatterns] = useState<SlListPatterns[]>([]);
  const [nutrition, setNutrition] = useState<SlNutritionProfile[]>([]);
  const [sustainability, setSustainability] = useState<SlSustainability[]>([]);
  const [foodGroups, setFoodGroups] = useState<SlFoodGroups[]>([]);
  const [demoPatterns, setDemoPatterns] = useState<SlDemographicPatterns[]>([]);
  const [demoNutrition, setDemoNutrition] = useState<SlDemographicNutrition[]>([]);

  const filters = useMemo(() => ({
    periodStart: periodStart || undefined,
    periodEnd: periodEnd || undefined,
  }), [periodStart, periodEnd]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [i, c, p, n, s, fg, dp, dn] = await Promise.all([
        shoppingListApi.itemPopularity(filters),
        shoppingListApi.categoryPopularity(filters),
        shoppingListApi.listPatterns(filters),
        shoppingListApi.nutritionProfile(filters),
        shoppingListApi.sustainability(filters),
        shoppingListApi.foodGroups(filters),
        shoppingListApi.demographicPatterns({ ...filters, dimension: dimension || undefined }),
        shoppingListApi.demographicNutrition({ ...filters, dimension: dimension || undefined }),
      ]);
      setItems(i);
      setCategories(c);
      setPatterns(p);
      setNutrition(n);
      setSustainability(s);
      setFoodGroups(fg);
      setDemoPatterns(dp);
      setDemoNutrition(dn);
    } catch (e) {
      console.error("Failed to fetch shopping list analytics", e);
    } finally {
      setLoading(false);
    }
  }, [filters, dimension]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Derived data ───────────────────────────────────────

  // Top items
  const topItems = Object.values(
    items.reduce<Record<string, { itemName: string; frequency: number; uniqueUsers: number }>>(
      (acc, r) => {
        if (!acc[r.itemName]) acc[r.itemName] = { itemName: r.itemName, frequency: 0, uniqueUsers: 0 };
        acc[r.itemName].frequency += r.frequency;
        acc[r.itemName].uniqueUsers = Math.max(acc[r.itemName].uniqueUsers, r.uniqueUsers);
        return acc;
      }, {}
    )
  ).sort((a, b) => b.frequency - a.frequency).slice(0, 20);

  // Category breakdown
  const topCategories = Object.values(
    categories.reduce<Record<string, { category: string; frequency: number; uniqueUsers: number }>>(
      (acc, r) => {
        if (!acc[r.category]) acc[r.category] = { category: r.category, frequency: 0, uniqueUsers: 0 };
        acc[r.category].frequency += r.frequency;
        acc[r.category].uniqueUsers = Math.max(acc[r.category].uniqueUsers, r.uniqueUsers);
        return acc;
      }, {}
    )
  ).sort((a, b) => b.frequency - a.frequency);

  // Food group breakdown
  const topFoodGroups = Object.values(
    foodGroups.reduce<Record<string, { foodGroup: string; frequency: number; uniqueUsers: number }>>(
      (acc, r) => {
        if (!acc[r.foodGroup]) acc[r.foodGroup] = { foodGroup: r.foodGroup, frequency: 0, uniqueUsers: 0 };
        acc[r.foodGroup].frequency += r.frequency;
        acc[r.foodGroup].uniqueUsers = Math.max(acc[r.foodGroup].uniqueUsers, r.uniqueUsers);
        return acc;
      }, {}
    )
  ).sort((a, b) => b.frequency - a.frequency);

  // List patterns trend
  const patternsTrend = [...patterns]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => ({
      date: r.date.slice(0, 10),
      avgItemsPerList: Math.round((r.avgItemsPerList ?? 0) * 10) / 10,
      completionRate: Math.round((r.completionRate ?? 0) * 100) / 100,
      totalLists: r.totalLists,
    }));

  // Nutrition trend
  const nutritionTrend = [...nutrition]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => ({
      date: r.date.slice(0, 10),
      avgCalories: Math.round(r.avgCalories ?? 0),
      avgProteins: Math.round((r.avgProteins ?? 0) * 10) / 10,
      avgCarbs: Math.round((r.avgCarbs ?? 0) * 10) / 10,
      avgFat: Math.round((r.avgFat ?? 0) * 10) / 10,
    }));

  // Sustainability score distribution
  const nutriScoreAgg: Record<string, number> = {};
  const ecoScoreAgg: Record<string, number> = {};
  for (const row of sustainability) {
    if (row.nutriScoreDistribution) {
      for (const [g, count] of Object.entries(row.nutriScoreDistribution)) {
        nutriScoreAgg[g] = (nutriScoreAgg[g] ?? 0) + (count as number);
      }
    }
    if (row.ecoScoreDistribution) {
      for (const [g, count] of Object.entries(row.ecoScoreDistribution)) {
        ecoScoreAgg[g] = (ecoScoreAgg[g] ?? 0) + (count as number);
      }
    }
  }
  const nutriScoreData = GRADES
    .filter((g) => gradeCount(nutriScoreAgg, g) > 0)
    .map((g) => ({ grade: g, count: gradeCount(nutriScoreAgg, g) }));
  const ecoScoreData = GRADES
    .filter((g) => gradeCount(ecoScoreAgg, g) > 0)
    .map((g) => ({ grade: g, count: gradeCount(ecoScoreAgg, g) }));

  // Demographic patterns breakdown
  const demoPatternsByDim = Object.values(
    demoPatterns.reduce<Record<string, { label: string; avgItemsPerList: number; totalLists: number; count: number }>>(
      (acc, r) => {
        const raw =
          dimension === "ageGroup" ? r.ageGroup :
          dimension === "gender" ? r.gender :
          dimension === "educationLevel" ? r.educationLevel :
          dimension === "country" ? r.country : r.region;
        const label = raw === "__null__" || raw === null ? "Not specified" : raw;
        if (!acc[label]) acc[label] = { label, avgItemsPerList: 0, totalLists: 0, count: 0 };
        acc[label].avgItemsPerList += r.avgItemsPerList;
        acc[label].totalLists += r.totalLists;
        acc[label].count++;
        return acc;
      }, {}
    )
  ).map((v) => ({
    label: v.label,
    avgItemsPerList: Math.round((v.avgItemsPerList / (v.count || 1)) * 10) / 10,
    totalLists: v.totalLists,
  })).sort((a, b) => b.totalLists - a.totalLists);

  // Demographic nutrition breakdown
  const demoNutritionByDim = Object.values(
    demoNutrition.reduce<Record<string, { label: string; avgCalories: number; count: number }>>(
      (acc, r) => {
        const raw =
          dimension === "ageGroup" ? r.ageGroup :
          dimension === "gender" ? r.gender :
          dimension === "educationLevel" ? r.educationLevel :
          dimension === "country" ? r.country : r.region;
        const label = raw === "__null__" || raw === null ? "Not specified" : raw;
        if (!acc[label]) acc[label] = { label, avgCalories: 0, count: 0 };
        acc[label].avgCalories += r.avgCalories ?? 0;
        acc[label].count++;
        return acc;
      }, {}
    )
  ).map((v) => ({
    label: v.label,
    avgCalories: Math.round(v.avgCalories / (v.count || 1)),
  })).sort((a, b) => b.avgCalories - a.avgCalories);

  const noData = patterns.length === 0 && items.length === 0;

  // ── Loading skeleton ──────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  // ── KPI summary ───────────────────────────────────────

  const totalLists = patterns.reduce((s, r) => s + r.totalLists, 0);
  const latestAvgItems = patternsTrend.at(-1)?.avgItemsPerList ?? null;
  const latestCompletionRate = patternsTrend.at(-1)?.completionRate ?? null;
  const uniqueItems = topItems.length;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Shopping List Analytics</h2>
        <p className="text-muted-foreground">
          Item popularity, list patterns, nutrition profile &amp; sustainability
        </p>
      </div>

      <AnalyticsFiltersBar
        periodStart={periodStart}
        periodEnd={periodEnd}
        typeOfMeal=""
        onPeriodStartChange={setPeriodStart}
        onPeriodEndChange={setPeriodEnd}
        onTypeOfMealChange={_setUnused}
        onApply={fetchData}
        showDimension
        dimension={dimension}
        onDimensionChange={setDimension}
      />

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Shopping Lists</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLists.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all recorded periods</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Items / List</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestAvgItems !== null ? latestAvgItems : "—"}
            </div>
            <p className="text-xs text-muted-foreground">Latest period average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completion Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestCompletionRate !== null ? `${latestCompletionRate}%` : "—"}
            </div>
            <p className="text-xs text-muted-foreground">Lists fully checked off</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unique Items Tracked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueItems}</div>
            <p className="text-xs text-muted-foreground">Distinct items in top 20</p>
          </CardContent>
        </Card>
      </div>

      {noData ? (
        <NoDataCard message="No published shopping list analytics data available yet." />
      ) : (
        <>
          {/* ── List Patterns Trend ────────────────────── */}
          {patternsTrend.length > 0 && (
            <Card id="list-patterns">
              <CardHeader>
                <CardTitle>List Patterns Over Time</CardTitle>
                <CardDescription>
                  Avg items per list and completion rate trend
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    avgItemsPerList: { label: "Avg Items / List", color: "var(--chart-1)" },
                    completionRate: { label: "Completion Rate %", color: "var(--chart-2)" },
                  }}
                  className="h-[350px] w-full aspect-auto"
                >
                  <ComposedChart data={patternsTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis yAxisId="items" tick={{ fontSize: 11 }} label={{ value: "Items", angle: -90, position: "insideLeft" }} />
                    <YAxis yAxisId="rate" orientation="right" tick={{ fontSize: 11 }} label={{ value: "%", angle: 90, position: "insideRight" }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area yAxisId="items" type="monotone" dataKey="avgItemsPerList" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.2} />
                    <Line yAxisId="rate" type="monotone" dataKey="completionRate" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                {patternsTrend.length} data points · {totalLists.toLocaleString()} total lists
              </CardFooter>
            </Card>
          )}

          {/* ── Top Items + Categories ─────────────────── */}
          <div className="grid gap-4 md:grid-cols-2">
            {topItems.length > 0 && (
              <Card id="item-popularity">
                <CardHeader>
                  <CardTitle>Top 20 Most Listed Items</CardTitle>
                  <CardDescription>Ranked by total frequency across all lists</CardDescription>
                </CardHeader>
<CardContent className="p-0 pb-4">
                  <div className="overflow-auto">
                    <ChartContainer
                      config={{ frequency: { label: "Frequency", color: "var(--chart-1)" } }}
                      style={{ height: Math.max(320, topItems.length * 28) }}
                      className="w-full"
                    >
                      <BarChart data={topItems} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis dataKey="itemName" type="category" width={140} tick={{ fontSize: 10 }} tickLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="frequency" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {topCategories.length > 0 && (
              <Card id="category-breakdown">
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                  <CardDescription>Most listed categories by frequency</CardDescription>
                </CardHeader>
                <CardContent className="overflow-hidden">
                  <ChartContainer
                    config={Object.fromEntries(
                      topCategories.map((d, i) => [
                        d.category,
                        { label: d.category, color: PIE_COLORS[i % PIE_COLORS.length] },
                      ])
                    )}
                    className="w-full"
                    style={{ height: Math.max(260, topCategories.length * 22 + 200) }}
                  >
                    <PieChart>
                      <Pie
                        data={topCategories}
                        dataKey="frequency"
                        nameKey="category"
                        cx="50%"
                        cy="42%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {topCategories.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ── Food Groups ────────────────────────────── */}
          {topFoodGroups.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Food Groups</CardTitle>
                <CardDescription>Distribution of listed items by food group</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{ frequency: { label: "Frequency", color: "var(--chart-3)" } }}
                  className="h-[300px]"
                >
                  <BarChart data={topFoodGroups}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="foodGroup" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="frequency" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* ── Nutrition Profile Trend ─────────────────── */}
          {nutritionTrend.length > 0 && (
            <Card id="nutrition-profile">
              <CardHeader>
                <CardTitle>Nutrition Profile Trend</CardTitle>
                <CardDescription>
                  Average calories and macros per shopping list over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    avgCalories: { label: "Avg Calories", color: "var(--chart-1)" },
                    avgProteins: { label: "Avg Protein (g)", color: "var(--chart-2)" },
                    avgCarbs: { label: "Avg Carbs (g)", color: "var(--chart-3)" },
                    avgFat: { label: "Avg Fat (g)", color: "var(--chart-4)" },
                  }}
                  className="h-[350px] w-full aspect-auto"
                >
                  <AreaChart data={nutritionTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area type="monotone" dataKey="avgCalories" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.15} />
                    <Area type="monotone" dataKey="avgProteins" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="avgCarbs" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="avgFat" stroke="var(--chart-4)" fill="var(--chart-4)" fillOpacity={0.1} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* ── Sustainability Scores ──────────────────── */}
          {(nutriScoreData.length > 0 || ecoScoreData.length > 0) && (
            <div id="sustainability" className="grid gap-4 md:grid-cols-2">
              {nutriScoreData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Nutri-Score Distribution</CardTitle>
                    <CardDescription>Items by Nutri-Score grade (A–E)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{ count: { label: "Items", color: "var(--chart-2)" } }}
                      className="h-[280px]"
                    >
                      <BarChart data={nutriScoreData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="grade" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}

              {ecoScoreData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Eco-Score Distribution</CardTitle>
                    <CardDescription>Items by Eco-Score grade (A–E)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{ count: { label: "Items", color: "var(--chart-4)" } }}
                      className="h-[280px]"
                    >
                      <BarChart data={ecoScoreData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="grade" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* ── Demographics ──────────────────────────── */}
          {(demoPatternsByDim.length > 0 || demoNutritionByDim.length > 0) && (
            <div id="demographic-insights">
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Demographics — {DIMENSION_LABELS[dimension as keyof typeof DIMENSION_LABELS] ?? dimension}
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {demoPatternsByDim.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>List Patterns by {DIMENSION_LABELS[dimension as keyof typeof DIMENSION_LABELS] ?? dimension}</CardTitle>
                      <CardDescription>Avg items per list and total lists</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          avgItemsPerList: { label: "Avg Items / List", color: "var(--chart-1)" },
                        }}
                        className="h-[300px]"
                      >
                        <BarChart data={demoPatternsByDim} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" tick={{ fontSize: 11 }} />
                          <YAxis dataKey="label" type="category" width={120} tick={{ fontSize: 10 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="avgItemsPerList" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                )}

                {demoNutritionByDim.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Avg Calories by {DIMENSION_LABELS[dimension as keyof typeof DIMENSION_LABELS] ?? dimension}</CardTitle>
                      <CardDescription>Average planned calorie intake per list</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          avgCalories: { label: "Avg Calories", color: "var(--chart-3)" },
                        }}
                        className="h-[300px]"
                      >
                        <BarChart data={demoNutritionByDim} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" tick={{ fontSize: 11 }} />
                          <YAxis dataKey="label" type="category" width={120} tick={{ fontSize: 10 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="avgCalories" fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
