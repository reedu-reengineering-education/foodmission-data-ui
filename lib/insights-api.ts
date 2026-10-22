// Admin-only live insights (/analytics/admin/*), fetched through the
// /api/admin-insights proxy route which attaches the signed-in user's
// Keycloak token. Every insight returns the same envelope; the catalog
// lists the insights, breakdowns and labels for the codes in `row.group`.

import { useEffect, useState } from "react";

export interface InsightRow {
  /** NULL group values (e.g. missing event metadata) stay null. */
  group: Record<string, string | null>;
  values: Record<string, number | null>;
}

export interface InsightResponse {
  meta: {
    insight: string;
    breakdowns: string[];
    by: string | null;
    /** First week start and exclusive end (YYYY-MM-DD) for time series. */
    from: string | null;
    to: string | null;
    minGroupSize: number;
    /** Rows dropped because they represent too few users (or reveal one). */
    suppressedGroups: number;
    generatedAt: string;
  };
  rows: InsightRow[];
}

export interface LabelledValue {
  value: string;
  label: string;
}

export interface CatalogBreakdown {
  key: string;
  label: string;
  /** Ordered values for enum-like properties; null for free text. */
  values: LabelledValue[] | null;
  allowInTwoWay: boolean;
}

export interface CatalogInsight {
  id: string;
  area: "usage" | "learning";
  path: string;
  title: string;
  description: string;
  values: string[];
  timeSeries: boolean;
  by: string[] | null;
}

export interface Catalog {
  minGroupSize: number;
  maxBreakdowns: number;
  insights: CatalogInsight[];
  breakdowns: CatalogBreakdown[];
  dimensions: { code: string; name: string }[];
  levels: LabelledValue[];
  featureFamilies: string[];
  /** English names per code kind (dimension, topic, quest, mission, …). */
  labels: Record<string, Record<string, string>>;
}

export interface InsightParams {
  breakdown?: string;
  breakdown2?: string;
  by?: string;
  weeks?: number;
}

export class InsightApiError extends Error {
  constructor(public readonly status: number) {
    super(`Insights API ${status}`);
  }
}

async function getJson<T>(path: string, params: InsightParams = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const res = await fetch(`/api/admin-insights/${path}?${search}`);
  if (!res.ok) throw new InsightApiError(res.status);
  return res.json() as Promise<T>;
}

/** `path` is `<area>/<insight id>`, e.g. `learning/quiz-results`. */
export function fetchInsight(path: string, params: InsightParams = {}) {
  return getJson<InsightResponse>(path, params);
}

let catalogRequest: Promise<Catalog> | null = null;

/** Fetched once per page load; retried on the next call after a failure. */
export function fetchCatalog() {
  catalogRequest ??= getJson<Catalog>("catalog").catch((e) => {
    catalogRequest = null;
    throw e;
  });
  return catalogRequest;
}

// ── Hooks ─────────────────────────────────────────────────

export type Loadable<T> =
  | { status: "loading" }
  | { status: "error"; httpStatus: number }
  | { status: "ok"; data: T };

/** Loads `load()` whenever `key` changes; stale responses are dropped. */
function useLoad<T>(key: string, load: () => Promise<T>): Loadable<T> {
  const [state, setState] = useState<{ key: string; value: Loadable<T> }>();

  useEffect(() => {
    let cancelled = false;
    load()
      .then((data) => {
        if (!cancelled) setState({ key, value: { status: "ok", data } });
      })
      .catch((e) => {
        if (cancelled) return;
        const httpStatus = e instanceof InsightApiError ? e.status : 0;
        if (httpStatus !== 401 && httpStatus !== 403) {
          console.error(`Failed to load ${key}`, e);
        }
        setState({ key, value: { status: "error", httpStatus } });
      });
    return () => {
      cancelled = true;
    };
    // `key` identifies the request; `load` is a new closure every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state?.key === key ? state.value : { status: "loading" };
}

export function useInsight(path: string, params: InsightParams = {}) {
  const key = `${path}?${JSON.stringify(params)}`;
  return useLoad(key, () => fetchInsight(path, params));
}

export function useCatalog() {
  return useLoad("catalog", fetchCatalog);
}

// ── Labels ────────────────────────────────────────────────

/** Bucket the API uses for users that never filled in a property. */
export const UNKNOWN_BUCKET = "unknown";

/** "PREFER_NOT_TO_SAY" / "meal_logging" → "Prefer not to say" / "Meal logging". */
export function humanize(value: string) {
  const words = value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function displayName(type: "region" | "language", code: string) {
  try {
    return new Intl.DisplayNames(["en"], { type }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** Human label for a `row.group` value under `key`. */
export function groupLabel(
  catalog: Catalog,
  key: string,
  value: string | null,
): string {
  if (value === null) return "Not recorded";
  if (value === UNKNOWN_BUCKET) return "Not specified";
  const coded = catalog.labels[key]?.[value];
  if (coded) return coded;
  if (key === "dimension" && value === "none") return "None";
  if (key === "level") {
    return catalog.levels.find((l) => l.value === value)?.label ?? value;
  }
  if (key === "country") return displayName("region", value);
  if (key === "language") return displayName("language", value);
  const breakdown = catalog.breakdowns.find((b) => b.key === key);
  if (breakdown) {
    return breakdown.values?.find((v) => v.value === value)?.label ?? value;
  }
  if (key === "week" || key === "bucket" || key === "appVersion") return value;
  return humanize(value);
}

/** Column header for a group key or value name. */
export function columnLabel(catalog: Catalog, key: string) {
  const breakdown = catalog.breakdowns.find((b) => b.key === key);
  if (breakdown) return breakdown.label;
  return COLUMN_LABELS[key] ?? humanize(key);
}

const COLUMN_LABELS: Record<string, string> = {
  foodFact: "Food fact",
  sourceType: "Source",
  bucket: "XP balance",
  avgProgress: "Avg. progress",
  correctRate: "Correct",
  completionsByRule: "Completed by rule",
  completionsSelfReported: "Self-reported",
  failuresByUser: "Given up",
  failuresWithoutActivity: "Never active",
  xp: "XP",
  appVersion: "App version",
};

/** Formats a value cell; rates are 0–1, progress 0–100. */
export function formatValue(key: string, value: number | null) {
  if (value === null) return "–";
  if (key === "correctRate") return `${Math.round(value * 100)}%`;
  if (key === "avgProgress") return `${value.toFixed(0)}%`;
  return value.toLocaleString("en");
}

// ── Weeks ─────────────────────────────────────────────────

/** Week starts (YYYY-MM-DD) from `meta.from` up to `meta.to` (exclusive). */
export function weekStarts(meta: InsightResponse["meta"]): string[] {
  if (!meta.from || !meta.to) return [];
  const weeks: string[] = [];
  const end = new Date(`${meta.to}T00:00:00Z`);
  for (
    let d = new Date(`${meta.from}T00:00:00Z`);
    d < end;
    d.setUTCDate(d.getUTCDate() + 7)
  ) {
    weeks.push(d.toISOString().slice(0, 10));
  }
  return weeks;
}

export function formatWeek(weekStart: string) {
  return new Date(`${weekStart}T00:00:00Z`).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
