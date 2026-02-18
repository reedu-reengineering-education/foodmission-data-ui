import { DashboardReportContent } from "@/components/dashboard-report-content";

export default function ReportDashboardPage() {
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 print:mb-4">
          <h1 className="text-3xl font-bold">FOODMISSION Dashboard Report</h1>
          <p className="text-muted-foreground mt-2">
            Generated on {reportDate}
          </p>
        </div>

        <DashboardReportContent />
      </div>
    </div>
  );
}
