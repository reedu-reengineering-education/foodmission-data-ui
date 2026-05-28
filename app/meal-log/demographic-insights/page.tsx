import { DemographicInsightsContent } from "@/components/demographic-insights-content";
import { PageShell } from "@/components/page-shell";
import { PAGE_TITLES } from "@/lib/page-titles";

export default function DemographicInsightsPage() {
  return (
    <PageShell title={PAGE_TITLES.mealLog.demographicInsights}>
      <DemographicInsightsContent />
    </PageShell>
  );
}
