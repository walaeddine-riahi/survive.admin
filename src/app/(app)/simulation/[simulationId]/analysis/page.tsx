import { prisma } from "@/lib/prisma";
import { getSimulationAnalysis } from "@/actions/simulation/analysis-actions";
import { getCrisisPlan } from "@/actions/simulation/crisis-plan-actions";
import SimulationAnalysisClient from "./simulation-analysis-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default async function SimulationAnalysisPage({
  params,
}: {
  params: Promise<{ simulationId: string }>;
}) {
  const { simulationId } = await params;

  const [simulation, analysisResult] = await Promise.all([
    prisma.simulation.findUnique({
      where: { id: simulationId },
      include: {
        assignments: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
        scenarios: {
          include: {
            injections: { orderBy: { createdAt: "asc" } },
          },
        },
      },
    }),
    getSimulationAnalysis(simulationId),
  ]);

  if (!simulation) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Simulation introuvable.</AlertDescription>
      </Alert>
    );
  }

  return (
    <SimulationAnalysisClient
      simulation={simulation}
      analysisData={analysisResult.data ?? null}
      simulationId={simulationId}
    />
  );
}
