import { NutritionAnalyticsContent } from "@/components/nutrition-analytics-content";
import { PageShell } from "@/components/page-shell";
import { PAGE_TITLES } from "@/lib/page-titles";

export default function NutritionAnalyticsPage() {
  return (
    <PageShell title={PAGE_TITLES.mealLog.nutritionAnalytics}>
      <NutritionAnalyticsContent />
    </PageShell>
  );
}
