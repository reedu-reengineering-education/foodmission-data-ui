"use client";

import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Utensils, Flame, Globe } from "lucide-react";
import { Map } from "@/components/ui/map";
import { CountryChoropleth } from "@/components/country-choropleth";
import { PieChartCard } from "@/components/ui/pie-chart-card";
import { BarChartCard } from "@/components/ui/bar-chart-card";
import { HorizontalBarChartCard } from "@/components/ui/horizontal-bar-chart-card";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { DIMENSION_LABELS } from "@/lib/constants";

// ── Sub-components ────────────────────────────────────────

function KpiCards({
  totalUsers,
  totalMeals,
  totalCalories,
  countriesCount,
  mealTypeCount,
}: {
  totalUsers: number;
  totalMeals: number;
  totalCalories: number;
  countriesCount: number;
  mealTypeCount: number;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Total Users</CardDescription>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Unique users in published data</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Total Meals</CardDescription>
          <Utensils className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalMeals.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Across {mealTypeCount} meal types
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Total Calories Recorded</CardDescription>
          <Flame className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalCalories >= 1_000_000
              ? `${(totalCalories / 1_000_000).toFixed(1)}M`
              : totalCalories.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">kcal total across all meals</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Countries</CardDescription>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {countriesCount} {countriesCount === 1 ? "Country" : "Countries"}
          </div>
          <p className="text-xs text-muted-foreground">With published analytics data</p>
        </CardContent>
      </Card>
    </div>
  );
}

function MapSection({
  countryChoro,
}: {
  countryChoro: { country: string; users: number; code: string }[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-7">
      <Card className="md:col-span-4 p-0 overflow-hidden min-h-[400px]">
        <Map center={[10, 50]} zoom={3.5} projection={{ type: "mercator" }}>
          <CountryChoropleth data={countryChoro} />
        </Map>
      </Card>

      <HorizontalBarChartCard
        title="Users by Country"
        description="Max concurrent users per country"
        config={{ users: { label: "Users", color: "var(--chart-1)" } }}
        data={countryChoro as unknown as Record<string, unknown>[]}
        bars={[{ dataKey: "users", fill: "var(--chart-1)" }]}
        yAxisKey="country"
        yAxisWidth={100}
        height="h-[300px]"
        className="md:col-span-3"
      />
    </div>
  );
}

function MealTypeSection({
  mealTypeChart,
  totalMeals,
}: {
  mealTypeChart: { type: string; count: number }[];
  totalMeals: number;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <PieChartCard
        title="Meals by Type"
        description="Total recorded meals grouped by meal type"
        data={mealTypeChart as unknown as Record<string, unknown>[]}
        dataKey="count"
        nameKey="type"
        innerRadius={60}
        outerRadius={110}
        chartHeight={300}
        footer={`${totalMeals.toLocaleString()} meals total`}
      />

      <BarChartCard
        title="Meal Count Breakdown"
        description="Exact counts per meal type"
        config={{ count: { label: "Meals", color: "var(--chart-2)" } }}
        data={mealTypeChart as unknown as Record<string, unknown>[]}
        bars={[{ dataKey: "count", fill: "var(--chart-2)" }]}
        xAxisKey="type"
        height="h-[300px]"
      />
    </div>
  );
}

function DemographicsSection({
  ageChart,
  genderChart,
  educationChart,
}: {
  ageChart: { label: string; users: number }[];
  genderChart: { label: string; users: number }[];
  educationChart: { label: string; users: number }[];
}) {
  return (
    <>
      <div>
        <h3 className="text-lg font-semibold mb-3">Users by Demographics</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {ageChart.length > 0 && (
          <BarChartCard
            title={DIMENSION_LABELS.ageGroup}
            description="Users per age group"
            config={{ users: { label: "Users", color: "var(--chart-3)" } }}
            data={ageChart as unknown as Record<string, unknown>[]}
            bars={[{ dataKey: "users", fill: "var(--chart-3)" }]}
            xAxisKey="label"
            height="h-[250px]"
          />
        )}

        {genderChart.length > 0 && (
          <PieChartCard
            title={DIMENSION_LABELS.gender}
            description="Users per gender"
            data={genderChart as unknown as Record<string, unknown>[]}
            dataKey="users"
            nameKey="label"
            innerRadius={50}
            outerRadius={90}
            chartHeight={250}
          />
        )}

        {educationChart.length > 0 && (
          <HorizontalBarChartCard
            title={DIMENSION_LABELS.educationLevel}
            description="Users per education level"
            config={{ users: { label: "Users", color: "var(--chart-4)" } }}
            data={educationChart as unknown as Record<string, unknown>[]}
            bars={[{ dataKey: "users", fill: "var(--chart-4)" }]}
            yAxisKey="label"
            yAxisWidth={120}
            height="h-[250px]"
          />
        )}
      </div>
    </>
  );
}

// ── Main component ────────────────────────────────────────

export function DashboardContent() {
  const {
    loading,
    noData,
    totalUsers,
    totalMeals,
    totalCalories,
    countriesCount,
    mealTypeChart,
    countryChoro,
    ageChart,
    genderChart,
    educationChart,
  } = useDashboardData();

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">FOODMISSION Overview</h2>
        <p className="text-muted-foreground">
          Real-time analytics from published aggregation data
        </p>
      </div>

      <KpiCards
        totalUsers={totalUsers}
        totalMeals={totalMeals}
        totalCalories={totalCalories}
        countriesCount={countriesCount}
        mealTypeCount={mealTypeChart.length}
      />

      {noData ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-muted-foreground">
              No published analytics data available yet. Run an aggregation batch and
              publish it to see data here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <MapSection countryChoro={countryChoro} />
          <MealTypeSection mealTypeChart={mealTypeChart} totalMeals={totalMeals} />
          <DemographicsSection
            ageChart={ageChart}
            genderChart={genderChart}
            educationChart={educationChart}
          />
        </>
      )}
    </div>
  );
}
