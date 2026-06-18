import { RecipeSustainabilityContent } from "@/components/recipe-sustainability-content";
import { PageShell } from "@/components/page-shell";
import { PAGE_TITLES } from "@/lib/page-titles";

export default function RecipeSustainabilityPage() {
  return (
    <PageShell title={PAGE_TITLES.recipes.sustainability}>
      <RecipeSustainabilityContent />
    </PageShell>
  );
}
