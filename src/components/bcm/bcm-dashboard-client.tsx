"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ShieldAlert, TrendingUp, AlertTriangle, CheckCircle2,
  Target, Activity, BarChart3, Zap, ArrowUpRight, ArrowDownRight,
  Clock, AlertCircle, XCircle, Info,
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell, PieChart, Pie,
} from "recharts";

interface BcmData {
  summary: {
    maturityScore: number;
    complianceScore: number;
    avgGapClosure: number;
    criticalRisks: number;
    highRisks: number;
    openGaps: number;
    resolvedGaps: number;
    totalGaps: number;
    totalProcesses: number;
    criticalProcesses: number;
    processesWithGaps: number;
    totalStrategies: number;
    implementedStrategies: number;
    totalRisks: number;
    avgRiskScore: number;
  };
  gapsBySeverity: Record<string, number>;
  gapsByType: Record<string, number>;
  strategiesByCategory: Record<string, number>;
  processHeatmap: Array<{
    id: string;
    name: string;
    department: string;
    criticality: string;
    rto: number;
    rpo: number;
    openGaps: number;
    maxRiskScore: number;
    riskLevel: string;
    riskColor: string;
    gapClosure: number;
  }>;
}

const GAP_TYPE_LABELS: Record<string, string> = {
  RTO_BREACH: "RTO hors seuil",
  RPO_BREACH: "RPO hors seuil",
  MTPD_BREACH: "MTPD hors seuil",
  MBCO_BREACH: "MBCO insuffisant",
  RH_COMPETENCES: "RH & Compétences",
  EQUIPEMENTS: "Équipements",
  INFRASTRUCTURE: "Infrastructure",
  APPLICATIONS_IT: "Applications IT",
  DOCUMENTATION: "Documentation",
  SUPPLY_CHAIN: "Supply Chain",
};

const STRATEGY_CATEGORY_LABELS: Record<string, string> = {
  RH_COMPETENCES: "RH & Compétences",
  EQUIPEMENTS: "Équipements",
  INFRASTRUCTURE: "Infrastructure",
  APPLICATIONS_IT: "Applications IT",
  DOCUMENTATION: "Documentation",
  SUPPLY_CHAIN: "Supply Chain",
};

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "#dc2626",
  HIGH: "#ea580c",
  MEDIUM: "#d97706",
  LOW: "#16a34a",
};

const RISK_COLORS: Record<string, string> = {
  CRITICAL: "#dc2626",
  HIGH: "#ea580c",
  MEDIUM: "#d97706",
  LOW: "#16a34a",
  VERY_LOW: "#6b7280",
};

function getMaturityLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Avancé", color: "text-green-600" };
  if (score >= 60) return { label: "Établi", color: "text-blue-600" };
  if (score >= 40) return { label: "En développement", color: "text-yellow-600" };
  if (score >= 20) return { label: "Initial", color: "text-orange-600" };
  return { label: "Inexistant", color: "text-red-600" };
}

function MaturityGauge({ score }: { score: number }) {
  const { label, color } = getMaturityLabel(score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const strokeColor = score >= 80 ? "#16a34a" : score >= 60 ? "#2563eb" : score >= 40 ? "#d97706" : score >= 20 ? "#ea580c" : "#dc2626";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="12" />
          <circle
            cx="60" cy="60" r="54" fill="none"
            stroke={strokeColor} strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <div className="text-center">
        <p className={`font-semibold text-sm ${color}`}>{label}</p>
        <p className="text-xs text-muted-foreground">Maturité BCM</p>
      </div>
    </div>
  );
}

function RiskMatrixMini({ data }: { data: BcmData["processHeatmap"] }) {
  const matrix: Record<string, Record<string, string[]>> = {};
  const likelihoods = [5, 4, 3, 2, 1];
  const severities = [1, 2, 3, 4, 5];

  data.forEach((p) => {
    const l = Math.ceil(p.maxRiskScore / 5) || 1;
    const s = p.maxRiskScore > 0 ? Math.min(5, p.maxRiskScore - (l - 1) * 5 + 1) : 1;
    const key = `${l}-${s}`;
    if (!matrix[key]) matrix[key] = {};
    if (!matrix[key][key]) matrix[key][key] = [];
    matrix[key][key].push(p.name);
  });

  function cellColor(l: number, s: number) {
    const score = l * s;
    if (score >= 20) return "bg-red-500";
    if (score >= 12) return "bg-orange-400";
    if (score >= 6) return "bg-yellow-400";
    if (score >= 3) return "bg-green-400";
    return "bg-gray-200";
  }

  return (
    <div className="overflow-auto">
      <div className="min-w-[280px]">
        <div className="text-xs text-muted-foreground text-center mb-1">← Vraisemblance →</div>
        <div className="grid" style={{ gridTemplateColumns: "auto repeat(5, 1fr)", gap: "2px" }}>
          <div />
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="text-center text-xs font-medium text-muted-foreground py-1">{s}</div>
          ))}
          {likelihoods.map((l) => (
            <div key={`row-${l}`} className="contents">
              <div className="text-xs font-medium text-muted-foreground flex items-center pr-1">{l}</div>
              {severities.map((s) => {
                const processesInCell = data.filter((p) => {
                  const score = p.maxRiskScore;
                  return score === l * s;
                });
                return (
                  <div
                    key={`${l}-${s}`}
                    title={processesInCell.map((p) => p.name).join(", ")}
                    className={`${cellColor(l, s)} rounded h-9 flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {processesInCell.length > 0 && processesInCell.length}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground text-center mt-1">Gravité ↑</div>
      </div>
    </div>
  );
}

export default function BcmDashboardClient({ data }: { data: BcmData }) {
  const { summary, gapsBySeverity = {}, gapsByType = {}, strategiesByCategory = {}, processHeatmap = [] } = data;

  const radarData = [
    { subject: "Conformité RTO/RPO", value: summary.complianceScore },
    { subject: "Réduction des écarts", value: summary.avgGapClosure },
    { subject: "Stratégies actives", value: summary.totalStrategies > 0 ? Math.round((summary.implementedStrategies / summary.totalStrategies) * 100) : 0 },
    { subject: "Maîtrise des risques", value: summary.totalRisks > 0 ? Math.round(((summary.totalRisks - summary.criticalRisks) / summary.totalRisks) * 100) : 100 },
    { subject: "Couverture processus", value: summary.totalProcesses > 0 ? Math.round(((summary.totalProcesses - summary.processesWithGaps) / summary.totalProcesses) * 100) : 100 },
  ];

  const gapChartData = Object.entries(gapsBySeverity).map(([sev, count]) => ({
    name: sev === "CRITICAL" ? "Critique" : sev === "HIGH" ? "Élevé" : sev === "MEDIUM" ? "Moyen" : "Faible",
    count,
    color: SEVERITY_COLORS[sev] || "#6b7280",
  }));

  const gapTypeData = Object.entries(gapsByType)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 6)
    .map(([type, count]) => ({
      name: GAP_TYPE_LABELS[type] || type,
      count,
    }));

  const strategyData = Object.entries(strategiesByCategory).map(([cat, count]) => ({
    name: STRATEGY_CATEGORY_LABELS[cat] || cat,
    count,
  }));

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard BCM</h1>
          <p className="text-muted-foreground text-sm">Business Continuity Management — ISO 22301</p>
        </div>
        <Badge variant="outline" className="gap-1 text-blue-700 border-blue-300 bg-blue-50">
          <Activity className="h-3 w-3" />
          Temps réel
        </Badge>
      </div>

      {/* ── KPI ROW ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Écarts ouverts",
            value: summary.openGaps,
            sub: `${summary.totalGaps} total`,
            icon: AlertTriangle,
            color: summary.openGaps > 5 ? "text-red-600" : summary.openGaps > 2 ? "text-orange-500" : "text-green-600",
            bg: "bg-red-50",
          },
          {
            label: "Risques critiques",
            value: summary.criticalRisks + summary.highRisks,
            sub: `${summary.totalRisks} évalués`,
            icon: ShieldAlert,
            color: summary.criticalRisks > 0 ? "text-red-600" : "text-orange-500",
            bg: "bg-orange-50",
          },
          {
            label: "Gap closure moyen",
            value: `${summary.avgGapClosure}%`,
            sub: `${summary.implementedStrategies}/${summary.totalStrategies} stratégies impl.`,
            icon: TrendingUp,
            color: summary.avgGapClosure >= 70 ? "text-green-600" : summary.avgGapClosure >= 40 ? "text-yellow-600" : "text-red-600",
            bg: "bg-green-50",
          },
          {
            label: "Conformité ISO 22301",
            value: `${summary.complianceScore}%`,
            sub: `${summary.totalProcesses} processus`,
            icon: CheckCircle2,
            color: summary.complianceScore >= 80 ? "text-green-600" : summary.complianceScore >= 60 ? "text-yellow-600" : "text-red-600",
            bg: "bg-blue-50",
          },
        ].map((kpi) => (
          <Card key={kpi.label} className={`${kpi.bg} border-0 shadow-sm`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
                </div>
                <kpi.icon className={`h-5 w-5 mt-1 ${kpi.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── MATURITY + RADAR ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Score de Maturité BCM</CardTitle>
            <CardDescription>Composite ISO 22301</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <MaturityGauge score={summary.maturityScore} />
            <div className="w-full space-y-2">
              {[
                { label: "Conformité RTO/RPO", value: summary.complianceScore },
                { label: "Réduction des écarts", value: summary.avgGapClosure },
                { label: "Stratégies impl.", value: summary.totalStrategies > 0 ? Math.round((summary.implementedStrategies / summary.totalStrategies) * 100) : 0 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                  <Progress value={item.value} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Radar BCM</CardTitle>
            <CardDescription>Vue multi-dimensionnelle de la résilience</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── GAPS + RISKS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Écarts par sévérité
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gapChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={gapChartData} barSize={32}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {gapChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-40 text-muted-foreground text-sm gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Aucun écart identifié
              </div>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {gapTypeData.slice(0, 4).map((t) => (
                <div key={t.name} className="flex items-center justify-between bg-muted/40 rounded p-2">
                  <span className="text-xs text-muted-foreground truncate">{t.name}</span>
                  <Badge variant="secondary" className="text-xs ml-1">{t.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              Stratégies de continuité
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strategyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={strategyData} layout="vertical" barSize={14}>
                  <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                Aucune stratégie définie
              </div>
            )}
            <div className="mt-3 flex items-center justify-between text-sm bg-blue-50 rounded p-2">
              <span className="text-muted-foreground">Gap closure moyen</span>
              <div className="flex items-center gap-2">
                <Progress value={summary.avgGapClosure} className="w-20 h-2" />
                <span className="font-bold text-blue-700">{summary.avgGapClosure}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── PROCESS HEATMAP ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-500" />
            Heatmap des processus — Risque × Écarts × Gap closure
          </CardTitle>
          <CardDescription>Top processus par niveau de risque résiduel</CardDescription>
        </CardHeader>
        <CardContent>
          {processHeatmap.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
              Aucun processus analysé
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Processus</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Dept.</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Criticité</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">RTO</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Risque</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Écarts ouverts</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Gap closure</th>
                  </tr>
                </thead>
                <tbody>
                  {processHeatmap.slice(0, 10).map((p) => (
                    <tr key={p.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-2 px-3 font-medium text-xs">{p.name}</td>
                      <td className="py-2 px-3 text-xs text-muted-foreground">{p.department}</td>
                      <td className="py-2 px-3 text-center">
                        <Badge
                          className="text-xs"
                          style={{
                            backgroundColor:
                              p.criticality === "critical" ? "#fee2e2" :
                              p.criticality === "high" ? "#ffedd5" :
                              p.criticality === "medium" ? "#fef9c3" : "#f0fdf4",
                            color:
                              p.criticality === "critical" ? "#dc2626" :
                              p.criticality === "high" ? "#ea580c" :
                              p.criticality === "medium" ? "#ca8a04" : "#16a34a",
                          }}
                        >
                          {p.criticality === "critical" ? "Critique" : p.criticality === "high" ? "Élevé" : p.criticality === "medium" ? "Moyen" : "Faible"}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-center text-xs">{p.rto}h</td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className="inline-flex items-center justify-center w-8 h-6 rounded text-xs font-bold text-white"
                          style={{ backgroundColor: p.riskColor }}
                        >
                          {p.maxRiskScore || "–"}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        {p.openGaps > 0 ? (
                          <span className="inline-flex items-center gap-1 text-orange-600 font-medium text-xs">
                            <AlertCircle className="h-3 w-3" />
                            {p.openGaps}
                          </span>
                        ) : (
                          <span className="text-green-600">
                            <CheckCircle2 className="h-3.5 w-3.5 inline" />
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <Progress value={p.gapClosure} className="h-1.5 flex-1" />
                          <span className="text-xs font-medium w-8 text-right">{p.gapClosure}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── RISK MATRIX MINI ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Matrice des risques (continuité)
            </CardTitle>
            <CardDescription>Distribution vraisemblance × gravité</CardDescription>
          </CardHeader>
          <CardContent>
            <RiskMatrixMini data={processHeatmap} />
            <div className="mt-3 flex gap-3 text-xs">
              {[
                { color: "bg-red-500", label: "Critique (≥20)" },
                { color: "bg-orange-400", label: "Élevé (12-19)" },
                { color: "bg-yellow-400", label: "Moyen (6-11)" },
                { color: "bg-green-400", label: "Faible (<6)" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded ${l.color}`} />
                  <span className="text-muted-foreground">{l.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              Synthèse BCM
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                icon: summary.criticalRisks === 0 ? CheckCircle2 : XCircle,
                color: summary.criticalRisks === 0 ? "text-green-600" : "text-red-600",
                bg: summary.criticalRisks === 0 ? "bg-green-50" : "bg-red-50",
                text: summary.criticalRisks === 0
                  ? "Aucun risque critique en attente"
                  : `${summary.criticalRisks} risque(s) critique(s) à traiter en priorité`,
              },
              {
                icon: summary.avgGapClosure >= 60 ? CheckCircle2 : AlertTriangle,
                color: summary.avgGapClosure >= 60 ? "text-green-600" : "text-orange-600",
                bg: summary.avgGapClosure >= 60 ? "bg-green-50" : "bg-orange-50",
                text: summary.avgGapClosure >= 60
                  ? `Bonne progression : ${summary.avgGapClosure}% des écarts couverts par des stratégies`
                  : `Gap closure insuffisant : ${summary.avgGapClosure}% — renforcer les stratégies`,
              },
              {
                icon: summary.complianceScore >= 80 ? CheckCircle2 : AlertCircle,
                color: summary.complianceScore >= 80 ? "text-green-600" : "text-yellow-600",
                bg: summary.complianceScore >= 80 ? "bg-green-50" : "bg-yellow-50",
                text: summary.complianceScore >= 80
                  ? `${summary.complianceScore}% des processus conformes aux seuils ISO 22301`
                  : `${100 - summary.complianceScore}% des processus hors conformité RTO/RPO`,
              },
              {
                icon: summary.openGaps === 0 ? CheckCircle2 : Clock,
                color: summary.openGaps === 0 ? "text-green-600" : "text-blue-600",
                bg: summary.openGaps === 0 ? "bg-green-50" : "bg-blue-50",
                text: summary.openGaps === 0
                  ? "Tous les écarts identifiés sont couverts"
                  : `${summary.openGaps} écart(s) en attente de traitement`,
              },
            ].map((item, i) => (
              <div key={i} className={`flex items-start gap-2 rounded-lg p-3 ${item.bg}`}>
                <item.icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${item.color}`} />
                <p className={`text-xs ${item.color}`}>{item.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
