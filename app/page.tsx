import { DashboardContent } from "@/components/dashboard-content";
import { PageShell } from "@/components/page-shell";
import { PAGE_TITLES } from "@/lib/page-titles";

export default async function Home() {
  return (
    <PageShell title={PAGE_TITLES.dashboardOverview}>
      <DashboardContent />
    </PageShell>
  );
}
