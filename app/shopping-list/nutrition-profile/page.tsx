import { PageShell } from "@/components/page-shell";
import { NoDataCard } from "@/components/ui/no-data-card";

export default function ShoppingListNutritionPage() {
  return (
    <PageShell title="Nutrition Profile">
      <div className="p-4 pt-0">
        <NoDataCard message="Nutrition Profile is not available for Shopping List. Use Meal Log for consumed nutrition analytics." />
      </div>
    </PageShell>
  );
}
