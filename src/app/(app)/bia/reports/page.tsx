// BIA Reports page for displaying and managing BIA reports
import { getAllBiaReports } from "@/actions/bia/bia-report-actions";
import { BiaReportsPageClient } from "./page-client";

export default async function BiaReportsPage() {
  const result = await getAllBiaReports({ limit: 50 });

  const reports = result.success ? result.data || [] : [];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Rapports BIA</h1>
        <p className="text-muted-foreground">
          Gérez vos rapports d&apos;analyse d&apos;impact métier
        </p>
      </div>

      <BiaReportsPageClient initialReports={reports} />
    </div>
  );
}
