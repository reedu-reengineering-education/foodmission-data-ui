import { DashboardContent } from "@/components/dashboard-content";
import { PageShell } from "@/components/page-shell";

export default async function Home() {
  // const session = await auth.api.getSession({ headers: await headers() });
  // if (!session) redirect("/sign-in");

  return (
    <PageShell title="Dashboard Overview">
      <DashboardContent />
    </PageShell>
  );
}
