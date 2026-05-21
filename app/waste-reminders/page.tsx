import { WasteTrackingContent } from "@/components/waste-reminders-content";
import { PageShell } from "@/components/page-shell";

export default function WasteTrackingPage() {
  return (
    <PageShell title="Waste Tracking Analysis">
      <WasteTrackingContent />
    </PageShell>
  );
}
