import { RecipeTrendsPatternsContent } from "@/components/recipe-trends-patterns-content";
import { PageShell } from "@/components/page-shell";
import { PAGE_TITLES } from "@/lib/page-titles";

export default function RecipeTrendsPatternsPage() {
  return (
    <PageShell title={PAGE_TITLES.recipes.trendsPatterns}>
      <RecipeTrendsPatternsContent />
    </PageShell>
  );
}
