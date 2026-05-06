"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "sonner";
import { Plus, Search, ShieldAlert, AlertTriangle, Filter, Info } from "lucide-react";
import {
  createRisk, updateRisk, deleteRisk, getRisks, getRiskStats
} from "@/actions/bcm/risk-assessment-actions";
import {
  type RiskStatus,
  THREAT_SOURCES,
} from "@/lib/bcm/risk-assessment-types";

// Mock types and helpers for the old client to avoid breaking the build
const LIKELIHOOD_LABELS: Record<string, string> = {
  LOW: "Faible", MEDIUM: "Moyen", HIGH: "Élevé", CRITICAL: "Critique"
};
const SEVERITY_LABELS: Record<string, string> = {
  NEGLIGIBLE: "Négligeable", MINOR: "Mineur", MODERATE: "Modéré", MAJOR: "Majeur", CATASTROPHIC: "Catastrophique"
};
const VELOCITY_LABELS: Record<string, string> = {
  SLOW: "Lente", MODERATE: "Modérée", RAPID: "Rapide", SUDDEN: "Soudaine"
};
const TREATMENT_LABELS: Record<string, string> = {
  REDUCE: "Réduire", TRANSFER: "Transférer", AVOID: "Éviter", ACCEPT: "Accepter"
};

function getRiskLevel(score: number) {
  if (score >= 17) return { level: "CRITICAL", label: "Critique", color: "#dc2626" };
  if (score >= 10) return { level: "HIGH", label: "Élevé", color: "#ea580c" };
  if (score >= 6) return { level: "MEDIUM", label: "Moyen", color: "#ca8a04" };
  return { level: "LOW", label: "Faible", color: "#16a34a" };
}

function calculateRiskScore(l: string, s: string) {
  const map: Record<string, number> = { 
    LOW: 1, MEDIUM: 3, HIGH: 4, CRITICAL: 5,
    NEGLIGIBLE: 1, MINOR: 2, MODERATE: 3, MAJOR: 4, CATASTROPHIC: 5 
  };
  return (map[l] || 1) * (map[s] || 1);
}

type Risk = any;
type CreateRiskInput = any;
type RiskLikelihood = any;
type RiskSeverity = any;
type RiskVelocity = any;
type TreatmentOption = any;

interface FormData {
  title: string;
  description: string;
  scenario: string;
  threatSource: string;
  processId: string;
  likelihood: RiskLikelihood;
  severity: RiskSeverity;
  velocity: RiskVelocity;
  rtoImpactHours: string;
  rpoImpactHours: string;
  mbcoImpactPercent: string;
  treatmentOption: TreatmentOption | "";
  treatmentPlan: string;
}

const RISK_STATUS_LABELS: Record<RiskStatus, string> = {
  OPEN: "Ouvert",
  MITIGATED: "Atténué",
  ACCEPTED: "Accepté",
  CLOSED: "Clôturé",
};

export default function RiskAssessmentClient({
  initialRisks,
  processes,
  factoryId,
}: {
  initialRisks: Risk[];
  processes: { id: string; name: string; department: string; criticality: string }[];
  factoryId?: string;
}) {
  const [risks, setRisks] = useState<Risk[]>(initialRisks);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<FormData>({
    title: "", description: "", scenario: "", threatSource: "",
    processId: "", likelihood: "MEDIUM", severity: "MODERATE",
    velocity: "MODERATE", rtoImpactHours: "", rpoImpactHours: "",
    mbcoImpactPercent: "", treatmentOption: "", treatmentPlan: "",
  });

  const previewScore = calculateRiskScore(form.likelihood, form.severity);
  const previewLevel = getRiskLevel(previewScore);

  const filtered = risks.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.scenario.toLowerCase().includes(search.toLowerCase());
    const matchLevel = filterLevel === "all" || getRiskLevel(r.riskScore).level === filterLevel;
    return matchSearch && matchLevel;
  });

  async function handleSubmit() {
    if (!form.title || !form.processId || !form.scenario) {
      toast.error("Titre, processus et scénario requis");
      return;
    }

    startTransition(async () => {
      const input: CreateRiskInput = {
        title: form.title,
        description: form.description,
        scenario: form.scenario,
        threatSource: form.threatSource || undefined,
        processId: form.processId,
        factoryId,
        likelihood: form.likelihood,
        severity: form.severity,
        velocity: form.velocity,
        rtoImpactHours: form.rtoImpactHours ? parseInt(form.rtoImpactHours) : undefined,
        rpoImpactHours: form.rpoImpactHours ? parseInt(form.rpoImpactHours) : undefined,
        mbcoImpactPercent: form.mbcoImpactPercent ? parseInt(form.mbcoImpactPercent) : undefined,
        treatmentOption: form.treatmentOption || undefined,
        treatmentPlan: form.treatmentPlan || undefined,
      };

      let result;
      if (editingRisk) {
        result = await updateRisk({ id: editingRisk.id, ...input });
      } else {
        result = await createRisk(input);
      }

      if (result.success) {
        toast.success(editingRisk ? "Risque mis à jour" : "Risque créé");
        setShowForm(false);
        setEditingRisk(null);
        const refreshed = await getRisks(factoryId);
        if (refreshed.success && refreshed.data) setRisks(refreshed.data as Risk[]);
      } else {
        toast.error(result.error);
      }
    });
  }

  async function handleStatusChange(id: string, status: RiskStatus) {
    const result = await updateRisk({ id, status });
    if (result.success) {
      setRisks((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
      toast.success("Statut mis à jour");
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteRisk(id);
    if (result.success) {
      setRisks((prev) => prev.filter((r) => r.id !== id));
      toast.success("Risque supprimé");
    }
  }

  function openEdit(r: Risk) {
    setEditingRisk(r);
    setForm({
      title: r.title,
      description: r.description,
      scenario: r.scenario,
      threatSource: r.threatSource || "",
      processId: r.processId,
      likelihood: r.likelihood as RiskLikelihood,
      severity: r.severity as RiskSeverity,
      velocity: r.velocity as RiskVelocity,
      rtoImpactHours: r.rtoImpactHours?.toString() || "",
      rpoImpactHours: r.rpoImpactHours?.toString() || "",
      mbcoImpactPercent: r.mbcoImpactPercent?.toString() || "",
      treatmentOption: (r.treatmentOption as TreatmentOption) || "",
      treatmentPlan: r.treatmentPlan || "",
    });
    setShowForm(true);
  }

  const stats = {
    total: risks.length,
    critical: risks.filter((r) => getRiskLevel(r.riskScore).level === "CRITICAL").length,
    high: risks.filter((r) => getRiskLevel(r.riskScore).level === "HIGH").length,
    open: risks.filter((r) => r.status === "OPEN").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Appréciation des Risques — Continuité</h1>
          <p className="text-sm text-muted-foreground">Matrice hybride configurable · ISO 31000 / BCI GPG</p>
        </div>
        <Button onClick={() => { setEditingRisk(null); setForm({ title: "", description: "", scenario: "", threatSource: "", processId: "", likelihood: "MEDIUM", severity: "MODERATE", velocity: "MODERATE", rtoImpactHours: "", rpoImpactHours: "", mbcoImpactPercent: "", treatmentOption: "", treatmentPlan: "" }); setShowForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau risque
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Critiques", value: stats.critical, color: "text-red-600" },
          { label: "Élevés", value: stats.high, color: "text-orange-600" },
          { label: "Ouverts", value: stats.open, color: "text-blue-600" },
        ].map((s) => (
          <Card key={s.label} className="shadow-sm">
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Légende matrice */}
      <Card className="shadow-sm bg-blue-50/50 border-blue-100">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700">
              <span className="font-semibold">Matrice hybride ISO 31000 / BCI GPG :</span> Score = Vraisemblance (1–5) × Gravité (1–5).
              Critique ≥ 20 · Élevé 12–19 · Moyen 6–11 · Faible &lt; 6. La vitesse d'apparition est prise en compte pour la priorisation.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterLevel} onValueChange={setFilterLevel}>
          <SelectTrigger className="w-[160px]">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Niveau" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous niveaux</SelectItem>
            <SelectItem value="CRITICAL">Critique</SelectItem>
            <SelectItem value="HIGH">Élevé</SelectItem>
            <SelectItem value="MEDIUM">Moyen</SelectItem>
            <SelectItem value="LOW">Faible</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Risk Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ShieldAlert className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Aucun risque enregistré</p>
          </div>
        ) : (
          filtered.map((risk) => {
            const { level, color, label } = getRiskLevel(risk.riskScore);
            const residualLevel = risk.residualScore ? getRiskLevel(risk.residualScore) : null;

            return (
              <Card key={risk.id} className="shadow-sm border">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {/* Risk Score Badge */}
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold text-white"
                          style={{ backgroundColor: color }}
                        >
                          <AlertTriangle className="h-3 w-3" />
                          {label} ({risk.riskScore}/25)
                        </span>
                        {residualLevel && (
                          <span className="text-xs text-muted-foreground">
                            → Résiduel : <span style={{ color: residualLevel.color }} className="font-semibold">{residualLevel.label} ({risk.residualScore})</span>
                          </span>
                        )}
                        <Badge variant="outline" className="text-xs">{VELOCITY_LABELS[risk.velocity as RiskVelocity]}</Badge>
                        <Badge variant="outline" className="text-xs">{RISK_STATUS_LABELS[risk.status as RiskStatus]}</Badge>
                      </div>
                      <h3 className="font-semibold text-sm">{risk.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 italic">Scénario : {risk.scenario}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{risk.description}</p>

                      <div className="mt-2 flex flex-wrap gap-3 text-xs">
                        <span className="text-muted-foreground">
                          Vraisemblance : <span className="font-medium">{LIKELIHOOD_LABELS[risk.likelihood as RiskLikelihood]?.split(" ")[0]}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Gravité : <span className="font-medium">{SEVERITY_LABELS[risk.severity as RiskSeverity]}</span>
                        </span>
                        {risk.rtoImpactHours && (
                          <span className="text-muted-foreground">
                            Impact RTO : <span className="font-medium text-orange-600">+{risk.rtoImpactHours}h</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mt-2">
                        <span className="font-medium">Processus :</span> {risk.process?.name} — {risk.process?.department}
                      </p>
                      {risk.threatSource && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Source :</span> {risk.threatSource}
                        </p>
                      )}
                      {risk.treatmentOption && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Traitement :</span> {TREATMENT_LABELS[risk.treatmentOption as TreatmentOption]}
                          {risk.treatmentPlan && ` — ${risk.treatmentPlan.substring(0, 80)}...`}
                        </p>
                      )}
                    </div>

                    <div className="flex sm:flex-col gap-2 flex-shrink-0">
                      <Select value={risk.status} onValueChange={(v) => handleStatusChange(risk.id, v as RiskStatus)}>
                        <SelectTrigger className="h-7 text-xs w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(["OPEN", "MITIGATED", "ACCEPTED", "CLOSED"] as RiskStatus[]).map((s) => (
                            <SelectItem key={s} value={s}>{RISK_STATUS_LABELS[s]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openEdit(risk)}>Modifier</Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600" onClick={() => handleDelete(risk.id)}>Supprimer</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRisk ? "Modifier le risque" : "Nouveau risque BCM"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre *</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <Label>Scénario de menace *</Label>
              <Input value={form.scenario} onChange={(e) => setForm((f) => ({ ...f, scenario: e.target.value }))} placeholder="Ex: Panne prolongée du datacenter principal" />
            </div>
            <div>
              <Label>Source de menace</Label>
              <Select value={form.threatSource} onValueChange={(v) => setForm((f) => ({ ...f, threatSource: v }))}>
                <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {THREAT_SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Processus concerné *</Label>
              <Select value={form.processId} onValueChange={(v) => setForm((f) => ({ ...f, processId: v }))}>
                <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {processes.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} — {p.department}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
            </div>

            {/* Matrix */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Matrice de risque</p>
                <div
                  className="px-3 py-1 rounded text-sm font-bold text-white"
                  style={{ backgroundColor: previewLevel.color }}
                >
                  Score : {previewScore}/25 — {previewLevel.label}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Vraisemblance *</Label>
                  <Select value={form.likelihood} onValueChange={(v) => setForm((f) => ({ ...f, likelihood: v as RiskLikelihood }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(LIKELIHOOD_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Gravité / Impact *</Label>
                  <Select value={form.severity} onValueChange={(v) => setForm((f) => ({ ...f, severity: v as RiskSeverity }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(SEVERITY_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Vitesse d'apparition</Label>
                  <Select value={form.velocity} onValueChange={(v) => setForm((f) => ({ ...f, velocity: v as RiskVelocity }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(VELOCITY_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Impact on continuity */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Impact RTO (+h)</Label>
                <Input type="number" value={form.rtoImpactHours} onChange={(e) => setForm((f) => ({ ...f, rtoImpactHours: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Impact RPO (+h)</Label>
                <Input type="number" value={form.rpoImpactHours} onChange={(e) => setForm((f) => ({ ...f, rpoImpactHours: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Impact MBCO (%)</Label>
                <Input type="number" value={form.mbcoImpactPercent} onChange={(e) => setForm((f) => ({ ...f, mbcoImpactPercent: e.target.value }))} />
              </div>
            </div>

            {/* Treatment */}
            <div>
              <Label>Option de traitement</Label>
              <Select value={form.treatmentOption} onValueChange={(v) => setForm((f) => ({ ...f, treatmentOption: v as TreatmentOption }))}>
                <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TREATMENT_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.treatmentOption && (
              <div>
                <Label>Plan de traitement</Label>
                <Textarea value={form.treatmentPlan} onChange={(e) => setForm((f) => ({ ...f, treatmentPlan: e.target.value }))} rows={2} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Enregistrement..." : editingRisk ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
