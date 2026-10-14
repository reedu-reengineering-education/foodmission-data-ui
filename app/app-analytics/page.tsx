import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AppUsageContent } from "@/components/app-usage-content";
import { PageShell } from "@/components/page-shell";
import { getAdminStatus } from "@/lib/admin";
import { PAGE_TITLES } from "@/lib/page-titles";

export default async function AppAnalyticsPage() {
  const { signedIn, admin } = await getAdminStatus(await headers());
  if (!signedIn) redirect("/sign-in");
  if (!admin) notFound();

  return (
    <PageShell title={PAGE_TITLES.appAnalytics}>
      <AppUsageContent />
    </PageShell>
  );
}
