"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Plus, Users, Server, Building2, Truck, Target,
  ChevronRight, CheckCircle2, AlertCircle,
} from "lucide-react";
import {
  createStrategy, updateStrategy, deleteStrategy, getStrategies,
  RESOURCE_CATEGORY_CONFIG, STRATEGY_STATUS_CONFIG,
  type ResourceCategory, type StrategyStatus, type CreateStrategyInput, type ResourceDetails,
} from "@/actions/bcm/strategy-actions";

type Strategy = Awaited<ReturnType<typeof getStrategies>>["data"] extends (infer T)[] ? T : never;

const CATEGORY_ICONS: Record<ResourceCategory, React.ElementType> = {
  RH: Users,
  IT: Server,
  LOCAUX: Building2,
  FOURNISSEURS: Truck,
};

interface FormData {
  title: string;
  description: string;
  resourceCategory: ResourceCategory;
  status: StrategyStatus;
  processId: string;
  gapClosurePercent: number;
  estimatedCost: string;
  fallbackSolution: string;
  fallbackLocation: string;
  activationDelayHours: string;
  notes: string;
  plannedDate: string;
  // Resource-specific fields
  resourceDetails: ResourceDetails;
}

const DEFAULT_FORM: FormData = {
  title: "", description: "", resourceCategory: "RH", status: "PLANNED",
  processId: "", gapClosurePercent: 0, estimatedCost: "",
  fallbackSolution: "", fallbackLocation: "", activationDelayHours: "", notes: "", plannedDate: "",
  resourceDetails: {},
};

function CategoryStat({ category, stats, count }: {
  category: ResourceCategory;
  stats: { total: number; implemented: number; avgClosure: number };
  count: number;
}) {
  const cfg = RESOURCE_CATEGORY_CONFIG[category];
  const Icon = CATEGORY_ICONS[category];
  return (
    <div className={`rounded-lg border p-4 ${cfg.bg}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${cfg.color}`} />
        <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
        <Badge variant="secondary" className="ml-auto text-xs">{count}</Badge>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Gap closure</span>
          <span className={`font-bold ${cfg.color}`}>{stats.avgClosure}%</span>
        </div>
        <Progress value={stats.avgClosure} className="h-1.5" />
        <p className="text-xs text-muted-foreground">{stats.implemented}/{stats.total} implémentée(s)</p>
      </div>
    </div>
  );
}

function ResourceDetailsForm({ category, details, onChange }: {
  category: ResourceCategory;
  details: ResourceDetails;
  onChange: (d: ResourceDetails) => void;
}) {
  function set(field: string, value: unknown) {
    onChange({ ...details, [field]: value });
  }

  if (category === "RH") return (
    <div className="space-y-3 border rounded-lg p-3 bg-blue-50/40">
      <p className="text-xs font-semibold text-blue-700">Détails RH — Solutions de repli personnel</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Personnel de remplacement</Label>
          <Input className="mt-1 h-8 text-xs" value={details.backup_staff || ""} onChange={(e) => set("backup_staff", e.target.value)} placeholder="Nom / Equipe" />
        </div>
        <div>
          <Label className="text-xs">Effectif minimum requis</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={details.min_staff_count || ""} onChange={(e) => set("min_staff_count", parseInt(e.target.value))} />
        </div>
        <div>
          <Label className="text-xs">Pool externe (interim...)</Label>
          <Input className="mt-1 h-8 text-xs" value={details.external_pool || ""} onChange={(e) => set("external_pool", e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Délai de préavis (jours)</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={details.notice_period_days || ""} onChange={(e) => set("notice_period_days", parseInt(e.target.value))} />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <Switch checked={!!details.cross_training} onCheckedChange={(v) => set("cross_training", v)} />
          <Label className="text-xs">Polyvalence / cross-training en place</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={!!details.remote_work} onCheckedChange={(v) => set("remote_work", v)} />
          <Label className="text-xs">Télétravail possible</Label>
        </div>
      </div>
    </div>
  );

  if (category === "IT") return (
    <div className="space-y-3 border rounded-lg p-3 bg-purple-50/40">
      <p className="text-xs font-semibold text-purple-700">Détails IT — Reprise des systèmes</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Système de secours / DRP</Label>
          <Input className="mt-1 h-8 text-xs" value={details.backup_system || ""} onChange={(e) => set("backup_system", e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Site de bascule</Label>
          <Input className="mt-1 h-8 text-xs" value={details.failover_location || ""} onChange={(e) => set("failover_location", e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">RTO cible IT (h)</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={details.rto_target_h || ""} onChange={(e) => set("rto_target_h", parseInt(e.target.value))} />
        </div>
        <div>
          <Label className="text-xs">RPO cible IT (h)</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={details.rpo_target_h || ""} onChange={(e) => set("rpo_target_h", parseInt(e.target.value))} />
        </div>
        <div>
          <Label className="text-xs">Fréquence sauvegarde</Label>
          <Input className="mt-1 h-8 text-xs" value={details.backup_frequency || ""} onChange={(e) => set("backup_frequency", e.target.value)} placeholder="Ex: Toutes les 4h" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={!!details.data_replication} onCheckedChange={(v) => set("data_replication", v)} />
        <Label className="text-xs">Réplication de données en temps réel</Label>
      </div>
    </div>
  );

  if (category === "LOCAUX") return (
    <div className="space-y-3 border rounded-lg p-3 bg-orange-50/40">
      <p className="text-xs font-semibold text-orange-700">Détails Locaux — Site de repli</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Site de repli</Label>
          <Input className="mt-1 h-8 text-xs" value={details.backup_site || ""} onChange={(e) => set("backup_site", e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Adresse</Label>
          <Input className="mt-1 h-8 text-xs" value={details.backup_site_address || ""} onChange={(e) => set("backup_site_address", e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Capacité d'accueil (%)</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={details.capacity_percent || ""} onChange={(e) => set("capacity_percent", parseInt(e.target.value))} />
        </div>
        <div>
          <Label className="text-xs">Distance (km)</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={details.distance_km || ""} onChange={(e) => set("distance_km", parseInt(e.target.value))} />
        </div>
        <div>
          <Label className="text-xs">Délai d'activation (h)</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={details.activation_delay_h || ""} onChange={(e) => set("activation_delay_h", parseInt(e.target.value))} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={!!details.equipment_available} onCheckedChange={(v) => set("equipment_available", v)} />
        <Label className="text-xs">Équipements disponibles sur site de repli</Label>
      </div>
    </div>
  );

  if (category === "FOURNISSEURS") return (
    <div className="space-y-3 border rounded-lg p-3 bg-green-50/40">
      <p className="text-xs font-semibold text-green-700">Détails Fournisseurs — Solution alternative</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Fournisseur de secours</Label>
          <Input className="mt-1 h-8 text-xs" value={details.backup_supplier || ""} onChange={(e) => set("backup_supplier", e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Contact</Label>
          <Input className="mt-1 h-8 text-xs" value={details.backup_supplier_contact || ""} onChange={(e) => set("backup_supplier_contact", e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Délai d'approvisionnement (jours)</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={details.lead_time_days || ""} onChange={(e) => set("lead_time_days", parseInt(e.target.value))} />
        </div>
        <div>
          <Label className="text-xs">Type de contrat</Label>
          <Input className="mt-1 h-8 text-xs" value={details.contract_type || ""} onChange={(e) => set("contract_type", e.target.value)} placeholder="Ex: Standby, Cadre..." />
        </div>
        <div>
          <Label className="text-xs">RTO SLA fournisseur (h)</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={details.sla_rto_h || ""} onChange={(e) => set("sla_rto_h", parseInt(e.target.value))} />
        </div>
        <div>
          <Label className="text-xs">Zone géographique</Label>
          <Input className="mt-1 h-8 text-xs" value={details.geographical_zone || ""} onChange={(e) => set("geographical_zone", e.target.value)} placeholder="Ex: Tunisie, Europe..." />
        </div>
      </div>
    </div>
  );

  return null;
}

function StrategyCard({ strategy, onStatusChange, onEdit, onDelete }: {
  strategy: Strategy;
  onStatusChange: (id: string, s: StrategyStatus) => void;
  onEdit: (s: Strategy) => void;
  onDelete: (id: string) => void;
}) {
  const cfg = RESOURCE_CATEGORY_CONFIG[strategy.resourceCategory as ResourceCategory];
  const statusCfg = STRATEGY_STATUS_CONFIG[strategy.status as StrategyStatus];
  const details = strategy.resourceDetails as ResourceDetails | null;

  return (
    <Card className={`shadow-sm border ${cfg.bg}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge className={`text-xs ${statusCfg.color}`}>{statusCfg.label}</Badge>
              {strategy.gap && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {strategy.gap.title}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-sm">{strategy.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{strategy.description}</p>

            {/* Fallback */}
            {strategy.fallbackSolution && (
              <div className="mt-2 flex items-start gap-1 text-xs">
                <ChevronRight className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground"><span className="font-medium">Solution de repli :</span> {strategy.fallbackSolution}</span>
              </div>
            )}
            {strategy.fallbackLocation && (
              <p className="text-xs text-muted-foreground mt-0.5 pl-4">📍 {strategy.fallbackLocation}</p>
            )}
            {strategy.activationDelayHours && (
              <p className="text-xs text-muted-foreground mt-0.5 pl-4">⏱ Activation : {strategy.activationDelayHours}h</p>
            )}

            {/* Key resource details */}
            {details && (
              <div className="mt-2 flex flex-wrap gap-2">
                {details.cross_training && <Badge variant="outline" className="text-xs">✓ Cross-training</Badge>}
                {details.remote_work && <Badge variant="outline" className="text-xs">✓ Télétravail</Badge>}
                {details.data_replication && <Badge variant="outline" className="text-xs">✓ Réplication données</Badge>}
                {details.backup_site && <Badge variant="outline" className="text-xs">📍 {details.backup_site}</Badge>}
                {details.backup_supplier && <Badge variant="outline" className="text-xs">🏢 {details.backup_supplier}</Badge>}
                {details.rto_target_h && <Badge variant="outline" className="text-xs">RTO IT: {details.rto_target_h}h</Badge>}
                {details.lead_time_days && <Badge variant="outline" className="text-xs">⏱ {details.lead_time_days}j livraison</Badge>}
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-2">
              <span className="font-medium">Processus :</span> {strategy.process?.name} — {strategy.process?.department}
            </p>

            {/* Gap Closure */}
            <div className="mt-2 flex items-center gap-2">
              <Progress value={strategy.gapClosurePercent} className="h-1.5 flex-1" />
              <span className={`text-xs font-bold flex-shrink-0 ${
                strategy.gapClosurePercent >= 80 ? "text-green-600" :
                strategy.gapClosurePercent >= 50 ? "text-yellow-600" : "text-red-600"
              }`}>{strategy.gapClosurePercent}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-current/10">
          <Select value={strategy.status} onValueChange={(v) => onStatusChange(strategy.id, v as StrategyStatus)}>
            <SelectTrigger className="h-7 text-xs w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(STRATEGY_STATUS_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onEdit(strategy)}>Modifier</Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600" onClick={() => onDelete(strategy.id)}>Supprimer</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StrategiesClientV2({
  initialStrategies, processes, gaps, factoryId,
}: {
  initialStrategies: Strategy[];
  processes: { id: string; name: string; department: string }[];
  gaps: { id: string; title: string; severity: string }[];
  factoryId?: string;
}) {
  const [strategies, setStrategies] = useState<Strategy[]>(initialStrategies);
  const [showForm, setShowForm] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
  const [activeCategory, setActiveCategory] = useState<ResourceCategory>("RH");
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [isPending, startTransition] = useTransition();

  const byCategory: Record<ResourceCategory, Strategy[]> = {
    RH: strategies.filter((s) => s.resourceCategory === "RH"),
    IT: strategies.filter((s) => s.resourceCategory === "IT"),
    LOCAUX: strategies.filter((s) => s.resourceCategory === "LOCAUX"),
    FOURNISSEURS: strategies.filter((s) => s.resourceCategory === "FOURNISSEURS"),
  };

  const categoryStats = {
    RH: { total: byCategory.RH.length, implemented: byCategory.RH.filter(s => ["IMPLEMENTED","TESTED","VALIDATED"].includes(s.status)).length, avgClosure: byCategory.RH.length > 0 ? Math.round(byCategory.RH.reduce((a,s) => a+s.gapClosurePercent,0)/byCategory.RH.length) : 0 },
    IT: { total: byCategory.IT.length, implemented: byCategory.IT.filter(s => ["IMPLEMENTED","TESTED","VALIDATED"].includes(s.status)).length, avgClosure: byCategory.IT.length > 0 ? Math.round(byCategory.IT.reduce((a,s) => a+s.gapClosurePercent,0)/byCategory.IT.length) : 0 },
    LOCAUX: { total: byCategory.LOCAUX.length, implemented: byCategory.LOCAUX.filter(s => ["IMPLEMENTED","TESTED","VALIDATED"].includes(s.status)).length, avgClosure: byCategory.LOCAUX.length > 0 ? Math.round(byCategory.LOCAUX.reduce((a,s) => a+s.gapClosurePercent,0)/byCategory.LOCAUX.length) : 0 },
    FOURNISSEURS: { total: byCategory.FOURNISSEURS.length, implemented: byCategory.FOURNISSEURS.filter(s => ["IMPLEMENTED","TESTED","VALIDATED"].includes(s.status)).length, avgClosure: byCategory.FOURNISSEURS.length > 0 ? Math.round(byCategory.FOURNISSEURS.reduce((a,s) => a+s.gapClosurePercent,0)/byCategory.FOURNISSEURS.length) : 0 },
  };

  const globalAvgClosure = strategies.length > 0
    ? Math.round(strategies.reduce((a,s) => a+s.gapClosurePercent,0)/strategies.length) : 0;

  async function handleSubmit() {
    if (!form.title || !form.processId) {
      toast.error("Titre et processus requis");
      return;
    }
    startTransition(async () => {
      const input: CreateStrategyInput = {
        title: form.title, description: form.description,
        resourceCategory: form.resourceCategory, status: form.status,
        processId: form.processId, factoryId,
        resourceDetails: form.resourceDetails,
        fallbackSolution: form.fallbackSolution || undefined,
        fallbackLocation: form.fallbackLocation || undefined,
        activationDelayHours: form.activationDelayHours ? parseInt(form.activationDelayHours) : undefined,
        estimatedCost: form.estimatedCost ? parseFloat(form.estimatedCost) : undefined,
        gapClosurePercent: form.gapClosurePercent,
        notes: form.notes || undefined,
        plannedDate: form.plannedDate || undefined,
      };

      const result = editingStrategy
        ? await updateStrategy({ id: editingStrategy.id, ...input })
        : await createStrategy(input);

      if (result.success) {
        toast.success(editingStrategy ? "Stratégie mise à jour" : "Stratégie créée");
        setShowForm(false); setEditingStrategy(null);
        const refreshed = await getStrategies(factoryId);
        if (refreshed.success && refreshed.data) setStrategies(refreshed.data as Strategy[]);
      } else {
        toast.error(result.error);
      }
    });
  }

  async function handleStatusChange(id: string, status: StrategyStatus) {
    await updateStrategy({ id, status });
    setStrategies(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  }

  async function handleDelete(id: string) {
    await deleteStrategy(id);
    setStrategies(prev => prev.filter(s => s.id !== id));
    toast.success("Stratégie supprimée");
  }

  function openNew(category: ResourceCategory) {
    setEditingStrategy(null);
    setForm({ ...DEFAULT_FORM, resourceCategory: category });
    setActiveCategory(category);
    setShowForm(true);
  }

  function openEdit(s: Strategy) {
    setEditingStrategy(s);
    setForm({
      title: s.title, description: s.description,
      resourceCategory: s.resourceCategory as ResourceCategory,
      status: s.status as StrategyStatus,
      processId: s.processId,
      gapClosurePercent: s.gapClosurePercent,
      estimatedCost: s.estimatedCost?.toString() || "",
      fallbackSolution: s.fallbackSolution || "",
      fallbackLocation: s.fallbackLocation || "",
      activationDelayHours: s.activationDelayHours?.toString() || "",
      notes: s.notes || "",
      plannedDate: s.plannedDate ? new Date(s.plannedDate).toISOString().split("T")[0] : "",
      resourceDetails: (s.resourceDetails as ResourceDetails) || {},
    });
    setShowForm(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Stratégies & Solutions de Continuité</h1>
          <p className="text-sm text-muted-foreground">Par catégorie de ressource — RH · IT · Locaux · Fournisseurs</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <p className="text-lg font-bold text-blue-700">{globalAvgClosure}%</p>
            <p className="text-xs text-muted-foreground">Gap closure global</p>
          </div>
          <Button onClick={() => openNew(activeCategory as ResourceCategory)} className="gap-2">
            <Plus className="h-4 w-4" /> Nouvelle stratégie
          </Button>
        </div>
      </div>

      {/* Category overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["RH", "IT", "LOCAUX", "FOURNISSEURS"] as ResourceCategory[]).map((cat) => (
          <CategoryStat key={cat} category={cat} stats={categoryStats[cat]} count={byCategory[cat].length} />
        ))}
      </div>

      {/* Tabs by resource category */}
      <Tabs defaultValue="RH" onValueChange={(v) => setActiveCategory(v as ResourceCategory)}>
        <TabsList className="grid grid-cols-4 w-full">
          {(["RH", "IT", "LOCAUX", "FOURNISSEURS"] as ResourceCategory[]).map((cat) => {
            const Icon = CATEGORY_ICONS[cat];
            const cfg = RESOURCE_CATEGORY_CONFIG[cat];
            return (
              <TabsTrigger key={cat} value={cat} className="gap-1.5 text-xs">
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{cfg.label}</span>
                <span className="sm:hidden">{cat}</span>
                {byCategory[cat].length > 0 && (
                  <Badge variant="secondary" className="text-xs ml-0.5">{byCategory[cat].length}</Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(["RH", "IT", "LOCAUX", "FOURNISSEURS"] as ResourceCategory[]).map((cat) => {
          const cfg = RESOURCE_CATEGORY_CONFIG[cat];
          return (
            <TabsContent key={cat} value={cat} className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">{cfg.description}</p>
                <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => openNew(cat)}>
                  <Plus className="h-3 w-3" /> Ajouter
                </Button>
              </div>
              {byCategory[cat].length === 0 ? (
                <div className={`rounded-lg border-2 border-dashed p-8 text-center ${cfg.bg}`}>
                  {(() => { const Icon = CATEGORY_ICONS[cat]; return <Icon className={`h-8 w-8 mx-auto mb-2 opacity-40 ${cfg.color}`} />; })()}
                  <p className="text-sm text-muted-foreground">Aucune stratégie {cfg.label} définie</p>
                  <Button size="sm" variant="outline" className="mt-3 gap-1" onClick={() => openNew(cat)}>
                    <Plus className="h-3 w-3" /> Créer la première
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {byCategory[cat].map((s) => (
                    <StrategyCard key={s.id} strategy={s}
                      onStatusChange={handleStatusChange}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStrategy ? "Modifier la stratégie" : "Nouvelle stratégie de continuité"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Catégorie de ressource</Label>
                <Select value={form.resourceCategory} onValueChange={(v) => setForm(f => ({ ...f, resourceCategory: v as ResourceCategory, resourceDetails: {} }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["RH", "IT", "LOCAUX", "FOURNISSEURS"] as ResourceCategory[]).map((c) => (
                      <SelectItem key={c} value={c}>{RESOURCE_CATEGORY_CONFIG[c].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Statut</Label>
                <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v as StrategyStatus }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STRATEGY_STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Titre *</Label>
              <Input className="mt-1" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <Label>Processus concerné *</Label>
              <Select value={form.processId} onValueChange={(v) => setForm(f => ({ ...f, processId: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {processes.map(p => <SelectItem key={p.id} value={p.id}>{p.name} — {p.department}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea className="mt-1" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
            </div>

            {/* Resource-specific fields */}
            <ResourceDetailsForm
              category={form.resourceCategory}
              details={form.resourceDetails}
              onChange={(d) => setForm(f => ({ ...f, resourceDetails: d }))}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Solution de repli principale</Label>
                <Input className="mt-1" value={form.fallbackSolution} onChange={(e) => setForm(f => ({ ...f, fallbackSolution: e.target.value }))} placeholder="Décrivez la solution" />
              </div>
              <div>
                <Label>Délai d'activation (h)</Label>
                <Input type="number" className="mt-1" value={form.activationDelayHours} onChange={(e) => setForm(f => ({ ...f, activationDelayHours: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Gap closure % (0–100)</Label>
                <Input type="number" min={0} max={100} className="mt-1" value={form.gapClosurePercent} onChange={(e) => setForm(f => ({ ...f, gapClosurePercent: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label>Coût estimé (TND)</Label>
                <Input type="number" className="mt-1" value={form.estimatedCost} onChange={(e) => setForm(f => ({ ...f, estimatedCost: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea className="mt-1" value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Enregistrement..." : editingStrategy ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
