"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  ClipboardCheck, ChevronRight, ChevronLeft,
  CheckCircle2, AlertTriangle, Sparkles, Send,
} from "lucide-react";
import {
  submitFormResponse, getParticipantResponse,
} from "@/actions/simulation/form-actions";
import {
  groupQuestions,
  type QuestionDef, type FormAnswers,
} from "@/lib/simulation/form-templates";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Form = any;

// ─── Scale question ───────────────────────────────────────────────────────────
function ScaleQuestion({ q, value, onChange }: {
  q: QuestionDef; value?: number; onChange: (v: number) => void;
}) {
  const range = Array.from({ length: (q.max || 5) - (q.min || 1) + 1 }, (_, i) => (q.min || 1) + i);
  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {range.map(n => (
          <button key={n}
            onClick={() => onChange(n)}
            className={`w-11 h-11 rounded-xl text-sm font-semibold border-2 transition-all ${
              value === n
                ? "text-white border-blue-600 bg-blue-600 scale-105"
                : "border-border hover:border-blue-300 bg-background"
            }`}>
            {n}
          </button>
        ))}
      </div>
      {(q.minLabel || q.maxLabel) && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{q.minLabel}</span>
          <span>{q.maxLabel}</span>
        </div>
      )}
    </div>
  );
}

// ─── Choices question ─────────────────────────────────────────────────────────
function ChoicesQuestion({ q, value, onChange }: {
  q: QuestionDef;
  value?: string | string[];
  onChange: (v: string | string[]) => void;
}) {
  const isMultiple = q.type === "MULTIPLE_CHOICE";
  const selected: string[] = Array.isArray(value) ? value : value ? [value as string] : [];

  function toggle(opt: string) {
    if (isMultiple) {
      const next = selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt];
      onChange(next);
    } else {
      onChange(opt);
    }
  }

  return (
    <div className="space-y-2">
      {q.options?.map(opt => {
        const isSelected = selected.includes(opt);
        return (
          <button key={opt}
            onClick={() => toggle(opt)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all ${
              isSelected
                ? "bg-blue-50 border-blue-400 text-blue-800 font-medium"
                : "border-border hover:bg-muted/40"
            }`}>
            <div className={`w-5 h-5 rounded-${isMultiple ? "md" : "full"} border-2 flex items-center justify-center flex-shrink-0 ${
              isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"
            }`}>
              {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
            </div>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── Rating grid question ─────────────────────────────────────────────────────
function RatingGridQuestion({ q, value, onChange }: {
  q: QuestionDef;
  value?: Record<string, number>;
  onChange: (v: Record<string, number>) => void;
}) {
  const current = value || {};

  function setRow(row: string, col: number) {
    onChange({ ...current, [row]: col });
  }

  const colCount = q.gridCols?.length || 5;
  const completedRows = Object.keys(current).length;
  const totalRows = q.gridRows?.length || 0;

  return (
    <div className="space-y-3">
      {totalRows > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Progress value={(completedRows / totalRows) * 100} className="h-1.5 flex-1" />
          <span>{completedRows}/{totalRows} évalués</span>
        </div>
      )}

      {/* Header */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left pb-2 pr-4 text-xs font-medium text-muted-foreground w-48">Critère</th>
              {q.gridCols?.map((col, i) => (
                <th key={i} className="text-center pb-2 px-1 text-xs font-medium text-muted-foreground min-w-[60px]">
                  {col.split(" — ")[0]}
                  <span className="block text-xs font-normal opacity-70">{col.split(" — ")[1] || ""}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {q.gridRows?.map(row => (
              <tr key={row} className="border-t">
                <td className="py-2.5 pr-4 text-xs text-foreground leading-tight">{row}</td>
                {q.gridCols?.map((_, i) => {
                  const colVal = i + 1;
                  const isSelected = current[row] === colVal;
                  return (
                    <td key={i} className="text-center py-2 px-1">
                      <button
                        onClick={() => setRow(row, colVal)}
                        className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-semibold transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white scale-110"
                            : "border border-border hover:border-blue-300 hover:bg-blue-50"
                        }`}>
                        {colVal}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Single question renderer ─────────────────────────────────────────────────
function QuestionRenderer({ q, value, onChange }: {
  q: QuestionDef;
  value?: FormAnswers[string];
  onChange: (v: FormAnswers[string]) => void;
}) {
  switch (q.type) {
    case "SCALE":
      return <ScaleQuestion q={q} value={value as number} onChange={onChange as (v: number) => void} />;
    case "SINGLE_CHOICE":
    case "MULTIPLE_CHOICE":
      return <ChoicesQuestion q={q} value={value as string | string[]} onChange={onChange as (v: string | string[]) => void} />;
    case "RATING_GRID":
      return <RatingGridQuestion q={q} value={value as Record<string, number>} onChange={onChange as (v: Record<string, number>) => void} />;
    case "TEXT":
      return (
        <Textarea
          className="text-sm min-h-[80px] resize-none"
          placeholder={q.hint || "Votre réponse..."}
          value={(value as string) || ""}
          onChange={e => onChange(e.target.value)}
        />
      );
    default:
      return null;
  }
}

// ─── Main form component ──────────────────────────────────────────────────────
export default function ExerciseFormView({
  form,
  participant,
  onCompleted,
}: {
  form: Form;
  participant: { id: string; displayName: string; role: string };
  onCompleted?: () => void;
}) {
  const questions: QuestionDef[] = form.questions || [];
  const groups = groupQuestions(questions);
  const groupNames = Array.from(groups.keys());

  const [answers, setAnswers] = useState<FormAnswers>({});
  const [currentGroup, setCurrentGroup] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const startTime = useRef(Date.now());

  // Check if already submitted
  useEffect(() => {
    getParticipantResponse(form.id, participant.id).then(r => {
      if (r.success && r.data) {
        setAlreadySubmitted(true);
        setAnswers(r.data.answers as FormAnswers);
      }
    });
  }, [form.id, participant.id]);

  const currentGroupName = groupNames[currentGroup];
  const currentGroupQuestions = groups.get(currentGroupName) || [];

  // Progress
  const requiredQs = questions.filter(q => q.required);
  const answeredRequired = requiredQs.filter(q => {
    const a = answers[q.id];
    if (a === undefined || a === null || a === "") return false;
    if (Array.isArray(a)) return a.length > 0;
    if (typeof a === "object") return Object.keys(a).length > 0;
    return true;
  });
  const progress = requiredQs.length > 0
    ? Math.round((answeredRequired.length / requiredQs.length) * 100)
    : 100;

  // Current group has unanswered required questions
  const currentGroupRequired = currentGroupQuestions.filter(q => q.required);
  const currentGroupAnswered = currentGroupRequired.filter(q => {
    const a = answers[q.id];
    if (!a && a !== 0) return false;
    if (Array.isArray(a)) return a.length > 0;
    if (typeof a === "object") return Object.keys(a).length > 0;
    return true;
  });
  const canProceed = currentGroupAnswered.length === currentGroupRequired.length;

  function setAnswer(qId: string, value: FormAnswers[string]) {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  }

  async function handleSubmit() {
    if (answeredRequired.length < requiredQs.length) {
      toast.error(`${requiredQs.length - answeredRequired.length} question(s) obligatoire(s) sans réponse`);
      return;
    }

    setIsSubmitting(true);
    const duration = Math.round((Date.now() - startTime.current) / 1000);

    const r = await submitFormResponse({
      formId: form.id,
      sessionId: form.sessionId,
      participantId: participant.id,
      participantName: participant.displayName,
      participantRole: participant.role,
      answers,
      durationSeconds: duration,
    });

    if (r.success) {
      setIsCompleted(true);
      toast.success("Réponses enregistrées — merci !");
      onCompleted?.();
    } else {
      toast.error(r.error || "Erreur envoi");
    }
    setIsSubmitting(false);
  }

  const isPostForm = form.type === "POST_EXERCISE";

  if (isCompleted || alreadySubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-9 w-9 text-green-600" />
        </div>
        <div>
          <p className="text-lg font-semibold">Formulaire complété</p>
          <p className="text-sm text-muted-foreground mt-1">
            {alreadySubmitted && !isCompleted
              ? "Vous avez déjà soumis ce formulaire."
              : "Vos réponses ont été enregistrées avec succès."}
          </p>
        </div>
        {isPostForm && (
          <p className="text-xs text-muted-foreground max-w-xs">
            La synthèse anonymisée sera partagée lors du debrief collectif.
          </p>
        )}
      </div>
    );
  }

  if (!form.isActive) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-3">
        <AlertTriangle className="h-10 w-10 text-amber-500" />
        <p className="font-medium">Ce formulaire est fermé</p>
        <p className="text-sm text-muted-foreground">La période de réponse est terminée.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`px-5 py-4 border-b flex-shrink-0 ${
        isPostForm ? "bg-gradient-to-r from-purple-50 to-blue-50" : "bg-gradient-to-r from-blue-50 to-green-50"
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {isPostForm
            ? <Sparkles className="h-5 w-5 text-purple-600" />
            : <ClipboardCheck className="h-5 w-5 text-blue-600" />}
          <p className="text-base font-semibold">{form.title}</p>
          {form.generatedByAI && (
            <Badge className="text-xs bg-purple-100 text-purple-700 ml-auto">
              <Sparkles className="h-3 w-3 mr-1" /> Questions IA
            </Badge>
          )}
        </div>
        {form.description && (
          <p className="text-xs text-muted-foreground">{form.description}</p>
        )}
        <div className="flex items-center gap-3 mt-3">
          <Progress value={progress} className="flex-1 h-2" />
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {answeredRequired.length}/{requiredQs.length} questions
          </span>
        </div>
      </div>

      {/* Group navigation */}
      <div className="flex gap-1 px-4 py-2 border-b overflow-x-auto flex-shrink-0">
        {groupNames.map((name, i) => {
          const gQs = groups.get(name)?.filter(q => q.required) || [];
          const gAnswered = gQs.filter(q => {
            const a = answers[q.id];
            if (!a && a !== 0) return false;
            if (Array.isArray(a)) return a.length > 0;
            if (typeof a === "object") return Object.keys(a).length > 0;
            return true;
          });
          const isDone = gAnswered.length === gQs.length && gQs.length > 0;
          return (
            <button key={name}
              onClick={() => setCurrentGroup(i)}
              className={`flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all ${
                i === currentGroup
                  ? "bg-blue-600 text-white font-semibold"
                  : isDone
                  ? "bg-green-100 text-green-700"
                  : "text-muted-foreground hover:bg-muted"
              }`}>
              {isDone && <CheckCircle2 className="h-3 w-3" />}
              {name}
            </button>
          );
        })}
      </div>

      {/* Questions */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-8">
        {currentGroupQuestions.map((q, idx) => (
          <div key={q.id} className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-xs font-mono text-muted-foreground mt-0.5 flex-shrink-0 w-5">
                {questions.indexOf(q) + 1}.
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium leading-snug">
                  {q.label}
                  {q.required && <span className="text-red-500 ml-1">*</span>}
                </p>
                {q.hint && <p className="text-xs text-muted-foreground mt-0.5">{q.hint}</p>}
              </div>
            </div>
            <div className="pl-7">
              <QuestionRenderer q={q} value={answers[q.id]} onChange={v => setAnswer(q.id, v)} />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-5 py-4 border-t flex-shrink-0">
        <Button variant="outline" size="sm"
          onClick={() => setCurrentGroup(p => Math.max(0, p - 1))}
          disabled={currentGroup === 0}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
        </Button>

        <span className="text-xs text-muted-foreground">
          Section {currentGroup + 1} / {groupNames.length}
        </span>

        {currentGroup < groupNames.length - 1 ? (
          <Button size="sm" onClick={() => setCurrentGroup(p => p + 1)} disabled={!canProceed}>
            Suivant <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || progress < 100}
            className="gap-1.5 bg-green-600 hover:bg-green-700">
            {isSubmitting ? "Envoi..." : <><Send className="h-4 w-4" /> Soumettre</>}
          </Button>
        )}
      </div>
    </div>
  );
}
