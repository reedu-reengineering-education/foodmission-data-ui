import { BehaviorChangeContent } from "@/components/behavior-change-content";
import { PageShell } from "@/components/page-shell";

export default function BehaviorChangePage() {
  return (
    <PageShell title="Behavior Change Analysis">
      <BehaviorChangeContent />
    </PageShell>
  );
}
