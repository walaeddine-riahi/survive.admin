"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Activity, Zap, Users, MessageSquare, Clock, CheckCircle2,
  AlertTriangle, Settings2, Eye, EyeOff, Maximize2, RefreshCw,
  TrendingUp, Shield,
} from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
type ViewRole = "instructor" | "participant" | "observer";

interface LiveData {
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

// ─── Widget configs per role ──────────────────────────────────────────────────
const WIDGET_CATALOG = {
  inject_timeline: { label: "Timeline injects", icon: Zap, roles: ["instructor", "observer"] },
  team_scores: { label: "Scores équipe", icon: TrendingUp, roles: ["instructor", "observer"] },
  participant_grid: { label: "Grille participants", icon: Users, roles: ["instructor", "observer"] },
  live_comms: { label: "Communications live", icon: MessageSquare, roles: ["instructor"] },
  conformity_gauge: { label: "Jauge conformité", icon: Shield, roles: ["instructor", "participant", "observer"] },
  reaction_clock: { label: "Chrono réaction", icon: Clock, roles: ["instructor", "participant"] },
  stress_monitor: { label: "Moniteur stress", icon: Activity, roles: ["instructor"] },
};

const SCORE_COLOR = (s: number) => s >= 90 ? "#0F6E56" : s >= 70 ? "#3B6D11" : s >= 50 ? "#854F0B" : "#E24B4A";

const INJECT_TYPE_CONFIG: Record<string, { color: string; bg: string }> = {
  EMAIL:   { color: "#185FA5", bg: "#E6F1FB" },
  SMS:     { color: "#3B6D11", bg: "#EAF3DE" },
  CALL:    { color: "#0F6E56", bg: "#E1F5EE" },
  ALERT:   { color: "#A32D2D", bg: "#FCEBEB" },
  MEMO:    { color: "#534AB7", bg: "#EEEDFE" },
  SOCIAL:  { color: "#993556", bg: "#FBEAF0" },
  NEWS_BROADCAST: { color: "#854F0B", bg: "#FAEEDA" },
  OTHER:   { color: "#5F5E5A", bg: "#F1EFE8" },
};

// ─── Widget: Inject Timeline ─────────────────────────────────────────────────
function InjectTimeline({ injections, activeId }: {
  injections: LiveData["injections"];
  activeId?: string;
}) {
  return (
    <div className="space-y-2">
      {injections.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Aucun inject envoyé</p>
      ) : (
        injections.map((inj, i) => {
          const cfg = INJECT_TYPE_CONFIG[inj.type] || INJECT_TYPE_CONFIG.OTHER;
          const isActive = inj.id === activeId;
          return (
            <div key={inj.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              isActive ? "border-orange-400 bg-orange-50 shadow-sm" : "border-gray-100"
            }`}>
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: cfg.color }}>
                  {i + 1}
                </div>
                {i < injections.length - 1 && <div className="w-0.5 h-4 bg-gray-200" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{inj.title}</p>
                  {isActive && <Badge className="text-xs bg-orange-100 text-orange-700">En cours</Badge>}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: cfg.bg, color: cfg.color }}>
                    {inj.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(inj.sentAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="text-xs text-muted-foreground">{inj.responseCount} réponse(s)</span>
                </div>
              </div>
              <div>
                {inj.conformityScore != null ? (
                  <span className="text-sm font-bold" style={{ color: SCORE_COLOR(inj.conformityScore) }}>
                    {inj.conformityScore}%
                  </span>
                ) : inj.acknowledged ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── Widget: Participant Grid ─────────────────────────────────────────────────
function ParticipantGrid({ assignments, scores }: {
  assignments: LiveData["assignments"];
  scores: LiveData["participantScores"];
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {assignments.map(a => {
        const score = scores.find(s => s.assignmentId === a.id);
        const global = score?.scoreGlobal ?? null;
        return (
          <div key={a.id} className="border rounded-xl p-3 text-center hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-sm font-bold"
              style={{ background: global != null ? SCORE_COLOR(global) : "#D3D1C7" }}>
              {a.user.firstName[0]}{a.user.lastName[0]}
            </div>
            <p className="text-xs font-semibold truncate">{a.user.firstName} {a.user.lastName}</p>
            <p className="text-xs text-muted-foreground truncate">{a.role}</p>
            {global != null ? (
              <>
                <p className="text-lg font-bold mt-1" style={{ color: SCORE_COLOR(global) }}>{global}</p>
                <Progress value={global} className="h-1 mt-1" />
              </>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">En attente</p>
            )}
            {a.reactedToLastInject ? (
              <div className="mt-1 flex items-center justify-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-600">Actif</span>
              </div>
            ) : (
              <div className="mt-1 flex items-center justify-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
                <span className="text-xs text-muted-foreground">Inactif</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Widget: Conformity Gauge ─────────────────────────────────────────────────
function ConformityGauge({ rate, teamScore }: { rate?: number; teamScore?: number }) {
  const r = rate ?? 0;
  const color = r >= 80 ? "#0F6E56" : r >= 60 ? "#3B6D11" : r >= 40 ? "#854F0B" : "#E24B4A";
  return (
    <div className="flex gap-6 items-center justify-center">
      <div className="text-center">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#E8E8E8" strokeWidth="10" />
            <circle cx="50" cy="50" r="44" fill="none" stroke={color} strokeWidth="10"
              strokeDasharray={`${r * 2.76} 276`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color }}>{r}%</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Conformité plan</p>
      </div>
      {teamScore != null && (
        <div className="text-center">
          <p className="text-4xl font-bold" style={{ color: SCORE_COLOR(teamScore) }}>{teamScore}</p>
          <p className="text-xs text-muted-foreground">Score équipe</p>
          <Progress value={teamScore} className="h-2 w-24 mt-2" />
        </div>
      )}
    </div>
  );
}

// ─── Widget: Live Comms ───────────────────────────────────────────────────────
function LiveComms({ comms }: { comms: LiveData["communications"] }) {
  const lastComms = [...comms].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);
  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {lastComms.map(c => (
        <div key={c.id} className="flex items-start gap-2 text-xs">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold flex-shrink-0">
            {c.sender.firstName[0]}
          </div>
          <div className="flex-1">
            <span className="font-semibold text-blue-800">{c.sender.firstName} {c.sender.lastName}</span>
            <span className="text-muted-foreground ml-1">
              {new Date(c.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <p className="text-gray-700 mt-0.5 line-clamp-2">{c.content}</p>
          </div>
        </div>
      ))}
      {lastComms.length === 0 && <p className="text-xs text-muted-foreground text-center py-3">Aucune communication</p>}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
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
      intervalRef.current = setInterval(fetchLiveData, 15000); // every 15s
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

  const sentInjects = data.injections.filter(i => i.sentAt);
  const acknowledgedCount = data.injections.filter(i => i.acknowledged).length;

  return (
    <div className={`space-y-4 ${isFullscreen ? "fixed inset-0 bg-background z-50 overflow-auto p-6" : ""}`}>
      {/* Control bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-3 bg-muted/30 rounded-xl border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
            <span className="text-sm font-medium">{isLive ? "Live" : "Pause"}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            Mise à jour: {lastUpdate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={fetchLiveData}>
            <RefreshCw className="h-3 w-3" /> Actualiser
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Select value={viewRole} onValueChange={v => setViewRole(v as ViewRole)}>
            <SelectTrigger className="h-8 text-xs w-[160px]">
              <Eye className="h-3.5 w-3.5 mr-1" /><SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instructor">Vue Instructeur</SelectItem>
              <SelectItem value="participant">Vue Participant</SelectItem>
              <SelectItem value="observer">Vue Observateur</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs"
            onClick={() => setIsConfiguring(!isConfiguring)}>
            <Settings2 className="h-3.5 w-3.5" /> Configurer
          </Button>
          <Button variant="outline" size="sm" className="h-8"
            onClick={() => setIsLive(!isLive)}>
            {isLive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="outline" size="sm" className="h-8"
            onClick={() => setIsFullscreen(!isFullscreen)}>
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Widget configurator */}
      {isConfiguring && (
        <div className="border rounded-xl p-4 bg-muted/20">
          <p className="text-sm font-semibold mb-3">Widgets disponibles pour la vue <strong>{viewRole}</strong></p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(WIDGET_CATALOG).map(([id, cfg]) => {
              if (!cfg.roles.includes(viewRole)) return null;
              const hidden = hiddenWidgets.includes(id);
              return (
                <button key={id} onClick={() => toggleWidget(id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    hidden ? "border-gray-200 text-muted-foreground" : "border-blue-400 bg-blue-50 text-blue-700"
                  }`}>
                  <cfg.icon className="h-3 w-3" />
                  {cfg.label}
                  {hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* KPIs row */}
      {isVisible("conformity_gauge") && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">{sentInjects.length}</p>
              <p className="text-xs text-muted-foreground">Injects envoyés</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{acknowledgedCount}</p>
              <p className="text-xs text-muted-foreground">Injects acquittés</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: SCORE_COLOR(data.conformityRate ?? 0) }}>
                {data.conformityRate ?? "—"}%
              </p>
              <p className="text-xs text-muted-foreground">Conformité plan</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{data.communications.length}</p>
              <p className="text-xs text-muted-foreground">Communications</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Inject timeline */}
        {isVisible("inject_timeline") && (
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                Timeline des injects
                <Badge variant="outline" className="ml-auto text-xs">{sentInjects.length} injects</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-80 overflow-y-auto">
              <InjectTimeline injections={data.injections} activeId={data.activeInjectId} />
            </CardContent>
          </Card>
        )}

        {/* Live comms */}
        {isVisible("live_comms") && (
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                Communications en direct
                <div className="ml-auto flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-green-600">Live</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LiveComms comms={data.communications} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Participant grid */}
      {isVisible("participant_grid") && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-500" />
              Performance participants — temps réel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ParticipantGrid assignments={data.assignments} scores={data.participantScores} />
          </CardContent>
        </Card>
      )}

      {/* Team scores radar */}
      {isVisible("team_scores") && data.participantScores.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Scores équipe — radar collectif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={[
                    { subject: "Tonalité", value: Math.round(data.participantScores.reduce((a,s) => a+s.scoreConformity, 0)/data.participantScores.length) },
                    { subject: "Conformité", value: Math.round(data.participantScores.reduce((a,s) => a+s.scoreConformity, 0)/data.participantScores.length) },
                    { subject: "Décision", value: Math.round(data.participantScores.reduce((a,s) => a+s.scoreDecision, 0)/data.participantScores.length) },
                    { subject: "Communication", value: Math.round(data.participantScores.reduce((a,s) => a+s.scoreCommunication, 0)/data.participantScores.length) },
                    { subject: "Réactivité", value: Math.round(data.participantScores.reduce((a,s) => a+s.scoreTimeliness, 0)/data.participantScores.length) },
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <Radar name="Équipe" dataKey="value" stroke="#0F6E56" fill="#0F6E56" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-shrink-0 text-center">
                <p className="text-5xl font-bold" style={{ color: SCORE_COLOR(data.teamScore ?? 0) }}>
                  {data.teamScore ?? "—"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Score équipe</p>
                <Progress value={data.teamScore ?? 0} className="h-2 w-28 mt-2 mx-auto" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
