"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  BookOpen, CheckCircle2, Zap, ArrowUpRight, Info,
  ThumbsUp, ThumbsDown, AlertTriangle, ChevronRight,
  Clock, Download, Star,
} from "lucide-react";
import {
  scoreLogEntry, getCrisisLogDelta, exportCrisisLog,
  type InstructorFlag,
} from "@/actions/simulation/crisis-log-actions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LogEntry = any;

const ENTRY_TYPE_CONFIG = {
  DECISION:    { label: "Décision",   icon: CheckCircle2, color: "#185FA5", bg: "#E6F1FB" },
  ACTION:      { label: "Action",     icon: Zap,          color: "#0F6E56", bg: "#E1F5EE" },
  ESCALATION:  { label: "Escalade",   icon: ArrowUpRight, color: "#854F0B", bg: "#FAEEDA" },
  INFORMATION: { label: "Info",       icon: Info,         color: "#534AB7", bg: "#EEEDFE" },
  OBSERVATION: { label: "Obs.",       icon: Star,         color: "#5F5E5A", bg: "#F1EFE8" },
  MILESTONE:   { label: "Étape",      icon: Star,         color: "#993556", bg: "#FBEAF0" },
};

const FLAG_CONFIG: Record<InstructorFlag, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  GOOD:           { label: "Bonne décision",    icon: ThumbsUp,     color: "#0F6E56", bg: "#E1F5EE" },
  IMPROVABLE:     { label: "Améliorable",       icon: ChevronRight, color: "#854F0B", bg: "#FAEEDA" },
  MISSED:         { label: "Décision manquée",  icon: AlertTriangle,color: "#A32D2D", bg: "#FCEBEB" },
  CRITICAL_ERROR: { label: "Erreur critique",   icon: ThumbsDown,   color: "#A32D2D", bg: "#FCEBEB" },
};

// ─── Score inline widget ──────────────────────────────────────────────────────
function InlineScorer({ entry, onScored }: { entry: LogEntry; onScored: () => void }) {
  const [score, setScore] = useState(entry.instructorScore ?? 7);
  const [flag, setFlag] = useState<InstructorFlag>(entry.instructorFlag || "GOOD");
  const [note, setNote] = useState(entry.instructorNote || "");
  const [isSaving, setIsSaving] = useState(false);
  const [showNote, setShowNote] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    const r = await scoreLogEntry(entry.id, score, flag, note || undefined);
    if (r.success) { toast.success("Évaluation enregistrée"); onScored(); }
    else toast.error(r.error);
    setIsSaving(false);
  }

  return (
    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
      <p className="text-xs font-semibold text-gray-700">Évaluation instructeur</p>

      {/* Score 0-10 */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 w-12">Score</span>
        <div className="flex gap-1">
          {[0, 2, 4, 6, 7, 8, 9, 10].map(v => (
            <button key={v}
              onClick={() => setScore(v)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                score === v ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={score === v ? {
                background: v >= 8 ? "#0F6E56" : v >= 6 ? "#185FA5" : v >= 4 ? "#854F0B" : "#A32D2D"
              } : {}}>
              {v}
            </button>
          ))}
        </div>
        <span className="text-sm font-bold w-6 text-center" style={{
          color: score >= 8 ? "#0F6E56" : score >= 6 ? "#185FA5" : score >= 4 ? "#854F0B" : "#A32D2D"
        }}>{score}</span>
      </div>

      {/* Flag */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500 w-12">Flag</span>
        {(Object.entries(FLAG_CONFIG) as [InstructorFlag, typeof FLAG_CONFIG[InstructorFlag]][]).map(([k, v]) => {
          const Icon = v.icon;
          return (
            <button key={k}
              onClick={() => setFlag(k)}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-all ${
                flag === k ? "font-semibold border-2" : "border-gray-200"
              }`}
              style={flag === k ? { borderColor: v.color, background: v.bg, color: v.color } : {}}>
              <Icon className="h-3 w-3" />
              {v.label}
            </button>
          );
        })}
      </div>

      {/* Note */}
      <div>
        <button className="text-xs text-blue-600 hover:underline" onClick={() => setShowNote(!showNote)}>
          {showNote ? "Masquer la note" : "Ajouter une note (visible dans le debrief)"}
        </button>
        {showNote && (
          <Textarea className="mt-1 text-xs h-16 resize-none" value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Note pour le debrief (privée, non visible des participants)..." />
        )}
      </div>

      <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-7 text-xs w-full">
        {isSaving ? "Enregistrement..." : "Enregistrer l'évaluation"}
      </Button>
    </div>
  );
}

// ─── Entry row (instructor view) ──────────────────────────────────────────────
function InstructorEntryRow({ entry, onReload }: { entry: LogEntry; onReload: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = ENTRY_TYPE_CONFIG[entry.type as keyof typeof ENTRY_TYPE_CONFIG] || ENTRY_TYPE_CONFIG.INFORMATION;
  const Icon = cfg.icon;
  const flagCfg = entry.instructorFlag ? FLAG_CONFIG[entry.instructorFlag as InstructorFlag] : null;

  return (
    <div className={`border rounded-xl overflow-hidden ${
      entry.type === "DECISION" && !entry.instructorScore ? "border-amber-200 bg-amber-50/30" : "border-border"
    }`} style={{ borderLeftWidth: 3, borderLeftColor: cfg.color }}>
      <div className="flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/20"
        onClick={() => setExpanded(!expanded)}>
        {/* Sequence + icon */}
        <div className="flex-shrink-0 text-center">
          <div className="text-xs font-mono text-muted-foreground">
            MC-{String(entry.sequenceNumber).padStart(3, "0")}
          </div>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center mt-0.5"
            style={{ background: cfg.bg }}>
            <Icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <Badge className="text-xs" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</Badge>
            <span className="text-sm font-medium truncate">{entry.title}</span>
            {entry.instructorScore !== null && entry.instructorScore !== undefined && (
              <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                {flagCfg && (
                  <Badge className="text-xs" style={{ background: flagCfg.bg, color: flagCfg.color }}>
                    {flagCfg.label}
                  </Badge>
                )}
                <span className="text-sm font-bold" style={{
                  color: entry.instructorScore >= 8 ? "#0F6E56" : entry.instructorScore >= 6 ? "#185FA5" : entry.instructorScore >= 4 ? "#854F0B" : "#A32D2D"
                }}>
                  {entry.instructorScore}/10
                </span>
              </div>
            )}
            {entry.type === "DECISION" && !entry.instructorScore && (
              <span className="ml-auto text-xs text-amber-600 font-medium flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> À évaluer
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{entry.participantName}</span>
            <span>·</span>
            <span>{entry.participantRole}</span>
            <span>·</span>
            <Clock className="h-3 w-3" />
            <span>{new Date(entry.occurredAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{entry.content}</p>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t space-y-3">
          <p className="text-sm leading-relaxed pt-3">{entry.content}</p>
          {entry.justification && (
            <div className="bg-muted/30 rounded p-2.5">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Justification</p>
              <p className="text-xs">{entry.justification}</p>
            </div>
          )}
          {entry.alternativesConsidered && (
            <div className="bg-muted/30 rounded p-2.5">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Alternatives considérées</p>
              <p className="text-xs">{entry.alternativesConsidered}</p>
            </div>
          )}
          {entry.impactScope?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {entry.impactScope.map((s: string) => (
                <span key={s} className="text-xs bg-muted px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
          )}
          {/* Scoring widget — show for all entries */}
          <InlineScorer entry={entry} onScored={onReload} />
        </div>
      )}
    </div>
  );
}

// ─── Main instructor monitor ──────────────────────────────────────────────────
export default function InstructorCrisisLogMonitor({
  sessionId,
  initialEntries = [],
}: {
  sessionId: string;
  initialEntries?: LogEntry[];
}) {
  const [entries, setEntries] = useState<LogEntry[]>(initialEntries);
  const [lastPoll, setLastPoll] = useState(new Date().toISOString());
  const [isExporting, setIsExporting] = useState(false);
  const [filterType, setFilterType] = useState<string>("ALL");
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const reload = useCallback(async () => {
    const r = await getCrisisLogDelta(sessionId, lastPoll, true);
    if (r.success && r.data && r.data.length > 0) {
      setEntries(prev => {
        const ids = new Set(prev.map((e: LogEntry) => e.id));
        const newOnes = r.data!.filter(e => !ids.has(e.id));
        if (newOnes.length > 0) {
          newOnes.forEach(e => {
            if (e.type === "DECISION" && !e.isInstructorOnly) {
              toast.info(`📋 Nouvelle décision — ${e.participantName}: ${e.title}`, { duration: 5000 });
            }
          });
        }
        return [...prev, ...newOnes];
      });
      setLastPoll(new Date().toISOString());
    }
  }, [sessionId, lastPoll]);

  useEffect(() => {
    pollRef.current = setInterval(reload, 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [reload]);

  async function handleExport() {
    setIsExporting(true);
    const r = await exportCrisisLog(sessionId);
    if (r.success && r.data) {
      // Generate text export
      const lines = [
        `MAIN COURANTE — ${r.data.session.title}`,
        `Date: ${r.data.session.startedAt ? new Date(r.data.session.startedAt).toLocaleDateString("fr-FR") : "—"}`,
        `Référence: ISO 22301 §8.4`,
        ``,
        `RÉSUMÉ`,
        `Total entrées: ${r.data.stats.total}`,
        `Décisions: ${r.data.stats.decisions}`,
        `Actions: ${r.data.stats.actions}`,
        r.data.stats.avgDecisionScore ? `Score décisionnel moyen: ${r.data.stats.avgDecisionScore}/100` : "",
        ``,
        `─────────────────────────────────────────────────────`,
        `ENTRÉES CHRONOLOGIQUES`,
        `─────────────────────────────────────────────────────`,
        ...r.data.entries.map(e => [
          ``,
          `[${e.seq}] ${e.time} — ${e.type} — ${e.role} (${e.author})`,
          `TITRE: ${e.title}`,
          `CONTENU: ${e.content}`,
          e.justification ? `JUSTIFICATION: ${e.justification}` : "",
          e.status ? `STATUT: ${e.status}` : "",
          e.instructorScore !== undefined ? `ÉVALUATION INSTRUCTEUR: ${e.instructorScore}/10 — ${e.instructorFlag}` : "",
          e.instructorNote ? `NOTE INSTRUCTEUR: ${e.instructorNote}` : "",
        ].filter(Boolean)).flat(),
      ].filter(l => l !== "");

      const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `main-courante-${sessionId.slice(-6)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export téléchargé");
    }
    setIsExporting(false);
  }

  const unscored = entries.filter(e => e.type === "DECISION" && !e.isInstructorOnly && e.instructorScore === null).length;
  const decisions = entries.filter(e => e.type === "DECISION" && !e.isInstructorOnly);
  const avgScore = decisions.filter(d => d.instructorScore !== null).length > 0
    ? Math.round(decisions.filter((d: LogEntry) => d.instructorScore !== null).reduce((s: number, d: LogEntry) => s + d.instructorScore, 0) / decisions.filter((d: LogEntry) => d.instructorScore !== null).length * 10)
    : null;

  const filtered = filterType === "ALL"
    ? entries.filter(e => !e.isInstructorOnly)
    : entries.filter(e => e.type === filterType && !e.isInstructorOnly);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b flex-shrink-0">
        <BookOpen className="h-4 w-4 text-blue-600" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Main courante — Vue instructeur</p>
          <p className="text-xs text-muted-foreground">
            {entries.length} entrée(s)
            {unscored > 0 && <span className="text-amber-600 ml-1">· {unscored} à évaluer</span>}
            {avgScore !== null && <span className="text-green-600 ml-1">· moy. {avgScore}/100</span>}
          </p>
        </div>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5"
          onClick={handleExport} disabled={isExporting}>
          <Download className="h-3.5 w-3.5" />
          {isExporting ? "Export..." : "Export ISO"}
        </Button>
      </div>

      {/* Alert: unscored decisions */}
      {unscored > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-700 flex-shrink-0">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          <span><strong>{unscored}</strong> décision(s) non évaluée(s) — cliquez sur chacune pour noter</span>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-1 px-3 py-2 border-b overflow-x-auto flex-shrink-0">
        {["ALL", "DECISION", "ACTION", "ESCALATION", "INFORMATION"].map(f => (
          <button key={f}
            onClick={() => setFilterType(f)}
            className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full transition-all ${
              filterType === f ? "bg-gray-800 text-white font-medium" : "text-muted-foreground hover:bg-muted"
            }`}>
            {f === "ALL"
              ? `Tout (${entries.filter(e => !e.isInstructorOnly).length})`
              : `${f === "DECISION" ? "Décisions" : f === "ACTION" ? "Actions" : f === "ESCALATION" ? "Escalades" : "Infos"} (${entries.filter(e => e.type === f && !e.isInstructorOnly).length})`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-20" />
            Aucune entrée — les participants alimenteront la main courante en temps réel
          </div>
        ) : (
          filtered.map(entry => (
            <InstructorEntryRow key={entry.id} entry={entry} onReload={reload} />
          ))
        )}
      </div>
    </div>
  );
}
