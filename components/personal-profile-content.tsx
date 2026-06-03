"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ShieldCheck,
  User,
  Mail,
  CalendarDays,
  Shield,
  UtensilsCrossed,
  Flame,
  Trash2,
  Package,
  AlertTriangle,
  Leaf,
  Clock,
} from "lucide-react";
import {
  ProfileTimeFilter,
  type TimeRange,
} from "@/components/profile-time-filter";

interface ProfileUser {
  name: string;
  email: string;
  image: string | null;
  role: string;
  createdAt: Date;
}

interface FoodStats {
  totalMeals: number;
  logsInRange: number;
  avgCaloriesPerMeal: number | null;
  nutrients: {
    avgProteins: number;
    avgCarbs: number;
    avgFat: number;
    avgSugar: number;
    logsWithData: number;
  } | null;
  recentLogs: Array<{
    id: string;
    typeOfMeal: string;
    timestamp: string;
    mealName: string;
    calories: number | null;
  }>;
  mealTypeCounts: Record<string, number>;
  mostConsumed: Array<{
    foodName: string;
    count: number;
    avgCalories: number | null;
  }>;
  waste: {
    totalWaste: number;
    totalCost: number;
    totalCarbon: number;
    mostWasted: Array<{
      foodName: string;
      totalQuantity: number;
      count: number;
    }>;
  } | null;
  pantry: { itemCount: number; expiringCount: number } | null;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const MEAL_TYPE_LABELS: Record<string, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACK: "Snack",
  DRINKS: "Drinks",
  OTHER: "Other",
};

const RANGE_LABELS: Record<TimeRange, string> = {
  week: "last 7 days",
  month: "last 30 days",
  year: "last 365 days",
  all: "all time",
};

export function PersonalProfileContent({
  user,
  range,
  foodStats,
}: {
  user: ProfileUser;
  range: TimeRange;
  foodStats: FoodStats;
}) {
  const isAdmin = user.role === "admin";
  const {
    totalMeals,
    logsInRange,
    avgCaloriesPerMeal,
    nutrients,
    recentLogs,
    mealTypeCounts,
    mostConsumed,
    waste,
    pantry,
  } = foodStats;
  const rangeLabel = RANGE_LABELS[range];

  const now = new Date();
  const todayStr = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const dateRangeLabel =
    range === "all"
      ? `up to ${todayStr}`
      : `${new Date(
          now.getTime() -
            (range === "week" ? 7 : range === "month" ? 30 : 365) *
              24 *
              60 *
              60 *
              1000,
        ).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })} — ${todayStr}`;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Time range filter */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm text-muted-foreground">
            Showing data for{" "}
            <span className="font-medium text-foreground">{rangeLabel}</span>
          </h2>
          <p className="text-xs text-muted-foreground">{dateRangeLabel}</p>
        </div>
        <ProfileTimeFilter active={range} />
      </div>

      {/* Profile + Account details */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Identity card */}
        <Card className="md:col-span-1">
          <CardContent className="flex flex-col items-center gap-4 pt-8 pb-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="text-2xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="text-xl font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Badge
              variant={isAdmin ? "default" : "secondary"}
              className="gap-1"
            >
              {isAdmin ? (
                <ShieldCheck className="size-3" />
              ) : (
                <Shield className="size-3" />
              )}
              {isAdmin ? "Admin" : "User"}
            </Badge>
          </CardContent>
        </Card>

        {/* Details card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center gap-3">
              <User className="size-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="text-sm font-medium">{user.name}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Mail className="size-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              {isAdmin ? (
                <ShieldCheck className="size-4 text-muted-foreground shrink-0" />
              ) : (
                <Shield className="size-4 text-muted-foreground shrink-0" />
              )}
              <div>
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="text-sm font-medium capitalize">{user.role}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <CalendarDays className="size-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="text-sm font-medium">
                  {new Date(user.createdAt).toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overview stat cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col gap-2 pt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <UtensilsCrossed className="size-4" />
              <span className="text-xs font-medium">Total Meals Logged</span>
            </div>
            <p className="text-3xl font-bold">{totalMeals}</p>
            <p className="text-xs text-muted-foreground">{rangeLabel}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-2 pt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Flame className="size-4" />
              <span className="text-xs font-medium">Avg Calories / Meal</span>
            </div>
            <p className="text-3xl font-bold">
              {avgCaloriesPerMeal !== null ? avgCaloriesPerMeal : "—"}
            </p>
            <p className="text-xs text-muted-foreground">{rangeLabel}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-2 pt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="size-4" />
              <span className="text-xs font-medium">Pantry Items</span>
            </div>
            <p className="text-3xl font-bold">{pantry?.itemCount ?? "—"}</p>
            {pantry && pantry.expiringCount > 0 && (
              <p className="flex items-center gap-1 text-xs text-orange-500">
                <AlertTriangle className="size-3" />
                {pantry.expiringCount} expiring soon
              </p>
            )}
            {pantry && pantry.expiringCount === 0 && (
              <p className="text-xs text-muted-foreground">
                none expiring soon
              </p>
            )}
            {!pantry && (
              <p className="text-xs text-muted-foreground">no data</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-2 pt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trash2 className="size-4" />
              <span className="text-xs font-medium">Food Wasted</span>
            </div>
            <p className="text-3xl font-bold">
              {waste ? `${waste.totalWaste.toFixed(1)} kg` : "—"}
            </p>
            {waste && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Leaf className="size-3" />
                {waste.totalCarbon.toFixed(1)} kg CO₂
              </p>
            )}
            {!waste && <p className="text-xs text-muted-foreground">no data</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent meal logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-4" />
              Recent Meals ({rangeLabel})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No meals logged recently.
              </p>
            ) : (
              <ul className="divide-y">
                {recentLogs.map((log) => (
                  <li
                    key={log.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{log.mealName}</p>
                      <p className="text-xs text-muted-foreground">
                        {MEAL_TYPE_LABELS[log.typeOfMeal] ?? log.typeOfMeal} ·{" "}
                        {new Date(log.timestamp).toLocaleDateString("en-GB", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    {log.calories !== null && (
                      <Badge variant="outline" className="shrink-0">
                        {log.calories} kcal
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Meal type breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="size-4" />
              Meal Type Breakdown ({rangeLabel})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(mealTypeCounts).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No data for {rangeLabel}.
              </p>
            ) : (
              <ul className="space-y-3">
                {Object.entries(mealTypeCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => {
                    const total = Object.values(mealTypeCounts).reduce(
                      (s, n) => s + n,
                      0,
                    );
                    const pct = Math.round((count / total) * 100);
                    return (
                      <li key={type}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">
                            {MEAL_TYPE_LABELS[type] ?? type}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Nutrient breakdown — always shown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="size-4" />
            Avg Nutrients Per Meal ({rangeLabel})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!nutrients || logsInRange === 0 ? (
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">
                {totalMeals === 0
                  ? "No meals logged in this period."
                  : `${logsInRange} meal log${logsInRange !== 1 ? "s" : ""} found, but none have calorie or macro data attached.`}
              </p>
              <p className="text-xs text-muted-foreground">
                Make sure meals have calories and macronutrients set when
                logging.
              </p>
            </div>
          ) : (
            <>
              <ul className="space-y-3">
                {(
                  [
                    {
                      label: "Calories",
                      value: avgCaloriesPerMeal,
                      unit: "kcal",
                      max: 800,
                      color: "bg-orange-500",
                    },
                    {
                      label: "Protein",
                      value: nutrients.avgProteins,
                      unit: "g",
                      max: 50,
                      color: "bg-blue-500",
                    },
                    {
                      label: "Carbohydrates",
                      value: nutrients.avgCarbs,
                      unit: "g",
                      max: 100,
                      color: "bg-yellow-500",
                    },
                    {
                      label: "Fat",
                      value: nutrients.avgFat,
                      unit: "g",
                      max: 40,
                      color: "bg-red-400",
                    },
                    {
                      label: "Sugar",
                      value: nutrients.avgSugar,
                      unit: "g",
                      max: 30,
                      color: "bg-pink-400",
                    },
                  ] as {
                    label: string;
                    value: number | null;
                    unit: string;
                    max: number;
                    color: string;
                  }[]
                )
                  .filter((row) => (row.value ?? 0) > 0)
                  .map((row) => {
                    const pct = Math.min(
                      100,
                      Math.round(((row.value ?? 0) / row.max) * 100),
                    );
                    return (
                      <li key={row.label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{row.label}</span>
                          <span className="text-sm font-medium">
                            {row.value} {row.unit}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${row.color}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
              </ul>
              <p className="text-xs text-muted-foreground mt-4">
                Based on {nutrients.logsWithData} meal
                {nutrients.logsWithData !== 1 ? "s" : ""} with nutritional data
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Most consumed meals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="size-4" />
            Most Consumed Foods ({rangeLabel})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mostConsumed.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No meals logged in this period.
            </p>
          ) : (
            <ul className="divide-y">
              {mostConsumed.map((item, i) => (
                <li key={i} className="flex items-center justify-between py-2">
                  <p className="text-sm font-medium">{item.foodName}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.count}×</Badge>
                    {item.avgCalories !== null && (
                      <span className="text-xs text-muted-foreground">
                        {item.avgCalories} kcal avg
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Food waste section */}
      {waste && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="size-4" />
                Food Waste Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">
                    {waste.totalWaste.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">kg wasted</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    €{waste.totalCost.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    estimated cost
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {waste.totalCarbon.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">kg CO₂</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="size-4" />
                Most Wasted Foods
              </CardTitle>
            </CardHeader>
            <CardContent>
              {waste.mostWasted.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No waste recorded yet.
                </p>
              ) : (
                <ul className="divide-y">
                  {waste.mostWasted.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between py-2"
                    >
                      <p className="text-sm font-medium">{item.foodName}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{item.count}×</Badge>
                        <span className="text-xs text-muted-foreground">
                          {item.totalQuantity.toFixed(1)} kg
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
