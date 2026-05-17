"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  BookOpen, CheckCircle2, Zap, ArrowUpRight, Info,
  ThumbsUp, ThumbsDown, AlertTriangle, ChevronRight,
  Clock, Download, Star, Sparkles, Award, ShieldAlert,
} from "lucide-react";
import {
  scoreLogEntry, getCrisisLogDelta, exportCrisisLog,
  type InstructorFlag,
} from "@/actions/simulation/crisis-log-actions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LogEntry = any;

const ENTRY_TYPE_CONFIG = {
  DECISION:    { label: "Décision",   icon: CheckCircle2, color: "#3b82f6", bg: "#3b82f615" },
  ACTION:      { label: "Action",     icon: Zap,          color: "#10b981", bg: "#10b98115" },
  ESCALATION:  { label: "Escalade",   icon: ArrowUpRight, color: "#f59e0b", bg: "#f59e0b15" },
  INFORMATION: { label: "Info",       icon: Info,         color: "#8b5cf6", bg: "#8b5cf615" },
  OBSERVATION: { label: "Obs.",       icon: Star,         color: "#6b7280", bg: "#6b728015" },
  MILESTONE:   { label: "Étape",      icon: Star,         color: "#ec4899", bg: "#ec489915" },
};

const FLAG_CONFIG: Record<InstructorFlag, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  GOOD:           { label: "Bonne décision",    icon: ThumbsUp,     color: "#10b981", bg: "#10b98115" },
  IMPROVABLE:     { label: "Améliorable",       icon: ChevronRight, color: "#f59e0b", bg: "#f59e0b15" },
  MISSED:         { label: "Décision manquée",  icon: AlertTriangle,color: "#ef4444", bg: "#ef444415" },
  CRITICAL_ERROR: { label: "Erreur critique",   icon: ThumbsDown,   color: "#f43f5e", bg: "#f43f5e15" },
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
    <div className="mt-4 p-4 bg-slate-950/50 border border-slate-800/80 rounded-2xl space-y-4 shadow-inner">
      <div className="flex items-center gap-1.5 pb-2 border-b border-slate-900/60">
        <Award className="h-4 w-4 text-orange-500" />
        <p className="text-xs font-bold text-gray-300 uppercase tracking-wider">Évaluation instructeur</p>
      </div>

      {/* Score 0-10 */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400 font-medium w-12">Score</span>
        <div className="flex flex-wrap gap-1.5 flex-1">
          {[0, 2, 4, 6, 7, 8, 9, 10].map(v => {
            const isSelected = score === v;
            const scoreColor = v >= 8 ? "#10b981" : v >= 6 ? "#3b82f6" : v >= 4 ? "#f59e0b" : "#ef4444";
            return (
              <button key={v}
                onClick={() => setScore(v)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center ${
                  isSelected ? "text-white shadow-lg" : "bg-slate-900 text-gray-400 hover:bg-slate-850 hover:text-gray-200 border border-slate-800/50"
                }`}
                style={isSelected ? {
                  backgroundColor: scoreColor,
                  boxShadow: `0 0 10px ${scoreColor}25`
                } : {}}>
                {v}
              </button>
            );
          })}
        </div>
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800">
          <span className="text-base font-black" style={{
            color: score >= 8 ? "#10b981" : score >= 6 ? "#3b82f6" : score >= 4 ? "#f59e0b" : "#ef4444"
          }}>{score}</span>
        </div>
      </div>

      {/* Flag */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-gray-400 font-medium w-12">Flag</span>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(FLAG_CONFIG) as [InstructorFlag, typeof FLAG_CONFIG[InstructorFlag]][]).map(([k, v]) => {
            const Icon = v.icon;
            const isSelected = flag === k;
            return (
              <button key={k}
                onClick={() => setFlag(k)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all duration-300 ${
                  isSelected ? "font-semibold border" : "bg-slate-900 border-slate-800/60 text-gray-400 hover:text-gray-300"
                }`}
                style={isSelected ? { borderColor: v.color, backgroundColor: v.bg, color: v.color } : {}}>
                <Icon className="h-3.5 w-3.5" />
                {v.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Note */}
      <div className="space-y-2">
        <button className="text-xs text-orange-400 hover:text-orange-300 font-semibold transition-colors flex items-center gap-1" onClick={() => setShowNote(!showNote)}>
          <Sparkles className="h-3 w-3" />
          {showNote ? "Masquer la note de debrief" : "Ajouter une note de debriefing (visible dans le bilan)"}
        </button>
        {showNote && (
          <Textarea className="text-xs h-20 resize-none bg-slate-900 border-slate-800 text-white rounded-xl placeholder-gray-600 focus-visible:ring-orange-500" value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Note pour le debrief (privée, visible uniquement sur le rapport final instructeur)..." />
        )}
      </div>

      <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-9 text-xs w-full rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold shadow-md shadow-orange-950/20 transition-transform active:scale-95 duration-200">
        {isSaving ? "Enregistrement..." : "Valider l'évaluation"}
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
    <div className={`bg-[#0e1726]/40 backdrop-blur-md border rounded-2xl overflow-hidden transition-all duration-300 hover:bg-[#0e1726]/60 ${
      entry.type === "DECISION" && !entry.instructorScore ? "border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.03)]" : "border-slate-800/80"
    }`} style={{ borderLeftWidth: 3, borderLeftColor: cfg.color }}>
      
      <div className="flex items-start gap-3.5 p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        {/* Sequence + icon */}
        <div className="flex-shrink-0 text-center">
          <div className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wide">
            MC-{String(entry.sequenceNumber).padStart(3, "0")}
          </div>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mt-1"
            style={{ backgroundColor: cfg.bg }}>
            <Icon className="h-4 w-4" style={{ color: cfg.color }} />
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
              {cfg.label}
            </span>
            <span className="text-sm font-semibold text-gray-200 truncate">{entry.title}</span>
            
            {entry.instructorScore !== null && entry.instructorScore !== undefined && (
              <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                {flagCfg && (
                  <Badge className="text-[10px] uppercase font-bold rounded-lg" style={{ backgroundColor: flagCfg.bg, color: flagCfg.color }}>
                    {flagCfg.label}
                  </Badge>
                )}
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800" style={{
                  color: entry.instructorScore >= 8 ? "#10b981" : entry.instructorScore >= 6 ? "#3b82f6" : entry.instructorScore >= 4 ? "#f59e0b" : "#ef4444"
                }}>
                  {entry.instructorScore}/10
                </span>
              </div>
            )}
            
            {entry.type === "DECISION" && !entry.instructorScore && (
              <span className="ml-auto text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-lg font-bold uppercase tracking-wider flex items-center gap-1 animate-pulse">
                <AlertTriangle className="h-3 w-3" /> À évaluer
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="font-semibold text-gray-300">{entry.participantName}</span>
            <span className="text-slate-700">•</span>
            <span className="text-orange-500 font-bold uppercase tracking-wider text-[9px]">{entry.participantRole}</span>
            <span className="text-slate-700">•</span>
            <Clock className="h-3 w-3 text-gray-500" />
            <span className="font-mono">{new Date(entry.occurredAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
          </div>
          
          {!expanded && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{entry.content}</p>}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-800/40 space-y-4">
          <p className="text-xs text-gray-300 leading-relaxed pt-3.5 whitespace-pre-wrap">{entry.content}</p>
          
          {entry.justification && (
            <div className="bg-slate-950/30 border border-slate-850 rounded-xl p-3.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Justification stratégique</p>
              <p className="text-xs text-gray-300 leading-relaxed">{entry.justification}</p>
            </div>
          )}
          
          {entry.alternativesConsidered && (
            <div className="bg-slate-950/30 border border-slate-850 rounded-xl p-3.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Alternatives considérées</p>
              <p className="text-xs text-gray-300 leading-relaxed">{entry.alternativesConsidered}</p>
            </div>
          )}
          
          {entry.impactScope?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entry.impactScope.map((s: string) => (
                <span key={s} className="text-[10px] font-semibold bg-slate-900 border border-slate-800 text-gray-400 px-2 py-0.5 rounded-lg uppercase">{s}</span>
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
  const [lastPoll, setLastPoll] = useState(() => {
    if (initialEntries && initialEntries.length > 0) {
      const dates = initialEntries.map(e => new Date(e.occurredAt || e.createdAt).getTime());
      const maxDate = Math.max(...dates);
      return new Date(maxDate).toISOString();
    }
    return new Date().toISOString();
  });
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
      toast.success("Export ISO téléchargé avec succès !");
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
    <div className="flex flex-col h-full bg-[#080d19]/40 rounded-2xl overflow-hidden border border-slate-800/80">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/60 bg-slate-900/60 backdrop-blur-xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-200">Main courante — Supervision</p>
            <p className="text-xs text-gray-400">
              {entries.length} entrée(s) enregistrée(s) 
              {unscored > 0 && <span className="text-amber-400 font-bold ml-1.5">· {unscored} à évaluer</span>}
              {avgScore !== null && <span className="text-emerald-400 font-bold ml-1.5">· Moyenne {avgScore}/100</span>}
            </p>
          </div>
        </div>
        <Button size="sm" className="h-9 text-xs bg-slate-950 border border-slate-800 hover:border-slate-700 text-white rounded-xl gap-2 shadow-md shadow-black/20 transition-transform active:scale-95"
          onClick={handleExport} disabled={isExporting}>
          <Download className="h-3.5 w-3.5" />
          {isExporting ? "Génération..." : "Exporter au format ISO"}
        </Button>
      </div>

      {/* Alert Banner: unscored decisions */}
      {unscored > 0 && (
        <div className="flex items-center gap-2.5 px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-300 flex-shrink-0 animate-pulse">
          <ShieldAlert className="h-4 w-4 flex-shrink-0" />
          <span><strong>{unscored}</strong> décision(s) en attente de notation — Ouvrez-les pour attribuer une note.</span>
        </div>
      )}

      {/* Segmented Filter Pills */}
      <div className="flex gap-2 p-3.5 border-b border-slate-800/60 overflow-x-auto flex-shrink-0 bg-slate-950/20">
        {["ALL", "DECISION", "ACTION", "ESCALATION", "INFORMATION"].map(f => {
          const isActive = filterType === f;
          return (
            <button key={f}
              onClick={() => setFilterType(f)}
              className={`flex-shrink-0 text-xs px-3.5 py-1.5 rounded-xl transition-all duration-300 font-medium ${
                isActive 
                  ? "bg-slate-900 border border-slate-800 text-white shadow-md" 
                  : "text-gray-400 hover:text-gray-200 hover:bg-slate-900/40"
              }`}>
              {f === "ALL"
                ? `Toutes les entrées (${entries.filter(e => !e.isInstructorOnly).length})`
                : `${f === "DECISION" ? "Décisions" : f === "ACTION" ? "Actions" : f === "ESCALATION" ? "Escalades" : "Infos"} (${entries.filter(e => e.type === f && !e.isInstructorOnly).length})`}
            </button>
          );
        })}
      </div>

      {/* Scrollable Main Courante Entries Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/10 rounded-2xl border border-slate-850 border-dashed">
            <BookOpen className="h-10 w-10 mx-auto mb-3 text-slate-700" />
            <p className="text-gray-400 text-sm font-semibold">Aucun événement enregistré</p>
            <p className="text-gray-600 text-xs mt-1">La main courante sera alimentée en temps réel par les décisions et actions des participants.</p>
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
