"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ClipboardCheck, Download, Users, Sparkles,
  ChevronDown, ChevronRight, CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import {
  getSessionForms, getFormWithResponses,
  closeForm, exportFormSynthesis,
} from "@/actions/simulation/form-actions";
import type { QuestionDef } from "@/lib/simulation/form-templates";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Form = any; type AggResult = any;

// ─── Scale result bar ─────────────────────────────────────────────────────────
function ScaleResult({ label, avg, distribution, max = 5 }: {
  label: string; avg?: number; distribution?: Record<string, number>; max?: number;
}) {
  const pct = avg ? (avg / max) * 100 : 0;
  const color = pct >= 80 ? "#10b981" : pct >= 60 ? "#3b82f6" : pct >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400 flex-1 mr-2">{label}</span>
        {avg !== undefined && (
          <span className="font-bold font-mono" style={{ color }}>{avg}/{max}</span>
        )}
      </div>
      <div className="flex gap-1 h-5 bg-slate-950/40 p-0.5 rounded-xl border border-slate-900">
        {distribution && Object.entries(distribution).sort((a, b) => Number(a[0]) - Number(b[0])).map(([k, v]) => {
          const total = Object.values(distribution).reduce((s, n) => s + n, 0);
          const w = total > 0 ? (v / total) * 100 : 0;
          const level = Number(k) / max;
          const c = level >= 0.8 ? "#10b981" : level >= 0.6 ? "#3b82f6" : level >= 0.4 ? "#f59e0b" : "#ef4444";
          return (
            <div key={k} className="rounded-lg transition-transform hover:scale-105" title={`${k}: ${v} réponse(s)`}
              style={{ width: `${w}%`, background: c, minWidth: w > 0 ? "6px" : "0" }} />
          );
        })}
      </div>
    </div>
  );
}

// ─── Section aggregates display ───────────────────────────────────────────────
function AggregateSection({ questions, agg, totalResponses }: {
  questions: QuestionDef[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  agg: Record<string, any>;
  totalResponses: number;
}) {
  return (
    <div className="space-y-4">
      {questions.map(q => {
        const a = agg[q.id];
        if (!a) return null;

        return (
          <div key={q.id} className="bg-[#0e1726]/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4.5">
            <p className="text-xs font-semibold text-gray-300 mb-3">{q.label}</p>

            {q.type === "SCALE" && a.avg !== undefined && (
              <ScaleResult label="" avg={a.avg} distribution={a.distribution} max={q.max || 5} />
            )}

            {(q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE") && a.distribution && (
              <div className="space-y-2.5">
                {Object.entries(a.distribution as Record<string, number>)
                  .sort((x, y) => (y[1] as number) - (x[1] as number))
                  .map(([opt, count]) => {
                    const pct = totalResponses > 0 ? Math.round(((count as number) / totalResponses) * 100) : 0;
                    return (
                      <div key={opt} className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 flex-1 truncate">{opt}</span>
                        <div className="w-24 bg-slate-950/60 rounded-full h-2 border border-slate-900 overflow-hidden flex-shrink-0">
                          <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
                            style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-16 text-right font-mono font-medium">
                          {count as number} ({pct}%)
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}

            {q.type === "TEXT" && a.textResponses?.length > 0 && (
              <div className="space-y-2">
                {(a.textResponses as string[]).slice(0, 4).map((t: string, i: number) => (
                  <div key={i} className="text-xs text-gray-300 bg-slate-950/30 border border-slate-900 rounded-xl p-3 italic">
                    "{t}"
                  </div>
                ))}
                {(a.textResponses as string[]).length > 4 && (
                  <p className="text-[11px] text-gray-500 font-medium pl-1">
                    + {(a.textResponses as string[]).length - 4} autres réponses reçues
                  </p>
                )}
              </div>
            )}

            {q.type === "RATING_GRID" && a.gridAvg && (
              <div className="space-y-3">
                {Object.entries(a.gridAvg as Record<string, number>).map(([row, avg]) => (
                  <ScaleResult key={row} label={row} avg={avg} max={5} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const comparisonConfig = {
  autoEval: {
    label: "Auto-évaluation",
    color: "#3b82f6",
  },
  aiScore: {
    label: "Score IA",
    color: "#10b981",
  },
} satisfies ChartConfig;

// ─── Radar chart — auto-eval vs instructor score ───────────────────────────────
function ComparisonRadar({ postAgg, participantScores }: { postAgg: AggResult; participantScores?: Record<string, number> }) {
  const selfGrid = postAgg?.["post-05"]?.gridAvg as Record<string, number> | undefined;
  if (!selfGrid) return null;

  const dimensions = [
    { key: "Réactivité (vitesse de réaction aux injects)", label: "Réactivité" },
    { key: "Conformité aux procédures (respect du plan)", label: "Conformité" },
    { key: "Qualité des décisions (pertinence et rapidité)", label: "Décisions" },
    { key: "Communication (clarté, ciblage, ton)", label: "Communication" },
    { key: "Leadership / Coordination avec l'équipe", label: "Leadership" },
    { key: "Gestion du stress (maîtrise émotionnelle)", label: "Stress" },
  ];

  const data = dimensions.map(d => ({
    dimension: d.label,
    autoEval: selfGrid[d.key] ? Math.round(selfGrid[d.key] * 20) : 0,    // /5 → /100
    aiScore: participantScores?.[d.key] ?? 0,
  }));

  return (
    <div className="bg-[#0e1726]/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-md">
      <p className="text-sm font-semibold text-gray-200 mb-1">Auto-évaluation de la cellule vs Score IA</p>
      <p className="text-xs text-gray-500 mb-4 leading-relaxed">
        Comparaison radar entre la perception de l'équipe de crise et le scoring analytique automatisé
      </p>
      <ChartContainer config={comparisonConfig} className="mx-auto aspect-square max-h-[300px] w-full">
        <RadarChart data={data}>
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <PolarGrid />
          <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
          <Radar
            name="Auto-évaluation"
            dataKey="autoEval"
            stroke="var(--color-autoEval)"
            fill="var(--color-autoEval)"
            fillOpacity={0.2}
            dot={{ r: 3, fillOpacity: 1 }}
          />
          <Radar
            name="Score IA"
            dataKey="aiScore"
            stroke="var(--color-aiScore)"
            fill="var(--color-aiScore)"
            fillOpacity={0.2}
            dot={{ r: 3, fillOpacity: 1 }}
          />
        </RadarChart>
      </ChartContainer>
      <div className="flex gap-6 justify-center text-xs pt-2">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-lg bg-blue-600 shadow-md shadow-blue-900/30" />
          <span className="text-gray-300 font-semibold">Auto-évaluation (moy. équipe)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-lg bg-emerald-600 shadow-md shadow-emerald-900/30" />
          <span className="text-gray-300 font-semibold">Score Analytique IA</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main instructor synthesis ─────────────────────────────────────────────────
export default function FormSynthesisView({
  sessionId,
}: {
  sessionId: string;
}) {
  const [forms, setForms] = useState<Form[]>([]);
  const [openFormId, setOpenFormId] = useState<string | null>(null);
  const [formDetails, setFormDetails] = useState<Record<string, Form>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [isClosing, setIsClosing] = useState<string | null>(null);

  useEffect(() => {
    getSessionForms(sessionId).then(r => {
      if (r.success && r.data) setForms(r.data as Form[]);
    });
  }, [sessionId]);

  async function openForm(formId: string) {
    if (openFormId === formId) { setOpenFormId(null); return; }
    if (!formDetails[formId]) {
      const r = await getFormWithResponses(formId);
      if (r.success && r.data) {
        setFormDetails(prev => ({ ...prev, [formId]: r.data }));
      }
    }
    setOpenFormId(formId);
  }

  async function handleClose(formId: string) {
    setIsClosing(formId);
    const r = await closeForm(formId);
    if (r.success) {
      toast.success("Formulaire fermé — résultats finalisés");
      getSessionForms(sessionId).then(r => { if (r.success && r.data) setForms(r.data as Form[]); });
      const r2 = await getFormWithResponses(formId);
      if (r2.success && r2.data) setFormDetails(prev => ({ ...prev, [formId]: r2.data }));
    }
    setIsClosing(null);
  }

  async function handleExport() {
    setIsExporting(true);
    const r = await exportFormSynthesis(sessionId);
    if (r.success && r.data) {
      const blob = new Blob([r.data], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `synthese-questionnaires-${sessionId.slice(-6)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Synthèse exportée — ISO 22301 §9.1");
    }
    setIsExporting(false);
  }

  if (forms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-900/10 rounded-2xl border border-slate-850 border-dashed text-gray-500 px-4">
        <ClipboardCheck className="h-10 w-10 mb-3 text-slate-700" />
        <p className="text-gray-400 text-sm font-semibold">Aucun questionnaire généré</p>
        <p className="text-gray-650 text-xs mt-1">Les questionnaires pré/post exercice s'afficheront ici automatiquement.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 flex-shrink-0">
        <div>
          <p className="text-sm font-semibold text-gray-200">Questionnaires Pré/Post Exercice</p>
          <p className="text-xs text-gray-500">ISO 22301 §9.1 — Surveillance, mesure, analyse et évaluation</p>
        </div>
        <Button size="sm" className="h-9 text-xs bg-slate-950 border border-slate-800 hover:border-slate-700 text-white rounded-xl gap-2 shadow-md shadow-black/20 transition-transform active:scale-95"
          onClick={handleExport} disabled={isExporting}>
          <Download className="h-3.5 w-3.5" />
          {isExporting ? "Exportation..." : "Exporter la synthèse"}
        </Button>
      </div>

      {/* Form cards */}
      <div className="space-y-3.5">
        {forms.map(form => {
          const isOpen = openFormId === form.id;
          const detail = formDetails[form.id];
          const responseCount = form._count?.responses || 0;
          const agg = detail?.aggregateResults as AggResult | null;
          const questions: QuestionDef[] = detail?.questions || form.questions || [];

          return (
            <div key={form.id} className="bg-[#0e1726]/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
              
              {/* Form header button */}
              <button
                onClick={() => openForm(form.id)}
                className="w-full flex items-center gap-3.5 p-4.5 text-left hover:bg-slate-900/40 transition-colors">
                <div className={`w-9.5 h-9.5 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  form.type === "PRE_EXERCISE" ? "bg-blue-600/10 border border-blue-500/20 text-blue-400" : "bg-purple-600/10 border border-purple-500/20 text-purple-400"
                }`}>
                  {form.type === "PRE_EXERCISE"
                    ? <ClipboardCheck className="h-5 w-5" />
                    : <Sparkles className="h-5 w-5" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-200">{form.title}</p>
                  <div className="flex items-center gap-2.5 mt-1">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border ${
                      form.isActive ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-pulse" : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}>
                      {form.isActive ? "🟢 Ouvert" : "⚫ Fermé"}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-slate-500" /> {responseCount} réponse(s) reçue(s)
                    </span>
                    {form.generatedByAI && (
                      <span className="text-[10px] font-bold bg-purple-600/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded-lg uppercase tracking-wider">IA</span>
                    )}
                  </div>
                </div>
                {isOpen ? <ChevronDown className="h-4.5 w-4.5 text-gray-500 flex-shrink-0" /> : <ChevronRight className="h-4.5 w-4.5 text-gray-500 flex-shrink-0" />}
              </button>

              {/* Form detail dropdown */}
              {isOpen && (
                <div className="border-t border-slate-800/60 bg-slate-950/20 p-5 space-y-6">
                  {responseCount === 0 ? (
                    <div className="text-center py-10 bg-slate-900/10 rounded-2xl border border-slate-850 border-dashed text-gray-500 text-xs">
                      Aucune réponse reçue pour ce questionnaire pour le moment.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Radar comparison chart if post-exercise */}
                      {form.type === "POST_EXERCISE" && agg && (
                        <ComparisonRadar postAgg={agg} />
                      )}

                      {/* Aggregate sections */}
                      {agg && (() => {
                        const { groupQuestions } = require("@/lib/simulation/form-templates") as typeof import("@/lib/simulation/form-templates");
                        const groups = groupQuestions(questions);
                        return Array.from(groups.entries()).map(([groupName, groupQs]) => (
                          <div key={groupName} className="space-y-3.5">
                            <p className="text-[11px] font-bold text-orange-500 uppercase tracking-widest pl-1">
                              📁 {groupName}
                            </p>
                            <AggregateSection questions={groupQs} agg={agg} totalResponses={responseCount} />
                          </div>
                        ));
                      })()}

                      {/* Actions */}
                      {form.isActive && (
                        <div className="pt-4 border-t border-slate-800/60 flex justify-end">
                          <Button size="sm" className="h-8.5 text-xs bg-slate-900 hover:bg-slate-850 text-white border border-slate-800 hover:border-slate-700 rounded-xl gap-1.5 shadow-sm active:scale-95 transition-transform"
                            onClick={() => handleClose(form.id)}
                            disabled={isClosing === form.id}>
                            {isClosing === form.id ? "Fermeture..." : "Fermer le questionnaire"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
