import { getStrategies } from "@/actions/bcm/strategy-actions";
import { getGaps } from "@/actions/bcm/gap-analysis-actions";
import { prisma } from "@/lib/prisma";
import StrategiesClientV3 from "./strategies-client-v3";

export default async function StrategiesPage({
  searchParams,
}: {
  searchParams: Promise<{ factoryId?: string }>;
}) {
  const params = await searchParams;
  const factoryId = params.factoryId;

  const [strategiesResult, gapsResult, processes] = await Promise.all([
    getStrategies(factoryId),
    getGaps(factoryId),
    prisma.process.findMany({
      where: factoryId ? { factoryId } : {},
      select: { id: true, name: true, department: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const gaps = (gapsResult.data ?? []).map(g => ({
    id: g.id, title: g.title, severity: g.severity,
  }));

  return (
    <StrategiesClientV3
      initialStrategies={(strategiesResult.data ?? []) as Parameters<typeof StrategiesClientV3>[0]["initialStrategies"]}
      processes={processes}
      gaps={gaps}
      factoryId={factoryId}
    />
  );
}
