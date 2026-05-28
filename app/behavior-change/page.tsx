import { BehaviorChangeContent } from "@/components/behavior-change-content";
import { PageShell } from "@/components/page-shell";
import { PAGE_TITLES } from "@/lib/page-titles";

export default function BehaviorChangePage() {
  return (
    <PageShell title={PAGE_TITLES.behaviorChangeAnalysis}>
      <BehaviorChangeContent />
    </PageShell>
  );
}
