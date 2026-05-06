import { getBcmDashboardData } from "@/actions/bcm/bcm-dashboard-actions";
import BcmDashboardClient from "@/components/bcm/bcm-dashboard-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default async function BcmDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ factoryId?: string }>;
}) {
  const params = await searchParams;
  const result = await getBcmDashboardData(params.factoryId);

  if (!result.success || !result.data) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{result.error}</AlertDescription>
      </Alert>
    );
  }

  return <BcmDashboardClient data={result.data as Parameters<typeof BcmDashboardClient>[0]["data"]} />;
}
