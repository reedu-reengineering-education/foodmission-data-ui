"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { NoDataCard } from "@/components/ui/no-data-card";
import { PieChartCard } from "@/components/ui/pie-chart-card";
import { HorizontalBarChartCard } from "@/components/ui/horizontal-bar-chart-card";
import { AnalyticsFiltersBar } from "@/components/analytics-filters";
import { shoppingListApi } from "@/lib/analytics-api";
import {
  type SlItemPopularity,
  type SlCategoryPopularity,
  type SlFoodGroups,
  type SlListPatterns,
} from "@/lib/types";
import { useShoppingListFilters } from "@/hooks/use-analytics-filters";
import { PAGE_TITLES } from "@/lib/page-titles";

export function ShoppingListItemPopularityContent() {
  const { periodStart, setPeriodStart, periodEnd, setPeriodEnd } =
    useShoppingListFilters();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<SlItemPopularity[]>([]);
  const [categories, setCategories] = useState<SlCategoryPopularity[]>([]);
  const [foodGroups, setFoodGroups] = useState<SlFoodGroups[]>([]);
  const [patterns, setPatterns] = useState<SlListPatterns[]>([]);

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
      const [i, c, fg, p] = await Promise.all([
        shoppingListApi.itemPopularity(filters),
        shoppingListApi.categoryPopularity(filters),
        shoppingListApi.foodGroups(filters),
        shoppingListApi.listPatterns(filters),
      ]);
      setItems(i);
      setCategories(c);
      setFoodGroups(fg);
      setPatterns(p);
    } catch (e) {
      console.error("Failed to fetch shopping list item popularity", e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Aggregate items by foodName
  const topItems = Object.values(
    items.reduce<
      Record<
        string,
        {
          foodName: string;
          foodGroup: string | null;
          itemType: string;
          frequency: number;
          uniqueUsers: number;
          totalQuantity: number;
          quantityCount: number;
          predominantUnit: string;
        }
      >
    >((acc, r) => {
      if (!acc[r.foodName])
        acc[r.foodName] = {
          foodName: r.foodName,
          foodGroup: r.foodGroup,
          itemType: r.itemType,
          frequency: 0,
          uniqueUsers: 0,
          totalQuantity: 0,
          quantityCount: 0,
          predominantUnit: r.predominantUnit,
        };
      acc[r.foodName].frequency += r.frequency;
      acc[r.foodName].uniqueUsers = Math.max(
        acc[r.foodName].uniqueUsers,
        r.uniqueUsers
      );
      if (r.avgQuantity > 0) {
        acc[r.foodName].totalQuantity += r.avgQuantity * r.frequency;
        acc[r.foodName].quantityCount += r.frequency;
      }
      return acc;
    }, {})
  )
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 20);

  // Avg quantity per top item
  const quantityData = topItems
    .filter((f) => f.quantityCount > 0)
    .map((f) => ({
      foodName: f.foodName,
      avgQuantity: Math.round((f.totalQuantity / f.quantityCount) * 10) / 10,
      unit: f.predominantUnit || "units",
    }))
    .slice(0, 15);

  const topCategories = Object.values(
    categories.reduce<
      Record<string, { category: string; frequency: number; uniqueUsers: number }>
    >((acc, r) => {
      if (!acc[r.category])
        acc[r.category] = { category: r.category, frequency: 0, uniqueUsers: 0 };
      acc[r.category].frequency += r.frequency;
      acc[r.category].uniqueUsers = Math.max(
        acc[r.category].uniqueUsers,
        r.uniqueUsers
      );
      return acc;
    }, {})
  ).sort((a, b) => b.frequency - a.frequency);

  const topFoodGroups = Object.values(
    foodGroups.reduce<
      Record<string, { foodGroup: string; frequency: number; uniqueUsers: number }>
    >((acc, r) => {
      if (!acc[r.foodGroup])
        acc[r.foodGroup] = { foodGroup: r.foodGroup, frequency: 0, uniqueUsers: 0 };
      acc[r.foodGroup].frequency += r.frequency;
      acc[r.foodGroup].uniqueUsers = Math.max(
        acc[r.foodGroup].uniqueUsers,
        r.uniqueUsers
      );
      return acc;
    }, {})
  ).sort((a, b) => b.frequency - a.frequency);

  // Item type breakdown: use backend percentages from list-patterns when available.
  const latestPattern =
    [...patterns].sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;
  const itemTypeData =
    latestPattern?.foodProductPct != null && latestPattern?.genericFoodPct != null
      ? [
          { name: "Branded Product", frequency: latestPattern.foodProductPct },
          { name: "Generic Food", frequency: latestPattern.genericFoodPct },
        ]
      : Object.entries(
          items.reduce<Record<string, number>>((acc, r) => {
            acc[r.itemType] = (acc[r.itemType] ?? 0) + r.frequency;
            return acc;
          }, {})
        ).map(([type, frequency]) => ({
          name:
            type === "food_product"
              ? "Branded Product"
              : type === "generic_food"
                ? "Generic Food"
                : type,
          frequency,
        }));

  const totalLists = patterns.reduce((s, r) => s + r.totalLists, 0);
  const uniqueItemCount = topItems.length;

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
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {PAGE_TITLES.shoppingList.itemPopularity}
        </h2>
        <p className="text-muted-foreground">
          Most listed items, categories and food groups
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

      {/* KPIs */}
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
            <CardDescription>Unique Items Tracked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueItemCount}</div>
            <p className="text-xs text-muted-foreground">Distinct items in top 20</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topCategories.length}</div>
            <p className="text-xs text-muted-foreground">Distinct item categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Food Groups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topFoodGroups.length}</div>
            <p className="text-xs text-muted-foreground">Distinct food groups</p>
          </CardContent>
        </Card>
      </div>

      {topItems.length === 0 && topCategories.length === 0 ? (
        <NoDataCard message="No published shopping list item popularity data available." />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {topItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top 20 Most Listed Items</CardTitle>
                  <CardDescription>
                    Ranked by total frequency across all lists
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 pb-4">
                  <div className="overflow-auto">
                    <ChartContainer
                      config={{
                        frequency: { label: "Frequency", color: "var(--chart-1)" },
                      }}
                      style={{ height: Math.max(320, topItems.length * 28) }}
                      className="w-full"
                    >
                      <BarChart
                        data={topItems}
                        layout="vertical"
                        margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis
                          dataKey="foodName"
                          type="category"
                          width={140}
                          tick={{ fontSize: 10 }}
                          tickLine={false}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="frequency"
                          fill="var(--chart-1)"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {topCategories.length > 0 && (
              <PieChartCard
                title="Category Breakdown"
                description="Most listed categories by frequency"
                data={topCategories as unknown as Record<string, unknown>[]}
                dataKey="frequency"
                nameKey="category"
              />
            )}
          </div>

          {/* Avg Quantity per Item */}
          {quantityData.length > 0 && (
            <HorizontalBarChartCard
              title="Average Quantity per Item"
              description="Average quantity added to a list per item"
              config={{ avgQuantity: { label: "Avg Quantity", color: "var(--chart-2)" } }}
              data={quantityData as unknown as Record<string, unknown>[]}
              bars={[{ dataKey: "avgQuantity", fill: "var(--chart-2)" }]}
              yAxisKey="foodName"
              yAxisWidth={140}
              height="h-[450px]"
              tooltipFormatter={(value, _name, item) =>
                `${value} ${(item.payload as Record<string, string>).unit}`
              }
              footer="Quantity shown in the predominant unit for each item"
            />
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {/* Food Groups */}
            {topFoodGroups.length > 0 && (
              <PieChartCard
                title="Food Groups"
                description="Distribution of listed items by food group"
                data={topFoodGroups as unknown as Record<string, unknown>[]}
                dataKey="frequency"
                nameKey="foodGroup"
              />
            )}

            {/* Item Type Breakdown */}
            {itemTypeData.length > 0 && (
              <PieChartCard
                title="Item Type Breakdown"
                description="Branded food products vs generic foods"
                data={itemTypeData as unknown as Record<string, unknown>[]}
                dataKey="frequency"
                nameKey="name"
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
