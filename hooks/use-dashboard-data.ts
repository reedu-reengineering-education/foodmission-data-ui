import { useEffect, useState, useCallback, useMemo } from "react";
import { analyticsApi } from "@/lib/analytics-api";
import { type DailyNutrition, type DemographicNutrition } from "@/lib/types";
import { COUNTRY_INFO } from "@/lib/constants";
import { aggregateDemographic } from "@/lib/utils";

export interface DashboardMetrics {
  loading: boolean;
  error: string | null;
  noData: boolean;
  totalUsers: number;
  totalMeals: number;
  totalCalories: number;
  countriesCount: number;
  mealTypeChart: { type: string; count: number }[];
  countryChoro: { country: string; users: number; code: string }[];
  ageChart: { label: string; users: number }[];
  genderChart: { label: string; users: number }[];
  educationChart: { label: string; users: number }[];
  refetch: () => void;
}

export function useDashboardData(): DashboardMetrics {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nutrition, setNutrition] = useState<DailyNutrition[]>([]);
  const [countryData, setCountryData] = useState<DemographicNutrition[]>([]);
  const [ageData, setAgeData] = useState<DemographicNutrition[]>([]);
  const [genderData, setGenderData] = useState<DemographicNutrition[]>([]);
  const [educationData, setEducationData] = useState<DemographicNutrition[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nutr, byCountry, byAge, byGender, byEdu] = await Promise.all([
        analyticsApi.nutrition(),
        analyticsApi.demographicNutrition({ dimension: "country" }),
        analyticsApi.demographicNutrition({ dimension: "ageGroup" }),
        analyticsApi.demographicNutrition({ dimension: "gender" }),
        analyticsApi.demographicNutrition({ dimension: "educationLevel" }),
      ]);
      setNutrition(nutr);
      setCountryData(byCountry);
      setAgeData(byAge);
      setGenderData(byGender);
      setEducationData(byEdu);
    } catch (e) {
      console.error("Failed to fetch dashboard data", e);
      setError(e instanceof Error ? e.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const metrics = useMemo(() => {
    const totalUsers = nutrition.reduce((max, r) => Math.max(max, r.userCount), 0);
    const totalMeals = nutrition.reduce((s, r) => s + r.mealCount, 0);
    const totalCalories = nutrition.reduce(
      (s, r) => s + (r.avgCalories ?? 0) * r.mealCount,
      0,
    );

    const countryAgg: Record<string, number> = {};
    for (const r of countryData) {
      const iso2 = r.dimensionValue ?? "Unknown";
      countryAgg[iso2] = Math.max(countryAgg[iso2] ?? 0, r.userCount);
    }

    const validCountries = (c: string) => c !== "Unknown" && c !== "__null__";
    const countriesCount = Object.keys(countryAgg).filter(validCountries).length;

    const mealsByType: Record<string, number> = {};
    for (const r of nutrition) {
      const label =
        r.typeOfMeal.charAt(0) + r.typeOfMeal.slice(1).toLowerCase().replace("_", " ");
      mealsByType[label] = (mealsByType[label] ?? 0) + r.mealCount;
    }
    const mealTypeChart = Object.entries(mealsByType)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    const countryChoro = Object.entries(countryAgg)
      .filter(([c]) => validCountries(c))
      .map(([iso2, users]) => {
        const info = COUNTRY_INFO[iso2];
        return { country: info?.name ?? iso2, users, code: info?.iso3 ?? iso2 };
      })
      .sort((a, b) => b.users - a.users);

    return {
      noData: nutrition.length === 0,
      totalUsers,
      totalMeals,
      totalCalories,
      countriesCount,
      mealTypeChart,
      countryChoro,
      ageChart: aggregateDemographic(ageData),
      genderChart: aggregateDemographic(genderData),
      educationChart: aggregateDemographic(educationData),
    };
  }, [nutrition, countryData, ageData, genderData, educationData]);

  return { loading, error, refetch: fetchData, ...metrics };
}
