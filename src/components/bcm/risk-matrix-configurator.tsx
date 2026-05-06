"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save, RefreshCw, Info, Plus, Trash2 } from "lucide-react";
import {
  type RiskMatrixConfig, type MatrixLevel, type MatrixThreshold,
  PRESET_MATRICES, calculateScore, getThresholdForScore,
} from "@/lib/bcm/risk-matrix-types";
import { saveContinuitySettings } from "@/actions/bcm/continuity-settings-actions";

interface Props {
  factoryId: string;
  initialConfig: RiskMatrixConfig;
  initialSettings: {
    maxRtoHours: number;
    maxRpoHours: number;
    maxMtpdHours: number;
    minMbcoPercent: number;
    riskMethodology: string;
    riskMethodologyLabel?: string | null;
    applicableStandards: string[];
  };
}

export default function RiskMatrixConfigurator({ factoryId, initialConfig, initialSettings }: Props) {
  const [config, setConfig] = useState<RiskMatrixConfig>(initialConfig);
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [previewX, setPreviewX] = useState(3);
  const [previewY, setPreviewY] = useState(3);

  function loadPreset(key: string) {
    const preset = PRESET_MATRICES[key];
    if (preset) {
      setConfig(preset.config);
      setSettings((s) => ({ ...s, riskMethodology: key, riskMethodologyLabel: preset.label }));
      toast.success(`Matrice "${preset.label}" chargée`);
    }
  }

  function updateAxisLevel(axis: "axeX" | "axeY", index: number, field: keyof MatrixLevel, value: string | number) {
    setConfig((c) => ({
      ...c,
      [axis]: {
        ...c[axis],
        levels: c[axis].levels.map((l, i) =>
          i === index ? { ...l, [field]: field === "value" ? Number(value) : value } : l
        ),
      },
    }));
  }

  function addAxisLevel(axis: "axeX" | "axeY") {
    setConfig((c) => {
      const levels = c[axis].levels;
      const nextVal = levels.length + 1;
      return {
        ...c,
        [axis]: {
          ...c[axis],
          levels: [...levels, { value: nextVal, label: `Niveau ${nextVal}`, description: "" }],
        },
      };
    });
  }

  function removeAxisLevel(axis: "axeX" | "axeY", index: number) {
    setConfig((c) => ({
      ...c,
      [axis]: {
        ...c[axis],
        levels: c[axis].levels.filter((_, i) => i !== index),
      },
    }));
  }

  function updateThreshold(index: number, field: keyof MatrixThreshold, value: string | number) {
    setConfig((c) => ({
      ...c,
      thresholds: c.thresholds.map((t, i) =>
        i === index ? { ...t, [field]: typeof value === "string" && field !== "label" && field !== "color" && field !== "actionRequired" ? Number(value) : value } : t
      ),
    }));
  }

  function addThreshold() {
    setConfig((c) => ({
      ...c,
      thresholds: [
        ...c.thresholds,
        { min: 1, max: 5, label: "Nouveau niveau", color: "#6b7280", actionRequired: "" },
      ],
    }));
  }

  async function handleSave() {
    setIsSaving(true);
    const result = await saveContinuitySettings({
      factoryId,
      maxRtoHours: settings.maxRtoHours,
      maxRpoHours: settings.maxRpoHours,
      maxMtpdHours: settings.maxMtpdHours,
      minMbcoPercent: settings.minMbcoPercent,
      riskMethodology: settings.riskMethodology,
      riskMethodologyLabel: settings.riskMethodologyLabel ?? undefined,
      riskMatrixConfig: config,
      applicableStandards: settings.applicableStandards,
    });
    setIsSaving(false);

    if (result.success) toast.success("Configuration sauvegardée");
    else toast.error(result.error);
  }

  // Preview score
  const previewScore = calculateScore(config, previewX, previewY);
  const previewThreshold = getThresholdForScore(config, previewScore);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Configuration de la Méthodologie Risque</h2>
          <p className="text-sm text-muted-foreground">Personnalisez la matrice selon votre référentiel interne</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Sauvegarder
        </Button>
      </div>

      {/* Seuils ISO 22301 */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Seuils de conformité ISO 22301</CardTitle>
          <CardDescription>Paramètres organisationnels pour l'analyse des écarts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: "maxRtoHours", label: "RTO max (h)", placeholder: "4" },
              { key: "maxRpoHours", label: "RPO max (h)", placeholder: "2" },
              { key: "maxMtpdHours", label: "MTPD max (h)", placeholder: "72" },
              { key: "minMbcoPercent", label: "MBCO min (%)", placeholder: "60" },
            ].map((f) => (
              <div key={f.key}>
                <Label className="text-xs">{f.label}</Label>
                <Input
                  type="number"
                  value={(settings as Record<string, number>)[f.key]}
                  onChange={(e) => setSettings((s) => ({ ...s, [f.key]: parseInt(e.target.value) || 0 }))}
                  placeholder={f.placeholder}
                  className="mt-1"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Matrice de risque */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Matrice de Risque</CardTitle>
          <CardDescription>Choisissez un référentiel normé ou créez votre propre méthodologie</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Preset selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(PRESET_MATRICES).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => loadPreset(key)}
                className={`text-left p-3 rounded-lg border-2 transition-all text-xs ${
                  settings.riskMethodology === key
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="font-semibold">{preset.label}</p>
                <p className="text-muted-foreground mt-0.5 line-clamp-2">{preset.description}</p>
              </button>
            ))}
          </div>

          <Tabs defaultValue="axes">
            <TabsList>
              <TabsTrigger value="axes">Axes de la matrice</TabsTrigger>
              <TabsTrigger value="thresholds">Seuils de criticité</TabsTrigger>
              <TabsTrigger value="preview">Prévisualisation</TabsTrigger>
            </TabsList>

            {/* AXES */}
            <TabsContent value="axes" className="space-y-5 mt-4">
              {(["axeX", "axeY"] as const).map((axis) => (
                <div key={axis} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Label className="text-sm font-semibold">{axis === "axeX" ? "Axe X (Horizontal)" : "Axe Y (Vertical)"}</Label>
                    <Input
                      className="max-w-xs h-8 text-sm"
                      value={config[axis].label}
                      onChange={(e) => setConfig((c) => ({ ...c, [axis]: { ...c[axis], label: e.target.value } }))}
                      placeholder="Nom de l'axe"
                    />
                  </div>
                  <div className="space-y-2">
                    {config[axis].levels.map((level, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-1 text-xs text-muted-foreground text-center font-bold">{level.value}</div>
                        <Input
                          className="col-span-3 h-7 text-xs"
                          value={level.label}
                          onChange={(e) => updateAxisLevel(axis, i, "label", e.target.value)}
                          placeholder="Label"
                        />
                        <Input
                          className="col-span-6 h-7 text-xs"
                          value={level.description || ""}
                          onChange={(e) => updateAxisLevel(axis, i, "description", e.target.value)}
                          placeholder="Description"
                        />
                        <input
                          type="color"
                          className="col-span-1 h-7 w-full rounded cursor-pointer border"
                          value={level.color || "#6b7280"}
                          onChange={(e) => updateAxisLevel(axis, i, "color", e.target.value)}
                        />
                        <Button
                          variant="ghost" size="sm" className="col-span-1 h-7 p-0 text-red-400"
                          onClick={() => removeAxisLevel(axis, i)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="gap-1 text-xs h-7 mt-1" onClick={() => addAxisLevel(axis)}>
                      <Plus className="h-3 w-3" /> Ajouter niveau
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* THRESHOLDS */}
            <TabsContent value="thresholds" className="space-y-3 mt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Info className="h-3 w-3" />
                Définissez les plages de score correspondant à chaque niveau de risque
              </div>
              {config.thresholds.map((threshold, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center border rounded-lg p-3">
                  <input
                    type="color"
                    className="col-span-1 h-8 w-full rounded cursor-pointer border"
                    value={threshold.color}
                    onChange={(e) => updateThreshold(i, "color", e.target.value)}
                  />
                  <Input
                    className="col-span-3 h-8 text-xs"
                    value={threshold.label}
                    onChange={(e) => updateThreshold(i, "label", e.target.value)}
                    placeholder="Label"
                  />
                  <div className="col-span-2 flex items-center gap-1">
                    <Input
                      type="number" className="h-8 text-xs"
                      value={threshold.min}
                      onChange={(e) => updateThreshold(i, "min", e.target.value)}
                    />
                  </div>
                  <div className="col-span-1 text-center text-xs text-muted-foreground">–</div>
                  <div className="col-span-2 flex items-center gap-1">
                    <Input
                      type="number" className="h-8 text-xs"
                      value={threshold.max}
                      onChange={(e) => updateThreshold(i, "max", e.target.value)}
                    />
                  </div>
                  <Input
                    className="col-span-2 h-8 text-xs"
                    value={threshold.actionRequired || ""}
                    onChange={(e) => updateThreshold(i, "actionRequired", e.target.value)}
                    placeholder="Action requise"
                  />
                  <Button
                    variant="ghost" size="sm" className="col-span-1 h-8 p-0 text-red-400"
                    onClick={() => setConfig((c) => ({ ...c, thresholds: c.thresholds.filter((_, j) => j !== i) }))}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={addThreshold}>
                <Plus className="h-3 w-3" /> Ajouter un seuil
              </Button>
            </TabsContent>

            {/* PREVIEW */}
            <TabsContent value="preview" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Interactive test */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold">Tester la matrice</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">{config.axeX.label}</Label>
                      <Select value={String(previewX)} onValueChange={(v) => setPreviewX(parseInt(v))}>
                        <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {config.axeX.levels.map((l) => (
                            <SelectItem key={l.value} value={String(l.value)}>{l.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">{config.axeY.label}</Label>
                      <Select value={String(previewY)} onValueChange={(v) => setPreviewY(parseInt(v))}>
                        <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {config.axeY.levels.map((l) => (
                            <SelectItem key={l.value} value={String(l.value)}>{l.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {previewThreshold && (
                    <div
                      className="rounded-lg p-4 text-white text-center"
                      style={{ backgroundColor: previewThreshold.color }}
                    >
                      <p className="text-3xl font-bold">{previewScore}</p>
                      <p className="text-lg font-semibold">{previewThreshold.label}</p>
                      {previewThreshold.actionRequired && (
                        <p className="text-sm opacity-90 mt-1">{previewThreshold.actionRequired}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Matrix grid preview */}
                <div>
                  <p className="text-sm font-semibold mb-3">Visualisation de la matrice</p>
                  <div className="overflow-auto">
                    <div
                      className="grid gap-1"
                      style={{
                        gridTemplateColumns: `auto ${config.axeX.levels.map(() => "1fr").join(" ")}`,
                      }}
                    >
                      <div />
                      {config.axeX.levels.map((l) => (
                        <div key={l.value} className="text-center text-xs font-medium text-muted-foreground py-1 truncate" title={l.label}>{l.label}</div>
                      ))}
                      {[...config.axeY.levels].reverse().map((yLevel) => (
                        <>
                          <div key={`y${yLevel.value}`} className="text-xs font-medium text-muted-foreground flex items-center pr-1 py-1 truncate" style={{ maxWidth: 70 }} title={yLevel.label}>{yLevel.label}</div>
                          {config.axeX.levels.map((xLevel) => {
                            const score = calculateScore(config, xLevel.value, yLevel.value);
                            const thresh = getThresholdForScore(config, score);
                            return (
                              <div
                                key={`${xLevel.value}-${yLevel.value}`}
                                className="h-8 rounded flex items-center justify-center text-xs font-bold text-white"
                                style={{ backgroundColor: thresh?.color || "#e5e7eb" }}
                                title={`${xLevel.label} × ${yLevel.label} = ${score} (${thresh?.label || "?"})`}
                              >
                                {score}
                              </div>
                            );
                          })}
                        </>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {config.thresholds.map((t) => (
                        <div key={t.label} className="flex items-center gap-1 text-xs">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: t.color }} />
                          <span>{t.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
