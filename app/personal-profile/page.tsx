import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PersonalProfileContent } from "@/components/personal-profile-content";
import type { TimeRange } from "@/components/profile-time-filter";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

async function apiFetch<T>(path: string, token: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

function getRangeDates(range: TimeRange): {
  dateFrom: string | null;
  dateTo: string | null;
} {
  const now = new Date();
  if (range === "all") return { dateFrom: null, dateTo: null };
  const dateTo = now.toISOString().split("T")[0];
  const daysBack = range === "week" ? 7 : range === "month" ? 30 : 365;
  const from = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  return { dateFrom: from.toISOString().split("T")[0], dateTo };
}

interface MealLog {
  id: string;
  typeOfMeal: string;
  timestamp: string;
  mealFromPantry: boolean;
  eatenOut: boolean;
  meal?: {
    name: string;
    calories?: number;
    proteins?: number;
    sustainabilityScore?: number;
    nutritionalInfo?: {
      carbs?: number;
      fats?: number;
      sugar?: number;
    };
  };
}

interface MealLogsResponse {
  data: MealLog[];
  total: number;
  page: number;
  limit: number;
}

interface WasteStats {
  totalWaste: number;
  totalCost: number;
  totalCarbon: number;
  mostWastedFoods: Array<{
    foodName: string;
    totalQuantity: number;
    count: number;
  }>;
}

interface PantryItem {
  id: string;
  expiryDate?: string;
}

interface PantryResponse {
  id: string;
  userId: string;
  items: PantryItem[];
}

const VALID_RANGES: TimeRange[] = ["week", "month", "year", "all"];

export default async function PersonalProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in?callbackUrl=/personal-profile");
  }

  const { range: rawRange } = await searchParams;
  const range: TimeRange = VALID_RANGES.includes(rawRange as TimeRange)
    ? (rawRange as TimeRange)
    : "all";

  const token = session.user.accessToken;
  const { dateFrom, dateTo } = getRangeDates(range);

  // Build query strings — empty string means no date filter (all time)
  const dateQuery =
    dateFrom && dateTo
      ? `&dateFrom=${dateFrom}&dateTo=${dateTo}`
      : dateTo && range !== "all"
        ? `&dateTo=${dateTo}`
        : "";
  const wasteQuery =
    dateFrom && dateTo ? `?dateFrom=${dateFrom}&dateTo=${dateTo}` : "";

  const [filteredLogsRes, wasteStats, pantry] = token
    ? await Promise.all([
        apiFetch<MealLogsResponse>(`/meal-logs?limit=50${dateQuery}`, token),
        apiFetch<WasteStats>(`/food-waste/statistics${wasteQuery}`, token),
        apiFetch<PantryResponse>(`/pantry`, token),
      ])
    : [null, null, null];

  const now2 = new Date();
  const expiringCount =
    pantry?.items.filter((item) => {
      if (!item.expiryDate) return false;
      const diff = new Date(item.expiryDate).getTime() - now2.getTime();
      return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
    }).length ?? 0;

  const totalMeals = filteredLogsRes?.total ?? 0;
  const filteredLogs = filteredLogsRes?.data ?? [];

  // Only average over meals that actually have a calories value
  const logsWithCalories = filteredLogs.filter(
    (l) => (l.meal?.calories ?? 0) > 0,
  );
  const n = logsWithCalories.length;
  const avgCalories =
    n > 0
      ? Math.round(
          logsWithCalories.reduce(
            (sum, l) => sum + (l.meal?.calories ?? 0),
            0,
          ) / n,
        )
      : null;

  const nutrients =
    n > 0
      ? {
          avgProteins:
            Math.round(
              (logsWithCalories.reduce(
                (s, l) => s + (l.meal?.proteins ?? 0),
                0,
              ) /
                n) *
                10,
            ) / 10,
          avgCarbs:
            Math.round(
              (logsWithCalories.reduce(
                (s, l) => s + (l.meal?.nutritionalInfo?.carbs ?? 0),
                0,
              ) /
                n) *
                10,
            ) / 10,
          avgFat:
            Math.round(
              (logsWithCalories.reduce(
                (s, l) => s + (l.meal?.nutritionalInfo?.fats ?? 0),
                0,
              ) /
                n) *
                10,
            ) / 10,
          avgSugar:
            Math.round(
              (logsWithCalories.reduce(
                (s, l) => s + (l.meal?.nutritionalInfo?.sugar ?? 0),
                0,
              ) /
                n) *
                10,
            ) / 10,
          logsWithData: n,
        }
      : null;

  const mealTypeCounts: Record<string, number> = {};
  for (const log of filteredLogs) {
    mealTypeCounts[log.typeOfMeal] = (mealTypeCounts[log.typeOfMeal] ?? 0) + 1;
  }

  // Most consumed meals by name
  const mealCounts: Record<
    string,
    { count: number; totalCalories: number; logsWithCal: number }
  > = {};
  for (const log of filteredLogs) {
    const name = log.meal?.name ?? "Unknown meal";
    if (!mealCounts[name])
      mealCounts[name] = { count: 0, totalCalories: 0, logsWithCal: 0 };
    mealCounts[name].count += 1;
    if ((log.meal?.calories ?? 0) > 0) {
      mealCounts[name].totalCalories += log.meal!.calories!;
      mealCounts[name].logsWithCal += 1;
    }
  }
  const mostConsumed = Object.entries(mealCounts)
    .map(([foodName, v]) => ({
      foodName,
      count: v.count,
      avgCalories:
        v.logsWithCal > 0 ? Math.round(v.totalCalories / v.logsWithCal) : null,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">FOODMISSION Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Personal Profile</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <PersonalProfileContent
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          role: session.user.role,
          createdAt: session.user.createdAt,
        }}
        range={range}
        foodStats={{
          totalMeals,
          logsInRange: filteredLogs.length,
          avgCaloriesPerMeal: avgCalories,
          nutrients,
          recentLogs: filteredLogs.slice(0, 5).map((l) => ({
            id: l.id,
            typeOfMeal: l.typeOfMeal,
            timestamp: l.timestamp,
            mealName: l.meal?.name ?? "Unknown meal",
            calories: l.meal?.calories ?? null,
          })),
          mealTypeCounts,
          mostConsumed,
          waste: wasteStats
            ? {
                totalWaste: wasteStats.totalWaste,
                totalCost: wasteStats.totalCost,
                totalCarbon: wasteStats.totalCarbon,
                mostWasted: wasteStats.mostWastedFoods.slice(0, 5),
              }
            : null,
          pantry: pantry
            ? { itemCount: pantry.items.length, expiringCount }
            : null,
        }}
      />
    </SidebarInset>
  );
}
