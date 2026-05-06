import { getGaps } from "@/actions/bcm/gap-analysis-actions";
import { prisma } from "@/lib/prisma";
import GapAnalysisClient from "./gap-analysis-client";

export default async function GapAnalysisPage({
  searchParams,
}: {
  searchParams: Promise<{ factoryId?: string }>;
}) {
  const params = await searchParams;
  const factoryId = params.factoryId;

  const [gapsResult, processes] = await Promise.all([
    getGaps(factoryId),
    prisma.process.findMany({
      where: factoryId ? { factoryId } : {},
      select: { id: true, name: true, department: true, criticality: true },
      orderBy: [{ criticality: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <GapAnalysisClient
      initialGaps={(gapsResult.data ?? []) as Parameters<typeof GapAnalysisClient>[0]["initialGaps"]}
      processes={processes}
      factoryId={factoryId}
    />
  );
}
