"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, CalendarDays, UserPlus, Users } from "lucide-react";
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
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { Map } from "@/components/ui/map";
import { CountryChoropleth } from "@/components/country-choropleth";
import { COUNTRY_INFO } from "@/lib/constants";
import {
  usageApi,
  UsageApiError,
  UNKNOWN_BUCKET,
  USAGE_DIMENSIONS,
  USAGE_DIMENSION_LABELS,
  type UsageBreakdown,
  type UsageBreakdownRow,
  type UsageDimension,
  type UsageOverview,
  type UsageTrendBreakdown,
  type UsageTrendRow,
} from "@/lib/usage-api";

const ACTIVE_WINDOW_DAYS = 7;
const TREND_WEEKS = 12;
const MAX_BREAKDOWN_BARS = 8;
const MONTHLY_WINDOW_DAYS = 30;
const MAX_TREND_SERIES = 5;
const OTHER_KEY = "other";

// Fixed categorical order; MAX_TREND_SERIES must not exceed its length.
const SERIES_COLORS = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
];

const AGE_GROUP_ORDER = [
  "under_18",
  "18_24",
  "25_34",
  "35_44",
  "45_54",
  "55_64",
  "65_plus",
];

// ── Label helpers ─────────────────────────────────────────

function displayName(type: "region" | "language", code: string) {
  try {
    return new Intl.DisplayNames(["en"], { type }).of(code) ?? code;
  } catch {
    return code;
  }
}

function formatBucket(dimension: UsageDimension, value: string) {
  if (value === UNKNOWN_BUCKET) return "Not specified";
  switch (dimension) {
    case "country":
      return displayName("region", value);
    case "language":
      return displayName("language", value);
    case "ageGroup":
      return value === "under_18"
        ? "<18"
        : value === "65_plus"
          ? "65+"
          : value.replace("_", "–");
    case "gender":
      return (
        value.charAt(0) + value.slice(1).toLowerCase().replaceAll("_", " ")
      );
  }
}

function formatPct(ratio: number | null) {
  return ratio === null ? "–" : `${Math.round(ratio * 100)}%`;
}

function formatWeek(weekStart: string) {
  return new Date(weekStart).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function breakdownChartData(
  dimension: UsageDimension,
  rows: UsageBreakdownRow[],
) {
  const sorted =
    dimension === "ageGroup"
      ? [...rows].sort(
          (a, b) =>
            (AGE_GROUP_ORDER.indexOf(a.value) + 1 || Infinity) -
            (AGE_GROUP_ORDER.indexOf(b.value) + 1 || Infinity),
        )
      : rows;
  return sorted.slice(0, MAX_BREAKDOWN_BARS).map((r) => ({
    label: formatBucket(dimension, r.value),
    active: r.activeUsers,
    total: r.totalUsers,
  }));
}

interface CountryRow {
  code: string;
  name: string;
  totalUsers: number;
  active7d: number;
  active30d: number;
}

function countryRows(
  rows7d: UsageBreakdownRow[],
  rows30d: UsageBreakdownRow[],
): CountryRow[] {
  const active30d = new globalThis.Map(
    rows30d.map((r) => [r.value, r.activeUsers] as const),
  );
  return rows7d
    .map((r) => ({
      code: r.value,
      name: COUNTRY_INFO[r.value]?.name ?? formatBucket("country", r.value),
      totalUsers: r.totalUsers,
      active7d: r.activeUsers,
      active30d: active30d.get(r.value) ?? 0,
    }))
    .sort(
      (a, b) =>
        b.active30d - a.active30d ||
        b.totalUsers - a.totalUsers ||
        a.name.localeCompare(b.name),
    );
}

/**
 * One row per week with the top buckets (by weekly actives summed over the
 * period) as series and everything else folded into "Other".
 */
function weeklySplitChart(trend: UsageTrendRow[], split: UsageTrendBreakdown) {
  const sums: Record<string, number> = {};
  for (const r of split.rows) {
    sums[r.value] = (sums[r.value] ?? 0) + r.activeUsers;
  }
  const top = Object.entries(sums)
    .sort(([, a], [, b]) => b - a)
    .slice(0, MAX_TREND_SERIES)
    .map(([value]) => value);
  if (split.dimension === "ageGroup") {
    top.sort(
      (a, b) =>
        (AGE_GROUP_ORDER.indexOf(a) + 1 || Infinity) -
        (AGE_GROUP_ORDER.indexOf(b) + 1 || Infinity),
    );
  }
  const hasOther = Object.keys(sums).length > top.length;
  const keys = hasOther ? [...top, OTHER_KEY] : top;

  const byWeek: Record<string, Record<string, number>> = {};
  for (const r of split.rows) {
    const key = top.includes(r.value) ? r.value : OTHER_KEY;
    const week = (byWeek[new Date(r.weekStart).toISOString()] ??= {});
    week[key] = (week[key] ?? 0) + r.activeUsers;
  }

  const data = trend.map((t) => {
    const week = byWeek[new Date(t.weekStart).toISOString()] ?? {};
    return {
      week: formatWeek(t.weekStart),
      ...Object.fromEntries(keys.map((k) => [k, week[k] ?? 0])),
    };
  });
  const config = Object.fromEntries(
    keys.map((k, i) => [
      k,
      {
        label: k === OTHER_KEY ? "Other" : formatBucket(split.dimension, k),
        color:
          k === OTHER_KEY
            ? "var(--series-other)"
            : SERIES_COLORS[i],
      },
    ]),
  );
  return { data, keys, config };
}

// ── Sub-components ────────────────────────────────────────

function KpiCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string;
  hint: string;
  icon: typeof Users;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription>{title}</CardDescription>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

type TrendSplit = "total" | UsageDimension;

function WeeklyActiveCard({ trend }: { trend: UsageTrendRow[] }) {
  const [split, setSplit] = useState<TrendSplit>("total");
  const [splits, setSplits] = useState<
    Partial<Record<UsageDimension, UsageTrendBreakdown>>
  >({});
  const [failed, setFailed] = useState<Partial<Record<UsageDimension, true>>>(
    {},
  );

  const selected = split === "total" ? undefined : splits[split];

  useEffect(() => {
    if (split === "total" || splits[split]) return;
    let cancelled = false;
    usageApi
      .trendBreakdown(split, TREND_WEEKS)
      .then((data) => {
        if (!cancelled) setSplits((prev) => ({ ...prev, [split]: data }));
      })
      .catch((e) => {
        if (cancelled) return;
        console.error("Failed to fetch weekly usage split", e);
        setFailed((prev) => ({ ...prev, [split]: true }));
      });
    return () => {
      cancelled = true;
    };
  }, [split, splits]);

  const totalChart = trend.map((r) => ({
    week: formatWeek(r.weekStart),
    active: r.activeUsers,
    new: r.newUsers,
  }));
  const splitChart = selected && weeklySplitChart(trend, selected);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="grid gap-1.5">
          <CardTitle>Active Users per Week</CardTitle>
          <CardDescription>
            Last {TREND_WEEKS} weeks (Monday start, UTC); current week is
            partial
            {split !== "total" &&
              `. Top ${MAX_TREND_SERIES} ${USAGE_DIMENSION_LABELS[split].toLowerCase()} values, rest grouped as Other`}
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-1">
          {(["total", ...USAGE_DIMENSIONS] as const).map((option) => (
            <Button
              key={option}
              size="xs"
              variant={split === option ? "default" : "outline"}
              onClick={() => setSplit(option)}
            >
              {option === "total" ? "Total" : USAGE_DIMENSION_LABELS[option]}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {split === "total" ? (
          <ChartContainer
            config={{
              active: { label: "Active", color: "var(--series-1)" },
              new: { label: "New", color: "var(--series-2)" },
            }}
            className="h-[300px] w-full"
          >
            <LineChart data={totalChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="active"
                stroke="var(--series-1)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="new"
                stroke="var(--series-2)"
                strokeWidth={2}
              />
            </LineChart>
          </ChartContainer>
        ) : splitChart ? (
          <ChartContainer
            config={splitChart.config}
            className="h-[300px] w-full"
          >
            <LineChart data={splitChart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              {splitChart.keys.map((k) => (
                <Line
                  key={k}
                  type="monotone"
                  dataKey={k}
                  stroke={`var(--color-${k})`}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ChartContainer>
        ) : failed[split] ? (
          <p className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            Could not load the weekly split.
          </p>
        ) : (
          <Skeleton className="h-[300px] w-full" />
        )}
      </CardContent>
    </Card>
  );
}

function BreakdownCard({
  dimension,
  rows,
  activeWindowDays,
}: {
  dimension: UsageDimension;
  rows: UsageBreakdownRow[];
  activeWindowDays: number;
}) {
  const data = breakdownChartData(dimension, rows);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{USAGE_DIMENSION_LABELS[dimension]}</CardTitle>
        <CardDescription>
          Active ({activeWindowDays}d) vs. registered users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            active: { label: "Active", color: "var(--series-1)" },
            total: { label: "Registered", color: "var(--series-other)" },
          }}
          className="h-[250px]"
        >
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              tick={{ fontSize: 11 }}
              allowDecimals={false}
            />
            <YAxis
              dataKey="label"
              type="category"
              width={100}
              tick={{ fontSize: 10 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="active" fill="var(--series-1)" radius={[0, 4, 4, 0]} />
            <Bar dataKey="total" fill="var(--series-other)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      {rows.length > MAX_BREAKDOWN_BARS && (
        <CardFooter className="text-xs text-muted-foreground">
          Top {MAX_BREAKDOWN_BARS} of {rows.length}
        </CardFooter>
      )}
    </Card>
  );
}

// ── Main component ────────────────────────────────────────

type State =
  | { status: "loading" }
  | { status: "unauthorized" | "forbidden" | "error" }
  | {
      status: "ok";
      overview: UsageOverview;
      trend: UsageTrendRow[];
      countries30d: UsageBreakdown;
    };

/**
 * Live app usage (active/new users) from the admin-only usage API.
 * Unlike the rest of the dashboard this is not published aggregation data,
 * so the page is only shown to signed-in admins.
 */
export function AppUsageContent() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      usageApi.overview(ACTIVE_WINDOW_DAYS),
      usageApi.trend(TREND_WEEKS),
      usageApi.breakdown("country", MONTHLY_WINDOW_DAYS),
    ])
      .then(([overview, trend, countries30d]) => {
        if (!cancelled) {
          setState({ status: "ok", overview, trend, countries30d });
        }
      })
      .catch((e) => {
        if (cancelled) return;
        const status = e instanceof UsageApiError ? e.status : 0;
        setState({
          status:
            status === 401
              ? "unauthorized"
              : status === 403
                ? "forbidden"
                : "error",
        });
        if (status !== 401 && status !== 403) {
          console.error("Failed to fetch usage data", e);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const heading = (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">App Analytics</h2>
      <p className="text-muted-foreground">
        Live user activity (admin only, not anonymised)
      </p>
    </div>
  );

  if (state.status === "loading") {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {heading}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  if (state.status !== "ok") {
    const message = {
      unauthorized: (
        <>
          <Link href="/sign-in" className="underline underline-offset-4">
            Sign in
          </Link>{" "}
          with an admin account to see live app usage.
        </>
      ),
      forbidden: "Live app usage is only available to admins.",
      error: "Could not load live app usage.",
    }[state.status];
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {heading}
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            {message}
          </CardContent>
        </Card>
      </div>
    );
  }

  const { overview, trend, countries30d } = state;
  const countries = countryRows(overview.breakdowns.country, countries30d.rows);
  const countryMap = countries
    .filter((c) => c.code !== UNKNOWN_BUCKET)
    .map((c) => ({
      country: c.name,
      code: COUNTRY_INFO[c.code]?.iso3 ?? c.code,
      users: c.totalUsers,
      active: c.active30d,
    }));

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {heading}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Registered Users"
          value={overview.totalUsers.toLocaleString()}
          hint={`${overview.neverSeenUsers.toLocaleString()} never seen`}
          icon={Users}
        />
        <KpiCard
          title="Daily Active"
          value={overview.activeUsers.last1d.toLocaleString()}
          hint={`DAU/MAU ${formatPct(overview.stickiness.dauOverMau)}`}
          icon={Activity}
        />
        <KpiCard
          title="Weekly / Monthly Active"
          value={`${overview.activeUsers.last7d.toLocaleString()} / ${overview.activeUsers.last30d.toLocaleString()}`}
          hint={`WAU/MAU ${formatPct(overview.stickiness.wauOverMau)}`}
          icon={CalendarDays}
        />
        <KpiCard
          title="New Users"
          value={overview.newUsers.last7d.toLocaleString()}
          hint={`Last 7 days · ${overview.newUsers.last30d.toLocaleString()} in 30 days`}
          icon={UserPlus}
        />
      </div>

      <WeeklyActiveCard trend={trend} />

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4 p-0 overflow-hidden min-h-[400px]">
          <Map center={[10, 50]} zoom={3.5} projection={{ type: "mercator" }}>
            <CountryChoropleth data={countryMap} />
          </Map>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Users by Country</CardTitle>
            <CardDescription>
              Registered users and users active in the last{" "}
              {overview.activeWindowDays} / {countries30d.activeWindowDays} days
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[320px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2 text-left font-medium">Country</th>
                  <th className="py-2 text-right font-medium">Registered</th>
                  <th className="py-2 text-right font-medium">
                    Active {overview.activeWindowDays}d
                  </th>
                  <th className="py-2 text-right font-medium">
                    Active {countries30d.activeWindowDays}d
                  </th>
                </tr>
              </thead>
              <tbody>
                {countries.map((c) => (
                  <tr key={c.code} className="border-b last:border-0">
                    <td className="py-2">{c.name}</td>
                    <td className="py-2 text-right tabular-nums">
                      {c.totalUsers.toLocaleString()}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {c.active7d.toLocaleString()}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {c.active30d.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {USAGE_DIMENSIONS.filter((dim) => dim !== "country").map((dim) => (
          <BreakdownCard
            key={dim}
            dimension={dim}
            rows={overview.breakdowns[dim]}
            activeWindowDays={overview.activeWindowDays}
          />
        ))}
      </div>
    </div>
  );
}
