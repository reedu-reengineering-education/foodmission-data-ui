export const SCORE_GRADES = ["A", "B", "C", "D", "E"] as const;

type Distribution = Record<string, number> | null | undefined;

export interface WeightedClassificationLike {
  date: string;
  totalMeals: number;
  vegetarianPct: number;
  veganPct: number;
  avgUltraProcessedPct: number | null;
}

function roundTo(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function normalizeGradeTotals(raw: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw)) {
    const normalized = key.trim().toUpperCase();
    out[normalized] = (out[normalized] ?? 0) + value;
  }
  return out;
}

export function aggregateDistribution<T>(
  rows: T[],
  pickDistribution: (row: T) => Distribution,
): Record<string, number> {
  const raw: Record<string, number> = {};
  for (const row of rows) {
    const distribution = pickDistribution(row);
    if (!distribution) continue;
    for (const [key, value] of Object.entries(distribution)) {
      raw[key] = (raw[key] ?? 0) + value;
    }
  }
  return raw;
}

export function buildGradeSeries(
  normalizedTotals: Record<string, number>,
  grades: readonly string[] = SCORE_GRADES,
): Array<{ grade: string; count: number }> {
  return grades
    .map((grade) => ({ grade, count: normalizedTotals[grade] ?? 0 }))
    .filter((row) => row.count > 0);
}

export function buildGradeTrend<T>(
  rows: T[],
  pickDate: (row: T) => string,
  pickDistribution: (row: T) => Distribution,
): Array<Record<string, string | number>> {
  const trendByDate: Record<string, Record<string, number>> = {};

  for (const row of rows) {
    const distribution = pickDistribution(row);
    if (!distribution) continue;

    const date = pickDate(row).slice(0, 10);
    if (!trendByDate[date]) trendByDate[date] = {};

    for (const [key, value] of Object.entries(distribution)) {
      const normalized = key.trim().toUpperCase();
      trendByDate[date][normalized] = (trendByDate[date][normalized] ?? 0) + value;
    }
  }

  return Object.entries(trendByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({ date, ...values }));
}

export function buildNovaSeries<T>(
  rows: T[],
  pickDistribution: (row: T) => Distribution,
): Array<{ group: string; count: number }> {
  const totals = aggregateDistribution(rows, pickDistribution);

  return ["1", "2", "3", "4"]
    .map((group) => ({ group: `Group ${group}`, count: totals[group] ?? 0 }))
    .filter((row) => row.count > 0);
}

export function buildWeightedClassificationByGroup<T extends WeightedClassificationLike>(
  rows: T[],
  pickGroupKey: (row: T) => string,
): Array<{ key: string; vegetarianPct: number; veganPct: number; ultraProcessedPct: number | null }> {
  const grouped: Record<
    string,
    {
      vegetarianWeightedSum: number;
      veganWeightedSum: number;
      ultraWeightedSum: number;
      meals: number;
      ultraMeals: number;
    }
  > = {};

  for (const row of rows) {
    const key = pickGroupKey(row);
    if (!grouped[key]) {
      grouped[key] = {
        vegetarianWeightedSum: 0,
        veganWeightedSum: 0,
        ultraWeightedSum: 0,
        meals: 0,
        ultraMeals: 0,
      };
    }

    const bucket = grouped[key];
    bucket.vegetarianWeightedSum += row.vegetarianPct * row.totalMeals;
    bucket.veganWeightedSum += row.veganPct * row.totalMeals;

    if (row.avgUltraProcessedPct != null) {
      bucket.ultraWeightedSum += row.avgUltraProcessedPct * row.totalMeals;
      bucket.ultraMeals += row.totalMeals;
    }

    bucket.meals += row.totalMeals;
  }

  return Object.entries(grouped).map(([key, bucket]) => ({
    key,
    vegetarianPct: roundTo(bucket.vegetarianWeightedSum / (bucket.meals || 1), 1),
    veganPct: roundTo(bucket.veganWeightedSum / (bucket.meals || 1), 1),
    ultraProcessedPct:
      bucket.ultraMeals > 0 ? roundTo(bucket.ultraWeightedSum / bucket.ultraMeals, 1) : null,
  }));
}

export function buildShoppingSustainabilityTrend<T extends {
  date: string;
  avgCarbonFootprint: number | null;
  vegetarianItemPct: number | null;
  veganItemPct: number | null;
  avgUltraProcessedPct: number | null;
}>(rows: T[]): Array<{
  date: string;
  avgCarbonFootprint: number;
  vegetarianItemPct: number;
  veganItemPct: number;
  avgUltraProcessedPct: number;
}> {
  return [...rows]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((row) => ({
      date: row.date.slice(0, 10),
      avgCarbonFootprint: roundTo(row.avgCarbonFootprint ?? 0, 2),
      vegetarianItemPct: roundTo(row.vegetarianItemPct ?? 0, 1),
      veganItemPct: roundTo(row.veganItemPct ?? 0, 1),
      avgUltraProcessedPct: roundTo(row.avgUltraProcessedPct ?? 0, 1),
    }));
}
