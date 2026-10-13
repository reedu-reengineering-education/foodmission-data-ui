// Admin-only live app usage, fetched through the /api/usage proxy route
// which attaches the signed-in user's Keycloak token.

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

/** Bucket value the API uses for users that never filled in the dimension. */
export const UNKNOWN_BUCKET = "unknown";

export interface UsageBreakdownRow {
  value: string;
  totalUsers: number;
  activeUsers: number;
}

export interface UsageOverview {
  generatedAt: string;
  totalUsers: number;
  activeUsers: { last1d: number; last7d: number; last30d: number };
  newUsers: { last7d: number; last30d: number };
  neverSeenUsers: number;
  /** 0–1; null when there are no monthly actives. */
  stickiness: { dauOverMau: number | null; wauOverMau: number | null };
  activeWindowDays: number;
  breakdowns: Record<UsageDimension, UsageBreakdownRow[]>;
}

export interface UsageTrendRow {
  weekStart: string;
  activeUsers: number;
  newUsers: number;
  totalUsers: number;
}

export interface UsageBreakdown {
  dimension: UsageDimension;
  activeWindowDays: number;
  rows: UsageBreakdownRow[];
}

export interface UsageTrendBreakdown {
  dimension: UsageDimension;
  /** Weeks or buckets without activity are omitted. */
  rows: { weekStart: string; value: string; activeUsers: number }[];
}

export class UsageApiError extends Error {
  constructor(public readonly status: number) {
    super(`Usage API ${status}`);
  }
}

async function get<T>(path: string, params: Record<string, string>) {
  const res = await fetch(`/api/usage/${path}?${new URLSearchParams(params)}`);
  if (!res.ok) throw new UsageApiError(res.status);
  return res.json() as Promise<T>;
}

export const usageApi = {
  overview(activeDays = 7) {
    return get<UsageOverview>("overview", { activeDays: String(activeDays) });
  },
  breakdown(dim: UsageDimension, activeDays = 7) {
    return get<UsageBreakdown>("breakdown", {
      dim,
      activeDays: String(activeDays),
    });
  },
  trend(weeks = 12) {
    return get<UsageTrendRow[]>("trend", { weeks: String(weeks) });
  },
  trendBreakdown(dim: UsageDimension, weeks = 12) {
    return get<UsageTrendBreakdown>("trend/breakdown", {
      dim,
      weeks: String(weeks),
    });
  },
};
