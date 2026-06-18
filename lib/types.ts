// Types and interfaces for the entire project

export enum MealType {
  BREAKFAST = "BREAKFAST",
  LUNCH = "LUNCH",
  DINNER = "DINNER",
  SNACK = "SNACK",
  SPECIAL_DRINKS = "SPECIAL_DRINKS",
}

export enum Dimension {
  AgeGroup = "ageGroup",
  Gender = "gender",
  EducationLevel = "educationLevel",
  Region = "region",
  Country = "country",
}

export interface AnalyticsFilters {
  periodStart?: string;
  periodEnd?: string;
  typeOfMeal?: string;
}

export interface DemographicFilters extends AnalyticsFilters {
  dimension?: string;
}

export interface CrossDimFilters extends AnalyticsFilters {
  dim1?: string;
  dim2?: string;
}

export interface AnalyticsValueMetadata {
  valueUnit: string;
  entityUnit: string;
}

export interface AnalyticsCapabilities {
  supportsNutrition: boolean;
  supportsDemographicNutrition: boolean;
  supportsCrossDimNutrition: boolean;
  supportsClassification: boolean;
  supportsRecords: boolean;
  supportedDimensions: string[];
  privacyThresholds: {
    singleDimMinUsers: number;
    crossDimMinUsers: number;
  };
}

export interface AnalyticsSummaryMetadata {
  capabilities?: AnalyticsCapabilities;
}

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

export interface DemographicNutrition extends DailyNutrition {
  dimensionName: string;
  dimensionValue: string;
}

export interface DemographicClassification extends MealClassification {
  dimensionName: string;
  dimensionValue: string;
}

export interface DemographicPatterns extends MealPatterns {
  dimensionName: string;
  dimensionValue: string;
}

export interface CrossDimNutrition extends Omit<DailyNutrition, "date"> {
  date: string;
  dim1Name: string;
  dim1Value: string;
  dim2Name: string;
  dim2Value: string;
}

export interface CrossDimClassification extends Omit<MealClassification, "date"> {
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

export interface AnalyticsSummary {
  period: { from: string | null; to: string | null };
  metadata?: AnalyticsSummaryMetadata;
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

// ── Shopping List Analytics ─────────────────────────────────

export interface ShoppingListFilters {
  periodStart?: string;
  periodEnd?: string;
  dimension?: string;
  dim1?: string;
  dim2?: string;
}

export interface SlItemPopularity {
  id: string;
  date: string;
  foodName: string;
  foodGroup: string | null;
  itemType: string; // "food_product" | "generic_food"
  frequency: number;
  uniqueUsers: number;
  avgQuantity: number;
  predominantUnit: string;
}

export interface SlCategoryPopularity {
  id: string;
  date: string;
  category: string;
  frequency: number;
  uniqueUsers: number;
}

export interface SlListPatterns {
  id: string;
  date: string;
  userCount: number;
  totalLists: number;
  avgItemsPerList: number;
  avgListsPerUser: number | null;
  foodProductPct: number | null;
  genericFoodPct: number | null;
}

export interface SlNutritionProfile {
  id: string;
  date: string;
  userCount: number;
  itemCount: number;
  avgCaloriesPer100g: number | null;
  avgProteinsPer100g: number | null;
  avgFatPer100g: number | null;
  avgCarbsPer100g: number | null;
  avgFiberPer100g: number | null;
  avgSodiumPer100g: number | null;
  avgSugarPer100g: number | null;
  avgSaturatedFatPer100g: number | null;
  p25CaloriesPer100g: number | null;
  p50CaloriesPer100g: number | null;
  p75CaloriesPer100g: number | null;
}

export interface SlSustainability {
  id: string;
  date: string;
  userCount: number;
  itemCount: number;
  avgSustainabilityScore?: number | null;
  avgCarbonFootprint: number | null;
  vegetarianItemPct: number | null;
  veganItemPct: number | null;
  avgUltraProcessedPct: number | null;
  nutriScoreDistribution: Record<string, number> | null;
  ecoScoreDistribution: Record<string, number> | null;
  novaDistribution: Record<string, number> | null;
}

export interface SlFoodGroups {
  id: string;
  date: string;
  foodGroup: string;
  frequency: number;
  uniqueUsers: number;
  avgQuantity: number;
  predominantUnit: string;
}

export interface SlDemographicPatterns extends SlListPatterns {
  dimensionName: string;
  dimensionValue: string;
}

export interface SlDemographicNutrition extends SlNutritionProfile {
  dimensionName: string;
  dimensionValue: string;
}

export interface SlDemographicClassification {
  id: string;
  date: string;
  dimensionName: string;
  dimensionValue: string;
  userCount: number;
  vegetarianItemPct: number | null;
  veganItemPct: number | null;
  avgUltraProcessedPct: number | null;
  p25UltraProcessedPct: number | null;
  p50UltraProcessedPct: number | null;
  p75UltraProcessedPct: number | null;
  novaDistribution: Record<string, number> | null;
}

export interface SlClassification {
  id: string;
  date: string;
  userCount: number;
  vegetarianPct: number | null;
  veganPct: number | null;
  avgUltraProcessedPct: number | null;
  p25UltraProcessedPct: number | null;
  p50UltraProcessedPct: number | null;
  p75UltraProcessedPct: number | null;
  novaDistribution: Record<string, number> | null;
  metadata?: AnalyticsValueMetadata;
}

export interface SlCrossDimPatterns extends Omit<SlListPatterns, "date"> {
  date: string;
  dim1Name: string;
  dim1Value: string;
  dim2Name: string;
  dim2Value: string;
}

export interface SlCrossDimNutrition extends Omit<SlNutritionProfile, "date"> {
  date: string;
  dim1Name: string;
  dim1Value: string;
  dim2Name: string;
  dim2Value: string;
}

export interface SlCrossDimClassification {
  id?: string;
  date: string;
  dim1Name: string;
  dim1Value: string;
  dim2Name: string;
  dim2Value: string;
  userCount: number;
  vegetarianItemPct: number | null;
  veganItemPct: number | null;
  avgUltraProcessedPct: number | null;
  novaDistribution: Record<string, number> | null;
}

// ── Recipe Analytics ─────────────────────────────────────────

export interface RecipeSummary {
  period: { from: string | null; to: string | null };
  totalRecipes: number;
  newRecipes7d: number;
  newRecipes30d: number;
  activeRecipes: number;
  archivedRecipes: number;
  avgRating: number;
  mostViewedRecipes: Array<{ title: string; viewCount: number }>;
  mostCookedRecipes: Array<{ title: string; cookCount: number }>;
  mostSavedRecipes: Array<{ title: string; savedCount: number }>;
  highestRatedRecipes: Array<{ title: string; rating: number; ratingCount: number }>;
  trendingRecipes: Array<{ title: string; trendScore: number }>;
}

export interface RecipeDietTrend {
  date: string;
  veganCount: number;
  vegetarianCount: number;
  pescatarianCount: number;
  meatBasedCount: number;
  glutenFreeCount: number;
  lactoseFreeCount: number;
  lowCarbCount: number;
  highProteinCount: number;
  ketoCount: number;
  totalRecipes: number;
}

export interface RecipeDietDistribution {
  label: string;
  count: number;
  pct: number;
}

export interface RecipeNutrition {
  date: string;
  recipeCount: number;
  avgCalories: number | null;
  avgProtein: number | null;
  avgCarbs: number | null;
  avgFat: number | null;
  avgFiber: number | null;
  avgSugar: number | null;
  avgSalt: number | null;
  avgNutriScore: number | null;
  nutriScoreDistribution: Record<string, number> | null;
  highestProteinRecipes: Array<{ title: string; protein: number }>;
  lowestCalorieRecipes: Array<{ title: string; calories: number }>;
}

export interface RecipeSustainability {
  date: string;
  recipeCount: number;
  avgEcoScore: number | null;
  avgSustainabilityScore: number | null;
  ecoScoreDistribution: Record<string, number> | null;
  plantBasedPct: number | null;
  animalBasedPct: number | null;
  avgCo2Footprint: number | null;
  avgWaterFootprint: number | null;
  seasonalIngredientPct: number | null;
  localIngredientPct: number | null;
}

export interface RecipeTopIngredient {
  ingredientName: string;
  category: string | null;
  usageCount: number;
  recipeCount: number;
}

export interface RecipeIngredientCategory {
  category: string;
  itemCount: number;
  recipeCount: number;
  pct: number;
}

export interface RecipeDiversityMetrics {
  uniqueIngredients: number;
  totalCuisines: number;
  cuisineDiversityScore: number;
  ingredientDiversityScore: number;
  recipesWithVegetablesPct: number;
  recipesWithLegumesPct: number;
  recipesWithWholeGrainsPct: number;
}

export interface RecipeCuisineTrend {
  cuisine: string;
  recipeCount: number;
  growthPct: number | null;
  savedCount: number;
  cookedCount: number;
  viewCount: number;
}

export interface RecipeCookingPatterns {
  date: string;
  recipeCount: number;
  avgCookTime: number | null;
  avgPrepTime: number | null;
  quickMealsPct: number | null;
  mediumMealsPct: number | null;
  longMealsPct: number | null;
}

export interface RecipeDifficultyDistribution {
  difficulty: string;
  count: number;
  pct: number;
}

export interface RecipeUsageAnalytics {
  date: string;
  recipesCooked: number;
  repeatCookedPct: number | null;
  oneTimePct: number | null;
  uniqueUsersCooked: number;
}

export interface SlSummary {
  period: { from: string | null; to: string | null };
  metadata?: AnalyticsSummaryMetadata;
  kpis?: {
    uniqueItemsTracked?: number | null;
    categoryCount?: number | null;
    foodGroupCount?: number | null;
  };
  uniqueItemsTracked?: number | null;
  categoryCount?: number | null;
  foodGroupCount?: number | null;
  topItems: { name: string; frequency: number; uniqueUsers: number }[];
  topCategories: { category: string; frequency: number; uniqueUsers: number }[];
  listPatterns: {
    dataPoints: number;
    avgItemsPerList: number | null;
    avgListsPerUser: number | null;
  };
  nutritionProfile: {
    dataPoints: number;
    latestAvgCaloriesPer100g: number | null;
    latestAvgProteinsPer100g: number | null;
  };
  sustainability: {
    dataPoints: number;
    avgCarbonFootprint: number | null;
    avgVegetarianItemPct: number | null;
    avgUltraProcessedPct: number | null;
  };
}
