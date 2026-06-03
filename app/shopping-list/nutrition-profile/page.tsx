import { PageShell } from "@/components/page-shell";
import { NoDataCard } from "@/components/ui/no-data-card";
import { PAGE_TITLES } from "@/lib/page-titles";

export default function ShoppingListNutritionPage() {
  return (
    <PageShell title={PAGE_TITLES.shoppingList.nutritionProfile}>
      <div className="p-4 pt-0">
        <NoDataCard message="Nutrition Profile is not available for Shopping List. Use Meal Log for consumed nutrition analytics." />
      </div>
    </PageShell>
  );
}
