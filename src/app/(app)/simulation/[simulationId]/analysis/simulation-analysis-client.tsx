"use client";

import { useState, useTransition, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Brain, Upload, Play, RefreshCw, CheckCircle2, AlertTriangle,
  XCircle, Clock, Users, Shield, MessageSquare, TrendingUp,
  FileText, Star, ChevronRight, Zap, Target, Activity,
} from "lucide-react";
import {
  runFullAnalysis, getSimulationAnalysis,
} from "@/actions/simulation/analysis-actions";
import {
  bridgeSessionToScoring, getSessionMetricsForSimulation,
} from "@/actions/simulation/session-bridge-actions";
import type { ParticipantV2Metrics } from "@/actions/simulation/session-bridge-actions";

import { uploadCrisisPlan } from "@/actions/simulation/crisis-plan-actions";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

type AnalysisData = Awaited<ReturnType<typeof getSimulationAnalysis>>["data"];

// ─── Color helpers ────────────────────────────────────────────────────────────
const SCORE_COLOR = (s: number) => s >= 90 ? "#0F6E56" : s >= 70 ? "#3B6D11" : s >= 50 ? "#854F0B" : s >= 30 ? "#E24B4A" : "#A32D2D";
const SCORE_BG = (s: number) => s >= 90 ? "#E1F5EE" : s >= 70 ? "#EAF3DE" : s >= 50 ? "#FAEEDA" : "#FCEBEB";
const LEVEL_LABEL: Record<string, string> = {
  EXCELLENT: "Excellent", GOOD: "Bien", ACCEPTABLE: "Acceptable",
  INSUFFICIENT: "Insuffisant", CRITICAL: "Critique",
};
const CONFORMITY_CONFIG = {
  CONFORMANT: { label: "Conforme", color: "#0F6E56", bg: "#E1F5EE", icon: CheckCircle2 },
  PARTIAL: { label: "Partiel", color: "#854F0B", bg: "#FAEEDA", icon: AlertTriangle },
  NON_CONFORMANT: { label: "Non conforme", color: "#A32D2D", bg: "#FCEBEB", icon: XCircle },
  NOT_APPLICABLE: { label: "N/A", color: "#888", bg: "#F1EFE8", icon: Shield },
};

// ─── Score Radar ──────────────────────────────────────────────────────────────
function ScoreRadar({ scores, name }: { scores: Record<string, number>; name: string }) {
  const data = [
    { subject: "Tonalité", value: scores.scoreTonality || 0 },
    { subject: "Décision", value: scores.scoreDecision || 0 },
    { subject: "Conformité", value: scores.scoreConformity || 0 },
    { subject: "Communication", value: scores.scoreCommunication || 0 },
    { subject: "Réactivité", value: scores.scoreTimeliness || 0 },
    { subject: "Leadership", value: scores.scoreLeadership || 0 },
  ];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
        <Radar name={name} dataKey="value" stroke="#185FA5" fill="#185FA5" fillOpacity={0.25} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ─── Crisis Plan Upload ───────────────────────────────────────────────────────
function CrisisPlanUpload({ simulationId, existingPlan, onUploaded }: {
  simulationId: string;
  existingPlan: AnalysisData["crisisPlan"] | null;
  onUploaded: () => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    if (!file) return;
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format non supporté. Utilisez PDF, Word ou TXT.");
      return;
    }

    setIsUploading(true);
    toast.info("Extraction du texte en cours...");

    try {
      // Extract text from file
      let rawText = "";
      if (file.type === "text/plain") {
        rawText = await file.text();
      } else {
        // For PDF/Word: use mammoth or basic extraction
        rawText = await file.text().catch(() => `[Contenu extrait de ${file.name}]`);
      }

      // Upload to DB
      await uploadCrisisPlan(simulationId, {
        fileName: file.name,
        fileSize: file.size,
        rawText,
      });

      toast.info("Analyse IA du plan en cours...");

      // Parse with AI
      const response = await fetch("/api/simulation/parse-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulationId, rawText }),
      });
      const result = await response.json();

      if (result.success) {
        toast.success("Plan de crise analysé et indexé avec succès");
        onUploaded();
      } else {
        toast.error("Erreur lors de l'analyse IA du plan");
      }
    } catch (error) {
      toast.error("Erreur lors du traitement du fichier");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-600" />
          Plan de gestion de crise
        </CardTitle>
        <CardDescription>
          Uploadez le plan pour que l'IA compare les décisions de l'équipe aux procédures définies
        </CardDescription>
      </CardHeader>
      <CardContent>
        {existingPlan && existingPlan.status === "READY" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-green-800">{existingPlan.fileName}</p>
                <p className="text-xs text-green-600">Plan analysé et indexé</p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs h-7"
                onClick={() => document.getElementById("plan-upload")?.click()}>
                Remplacer
              </Button>
            </div>
            {existingPlan.aiSummary && (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
                <p className="font-semibold mb-1">Résumé IA :</p>
                <p>{existingPlan.aiSummary}</p>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
              dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => document.getElementById("plan-upload")?.click()}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                <p className="text-sm text-muted-foreground">Analyse IA en cours...</p>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium">Déposez votre plan de crise ici</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, Word (.docx) ou TXT — Max 10 Mo</p>
              </>
            )}
          </div>
        )}
        <input id="plan-upload" type="file" accept=".pdf,.doc,.docx,.txt" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </CardContent>
    </Card>
  );
}

// ─── Inject Response Card ─────────────────────────────────────────────────────
function InjectResponseCard({ response }: { response: NonNullable<AnalysisData>["injectResponses"][0] }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = CONFORMITY_CONFIG[response.conformityStatus as keyof typeof CONFORMITY_CONFIG] || CONFORMITY_CONFIG.NOT_APPLICABLE;
  const CfgIcon = cfg.icon;
  const aiAnalysis = response.aiAnalysis as Record<string, unknown> | null;

  return (
    <div className="border rounded-xl p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
          <CfgIcon className="h-4 w-4" style={{ color: cfg.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-sm">{response.injection?.title}</span>
            <Badge className="text-xs" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</Badge>
            <span className="text-xs text-muted-foreground">{response.injection?.type}</span>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-2">
            <div className="text-center bg-muted/30 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Délai réaction</p>
              <p className="text-lg font-bold" style={{ color: response.reactionDelayMin != null && response.expectedDelayMin != null && response.reactionDelayMin > response.expectedDelayMin ? "#E24B4A" : "#0F6E56" }}>
                {response.reactionDelayMin != null ? `${response.reactionDelayMin}min` : "—"}
              </p>
              {response.expectedDelayMin && (
                <p className="text-xs text-muted-foreground">Cible: {response.expectedDelayMin}min</p>
              )}
            </div>
            <div className="text-center bg-muted/30 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Conformité plan</p>
              <p className="text-lg font-bold" style={{ color: SCORE_COLOR(response.conformityScore || 0) }}>
                {response.conformityScore ?? "—"}
              </p>
            </div>
            <div className="text-center bg-muted/30 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Acteur réel</p>
              <p className="text-xs font-medium mt-1">{response.actualActor || "—"}</p>
              {response.expectedActor && (
                <p className="text-xs text-muted-foreground">Attendu: {response.expectedActor}</p>
              )}
            </div>
          </div>

          {/* Action comparison */}
          {(response.expectedAction || response.actualAction) && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-blue-50 rounded border border-blue-100">
                <p className="font-semibold text-blue-800 mb-1">Action attendue (plan)</p>
                <p className="text-blue-700">{response.expectedAction || "—"}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded border border-gray-200">
                <p className="font-semibold text-gray-700 mb-1">Action réelle</p>
                <p className="text-gray-600">{response.actualAction || "—"}</p>
              </div>
            </div>
          )}

          {/* Gaps */}
          {response.conformityNotes && (
            <div className="mt-2 flex items-start gap-1.5 text-xs text-orange-700">
              <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>{response.conformityNotes}</span>
            </div>
          )}

          {/* Expand for observations */}
          {aiAnalysis && (
            <button
              className="mt-2 text-xs text-blue-600 hover:underline flex items-center gap-1"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Masquer" : "Voir les observations IA"}
              <ChevronRight className={`h-3 w-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
            </button>
          )}
          {expanded && aiAnalysis && (
            <div className="mt-3 space-y-2 text-xs">
              {(aiAnalysis.observations as string[])?.map((obs, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span className="text-muted-foreground">{obs}</span>
                </div>
              ))}
              {(aiAnalysis.improvementPoints as string[])?.length > 0 && (
                <>
                  <p className="font-semibold text-orange-700 mt-2">Points d'amélioration :</p>
                  {(aiAnalysis.improvementPoints as string[]).map((pt, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">→</span>
                      <span className="text-muted-foreground">{pt}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Participant Score Card ────────────────────────────────────────────────────
function ParticipantCard({ score }: { score: NonNullable<AnalysisData>["participantScores"][0] }) {
  const user = score.assignment.user;
  const name = `${user.firstName} ${user.lastName}`;
  const level = LEVEL_LABEL[score.level] || score.level;
  const global = score.scoreGlobal;

  return (
    <Card className="shadow-sm border hover:shadow-md transition-shadow" style={{ borderTopColor: SCORE_COLOR(global), borderTopWidth: 3 }}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: SCORE_COLOR(global) }}>
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div>
                <p className="font-semibold text-sm">{name}</p>
                <p className="text-xs text-muted-foreground">{score.assignment.role}</p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: SCORE_COLOR(global) }}>{global}</p>
            <p className="text-xs font-medium" style={{ color: SCORE_COLOR(global) }}>{level}</p>
            {score.progressDelta != null && (
              <p className={`text-xs font-semibold ${score.progressDelta >= 0 ? "text-green-600" : "text-red-600"}`}>
                {score.progressDelta >= 0 ? "▲" : "▼"} {Math.abs(score.progressDelta)}pts
              </p>
            )}
          </div>
        </div>

        {/* Mini scores */}
        <div className="space-y-1.5">
          {[
            { label: "Conformité plan", value: score.scoreConformity },
            { label: "Décision", value: score.scoreDecision },
            { label: "Communication", value: score.scoreCommunication },
            { label: "Réactivité", value: score.scoreTimeliness },
            { label: "Gestion stress", value: score.scoreTonality },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-28 flex-shrink-0">{item.label}</span>
              <Progress value={item.value} className="h-1.5 flex-1" />
              <span className="text-xs font-semibold w-8 text-right" style={{ color: SCORE_COLOR(item.value) }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Narrative */}
        {score.aiNarrative && (
          <p className="text-xs text-muted-foreground mt-3 italic border-t pt-2">{score.aiNarrative}</p>
        )}

        {/* Strengths / Weaknesses */}
        {score.strengths.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {score.strengths.slice(0, 2).map((s, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#E1F5EE", color: "#0F6E56" }}>
                ✓ {s}
              </span>
            ))}
          </div>
        )}
        {score.weaknesses.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {score.weaknesses.slice(0, 1).map((w, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#FAEEDA", color: "#854F0B" }}>
                → {w}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Debrief Tab ──────────────────────────────────────────────────────────────
function DebriefTab({ debrief, simulationId }: {
  debrief: NonNullable<AnalysisData>["debrief"];
  simulationId: string;
}) {
  const [isGenerating, startTransition] = useTransition();

  if (!debrief) {
    return (
      <div className="text-center py-16">
        <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
        <p className="text-muted-foreground">Aucun debrief généré</p>
        <p className="text-sm text-muted-foreground mt-1">Lancez l'analyse complète pour générer le debrief</p>
      </div>
    );
  }

  const improve = debrief.improvementPlan as Record<string, unknown> | null;
  const planGaps = debrief.planGaps as Array<{ section: string; gap: string; recommendation: string }> | null;

  return (
    <div className="space-y-5">
      {/* Executive Summary */}
      <Card className="shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-4 w-4 text-blue-600" />
            <p className="font-semibold text-blue-900">Synthèse exécutive</p>
            <Badge className="ml-auto" style={{ background: SCORE_BG(debrief.teamScoreGlobal), color: SCORE_COLOR(debrief.teamScoreGlobal) }}>
              {LEVEL_LABEL[debrief.teamLevel]}
            </Badge>
          </div>
          <p className="text-sm text-blue-800">{debrief.executiveSummary}</p>
        </CardContent>
      </Card>

      {/* Team scores grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Score global équipe", value: debrief.teamScoreGlobal },
          { label: "Conformité plan", value: debrief.teamScoreConformity },
          { label: "Communication", value: debrief.teamScoreCommunication },
          { label: "Qualité décisionnelle", value: debrief.teamScoreDecision },
          { label: "Réactivité", value: debrief.teamScoreTimeliness },
          { label: "Gestion du stress", value: debrief.teamScoreTonality },
        ].map(item => (
          <div key={item.label} className="border rounded-xl p-4 text-center" style={{ borderTopColor: SCORE_COLOR(item.value), borderTopWidth: 3 }}>
            <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
            <p className="text-2xl font-bold" style={{ color: SCORE_COLOR(item.value) }}>{item.value}</p>
            <Progress value={item.value} className="h-1.5 mt-2" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Strengths */}
        <div className="space-y-2">
          <p className="font-semibold text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" /> Points forts collectifs
          </p>
          {debrief.teamStrengths.map((s, i) => (
            <div key={i} className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
              <span className="text-green-600 mt-0.5 flex-shrink-0">✓</span>
              <p className="text-xs text-green-800">{s}</p>
            </div>
          ))}
        </div>

        {/* Weaknesses */}
        <div className="space-y-2">
          <p className="font-semibold text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-600" /> Axes d'amélioration collectifs
          </p>
          {debrief.teamWeaknesses.map((w, i) => (
            <div key={i} className="flex items-start gap-2 p-2 bg-orange-50 rounded-lg">
              <span className="text-orange-600 mt-0.5 flex-shrink-0">→</span>
              <p className="text-xs text-orange-800">{w}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Critical gaps */}
      {debrief.criticalGaps.length > 0 && (
        <div className="space-y-2">
          <p className="font-semibold text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" /> Lacunes critiques identifiées
          </p>
          {debrief.criticalGaps.map((g, i) => (
            <div key={i} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="h-3.5 w-3.5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-800">{g}</p>
            </div>
          ))}
        </div>
      )}

      {/* Plan gaps */}
      {planGaps && planGaps.length > 0 && (
        <div>
          <p className="font-semibold text-sm mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-purple-600" /> Lacunes du plan de crise révélées
          </p>
          <div className="space-y-2">
            {planGaps.map((pg, i) => (
              <div key={i} className="border rounded-lg p-3 bg-purple-50 border-purple-100">
                <p className="text-xs font-semibold text-purple-800">{pg.section}</p>
                <p className="text-xs text-purple-700 mt-1">{pg.gap}</p>
                <p className="text-xs text-purple-600 mt-1 italic">→ {pg.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvement plan */}
      {improve && (
        <div className="space-y-4">
          <p className="font-semibold text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" /> Plan d'amélioration IA
          </p>
          {(improve.team as string[])?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Équipe</p>
              <div className="space-y-1">
                {(improve.team as string[]).map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <ChevronRight className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(improve.plan_updates as string[])?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Mises à jour du plan recommandées</p>
              <div className="space-y-1">
                {(improve.plan_updates as string[]).map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs p-2 bg-yellow-50 rounded">
                    <Zap className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(improve.next_simulation_focus as string[])?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Focus prochaine simulation</p>
              <div className="space-y-1">
                {(improve.next_simulation_focus as string[]).map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <Target className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface SimulationData {
  id: string;
  title: string;
  status: string;
  assignments: Array<{ id: string; role: string; user: { id: string; firstName: string; lastName: string } }>;
}

export default function SimulationAnalysisClient({
  simulation,
  analysisData,
  simulationId,
}: {
  simulation: SimulationData;
  analysisData: AnalysisData | null;
  simulationId: string;
}) {
  const [data, setData] = useState(analysisData);
  const [isRunning, startTransition] = useTransition();
  const [v2Metrics, setV2Metrics] = useState<{
    session: { id: string; title: string; startedAt: Date | null; endedAt: Date | null } | null;
    participantMetrics: ParticipantV2Metrics[];
    teamMetrics: { avgReadRate: number; avgReplyRate: number; avgReplyTimeSeconds: number | null; totalCalls: number; answeredCalls: number; missedCriticals: number };
  } | null>(null);
  const [isBridging, setIsBridging] = useState(false);
  
  // Load v2 session metrics on mount
  const loadV2 = async () => {
    const r = await getSessionMetricsForSimulation(simulationId);
    if (r.success && r.data) setV2Metrics(r.data);
  };
  useEffect(() => { loadV2(); }, [simulationId]);

  async function handleBridgeAndAnalyze() {
    setIsBridging(true);
    toast.info("Synchronisation session v2 → scoring...");
    if (v2Metrics?.session?.id) {
      const bridgeResult = await bridgeSessionToScoring(v2Metrics.session.id, simulationId);
      if (!bridgeResult.success) {
        toast.error("Synchronisation échouée: " + bridgeResult.error);
        setIsBridging(false);
        return;
      }
      toast.success(`Synchronisé: ${bridgeResult.data?.syncedInjects} injects, ${bridgeResult.data?.syncedParticipants} participants`);
    }
    setIsBridging(false);
    // Refresh analysis data
    startTransition(async () => {
      toast.info("Analyse IA en cours...");
      const result = await runFullAnalysis(simulationId);
      if (result.success) {
        toast.success(`Analyse complète: ${result.data?.injectsAnalyzed} injects, ${result.data?.participantsScored} participants scorés`);
        const refreshed = await getSimulationAnalysis(simulationId);
        if (refreshed.success) setData(refreshed.data ?? null);
        await loadV2();
      } else toast.error(result.error || "Erreur analyse");
    });
  }

  async function handleRunAnalysis() {
    startTransition(async () => {
      toast.info("Analyse IA en cours — cela peut prendre 1-2 minutes...");
      const result = await runFullAnalysis(simulationId);
      if (result.success) {
        toast.success(`Analyse terminée : ${result.data?.injectsAnalyzed} injects, ${result.data?.participantsScored} participants`);
        const refreshed = await getSimulationAnalysis(simulationId);
        if (refreshed.success) setData(refreshed.data ?? null);
      } else {
        toast.error(result.error || "Erreur lors de l'analyse");
      }
    });
  }

  async function refreshData() {
    const refreshed = await getSimulationAnalysis(simulationId);
    if (refreshed.success) setData(refreshed.data ?? null);
  }

  const teamScoreGlobal = data?.debrief?.teamScoreGlobal ?? null;
  const conformantCount = data?.injectResponses?.filter(r => r.conformityStatus === "CONFORMANT").length ?? 0;
  const totalInjects = data?.injectResponses?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-5 w-5 text-blue-600" />
            <h1 className="text-2xl font-bold">Analyse de simulation</h1>
          </div>
          <p className="text-sm text-muted-foreground">{simulation.title}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
          {v2Metrics?.session && (
            <Button
              onClick={handleBridgeAndAnalyze}
              disabled={isRunning || isBridging}
              className="gap-2 bg-orange-600 hover:bg-orange-700">
              {isBridging || isRunning
                ? <RefreshCw className="h-4 w-4 animate-spin" />
                : <Zap className="h-4 w-4" />}
              {isBridging ? "Synchronisation..." : isRunning ? "Analyse..." : "Analyser session v2"}
            </Button>
          )}
          <Button onClick={handleRunAnalysis} disabled={isRunning || isBridging} variant="outline" className="gap-2">
            {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
            {isRunning ? "Analyse en cours..." : "Analyse v1"}
          </Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Score équipe", value: teamScoreGlobal != null ? `${teamScoreGlobal}/100` : "—", color: teamScoreGlobal != null ? SCORE_COLOR(teamScoreGlobal) : "#888" },
          { label: "Injects analysés", value: totalInjects, color: "#185FA5" },
          { label: "Conformes au plan", value: totalInjects > 0 ? `${conformantCount}/${totalInjects}` : "—", color: "#0F6E56" },
          { label: "Participants évalués", value: data?.participantScores?.length ?? 0, color: "#534AB7" },
        ].map(stat => (
          <Card key={stat.label} className="shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plan upload */}
      <CrisisPlanUpload
        simulationId={simulationId}
        existingPlan={(data as {crisisPlan?: AnalysisData['crisisPlan']})?.crisisPlan ?? null}
        onUploaded={refreshData}
      />

      {/* Main tabs */}
      <Tabs defaultValue="injects">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="injects" className="gap-1.5 text-xs">
            <Zap className="h-3.5 w-3.5" /> Analyse injects ({totalInjects})
          </TabsTrigger>
          <TabsTrigger value="participants" className="gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" /> Participants ({data?.participantScores?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5 text-xs">
            <Shield className="h-3.5 w-3.5" /> Équipe
          </TabsTrigger>
          <TabsTrigger value="debrief" className="gap-1.5 text-xs">
            <Star className="h-3.5 w-3.5" /> Debrief
          </TabsTrigger>
        </TabsList>

        {/* INJECTS TAB */}
        <TabsContent value="injects" className="mt-4 space-y-3">
          {!data?.injectResponses?.length ? (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-xl">
              <Brain className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Aucune analyse d'inject disponible</p>
              <p className="text-sm mt-1">Lancez l'analyse IA pour analyser les réponses aux injects</p>
            </div>
          ) : (
            data.injectResponses.map(r => (
              <InjectResponseCard key={r.id} response={r} />
            ))
          )}
        </TabsContent>

        {/* PARTICIPANTS TAB */}
        <TabsContent value="participants" className="mt-4">
          {!data?.participantScores?.length ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Aucun score participant disponible</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.participantScores.map(s => (
                <ParticipantCard key={s.id} score={s} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* TEAM TAB */}
        <TabsContent value="team" className="mt-4">
          {!data?.debrief ? (
            <div className="text-center py-16 text-muted-foreground">
              <Shield className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Analyse équipe non disponible</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Radar performance équipe</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScoreRadar
                      scores={{
                        scoreTonality: data.debrief.teamScoreTonality,
                        scoreDecision: data.debrief.teamScoreDecision,
                        scoreConformity: data.debrief.teamScoreConformity,
                        scoreCommunication: data.debrief.teamScoreCommunication,
                        scoreTimeliness: data.debrief.teamScoreTimeliness,
                        scoreLeadership: Math.round((data.debrief.teamScoreDecision + data.debrief.teamScoreCommunication) / 2),
                      }}
                      name="Équipe"
                    />
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Métriques clés</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Injects dans les délais</span>
                      <span className="font-bold">{data.debrief.injectsHandledOnTime}/{data.debrief.totalInjects}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Délai moyen de réaction</span>
                      <span className="font-bold">{data.debrief.avgReactionDelayMin ?? "—"} min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Injects conformes</span>
                      <span className="font-bold text-green-600">{data.debrief.conformantInjects}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Injects non conformes</span>
                      <span className="font-bold text-red-600">{data.debrief.nonConformantInjects}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Conformité plan globale</span>
                      <span className="font-bold" style={{ color: SCORE_COLOR(data.debrief.planConformityScore || 0) }}>
                        {data.debrief.planConformityScore ?? "—"}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        {/* DEBRIEF TAB */}
        <TabsContent value="debrief" className="mt-4">
          <DebriefTab debrief={data?.debrief ?? null} simulationId={simulationId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
