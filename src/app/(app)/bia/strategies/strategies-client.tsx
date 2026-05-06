"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Plus, Search, CheckCircle2, Clock, Target, Shield,
  Users, Server, Building2, Package, Truck, FileText, Filter,
} from "lucide-react";
import {
  createStrategy, updateStrategy, deleteStrategy, getStrategies,
} from "@/actions/bcm/strategy-actions";
import {
  type CreateStrategyInput, type StrategyType, type StrategyStatus,
  STRATEGY_TYPE_LABELS, STRATEGY_STATUS_LABELS,
} from "@/lib/bcm/strategy-types";

const STRATEGY_ICONS: Record<StrategyType, React.ElementType> = {
  REDUNDANCY: Server,
  OUTSOURCING: Truck,
  BACKUP_SITE: Building2,
  MANUAL_WORKAROUND: FileText,
  STAFF_CROSS_TRAIN: Users,
  SUPPLIER_BACKUP: Package,
  IT_RECOVERY: Server,
  INSURANCE: Shield,
  OTHER: Target,
};

const STATUS_COLORS: Record<StrategyStatus, string> = {
  PLANNED: "bg-gray-100 text-gray-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  IMPLEMENTED: "bg-green-100 text-green-700",
  TESTED: "bg-purple-100 text-purple-700",
  VALIDATED: "bg-emerald-100 text-emerald-700",
};

type Strategy = Awaited<ReturnType<typeof getStrategies>>["data"] extends (infer T)[] ? T : never;

interface FormData {
  title: string;
  description: string;
  strategyType: StrategyType;
  status: StrategyStatus;
  processId: string;
  gapClosurePercent: number;
  estimatedCost: string;
  notes: string;
  plannedDate: string;
}

export default function StrategiesClient({
  initialStrategies,
  processes,
  gaps,
  factoryId,
}: {
  initialStrategies: Strategy[];
  processes: { id: string; name: string; department: string }[];
  gaps: { id: string; title: string; severity: string }[];
  factoryId?: string;
}) {
  const [strategies, setStrategies] = useState<Strategy[]>(initialStrategies);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<FormData>({
    title: "", description: "", strategyType: "BACKUP_SITE", status: "PLANNED",
    processId: "", gapClosurePercent: 0, estimatedCost: "", notes: "", plannedDate: "",
  });

  const filtered = strategies.filter((s) => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.process?.name.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || s.strategyType === filterType;
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  async function handleSubmit() {
    if (!form.title || !form.processId) {
      toast.error("Titre et processus requis");
      return;
    }

    startTransition(async () => {
      const input: CreateStrategyInput = {
        title: form.title,
        description: form.description,
        strategyType: form.strategyType,
        status: form.status,
        processId: form.processId,
        factoryId,
        gapClosurePercent: form.gapClosurePercent,
        estimatedCost: form.estimatedCost ? parseFloat(form.estimatedCost) : undefined,
        notes: form.notes,
        plannedDate: form.plannedDate || undefined,
      };

      let result;
      if (editingStrategy) {
        result = await updateStrategy({ id: editingStrategy.id, ...input });
      } else {
        result = await createStrategy(input);
      }

      if (result.success) {
        toast.success(editingStrategy ? "Stratégie mise à jour" : "Stratégie créée");
        setShowForm(false);
        setEditingStrategy(null);
        const refreshed = await getStrategies(factoryId);
        if (refreshed.success && refreshed.data) setStrategies(refreshed.data as Strategy[]);
      } else {
        toast.error(result.error);
      }
    });
  }

  async function handleStatusChange(id: string, status: StrategyStatus) {
    const result = await updateStrategy({ id, status });
    if (result.success) {
      setStrategies((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
      toast.success("Statut mis à jour");
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteStrategy(id);
    if (result.success) {
      setStrategies((prev) => prev.filter((s) => s.id !== id));
      toast.success("Stratégie supprimée");
    }
  }

  function openEdit(s: Strategy) {
    setEditingStrategy(s);
    setForm({
      title: s.title,
      description: s.description,
      strategyType: s.strategyType as StrategyType,
      status: s.status as StrategyStatus,
      processId: s.processId,
      gapClosurePercent: s.gapClosurePercent,
      estimatedCost: s.estimatedCost?.toString() || "",
      notes: s.notes || "",
      plannedDate: s.plannedDate ? new Date(s.plannedDate).toISOString().split("T")[0] : "",
    });
    setShowForm(true);
  }

  const stats = {
    total: strategies.length,
    implemented: strategies.filter((s) => ["IMPLEMENTED", "TESTED", "VALIDATED"].includes(s.status)).length,
    avgClosure: strategies.length > 0
      ? Math.round(strategies.reduce((acc, s) => acc + s.gapClosurePercent, 0) / strategies.length)
      : 0,
    totalCost: strategies.reduce((acc, s) => acc + (s.estimatedCost || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Stratégies & Solutions de Continuité</h1>
          <p className="text-sm text-muted-foreground">Par processus, ressource et scénario — avec Gap closure %</p>
        </div>
        <Button onClick={() => { setEditingStrategy(null); setForm({ title: "", description: "", strategyType: "BACKUP_SITE", status: "PLANNED", processId: "", gapClosurePercent: 0, estimatedCost: "", notes: "", plannedDate: "" }); setShowForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle stratégie
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total stratégies", value: stats.total, color: "text-foreground" },
          { label: "Implémentées", value: stats.implemented, color: "text-green-600" },
          { label: "Gap closure moyen", value: `${stats.avgClosure}%`, color: "text-blue-600" },
          { label: "Coût estimé", value: stats.totalCost > 0 ? `${stats.totalCost.toLocaleString()} TND` : "—", color: "text-foreground" },
        ].map((s) => (
          <Card key={s.label} className="shadow-sm">
            <CardContent className="p-4 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous types</SelectItem>
            {Object.entries(STRATEGY_TYPE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            {Object.entries(STRATEGY_STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-muted-foreground">
            <Target className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Aucune stratégie trouvée</p>
          </div>
        ) : (
          filtered.map((strategy) => {
            const Icon = STRATEGY_ICONS[strategy.strategyType as StrategyType] || Target;
            const statusClass = STATUS_COLORS[strategy.status as StrategyStatus] || "bg-gray-100 text-gray-700";

            return (
              <Card key={strategy.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge className={`text-xs ${statusClass}`}>
                          {STRATEGY_STATUS_LABELS[strategy.status as StrategyStatus]}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {STRATEGY_TYPE_LABELS[strategy.strategyType as StrategyType]}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-sm">{strategy.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{strategy.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">Processus :</span> {strategy.process?.name}
                      </p>
                      {strategy.gap && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Écart couvert :</span> {strategy.gap.title}
                        </p>
                      )}

                      {/* Gap Closure */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground flex-shrink-0">Gap closure :</span>
                        <Progress value={strategy.gapClosurePercent} className="h-2 flex-1" />
                        <span className={`text-xs font-bold flex-shrink-0 ${
                          strategy.gapClosurePercent >= 80 ? "text-green-600" :
                          strategy.gapClosurePercent >= 50 ? "text-yellow-600" : "text-red-600"
                        }`}>{strategy.gapClosurePercent}%</span>
                      </div>

                      {strategy.estimatedCost && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Coût estimé : <span className="font-medium">{strategy.estimatedCost.toLocaleString()} {strategy.currency || "TND"}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <Select value={strategy.status} onValueChange={(v) => handleStatusChange(strategy.id, v as StrategyStatus)}>
                      <SelectTrigger className="h-7 text-xs w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STRATEGY_STATUS_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openEdit(strategy)}>Modifier</Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600" onClick={() => handleDelete(strategy.id)}>Supprimer</Button>
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
            <DialogTitle>{editingStrategy ? "Modifier la stratégie" : "Nouvelle stratégie"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre *</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type de stratégie</Label>
                <Select value={form.strategyType} onValueChange={(v) => setForm((f) => ({ ...f, strategyType: v as StrategyType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STRATEGY_TYPE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Statut</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as StrategyStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STRATEGY_STATUS_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Processus *</Label>
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
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Gap closure % (0-100)</Label>
                <Input
                  type="number" min={0} max={100}
                  value={form.gapClosurePercent}
                  onChange={(e) => setForm((f) => ({ ...f, gapClosurePercent: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Coût estimé (TND)</Label>
                <Input
                  type="number"
                  value={form.estimatedCost}
                  onChange={(e) => setForm((f) => ({ ...f, estimatedCost: e.target.value }))}
                  placeholder="Ex: 50000"
                />
              </div>
            </div>
            <div>
              <Label>Date planifiée</Label>
              <Input type="date" value={form.plannedDate} onChange={(e) => setForm((f) => ({ ...f, plannedDate: e.target.value }))} />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} />
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
