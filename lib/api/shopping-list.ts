import { createApiMethod } from "./client";
import type {
  SlCategoryPopularity,
  SlClassification,
  SlCrossDimClassification,
  SlCrossDimNutrition,
  SlCrossDimPatterns,
  SlDemographicClassification,
  SlDemographicNutrition,
  SlDemographicPatterns,
  SlFoodGroups,
  SlItemPopularity,
  SlListPatterns,
  SlNutritionProfile,
  SlSummary,
  SlSustainability,
} from "@/lib/types";

export const shoppingListApi = {
  itemPopularity: createApiMethod<SlItemPopularity[]>(
    "/analytics/shopping-list/public/popularity",
  ),
  categoryPopularity: createApiMethod<SlCategoryPopularity[]>(
    "/analytics/shopping-list/public/category-popularity",
  ),
  listPatterns: createApiMethod<SlListPatterns[]>(
    "/analytics/shopping-list/public/patterns",
  ),
  nutritionProfile: createApiMethod<SlNutritionProfile[]>(
    "/analytics/shopping-list/public/nutrition-profile",
  ),
  sustainability: createApiMethod<SlSustainability[]>(
    "/analytics/shopping-list/public/sustainability",
  ),
  classification: createApiMethod<SlClassification[]>(
    "/analytics/shopping-list/public/classification",
  ),
  foodGroups: createApiMethod<SlFoodGroups[]>(
    "/analytics/shopping-list/public/food-groups",
  ),
  demographicPatterns: createApiMethod<SlDemographicPatterns[]>(
    "/analytics/shopping-list/public/demographic/patterns",
  ),
  demographicNutrition: createApiMethod<SlDemographicNutrition[]>(
    "/analytics/shopping-list/public/demographic/nutrition",
  ),
  demographicClassification: createApiMethod<SlDemographicClassification[]>(
    "/analytics/shopping-list/public/demographic/classification",
  ),
  crossDimPatterns: createApiMethod<SlCrossDimPatterns[]>(
    "/analytics/shopping-list/public/cross-dim/patterns",
  ),
  crossDimNutrition: createApiMethod<SlCrossDimNutrition[]>(
    "/analytics/shopping-list/public/cross-dim/nutrition",
  ),
  crossDimClassification: createApiMethod<SlCrossDimClassification[]>(
    "/analytics/shopping-list/public/cross-dim/classification",
  ),
  summary: createApiMethod<SlSummary>(
    "/analytics/shopping-list/public/summary",
  ),
};
