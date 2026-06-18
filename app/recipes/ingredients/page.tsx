import { RecipeIngredientsContent } from "@/components/recipe-ingredients-content";
import { PageShell } from "@/components/page-shell";
import { PAGE_TITLES } from "@/lib/page-titles";

export default function RecipeIngredientsPage() {
  return (
    <PageShell title={PAGE_TITLES.recipes.ingredients}>
      <RecipeIngredientsContent />
    </PageShell>
  );
}
