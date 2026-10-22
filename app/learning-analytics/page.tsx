import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { LearningInsightsContent } from "@/components/learning-insights-content";
import { PageShell } from "@/components/page-shell";
import { getAdminStatus } from "@/lib/admin";
import { PAGE_TITLES } from "@/lib/page-titles";

export default async function LearningAnalyticsPage() {
  const { signedIn, admin } = await getAdminStatus(await headers());
  if (!signedIn) redirect("/sign-in");
  if (!admin) notFound();

  return (
    <PageShell title={PAGE_TITLES.learningAnalytics}>
      <LearningInsightsContent />
    </PageShell>
  );
}
