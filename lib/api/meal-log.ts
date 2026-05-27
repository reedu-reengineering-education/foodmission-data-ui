import { createApiMethod } from "./client";
import type {
  AnalyticsSummary,
  CrossDimClassification,
  CrossDimNutrition,
  CrossDimPatterns,
  DailyNutrition,
  DemographicClassification,
  DemographicNutrition,
  DemographicPatterns,
  FoodPopularity,
  MealClassification,
  MealPatterns,
  MealRecord,
  Sustainability,
} from "@/lib/types";

export const analyticsApi = {
  nutrition: createApiMethod<DailyNutrition[]>(
    "/analytics/meal-log/public/nutrition",
  ),
  foodPopularity: createApiMethod<FoodPopularity[]>(
    "/analytics/meal-log/public/popularity",
  ),
  mealPatterns: createApiMethod<MealPatterns[]>(
    "/analytics/meal-log/public/patterns",
  ),
  sustainability: createApiMethod<Sustainability[]>(
    "/analytics/meal-log/public/sustainability",
  ),
  mealClassification: createApiMethod<MealClassification[]>(
    "/analytics/meal-log/public/classification",
  ),
  mealRecords: createApiMethod<MealRecord[]>(
    "/analytics/meal-log/public/records",
  ),
  demographicNutrition: createApiMethod<DemographicNutrition[]>(
    "/analytics/meal-log/public/demographic/nutrition",
  ),
  demographicClassification: createApiMethod<DemographicClassification[]>(
    "/analytics/meal-log/public/demographic/classification",
  ),
  demographicPatterns: createApiMethod<DemographicPatterns[]>(
    "/analytics/meal-log/public/demographic/patterns",
  ),
  crossDimNutrition: createApiMethod<CrossDimNutrition[]>(
    "/analytics/meal-log/public/cross-dim/nutrition",
  ),
  crossDimClassification: createApiMethod<CrossDimClassification[]>(
    "/analytics/meal-log/public/cross-dim/classification",
  ),
  crossDimPatterns: createApiMethod<CrossDimPatterns[]>(
    "/analytics/meal-log/public/cross-dim/patterns",
  ),
  summary: createApiMethod<AnalyticsSummary>(
    "/analytics/meal-log/public/summary",
  ),
};
