"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  EmptyState,
  InsightCard,
  LoadState,
  OptionButtons,
  OTHER_COLOR,
  OTHER_KEY,
  SERIES_COLORS,
  suppressedNote,
  topSeries,
} from "@/components/insight-ui";
import {
  formatWeek,
  humanize,
  UNKNOWN_BUCKET,
  useInsight,
  weekStarts,
  type InsightResponse,
} from "@/lib/insights-api";

const SESSION_WEEKS = 12;
const FEATURE_WEEKS = 8;

// ── Sessions ──────────────────────────────────────────────

type SessionSplit = "total" | "platform" | "appVersion";

const SESSION_SPLITS = [
  { value: "total", label: "Total" },
  { value: "platform", label: "Platform" },
  { value: "appVersion", label: "App version" },
] as const;

const PLATFORM_LABELS: Record<string, string> = {
  ios: "iOS",
  android: "Android",
  web: "Web",
};
const PLATFORM_ORDER = Object.keys(PLATFORM_LABELS);

function sessionLabel(split: SessionSplit, value: string) {
  if (value === OTHER_KEY) return "Other";
  if (value === UNKNOWN_BUCKET) return "Not reported";
  return split === "platform" ? (PLATFORM_LABELS[value] ?? value) : value;
}

/** Platforms in a fixed order; app versions newest first. */
function sessionOrder(split: SessionSplit) {
  if (split === "platform") {
    return (a: string, b: string) =>
      (PLATFORM_ORDER.indexOf(a) + 1 || Infinity) -
      (PLATFORM_ORDER.indexOf(b) + 1 || Infinity);
  }
  return (a: string, b: string) => b.localeCompare(a, "en", { numeric: true });
}

function sessionChart(response: InsightResponse, split: SessionSplit) {
  const weeks = weekStarts(response.meta);
  if (split === "total") {
    const byWeek = new Map(response.rows.map((r) => [r.group.week, r.values]));
    return {
      keys: ["sessions", "users"],
      config: {
        sessions: { label: "Sessions", color: SERIES_COLORS[0] },
        users: { label: "Users with a session", color: SERIES_COLORS[1] },
      } satisfies ChartConfig,
      data: weeks.map((week) => ({
        week: formatWeek(week),
        sessions: byWeek.get(week)?.sessions ?? 0,
        users: byWeek.get(week)?.users ?? 0,
      })),
    };
  }

  // Sessions are additive, so small series can fold into "Other".
  const totals = new Map<string, number>();
  for (const r of response.rows) {
    const key = r.group[split] ?? UNKNOWN_BUCKET;
    totals.set(key, (totals.get(key) ?? 0) + (r.values.sessions ?? 0));
  }
  const { top, hasOther } = topSeries(totals, undefined, sessionOrder(split));
  const keys = hasOther ? [...top, OTHER_KEY] : top;
  const byWeek = new Map<string, Record<string, number>>();
  for (const r of response.rows) {
    const raw = r.group[split] ?? UNKNOWN_BUCKET;
    const key = top.includes(raw) ? raw : OTHER_KEY;
    const week = byWeek.get(r.group.week ?? "") ?? {};
    week[key] = (week[key] ?? 0) + (r.values.sessions ?? 0);
    byWeek.set(r.group.week ?? "", week);
  }
  return {
    keys,
    config: Object.fromEntries(
      keys.map((k, i) => [
        k,
        {
          label: sessionLabel(split, k),
          color: k === OTHER_KEY ? OTHER_COLOR : SERIES_COLORS[i],
        },
      ]),
    ) satisfies ChartConfig,
    data: weeks.map((week) => ({
      week: formatWeek(week),
      ...Object.fromEntries(keys.map((k) => [k, byWeek.get(week)?.[k] ?? 0])),
    })),
  };
}

export function SessionsCard() {
  const [split, setSplit] = useState<SessionSplit>("total");
  const result = useInsight("usage/sessions", {
    by: split,
    weeks: SESSION_WEEKS,
  });

  const response = result.status === "ok" ? result.data : null;
  const chart = response && sessionChart(response, split);
  const thisWeek = response?.rows.filter(
    (r) => r.group.week === weekStarts(response.meta).at(-1),
  );
  const sessionsThisWeek = thisWeek?.reduce(
    (sum, r) => sum + (r.values.sessions ?? 0),
    0,
  );

  return (
    <InsightCard
      title="App Sessions per Week"
      description={
        split === "total"
          ? `App opens in the last ${SESSION_WEEKS} weeks; current week is partial`
          : `Sessions by ${split === "platform" ? "platform" : "app version"}; top ${SERIES_COLORS.length}, rest grouped as Other`
      }
      controls={
        <OptionButtons
          label="Split sessions by"
          options={SESSION_SPLITS}
          value={split}
          onChange={setSplit}
        />
      }
      footer={[
        sessionsThisWeek !== undefined &&
          `${sessionsThisWeek.toLocaleString("en")} sessions this week`,
        response && suppressedNote(response.meta),
      ]}
    >
      {!response || !chart ? (
        <LoadState result={result} height={280} />
      ) : response.rows.length === 0 ? (
        <EmptyState height={280} />
      ) : (
        <ChartContainer config={chart.config} className="h-[280px] w-full">
          <LineChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {chart.keys.map((k) => (
              <Line
                key={k}
                type="monotone"
                dataKey={k}
                stroke={`var(--color-${k})`}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      )}
    </InsightCard>
  );
}

// ── Feature usage ─────────────────────────────────────────

type FeatureMeasure = "users" | "events";

const FEATURE_MEASURES = [
  { value: "users", label: "Users" },
  { value: "events", label: "Events" },
] as const;

/**
 * Families × weeks as a heatmap: users are not additive across weeks or
 * families, so a matrix shows every cell without a misleading total.
 */
export function FeatureUsageCard() {
  const [measure, setMeasure] = useState<FeatureMeasure>("users");
  const result = useInsight("usage/feature-usage", { weeks: FEATURE_WEEKS });

  const response = result.status === "ok" ? result.data : null;
  const weeks = response ? weekStarts(response.meta) : [];
  const cells = new Map<string, number>();
  const familyTotals = new Map<string, number>();
  for (const r of response?.rows ?? []) {
    const family = r.group.family ?? "other";
    const value = r.values[measure] ?? 0;
    cells.set(`${family}|${r.group.week}`, value);
    familyTotals.set(
      family,
      (familyTotals.get(family) ?? 0) + (r.values.events ?? 0),
    );
  }
  // Most used features first, by events over the whole window.
  const families = [...familyTotals.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([family]) => family);
  const max = Math.max(1, ...cells.values());

  return (
    <InsightCard
      title="Feature Usage"
      description={`${measure === "users" ? "Distinct users" : "Events"} per feature and week, last ${FEATURE_WEEKS} weeks; current week is partial`}
      controls={
        <OptionButtons
          label="Measure"
          options={FEATURE_MEASURES}
          value={measure}
          onChange={setMeasure}
        />
      }
    >
      {!response ? (
        <LoadState result={result} height={280} />
      ) : families.length === 0 ? (
        <EmptyState height={280} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0.5 text-xs">
            <thead className="text-muted-foreground">
              <tr>
                <th className="pr-2 text-left font-medium">Feature</th>
                {weeks.map((week) => (
                  <th
                    key={week}
                    className="px-1 text-center font-medium whitespace-nowrap"
                  >
                    {formatWeek(week)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {families.map((family) => (
                <tr key={family}>
                  <th
                    scope="row"
                    className="pr-2 text-left font-normal whitespace-nowrap"
                  >
                    {humanize(family)}
                  </th>
                  {weeks.map((week) => {
                    const value = cells.get(`${family}|${week}`);
                    const share = value ? value / max : 0;
                    return (
                      <td
                        key={week}
                        title={`${humanize(family)}, week of ${formatWeek(week)}: ${(value ?? 0).toLocaleString("en")} ${measure}`}
                        className={`h-8 min-w-11 rounded-sm text-center tabular-nums ${share > 0.55 ? "text-white" : "text-foreground"}`}
                        style={{
                          background: value
                            ? `color-mix(in oklab, var(--series-1) ${Math.round(12 + share * 78)}%, transparent)`
                            : "var(--muted)",
                        }}
                      >
                        {value ? value.toLocaleString("en") : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </InsightCard>
  );
}
