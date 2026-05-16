import { useState } from "react";

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
export function useAnalyticsFiltersWithDimension(defaultDimension = "ageGroup") {
  const base = useAnalyticsFilters();
  const [dimension, setDimension] = useState(defaultDimension);
  return { ...base, dimension, setDimension };
}

/** Filter state with two cross-dimensional selectors */
export function useAnalyticsFiltersWithCrossDim(
  defaultDim1 = "ageGroup",
  defaultDim2 = "gender",
) {
  const base = useAnalyticsFilters();
  const [dim1, setDim1] = useState(defaultDim1);
  const [dim2, setDim2] = useState(defaultDim2);
  return { ...base, dim1, setDim1, dim2, setDim2 };
}
