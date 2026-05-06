"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  FileText, Download, Eye, Settings2, Palette,
  BarChart3, AlertTriangle, Shield, Target, Cpu, RefreshCw,
} from "lucide-react";

const SECTION_OPTIONS = [
  { key: "summary", label: "Synthèse exécutive", icon: BarChart3, description: "KPIs, score maturité, vue globale" },
  { key: "gaps", label: "Analyse des écarts", icon: AlertTriangle, description: "Écarts BIA vs seuils ISO 22301" },
  { key: "strategies", label: "Stratégies de continuité", icon: Target, description: "Solutions par catégorie de ressource" },
  { key: "risks", label: "Appréciation des risques", icon: Shield, description: "Matrice de risques et scores" },
  { key: "processes", label: "Processus critiques", icon: Cpu, description: "RTO/RPO/MTPD par processus" },
];

const COLOR_THEMES = [
  { value: "blue", label: "Bleu professionnel", color: "#185FA5" },
  { value: "green", label: "Vert résilience", color: "#0F6E56" },
  { value: "dark", label: "Gris corporate", color: "#2C2C2A" },
];

interface ReportConfig {
  title: string;
  organization: string;
  factoryId: string;
  sections: string[];
  colorTheme: "blue" | "green" | "dark";
}

export default function ReportBuilderClient({
  factories,
}: {
  factories: { id: string; name: string; code: string }[];
}) {
  const [config, setConfig] = useState<ReportConfig>({
    title: "Rapport BCM — Continuité d'Activité",
    organization: "",
    factoryId: "",
    sections: ["summary", "gaps", "strategies", "risks", "processes"],
    colorTheme: "blue",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function toggleSection(key: string) {
    setConfig((c) => ({
      ...c,
      sections: c.sections.includes(key)
        ? c.sections.filter((s) => s !== key)
        : [...c.sections, key],
    }));
  }

  async function generateReport(format: "preview" | "pdf" | "docx") {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/bcm/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, format }),
      });

      if (!response.ok) throw new Error("Erreur serveur");

      if (format === "preview") {
        const { html } = await response.json();
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        window.open(url, "_blank");
      } else if (format === "pdf") {
        const { html, filename } = await response.json();
        // Open in new window and trigger print dialog for PDF save
        const win = window.open("", "_blank");
        if (win) {
          win.document.write(html);
          win.document.close();
          setTimeout(() => {
            win.print();
          }, 800);
        }
        toast.success("Rapport ouvert — utilisez 'Enregistrer en PDF' dans la boîte de dialogue d'impression");
      } else if (format === "docx") {
        // For DOCX, we use the html-to-docx approach via the client
        const { html, filename } = await response.json();
        // Create a downloadable HTML file that Word can open
        const blob = new Blob([html], { type: "application/msword" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${filename}.doc`;
        a.click();
        toast.success("Rapport Word généré avec succès");
      }
    } catch (error) {
      toast.error("Erreur lors de la génération du rapport");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  }

  const selectedTheme = COLOR_THEMES.find((t) => t.value === config.colorTheme)!;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Générateur de rapports BCM</h1>
          <p className="text-sm text-muted-foreground">Rapports personnalisés Word, PDF — style professionnel</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => generateReport("preview")} disabled={isGenerating} className="gap-2">
            <Eye className="h-4 w-4" />
            Prévisualiser
          </Button>
          <Button variant="outline" onClick={() => generateReport("pdf")} disabled={isGenerating} className="gap-2">
            {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Exporter PDF
          </Button>
          <Button onClick={() => generateReport("docx")} disabled={isGenerating} className="gap-2">
            <FileText className="h-4 w-4" />
            Exporter Word (.doc)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Configuration panel */}
        <div className="md:col-span-1 space-y-4">
          {/* General settings */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Paramètres du rapport
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Titre du rapport</Label>
                <Input
                  className="mt-1"
                  value={config.title}
                  onChange={(e) => setConfig((c) => ({ ...c, title: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-xs">Organisation / Entreprise</Label>
                <Input
                  className="mt-1"
                  value={config.organization}
                  onChange={(e) => setConfig((c) => ({ ...c, organization: e.target.value }))}
                  placeholder="Ex: Société SBC"
                />
              </div>
              <div>
                <Label className="text-xs">Périmètre (site)</Label>
                <Select
                  value={config.factoryId}
                  onValueChange={(v) => setConfig((c) => ({ ...c, factoryId: v }))}
                >
                  <SelectTrigger className="mt-1 h-8 text-xs">
                    <SelectValue placeholder="Tous les sites" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les sites</SelectItem>
                    {factories.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name} ({f.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Theme */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Thème couleur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {COLOR_THEMES.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => setConfig((c) => ({ ...c, colorTheme: theme.value as ReportConfig["colorTheme"] }))}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all text-sm ${
                    config.colorTheme === theme.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-transparent hover:border-gray-200"
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: theme.color }}
                  />
                  <span className="font-medium">{theme.label}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sections selector */}
        <div className="md:col-span-2">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Sections du rapport
              </CardTitle>
              <CardDescription className="text-xs">
                Sélectionnez les sections à inclure dans votre rapport personnalisé
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {SECTION_OPTIONS.map((section) => {
                const Icon = section.icon;
                const active = config.sections.includes(section.key);
                return (
                  <div
                    key={section.key}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      active
                        ? "border-blue-400 bg-blue-50/50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => toggleSection(section.key)}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      active ? "bg-blue-500" : "bg-gray-100"
                    }`}>
                      <Icon className={`h-5 w-5 ${active ? "text-white" : "text-gray-500"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${active ? "text-blue-800" : "text-foreground"}`}>
                        {section.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{section.description}</p>
                    </div>
                    <Switch checked={active} onCheckedChange={() => toggleSection(section.key)} />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Preview card */}
          <Card className="shadow-sm mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Aperçu du rapport</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mini preview */}
              <div
                className="rounded-xl overflow-hidden border"
                style={{ background: "white" }}
              >
                {/* Cover preview */}
                <div
                  className="p-5 text-white text-sm"
                  style={{ background: `linear-gradient(135deg, ${selectedTheme.color} 0%, ${selectedTheme.color}99 100%)` }}
                >
                  <div className="text-xs opacity-70 mb-2">ISO 22301 — Business Continuity Management</div>
                  <div className="font-bold text-base">{config.title || "Rapport BCM"}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {config.organization || "Organisation"} — {new Date().toLocaleDateString("fr-FR")}
                  </div>
                </div>

                {/* Section previews */}
                <div className="p-4 space-y-2">
                  {SECTION_OPTIONS.filter((s) => config.sections.includes(s.key)).map((s) => (
                    <div key={s.key} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: selectedTheme.color }}
                      />
                      {s.label}
                    </div>
                  ))}
                  {config.sections.length === 0 && (
                    <p className="text-xs text-muted-foreground">Aucune section sélectionnée</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <Badge variant="outline" className="text-xs">
                  {config.sections.length} section{config.sections.length > 1 ? "s" : ""}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {config.factoryId
                    ? factories.find((f) => f.id === config.factoryId)?.name ?? "Site sélectionné"
                    : "Tous les sites"}
                </Badge>
                <Badge
                  className="text-xs text-white"
                  style={{ backgroundColor: selectedTheme.color }}
                >
                  {selectedTheme.label}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
