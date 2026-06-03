"use client";

import { useCallback, useEffect, useState } from "react";
import { analyticsApi, shoppingListApi } from "@/lib/analytics-api";
import type { AnalyticsCapabilities, AnalyticsSummaryMetadata } from "@/lib/types";

type Source = "meal-log" | "shopping-list";

const DEFAULT_CAPABILITIES: Record<Source, AnalyticsCapabilities> = {
  "meal-log": {
    supportsNutrition: true,
    supportsDemographicNutrition: true,
    supportsCrossDimNutrition: true,
    supportsClassification: true,
    supportsRecords: true,
    supportedDimensions: ["ageGroup", "country", "educationLevel", "gender", "region"],
    privacyThresholds: {
      singleDimMinUsers: 5,
      crossDimMinUsers: 20,
    },
  },
  "shopping-list": {
    supportsNutrition: false,
    supportsDemographicNutrition: false,
    supportsCrossDimNutrition: false,
    supportsClassification: true,
    supportsRecords: false,
    supportedDimensions: ["ageGroup", "country", "educationLevel", "gender", "region"],
    privacyThresholds: {
      singleDimMinUsers: 5,
      crossDimMinUsers: 20,
    },
  },
};

function resolveCapabilities(
  source: Source,
  metadata: AnalyticsSummaryMetadata | undefined,
): AnalyticsCapabilities {
  return metadata?.capabilities ?? DEFAULT_CAPABILITIES[source];
}

export function useSourceCapabilities(source: Source) {
  const [capabilities, setCapabilities] = useState<AnalyticsCapabilities>(
    DEFAULT_CAPABILITIES[source],
  );
  const [loading, setLoading] = useState(true);

  const fetchCapabilities = useCallback(async () => {
    setLoading(true);
    try {
      const summary =
        source === "meal-log"
          ? await analyticsApi.summary()
          : await shoppingListApi.summary();

      setCapabilities(
        resolveCapabilities(source, (summary as { metadata?: AnalyticsSummaryMetadata }).metadata),
      );
    } catch (e) {
      console.error(`Failed to fetch ${source} capabilities`, e);
      setCapabilities(DEFAULT_CAPABILITIES[source]);
    } finally {
      setLoading(false);
    }
  }, [source]);

  useEffect(() => {
    fetchCapabilities();
  }, [fetchCapabilities]);

  return { capabilities, loading, refetch: fetchCapabilities };
}
