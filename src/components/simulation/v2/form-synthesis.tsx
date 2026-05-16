"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  ClipboardCheck, Download, Users, Sparkles,
  BarChart3, ChevronDown, ChevronRight, CheckCircle2,
  AlertTriangle, TrendingUp,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, Tooltip, Cell,
} from "recharts";
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
  const color = pct >= 80 ? "#0F6E56" : pct >= 60 ? "#185FA5" : pct >= 40 ? "#854F0B" : "#A32D2D";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground flex-1 mr-2">{label}</span>
        {avg !== undefined && (
          <span className="font-bold" style={{ color }}>{avg}/{max}</span>
        )}
      </div>
      <div className="flex gap-0.5 h-5">
        {distribution && Object.entries(distribution).sort((a, b) => Number(a[0]) - Number(b[0])).map(([k, v]) => {
          const total = Object.values(distribution).reduce((s, n) => s + n, 0);
          const w = total > 0 ? (v / total) * 100 : 0;
          const level = Number(k) / max;
          const c = level >= 0.8 ? "#0F6E56" : level >= 0.6 ? "#185FA5" : level >= 0.4 ? "#854F0B" : "#A32D2D";
          return (
            <div key={k} className="rounded-sm" title={`${k}: ${v} réponse(s)`}
              style={{ width: `${w}%`, background: c, minWidth: w > 0 ? "4px" : "0" }} />
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
    <div className="space-y-5">
      {questions.map(q => {
        const a = agg[q.id];
        if (!a) return null;

        return (
          <div key={q.id} className="border rounded-xl p-4">
            <p className="text-sm font-medium mb-3">{q.label}</p>

            {q.type === "SCALE" && a.avg !== undefined && (
              <ScaleResult label="" avg={a.avg} distribution={a.distribution} max={q.max || 5} />
            )}

            {(q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE") && a.distribution && (
              <div className="space-y-2">
                {Object.entries(a.distribution as Record<string, number>)
                  .sort((x, y) => (y[1] as number) - (x[1] as number))
                  .map(([opt, count]) => {
                    const pct = totalResponses > 0 ? Math.round(((count as number) / totalResponses) * 100) : 0;
                    return (
                      <div key={opt} className="flex items-center gap-3">
                        <span className="text-xs flex-1 truncate">{opt}</span>
                        <div className="w-24 bg-muted rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-blue-500"
                            style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-12 text-right">
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
                  <div key={i} className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-2.5 italic">
                    "{t}"
                  </div>
                ))}
                {(a.textResponses as string[]).length > 4 && (
                  <p className="text-xs text-muted-foreground">
                    + {(a.textResponses as string[]).length - 4} autres réponses
                  </p>
                )}
              </div>
            )}

            {q.type === "RATING_GRID" && a.gridAvg && (
              <div className="space-y-2">
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

// ─── Radar chart — auto-eval vs instructor score ───────────────────────────────
function ComparisonRadar({ postAgg, participantScores }: { postAgg: AggResult; participantScores?: Record<string, number> }) {
  // Extract self-assessment from post-05 (rating grid)
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
    <div className="border rounded-xl p-4">
      <p className="text-sm font-semibold mb-1">Auto-évaluation vs Score IA</p>
      <p className="text-xs text-muted-foreground mb-3">
        Comparaison entre la perception des participants et le scoring analytique
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
          <Radar name="Auto-évaluation" dataKey="autoEval" stroke="#185FA5" fill="#185FA5" fillOpacity={0.25} />
          <Radar name="Score IA" dataKey="aiScore" stroke="#0F6E56" fill="#0F6E56" fillOpacity={0.25} />
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 justify-center text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-600" />
          <span>Auto-évaluation (moy. équipe)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-600" />
          <span>Score IA</span>
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
      // Reload details
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
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground px-4">
        <ClipboardCheck className="h-10 w-10 mb-3 opacity-20" />
        <p className="text-sm">Aucun formulaire pour cette session</p>
        <p className="text-xs mt-1">Les formulaires pré/post sont générés automatiquement</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Formulaires pré/post exercice</p>
          <p className="text-xs text-muted-foreground">ISO 22301 §9.1 — Surveillance et mesure</p>
        </div>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5"
          onClick={handleExport} disabled={isExporting}>
          <Download className="h-3.5 w-3.5" />
          {isExporting ? "Export..." : "Exporter synthèse"}
        </Button>
      </div>

      {/* Form cards */}
      {forms.map(form => {
        const isOpen = openFormId === form.id;
        const detail = formDetails[form.id];
        const responseCount = form._count?.responses || 0;
        const agg = detail?.aggregateResults as AggResult | null;
        const questions: QuestionDef[] = detail?.questions || form.questions || [];

        return (
          <div key={form.id} className="border rounded-xl overflow-hidden">
            {/* Form header */}
            <button
              onClick={() => openForm(form.id)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/20">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                form.type === "PRE_EXERCISE" ? "bg-blue-100" : "bg-purple-100"
              }`}>
                {form.type === "PRE_EXERCISE"
                  ? <ClipboardCheck className="h-5 w-5 text-blue-600" />
                  : <Sparkles className="h-5 w-5 text-purple-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{form.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge className="text-xs" variant={form.isActive ? "default" : "outline"}>
                    {form.isActive ? "🟢 Ouvert" : "⚫ Fermé"}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" /> {responseCount} réponse(s)
                  </span>
                  {form.generatedByAI && (
                    <Badge className="text-xs bg-purple-100 text-purple-700">IA</Badge>
                  )}
                </div>
              </div>
              {isOpen ? <ChevronDown className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />}
            </button>

            {/* Form detail */}
            {isOpen && (
              <div className="border-t">
                {responseCount === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    Aucune réponse reçue pour le moment
                  </div>
                ) : (
                  <div className="p-4 space-y-5">
                    {/* Radar if post */}
                    {form.type === "POST_EXERCISE" && agg && (
                      <ComparisonRadar postAgg={agg} />
                    )}

                    {/* Aggregate results by section */}
                    {agg && (() => {
                      const { groupQuestions } = require("@/lib/simulation/form-templates") as typeof import("@/lib/simulation/form-templates");
                      const groups = groupQuestions(questions);
                      return Array.from(groups.entries()).map(([groupName, groupQs]) => (
                        <div key={groupName}>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                            {groupName}
                          </p>
                          <AggregateSection questions={groupQs} agg={agg} totalResponses={responseCount} />
                        </div>
                      ));
                    })()}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      {form.isActive && (
                        <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5"
                          onClick={() => handleClose(form.id)}
                          disabled={isClosing === form.id}>
                          {isClosing === form.id ? "Fermeture..." : "Fermer le formulaire"}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
