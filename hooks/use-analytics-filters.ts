import { useState } from "react";
import { Dimension } from "@/lib/types";

export interface AnalyticsFilterState {
  periodStart: string;
  setPeriodStart: (v: string) => void;
  periodEnd: string;
  setPeriodEnd: (v: string) => void;
  typeOfMeal: string;
  setTypeOfMeal: (v: string) => void;
}

/** Base filter state: periodStart, periodEnd, typeOfMeal */
export function useAnalyticsFilters(): AnalyticsFilterState {
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [typeOfMeal, setTypeOfMeal] = useState("");
  return { periodStart, setPeriodStart, periodEnd, setPeriodEnd, typeOfMeal, setTypeOfMeal };
}

/** Filter state with an additional demographic dimension */
export function useAnalyticsFiltersWithDimension(defaultDimension: Dimension = Dimension.AgeGroup) {
  const base = useAnalyticsFilters();
  const [dimension, setDimension] = useState<Dimension>(defaultDimension);
  return { ...base, dimension, setDimension };
}

/** Filter state with two cross-dimensional selectors */
export function useAnalyticsFiltersWithCrossDim(
  defaultDim1: Dimension = Dimension.AgeGroup,
  defaultDim2: Dimension = Dimension.Gender,
) {
  const base = useAnalyticsFilters();
  const [dim1, setDim1] = useState<Dimension>(defaultDim1);
  const [dim2, setDim2] = useState<Dimension>(defaultDim2);
  return { ...base, dim1, setDim1, dim2, setDim2 };
}

/**
 * Filter state for shopping list analytics — no typeOfMeal,
 * but includes both a single dimension and cross-dim selectors.
 */
export function useShoppingListFilters(
  defaultDimension: Dimension = Dimension.AgeGroup,
  defaultDim1: Dimension = Dimension.AgeGroup,
  defaultDim2: Dimension = Dimension.Gender,
) {
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [dimension, setDimension] = useState<Dimension>(defaultDimension);
  const [dim1, setDim1] = useState<Dimension>(defaultDim1);
  const [dim2, setDim2] = useState<Dimension>(defaultDim2);
  return {
    periodStart, setPeriodStart,
    periodEnd, setPeriodEnd,
    dimension, setDimension,
    dim1, setDim1,
    dim2, setDim2,
  };
}
