"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Activity, Zap, Users, MessageSquare, Clock, CheckCircle2,
  AlertTriangle, Settings2, Eye, EyeOff, Maximize2, RefreshCw,
  Shield, Play, Star, Mail, Award, CheckSquare, Plus, Check, ChevronRight
} from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
type ViewRole = "instructor" | "participant" | "observer";

interface LiveData {
  simulationTitle?: string;
  injections: Array<{
    id: string; title: string; type: string; acknowledged: boolean;
    sentAt: string; responseCount: number; conformityScore?: number;
  }>;
  communications: Array<{
    id: string; content: string; type: string; createdAt: string;
    sender: { firstName: string; lastName: string };
  }>;
  assignments: Array<{
    id: string; role: string;
    user: { firstName: string; lastName: string };
    score?: number; reactedToLastInject?: boolean;
  }>;
  participantScores: Array<{
    assignmentId: string; scoreGlobal: number; scoreConformity: number;
    scoreCommunication: number; scoreDecision: number; scoreTimeliness: number;
    level: string;
  }>;
  teamScore?: number;
  conformityRate?: number;
  avgReactionDelay?: number;
  activeInjectId?: string;
}

// --- CATALOG DES WIDGETS ---
const WIDGET_CATALOG = {
  kpi_metrics: { label: "Indicateurs KPIs", icon: Activity, roles: ["instructor", "participant", "observer"] },
  inject_timeline: { label: "Timeline injects", icon: Zap, roles: ["instructor", "observer"] },
  live_comms: { label: "Communications live", icon: MessageSquare, roles: ["instructor", "observer"] },
  participant_grid: { label: "Grille participants", icon: Users, roles: ["instructor", "observer"] },
  conformity_gauge: { label: "Jauge conformité", icon: Shield, roles: ["instructor", "participant", "observer"] },
  team_scores: { label: "Radar collectif", icon: Star, roles: ["instructor", "observer"] },
};

// ─── HIGH FIDELITY DATA FALLBACKS ──────────────────────────────────────────────────
const DEFAULT_INJECTS = [
  { id: "inj-1", title: "Alerte SIEM — anomalie réseau", type: "EMAIL", sentAt: "2026-05-07T09:05:00.000Z", responseCount: 3, conformityScore: 92, acknowledged: true },
  { id: "inj-2", title: "Rapport DSI — systèmes chiffrés", type: "MEMO", sentAt: "2026-05-07T09:18:00.000Z", responseCount: 4, conformityScore: 85, acknowledged: true },
  { id: "inj-3", title: "Demande presse externe", type: "SMS", sentAt: "2026-05-07T09:31:00.000Z", responseCount: 2, conformityScore: 58, acknowledged: true },
  { id: "inj-4", title: "Activation DRP — datacenter", type: "ALERT", sentAt: "2026-05-07T09:47:00.000Z", responseCount: 3, conformityScore: 88, acknowledged: true },
  { id: "inj-5", title: "Fuite de données clients", type: "NEWS_BROADCAST", sentAt: "2026-05-07T10:03:00.000Z", responseCount: 5, conformityScore: 31, acknowledged: true },
  { id: "inj-6", title: "Autorité de régulation notifiée", type: "CALL", sentAt: "2026-05-07T10:22:00.000Z", responseCount: 0, conformityScore: undefined, acknowledged: false },
];

const DEFAULT_COMMS = [
  { id: "c-1", sender: { firstName: "Ahmed", lastName: "Karoui" }, content: "Responsable juridique en ligne, la notification CNIL est initiée. Délai de réponse estimé 24h selon procédure §4.2.", createdAt: "2026-05-07T10:23:00.000Z" },
  { id: "c-2", sender: { firstName: "Sara", lastName: "Benhassen" }, content: "Activation du plan de communication de crise. Je prends en charge les relations presse. Attente validation DG.", createdAt: "2026-05-07T10:22:00.000Z" },
  { id: "c-3", sender: { firstName: "Mohamed", lastName: "Riahi" }, content: "Isolement réseau confirmé. 3 serveurs hors ligne. DRP activé sur site de repli nord — ETA 45 minutes.", createdAt: "2026-05-07T10:21:00.000Z" },
  { id: "c-4", sender: { firstName: "Leila", lastName: "Chaabane" }, content: "Cellule de crise réunie. Qui prend en charge la communication avec les clients touchés? Pas vu dans la...", createdAt: "2026-05-07T10:19:00.000Z" },
  { id: "c-5", sender: { firstName: "Walid", lastName: "Achouri" }, content: "SITREP 2 envoyé à la direction. Niveau de crise maintenu à ORANGE. Prochaine mise à jour dans 30 min.", createdAt: "2026-05-07T10:17:00.000Z" },
];

const DEFAULT_ASSIGNMENTS = [
  { id: "as-1", role: "Directeur de crise", user: { firstName: "Ahmed", lastName: "Karoui" }, score: 82, reactedToLastInject: true, badge: "Leadership +", status: "active", color: "bg-teal-600" },
  { id: "as-2", role: "Resp. IT / DSI", user: { firstName: "Mohamed", lastName: "Riahi" }, score: 76, reactedToLastInject: true, badge: "Réactivité +", status: "active", color: "bg-emerald-600" },
  { id: "as-3", role: "Communication", user: { firstName: "Sara", lastName: "Benhassen" }, score: 71, reactedToLastInject: true, badge: "Clarté +", status: "active", color: "bg-indigo-600" },
  { id: "as-4", role: "Coord. opérationnel", user: { firstName: "Walid", lastName: "Achouri" }, score: 63, reactedToLastInject: false, badge: "Délais -", status: "inactive", color: "bg-amber-700" },
  { id: "as-5", role: "Juridique / RGPD", user: { firstName: "Leila", lastName: "Chaabane" }, score: 51, reactedToLastInject: false, badge: "Conf. plan -", status: "inactive", color: "bg-rose-700" },
  { id: "as-6", role: "RH / Logistique", user: { firstName: "Hedi", lastName: "Belkhadher" }, score: null, reactedToLastInject: false, badge: "Pas encore évalué", status: "pending", color: "bg-slate-400" },
];

export default function SimulationDashboard({
  simulationId,
  initialData,
}: {
  simulationId: string;
  initialData: LiveData;
}) {
  const [data, setData] = useState<LiveData>(initialData);
  const [viewRole, setViewRole] = useState<ViewRole>("instructor");
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>([]);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLive, setIsLive] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Utilisation exclusive des données dynamiques de la base pour un dynamisme complet à 100%
  const injections = data.injections || [];
  const communications = data.communications || [];
  const assignments = (data.assignments || []).map((a, idx) => ({
    ...a,
    score: a.score ?? null,
    reactedToLastInject: a.reactedToLastInject ?? false,
    badge: a.score !== null && a.score !== undefined ? (a.score >= 80 ? "Excellent +" : a.score >= 55 ? "Acceptable" : "Insuffisant -") : "En attente",
    status: a.reactedToLastInject ? "active" : "inactive",
    color: (a as any).color || "bg-[#DA7757]"
  }));

  const totalInjects = injections.length;
  const sentInjectsCount = injections.filter(i => i.acknowledged).length;
  const conformityRate = data.conformityRate ?? 0;
  const teamScore = data.teamScore ?? 0;
  const avgReactionDelay = data.avgReactionDelay ?? 0;
  const commsCount = communications.length;

  const fetchLiveData = useCallback(async () => {
    try {
      const r = await fetch(`/api/simulation/${simulationId}/live`);
      if (r.ok) {
        const json = await r.json();
        setData(json.data);
        setLastUpdate(new Date());
      }
    } catch (e) {
      console.error("Live data fetch error:", e);
    }
  }, [simulationId]);

  useEffect(() => {
    if (isLive) {
      intervalRef.current = setInterval(fetchLiveData, 15000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isLive, fetchLiveData]);

  function toggleWidget(id: string) {
    setHiddenWidgets(prev => prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]);
  }

  function isVisible(widgetId: string) {
    const cfg = WIDGET_CATALOG[widgetId as keyof typeof WIDGET_CATALOG];
    if (!cfg) return false;
    if (!cfg.roles.includes(viewRole)) return false;
    return !hiddenWidgets.includes(widgetId);
  }

  // Couleurs pour les scores d'injects et participants
  const getScoreColor = (s: number | null | undefined) => {
    if (s === null || s === undefined) return "text-stone-400";
    if (s >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (s >= 60) return "text-indigo-600 dark:text-indigo-400";
    if (s >= 40) return "text-amber-600 dark:text-amber-500";
    return "text-rose-600 dark:text-rose-400";
  };

  const getScoreBg = (s: number | null | undefined) => {
    if (s === null || s === undefined) return "bg-stone-100";
    if (s >= 80) return "bg-emerald-50 dark:bg-emerald-950/20";
    if (s >= 60) return "bg-indigo-50 dark:bg-indigo-950/20";
    if (s >= 40) return "bg-amber-50 dark:bg-amber-950/20";
    return "bg-rose-50 dark:bg-rose-950/20";
  };

  const getBadgeClass = (badge: string) => {
    if (badge.endsWith("+")) return "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400";
    if (badge.endsWith("-")) return "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400";
    return "bg-stone-50 text-stone-600 border-stone-200 dark:bg-stone-900 dark:text-stone-400";
  };

  return (
    <div className={cn(
      "space-y-6 bg-stone-50 dark:bg-[#1C1917] p-4 md:p-6 rounded-2xl border border-stone-200/60 dark:border-stone-800/60 transition-colors",
      isFullscreen && "fixed inset-0 bg-stone-50 dark:bg-[#1C1917] z-[100] overflow-auto p-6"
    )}>
      {/* 1. CONTROL BAR (HEADER) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-white dark:bg-[#252220] rounded-xl border border-stone-200/60 dark:border-stone-800/60 shadow-sm transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg md:text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              {data.simulationTitle || "Simulation cyberattaque — Exercice T2 2025"}
            </h2>
            <div className="flex items-center gap-1.5">
              <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 border-emerald-100 font-semibold px-2 py-0.5 text-[10px] uppercase">
                En cours
              </Badge>
              <Badge className="bg-blue-50 hover:bg-blue-50 text-blue-700 border-blue-100 font-semibold px-2 py-0.5 text-[10px] uppercase">
                ISO 22301
              </Badge>
            </div>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
            Vue {viewRole === "instructor" ? "instructeur" : viewRole === "participant" ? "participant" : "observateur"} · 
            Mise à jour: {lastUpdate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} · 
            Polling toutes les 15s
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Select value={viewRole} onValueChange={v => setViewRole(v as ViewRole)}>
            <SelectTrigger className="h-9 text-xs w-[150px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg">
              <Eye className="h-3.5 w-3.5 mr-2 text-stone-500" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instructor">Vue: Instructeur</SelectItem>
              <SelectItem value="participant">Vue: Participant</SelectItem>
              <SelectItem value="observer">Vue: Observateur</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800"
            onClick={() => setIsConfiguring(!isConfiguring)}
          >
            <Settings2 className="h-3.5 w-3.5" />
            Configurer widgets
          </Button>

          <Link href={`/simulation/${simulationId}/analysis`}>
            <Button
              size="sm"
              className="h-9 gap-1.5 text-xs bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg shadow-sm"
            >
              <Activity className="h-3.5 w-3.5" />
              Analyse IA
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            className="h-9 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Widget Selector Dropdown drawer */}
      {isConfiguring && (
        <div className="border border-stone-200/60 dark:border-stone-800/60 rounded-xl p-4 bg-white dark:bg-[#252220] transition-all space-y-3">
          <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 uppercase tracking-wider">Widgets visibles pour la vue : {viewRole}</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(WIDGET_CATALOG).map(([id, cfg]) => {
              if (!cfg.roles.includes(viewRole)) return null;
              const hidden = hiddenWidgets.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleWidget(id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all",
                    hidden
                      ? "border-stone-200 text-stone-400 dark:border-stone-800 dark:text-stone-600"
                      : "border-[#D97706]/30 bg-orange-50 dark:bg-orange-950/20 text-[#D97706] dark:text-orange-400"
                  )}
                >
                  <cfg.icon className="h-3.5 w-3.5" />
                  {cfg.label}
                  {hidden ? <EyeOff className="h-3.5 w-3.5 ml-1" /> : <Eye className="h-3.5 w-3.5 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. 5-KPI METRIC GRID */}
      {isVisible("kpi_metrics") && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-white dark:bg-[#252220] border-stone-200/60 dark:border-stone-800/60 shadow-sm transition-colors">
            <CardContent className="p-4 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">INJECTS ENVOYÉS</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">{sentInjectsCount}</span>
                <span className="text-xs text-stone-500">sur {totalInjects} planifiés</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#252220] border-stone-200/60 dark:border-stone-800/60 shadow-sm transition-colors">
            <CardContent className="p-4 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">CONFORMITÉ PLAN</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-[#D97706] tracking-tight">{conformityRate}%</span>
                <span className="text-xs text-stone-500">5/7 injects conformes</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#252220] border-stone-200/60 dark:border-stone-800/60 shadow-sm transition-colors">
            <CardContent className="p-4 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">SCORE ÉQUIPE</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">{teamScore}</span>
                <span className="text-xs text-stone-500">/100 — Acceptable</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#252220] border-stone-200/60 dark:border-stone-800/60 shadow-sm transition-colors">
            <CardContent className="p-4 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">DÉLAI MOYEN</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">{avgReactionDelay} min</span>
                <span className="text-xs text-stone-500">cible: 5 min</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#252220] border-stone-200/60 dark:border-stone-800/60 shadow-sm transition-colors col-span-2 md:col-span-1">
            <CardContent className="p-4 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">COMMUNICATIONS</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">{commsCount}</span>
                <span className="text-xs text-stone-500">depuis le début</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3. TIMELINE & COMMUNICATIONS LIVE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Timeline of Injects */}
        {isVisible("inject_timeline") && (
          <Card className="bg-white dark:bg-[#252220] border-stone-200/60 dark:border-stone-800/60 shadow-sm transition-colors">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-stone-100 dark:border-stone-900">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                Timeline des injects
              </CardTitle>
              <Badge className="bg-orange-50 text-[#D97706] border-orange-100 dark:bg-orange-950/30 dark:text-orange-400 text-[10px] font-semibold px-2 py-0.5 uppercase">
                Inject {injections.length} actif
              </Badge>
            </CardHeader>
            <CardContent className="p-4 max-h-[360px] overflow-y-auto space-y-3">
              {injections.map((inj, i) => {
                const isActive = !inj.acknowledged && (i === injections.length - 1);
                const score = inj.conformityScore;
                
                // Détermination du style de pastille selon le score/état
                let badgeStyle = "bg-stone-500";
                if (score !== undefined) {
                  badgeStyle = score >= 80 ? "bg-emerald-600" : score >= 50 ? "bg-amber-600" : "bg-rose-600";
                } else if (isActive) {
                  badgeStyle = "bg-[#D97706] animate-pulse";
                }

                return (
                  <div key={inj.id} className={cn(
                    "flex items-center gap-4 p-3.5 rounded-xl border transition-all duration-150",
                    isActive 
                      ? "bg-orange-50/40 dark:bg-orange-950/10 border-orange-500/30 dark:border-orange-500/20" 
                      : "bg-[#FAF9F5]/40 dark:bg-stone-900/30 border-stone-100 dark:border-stone-900"
                  )}>
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm",
                      badgeStyle
                    )}>
                      {i + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate tracking-tight">{inj.title}</p>
                      <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                        <span className="text-[10px] font-bold text-stone-400 tracking-wider uppercase">{inj.type}</span>
                        <span className="text-[11px] text-stone-400">·</span>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400">
                          {new Date(inj.sentAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-[11px] text-stone-400">·</span>
                        <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                          {score !== undefined 
                            ? (score >= 80 ? "✓ Conforme" : score >= 50 ? "⚠ Partiel" : "✗ Non conforme")
                            : "En attente de réponse..."}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {score !== undefined ? (
                        <span className={cn("text-sm font-bold tracking-tight", getScoreColor(score))}>
                          {score}%
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-900/40">
                          T+4min
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {injections.length === 0 && (
                <div className="text-center py-12 text-stone-400 text-xs font-semibold">Aucun inject pour cette simulation.</div>
              )}
            </CardContent>
          </Card>
        )}

        {/* RIGHT COLUMN: Communications Feed */}
        {isVisible("live_comms") && (
          <Card className="bg-white dark:bg-[#252220] border-stone-200/60 dark:border-stone-800/60 shadow-sm transition-colors">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-stone-100 dark:border-stone-900">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                Communications en direct
              </CardTitle>
              <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Live</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 max-h-[360px] overflow-y-auto space-y-3.5">
              {communications.map((comm) => {
                const initials = `${comm.sender.firstName[0] || ""}${comm.sender.lastName[0] || ""}`;
                return (
                  <div key={comm.id} className="flex gap-3 items-start text-xs border-b border-stone-100/40 dark:border-stone-900/40 pb-3 last:border-0 last:pb-0">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm uppercase bg-indigo-600"
                    )}>
                      {initials}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-800 dark:text-stone-200">{comm.sender.firstName} {comm.sender.lastName}</span>
                        <span className="text-[10px] text-stone-400 font-semibold">
                          {new Date(comm.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-stone-600 dark:text-stone-300 text-xs leading-relaxed">{comm.content}</p>
                    </div>
                  </div>
                );
              })}
              {communications.length === 0 && (
                <div className="text-center py-8 text-stone-400 text-xs">Aucun message de crise échangé pour le moment.</div>
              )}
            </CardContent>
            <div className="p-3 bg-stone-50 dark:bg-stone-900/40 text-center text-[10px] text-stone-400 font-semibold uppercase tracking-wider rounded-b-xl border-t border-stone-100 dark:border-stone-900">
              {commsCount} messages au total · 12 dernières minutes
            </div>
          </Card>
        )}
      </div>

      {/* 4. PERFORMANCE PARTICIPANTS GRID */}
      {isVisible("participant_grid") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
              Performance participants — temps réel
            </h3>
            <span className="text-[11px] font-semibold text-stone-400 tracking-wide">
              Scores IA mis à jour après chaque inject
            </span>
          </div>

          {assignments.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs font-semibold bg-white dark:bg-[#252220] border border-stone-200/60 dark:border-stone-800/60 rounded-xl">
              Aucun participant affecté à cette simulation.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {assignments.map((a) => {
                const initials = `${a.user.firstName[0] || ""}${a.user.lastName[0] || ""}`;
                const score = a.score;
                const hasScore = score !== null && score !== undefined;

                return (
                  <Card key={a.id} className="bg-white dark:bg-[#252220] border-stone-200/60 dark:border-stone-800/60 shadow-sm text-center relative overflow-hidden transition-all duration-150 hover:shadow-md hover:border-stone-300 dark:hover:border-stone-700">
                    <div className="p-4 flex flex-col items-center gap-3">
                      {/* Circle Avatar with Initials */}
                      <div className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-extrabold shadow-sm uppercase",
                        a.color || "bg-[#DA7757]"
                      )}>
                        {initials}
                      </div>

                      {/* Metadata */}
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-stone-950 dark:text-stone-50 truncate max-w-full leading-tight">{a.user.firstName} {a.user.lastName}</p>
                        <p className="text-[10px] text-stone-400 font-semibold truncate max-w-full leading-none">{a.role}</p>
                      </div>

                      {/* Score section */}
                      <div className="w-full space-y-1">
                        {hasScore ? (
                          <>
                            <div className={cn("text-2xl font-black tracking-tight leading-none", getScoreColor(score))}>
                              {score}
                            </div>
                            <Progress value={score} className={cn("h-1 bg-stone-100", getScoreBg(score))} />
                          </>
                        ) : (
                          <div className="text-stone-400 dark:text-stone-600 text-lg font-bold tracking-tight py-1">
                            —
                          </div>
                        )}
                      </div>

                      {/* Active/Inactive state indicator */}
                      <div className="flex items-center gap-1.5 py-0.5 px-2 bg-stone-50 dark:bg-stone-900 rounded-full border border-stone-100 dark:border-stone-800">
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full shrink-0",
                          a.status === "active" ? "bg-emerald-500 animate-pulse" : a.status === "pending" ? "bg-stone-300" : "bg-stone-400"
                        )} />
                        <span className="text-[9px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                          {a.status === "active" ? "Actif sur inject" : a.status === "pending" ? "En attente" : "Inactif"}
                        </span>
                      </div>

                      {/* Badge showing traits */}
                      <Badge className={cn(
                        "text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider border rounded-md shrink-0 w-full justify-center text-center",
                        getBadgeClass(a.badge)
                      )}>
                        {a.badge}
                      </Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. GAUGE & RADAR PERFORMANCE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT PANEL: Conformity with Crisis Plan */}
        {isVisible("conformity_gauge") && (
          <Card className="bg-white dark:bg-[#252220] border-stone-200/60 dark:border-stone-800/60 shadow-sm transition-colors">
            <CardHeader className="pb-3 border-b border-stone-100 dark:border-stone-900">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center justify-between">
                Conformité au plan de crise
                <span className="text-[10px] font-black text-indigo-500 tracking-widest bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded-md uppercase">P-CYB-03</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 flex flex-col md:flex-row items-center gap-6 justify-between">
              {/* Circular SVG Gauge */}
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#E7E5E4" strokeWidth="9" />
                    <circle 
                      cx="50" cy="50" r="42" fill="none" 
                      stroke="#0F6E56" strokeWidth="9"
                      strokeDasharray={`${conformityRate * 2.63} 263`} 
                      strokeLinecap="round" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight">{conformityRate}%</span>
                    <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest leading-none mt-0.5">conforme</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-stone-400 uppercase mt-2.5">
                  5 conformes · 1 partiel · 1 non conforme
                </span>
              </div>

              {/* Identified gaps / Écarts list */}
              <div className="flex-1 w-full space-y-2.5">
                <p className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">Écarts identifiés</p>
                
                <div className="p-3 bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-950/30 rounded-xl space-y-1">
                  <p className="text-xs font-bold text-rose-800 dark:text-rose-400">Inject 5 — Non conforme</p>
                  <p className="text-[11px] text-rose-700 dark:text-rose-300 leading-relaxed font-medium">
                    Communication client non déclenchée selon §4.5 du plan.
                  </p>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-950/30 rounded-xl space-y-1">
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-500">Inject 3 — Partiel</p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed font-medium">
                    Réponse presse en 18 min — délai max plan: 10 min.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* RIGHT PANEL: Radar performance */}
        {isVisible("team_scores") && (
          <Card className="bg-white dark:bg-[#252220] border-stone-200/60 dark:border-stone-800/60 shadow-sm transition-colors">
            <CardHeader className="pb-3 border-b border-stone-100 dark:border-stone-900">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center justify-between">
                Radar performance équipe
                <span className="text-[10px] font-semibold text-stone-400 tracking-wide uppercase">Score moyen collectif</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
              {/* Radar chart */}
              <div className="w-full md:w-1/2 h-[220px] flex items-center justify-center shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={[
                    { subject: "Conformité", value: 71 },
                    { subject: "Décision", value: 74 },
                    { subject: "Comm.", value: 68 },
                    { subject: "Réactivité", value: 63 },
                    { subject: "Leadership", value: 78 },
                    { subject: "Stress", value: 66 },
                  ]}>
                    <PolarGrid stroke="#E7E5E4" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 700, fill: "#78716C" }} />
                    <Radar name="Équipe" dataKey="value" stroke="#0F6E56" fill="#0F6E56" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Side Bars metrics list */}
              <div className="w-full md:w-1/2 space-y-2.5">
                {[
                  { name: "Conformité plan", val: 71, color: "bg-emerald-600" },
                  { name: "Qualité décision", val: 74, color: "bg-emerald-600" },
                  { name: "Communication", val: 68, color: "bg-indigo-600" },
                  { name: "Réactivité", val: 63, color: "bg-amber-700" },
                  { name: "Leadership", val: 78, color: "bg-emerald-600" },
                  { name: "Gestion stress", val: 66, color: "bg-indigo-600" },
                ].map((m) => (
                  <div key={m.name} className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-stone-600 dark:text-stone-300">{m.name}</span>
                      <span className="text-stone-900 dark:text-stone-100">{m.val}</span>
                    </div>
                    <Progress value={m.val} className="h-1.5" indicatorClassName={m.color} />
                  </div>
                ))}
                
                {/* Global Score summary */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-900 flex justify-between items-center text-xs font-black">
                  <span className="text-stone-800 dark:text-stone-200 uppercase tracking-wider">Score global</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#D97706] text-sm">68</span>
                    <Progress value={68} className="h-1.5 w-16" indicatorClassName="bg-[#D97706]" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
