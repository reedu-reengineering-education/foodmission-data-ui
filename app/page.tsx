import { DashboardContent } from "@/components/dashboard-content";
import { PageShell } from "@/components/page-shell";
import { PAGE_TITLES } from "@/lib/page-titles";

export default async function Home() {
  // const session = await auth.api.getSession({ headers: await headers() });
  // if (!session) redirect("/sign-in");

  return (
    <PageShell title={PAGE_TITLES.dashboardOverview}>
      <DashboardContent />
    </PageShell>
  );
}
