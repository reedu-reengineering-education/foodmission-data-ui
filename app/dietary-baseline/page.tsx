import { DietaryBaselineContent } from "@/components/dietary-baseline-content";
import { PageShell } from "@/components/page-shell";
import { PAGE_TITLES } from "@/lib/page-titles";

export default function DietaryBaselinePage() {
  return (
    <PageShell title={PAGE_TITLES.dietaryBaselineAnalysis}>
      <DietaryBaselineContent />
    </PageShell>
  );
}
