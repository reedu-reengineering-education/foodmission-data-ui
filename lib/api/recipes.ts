import { createApiMethod } from "./client";
import type {
  RecipeSummary,
  RecipeDietTrend,
  RecipeDietDistribution,
  RecipeNutrition,
  RecipeSustainability,
  RecipeTopIngredient,
  RecipeIngredientCategory,
  RecipeDiversityMetrics,
  RecipeCuisineTrend,
  RecipeCookingPatterns,
  RecipeDifficultyDistribution,
  RecipeUsageAnalytics,
} from "@/lib/types";

export const recipeApi = {
  summary: createApiMethod<RecipeSummary>(
    "/analytics/recipes/public/summary",
  ),
  dietTrend: createApiMethod<RecipeDietTrend[]>(
    "/analytics/recipes/public/diet-trend",
  ),
  dietDistribution: createApiMethod<RecipeDietDistribution[]>(
    "/analytics/recipes/public/diet-distribution",
  ),
  nutrition: createApiMethod<RecipeNutrition[]>(
    "/analytics/recipes/public/nutrition",
  ),
  sustainability: createApiMethod<RecipeSustainability[]>(
    "/analytics/recipes/public/sustainability",
  ),
  topIngredients: createApiMethod<RecipeTopIngredient[]>(
    "/analytics/recipes/public/top-ingredients",
  ),
  ingredientCategories: createApiMethod<RecipeIngredientCategory[]>(
    "/analytics/recipes/public/ingredient-categories",
  ),
  diversityMetrics: createApiMethod<RecipeDiversityMetrics>(
    "/analytics/recipes/public/diversity",
  ),
  cuisineTrends: createApiMethod<RecipeCuisineTrend[]>(
    "/analytics/recipes/public/cuisine-trends",
  ),
  cookingPatterns: createApiMethod<RecipeCookingPatterns[]>(
    "/analytics/recipes/public/cooking-patterns",
  ),
  difficultyDistribution: createApiMethod<RecipeDifficultyDistribution[]>(
    "/analytics/recipes/public/difficulty",
  ),
  usageAnalytics: createApiMethod<RecipeUsageAnalytics[]>(
    "/analytics/recipes/public/usage",
  ),
};
