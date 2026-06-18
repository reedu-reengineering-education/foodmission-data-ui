import { RecipeOverviewContent } from "@/components/recipe-overview-content";
import { PageShell } from "@/components/page-shell";
import { PAGE_TITLES } from "@/lib/page-titles";

export default function RecipeOverviewPage() {
  return (
    <PageShell title={PAGE_TITLES.recipes.overview}>
      <RecipeOverviewContent />
    </PageShell>
  );
}
