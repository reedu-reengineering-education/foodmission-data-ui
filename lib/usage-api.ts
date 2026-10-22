// Admin-only live app usage: the /analytics/admin/usage/* insights mapped
// onto the shapes the App Analytics page renders.

import {
  fetchInsight,
  UNKNOWN_BUCKET,
  type InsightParams,
} from "@/lib/insights-api";

export const USAGE_DIMENSIONS = [
  "country",
  "ageGroup",
  "gender",
  "language",
] as const;

export type UsageDimension = (typeof USAGE_DIMENSIONS)[number];

export const USAGE_DIMENSION_LABELS: Record<UsageDimension, string> = {
  country: "Country",
  ageGroup: "Age Group",
  gender: "Gender",
  language: "Language",
};

export { UNKNOWN_BUCKET };

export interface UsageTotals {
  totalUsers: number;
  activeUsers: { last1d: number; last7d: number; last30d: number };
  newUsers: { last7d: number; last30d: number };
  /** 0–1; null when there are no monthly actives. */
  stickiness: { dauOverMau: number | null; wauOverMau: number | null };
}

export interface UsageBreakdownRow {
  value: string;
  totalUsers: number;
  active7d: number;
  active30d: number;
}

export interface UsageBreakdown {
  dimension: UsageDimension;
  rows: UsageBreakdownRow[];
  /** Groups below `minGroupSize` users, plus their complements, are left out. */
  suppressedGroups: number;
  minGroupSize: number;
}

export interface UsageTrendRow {
  weekStart: string;
  activeUsers: number;
  newUsers: number;
  totalUsers: number;
}

export interface UsageTrendBreakdown {
  dimension: UsageDimension;
  rows: { weekStart: string; value: string; activeUsers: number }[];
}

function get(path: string, params: InsightParams = {}) {
  return fetchInsight(`usage/${path}`, params);
}

const num = (value: number | null | undefined) => value ?? 0;

export const usageApi = {
  async totals(): Promise<UsageTotals> {
    const { rows } = await get("users");
    const v = rows[0]?.values ?? {};
    return {
      totalUsers: num(v.users),
      activeUsers: {
        last1d: num(v.active1d),
        last7d: num(v.active7d),
        last30d: num(v.active30d),
      },
      newUsers: { last7d: num(v.new7d), last30d: num(v.new30d) },
      stickiness: {
        dauOverMau: v.dauOverMau ?? null,
        wauOverMau: v.wauOverMau ?? null,
      },
    };
  },
  async breakdown(dimension: UsageDimension): Promise<UsageBreakdown> {
    const { meta, rows } = await get("users", { breakdown: dimension });
    return {
      dimension,
      rows: rows.map((r) => ({
        value: r.group[dimension] ?? UNKNOWN_BUCKET,
        totalUsers: num(r.values.users),
        active7d: num(r.values.active7d),
        active30d: num(r.values.active30d),
      })),
      suppressedGroups: meta.suppressedGroups,
      minGroupSize: meta.minGroupSize,
    };
  },
  async trend(weeks = 12): Promise<UsageTrendRow[]> {
    const { rows } = await get("weekly-activity", { weeks });
    return rows.map((r) => ({
      weekStart: r.group.week ?? "",
      activeUsers: num(r.values.activeUsers),
      newUsers: num(r.values.newUsers),
      totalUsers: num(r.values.totalUsers),
    }));
  },
  async trendBreakdown(
    dimension: UsageDimension,
    weeks = 12,
  ): Promise<UsageTrendBreakdown> {
    const { rows } = await get("weekly-activity", {
      breakdown: dimension,
      weeks,
    });
    return {
      dimension,
      rows: rows.map((r) => ({
        weekStart: r.group.week ?? "",
        value: r.group[dimension] ?? UNKNOWN_BUCKET,
        activeUsers: num(r.values.activeUsers),
      })),
    };
  },
};
