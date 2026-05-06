import { getRisks } from "@/actions/bcm/risk-assessment-actions";
import { getContinuitySettings } from "@/actions/bcm/continuity-settings-actions";
import { prisma } from "@/lib/prisma";
import RiskAssessmentClientV2 from "./risk-assessment-client-v2";
import { MATRIX_ISO_31000 } from "@/lib/bcm/risk-matrix-types";
import type { RiskMatrixConfig } from "@/lib/bcm/risk-matrix-types";

export default async function RiskAssessmentPage({
  searchParams,
}: {
  searchParams: Promise<{ factoryId?: string }>;
}) {
  const params = await searchParams;
  const factoryId = params.factoryId;

  const [risksResult, processes, settingsResult] = await Promise.all([
    getRisks(factoryId),
    prisma.process.findMany({
      where: factoryId ? { factoryId } : {},
      select: { id: true, name: true, department: true, criticality: true },
      orderBy: [{ criticality: "asc" }, { name: "asc" }],
    }),
    factoryId ? getContinuitySettings(factoryId) : null,
  ]);

  const matrixConfig: RiskMatrixConfig =
    (settingsResult?.data?.riskMatrixConfig as unknown as RiskMatrixConfig) ?? MATRIX_ISO_31000;

  const methodologyLabel =
    settingsResult?.data?.riskMethodologyLabel ?? "ISO 31000 / ISO 22317";

  return (
    <RiskAssessmentClientV2
      initialRisks={(risksResult.data ?? []) as Parameters<typeof RiskAssessmentClientV2>[0]["initialRisks"]}
      processes={processes}
      factoryId={factoryId}
      matrixConfig={matrixConfig}
      methodologyLabel={methodologyLabel}
    />
  );
}
