"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  FileText, Download, Printer, RefreshCw, Brain,
  CheckCircle2, AlertTriangle, XCircle, Star, TrendingUp,
  Users, Clock, Shield, ChevronRight, Target, Zap,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ReportData {
  descriptionScenario: string;
  deroulement: string;
  analyseReponseParInject: Array<{
    inject: string; type: string; analyse: string; ecart: string;
    scoreConformite: number; delaiReaction?: number; delaiAttendu?: number;
    appreciation: "CONFORME" | "PARTIEL" | "NON_CONFORME";
  }>;
  comportementEquipe: string;
  pointsForts: string[];
  pointsAmeliorer: string[];
  lacunesPlan: Array<{ section: string; lacune: string; impact: string }>;
  recommandations: Array<{
    priorite: "HAUTE" | "MOYENNE" | "BASSE";
    titre: string; description: string; actions: string[];
  }>;
  conclusion: string;
  scoreGlobal: number;
  niveauGlobal: string;
}

interface Stats {
  teamScore: number | null; totalInjections: number;
  conformant: number; nonConformant: number;
  avgReaction: number | null; participants: number;
}

// ─── Color helpers ────────────────────────────────────────────────────────────
const S = (s: number) => s >= 80 ? "#0F6E56" : s >= 60 ? "#185FA5" : s >= 40 ? "#854F0B" : "#A32D2D";
const SBG = (s: number) => s >= 80 ? "#E1F5EE" : s >= 60 ? "#E6F1FB" : s >= 40 ? "#FAEEDA" : "#FCEBEB";

const APPR_CFG = {
  CONFORME: { label: "Conforme", color: "#0F6E56", bg: "#E1F5EE", Icon: CheckCircle2 },
  PARTIEL: { label: "Partiel", color: "#854F0B", bg: "#FAEEDA", Icon: AlertTriangle },
  NON_CONFORME: { label: "Non conforme", color: "#A32D2D", bg: "#FCEBEB", Icon: XCircle },
};

const PRIO_CFG = {
  HAUTE: { color: "#A32D2D", bg: "#FCEBEB" },
  MOYENNE: { color: "#854F0B", bg: "#FAEEDA" },
  BASSE: { color: "#0F6E56", bg: "#E1F5EE" },
};

const NIVEAU_LABEL: Record<string, string> = {
  EXCELLENT: "Excellent", BIEN: "Bien", ACCEPTABLE: "Acceptable",
  INSUFFISANT: "Insuffisant", CRITIQUE: "Critique",
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionHeader({ num, title, icon: Icon }: { num: number; title: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-blue-500">
      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-white" />
      </div>
      <h2 className="text-base font-semibold text-blue-800">{num}. {title}</h2>
    </div>
  );
}

function InjectCard({ inj, index }: { inj: ReportData["analyseReponseParInject"][0]; index: number }) {
  const cfg = APPR_CFG[inj.appreciation] || APPR_CFG.PARTIEL;
  const CfgIcon = cfg.Icon;
  const delayed = inj.delaiReaction != null && inj.delaiAttendu != null && inj.delaiReaction > inj.delaiAttendu;

  return (
    <Card className="shadow-sm mb-3">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
            style={{ background: cfg.color }}>{index + 1}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{inj.inject}</span>
              <Badge className="text-xs" style={{ background: cfg.bg, color: cfg.color }}>
                <CfgIcon className="h-3 w-3 mr-1" />{cfg.label}
              </Badge>
              <span className="text-xs text-muted-foreground">{inj.type}</span>
              {inj.scoreConformite != null && (
                <span className="text-sm font-bold ml-auto" style={{ color: S(inj.scoreConformite) }}>
                  {inj.scoreConformite}%
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-muted/30 rounded-lg p-2.5">
            <p className="text-xs text-muted-foreground mb-0.5">Délai de réaction</p>
            <p className="text-base font-bold" style={{ color: delayed ? "#A32D2D" : "#0F6E56" }}>
              {inj.delaiReaction != null ? `${inj.delaiReaction} min` : "—"}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                {inj.delaiAttendu != null ? `/ cible ${inj.delaiAttendu} min` : ""}
              </span>
            </p>
          </div>
          <div className="bg-muted/30 rounded-lg p-2.5">
            <p className="text-xs text-muted-foreground mb-0.5">Conformité plan</p>
            <p className="text-base font-bold" style={{ color: S(inj.scoreConformite || 0) }}>
              {inj.scoreConformite != null ? `${inj.scoreConformite}%` : "—"}
            </p>
          </div>
        </div>

        <div className="mb-2">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Analyse de la réponse</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{inj.analyse}</p>
        </div>

        {inj.ecart && inj.ecart !== "Aucun écart notable." && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg border-l-4 border-amber-400 bg-amber-50">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-800 mb-0.5">Écart avec le plan</p>
              <p className="text-xs text-amber-700">{inj.ecart}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SimulationFinalReport({ simulationId }: { simulationId: string }) {
  const [report, setReport] = useState<ReportData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  async function generateReport() {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/simulations/${simulationId}/full-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: "json" }),
      });
      const data = await res.json();
      if (data.success) {
        setReport(data.data.report);
        setStats(data.data.stats);
        toast.success("Rapport généré avec succès");
      } else {
        toast.error(data.error || "Erreur de génération");
      }
    } catch (e) {
      toast.error("Erreur lors de la génération du rapport");
    } finally {
      setIsGenerating(false);
    }
  }

  async function printReport() {
    setIsPrinting(true);
    try {
      const res = await fetch(`/api/simulations/${simulationId}/full-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: "html" }),
      });
      const html = await res.text();
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
        setTimeout(() => win.print(), 800);
      }
    } catch (e) {
      toast.error("Erreur d'impression");
    } finally {
      setIsPrinting(false);
    }
  }

  const score = report?.scoreGlobal ?? stats?.teamScore ?? null;
  const conformiteRate = stats ? Math.round((stats.conformant / Math.max(stats.totalInjections, 1)) * 100) : null;

  if (!report) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Rapport final de simulation</h1>
            <p className="text-sm text-muted-foreground">Compte-rendu complet avec analyse IA — ISO 22301</p>
          </div>
        </div>

        <Card className="shadow-sm border-dashed border-2">
          <CardContent className="p-12 text-center">
            <FileText className="h-14 w-14 mx-auto mb-5 text-muted-foreground opacity-30" />
            <h2 className="text-xl font-semibold mb-2">Générer le rapport d'exercice</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-lg mx-auto">
              L'IA analysera l'ensemble de la simulation — scénario, injects, communications, 
              comportements — et produira un compte-rendu professionnel complet.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {["Description du scénario", "Analyse inject par inject", "Écarts plan de crise", "Comportement équipe", "Points forts & à améliorer", "Lacunes plan", "Recommandations"].map(item => (
                <span key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-full">
                  <ChevronRight className="h-3 w-3" />{item}
                </span>
              ))}
            </div>
            <Button onClick={generateReport} disabled={isGenerating} size="lg" className="gap-2">
              {isGenerating ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Brain className="h-5 w-5" />}
              {isGenerating ? "Analyse IA en cours (1–2 min)..." : "Générer le rapport complet"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Rapport final de simulation</h1>
          <p className="text-sm text-muted-foreground">Compte-rendu d'exercice de gestion de crise · ISO 22301</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateReport} disabled={isGenerating} size="sm" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
            Régénérer
          </Button>
          <Button variant="outline" onClick={printReport} disabled={isPrinting} size="sm" className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimer / PDF
          </Button>
          <Button onClick={printReport} disabled={isPrinting} size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Cover card */}
      <Card className="shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-6 text-white">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <Badge className="mb-3 bg-white/20 text-white border-white/30 text-xs">
                RAPPORT D'EXERCICE — ISO 22301 · BCM
              </Badge>
              <p className="text-xs opacity-75 mt-2">Compte-rendu d'exercice de gestion de crise</p>
            </div>
            {score != null && (
              <div className="text-center bg-white/15 rounded-xl px-6 py-3">
                <p className="text-4xl font-bold">{score}</p>
                <p className="text-xs opacity-80 mt-1">Score équipe /100</p>
                <p className="text-sm font-semibold opacity-90">{NIVEAU_LABEL[report.niveauGlobal] || report.niveauGlobal}</p>
              </div>
            )}
          </div>
        </div>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Score équipe", value: score != null ? `${score}/100` : "—", color: score != null ? S(score) : "#888" },
              { label: "Conformité plan", value: conformiteRate != null ? `${conformiteRate}%` : "—", color: conformiteRate != null ? S(conformiteRate) : "#888" },
              { label: "Délai moy. réaction", value: stats?.avgReaction != null ? `${stats.avgReaction} min` : "—", color: "#185FA5" },
              { label: "Participants", value: stats?.participants ?? "—", color: "#534AB7" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 1. Scénario */}
      <Card className="shadow-sm">
        <CardContent className="p-5">
          <SectionHeader num={1} title="Description du scénario" icon={FileText} />
          <p className="text-sm text-muted-foreground leading-relaxed bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            {report.descriptionScenario}
          </p>
        </CardContent>
      </Card>

      {/* 2. Déroulement */}
      <Card className="shadow-sm">
        <CardContent className="p-5">
          <SectionHeader num={2} title="Déroulement de l'exercice" icon={Clock} />
          <p className="text-sm text-muted-foreground leading-relaxed bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            {report.deroulement}
          </p>
        </CardContent>
      </Card>

      {/* 3. Injects */}
      <Card className="shadow-sm">
        <CardContent className="p-5">
          <SectionHeader num={3} title="Analyse de la réponse par inject" icon={Zap} />
          {report.analyseReponseParInject.length > 0 ? (
            report.analyseReponseParInject.map((inj, i) => (
              <InjectCard key={i} inj={inj} index={i} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic">Aucune analyse d'inject disponible.</p>
          )}
        </CardContent>
      </Card>

      {/* 4. Comportement équipe */}
      <Card className="shadow-sm">
        <CardContent className="p-5">
          <SectionHeader num={4} title="Comportement général de l'équipe" icon={Users} />
          <p className="text-sm text-muted-foreground leading-relaxed bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            {report.comportementEquipe}
          </p>
        </CardContent>
      </Card>

      {/* 5. Points forts / à améliorer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <SectionHeader num={5} title="Points forts" icon={Star} />
            <div className="space-y-2">
              {report.pointsForts.map((p, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
                  <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</div>
                  <p className="text-sm text-green-800">{p}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5">
            <SectionHeader num={6} title="Points à améliorer" icon={TrendingUp} />
            <div className="space-y-2">
              {report.pointsAmeliorer.map((p, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <div className="w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</div>
                  <p className="text-sm text-amber-800">{p}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 7. Lacunes plan */}
      <Card className="shadow-sm">
        <CardContent className="p-5">
          <SectionHeader num={7} title="Lacunes identifiées dans le plan de crise" icon={Shield} />
          {report.lacunesPlan.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    {["Section", "Lacune identifiée", "Impact observé"].map(h => (
                      <th key={h} className="text-left p-3 text-xs font-semibold text-purple-100 bg-purple-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.lacunesPlan.map((l, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-purple-50">
                      <td className="p-3 font-semibold text-xs">{l.section}</td>
                      <td className="p-3 text-xs text-muted-foreground">{l.lacune}</td>
                      <td className="p-3 text-xs text-red-700">{l.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-green-50 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800">Aucune lacune critique identifiée dans le plan lors de cet exercice.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 8. Recommandations */}
      <Card className="shadow-sm">
        <CardContent className="p-5">
          <SectionHeader num={8} title="Recommandations" icon={Target} />
          <div className="space-y-4">
            {report.recommandations.map((rec, i) => {
              const prioCfg = PRIO_CFG[rec.priorite] || PRIO_CFG.MOYENNE;
              return (
                <div key={i} className="flex gap-4 p-4 border rounded-xl hover:shadow-sm transition-shadow">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: prioCfg.bg, color: prioCfg.color }}>{i+1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm">{rec.titre}</span>
                      <Badge className="text-xs" style={{ background: prioCfg.bg, color: prioCfg.color }}>
                        Priorité {rec.priorite}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                    <div className="space-y-1">
                      {rec.actions.map((a, j) => (
                        <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <ChevronRight className="h-3 w-3 mt-0.5 text-blue-500 flex-shrink-0" />
                          <span>{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 9. Conclusion */}
      <Card className="shadow-sm">
        <CardContent className="p-5">
          <SectionHeader num={9} title="Conclusion" icon={Star} />
          <p className="text-sm text-muted-foreground leading-relaxed bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            {report.conclusion}
          </p>
        </CardContent>
      </Card>

      {/* Footer actions */}
      <div className="flex justify-center gap-3 pb-6">
        <Button variant="outline" onClick={printReport} disabled={isPrinting} className="gap-2">
          <Printer className="h-4 w-4" /> Imprimer / Exporter PDF
        </Button>
        <Button onClick={generateReport} disabled={isGenerating} variant="outline" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
          Régénérer le rapport
        </Button>
      </div>
    </div>
  );
}
