"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Zap, Settings2, Lock, Server, MessageSquare, Shield, Flame, RefreshCw, ArrowRight } from "lucide-react";
import { BUILTIN_TEMPLATES } from "@/lib/simulation/templates";
import { createSimulationFromWizard } from "@/actions/simulation/builder-actions";

const ICON_MAP: Record<string, React.ElementType> = {
  Lock, Server, MessageSquare, Shield, Flame, Settings2,
};

export default function SimulationBuilderEntryPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<"choose" | "blank" | "template">("choose");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    type: "tabletop",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
  });

  async function handleCreate(templateId?: string) {
    const title = form.title || (templateId
      ? BUILTIN_TEMPLATES.find(t => t.id === templateId)?.title || "Nouvelle simulation"
      : "Nouvelle simulation");

    startTransition(async () => {
      const r = await createSimulationFromWizard({
        title,
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
        objectives: [],
      });
      if (r.success && r.simulationId) {
        // If template selected, will be applied in builder step 2
        toast.success("Simulation créée — ouverture du wizard...");
        router.push(`/simulation/builder/${r.simulationId}`);
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Nouvelle simulation</h1>
        <p className="text-sm text-muted-foreground">Choisissez comment démarrer</p>
      </div>

      {mode === "choose" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Blank */}
          <Card className="shadow-sm cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-300"
            onClick={() => setMode("blank")}>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold mb-1">Simulation vierge</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Construisez votre scénario de A à Z avec le wizard guidé. Possibilité de générer les injects par IA.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["Scénario personnalisé", "IA génératrice", "Contrôle total"].map(tag => (
                  <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* From template */}
          <Card className="shadow-sm cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-orange-300"
            onClick={() => setMode("template")}>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
              <h2 className="text-lg font-semibold mb-1">Depuis un template</h2>
              <p className="text-sm text-muted-foreground mb-4">
                5 scénarios pré-construits par des experts BCM. Injects complets, rôles et grille d'évaluation inclus.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["Prêt en 2 min", "Personnalisable", "Validé ISO 22301"].map(tag => (
                  <span key={tag} className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {mode === "blank" && (
        <div className="space-y-5 max-w-lg">
          <Card className="shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div>
                <Label>Titre de la simulation *</Label>
                <Input className="mt-1" value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Ex: Exercice Ransomware — Q2 2025" autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Type</Label>
                  <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
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
                  <Label className="text-xs">Date</Label>
                  <Input type="date" className="mt-1 h-8 text-sm" value={form.startDate}
                    onChange={e => setForm(p => ({ ...p, startDate: e.target.value, endDate: e.target.value }))} />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setMode("choose")}>Retour</Button>
            <Button onClick={() => handleCreate()} disabled={isPending || !form.title} className="gap-2">
              {isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Ouvrir le wizard
            </Button>
          </div>
        </div>
      )}

      {mode === "template" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BUILTIN_TEMPLATES.map(t => {
              const Icon = ICON_MAP[t.icon] || Settings2;
              const isSelected = selectedTemplate === t.id;
              return (
                <Card key={t.id}
                  className={`cursor-pointer transition-all shadow-sm hover:shadow-md ${isSelected ? "border-2" : ""}`}
                  style={isSelected ? { borderColor: t.color } : {}}
                  onClick={() => setSelectedTemplate(t.id)}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: t.bg }}>
                        <Icon className="h-5 w-5" style={{ color: t.color }} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{t.title}</p>
                        <div className="flex gap-1.5">
                          <span className="text-xs text-muted-foreground">{t.duration_min}min</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">{t.injectSequence.length} injects</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{t.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {t.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs px-1.5 py-0.5 rounded-full"
                          style={{ background: t.bg, color: t.color }}>{tag}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedTemplate && (
            <Card className="shadow-sm bg-muted/30">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-semibold">Nommer la simulation</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Titre (optionnel)</Label>
                    <Input className="mt-1 h-8 text-sm" value={form.title}
                      onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                      placeholder={BUILTIN_TEMPLATES.find(t => t.id === selectedTemplate)?.title} />
                  </div>
                  <div>
                    <Label className="text-xs">Date</Label>
                    <Input type="date" className="mt-1 h-8 text-sm" value={form.startDate}
                      onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setMode("choose")}>Retour</Button>
            <Button
              onClick={() => handleCreate(selectedTemplate || undefined)}
              disabled={isPending || !selectedTemplate}
              className="gap-2 bg-orange-600 hover:bg-orange-700">
              {isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Démarrer avec ce template
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
