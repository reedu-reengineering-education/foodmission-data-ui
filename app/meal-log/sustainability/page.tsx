import { SustainabilityContent } from "@/components/sustainability-content";
import { PageShell } from "@/components/page-shell";
import { PAGE_TITLES } from "@/lib/page-titles";

export default function SustainabilityPage() {
  return (
    <PageShell title={PAGE_TITLES.mealLog.sustainability}>
      <SustainabilityContent />
    </PageShell>
  );
}
