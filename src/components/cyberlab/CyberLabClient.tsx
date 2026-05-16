"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Terminal, Activity, Shield, AlertTriangle, CheckCircle2,
  Clock, Search, ChevronRight, Zap, Server, Award,
  Filter, X, RotateCcw,
} from "lucide-react";
import {
  CYBERLAB_SCENARIOS, type ScenarioData, type IOCDefinition,
  type LogEntry, type LabContext,
} from "@/lib/cyberlab/scenarios";
import { resolveCommand, getCommandSuggestions } from "@/lib/cyberlab/commands";
import type { OutputLine } from "@/lib/cyberlab/scenarios";

// ─── Types ────────────────────────────────────────────────────────────────────
interface HistoryEntry {
  id: string;
  cmd: string;
  output: OutputLine[];
  timestamp: string;
  isError?: boolean;
  iocFound?: string[];
  points?: number;
}

interface LabScore {
  totalPoints: number;
  iocFound: string[];
  commandsRun: number;
  mitigationsTaken: number;
  timeElapsed: number;
  startTime: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const COLOR_MAP: Record<string, string> = {
  white: "#f0f0f0", green: "#4ade80", red: "#f87171",
  yellow: "#fbbf24", cyan: "#67e8f9", gray: "#6b7280", orange: "#fb923c",
};

// ─── Terminal line renderer ───────────────────────────────────────────────────
function TermLine({ line }: { line: OutputLine }) {
  return (
    <div
      className={`font-mono text-xs leading-relaxed whitespace-pre-wrap ${line.bold ? "font-bold" : ""}`}
      style={{ color: COLOR_MAP[line.color || "white"] }}>
      {line.text}
    </div>
  );
}

// ─── IOC Badge ────────────────────────────────────────────────────────────────
function IOCBadge({ ioc }: { ioc: IOCDefinition }) {
  const sev = ioc.severity;
  const bg = sev === "critical" ? "#3a1a1a" : sev === "high" ? "#3a2a1a" : "#1a2a3a";
  const color = sev === "critical" ? "#f87171" : sev === "high" ? "#fbbf24" : "#67e8f9";
  return (
    <div className="border rounded-lg p-2.5 text-xs" style={{ borderColor: color + "40", background: bg }}>
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className="font-bold font-mono" style={{ color }}>{ioc.type.toUpperCase()}</span>
        <span className="px-1.5 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: color + "20", color }}>{ioc.severity}</span>
      </div>
      <div className="font-mono text-xs mb-1" style={{ color: "#f0f0f0" }}>{ioc.value}</div>
      <div className="text-xs" style={{ color: "#9ca3af" }}>{ioc.description}</div>
    </div>
  );
}

// ─── SIEM Log Viewer ──────────────────────────────────────────────────────────
function SIEMViewer({ logs, discoveredIOCs }: { logs: LogEntry[]; discoveredIOCs: string[] }) {
  const [filter, setFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");

  const filtered = logs.filter(l => {
    const matchesText = !filter || l.message.toLowerCase().includes(filter.toLowerCase()) ||
      (l.user || "").toLowerCase().includes(filter.toLowerCase());
    const matchesLevel = levelFilter === "ALL" || l.level === levelFilter;
    return matchesText && matchesLevel;
  });

  const levelColor: Record<string, string> = {
    INFO: "#67e8f9", WARNING: "#fbbf24", ERROR: "#fb923c", CRITICAL: "#f87171", DEBUG: "#6b7280",
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 p-3 border-b border-gray-700 flex-shrink-0">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          className="flex-1 h-7 text-xs bg-gray-800 border-gray-700 text-white"
          placeholder="Filtrer les logs..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <select
          className="h-7 text-xs bg-gray-800 border border-gray-700 text-white rounded px-2"
          value={levelFilter}
          onChange={e => setLevelFilter(e.target.value)}>
          {["ALL", "CRITICAL", "ERROR", "WARNING", "INFO", "DEBUG"].map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <span className="text-xs text-gray-500">{filtered.length} events</span>
      </div>
      <div className="flex-1 overflow-y-auto font-mono text-xs">
        {filtered.map((log, i) => {
          const isHighlighted = log.isIOC && discoveredIOCs.includes(log.iocId || "");
          const c = levelColor[log.level] || "#f0f0f0";
          return (
            <div key={i}
              className={`px-3 py-1 border-b hover:bg-gray-800/50 ${log.isIOC ? "bg-red-950/20" : ""}`}
              style={{ borderBottomColor: "#1f2937" }}>
              <div className="flex items-start gap-2 flex-wrap">
                <span className="text-gray-500 flex-shrink-0">{log.timestamp}</span>
                <span className="px-1.5 py-0.5 rounded text-xs font-bold flex-shrink-0"
                  style={{ background: c + "20", color: c }}>{log.level}</span>
                <span className="text-gray-400 flex-shrink-0">{log.source}</span>
                {log.eventId && <span className="text-gray-600">EID:{log.eventId}</span>}
                {log.user && <span className="text-blue-400">{log.user}</span>}
              </div>
              <div className={`mt-0.5 leading-relaxed ${log.isIOC ? "font-bold" : ""}`}
                style={{ color: log.isIOC ? "#f87171" : "#d1d5db" }}>
                {log.isIOC && "⚠ "}{log.message}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SCADA HMI Dashboard ──────────────────────────────────────────────────────
function SCADADashboard({ scenario }: { scenario: ScenarioData }) {
  const tags = scenario.scadaTags || [];
  const devices = scenario.plcDevices || [];

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* PLC Status grid */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Automates (PLCs)</p>
        <div className="grid grid-cols-2 gap-2">
          {devices.map(d => {
            const statusBg: Record<string, string> = {
              online: "#052e16", warning: "#422006", fault: "#3a1a1a", compromised: "#3a1a1a", offline: "#111827"
            };
            const statusC: Record<string, string> = {
              online: "#4ade80", warning: "#fbbf24", fault: "#f87171", compromised: "#f87171", offline: "#6b7280"
            };
            const anomalies = d.registers.filter(r => r.isAnomaly).length;
            return (
              <div key={d.id} className="border rounded-xl p-3"
                style={{ borderColor: statusC[d.status] + "40", background: statusBg[d.status] || "#111827" }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: statusC[d.status] }} />
                  <span className="text-xs font-semibold text-white">{d.id}</span>
                  <span className="text-xs font-bold ml-auto" style={{ color: statusC[d.status] }}>
                    {d.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{d.type}</p>
                <p className="text-xs text-gray-500">{d.ip}</p>
                {anomalies > 0 && (
                  <div className="mt-1 flex items-center gap-1 text-xs" style={{ color: "#f87171" }}>
                    <AlertTriangle className="h-3 w-3" />
                    {anomalies} registre(s) hors limites
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Process tags */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Tags Process</p>
        <div className="space-y-2">
          {tags.map(tag => {
            const pct = ((tag.value - tag.min) / (tag.max - tag.min)) * 100;
            const tagColor = tag.status === "alarm" ? "#f87171" : tag.status === "warning" ? "#fbbf24" : "#4ade80";
            const isOverLimit = tag.value > tag.max || tag.value < tag.min;
            return (
              <div key={tag.id} className="border rounded-lg p-2.5"
                style={{ borderColor: tagColor + "30", background: "#0f1117" }}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-xs font-mono font-semibold text-white">{tag.name}</span>
                    <span className="text-xs text-gray-500 ml-2">{tag.description}</span>
                  </div>
                  <span className="text-sm font-bold font-mono" style={{ color: tagColor }}>
                    {tag.value} {tag.unit}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">{tag.min}</span>
                  <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, Math.max(0, pct))}%`,
                        background: tagColor,
                      }} />
                    {/* Setpoint marker */}
                    <div className="relative" style={{ marginTop: "-6px", marginLeft: `${((tag.setpoint - tag.min) / (tag.max - tag.min)) * 100}%` }}>
                      <div className="w-px h-3 bg-blue-400 -mt-1" />
                    </div>
                  </div>
                  <span className="text-xs text-gray-600">{tag.max}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded"
                    style={{ background: tagColor + "20", color: tagColor }}>
                    {tag.status.toUpperCase()}
                  </span>
                </div>
                {isOverLimit && (
                  <p className="text-xs mt-1" style={{ color: "#f87171" }}>
                    ⚠ Hors limites — SP: {tag.setpoint} {tag.unit} — INTERVENTION REQUISE
                  </p>
                )}
                {/* Mini trend */}
                <div className="flex items-end gap-0.5 mt-1.5 h-6">
                  {tag.trend.map((v, i) => {
                    const h = ((v - tag.min) / (tag.max - tag.min)) * 100;
                    return (
                      <div key={i} className="flex-1 rounded-sm min-w-[4px]"
                        style={{
                          height: `${Math.min(100, Math.max(5, h))}%`,
                          background: v > tag.max ? "#f87171" : v < tag.min ? "#fbbf24" : "#374151",
                        }} />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Scoreboard ───────────────────────────────────────────────────────────────
function Scoreboard({ score, scenario, discoveredIOCs }: {
  score: LabScore; scenario: ScenarioData; discoveredIOCs: string[];
}) {
  const allIOCs = scenario.iocs;
  const elapsed = Math.floor((Date.now() - score.startTime) / 1000);
  const completionPct = allIOCs.length > 0
    ? Math.round((discoveredIOCs.length / allIOCs.length) * 100)
    : 0;

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Score global */}
      <div className="border border-orange-800 bg-orange-950/30 rounded-xl p-4 text-center">
        <p className="text-xs text-orange-400 uppercase tracking-wide mb-1">Score</p>
        <p className="text-4xl font-bold text-orange-400 font-mono">{score.totalPoints}</p>
        <p className="text-xs text-gray-500 mt-1">points</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "IOCs trouvés", value: `${discoveredIOCs.length}/${allIOCs.length}`, color: "#67e8f9" },
          { label: "Commandes", value: score.commandsRun, color: "#a78bfa" },
          { label: "Mitigations", value: score.mitigationsTaken, color: "#4ade80" },
          { label: "Temps", value: formatTime(elapsed), color: "#fbbf24" },
        ].map(k => (
          <div key={k.label} className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
            <p className="text-lg font-bold font-mono" style={{ color: k.color }}>{k.value}</p>
            <p className="text-xs text-gray-500">{k.label}</p>
          </div>
        ))}
      </div>

      {/* IOC progress */}
      <div>
        <div className="flex justify-between mb-2">
          <p className="text-xs font-semibold text-gray-400">Indicateurs de compromission</p>
          <span className="text-xs text-gray-500">{completionPct}%</span>
        </div>
        <Progress value={completionPct} className="h-2 mb-3" />
        <div className="space-y-2">
          {allIOCs.map(ioc => {
            const found = discoveredIOCs.includes(ioc.id);
            const sevColor: Record<string, string> = {
              critical: "#f87171", high: "#fbbf24", medium: "#67e8f9", low: "#9ca3af"
            };
            return (
              <div key={ioc.id} className="flex items-center gap-2.5 p-2 rounded-lg"
                style={{ background: found ? "#052e16" : "#111827" }}>
                {found
                  ? <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                  : <div className="w-4 h-4 rounded-full border-2 border-gray-700 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono" style={{ color: found ? "#f0f0f0" : "#6b7280" }}>
                    {found ? ioc.value : "????????????????????????"}
                  </p>
                  {found && <p className="text-xs text-gray-500 truncate">{ioc.description}</p>}
                </div>
                <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                  style={{ background: sevColor[ioc.severity] + "20", color: sevColor[ioc.severity] }}>
                  {ioc.severity}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hints */}
      {discoveredIOCs.length < allIOCs.length && (
        <div className="border border-blue-900 bg-blue-950/20 rounded-xl p-3">
          <p className="text-xs font-semibold text-blue-400 mb-2">Indice suivant</p>
          {(() => {
            const nextIOC = allIOCs.find(i => !discoveredIOCs.includes(i.id));
            if (!nextIOC) return null;
            return (
              <p className="text-xs text-gray-400">
                Essayez: <span className="font-mono text-blue-300">{nextIOC.revealedBy[0]}</span>
              </p>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ─── Main CyberLab ────────────────────────────────────────────────────────────
export default function CyberLabClient({
  scenarioId,
  participantId,
  participantName,
  sessionId,
}: {
  scenarioId: string;
  participantId: string;
  participantName: string;
  sessionId?: string;
}) {
  const scenario = CYBERLAB_SCENARIOS[scenarioId] || CYBERLAB_SCENARIOS["ransomware_soc"];
  const mode = scenario.mode;

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [discoveredIOCs, setDiscoveredIOCs] = useState<string[]>([]);
  const [score, setScore] = useState<LabScore>({
    totalPoints: 0, iocFound: [], commandsRun: 0, mitigationsTaken: 0, timeElapsed: 0, startTime: Date.now(),
  });

  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => { scrollToBottom(); }, [history, scrollToBottom]);

  function getContext(): LabContext {
    return {
      phase: scenario.phase,
      discoveredIOCs,
      executedCommands: cmdHistory,
      mode,
      scenarioData: scenario,
    };
  }

  function executeCommand(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;

    const ts = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const parts = trimmed.split(/\s+/);
    const args = parts.slice(1);

    // Add to cmd history
    setCmdHistory(prev => [trimmed, ...prev].slice(0, 100));
    setHistoryIdx(-1);

    const cmd = resolveCommand(trimmed, mode);

    if (!cmd) {
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        cmd: trimmed,
        timestamp: ts,
        isError: true,
        output: [
          { text: `bash: ${parts[0]}: command not found`, color: "red" },
          { text: `Type 'help' for available commands`, color: "gray" },
        ],
      };
      setHistory(prev => [...prev, entry]);
      return;
    }

    const ctx = getContext();
    const result = cmd.outputFn(args, ctx);

    // Reveal IOCs
    const newIOCs = (result.revealIOC || []).filter(id => !discoveredIOCs.includes(id));
    if (newIOCs.length > 0) {
      setDiscoveredIOCs(prev => [...prev, ...newIOCs]);
    }

    // Update score
    const points = result.scorePoints || 0;
    const isMitigation = ["mitigation"].includes(cmd.category);
    setScore(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + points + newIOCs.length * 5,
      commandsRun: prev.commandsRun + 1,
      mitigationsTaken: prev.mitigationsTaken + (isMitigation ? 1 : 0),
      iocFound: [...prev.iocFound, ...newIOCs],
    }));

    const entry: HistoryEntry = {
      id: Date.now().toString(),
      cmd: trimmed,
      timestamp: ts,
      output: result.lines,
      isError: result.isError,
      iocFound: newIOCs,
      points: points + newIOCs.length * 5,
    };
    setHistory(prev => [...prev, entry]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      executeCommand(input);
      setInput("");
      setSuggestions([]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const s = getCommandSuggestions(input, mode);
      if (s.length === 1) { setInput(s[0]); setSuggestions([]); }
      else setSuggestions(s);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const newIdx = Math.min(historyIdx + 1, cmdHistory.length - 1);
      setHistoryIdx(newIdx);
      setInput(cmdHistory[newIdx] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const newIdx = Math.max(historyIdx - 1, -1);
      setHistoryIdx(newIdx);
      setInput(newIdx === -1 ? "" : cmdHistory[newIdx] || "");
    } else if (e.key === "Escape") {
      setSuggestions([]);
    }
    // Update suggestions on type
    else {
      setTimeout(() => {
        setSuggestions(getCommandSuggestions(input + (e.key.length === 1 ? e.key : ""), mode).slice(0, 4));
      }, 10);
    }
  }

  const prompt = mode === "ot_scada"
    ? `operator@ot-workstation:~$`
    : `analyst@soc-workstation:~$`;

  const modeLabel = mode === "ot_scada" ? "OT/SCADA" : mode === "forensic" ? "Forensic" : "IT/SOC";
  const modeColor = mode === "ot_scada" ? "#fbbf24" : mode === "forensic" ? "#a78bfa" : "#67e8f9";

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <div className="w-7 h-7 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">S</div>
        <div className="w-px h-5 bg-gray-700" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-semibold">SURVIVE CyberLab</span>
        <div className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: modeColor + "20", color: modeColor }}>
          {modeLabel}
        </div>
        <span className="text-xs text-gray-500 truncate">{scenario.title}</span>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-center">
            <p className="text-sm font-bold text-orange-400 font-mono">{score.totalPoints}</p>
            <p className="text-xs text-gray-600">pts</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-cyan-400">{discoveredIOCs.length}/{scenario.iocs.length}</p>
            <p className="text-xs text-gray-600">IOC</p>
          </div>
          <span className="text-xs text-gray-500">{participantName}</span>
        </div>
      </div>

      {/* IOC alert banner */}
      {discoveredIOCs.length > 0 && discoveredIOCs.length === scenario.iocs.length && (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-900/40 border-b border-green-800 text-sm text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          <span>Tous les IOC identifiés — exercice complété avec succès !</span>
        </div>
      )}

      {/* Main layout */}
      <div className="flex flex-1 min-h-0">
        {/* Terminal — main panel */}
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-800">
          <Tabs defaultValue="terminal" className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-1 px-3 pt-2 bg-gray-900 border-b border-gray-800 flex-shrink-0">
              <TabsList className="bg-transparent gap-1 h-auto">
                <TabsTrigger value="terminal"
                  className="data-[state=active]:bg-gray-800 text-xs px-3 py-1.5 gap-1.5">
                  <Terminal className="h-3.5 w-3.5" /> Terminal
                </TabsTrigger>
                <TabsTrigger value="siem"
                  className="data-[state=active]:bg-gray-800 text-xs px-3 py-1.5 gap-1.5">
                  <Search className="h-3.5 w-3.5" /> SIEM / Logs
                </TabsTrigger>
                {mode === "ot_scada" && (
                  <TabsTrigger value="scada"
                    className="data-[state=active]:bg-gray-800 text-xs px-3 py-1.5 gap-1.5">
                    <Activity className="h-3.5 w-3.5" /> SCADA HMI
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* TERMINAL TAB */}
            <TabsContent value="terminal" className="flex-1 flex flex-col min-h-0 mt-0 data-[state=inactive]:hidden">
              {/* Welcome */}
              {history.length === 0 && (
                <div className="p-4 border-b border-gray-800 text-xs font-mono">
                  <div style={{ color: "#67e8f9" }} className="font-bold mb-1">
                    SURVIVE CyberLab — {scenario.title}
                  </div>
                  <div style={{ color: "#6b7280" }}>
                    Votre mission: investiguer l'incident et identifier les IOCs.
                    Tapez <span style={{ color: "#fbbf24" }}>help</span> pour la liste des commandes.
                    Utilisez <span style={{ color: "#fbbf24" }}>TAB</span> pour l'autocomplétion.
                  </div>
                  <div style={{ color: "#6b7280" }} className="mt-1">
                    Phase actuelle: <span style={{ color: "#f87171" }}>{scenario.phase.toUpperCase()}</span>
                  </div>
                </div>
              )}

              {/* Output */}
              <div ref={terminalRef} className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-xs"
                onClick={() => inputRef.current?.focus()}>
                {history.map(entry => (
                  <div key={entry.id}>
                    {/* Command line */}
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ color: "#4ade80" }} className="flex-shrink-0">{prompt}</span>
                      <span className="text-white">{entry.cmd}</span>
                      {entry.iocFound && entry.iocFound.length > 0 && (
                        <span className="ml-auto px-1.5 py-0.5 rounded text-xs font-bold bg-green-900/50 text-green-400">
                          +{(entry.points || 0)}pts · {entry.iocFound.length} IOC
                        </span>
                      )}
                      <span className="text-gray-700 flex-shrink-0">{entry.timestamp}</span>
                    </div>
                    {/* Output lines */}
                    <div className="pl-2 space-y-0.5">
                      {entry.output.map((line, i) => <TermLine key={i} line={line} />)}
                    </div>
                    {/* IOC found notification */}
                    {entry.iocFound && entry.iocFound.length > 0 && (
                      <div className="mt-1 pl-2 text-xs text-green-400 font-semibold">
                        ✓ {entry.iocFound.length} IOC découvert(s) — {entry.points} points
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="border-t border-gray-800 p-2 flex-shrink-0" style={{ background: "#0a0c11" }}>
                {suggestions.length > 0 && (
                  <div className="mb-1 flex flex-wrap gap-1">
                    {suggestions.map(s => (
                      <button key={s}
                        className="text-xs px-2 py-0.5 bg-gray-800 text-cyan-400 rounded font-mono hover:bg-gray-700"
                        onClick={() => { setInput(s); setSuggestions([]); inputRef.current?.focus(); }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs flex-shrink-0" style={{ color: "#4ade80" }}>{prompt}</span>
                  <input
                    ref={inputRef}
                    className="flex-1 bg-transparent text-white font-mono text-xs outline-none"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Entrez une commande..."
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <button onClick={() => { setHistory([]); setInput(""); }}
                    className="text-gray-700 hover:text-gray-500">
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </TabsContent>

            {/* SIEM TAB */}
            <TabsContent value="siem" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden">
              <SIEMViewer
                logs={scenario.logEntries || []}
                discoveredIOCs={discoveredIOCs}
              />
            </TabsContent>

            {/* SCADA TAB */}
            {mode === "ot_scada" && (
              <TabsContent value="scada" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden overflow-hidden">
                <SCADADashboard scenario={scenario} />
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Right panel — IOCs + Scoreboard */}
        <div className="w-72 flex flex-col min-h-0 flex-shrink-0">
          <Tabs defaultValue="score" className="flex-1 flex flex-col min-h-0">
            <TabsList className="bg-gray-900 rounded-none border-b border-gray-800 gap-0 h-auto px-2 pt-2">
              <TabsTrigger value="score" className="data-[state=active]:bg-gray-800 text-xs px-3 py-1.5">
                <Award className="h-3.5 w-3.5 mr-1" /> Score
              </TabsTrigger>
              <TabsTrigger value="iocs" className="data-[state=active]:bg-gray-800 text-xs px-3 py-1.5">
                <Shield className="h-3.5 w-3.5 mr-1" /> IOCs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="score" className="flex-1 min-h-0 overflow-hidden mt-0 data-[state=inactive]:hidden">
              <Scoreboard score={score} scenario={scenario} discoveredIOCs={discoveredIOCs} />
            </TabsContent>

            <TabsContent value="iocs" className="flex-1 overflow-y-auto p-3 space-y-2 mt-0 data-[state=inactive]:hidden">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                IOCs trouvés ({discoveredIOCs.length}/{scenario.iocs.length})
              </p>
              {discoveredIOCs.length === 0 ? (
                <div className="text-center py-8 text-gray-600 text-xs">
                  <Shield className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  Aucun IOC découvert — utilisez le terminal pour investiguer
                </div>
              ) : (
                scenario.iocs
                  .filter(ioc => discoveredIOCs.includes(ioc.id))
                  .map(ioc => <IOCBadge key={ioc.id} ioc={ioc} />)
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
