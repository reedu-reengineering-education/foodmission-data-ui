const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

export interface AnalyticsFilters {
  from?: string;
  to?: string;
  typeOfMeal?: string;
}

export interface DemographicFilters extends AnalyticsFilters {
  dimension?: string;
}

export interface CrossDimFilters extends AnalyticsFilters {
  dim1?: string;
  dim2?: string;
}

function buildParams(
  filters: Record<string, string | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  return params;
}

async function get<T>(path: string, params?: URLSearchParams): Promise<T> {
  const url = `${API_BASE}${path}${params?.toString() ? `?${params}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

// ── Standard aggregates ─────────────────────────────────────

export interface DailyNutrition {
  id: string;
  date: string;
  typeOfMeal: string;
  userCount: number;
  mealCount: number;
  avgCalories: number | null;
  avgProteins: number | null;
  avgFat: number | null;
  avgCarbs: number | null;
  avgFiber: number | null;
  avgSodium: number | null;
  avgSugar: number | null;
  avgSaturatedFat: number | null;
  p25Calories: number | null;
  p50Calories: number | null;
  p75Calories: number | null;
}

export interface FoodPopularity {
  id: string;
  date: string;
  foodName: string;
  foodGroup: string | null;
  itemType: string;
  frequency: number;
  uniqueUsers: number;
  avgQuantity: number;
  predominantUnit: string;
}

export interface MealPatterns {
  id: string;
  date: string;
  typeOfMeal: string;
  userCount: number;
  totalMeals: number;
  mealsFromPantryCount: number;
  mealsFromPantryPct: number;
  mealsEatenOutCount: number;
  mealsEatenOutPct: number;
  avgItemsPerMeal: number;
  avgMealHour: number | null;
  mealHourStdDev: number | null;
}

export interface Sustainability {
  id: string;
  date: string;
  typeOfMeal: string;
  userCount: number;
  avgSustainabilityScore: number | null;
  avgCarbonFootprint: number | null;
  nutriScoreDistribution: Record<string, number> | null;
  ecoScoreDistribution: Record<string, number> | null;
}

export interface MealClassification {
  id: string;
  date: string;
  typeOfMeal: string;
  userCount: number;
  totalMeals: number;
  vegetarianCount: number;
  vegetarianPct: number;
  veganCount: number;
  veganPct: number;
  avgUltraProcessedPct: number | null;
  p25UltraProcessedPct: number | null;
  p50UltraProcessedPct: number | null;
  p75UltraProcessedPct: number | null;
  novaDistribution: Record<string, number> | null;
}

export interface MealRecord {
  id: string;
  weeksSinceRegistration: number;
  typeOfMeal: string;
  totalCalories: number | null;
  totalProteins: number | null;
  totalFat: number | null;
  totalCarbs: number | null;
  totalFiber: number | null;
  totalSodium: number | null;
  totalSugar: number | null;
  totalSaturatedFat: number | null;
  nutriScoreGrade: string | null;
  ecoScoreGrade: string | null;
  novaGroupMode: number | null;
  ultraProcessedPct: number | null;
  sustainabilityScore: number | null;
  totalCarbonFootprint: number | null;
  isVegetarian: boolean;
  isVegan: boolean;
  itemCount: number;
}

// ── Demographic ─────────────────────────────────────────────

export interface DemographicNutrition extends DailyNutrition {
  ageGroup: string | null;
  gender: string | null;
  educationLevel: string | null;
  region: string | null;
  country: string | null;
}

export interface DemographicClassification extends MealClassification {
  ageGroup: string | null;
  gender: string | null;
  educationLevel: string | null;
  region: string | null;
  country: string | null;
}

export interface DemographicPatterns extends MealPatterns {
  ageGroup: string | null;
  gender: string | null;
  educationLevel: string | null;
  region: string | null;
  country: string | null;
}

// ── Cross-dimensional ───────────────────────────────────────

export interface CrossDimNutrition extends Omit<DailyNutrition, "date"> {
  date: string;
  dim1Name: string;
  dim1Value: string;
  dim2Name: string;
  dim2Value: string;
}

export interface CrossDimClassification extends Omit<
  MealClassification,
  "date"
> {
  date: string;
  dim1Name: string;
  dim1Value: string;
  dim2Name: string;
  dim2Value: string;
}

export interface CrossDimPatterns extends Omit<MealPatterns, "date"> {
  date: string;
  dim1Name: string;
  dim1Value: string;
  dim2Name: string;
  dim2Value: string;
}

// ── Summary ─────────────────────────────────────────────────

export interface AnalyticsSummary {
  period: { from: string | null; to: string | null };
  nutrition: {
    dataPoints: number;
    latestAvgCalories: number | null;
    latestAvgProteins: number | null;
    latestAvgFat: number | null;
    latestAvgCarbs: number | null;
  };
  topFoods: { name: string; frequency: number; uniqueUsers: number }[];
  mealPatterns: {
    dataPoints: number;
    avgPantryUsagePct: number | null;
    avgItemsPerMeal: number | null;
  };
  sustainability: {
    dataPoints: number;
    avgSustainabilityScore: number | null;
  };
  classification: {
    dataPoints: number;
    avgVegetarianPct: number | null;
    avgVeganPct: number | null;
    avgUltraProcessedPct: number | null;
  };
}

// ── Fetch functions ─────────────────────────────────────────

export const analyticsApi = {
  nutrition(f: AnalyticsFilters = {}) {
    return get<DailyNutrition[]>(
      "/analytics/meal-log/public/nutrition",
      buildParams({ ...f }),
    );
  },
  foodPopularity(f: AnalyticsFilters & { limit?: string } = {}) {
    return get<FoodPopularity[]>(
      "/analytics/meal-log/public/food-popularity",
      buildParams({ ...f }),
    );
  },
  mealPatterns(f: AnalyticsFilters = {}) {
    return get<MealPatterns[]>(
      "/analytics/meal-log/public/patterns",
      buildParams({ ...f }),
    );
  },
  sustainability(f: AnalyticsFilters = {}) {
    return get<Sustainability[]>(
      "/analytics/meal-log/public/sustainability",
      buildParams({ ...f }),
    );
  },
  mealClassification(f: AnalyticsFilters = {}) {
    return get<MealClassification[]>(
      "/analytics/meal-log/public/classification",
      buildParams({ ...f }),
    );
  },
  mealRecords(f: AnalyticsFilters = {}) {
    return get<MealRecord[]>(
      "/analytics/meal-log/public/records",
      buildParams({ ...f }),
    );
  },
  demographicNutrition(f: DemographicFilters = {}) {
    return get<DemographicNutrition[]>(
      "/analytics/meal-log/public/demographic/nutrition",
      buildParams({ ...f }),
    );
  },
  demographicClassification(f: DemographicFilters = {}) {
    return get<DemographicClassification[]>(
      "/analytics/meal-log/public/demographic/classification",
      buildParams({ ...f }),
    );
  },
  demographicPatterns(f: DemographicFilters = {}) {
    return get<DemographicPatterns[]>(
      "/analytics/meal-log/public/demographic/patterns",
      buildParams({ ...f }),
    );
  },
  crossDimNutrition(f: CrossDimFilters = {}) {
    return get<CrossDimNutrition[]>(
      "/analytics/meal-log/public/cross-dim/nutrition",
      buildParams({ ...f }),
    );
  },
  crossDimClassification(f: CrossDimFilters = {}) {
    return get<CrossDimClassification[]>(
      "/analytics/meal-log/public/cross-dim/classification",
      buildParams({ ...f }),
    );
  },
  crossDimPatterns(f: CrossDimFilters = {}) {
    return get<CrossDimPatterns[]>(
      "/analytics/meal-log/public/cross-dim/patterns",
      buildParams({ ...f }),
    );
  },
  summary(f: Pick<AnalyticsFilters, "from" | "to"> = {}) {
    return get<AnalyticsSummary>(
      "/analytics/meal-log/public/summary",
      buildParams({ ...f }),
    );
  },
};

// ── Constants ───────────────────────────────────────────────

export const MEAL_TYPES = [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACK",
  "SPECIAL_DRINKS",
] as const;

export const DIMENSIONS = [
  "ageGroup",
  "gender",
  "educationLevel",
  "region",
  "country",
] as const;

export const DIMENSION_LABELS: Record<string, string> = {
  ageGroup: "Age Group",
  gender: "Gender",
  educationLevel: "Education Level",
  region: "Region",
  country: "Country",
};
