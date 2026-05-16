// Project-wide constants
import { MealType, Dimension } from "./types";

export const MEAL_TYPES = Object.values(MealType);
export const DIMENSIONS = Object.values(Dimension);

export const DIMENSION_LABELS: Record<Dimension, string> = {
  [Dimension.AgeGroup]: "Age Group",
  [Dimension.Gender]: "Gender",
  [Dimension.EducationLevel]: "Education Level",
  [Dimension.Region]: "Region",
  [Dimension.Country]: "Country",
};
