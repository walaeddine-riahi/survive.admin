import { getContinuitySettings } from "@/actions/bcm/continuity-settings-actions";
import { prisma } from "@/lib/prisma";
import RiskMatrixConfigurator from "@/components/bcm/risk-matrix-configurator";
import { MATRIX_ISO_31000 } from "@/lib/bcm/risk-matrix-types";
import type { RiskMatrixConfig } from "@/lib/bcm/risk-matrix-types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default async function BcmSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ factoryId?: string }>;
}) {
  const params = await searchParams;
  const factoryId = params.factoryId;

  if (!factoryId) {
    // List factories to choose from
    const factories = await prisma.factory.findMany({
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    });

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Configuration BCM</h1>
        <p className="text-muted-foreground text-sm">Sélectionnez un site pour configurer sa méthodologie de risque et ses seuils de continuité.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {factories.map((f) => (
            <a
              key={f.id}
              href={`/bia/settings?factoryId=${f.id}`}
              className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
            >
              <p className="font-semibold">{f.name}</p>
              <p className="text-xs text-muted-foreground">{f.code}</p>
            </a>
          ))}
          {factories.length === 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>Aucun site configuré. Créez d'abord un site dans le module BIA.</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  }

  const [settingsResult, factory] = await Promise.all([
    getContinuitySettings(factoryId),
    prisma.factory.findUnique({
      where: { id: factoryId },
      select: { id: true, name: true, code: true },
    }),
  ]);

  if (!factory) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Site introuvable.</AlertDescription>
      </Alert>
    );
  }

  const settings = settingsResult.data;
  const matrixConfig: RiskMatrixConfig =
    (settings?.riskMatrixConfig as unknown as RiskMatrixConfig) ?? MATRIX_ISO_31000;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xs text-muted-foreground">Site :</p>
          <span className="text-sm font-semibold">{factory.name}</span>
          <span className="text-xs text-muted-foreground">({factory.code})</span>
        </div>
      </div>

      <RiskMatrixConfigurator
        factoryId={factoryId}
        initialConfig={matrixConfig}
        initialSettings={{
          maxRtoHours: settings?.maxRtoHours ?? 4,
          maxRpoHours: settings?.maxRpoHours ?? 2,
          maxMtpdHours: settings?.maxMtpdHours ?? 72,
          minMbcoPercent: settings?.minMbcoPercent ?? 60,
          riskMethodology: settings?.riskMethodology ?? "ISO_31000",
          riskMethodologyLabel: settings?.riskMethodologyLabel,
          applicableStandards: settings?.applicableStandards ?? ["ISO 22301"],
        }}
      />
    </div>
  );
}
