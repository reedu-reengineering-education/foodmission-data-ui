import { MealClassificationContent } from "@/components/meal-classification-content";
import { PageShell } from "@/components/page-shell";
import { PAGE_TITLES } from "@/lib/page-titles";

export default function MealClassificationPage() {
  return (
    <PageShell title={PAGE_TITLES.mealLog.mealClassification}>
      <MealClassificationContent />
    </PageShell>
  );
}
