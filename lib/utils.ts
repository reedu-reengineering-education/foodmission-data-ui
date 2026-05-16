import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { DemographicNutrition } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function aggregateDemographic(
  rows: DemographicNutrition[],
  dimKey: keyof DemographicNutrition,
): { label: string; users: number }[] {
  const agg: Record<string, number> = {};
  for (const r of rows) {
    const val = (r[dimKey] as string) ?? "Unknown";
    const label = val === "__null__" ? "Not specified" : val;
    agg[label] = Math.max(agg[label] ?? 0, r.userCount);
  }
  return Object.entries(agg)
    .map(([label, users]) => ({ label, users }))
    .sort((a, b) => b.users - a.users);
}
