"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  BookOpen, Plus, ChevronDown, ChevronRight,
  CheckCircle2, AlertTriangle, ArrowUpRight,
  Info, Flag, Clock, Send, Zap,
} from "lucide-react";
import {
  createLogEntry, updateLogEntry, getCrisisLogDelta,
  type EntryType, type DecisionStatus, type ActionStatus,
} from "@/actions/simulation/crisis-log-actions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LogEntry = any;

// ─── Config ───────────────────────────────────────────────────────────────────

const ENTRY_TYPE_CONFIG: Record<EntryType, {
  label: string; icon: React.ElementType; color: string; bg: string; description: string;
}> = {
  DECISION: {
    label: "Décision",
    icon: CheckCircle2,
    color: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.1)",
    description: "Une décision prise qui engage la cellule de crise",
  },
  ACTION: {
    label: "Action",
    icon: Zap,
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.1)",
    description: "Une action technique ou organisationnelle réalisée",
  },
  ESCALATION: {
    label: "Escalade",
    icon: ArrowUpRight,
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.1)",
    description: "Une remontée vers un niveau hiérarchique supérieur",
  },
  INFORMATION: {
    label: "Information",
    icon: Info,
    color: "#8b5cf6",
    bg: "rgba(139, 92, 246, 0.1)",
    description: "Une information importante reçue ou transmise",
  },
  OBSERVATION: {
    label: "Observation",
    icon: Flag,
    color: "#94a3b8",
    bg: "rgba(148, 163, 184, 0.1)",
    description: "Une observation sur le déroulement",
  },
  MILESTONE: {
    label: "Étape clé",
    icon: Flag,
    color: "#ec4899",
    bg: "rgba(236, 72, 153, 0.1)",
    description: "Franchissement d'une étape clé du scénario",
  },
};

const DECISION_STATUS_CONFIG: Record<DecisionStatus, { label: string; color: string }> = {
  DRAFT:          { label: "Brouillon",          color: "#94a3b8" },
  CONFIRMED:      { label: "Confirmée",           color: "#3b82f6" },
  VALIDATED:      { label: "Validée",             color: "#10b981" },
  OVERRULED:      { label: "Annulée",             color: "#ef4444" },
  PENDING_REVIEW: { label: "En attente validation", color: "#f59e0b" },
};

const ACTION_STATUS_CONFIG: Record<ActionStatus, { label: string; color: string }> = {
  TODO:        { label: "À faire",    color: "#94a3b8" },
  IN_PROGRESS: { label: "En cours",  color: "#3b82f6" },
  DONE:        { label: "Terminée",  color: "#10b981" },
  FAILED:      { label: "Échouée",   color: "#ef4444" },
  CANCELLED:   { label: "Annulée",   color: "#f59e0b" },
};

const IMPACT_SCOPES = [
  "Systèmes informatiques", "Production / OT", "Données clients",
  "Communication externe", "Ressources humaines", "Finance",
  "Fournisseurs", "Régulateurs / Autorités", "Médias",
];

// ─── Entry card ───────────────────────────────────────────────────────────────
function EntryCard({ entry, participantId, onUpdate }: {
  entry: LogEntry; participantId: string; onUpdate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const cfg = ENTRY_TYPE_CONFIG[entry.type as EntryType] || ENTRY_TYPE_CONFIG.INFORMATION;
  const Icon = cfg.icon;
  const isOwn = entry.participantId === participantId || entry.participantName === "Moi";

  async function handleStatusChange(field: string, value: string) {
    setIsUpdating(true);
    const r = await updateLogEntry(entry.id, { [field]: value });
    if (r.success) { toast.success("Statut mis à jour"); onUpdate(); }
    else toast.error(r.error);
    setIsUpdating(false);
  }

  async function handleMarkDone() {
    setIsUpdating(true);
    const r = await updateLogEntry(entry.id, { actionStatus: "DONE", completedAt: true });
    if (r.success) { toast.success("Action marquée terminée"); onUpdate(); }
    else toast.error(r.error);
    setIsUpdating(false);
  }

  const statusCfg = entry.decisionStatus
    ? DECISION_STATUS_CONFIG[entry.decisionStatus as DecisionStatus]
    : entry.actionStatus
    ? ACTION_STATUS_CONFIG[entry.actionStatus as ActionStatus]
    : null;

  return (
    <div className={`border rounded-xl overflow-hidden transition-all bg-[#0e1726]/10 ${
      isOwn ? "border-blue-900/60 bg-[#0c162b]/25" : "border-slate-800/80"
    }`} style={{ borderLeftWidth: 4, borderLeftColor: cfg.color }}>
      {/* Header */}
      <div
        className="flex items-start gap-3 p-3 cursor-pointer hover:bg-slate-900/40"
        onClick={() => setExpanded(!expanded)}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: cfg.bg }}>
          <Icon className="h-4 w-4" style={{ color: cfg.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-xs font-mono text-slate-500">
              MC-{String(entry.sequenceNumber).padStart(3, "0")}
            </span>
            <Badge className="text-xs font-semibold px-2 py-0.5 rounded-full border-none" style={{ background: cfg.bg, color: cfg.color }}>
              {cfg.label}
            </Badge>
            {statusCfg && (
              <Badge className="text-xs font-medium border-none" style={{ background: statusCfg.color + "15", color: statusCfg.color }}>
                {statusCfg.label}
              </Badge>
            )}
            {isOwn && (
              <Badge variant="outline" className="text-xs text-blue-400 border-blue-900/60 bg-blue-950/20">Moi</Badge>
            )}
            <span className="text-xs text-slate-400 ml-auto flex items-center gap-1 font-mono">
              <Clock className="h-3 w-3" />
              {new Date(entry.occurredAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <p className="text-sm font-medium leading-tight text-white">{entry.title}</p>
          <p className="text-xs text-slate-450">{entry.participantName} · {entry.participantRole}</p>
        </div>
        {expanded ? <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />}
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-800/80 bg-slate-900/20">
          <p className="text-sm leading-relaxed pt-3 text-slate-200">{entry.content}</p>

          {entry.justification && (
            <div className="bg-[#0e1726]/40 border border-slate-850 rounded-lg p-2.5">
              <p className="text-xs font-semibold text-slate-400 mb-1">Justification</p>
              <p className="text-xs leading-relaxed text-slate-300">{entry.justification}</p>
            </div>
          )}

          {entry.impactScope?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-slate-400">Impact :</span>
              {entry.impactScope.map((s: string) => (
                <span key={s} className="text-xs bg-slate-850 text-slate-300 px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
          )}

          {entry.alternativesConsidered && (
            <div className="bg-[#0e1726]/40 border border-slate-850 rounded-lg p-2.5">
              <p className="text-xs font-semibold text-slate-400 mb-1">Alternatives considérées</p>
              <p className="text-xs text-slate-305">{entry.alternativesConsidered}</p>
            </div>
          )}

          {/* Escalation response */}
          {entry.escalatedToName && (
            <div className="bg-amber-950/20 border border-amber-900/40 rounded-lg p-2.5">
              <p className="text-xs font-semibold text-amber-300">
                Escalade vers {entry.escalatedToName} ({entry.escalatedToRole})
              </p>
              {entry.escalationResponse
                ? <p className="text-xs text-amber-200 mt-1">Réponse : {entry.escalationResponse}</p>
                : <p className="text-xs text-amber-400 mt-1 italic">En attente de réponse...</p>}
            </div>
          )}

          {/* Actions */}
          {isOwn && (
            <div className="flex flex-wrap gap-2 pt-1">
              {entry.type === "DECISION" && entry.decisionStatus === "DRAFT" && (
                <Button size="sm" className="h-7 text-xs gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange("decisionStatus", "CONFIRMED")}>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Confirmer la décision
                </Button>
              )}
              {entry.type === "ACTION" && entry.actionStatus !== "DONE" && (
                <>
                  {entry.actionStatus === "TODO" && (
                    <Button size="sm" variant="outline" className="h-7 text-xs border-slate-700 hover:bg-slate-800 text-slate-200"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange("actionStatus", "IN_PROGRESS")}>
                      Démarrer
                    </Button>
                  )}
                  <Button size="sm" className="h-7 text-xs gap-1 bg-green-650 hover:bg-green-700 text-white"
                    disabled={isUpdating}
                    onClick={handleMarkDone}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Terminée
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── New entry form ───────────────────────────────────────────────────────────
function NewEntryDialog({ sessionId, participant, onCreated, onClose, linkedMessageId }: {
  sessionId: string;
  participant: { id: string; displayName: string; role: string };
  onCreated: () => void;
  onClose: () => void;
  linkedMessageId?: string;
}) {
  const [type, setType] = useState<EntryType>("DECISION");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [justification, setJustification] = useState("");
  const [impactScope, setImpactScope] = useState<string[]>([]);
  const [alternatives, setAlternatives] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [escalatedTo, setEscalatedTo] = useState("");
  const [escalatedRole, setEscalatedRole] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const cfg = ENTRY_TYPE_CONFIG[type];

  function toggleScope(s: string) {
    setImpactScope(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      toast.error("Titre et contenu requis");
      return;
    }
    setIsSaving(true);
    try {
      const r = await createLogEntry({
        sessionId,
        type,
        participantId: participant.id || undefined,
        participantName: participant.displayName,
        participantRole: participant.role,
        title: title.trim(),
        content: content.trim(),
        justification: justification.trim() || undefined,
        impactScope,
        alternativesConsidered: alternatives.trim() || undefined,
        decisionStatus: type === "DECISION" ? "DRAFT" : undefined,
        actionStatus: type === "ACTION" ? "TODO" : undefined,
        assignedToName: assignedTo.trim() || undefined,
        escalatedToName: escalatedTo.trim() || undefined,
        escalatedToRole: escalatedRole.trim() || undefined,
        linkedMessageId: linkedMessageId || undefined,
      });

      if (r.success) {
        toast.success(`${cfg.label} enregistrée dans la main courante`);
        onCreated();
        onClose();
      } else {
        toast.error(r.error || "Erreur serveur lors de la sauvegarde");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erreur réseau ou base de données lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Main courante — Nouvelle entrée
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Type selector */}
        <div>
          <Label className="text-xs mb-2 block">Type d'entrée</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["DECISION", "ACTION", "ESCALATION", "INFORMATION"] as EntryType[]).map(t => {
              const c = ENTRY_TYPE_CONFIG[t];
              const Icon = c.icon;
              return (
                <button key={t}
                  onClick={() => setType(t)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                    type === t ? "border-2" : "border-border hover:border-border/80"
                  }`}
                  style={type === t ? { borderColor: c.color, background: c.bg } : {}}>
                  <Icon className="h-5 w-5 flex-shrink-0" style={{ color: c.color }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: type === t ? c.color : undefined }}>
                      {c.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{c.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Label className="text-xs">Titre * <span className="text-muted-foreground font-normal">(résumé en une ligne)</span></Label>
          <Input className="mt-1" value={title} onChange={e => setTitle(e.target.value)}
            placeholder={
              type === "DECISION" ? "Ex: Décision d'isoler les serveurs ERP du réseau"
              : type === "ACTION" ? "Ex: Isolation réseau SRV-FILES-01 effectuée"
              : type === "ESCALATION" ? "Ex: Escalade vers DG pour autorisation communication externe"
              : "Ex: Notification CERT-FR reçue"
            }
            autoFocus />
        </div>

        <div>
          <Label className="text-xs">Contenu * <span className="text-muted-foreground font-normal">(détail précis)</span></Label>
          <Textarea className="mt-1 text-sm" rows={4} value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={
              type === "DECISION"
                ? "Décrivez précisément la décision : qui a décidé, ce qui a été décidé, les modalités d'application..."
                : type === "ACTION"
                ? "Décrivez l'action réalisée : ce qui a été fait, par qui, résultat obtenu..."
                : type === "ESCALATION"
                ? "Décrivez ce qui a été escaladé, pourquoi, et ce que vous attendez de cette escalade..."
                : "Décrivez l'information : source, contenu, destinataires..."
            } />
        </div>

        {type === "DECISION" && (
          <div>
            <Label className="text-xs">Justification <span className="text-muted-foreground">(pourquoi cette décision)</span></Label>
            <Textarea className="mt-1 text-sm" rows={2} value={justification}
              onChange={e => setJustification(e.target.value)}
              placeholder="Contexte, éléments d'analyse, risques pris en compte..." />
          </div>
        )}

        {type === "DECISION" && (
          <div>
            <Label className="text-xs">Alternatives considérées <span className="text-muted-foreground">(optionnel)</span></Label>
            <Textarea className="mt-1 text-sm" rows={2} value={alternatives}
              onChange={e => setAlternatives(e.target.value)}
              placeholder="Quelles autres options ont été envisagées et pourquoi elles ont été écartées..." />
          </div>
        )}

        {type === "ACTION" && (
          <div>
            <Label className="text-xs">Assignée à</Label>
            <Input className="mt-1 h-8 text-sm" value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
              placeholder="Prénom Nom ou nom d'équipe" />
          </div>
        )}

        {type === "ESCALATION" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Escalade vers (nom)</Label>
              <Input className="mt-1 h-8 text-sm" value={escalatedTo}
                onChange={e => setEscalatedTo(e.target.value)} placeholder="Directeur Général..." />
            </div>
            <div>
              <Label className="text-xs">Rôle / Fonction</Label>
              <Input className="mt-1 h-8 text-sm" value={escalatedRole}
                onChange={e => setEscalatedRole(e.target.value)} placeholder="Direction Générale..." />
            </div>
          </div>
        )}

        {/* Impact scope */}
        <div>
          <Label className="text-xs mb-2 block">Périmètre d'impact <span className="text-muted-foreground">(optionnel)</span></Label>
          <div className="flex flex-wrap gap-1.5">
            {IMPACT_SCOPES.map(s => (
              <button key={s}
                onClick={() => toggleScope(s)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  impactScope.includes(s)
                    ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                    : "border-border text-muted-foreground hover:border-border/80"
                }`}>
                {impactScope.includes(s) && "✓ "}{s}
              </button>
            ))}
          </div>
        </div>

        {/* Participant info */}
        <div className="flex items-center gap-2 p-2.5 bg-muted/40 rounded-lg text-xs">
          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold flex-shrink-0">
            {participant.displayName[0]}
          </div>
          <span className="text-muted-foreground">Enregistré par</span>
          <span className="font-medium">{participant.displayName}</span>
          <span className="text-muted-foreground">·</span>
          <span>{participant.role}</span>
          <span className="text-muted-foreground ml-auto">
            {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Annuler</Button>
        <Button onClick={handleSave} disabled={isSaving || !title.trim() || !content.trim()}
          style={{ background: cfg.color }}>
          {isSaving ? "Enregistrement..." : `Enregistrer ${cfg.label}`}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ─── Main panel (participant view) ────────────────────────────────────────────
export default function CrisisLogPanel({
  sessionId,
  participant,
  initialEntries = [],
  linkedMessageId,
  compact = false,
}: {
  sessionId: string;
  participant: { id: string; displayName: string; role: string };
  initialEntries?: LogEntry[];
  linkedMessageId?: string;
  compact?: boolean;
}) {
  const [entries, setEntries] = useState<LogEntry[]>(initialEntries);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<EntryType | "ALL">("ALL");
  const [lastPoll, setLastPoll] = useState(() => {
    if (initialEntries && initialEntries.length > 0) {
      const dates = initialEntries.map(e => new Date(e.occurredAt || e.createdAt).getTime());
      const maxDate = Math.max(...dates);
      return new Date(maxDate).toISOString();
    }
    return new Date().toISOString();
  });
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const reload = useCallback(async () => {
    const r = await getCrisisLogDelta(sessionId, lastPoll, false);
    if (r.success && r.data && r.data.length > 0) {
      setEntries(prev => {
        const ids = new Set(prev.map((e: LogEntry) => e.id));
        return [...prev, ...r.data!.filter(e => !ids.has(e.id))];
      });
      setLastPoll(new Date().toISOString());
    }
  }, [sessionId, lastPoll]);

  useEffect(() => {
    pollRef.current = setInterval(reload, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [reload]);

  const filtered = filter === "ALL"
    ? entries
    : entries.filter(e => e.type === filter);

  const decisions = entries.filter(e => e.type === "DECISION");
  const actions = entries.filter(e => e.type === "ACTION");
  const pendingActions = actions.filter(e => e.actionStatus !== "DONE" && e.actionStatus !== "CANCELLED");

  return (
    <div className={`flex flex-col ${compact ? "h-full" : "min-h-0"} bg-transparent`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800/80 flex-shrink-0">
        <BookOpen className="h-4 w-4 text-blue-500" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Main courante</p>
          <p className="text-xs text-slate-400 font-mono">
            {entries.length} entrée(s) · ISO 22301 §8.4
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}
          className="gap-1.5 h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium">
          <Plus className="h-3.5 w-3.5" />
          Enregistrer
        </Button>
      </div>

      {/* Quick stats */}
      {entries.length > 0 && (
        <div className="flex gap-3 px-4 py-2 border-b border-slate-800/80 bg-slate-950/20 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-slate-400">{decisions.length} décision(s)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Zap className="h-3.5 w-3.5 text-green-400" />
            <span className="text-slate-400">{actions.length} action(s)</span>
          </div>
          {pendingActions.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs ml-auto">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span className="text-amber-400 font-medium">{pendingActions.length} en attente</span>
            </div>
          )}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 px-4 py-2 border-b border-slate-800/80 overflow-x-auto flex-shrink-0">
        {(["ALL", "DECISION", "ACTION", "ESCALATION", "INFORMATION"] as const).map(f => (
          <button key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full transition-all ${
              filter === f ? "font-semibold" : "text-slate-400 hover:bg-slate-900/60"
            }`}
            style={filter === f && f !== "ALL"
              ? { background: ENTRY_TYPE_CONFIG[f as EntryType].bg, color: ENTRY_TYPE_CONFIG[f as EntryType].color }
              : filter === f ? { background: "rgba(255, 255, 255, 0.08)", color: "#ffffff" }
              : {}}>
            {f === "ALL" ? `Tout (${entries.length})` : `${ENTRY_TYPE_CONFIG[f as EntryType].label} (${entries.filter(e => e.type === f).length})`}
          </button>
        ))}
      </div>

      {/* Entries list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20 text-slate-400" />
            <p className="text-sm font-medium text-slate-400">Main courante vide</p>
            <p className="text-xs mt-1 mb-4 text-slate-500">
              Enregistrez vos décisions, actions et escalades en temps réel
            </p>
            <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4" /> Première entrée
            </Button>
          </div>
        ) : (
          filtered.map(entry => (
            <EntryCard key={entry.id} entry={entry}
              participantId={participant.id}
              onUpdate={reload} />
          ))
        )}
      </div>

      {/* Form dialog */}
      {showForm && (
        <Dialog open onOpenChange={() => setShowForm(false)}>
          <NewEntryDialog
            sessionId={sessionId}
            participant={participant}
            onCreated={reload}
            onClose={() => setShowForm(false)}
            linkedMessageId={linkedMessageId}
          />
        </Dialog>
      )}
    </div>
  );
}
