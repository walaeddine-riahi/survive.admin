import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getWizardDraft } from "@/actions/simulation/builder-actions";
import SimulationBuilder from "@/components/simulation/SimulationBuilder";

export default async function SimulationBuilderPage({
  params,
}: {
  params: Promise<{ simulationId: string }>;
}) {
  const { simulationId } = await params;

  const [draftResult, users] = await Promise.all([
    getWizardDraft(simulationId),
    prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    }),
  ]);

  if (!draftResult.success || !draftResult.data?.simulation) {
    notFound();
  }

  return (
    <SimulationBuilder
      simulationId={simulationId}
      initialData={draftResult.data}
      users={users}
    />
  );
}
