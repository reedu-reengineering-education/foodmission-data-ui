import { WasteTrackingContent } from "@/components/waste-reminders-content";
import { PageShell } from "@/components/page-shell";
import { PAGE_TITLES } from "@/lib/page-titles";

export default function WasteTrackingPage() {
  return (
    <PageShell title={PAGE_TITLES.wasteTrackingAnalysis}>
      <WasteTrackingContent />
    </PageShell>
  );
}
