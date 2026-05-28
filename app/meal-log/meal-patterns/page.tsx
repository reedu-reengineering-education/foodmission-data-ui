import { MealPatternsContent } from "@/components/meal-patterns-content";
import { PageShell } from "@/components/page-shell";
import { PAGE_TITLES } from "@/lib/page-titles";

export default function MealPatternsPage() {
  return (
    <PageShell title={PAGE_TITLES.mealLog.mealPatterns}>
      <MealPatternsContent />
    </PageShell>
  );
}
