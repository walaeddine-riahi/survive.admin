"use client";

import { useState, useTransition, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  ChevronRight, ChevronLeft, Play, Brain, Plus, Trash2,
  Clock, Mail, Phone, MessageSquare, Bell, Zap, FileText,
  Globe, Check, AlertTriangle, Users, Shield, Lock,
  Server, Flame, RefreshCw, Settings2, Pencil, X, GripVertical,
} from "lucide-react";
import {
  createSimulationFromWizard, saveWizardStep, applyTemplate,
  generateAIScenario, createInject, updateInject, deleteInject,
  addParticipantToSimulation, removeParticipantFromSimulation,
  finalizeSimulation,
} from "@/actions/simulation/builder-actions";
import { BUILTIN_TEMPLATES, TEMPLATE_CONFIG, PHASE_CONFIG } from "@/lib/simulation/templates";
import type { SimChannel, InjectPriority, InjectPhase } from "@/lib/simulation/templates";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Inject = any; type User = any; type Assignment = any;

// ─── Constants ────────────────────────────────────────────────────────────────
const CHANNELS: Array<{ key: SimChannel; label: string; icon: React.ElementType; color: string }> = [
  { key: "EMAIL",         label: "Email",       icon: Mail,          color: "#185FA5" },
  { key: "SMS",           label: "SMS",         icon: MessageSquare, color: "#0F6E56" },
  { key: "CALL",          label: "Appel",       icon: Phone,         color: "#A32D2D" },
  { key: "WHATSAPP",      label: "WhatsApp",    icon: MessageSquare, color: "#25D366" },
  { key: "ALERT",         label: "Alerte",      icon: Bell,          color: "#A32D2D" },
  { key: "FLASH_INFO",    label: "Flash Info",  icon: Zap,           color: "#854F0B" },
];

const PRIORITIES: Array<{ key: InjectPriority; label: string; color: string }> = [
  { key: "LOW",      label: "Basse",    color: "#5F5E5A" },
  { key: "NORMAL",   label: "Normale",  color: "#185FA5" },
  { key: "HIGH",     label: "Haute",    color: "#f97316" },
  { key: "CRITICAL", label: "CRITIQUE", color: "#A32D2D" },
];

const PHASES: InjectPhase[] = ["detection","containment","escalation","recovery","comms","legal","debrief"];

const PERSONAS = [
  "Direction Générale", "RSSI", "DSI", "Directeur RH", "Directeur Communication",
  "ANSSI / CERT-FR", "Autorité de Contrôle", "Médias / Presse",
  "Assureur Cyber", "Client Prioritaire", "Fournisseur Critique",
  "Équipe IT", "Cellule de Crise", "Juriste", "Police / Gendarmerie",
];

const ICON_MAP: Record<string, React.ElementType> = {
  Lock, Server, MessageSquare, Shield, Flame, Settings2,
};

// ─── Step indicator ────────────────────────────────────────────────────────────
const STEPS = [
  { n: 1, label: "Cadrage",     icon: Settings2 },
  { n: 2, label: "Scénario",   icon: FileText },
  { n: 3, label: "Équipe",     icon: Users },
  { n: 4, label: "Injects",    icon: Zap },
  { n: 5, label: "Évaluation", icon: Shield },
];

function StepBar({ current, completed }: { current: number; completed: number[] }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((s, i) => {
        const done = completed.includes(s.n);
        const active = current === s.n;
        const Icon = s.icon;
        return (
          <div key={s.n} className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`flex items-center gap-2 flex-shrink-0 ${active ? "" : done ? "opacity-80" : "opacity-40"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                done && !active ? "bg-green-100 text-green-700 border-2 border-green-500" :
                active ? "bg-blue-600 text-white" :
                "bg-gray-100 text-gray-500"
              }`}>
                {done && !active ? <Check className="h-4 w-4" /> : s.n}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${active ? "text-blue-700" : "text-muted-foreground"}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 min-w-[8px] ${done ? "bg-green-400" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Timeline inject card ──────────────────────────────────────────────────────
function InjectCard({ inject, onEdit, onDelete }: {
  inject: Inject; onEdit: (i: Inject) => void; onDelete: (id: string) => void;
}) {
  const chCfg = CHANNELS.find(c => c.key === inject.channel);
  const prCfg = PRIORITIES.find(p => p.key === inject.priority);
  const phCfg = PHASE_CONFIG[inject.phase as InjectPhase];
  const Icon = chCfg?.icon || Mail;

  return (
    <div className={`flex items-start gap-3 p-3 border rounded-xl bg-white hover:shadow-sm transition-shadow ${
      inject.priority === "CRITICAL" ? "border-red-300" : "border-border"
    }`} style={{ borderLeftWidth: 4, borderLeftColor: chCfg?.color || "#888" }}>
      <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
        <GripVertical className="h-4 w-4 text-gray-300 cursor-grab" />
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: chCfg?.color + "20" }}>
          <Icon className="h-4 w-4" style={{ color: chCfg?.color }} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-xs font-mono text-muted-foreground">T+{inject.offsetMin}min</span>
          <span className="text-sm font-semibold">{inject.senderPersona}</span>
          {inject.subject && <span className="text-xs text-muted-foreground truncate">— {inject.subject}</span>}
          <Badge className="text-xs ml-auto" style={{ background: prCfg?.color + "20", color: prCfg?.color }}>
            {prCfg?.label}
          </Badge>
          {phCfg && (
            <Badge className="text-xs" style={{ background: phCfg.bg, color: phCfg.color }}>
              {phCfg.label}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{inject.description || inject.body}</p>
        {inject.expectedActions?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {inject.expectedActions.slice(0, 2).map((a: string, i: number) => (
              <span key={i} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">→ {a.slice(0, 40)}</span>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => onEdit(inject)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400" onClick={() => onDelete(inject.id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Inject form dialog ────────────────────────────────────────────────────────
function InjectFormDialog({ inject, simulationId, onClose, onSaved }: {
  inject?: Inject; simulationId: string; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    channel: (inject?.channel || "EMAIL") as SimChannel,
    priority: (inject?.priority || "NORMAL") as InjectPriority,
    offsetMin: inject?.offsetMin?.toString() || "0",
    senderPersona: inject?.senderPersona || "Direction Générale",
    customPersona: "",
    subject: inject?.subject || "",
    body: inject?.description || inject?.body || "",
    phase: (inject?.phase || "escalation") as InjectPhase,
    expectedActions: (inject?.expectedActions || []).join("\n"),
    targetRoles: (inject?.targetRoles || []).join(", "),
  });
  const [isPending, startTransition] = useTransition();
  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  function handleSave() {
    if (!form.body) { toast.error("Corps du message requis"); return; }
    startTransition(async () => {
      const data = {
        channel: form.channel,
        priority: form.priority,
        offsetMin: parseInt(form.offsetMin) || 0,
        senderPersona: form.senderPersona === "custom" ? form.customPersona : form.senderPersona,
        subject: form.subject || undefined,
        body: form.body,
        phase: form.phase,
        expectedActions: form.expectedActions.split("\n").filter(Boolean),
        targetRoles: form.targetRoles.split(",").map(r => r.trim()).filter(Boolean),
      };
      if (inject?.id) {
        const r = await updateInject(inject.id, data);
        if (r.success) { toast.success("Inject mis à jour"); onSaved(); onClose(); }
        else toast.error(r.error);
      } else {
        const r = await createInject(simulationId, data);
        if (r.success) { toast.success("Inject ajouté"); onSaved(); onClose(); }
        else toast.error(r.error);
      }
    });
  }

  const chCfg = CHANNELS.find(c => c.key === form.channel);

  return (
    <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{inject ? "Modifier l'inject" : "Nouvel inject"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        {/* Channel grid */}
        <div>
          <Label className="text-xs">Canal de communication</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {CHANNELS.map(ch => {
              const Icon = ch.icon;
              return (
                <button key={ch.key}
                  onClick={() => f("channel", ch.key)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm transition-all ${
                    form.channel === ch.key ? "border-2 text-white" : "border-border hover:border-border/80"
                  }`}
                  style={form.channel === ch.key ? { background: ch.color, borderColor: ch.color } : {}}>
                  <Icon className="h-4 w-4 flex-shrink-0" style={form.channel !== ch.key ? { color: ch.color } : {}} />
                  <span className={form.channel !== ch.key ? "text-foreground" : ""}>{ch.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">T+ (minutes)</Label>
            <Input type="number" min="0" className="mt-1 h-8 text-sm"
              value={form.offsetMin} onChange={e => f("offsetMin", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Priorité</Label>
            <Select value={form.priority} onValueChange={v => f("priority", v)}>
              <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRIORITIES.map(p => (
                  <SelectItem key={p.key} value={p.key}>
                    <span style={{ color: p.color }} className="font-semibold">{p.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Expéditeur / Persona</Label>
            <Select value={form.senderPersona} onValueChange={v => f("senderPersona", v)}>
              <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-48">
                {PERSONAS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                <SelectItem value="custom">✏️ Personnalisé...</SelectItem>
              </SelectContent>
            </Select>
            {form.senderPersona === "custom" && (
              <Input className="mt-1 h-8 text-sm" placeholder="Nom de l'expéditeur"
                value={form.customPersona} onChange={e => f("customPersona", e.target.value)} />
            )}
          </div>
          <div>
            <Label className="text-xs">Phase du scénario</Label>
            <Select value={form.phase} onValueChange={v => f("phase", v)}>
              <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PHASES.map(ph => {
                  const cfg = PHASE_CONFIG[ph];
                  return <SelectItem key={ph} value={ph}><span style={{ color: cfg.color }}>{cfg.label}</span></SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {form.channel === "EMAIL" && (
          <div>
            <Label className="text-xs">Objet de l'email</Label>
            <Input className="mt-1 h-8 text-sm" value={form.subject}
              onChange={e => f("subject", e.target.value)} placeholder="Objet..." />
          </div>
        )}

        <div>
          <Label className="text-xs">Corps du message *</Label>
          <Textarea className="mt-1 text-sm" rows={5} value={form.body}
            onChange={e => f("body", e.target.value)}
            placeholder={form.channel === "CALL"
              ? "Script de l'appelant (ce qu'il dit aux participants)..."
              : "Contenu du message (réaliste, immersif)..."} />
        </div>

        <div>
          <Label className="text-xs">Actions attendues (une par ligne)</Label>
          <Textarea className="mt-1 text-xs" rows={3} value={form.expectedActions}
            onChange={e => f("expectedActions", e.target.value)}
            placeholder={"Notifier le RSSI immédiatement\nIsoler les systèmes affectés\nActiver la cellule de crise"} />
        </div>

        <div>
          <Label className="text-xs">Rôles ciblés (séparés par virgule, vide = tous)</Label>
          <Input className="mt-1 h-8 text-sm" value={form.targetRoles}
            onChange={e => f("targetRoles", e.target.value)}
            placeholder="RSSI, DSI, Direction Générale" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Annuler</Button>
        <Button onClick={handleSave} disabled={isPending} style={{ background: chCfg?.color }}>
          {isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
          {inject ? "Mettre à jour" : "Créer l'inject"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ─── Main Builder ─────────────────────────────────────────────────────────────
export default function SimulationBuilder({
  simulationId, initialData, users,
}: {
  simulationId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData: any;
  users: User[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(initialData?.draft?.currentStep || 1);
  const [completed, setCompleted] = useState<number[]>(initialData?.draft?.completedSteps || []);
  const [isPending, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);

  // Step 1 state
  const [s1, setS1] = useState({
    title: initialData?.simulation?.title || "",
    description: initialData?.simulation?.description || "",
    type: initialData?.simulation?.type || "tabletop",
    sector: initialData?.simulation?.sector || "",
    objectives: initialData?.simulation?.objectives || [],
    startDate: initialData?.simulation?.startDate
      ? new Date(initialData.simulation.startDate).toISOString().split("T")[0] : "",
    endDate: initialData?.simulation?.endDate
      ? new Date(initialData.simulation.endDate).toISOString().split("T")[0] : "",
    estimatedDuration: "90",
    newObjective: "",
  });

  // Step 2 state
  const [s2, setS2] = useState({
    scenarioContext: initialData?.simulation?.scenarioContext || "",
    briefingText: initialData?.simulation?.briefingText || "",
    aiPrompt: "",
    selectedTemplateId: initialData?.draft?.templateId || "",
  });

  // Step 3 state
  const [assignments, setAssignments] = useState<Assignment[]>(initialData?.assignments || []);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("Responsable BCM");
  const [customRole, setCustomRole] = useState("");

  // Step 4 state
  const [injects, setInjects] = useState<Inject[]>(initialData?.injects || []);
  const [showInjectForm, setShowInjectForm] = useState(false);
  const [editingInject, setEditingInject] = useState<Inject | null>(null);

  // Step 5 state
  const [criteria, setCriteria] = useState(
    initialData?.criteria?.length > 0
      ? initialData.criteria
      : [
          { name: "Réactivité", weight: 20, category: "timing", description: "Délai de réaction" },
          { name: "Conformité plan", weight: 25, category: "conformity", description: "Respect des procédures" },
          { name: "Qualité décisionnelle", weight: 25, category: "decision", description: "Pertinence des décisions" },
          { name: "Communication", weight: 15, category: "communication", description: "Clarté des communications" },
          { name: "Gestion du stress", weight: 15, category: "tonality", description: "Maîtrise émotionnelle" },
        ]
  );

  const totalWeight = criteria.reduce((s: number, c: { weight: number }) => s + c.weight, 0);

  async function markStepComplete(n: number) {
    if (!completed.includes(n)) {
      const newCompleted = [...completed, n];
      setCompleted(newCompleted);
      await saveWizardStep(simulationId, n, {});
    }
  }

  function goNext() {
    markStepComplete(step);
    setStep(s => Math.min(5, s + 1));
  }
  function goPrev() { setStep(s => Math.max(1, s - 1)); }

  // Apply template
  async function handleApplyTemplate(templateId: string) {
    setIsGenerating(true);
    toast.info("Application du template en cours...");
    const r = await applyTemplate(simulationId, templateId);
    if (r.success) {
      toast.success(`Template appliqué — ${r.injectedCount} injects créés`);
      setS2(prev => ({ ...prev, selectedTemplateId: templateId }));
      // Reload injects
      const { getSimulationInjects } = await import("@/actions/simulation/builder-actions");
      const ir = await getSimulationInjects(simulationId);
      if (ir.success) setInjects(ir.data as Inject[]);
    } else toast.error(r.error);
    setIsGenerating(false);
  }

  // AI scenario generation
  async function handleGenerateScenario() {
    if (!s2.aiPrompt) { toast.error("Décrivez le scénario souhaité"); return; }
    setIsGenerating(true);
    toast.info("Génération du scénario IA en cours...");
    const r = await generateAIScenario({
      simulationId,
      description: s2.aiPrompt,
      duration_min: parseInt(s1.estimatedDuration) || 90,
      participantRoles: assignments.map(a => a.role),
      sector: s1.sector,
      objectives: s1.objectives,
    });
    if (r.success && r.data) {
      setS2(prev => ({ ...prev, scenarioContext: r.data!.scenarioContext, briefingText: r.data!.briefingText }));
      setInjects(r.data.injects as unknown as Inject[]);
      toast.success(`Scénario généré avec ${r.data.injects.length} injects`);
    } else toast.error(r.error);
    setIsGenerating(false);
  }

  // Save scenario
  async function handleSaveScenario() {
    startTransition(async () => {
      await saveWizardStep(simulationId, 2, s2);
      toast.success("Scénario sauvegardé");
      goNext();
    });
  }

  // Add participant
  async function handleAddParticipant() {
    if (!selectedUserId) { toast.error("Sélectionnez un utilisateur"); return; }
    const role = selectedRole === "custom" ? customRole : selectedRole;
    if (!role) { toast.error("Rôle requis"); return; }
    startTransition(async () => {
      const r = await addParticipantToSimulation(simulationId, { userId: selectedUserId, role });
      if (r.success) {
        toast.success("Participant ajouté");
        const user = users.find(u => u.id === selectedUserId);
        setAssignments(prev => [...prev, { id: r.data?.id, userId: selectedUserId, role, user }]);
        setSelectedUserId(""); setCustomRole("");
      } else toast.error(r.error);
    });
  }

  async function handleRemoveParticipant(assignmentId: string) {
    const r = await removeParticipantFromSimulation(assignmentId, simulationId);
    if (r.success) { setAssignments(prev => prev.filter(a => a.id !== assignmentId)); }
  }

  async function handleDeleteInject(id: string) {
    const r = await deleteInject(id, simulationId);
    if (r.success) setInjects(prev => prev.filter(i => i.id !== id));
    else toast.error(r.error);
  }

  async function handleInjectSaved() {
    const { getSimulationInjects } = await import("@/actions/simulation/builder-actions");
    const r = await getSimulationInjects(simulationId);
    if (r.success && r.data) setInjects(r.data as Inject[]);
  }

  // Launch simulation
  async function handleLaunch() {
    if (totalWeight !== 100) { toast.error(`Total des pondérations = ${totalWeight}% (doit être 100%)`); return; }
    startTransition(async () => {
      toast.info("Finalisation en cours...");
      const r = await finalizeSimulation(simulationId);
      if (r.success && r.sessionId) {
        toast.success("Simulation prête ! Redirection vers la salle de contrôle...");
        setTimeout(() => {
          router.push(`/simulation/${simulationId}/live?sessionId=${r.sessionId}&instructor=1`);
        }, 1500);
      } else toast.error(r.error);
    });
  }

  const sortedInjects = [...injects].sort((a, b) => (a.offsetMin || 0) - (b.offsetMin || 0));
  const totalDuration = sortedInjects.length > 0
    ? Math.max(...sortedInjects.map(i => i.offsetMin || 0)) + 10
    : parseInt(s1.estimatedDuration) || 90;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Construire une simulation</h1>
        <p className="text-sm text-muted-foreground">
          {initialData?.simulation?.title || "Nouvelle simulation"} · ISO 22301
        </p>
      </div>

      <StepBar current={step} completed={completed} />

      {/* ──────────────────────────────────────────────── STEP 1 — Cadrage ── */}
      {step === 1 && (
        <div className="space-y-5">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Titre de la simulation *</Label>
                <Input className="mt-1" value={s1.title}
                  onChange={e => setS1(p => ({ ...p, title: e.target.value }))}
                  placeholder="Ex: Exercice Ransomware — Site Paris — Q2 2025" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Type d'exercice</Label>
                  <Select value={s1.type} onValueChange={v => setS1(p => ({ ...p, type: v }))}>
                    <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tabletop">Exercice sur table</SelectItem>
                      <SelectItem value="partial">Simulation partielle</SelectItem>
                      <SelectItem value="full_dr">Test DR complet</SelectItem>
                      <SelectItem value="cyber">Simulation cyber</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Durée estimée (minutes)</Label>
                  <Input type="number" min="30" max="480" className="mt-1 h-8 text-sm"
                    value={s1.estimatedDuration}
                    onChange={e => setS1(p => ({ ...p, estimatedDuration: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Date de début</Label>
                  <Input type="date" className="mt-1 h-8 text-sm" value={s1.startDate}
                    onChange={e => setS1(p => ({ ...p, startDate: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Date de fin</Label>
                  <Input type="date" className="mt-1 h-8 text-sm" value={s1.endDate}
                    onChange={e => setS1(p => ({ ...p, endDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Secteur d'activité</Label>
                <Input className="mt-1 h-8 text-sm" value={s1.sector}
                  onChange={e => setS1(p => ({ ...p, sector: e.target.value }))}
                  placeholder="Ex: Industrie manufacturière, Finance, Santé..." />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Objectifs pédagogiques</CardTitle>
              <CardDescription className="text-xs">Que voulez-vous tester avec cet exercice ?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {s1.objectives.map((obj: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="flex-1 text-sm">{obj}</span>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                    onClick={() => setS1(p => ({ ...p, objectives: p.objectives.filter((_: string, j: number) => j !== i) }))}>
                    <X className="h-3.5 w-3.5 text-red-400" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input className="h-8 text-sm flex-1" value={s1.newObjective}
                  onChange={e => setS1(p => ({ ...p, newObjective: e.target.value }))}
                  placeholder="Ajouter un objectif..."
                  onKeyDown={e => {
                    if (e.key === "Enter" && s1.newObjective.trim()) {
                      setS1(p => ({ ...p, objectives: [...p.objectives, p.newObjective], newObjective: "" }));
                    }
                  }} />
                <Button size="sm" variant="outline" className="h-8 gap-1"
                  onClick={() => {
                    if (s1.newObjective.trim()) {
                      setS1(p => ({ ...p, objectives: [...p.objectives, p.newObjective], newObjective: "" }));
                    }
                  }}>
                  <Plus className="h-4 w-4" /> Ajouter
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={goNext} disabled={!s1.title || !s1.startDate} className="gap-2">
              Suivant : Scénario <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────── STEP 2 — Scénario ── */}
      {step === 2 && (
        <div className="space-y-5">
          {/* Template picker */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Partir d'un template</CardTitle>
              <CardDescription className="text-xs">5 scénarios pré-construits avec injects complets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {BUILTIN_TEMPLATES.map(t => {
                  const Icon = ICON_MAP[t.icon] || Settings2;
                  const isSelected = s2.selectedTemplateId === t.id;
                  return (
                    <button key={t.id}
                      onClick={() => handleApplyTemplate(t.id)}
                      disabled={isGenerating}
                      className={`p-3 rounded-xl border text-left transition-all hover:shadow-sm ${
                        isSelected ? "border-2" : "border-border"
                      }`}
                      style={isSelected ? { borderColor: t.color, background: t.bg } : {}}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: t.color + "20" }}>
                          <Icon className="h-4 w-4" style={{ color: t.color }} />
                        </div>
                        <span className="text-xs font-semibold">{t.title}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 ml-auto" style={{ color: t.color }} />}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                      <div className="flex gap-1 mt-2">
                        <span className="text-xs bg-muted/50 px-1.5 py-0.5 rounded">{t.duration_min}min</span>
                        <span className="text-xs bg-muted/50 px-1.5 py-0.5 rounded">{t.injectSequence.length} injects</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* AI generator */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-600" />
                Ou générer un scénario personnalisé par IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea className="text-sm" rows={3} value={s2.aiPrompt}
                onChange={e => setS2(p => ({ ...p, aiPrompt: e.target.value }))}
                placeholder="Décrivez votre scénario : ex. 'Attaque DDoS sur notre site e-commerce pendant les fêtes de fin d'année, 6 participants (RSSI, DSI, Dir. Com, DG, Responsable IT, Responsable Commercial), 75 minutes, secteur retail'" />
              <Button onClick={handleGenerateScenario} disabled={isGenerating || !s2.aiPrompt} className="gap-2 bg-purple-600 hover:bg-purple-700">
                {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                {isGenerating ? "Génération en cours..." : "Générer avec l'IA"}
              </Button>
            </CardContent>
          </Card>

          {/* Manual scenario */}
          {(s2.scenarioContext || s2.briefingText) && (
            <Card className="shadow-sm">
              <CardHeader><CardTitle className="text-base">Contexte et briefing</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Contexte du scénario (narratif de départ)</Label>
                  <Textarea className="mt-1 text-sm" rows={5} value={s2.scenarioContext}
                    onChange={e => setS2(p => ({ ...p, scenarioContext: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Texte de briefing (lu aux participants)</Label>
                  <Textarea className="mt-1 text-sm" rows={4} value={s2.briefingText}
                    onChange={e => setS2(p => ({ ...p, briefingText: e.target.value }))} />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={goPrev} className="gap-2">
              <ChevronLeft className="h-4 w-4" /> Précédent
            </Button>
            <Button onClick={handleSaveScenario} disabled={isPending} className="gap-2">
              {isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
              Suivant : Équipe <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────── STEP 3 — Équipe ── */}
      {step === 3 && (
        <div className="space-y-5">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Participants & rôles</CardTitle>
              <CardDescription className="text-xs">
                {assignments.length} participant(s) — les téléphones peuvent être ajoutés dans la session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing assignments */}
              {assignments.length > 0 && (
                <div className="space-y-2 mb-4">
                  {assignments.map((a: Assignment) => (
                    <div key={a.id} className="flex items-center gap-3 p-2.5 border rounded-xl">
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
                        {a.user?.firstName?.[0]}{a.user?.lastName?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{a.user?.firstName} {a.user?.lastName}</p>
                        <p className="text-xs text-muted-foreground">{a.user?.email}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{a.role}</Badge>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400"
                        onClick={() => handleRemoveParticipant(a.id)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add participant */}
              <div className="border-2 border-dashed rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground">Ajouter un participant</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Utilisateur</Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                      <SelectContent className="max-h-48">
                        {users
                          .filter(u => !assignments.some((a: Assignment) => a.userId === u.id))
                          .map(u => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.firstName} {u.lastName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Rôle dans la simulation</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[
                          "Responsable BCM", "RSSI", "DSI", "Direction Générale",
                          "Directeur RH", "Directeur Communication", "Responsable IT",
                          "Responsable Juridique", "DPO", "Responsable Supply Chain",
                          "Observateur",
                        ].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        <SelectItem value="custom">✏️ Personnalisé...</SelectItem>
                      </SelectContent>
                    </Select>
                    {selectedRole === "custom" && (
                      <Input className="mt-1 h-8 text-sm" placeholder="Nom du rôle..."
                        value={customRole} onChange={e => setCustomRole(e.target.value)} />
                    )}
                  </div>
                </div>
                <Button size="sm" onClick={handleAddParticipant} disabled={isPending || !selectedUserId} className="gap-2">
                  <Plus className="h-4 w-4" /> Ajouter
                </Button>
              </div>

              {/* Roles from template */}
              {s2.selectedTemplateId && (
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-blue-800 mb-2">Rôles suggérés par le template :</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(BUILTIN_TEMPLATES.find(t => t.id === s2.selectedTemplateId)?.roles || []).map(r => (
                      <Badge key={r.role} variant="outline" className="text-xs"
                        style={r.isRequired ? { borderColor: "#185FA5", color: "#185FA5" } : {}}>
                        {r.role}{r.isRequired ? " *" : ""}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-blue-600 mt-1">* = rôle essentiel pour ce scénario</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={goPrev} className="gap-2">
              <ChevronLeft className="h-4 w-4" /> Précédent
            </Button>
            <Button onClick={goNext} className="gap-2">
              Suivant : Injects <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────── STEP 4 — Injects ── */}
      {step === 4 && (
        <div className="space-y-5">
          {/* Timeline header */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Timeline des injects</CardTitle>
                  <CardDescription className="text-xs">
                    {sortedInjects.length} inject(s) · Durée totale ~{totalDuration} minutes
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => { setEditingInject(null); setShowInjectForm(true); }} className="gap-2">
                  <Plus className="h-4 w-4" /> Nouvel inject
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Mini timeline ruler */}
              {sortedInjects.length > 0 && (
                <div className="mb-4">
                  <div className="relative h-8 bg-muted/30 rounded-lg overflow-hidden">
                    {sortedInjects.map((inj, i) => {
                      const left = Math.min(96, ((inj.offsetMin || 0) / totalDuration) * 100);
                      const chCfg = CHANNELS.find(c => c.key === inj.channel);
                      return (
                        <div key={inj.id}
                          className="absolute top-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs text-white font-bold cursor-pointer hover:scale-110 transition-transform"
                          style={{ left: `${left}%`, background: chCfg?.color || "#888", transform: "translateX(-50%)" }}
                          title={`T+${inj.offsetMin}min — ${inj.senderPersona}`}>
                          {i + 1}
                        </div>
                      );
                    })}
                    {/* Time markers */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
                      <span className="text-xs text-muted-foreground">T+0</span>
                      <span className="text-xs text-muted-foreground">T+{Math.round(totalDuration / 2)}min</span>
                      <span className="text-xs text-muted-foreground">T+{totalDuration}min</span>
                    </div>
                  </div>
                  {/* Phase legend */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(PHASE_CONFIG).map(([phase, cfg]) => {
                      const count = sortedInjects.filter(i => i.phase === phase).length;
                      if (!count) return null;
                      return (
                        <span key={phase} className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: cfg.bg, color: cfg.color }}>
                          {cfg.label} ({count})
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Inject list */}
              {sortedInjects.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-xl text-muted-foreground">
                  <Zap className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>Aucun inject défini</p>
                  <p className="text-sm mt-1">Choisissez un template à l'étape 2 ou créez vos injects manuellement</p>
                  <Button size="sm" className="mt-3 gap-2"
                    onClick={() => { setEditingInject(null); setShowInjectForm(true); }}>
                    <Plus className="h-4 w-4" /> Créer un inject
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedInjects.map(inj => (
                    <InjectCard key={inj.id} inject={inj}
                      onEdit={i => { setEditingInject(i); setShowInjectForm(true); }}
                      onDelete={handleDeleteInject} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={goPrev} className="gap-2">
              <ChevronLeft className="h-4 w-4" /> Précédent
            </Button>
            <Button onClick={goNext} className="gap-2">
              Suivant : Évaluation <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────── STEP 5 — Évaluation ── */}
      {step === 5 && (
        <div className="space-y-5">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Grille d'évaluation</CardTitle>
              <CardDescription className="text-xs">
                Total des pondérations : <strong className={totalWeight === 100 ? "text-green-600" : "text-red-600"}>{totalWeight}%</strong> (doit être 100%)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {criteria.map((c: { name: string; weight: number; category: string; description: string }, i: number) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <Input className="h-8 text-sm" value={c.name}
                      onChange={e => {
                        const nc = [...criteria];
                        nc[i] = { ...nc[i], name: e.target.value };
                        setCriteria(nc);
                      }} />
                  </div>
                  <div className="col-span-3">
                    <Input className="h-8 text-sm" value={c.description}
                      onChange={e => {
                        const nc = [...criteria];
                        nc[i] = { ...nc[i], description: e.target.value };
                        setCriteria(nc);
                      }} placeholder="Description..." />
                  </div>
                  <div className="col-span-3 flex items-center gap-1">
                    <Input type="number" min="0" max="100" className="h-8 text-sm w-16"
                      value={c.weight}
                      onChange={e => {
                        const nc = [...criteria];
                        nc[i] = { ...nc[i], weight: parseInt(e.target.value) || 0 };
                        setCriteria(nc);
                      }} />
                    <span className="text-sm text-muted-foreground">%</span>
                    <div className="flex-1">
                      <Progress value={c.weight} className="h-1.5" />
                    </div>
                  </div>
                  <div className="col-span-1 text-right">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400"
                      onClick={() => setCriteria((prev: typeof criteria) => prev.filter((_: unknown, j: number) => j !== i))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button size="sm" variant="outline" className="gap-1 mt-2"
                onClick={() => setCriteria((prev: typeof criteria) => [...prev, { name: "Nouveau critère", weight: 0, category: "decision", description: "" }])}>
                <Plus className="h-3.5 w-3.5" /> Ajouter un critère
              </Button>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="shadow-sm bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <p className="font-semibold text-blue-900 mb-3">Récapitulatif de la simulation</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {[
                  { label: "Titre", value: s1.title || initialData?.simulation?.title },
                  { label: "Type", value: s1.type },
                  { label: "Durée", value: `${s1.estimatedDuration} min` },
                  { label: "Participants", value: `${assignments.length} personnes` },
                  { label: "Injects", value: `${sortedInjects.length} injects` },
                  { label: "Template", value: s2.selectedTemplateId
                    ? BUILTIN_TEMPLATES.find(t => t.id === s2.selectedTemplateId)?.title || "Personnalisé"
                    : "Personnalisé" },
                  { label: "Scénario", value: s2.scenarioContext ? "✅ Défini" : "⚠️ Non défini" },
                  { label: "Date", value: s1.startDate },
                ].map(row => (
                  <div key={row.label}>
                    <p className="text-blue-600 text-xs">{row.label}</p>
                    <p className="font-medium text-blue-900 text-sm truncate">{row.value || "—"}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={goPrev} className="gap-2">
              <ChevronLeft className="h-4 w-4" /> Précédent
            </Button>
            <Button
              onClick={handleLaunch}
              disabled={isPending || totalWeight !== 100 || sortedInjects.length === 0 || assignments.length === 0}
              size="lg" className="gap-2 bg-green-700 hover:bg-green-800">
              {isPending ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
              {isPending ? "Lancement..." : "Lancer la simulation"}
            </Button>
          </div>

          {(sortedInjects.length === 0 || assignments.length === 0 || totalWeight !== 100) && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <ul className="space-y-0.5">
                {sortedInjects.length === 0 && <li>Aucun inject défini (étape 4)</li>}
                {assignments.length === 0 && <li>Aucun participant ajouté (étape 3)</li>}
                {totalWeight !== 100 && <li>Pondérations = {totalWeight}% (doit être 100%)</li>}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Inject form dialog */}
      {showInjectForm && (
        <Dialog open onOpenChange={() => setShowInjectForm(false)}>
          <InjectFormDialog
            inject={editingInject || undefined}
            simulationId={simulationId}
            onClose={() => { setShowInjectForm(false); setEditingInject(null); }}
            onSaved={handleInjectSaved}
          />
        </Dialog>
      )}
    </div>
  );
}
