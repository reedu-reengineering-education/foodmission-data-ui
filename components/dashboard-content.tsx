"use client";

import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Utensils, Flame, Globe } from "lucide-react";
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
  Cell,
  Pie,
  PieChart,
} from "recharts";
import { Map } from "@/components/ui/map";
import { CountryChoropleth } from "@/components/country-choropleth";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { DIMENSION_LABELS, PIE_COLORS } from "@/lib/constants";

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

      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Users by Country</CardTitle>
          <CardDescription>Max concurrent users per country</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ users: { label: "Users", color: "var(--chart-1)" } }}
            className="h-[300px]"
          >
            <BarChart data={countryChoro} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="country" type="category" width={100} tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="users" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
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
      <Card>
        <CardHeader>
          <CardTitle>Meals by Type</CardTitle>
          <CardDescription>Total recorded meals grouped by meal type</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={Object.fromEntries(
              mealTypeChart.map((d, i) => [
                d.type,
                { label: d.type, color: PIE_COLORS[i % PIE_COLORS.length] },
              ]),
            )}
            className="h-[300px]"
          >
            <PieChart>
              <Pie
                data={mealTypeChart}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={110}
                paddingAngle={2}
                label={({ type, count }) => `${type}: ${count.toLocaleString()}`}
              >
                {mealTypeChart.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          {totalMeals.toLocaleString()} meals total
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meal Count Breakdown</CardTitle>
          <CardDescription>Exact counts per meal type</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ count: { label: "Meals", color: "var(--chart-2)" } }}
            className="h-[300px]"
          >
            <BarChart data={mealTypeChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
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
          <Card>
            <CardHeader>
              <CardTitle>{DIMENSION_LABELS.ageGroup}</CardTitle>
              <CardDescription>Users per age group</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{ users: { label: "Users", color: "var(--chart-3)" } }}
                className="h-[250px]"
              >
                <BarChart data={ageChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="users" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {genderChart.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{DIMENSION_LABELS.gender}</CardTitle>
              <CardDescription>Users per gender</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={Object.fromEntries(
                  genderChart.map((d, i) => [
                    d.label,
                    { label: d.label, color: PIE_COLORS[i % PIE_COLORS.length] },
                  ]),
                )}
                className="h-[250px]"
              >
                <PieChart>
                  <Pie
                    data={genderChart}
                    dataKey="users"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    label={({ label, users }) => `${label}: ${users}`}
                  >
                    {genderChart.map((_, i) => (
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

        {educationChart.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{DIMENSION_LABELS.educationLevel}</CardTitle>
              <CardDescription>Users per education level</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{ users: { label: "Users", color: "var(--chart-4)" } }}
                className="h-[250px]"
              >
                <BarChart data={educationChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    dataKey="label"
                    type="category"
                    width={120}
                    tick={{ fontSize: 10 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="users" fill="var(--chart-4)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
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
