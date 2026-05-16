
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";


import {
  DailyNutrition,
  FoodPopularity,
  MealPatterns,
  Sustainability,
  MealClassification,
  MealRecord,
  DemographicNutrition,
  DemographicClassification,
  DemographicPatterns,
  CrossDimNutrition,
  CrossDimClassification,
  CrossDimPatterns,
  AnalyticsSummary,
  SlItemPopularity,
  SlCategoryPopularity,
  SlListPatterns,
  SlNutritionProfile,
  SlSustainability,
  SlFoodGroups,
  SlDemographicPatterns,
  SlDemographicNutrition,
  SlCrossDimPatterns,
  SlCrossDimNutrition,
  SlSummary,
} from "./types";

// ...types moved to analytics-types.ts


function buildParams(filters: Record<string, string | undefined>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  }
  return params;
}


/**
 * Generic GET request for analytics API
 * @param path API endpoint path
 * @param params Optional URLSearchParams
 */
async function get<T>(path: string, params?: URLSearchParams): Promise<T> {
  const url = `${API_BASE}${path}${params?.toString() ? `?${params}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) {
    let errorText = "";
    try {
      errorText = await res.text();
    } catch {}
    throw new Error(`API ${res.status}: ${res.statusText}${errorText ? ` - ${errorText}` : ""}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Factory for API methods
 */
function createApiMethod<T>(path: string) {
  return (filters: Record<string, string | undefined> = {}) =>
    get<T>(path, buildParams(filters));
}

// ── Standard aggregates ─────────────────────────────────────

// ...types moved to analytics-types.ts

// ...types moved to analytics-types.ts

// ...types moved to analytics-types.ts

// ...types moved to analytics-types.ts

// ...types moved to analytics-types.ts

// ...types moved to analytics-types.ts

// ── Demographic ─────────────────────────────────────────────

// ...types moved to analytics-types.ts

// ...types moved to analytics-types.ts

// ...types moved to analytics-types.ts

// ── Cross-dimensional ───────────────────────────────────────

// ...types moved to analytics-types.ts

// ...types moved to analytics-types.ts

// ...types moved to analytics-types.ts

// ── Summary ─────────────────────────────────────────────────

// ...types moved to analytics-types.ts

// ── Fetch functions ─────────────────────────────────────────


export const analyticsApi = {
  nutrition: createApiMethod<DailyNutrition[]>("/analytics/meal-log/public/nutrition"),
  foodPopularity: createApiMethod<FoodPopularity[]>("/analytics/meal-log/public/food-popularity"),
  mealPatterns: createApiMethod<MealPatterns[]>("/analytics/meal-log/public/patterns"),
  sustainability: createApiMethod<Sustainability[]>("/analytics/meal-log/public/sustainability"),
  mealClassification: createApiMethod<MealClassification[]>("/analytics/meal-log/public/classification"),
  mealRecords: createApiMethod<MealRecord[]>("/analytics/meal-log/public/records"),
  demographicNutrition: createApiMethod<DemographicNutrition[]>("/analytics/meal-log/public/demographic/nutrition"),
  demographicClassification: createApiMethod<DemographicClassification[]>("/analytics/meal-log/public/demographic/classification"),
  demographicPatterns: createApiMethod<DemographicPatterns[]>("/analytics/meal-log/public/demographic/patterns"),
  crossDimNutrition: createApiMethod<CrossDimNutrition[]>("/analytics/meal-log/public/cross-dim/nutrition"),
  crossDimClassification: createApiMethod<CrossDimClassification[]>("/analytics/meal-log/public/cross-dim/classification"),
  crossDimPatterns: createApiMethod<CrossDimPatterns[]>("/analytics/meal-log/public/cross-dim/patterns"),
  summary: createApiMethod<AnalyticsSummary>("/analytics/meal-log/public/summary"),
};

// ── Shopping List API ───────────────────────────────────────

export const shoppingListApi = {
  itemPopularity: createApiMethod<SlItemPopularity[]>("/analytics/shopping-list/public/item-popularity"),
  categoryPopularity: createApiMethod<SlCategoryPopularity[]>("/analytics/shopping-list/public/category-popularity"),
  listPatterns: createApiMethod<SlListPatterns[]>("/analytics/shopping-list/public/list-patterns"),
  nutritionProfile: createApiMethod<SlNutritionProfile[]>("/analytics/shopping-list/public/nutrition-profile"),
  sustainability: createApiMethod<SlSustainability[]>("/analytics/shopping-list/public/sustainability"),
  foodGroups: createApiMethod<SlFoodGroups[]>("/analytics/shopping-list/public/food-groups"),
  demographicPatterns: createApiMethod<SlDemographicPatterns[]>("/analytics/shopping-list/public/demographic/patterns"),
  demographicNutrition: createApiMethod<SlDemographicNutrition[]>("/analytics/shopping-list/public/demographic/nutrition"),
  crossDimPatterns: createApiMethod<SlCrossDimPatterns[]>("/analytics/shopping-list/public/cross-dim/patterns"),
  crossDimNutrition: createApiMethod<SlCrossDimNutrition[]>("/analytics/shopping-list/public/cross-dim/nutrition"),
  summary: createApiMethod<SlSummary>("/analytics/shopping-list/public/summary"),
};

// ── Constants ───────────────────────────────────────────────


// ...constants moved to analytics-constants.ts
