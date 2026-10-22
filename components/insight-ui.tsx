"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  columnLabel,
  formatValue,
  groupLabel,
  type Catalog,
  type InsightResponse,
  type Loadable,
} from "@/lib/insights-api";

/** Fixed categorical order; series beyond it fold into "Other". */
export const SERIES_COLORS = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
];
export const OTHER_COLOR = "var(--series-other)";
export const OTHER_KEY = "other";

export function OptionButtons<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1">
      {options.map((option) => (
        <Button
          key={option.value}
          size="xs"
          variant={value === option.value ? "default" : "outline"}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

export type View = "chart" | "table";

export const VIEW_OPTIONS = [
  { value: "chart", label: "Chart" },
  { value: "table", label: "Table" },
] as const satisfies readonly { value: View; label: string }[];

/** Card frame shared by every insight: title, controls, body, notes. */
export function InsightCard({
  title,
  description,
  controls,
  footer,
  className,
  children,
}: {
  title: string;
  description?: ReactNode;
  controls?: ReactNode;
  footer?: (string | null | false | undefined)[];
  className?: string;
  children: ReactNode;
}) {
  const notes = (footer ?? []).filter(Boolean);
  return (
    <Card className={className}>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="grid gap-1.5">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {controls && <div className="flex flex-wrap gap-2">{controls}</div>}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {notes.length > 0 && (
        <CardFooter className="text-xs text-muted-foreground">
          {notes.join(" · ")}
        </CardFooter>
      )}
    </Card>
  );
}

/** Loading skeleton, error text or nothing, for a not-yet-ok result. */
export function LoadState({
  result,
  height = 260,
}: {
  result: Loadable<unknown>;
  height?: number;
}) {
  if (result.status === "loading") {
    return <Skeleton className="w-full" style={{ height }} />;
  }
  if (result.status === "error") {
    return (
      <p
        className="flex items-center justify-center text-sm text-muted-foreground"
        style={{ height }}
      >
        {result.httpStatus === 403
          ? "Only available to admins."
          : "Could not load this insight."}
      </p>
    );
  }
  return null;
}

export function EmptyState({ height = 260 }: { height?: number }) {
  return (
    <p
      className="flex items-center justify-center text-sm text-muted-foreground"
      style={{ height }}
    >
      No data yet.
    </p>
  );
}

export function suppressedNote(meta: InsightResponse["meta"]) {
  const n = meta.suppressedGroups;
  return n > 0
    ? `${n} small group${n === 1 ? "" : "s"} hidden (fewer than ${meta.minGroupSize} users, or revealing one)`
    : null;
}

/**
 * Every row of an insight as a table: group columns first (in the order
 * the API returns them), then the requested value columns.
 */
export function InsightTable({
  catalog,
  response,
  values,
  maxHeight = 360,
}: {
  catalog: Catalog;
  response: InsightResponse;
  values: readonly string[];
  maxHeight?: number;
}) {
  if (response.rows.length === 0) return <EmptyState height={120} />;
  const groupKeys = Object.keys(response.rows[0].group);
  return (
    <div className="overflow-auto" style={{ maxHeight }}>
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-card text-muted-foreground">
          <tr className="border-b">
            {groupKeys.map((key) => (
              <th key={key} className="py-2 pr-3 text-left font-medium">
                {columnLabel(catalog, key)}
              </th>
            ))}
            {values.map((key) => (
              <th
                key={key}
                className="py-2 pl-3 text-right font-medium whitespace-nowrap"
              >
                {columnLabel(catalog, key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {response.rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {groupKeys.map((key) => (
                <td key={key} className="py-2 pr-3">
                  {groupLabel(catalog, key, row.group[key] ?? null)}
                </td>
              ))}
              {values.map((key) => (
                <td key={key} className="py-2 pl-3 text-right tabular-nums">
                  {formatValue(key, row.values[key] ?? null)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Sums `value` per series key and keeps the `max` largest in `order` (or by
 * size), so colors follow the entity; the rest fold into {@link OTHER_KEY}.
 * Only for additive values (counts of events or entries, not of users).
 */
export function topSeries(
  totals: Map<string, number>,
  max = SERIES_COLORS.length,
  order?: (a: string, b: string) => number,
) {
  const top = [...totals.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, max)
    .map(([key]) => key);
  if (order) top.sort(order);
  return { top, hasOther: totals.size > top.length };
}
