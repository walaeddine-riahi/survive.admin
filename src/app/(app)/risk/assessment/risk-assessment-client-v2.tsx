"use client";

import React, { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Search, ShieldAlert, Filter, Settings, ArrowRight } from "lucide-react";
import {
  createRisk, updateRisk, deleteRisk, getRisks,
} from "@/actions/bcm/risk-assessment-actions";
import {
  type CreateRiskInput, type UpdateRiskInput, type RiskStatus,
  THREAT_SOURCES,
} from "@/lib/bcm/risk-assessment-types";
import {
  type RiskMatrixConfig, calculateScore, getThresholdForScore,
} from "@/lib/bcm/risk-matrix-types";
import { MatrixSelector } from "@/components/bcm/matrix-selector";
import Link from "next/link";

type Risk = NonNullable<Awaited<ReturnType<typeof getRisks>>["data"]>[number];

const RISK_STATUS_LABELS: Record<RiskStatus, string> = {
  OPEN: "Ouvert",
  MITIGATED: "Atténué",
  ACCEPTED: "Accepté",
  CLOSED: "Clôturé",
};

interface FormData {
  title: string;
  description: string;
  scenario: string;
  threatSource: string;
  processId: string;
  axeXValue: number;
  axeYValue: number;
  axeZValue: string;
  rtoImpactHours: string;
  rpoImpactHours: string;
  mbcoImpactPercent: string;
  treatmentOption: string;
  treatmentPlan: string;
  // Residual
  residualAxeX: string;
  residualAxeY: string;
  residualAxeZ: string;
}

function getDefaultAxeValue(config: RiskMatrixConfig) {
  const mid = Math.ceil(config.axeX.levels.length / 2);
  return config.axeX.levels[mid - 1]?.value ?? 1;
}

function RiskBadge({ score, label, color }: { score: number; label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/10"
      style={{ backgroundColor: `${color}33`, color: color, borderColor: `${color}66` }}
    >
      <ShieldAlert className="h-3 w-3" />
      {label} — {score}
    </span>
  );
}

// Visual matrix grid - Cyber Redesign
function MatrixGrid({ config, risks }: { config: RiskMatrixConfig; risks: Risk[] }) {
  const xLevels = [...config.axeX.levels].sort((a, b) => a.value - b.value);
  const yLevels = [...config.axeY.levels].sort((a, b) => b.value - a.value);

  return (
    <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl">
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `100px ${xLevels.map(() => "1fr").join(" ")}` }}
      >
        <div className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 col-start-2 mb-4" style={{ gridColumn: `2 / span ${xLevels.length}` }}>
          {config.axeX.label}
        </div>
        <div />
        {xLevels.map((l) => (
          <div key={l.value} className="text-center pb-4">
            <span className="text-sm font-black text-foreground">{l.value}</span>
            <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter opacity-50">{l.label}</p>
          </div>
        ))}

        {yLevels.map((yLevel) => (
          <React.Fragment key={`row-${yLevel.value}`}>
            <div className="flex flex-col justify-center pr-4 border-r border-white/5">
              <span className="text-sm font-black text-foreground text-right">{yLevel.value}</span>
              <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter text-right opacity-50">{yLevel.label}</p>
            </div>
            {xLevels.map((xLevel) => {
              const score = calculateScore(config, xLevel.value, yLevel.value);
              const thresh = getThresholdForScore(config, score);
              const risksInCell = risks.filter(
                (r) => r.axeXValue === xLevel.value && r.axeYValue === yLevel.value && r.status !== "CLOSED"
              );
              return (
                <div
                  key={`${xLevel.value}-${yLevel.value}`}
                  className="group rounded-2xl h-16 flex flex-col items-center justify-center text-sm font-black transition-all duration-300 relative border border-transparent hover:scale-105 hover:z-10"
                  style={{ 
                    backgroundColor: `${thresh?.color || "#ffffff"}15`, 
                    color: thresh?.color || "#ffffff",
                    boxShadow: risksInCell.length > 0 ? `0 0 20px ${thresh?.color || "#ffffff"}20` : 'none',
                    borderColor: risksInCell.length > 0 ? `${thresh?.color || "#ffffff"}40` : 'transparent'
                  }}
                  title={`Score: ${score} — ${thresh?.label || "?"}`}
                >
                  <span className="opacity-40 group-hover:opacity-100 transition-opacity">{score}</span>
                  {risksInCell.length > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white text-black text-[10px] font-black rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                        {risksInCell.length}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <div className="flex gap-6 mt-8 pt-6 border-t border-white/5 flex-wrap justify-center">
        {config.thresholds.map((t) => (
          <div key={t.label} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: t.color, color: t.color }} />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RiskAssessmentClientV2({
  initialRisks, processes, factoryId, matrixConfig, methodologyLabel,
}: {
  initialRisks: Risk[];
  processes: { id: string; name: string; department: string; criticality: string }[];
  factoryId?: string;
  matrixConfig: RiskMatrixConfig;
  methodologyLabel: string;
}) {
  const [risks, setRisks] = useState<Risk[]>(initialRisks);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [isPending, startTransition] = useTransition();

  const defaultX = getDefaultAxeValue(matrixConfig);
  const defaultY = getDefaultAxeValue(matrixConfig);

  const [form, setForm] = useState<FormData>({
    title: "", description: "", scenario: "", threatSource: "",
    processId: "", axeXValue: defaultX, axeYValue: defaultY, axeZValue: "",
    rtoImpactHours: "", rpoImpactHours: "", mbcoImpactPercent: "",
    treatmentOption: "", treatmentPlan: "",
    residualAxeX: "", residualAxeY: "", residualAxeZ: "",
  });

  const filtered = risks.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.scenario.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: risks.length,
    critical: risks.filter((r) => {
      const t = getThresholdForScore(matrixConfig, r.riskScore);
      return t?.label?.toLowerCase().includes("critiqu") || r.riskScore >= 17;
    }).length,
    open: risks.filter((r) => r.status === "OPEN").length,
    treated: risks.filter((r) => r.status === "MITIGATED").length,
  };

  const openEdit = (risk: Risk) => {
    setEditingRisk(risk);
    setForm({
      title: (risk as any).title || "",
      description: (risk as any).description || "",
      scenario: (risk as any).scenario || "",
      threatSource: (risk as any).threatSource || "",
      processId: (risk as any).processId || "",
      axeXValue: (risk as any).axeXValue || 1,
      axeYValue: (risk as any).axeYValue || 1,
      axeZValue: String((risk as any).axeZValue || ""),
      rtoImpactHours: String((risk as any).rtoImpactHours || ""),
      rpoImpactHours: String((risk as any).rpoImpactHours || ""),
      mbcoImpactPercent: String((risk as any).mbcoImpactPercent || ""),
      treatmentOption: (risk as any).treatmentOption || "",
      treatmentPlan: (risk as any).treatmentPlan || "",
      residualAxeX: String((risk as any).residualAxeX || ""),
      residualAxeY: String((risk as any).residualAxeY || ""),
      residualAxeZ: String((risk as any).residualAxeZ || ""),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce risque ?")) return;
    startTransition(async () => {
      const res = await deleteRisk(id);
      if (res.success) {
        setRisks(prev => prev.filter(r => r.id !== id));
        toast.success("Risque supprimé");
      } else {
        toast.error(res.error);
      }
    });
  };

  const handleSubmit = async () => {
    if (!form.title || !form.processId) {
      toast.error("Titre et processus requis");
      return;
    }

    startTransition(async () => {
      const payload = {
        ...form,
        axeXValue: Number(form.axeXValue),
        axeYValue: Number(form.axeYValue),
        axeZValue: Number(form.axeZValue) || undefined,
        rtoImpactHours: Number(form.rtoImpactHours) || undefined,
        rpoImpactHours: Number(form.rpoImpactHours) || undefined,
        mbcoImpactPercent: Number(form.mbcoImpactPercent) || undefined,
        factoryId,
        residualAxeX: Number(form.residualAxeX) || undefined,
        residualAxeY: Number(form.residualAxeY) || undefined,
        residualAxeZ: Number(form.residualAxeZ) || undefined,
      };

      const res = editingRisk 
        ? await updateRisk({ id: editingRisk.id, ...payload })
        : await createRisk(payload as any);

      if (res.success) {
        toast.success(editingRisk ? "Mis à jour" : "Créé");
        setShowForm(false);
        // Refresh
        const fresh = await getRisks(factoryId);
        if (fresh.success && fresh.data) setRisks(fresh.data as Risk[]);
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
            Appréciation des Risques
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black uppercase text-[10px] tracking-widest px-3 py-1">
              <ShieldAlert className="h-3 w-3 mr-2" />
              {methodologyLabel}
            </Badge>
            {factoryId && (
              <Link href={`/bia/settings?factoryId=${factoryId}&tab=matrix`}>
                <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 rounded-full">
                  <Settings className="h-3 w-3 mr-2" />
                  Configuration Matrice
                </Button>
              </Link>
            )}
          </div>
        </div>
        <Button onClick={() => { setEditingRisk(null); setShowForm(true); }} className="button-premium">
          <Plus className="h-4 w-4 mr-2" /> Nouveau Risque
        </Button>
      </div>

      {/* Stats - Cyber Design */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Risques Totaux", value: stats.total, color: "text-white", glow: "rgba(255,255,255,0.1)" },
          { label: "Niveau Critique", value: stats.critical, color: "text-red-400", glow: "rgba(248,113,113,0.2)" },
          { label: "En Attente", value: stats.open, color: "text-secondary", glow: "rgba(34,211,238,0.2)" },
          { label: "Mesures Actives", value: stats.treated, color: "text-green-400", glow: "rgba(74,222,128,0.2)" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-6 border-white/5 flex flex-col items-center justify-center group hover:border-white/10 transition-all duration-300">
            <p className={`text-4xl font-black mb-1 transition-all duration-300 ${s.color}`} style={{ textShadow: `0 0 20px ${s.glow}` }}>{s.value}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-white/60">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="list" className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <TabsList className="bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
            <TabsTrigger value="list" className="px-8 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-black uppercase text-xs tracking-widest">Registre</TabsTrigger>
            <TabsTrigger value="matrix" className="px-8 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-black uppercase text-xs tracking-widest">Matrice</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              <Input placeholder="Identifier un risque..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-premium pl-12 h-11" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px] input-premium h-11">
                <Filter className="h-4 w-4 mr-2 text-primary" />
                <SelectValue placeholder="Filtrer Statut" />
              </SelectTrigger>
              <SelectContent className="glass-card">
                <SelectItem value="all">Tous statuts</SelectItem>
                {(["OPEN", "MITIGATED", "ACCEPTED", "CLOSED"] as RiskStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{RISK_STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="list" className="mt-0 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filtered.length === 0 ? (
            <div className="glass-card p-24 text-center border-dashed border-white/10">
              <ShieldAlert className="h-16 w-16 mx-auto mb-6 text-muted-foreground opacity-20" />
              <p className="text-muted-foreground font-black uppercase tracking-widest">Périmètre de risque sécurisé</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filtered.map((risk) => {
                const threshold = getThresholdForScore(matrixConfig, risk.riskScore);
                return (
                  <Card key={risk.id} className="glass-card hover:border-primary/30 transition-all duration-300 overflow-hidden group">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row items-stretch">
                        <div className="w-1.5 shrink-0" style={{ backgroundColor: threshold?.color }} />
                        <div className="flex-1 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              {threshold && (
                                <RiskBadge score={risk.riskScore} label={threshold.label} color={threshold.color} />
                              )}
                              <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter border-white/10">{RISK_STATUS_LABELS[risk.status as RiskStatus]}</Badge>
                            </div>
                            <h3 className="text-xl font-black text-foreground mb-1 group-hover:text-primary transition-colors">{risk.title}</h3>
                            <p className="text-xs text-muted-foreground italic mb-4">Séquence : {risk.scenario}</p>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/5">
                              <div>
                                <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">{matrixConfig.axeX.label}</p>
                                <p className="text-xs font-bold">{matrixConfig.axeX.levels.find(l => l.value === risk.axeXValue)?.label ?? risk.axeXValue}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">{matrixConfig.axeY.label}</p>
                                <p className="text-xs font-bold">{matrixConfig.axeY.levels.find(l => l.value === risk.axeYValue)?.label ?? risk.axeYValue}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Processus</p>
                                <p className="text-xs font-bold truncate">{risk.process?.name}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Impact RTO</p>
                                <p className="text-xs font-bold text-secondary">{risk.rtoImpactHours ? `+${risk.rtoImpactHours}h` : "N/A"}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-white/5 md:pl-6">
                            <Button variant="ghost" size="sm" className="flex-1 md:flex-none h-10 rounded-xl hover:bg-white/5 font-bold text-xs" onClick={() => openEdit(risk)}>Modifier</Button>
                            <Button variant="ghost" size="sm" className="flex-1 md:flex-none h-10 rounded-xl hover:bg-red-500/20 text-red-400 font-bold text-xs" onClick={() => handleDelete(risk.id)}>Supprimer</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="matrix" className="mt-0 animate-in fade-in duration-500">
          <MatrixGrid config={matrixConfig} risks={risks} />
        </TabsContent>
      </Tabs>

      {/* Form Dialog - Redesigned */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl glass-card border-white/10 p-0 overflow-hidden shadow-[0_0_80px_rgba(124,58,237,0.2)]">
          <div className="bg-gradient-to-r from-primary to-secondary h-1.5 w-full" />
          <div className="p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-3xl font-black bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                {editingRisk ? "Analyse de Risque" : "Nouvelle Menace"}
              </DialogTitle>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Intelligence Opérationnelle : {methodologyLabel}</p>
            </DialogHeader>
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Désignation du Risque</Label>
                    <Input className="input-premium h-12" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Interruption Flux Logistique" />
                  </div>
                  <div>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Scénario de Crise</Label>
                    <Input className="input-premium h-12" value={form.scenario} onChange={(e) => setForm(f => ({ ...f, scenario: e.target.value }))} placeholder="Ex: Panne système ERP critique" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Briefing Détallé</Label>
                    <Textarea className="input-premium min-h-[128px] py-4" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description stratégique des impacts..." />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-white/5 rounded-3xl border border-white/5">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Paramètres d'Évaluation</p>
                  <MatrixSelector
                    config={matrixConfig}
                    xValue={form.axeXValue}
                    yValue={form.axeYValue}
                    onChange={(x, y) => setForm(f => ({ ...f, axeXValue: x, axeYValue: y }))}
                  />
                </div>
                <div className="space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Périmètre d'Impact</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Processus Cible</Label>
                      <Select value={form.processId} onValueChange={(v) => setForm(f => ({ ...f, processId: v }))}>
                        <SelectTrigger className="input-premium h-11"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                        <SelectContent className="glass-card">
                          {processes.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Source Menace</Label>
                      <Select value={form.threatSource} onValueChange={(v) => setForm(f => ({ ...f, threatSource: v }))}>
                        <SelectTrigger className="input-premium h-11"><SelectValue placeholder="Sélect..." /></SelectTrigger>
                        <SelectContent className="glass-card">
                          {THREAT_SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest hover:bg-white/5" onClick={() => setShowForm(false)}>Annuler</Button>
                <Button onClick={handleSubmit} disabled={isPending} className="flex-[2] button-premium h-14 rounded-2xl font-black uppercase tracking-[0.3em]">
                  {isPending ? "Traitement..." : editingRisk ? "Actualiser" : "Enregistrer"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
