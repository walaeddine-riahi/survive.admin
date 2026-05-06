"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  AlertTriangle, Plus, Search, Zap, CheckCircle2, Clock,
  Filter, RefreshCw, AlertCircle, XCircle, ChevronRight,
  Users, Wrench, Building2, Server, FileText, Truck, BarChart3,
} from "lucide-react";
import {
  getGaps, createGap, updateGap, deleteGap, analyzeFactoryGaps,
} from "@/actions/bcm/gap-analysis-actions";
import {
  GAP_TYPE_LABELS, GAP_TYPE_CATEGORY,
  type CreateGapInput, type GapSeverity, type GapStatus, type GapType, type Gap
} from "@/lib/bcm/gap-analysis-types";

// ─── Config couleurs ──────────────────────────────────────────────────────────
const SEVERITY_CONFIG: Record<GapSeverity, { label: string; color: string; bg: string; text: string }> = {
  CRITICAL: { label: "Critique", color: "#E24B4A", bg: "rgba(226, 75, 74, 0.1)", text: "#E24B4A" },
  HIGH:     { label: "Élevé",    color: "#EF9F27", bg: "rgba(239, 159, 39, 0.1)", text: "#EF9F27" },
  MEDIUM:   { label: "Moyen",   color: "#97C459", bg: "rgba(151, 196, 89, 0.1)", text: "#97C459" },
  LOW:      { label: "Faible",   color: "#1D9E75", bg: "rgba(29, 158, 117, 0.1)", text: "#1D9E75" },
};

const STATUS_CONFIG: Record<GapStatus, { label: string; icon: React.ElementType; color: string }> = {
  IDENTIFIED:  { label: "Identifié", icon: AlertCircle,  color: "#EF9F27" },
  IN_PROGRESS: { label: "En cours",  icon: Clock,         color: "#var(--accent)" },
  RESOLVED:    { label: "Résolu",    icon: CheckCircle2,  color: "#1D9E75" },
  ACCEPTED:    { label: "Accepté",   icon: XCircle,       color: "var(--text-muted)" },
};

const GAP_TYPE_CONFIG: Record<GapType, { icon: React.ElementType; color: string; bg: string }> = {
  RTO_BREACH:      { icon: BarChart3,  color: "#E24B4A", bg: "#FCEBEB" },
  RPO_BREACH:      { icon: BarChart3,  color: "#E24B4A", bg: "#FCEBEB" },
  MTPD_BREACH:     { icon: BarChart3,  color: "#EA580C", bg: "#FFF7ED" },
  MBCO_BREACH:     { icon: BarChart3,  color: "#DA7757", bg: "#FFFBEB" },
  RH_COMPETENCES:  { icon: Users,      color: "#185FA5", bg: "#E6F1FB" },
  EQUIPEMENTS:     { icon: Wrench,     color: "#854F0B", bg: "#FAEEDA" },
  INFRASTRUCTURE:  { icon: Building2,  color: "#3B6D11", bg: "#EAF3DE" },
  APPLICATIONS_IT: { icon: Server,     color: "#534AB7", bg: "#EEEDFE" },
  DOCUMENTATION:   { icon: FileText,   color: "#0F6E56", bg: "#E1F5EE" },
  SUPPLY_CHAIN:    { icon: Truck,      color: "#993556", bg: "#FBEAF0" },
};

const ALL_GAP_TYPES = Object.keys(GAP_TYPE_LABELS) as GapType[];

// type Gap = Awaited<ReturnType<typeof getGaps>>["data"] extends (infer T)[] ? T : never;

interface FormData {
  title: string;
  description: string;
  gapType: GapType;
  severity: GapSeverity;
  currentValue: string;
  targetValue: string;
  gap: string;
  recommendation: string;
  processId: string;
}

export default function GapAnalysisClient({
  initialGaps, processes, factoryId,
}: {
  initialGaps: Gap[];
  processes: { id: string; name: string; department: string; criticality: string }[];
  factoryId?: string;
}) {
  const [gaps, setGaps] = useState<Gap[]>(initialGaps);
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingGap, setEditingGap] = useState<Gap | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [form, setForm] = useState<FormData>({
    title: "", description: "", gapType: "RTO_BREACH", severity: "HIGH",
    currentValue: "", targetValue: "", gap: "", recommendation: "", processId: "",
  });

  const filtered = gaps.filter(g => {
    const matchSearch = g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.process?.name?.toLowerCase().includes(search.toLowerCase());
    const matchSev = filterSeverity === "all" || g.severity === filterSeverity;
    const matchSt  = filterStatus === "all" || g.status === filterStatus;
    const matchCat = filterCategory === "all" ||
      (filterCategory === "metric" && GAP_TYPE_CATEGORY[g.gapType as GapType] === "metric") ||
      (filterCategory === "resource" && GAP_TYPE_CATEGORY[g.gapType as GapType] === "resource") ||
      g.gapType === filterCategory;
    return matchSearch && matchSev && matchSt && matchCat;
  });

  // Stats
  const stats = {
    total: gaps.length,
    critical: gaps.filter(g => g.severity === "CRITICAL").length,
    open: gaps.filter(g => g.status === "IDENTIFIED" || g.status === "IN_PROGRESS").length,
    resolved: gaps.filter(g => g.status === "RESOLVED").length,
    byType: Object.fromEntries(ALL_GAP_TYPES.map(t => [t, gaps.filter(g => g.gapType === t).length])),
  };

  async function handleAutoAnalyze() {
    if (!factoryId) { toast.error("Sélectionnez un site pour l'analyse automatique"); return; }
    setIsAnalyzing(true);
    const result = await analyzeFactoryGaps(factoryId);
    if (result.success) {
      toast.success(`Analyse terminée : ${result.data?.totalGapsDetected} écart(s) sur ${result.data?.processesAnalyzed} processus`);
      const refreshed = await getGaps(factoryId);
      if (refreshed.success && refreshed.data) setGaps(refreshed.data as Gap[]);
    } else toast.error(result.error);
    setIsAnalyzing(false);
  }

  async function handleSubmit() {
    if (!form.title || !form.processId) { toast.error("Titre et processus requis"); return; }
    startTransition(async () => {
      const input: CreateGapInput = { ...form, factoryId };
      const result = editingGap
        ? await updateGap({ id: editingGap.id, ...input })
        : await createGap(input);
      if (result.success) {
        toast.success(editingGap ? "Écart mis à jour" : "Écart créé");
        setShowForm(false); setEditingGap(null);
        const refreshed = await getGaps(factoryId);
        if (refreshed.success && refreshed.data) setGaps(refreshed.data as Gap[]);
      } else toast.error(result.error);
    });
  }

  async function handleStatusChange(gapId: string, status: GapStatus) {
    const result = await updateGap({ id: gapId, status });
    if (result.success) {
      setGaps(prev => prev.map(g => g.id === gapId ? { ...g, status } : g));
      toast.success("Statut mis à jour");
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteGap(id);
    if (result.success) { setGaps(prev => prev.filter(g => g.id !== id)); toast.success("Écart supprimé"); }
  }

  function openEdit(gap: Gap) {
    setEditingGap(gap);
    setForm({
      title: gap.title, description: gap.description,
      gapType: gap.gapType as GapType, severity: gap.severity as GapSeverity,
      currentValue: gap.currentValue || "", targetValue: gap.targetValue || "",
      gap: gap.gap || "", recommendation: gap.recommendation || "", processId: gap.processId,
    });
    setShowForm(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-[var(--bg-surface)] p-8 rounded-2xl border border-[var(--border)] shadow-sm">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">Analyse des Écarts BIA</h1>
          <p className="text-sm text-[var(--text-muted)] font-medium mt-1">
            Comparaison existant vs exigences — ISO 22301 / ISO 22317
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleAutoAnalyze} disabled={isAnalyzing} className="gap-2 border-[var(--border)] font-bold rounded-[12px] h-11">
            {isAnalyzing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
            Analyse IA automatique
          </Button>
          <Button onClick={() => { setEditingGap(null); setForm({ title:"",description:"",gapType:"RTO_BREACH",severity:"HIGH",currentValue:"",targetValue:"",gap:"",recommendation:"",processId:"" }); setShowForm(true); }} className="gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] font-bold rounded-[12px] h-11">
            <Plus className="h-4 w-4" /> Ajouter un écart
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total écarts",  value: stats.total,    color: "text-foreground" },
          { label: "Critiques",     value: stats.critical, color: "text-red-600" },
          { label: "Ouverts",       value: stats.open,     color: "text-orange-600" },
          { label: "Résolus",       value: stats.resolved, color: "text-green-600" },
        ].map(s => (
          <Card key={s.label} className="border border-[var(--border)] bg-[var(--bg-surface)] shadow-sm hover:shadow-md transition-all rounded-xl">
            <div className="p-5 text-center">
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-muted)] mt-1">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Type breakdown pills */}
      <div className="flex flex-wrap gap-2">
        {ALL_GAP_TYPES.map(type => {
          const cfg = GAP_TYPE_CONFIG[type];
          const Icon = cfg.icon;
          const count = stats.byType[type];
          if (count === 0) return null;
          return (
            <button key={type}
              onClick={() => setFilterCategory(filterCategory === type ? "all" : type)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
              style={{
                background: filterCategory === type ? cfg.color : cfg.bg,
                color: filterCategory === type ? "white" : cfg.color,
                borderColor: cfg.color,
              }}>
              <Icon style={{ width: 12, height: 12 }} />
              {GAP_TYPE_LABELS[type]} ({count})
            </button>
          );
        })}
        {filterCategory !== "all" && (
          <button onClick={() => setFilterCategory("all")}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-muted-foreground border border-dashed">
            <XCircle className="h-3 w-3" /> Tous
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-1 text-muted-foreground" /><SelectValue placeholder="Sévérité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes sévérités</SelectItem>
            {(["CRITICAL","HIGH","MEDIUM","LOW"] as GapSeverity[]).map(s =>
              <SelectItem key={s} value={s}>{SEVERITY_CONFIG[s].label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            {(["IDENTIFIED","IN_PROGRESS","RESOLVED","ACCEPTED"] as GapStatus[]).map(s =>
              <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Gap Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
            <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucun écart trouvé</p>
            <p className="text-xs mt-1">Lancez l'analyse automatique ou ajoutez manuellement</p>
          </div>
        ) : (
          filtered.map(gap => {
            const sev = SEVERITY_CONFIG[gap.severity as GapSeverity];
            const stat = STATUS_CONFIG[gap.status as GapStatus];
            const typeCfg = GAP_TYPE_CONFIG[gap.gapType as GapType];
            const TypeIcon = typeCfg?.icon ?? AlertTriangle;
            const StatIcon = stat.icon;
            const gapClosure = gap.strategies?.length > 0
              ? Math.round(gap.strategies.reduce((s: number, st: { gapClosurePercent: number }) => s + st.gapClosurePercent, 0) / gap.strategies.length)
              : 0;

            return (
              <Card key={gap.id} className="shadow-sm border-l-4" style={{ borderLeftColor: sev.color }}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {/* Type badge */}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: typeCfg?.bg, color: typeCfg?.color }}>
                          <TypeIcon style={{ width: 10, height: 10 }} />
                          {GAP_TYPE_LABELS[gap.gapType as GapType]}
                        </span>
                        {/* Severity */}
                        <span className="text-xs font-semibold px-2 py-0.5 rounded"
                          style={{ background: sev.bg, color: sev.text }}>
                          {sev.label}
                        </span>
                        {/* Status */}
                        <span className="flex items-center gap-1 text-xs" style={{ color: stat.color }}>
                          <StatIcon className="h-3 w-3" />{stat.label}
                        </span>
                      </div>

                      <h3 className="font-semibold text-sm">{gap.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{gap.description}</p>

                      {/* Current vs Target */}
                      {(gap.currentValue || gap.targetValue) && (
                        <div className="mt-2 flex items-center gap-2 text-xs flex-wrap">
                          {gap.currentValue && (
                            <span className="px-2 py-0.5 rounded" style={{ background: "#FCEBEB", color: "#A32D2D" }}>
                              {gap.currentValue}
                            </span>
                          )}
                          {gap.targetValue && (
                            <>
                              <ChevronRight className="h-3 w-3 text-muted-foreground" />
                              <span className="px-2 py-0.5 rounded" style={{ background: "#E1F5EE", color: "#0F6E56" }}>
                                {gap.targetValue}
                              </span>
                            </>
                          )}
                          {gap.gap && <span className="text-muted-foreground">({gap.gap})</span>}
                        </div>
                      )}

                      {gap.recommendation && (
                        <p className="text-xs text-muted-foreground mt-2 italic line-clamp-2">
                          💡 {gap.recommendation}
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground mt-2">
                        <span className="font-medium">Processus :</span>{" "}
                        {gap.process?.name} — {gap.process?.department}
                      </p>

                      {/* Gap Closure */}
                      {gap.strategies?.length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground flex-shrink-0">Gap closure :</span>
                          <Progress value={gapClosure} className="h-1.5 w-20" />
                          <span className="text-xs font-semibold" style={{
                            color: gapClosure >= 70 ? "#0F6E56" : gapClosure >= 40 ? "#854F0B" : "#A32D2D"
                          }}>{gapClosure}%</span>
                          <span className="text-xs text-muted-foreground">
                            ({gap.strategies.length} stratégie{gap.strategies.length > 1 ? "s" : ""})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2 flex-shrink-0">
                      <Select value={gap.status} onValueChange={v => handleStatusChange(gap.id, v as GapStatus)}>
                        <SelectTrigger className="h-7 text-xs w-[130px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(["IDENTIFIED","IN_PROGRESS","RESOLVED","ACCEPTED"] as GapStatus[]).map(s =>
                            <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openEdit(gap)}>Modifier</Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600" onClick={() => handleDelete(gap.id)}>Supprimer</Button>
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGap ? "Modifier l'écart" : "Ajouter un écart"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre *</Label>
              <Input className="mt-1" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Type d'écart</Label>
                <Select value={form.gapType} onValueChange={v => setForm(f => ({ ...f, gapType: v as GapType }))}>
                  <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RTO_BREACH" disabled className="text-xs font-semibold text-muted-foreground">── Métriques BIA ──</SelectItem>
                    {(["RTO_BREACH","RPO_BREACH","MTPD_BREACH","MBCO_BREACH"] as GapType[]).map(t =>
                      <SelectItem key={t} value={t} className="text-xs">{GAP_TYPE_LABELS[t]}</SelectItem>)}
                    <SelectItem value="RH_COMPETENCES" disabled className="text-xs font-semibold text-muted-foreground">── Ressources ──</SelectItem>
                    {(["RH_COMPETENCES","EQUIPEMENTS","INFRASTRUCTURE","APPLICATIONS_IT","DOCUMENTATION","SUPPLY_CHAIN"] as GapType[]).map(t =>
                      <SelectItem key={t} value={t} className="text-xs">{GAP_TYPE_LABELS[t]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Sévérité</Label>
                <Select value={form.severity} onValueChange={v => setForm(f => ({ ...f, severity: v as GapSeverity }))}>
                  <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["CRITICAL","HIGH","MEDIUM","LOW"] as GapSeverity[]).map(s =>
                      <SelectItem key={s} value={s}>{SEVERITY_CONFIG[s].label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Processus *</Label>
              <Select value={form.processId} onValueChange={v => setForm(f => ({ ...f, processId: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {processes.map(p => <SelectItem key={p.id} value={p.id}>{p.name} — {p.department}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea className="mt-1" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Valeur actuelle</Label>
                <Input className="mt-1 h-8 text-xs" value={form.currentValue} onChange={e => setForm(f => ({ ...f, currentValue: e.target.value }))} placeholder="Ex: RTO actuel: 48h" />
              </div>
              <div>
                <Label className="text-xs">Valeur cible</Label>
                <Input className="mt-1 h-8 text-xs" value={form.targetValue} onChange={e => setForm(f => ({ ...f, targetValue: e.target.value }))} placeholder="Ex: RTO cible: 4h" />
              </div>
            </div>
            <div>
              <Label>Recommandation</Label>
              <Textarea className="mt-1" value={form.recommendation} onChange={e => setForm(f => ({ ...f, recommendation: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Enregistrement..." : editingGap ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
