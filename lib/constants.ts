// Project-wide constants
import { MealType, Dimension } from "./types";

/** Viewports below this width use mobile layout (sidebar sheet, etc.) */
export const MOBILE_BREAKPOINT_PX = 1024;

export const MEAL_TYPES = Object.values(MealType);
export const DIMENSIONS = Object.values(Dimension);

export const DIMENSION_LABELS: Record<Dimension, string> = {
  [Dimension.AgeGroup]: "Age Group",
  [Dimension.Gender]: "Gender",
  [Dimension.EducationLevel]: "Education Level",
  [Dimension.Region]: "Region",
  [Dimension.Country]: "Country",
};

export const COUNTRY_INFO: Record<string, { iso3: string; name: string }> = {
  AT: { iso3: "AUT", name: "Austria" },
  BE: { iso3: "BEL", name: "Belgium" },
  BG: { iso3: "BGR", name: "Bulgaria" },
  CH: { iso3: "CHE", name: "Switzerland" },
  CY: { iso3: "CYP", name: "Cyprus" },
  CZ: { iso3: "CZE", name: "Czech Republic" },
  DE: { iso3: "DEU", name: "Germany" },
  DK: { iso3: "DNK", name: "Denmark" },
  EE: { iso3: "EST", name: "Estonia" },
  ES: { iso3: "ESP", name: "Spain" },
  FI: { iso3: "FIN", name: "Finland" },
  FR: { iso3: "FRA", name: "France" },
  GB: { iso3: "GBR", name: "United Kingdom" },
  GR: { iso3: "GRC", name: "Greece" },
  HR: { iso3: "HRV", name: "Croatia" },
  HU: { iso3: "HUN", name: "Hungary" },
  IE: { iso3: "IRL", name: "Ireland" },
  IT: { iso3: "ITA", name: "Italy" },
  LT: { iso3: "LTU", name: "Lithuania" },
  LU: { iso3: "LUX", name: "Luxembourg" },
  LV: { iso3: "LVA", name: "Latvia" },
  MT: { iso3: "MLT", name: "Malta" },
  NL: { iso3: "NLD", name: "Netherlands" },
  NO: { iso3: "NOR", name: "Norway" },
  PL: { iso3: "POL", name: "Poland" },
  PT: { iso3: "PRT", name: "Portugal" },
  RO: { iso3: "ROU", name: "Romania" },
  RS: { iso3: "SRB", name: "Serbia" },
  SE: { iso3: "SWE", name: "Sweden" },
  SI: { iso3: "SVN", name: "Slovenia" },
  SK: { iso3: "SVK", name: "Slovakia" },
  TR: { iso3: "TUR", name: "Turkey" },
  UA: { iso3: "UKR", name: "Ukraine" },
};

export const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];
