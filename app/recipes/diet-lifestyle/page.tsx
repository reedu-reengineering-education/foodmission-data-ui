import { RecipeDietLifestyleContent } from "@/components/recipe-diet-lifestyle-content";
import { PageShell } from "@/components/page-shell";
import { PAGE_TITLES } from "@/lib/page-titles";

export default function RecipeDietLifestylePage() {
  return (
    <PageShell title={PAGE_TITLES.recipes.dietLifestyle}>
      <RecipeDietLifestyleContent />
    </PageShell>
  );
}
