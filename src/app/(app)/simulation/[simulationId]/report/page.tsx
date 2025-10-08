"use client";

import { use, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  MessageSquare,
  Bell,
  Download,
  Share2,
  FileText,
  AlertCircle,
  CheckCircle2,
  Activity,
  Mail,
  Phone,
  Zap,
  Newspaper,
  Loader2,
  Sparkles,
  Target,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Communication {
  id: string;
  type: string;
  subject?: string;
  content?: string;
  createdAt: string;
  sender: { id: string; name: string; email: string };
  recipient?: { id: string; name: string; email: string };
}

interface Injection {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: string;
  scenarioName?: string;
}

interface TimelineEvent {
  type: "injection" | "communication";
  timestamp: string;
  data: (Injection & { subject?: never }) | (Communication & { title?: never });
}

interface SimulationReport {
  simulation: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    startDate: string;
    endDate: string;
    duration: number;
  };
  participants: {
    total: number;
    users: Array<{ id: string; name: string; email: string }>;
    teams: Array<{ id: string; name: string }>;
  };
  statistics: {
    totalInjections: number;
    totalCommunications: number;
    responseRate: number;
    avgResponseTimeMinutes: number;
    acknowledgmentRate: number;
    acknowledgedInjections: number;
  };
  communicationsByType: Record<string, Communication[]>;
  injectionsByType: Record<string, Injection[]>;
  injections: Injection[];
  communications: Communication[];
  timeline: TimelineEvent[];
}

interface AIAnalysis {
  score: number;
  evaluation: string;
  resume: string;
  pointsForts: string[];
  pointsAmeliorer: string[];
  analyseCommunications: {
    description: string;
    tauxReponse: string;
    tempsReponse: string;
  };
  analyseInjections: {
    description: string;
    couverture: string;
    acknowledgment: string;
  };
  gestionTemps: {
    description: string;
    efficacite: string;
    recommandations: string;
  };
  recommandations: Array<{
    priorite: string;
    titre: string;
    description: string;
    actions: string[];
  }>;
  conclusion: string;
}

export default function SimulationReportPage({
  params,
}: {
  params: Promise<{ simulationId: string }>;
}) {
  const { simulationId } = use(params);
  const [report, setReport] = useState<SimulationReport | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzingWithAI, setAnalyzingWithAI] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulationId]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/simulations/${simulationId}/report`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement du rapport");
      }
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error("Error fetching report:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le rapport",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeWithAI = async () => {
    if (!report) return;

    try {
      setAnalyzingWithAI(true);
      const response = await fetch(
        `/api/simulations/${simulationId}/report/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reportData: report }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'analyse IA");
      }

      const data = await response.json();
      setAiAnalysis(data.analysis);

      toast({
        title: "Analyse terminée",
        description: "L'analyse IA du rapport a été générée avec succès",
      });
    } catch (error) {
      console.error("Error analyzing with AI:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer l'analyse IA",
        variant: "destructive",
      });
    } finally {
      setAnalyzingWithAI(false);
    }
  };

  const exportToPDF = () => {
    toast({
      title: "Export PDF",
      description: "Fonctionnalité d'export PDF en cours de développement",
    });
  };

  const exportToExcel = () => {
    toast({
      title: "Export Excel",
      description: "Fonctionnalité d'export Excel en cours de développement",
    });
  };

  const shareReport = () => {
    toast({
      title: "Partage",
      description: "Fonctionnalité de partage en cours de développement",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getEvaluationBadge = (evaluation: string) => {
    const colors: Record<string, string> = {
      EXCELLENT: "bg-green-500/20 text-green-400 border-green-500/50",
      BON: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      MOYEN: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      INSUFFISANT: "bg-red-500/20 text-red-400 border-red-500/50",
    };
    return colors[evaluation] || colors.MOYEN;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      HAUTE: "bg-red-500/20 text-red-400 border-red-500/50",
      MOYENNE: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      BASSE: "bg-green-500/20 text-green-400 border-green-500/50",
    };
    return colors[priority] || colors.MOYENNE;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      EMAIL: <Mail className="h-4 w-4" />,
      SMS: <MessageSquare className="h-4 w-4" />,
      CALL: <Phone className="h-4 w-4" />,
      ALERT: <Bell className="h-4 w-4" />,
      MEMO: <FileText className="h-4 w-4" />,
      NEWSBROADCAST: <Newspaper className="h-4 w-4" />,
      NEWSPAPER: <Newspaper className="h-4 w-4" />,
      SOCIAL: <Users className="h-4 w-4" />,
    };
    return icons[type.toUpperCase()] || <MessageSquare className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[oklch(0.145_0_0)]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#008080] mx-auto mb-4" />
          <p className="text-[oklch(0.922_0_0)]">Chargement du rapport...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[oklch(0.145_0_0)] p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Impossible de charger le rapport de simulation
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.145_0_0)] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-[oklch(0.922_0_0)]">
              Rapport de Simulation
            </h1>
            <p className="text-[oklch(0.722_0_0)]">{report.simulation.title}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={exportToPDF}
              variant="outline"
              className="bg-[oklch(0.205_0_0)] border-[oklch(0.269_0_0)] text-[oklch(0.922_0_0)] hover:bg-[oklch(0.269_0_0)]"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button
              onClick={exportToExcel}
              variant="outline"
              className="bg-[oklch(0.205_0_0)] border-[oklch(0.269_0_0)] text-[oklch(0.922_0_0)] hover:bg-[oklch(0.269_0_0)]"
            >
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button
              onClick={shareReport}
              variant="outline"
              className="bg-[oklch(0.205_0_0)] border-[oklch(0.269_0_0)] text-[oklch(0.922_0_0)] hover:bg-[oklch(0.269_0_0)]"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Partager
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[oklch(0.205_0_0)] border-[oklch(0.269_0_0)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[oklch(0.722_0_0)] flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#008080]" />
                Durée
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[oklch(0.922_0_0)]">
                {report.simulation.duration.toFixed(1)}h
              </div>
              <p className="text-xs text-[oklch(0.722_0_0)] mt-1">
                {new Date(report.simulation.startDate).toLocaleDateString(
                  "fr-FR"
                )}{" "}
                au{" "}
                {new Date(report.simulation.endDate).toLocaleDateString(
                  "fr-FR"
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[oklch(0.205_0_0)] border-[oklch(0.269_0_0)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[oklch(0.722_0_0)] flex items-center gap-2">
                <Users className="h-4 w-4 text-[#008080]" />
                Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[oklch(0.922_0_0)]">
                {report.participants.total}
              </div>
              <p className="text-xs text-[oklch(0.722_0_0)] mt-1">
                {report.participants.users.length} utilisateurs,{" "}
                {report.participants.teams.length} équipes
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[oklch(0.205_0_0)] border-[oklch(0.269_0_0)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[oklch(0.722_0_0)] flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#008080]" />
                Injections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[oklch(0.922_0_0)]">
                {report.statistics.totalInjections}
              </div>
              <p className="text-xs text-[oklch(0.722_0_0)] mt-1">
                {report.statistics.acknowledgmentRate.toFixed(0)}% acquittées
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[oklch(0.205_0_0)] border-[oklch(0.269_0_0)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[oklch(0.722_0_0)] flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#008080]" />
                Communications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[oklch(0.922_0_0)]">
                {report.statistics.totalCommunications}
              </div>
              <p className="text-xs text-[oklch(0.722_0_0)] mt-1">
                Taux de réponse: {report.statistics.responseRate.toFixed(0)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis Button */}
        {!aiAnalysis && (
          <Card className="bg-[oklch(0.205_0_0)] border-[oklch(0.269_0_0)]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-[oklch(0.922_0_0)] flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#008080]" />
                    Analyse IA avec Gemini
                  </h3>
                  <p className="text-sm text-[oklch(0.722_0_0)]">
                    Obtenez une analyse détaillée de la simulation avec des
                    recommandations personnalisées
                  </p>
                </div>
                <Button
                  onClick={analyzeWithAI}
                  disabled={analyzingWithAI}
                  className="bg-[#008080] hover:bg-[#006666] text-white"
                >
                  {analyzingWithAI ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Générer l&apos;analyse IA
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Analysis Results */}
        {aiAnalysis && (
          <Card className="bg-[oklch(0.205_0_0)] border-[oklch(0.269_0_0)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-[oklch(0.922_0_0)] flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#008080]" />
                  Analyse IA de la Simulation
                </CardTitle>
                <Button
                  onClick={analyzeWithAI}
                  variant="outline"
                  size="sm"
                  disabled={analyzingWithAI}
                  className="bg-[oklch(0.145_0_0)] border-[oklch(0.269_0_0)] text-[oklch(0.922_0_0)] hover:bg-[oklch(0.269_0_0)]"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Régénérer
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score and Evaluation */}
              <div className="flex items-center gap-6 p-4 bg-[oklch(0.145_0_0)] rounded-lg border border-[oklch(0.269_0_0)]">
                <div className="text-center">
                  <div
                    className={`text-5xl font-bold ${getScoreColor(
                      aiAnalysis.score
                    )}`}
                  >
                    {aiAnalysis.score}
                  </div>
                  <p className="text-sm text-[oklch(0.722_0_0)] mt-1">
                    Score global
                  </p>
                </div>
                <Separator
                  orientation="vertical"
                  className="h-16 bg-[oklch(0.269_0_0)]"
                />
                <div className="flex-1">
                  <Badge
                    className={`${getEvaluationBadge(
                      aiAnalysis.evaluation
                    )} border mb-2`}
                  >
                    {aiAnalysis.evaluation}
                  </Badge>
                  <p className="text-sm text-[oklch(0.922_0_0)]">
                    {aiAnalysis.resume}
                  </p>
                </div>
              </div>

              {/* Points Forts et À Améliorer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-[oklch(0.922_0_0)] flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-green-400" />
                    Points Forts
                  </h4>
                  <div className="space-y-2">
                    {aiAnalysis.pointsForts.map((point, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/30"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-[oklch(0.922_0_0)]">
                          {point}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-[oklch(0.922_0_0)] flex items-center gap-2">
                    <ThumbsDown className="h-4 w-4 text-orange-400" />
                    Points à Améliorer
                  </h4>
                  <div className="space-y-2">
                    {aiAnalysis.pointsAmeliorer.map((point, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/30"
                      >
                        <AlertCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-[oklch(0.922_0_0)]">
                          {point}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detailed Analysis Tabs */}
              <Tabs defaultValue="communications" className="w-full">
                <TabsList className="bg-[oklch(0.145_0_0)] border border-[oklch(0.269_0_0)]">
                  <TabsTrigger
                    value="communications"
                    className="data-[state=active]:bg-[#008080] data-[state=active]:text-white"
                  >
                    Communications
                  </TabsTrigger>
                  <TabsTrigger
                    value="injections"
                    className="data-[state=active]:bg-[#008080] data-[state=active]:text-white"
                  >
                    Injections
                  </TabsTrigger>
                  <TabsTrigger
                    value="temps"
                    className="data-[state=active]:bg-[#008080] data-[state=active]:text-white"
                  >
                    Gestion du Temps
                  </TabsTrigger>
                  <TabsTrigger
                    value="recommandations"
                    className="data-[state=active]:bg-[#008080] data-[state=active]:text-white"
                  >
                    Recommandations
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="communications" className="space-y-4 mt-4">
                  <Card className="bg-[oklch(0.145_0_0)] border-[oklch(0.269_0_0)]">
                    <CardContent className="pt-6 space-y-4">
                      <p className="text-[oklch(0.922_0_0)]">
                        {aiAnalysis.analyseCommunications.description}
                      </p>
                      <Separator className="bg-[oklch(0.269_0_0)]" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-[oklch(0.722_0_0)] mb-2">
                            Taux de Réponse
                          </h5>
                          <p className="text-sm text-[oklch(0.922_0_0)]">
                            {aiAnalysis.analyseCommunications.tauxReponse}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-[oklch(0.722_0_0)] mb-2">
                            Temps de Réponse
                          </h5>
                          <p className="text-sm text-[oklch(0.922_0_0)]">
                            {aiAnalysis.analyseCommunications.tempsReponse}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="injections" className="space-y-4 mt-4">
                  <Card className="bg-[oklch(0.145_0_0)] border-[oklch(0.269_0_0)]">
                    <CardContent className="pt-6 space-y-4">
                      <p className="text-[oklch(0.922_0_0)]">
                        {aiAnalysis.analyseInjections.description}
                      </p>
                      <Separator className="bg-[oklch(0.269_0_0)]" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-[oklch(0.722_0_0)] mb-2">
                            Couverture
                          </h5>
                          <p className="text-sm text-[oklch(0.922_0_0)]">
                            {aiAnalysis.analyseInjections.couverture}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-[oklch(0.722_0_0)] mb-2">
                            Acknowledgment
                          </h5>
                          <p className="text-sm text-[oklch(0.922_0_0)]">
                            {aiAnalysis.analyseInjections.acknowledgment}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="temps" className="space-y-4 mt-4">
                  <Card className="bg-[oklch(0.145_0_0)] border-[oklch(0.269_0_0)]">
                    <CardContent className="pt-6 space-y-4">
                      <p className="text-[oklch(0.922_0_0)]">
                        {aiAnalysis.gestionTemps.description}
                      </p>
                      <Separator className="bg-[oklch(0.269_0_0)]" />
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium text-[oklch(0.722_0_0)] mb-2">
                            Efficacité
                          </h5>
                          <p className="text-sm text-[oklch(0.922_0_0)]">
                            {aiAnalysis.gestionTemps.efficacite}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-[oklch(0.722_0_0)] mb-2">
                            Recommandations
                          </h5>
                          <p className="text-sm text-[oklch(0.922_0_0)]">
                            {aiAnalysis.gestionTemps.recommandations}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="recommandations" className="space-y-4 mt-4">
                  {aiAnalysis.recommandations.map((rec, index) => (
                    <Card
                      key={index}
                      className="bg-[oklch(0.145_0_0)] border-[oklch(0.269_0_0)]"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Target className="h-5 w-5 text-[#008080] mt-1" />
                            <div>
                              <CardTitle className="text-lg text-[oklch(0.922_0_0)]">
                                {rec.titre}
                              </CardTitle>
                              <CardDescription className="text-[oklch(0.722_0_0)] mt-1">
                                {rec.description}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge
                            className={`${getPriorityBadge(
                              rec.priorite
                            )} border`}
                          >
                            {rec.priorite}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <h5 className="text-sm font-medium text-[oklch(0.722_0_0)] mb-2">
                          Actions recommandées :
                        </h5>
                        <ul className="space-y-2">
                          {rec.actions.map((action, actionIndex) => (
                            <li
                              key={actionIndex}
                              className="flex items-start gap-2 text-sm text-[oklch(0.922_0_0)]"
                            >
                              <ArrowRight className="h-4 w-4 text-[#008080] mt-0.5 flex-shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>

              {/* Conclusion */}
              <Card className="bg-[oklch(0.145_0_0)] border-[oklch(0.269_0_0)]">
                <CardHeader>
                  <CardTitle className="text-lg text-[oklch(0.922_0_0)]">
                    Conclusion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[oklch(0.922_0_0)] leading-relaxed">
                    {aiAnalysis.conclusion}
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        )}

        {/* Statistics Section */}
        <Card className="bg-[oklch(0.205_0_0)] border-[oklch(0.269_0_0)]">
          <CardHeader>
            <CardTitle className="text-xl text-[oklch(0.922_0_0)] flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#008080]" />
              Statistiques Détaillées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-[oklch(0.145_0_0)] border border-[oklch(0.269_0_0)]">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-[#008080] data-[state=active]:text-white"
                >
                  Vue d&apos;ensemble
                </TabsTrigger>
                <TabsTrigger
                  value="communications"
                  className="data-[state=active]:bg-[#008080] data-[state=active]:text-white"
                >
                  Communications
                </TabsTrigger>
                <TabsTrigger
                  value="injections"
                  className="data-[state=active]:bg-[#008080] data-[state=active]:text-white"
                >
                  Injections
                </TabsTrigger>
                <TabsTrigger
                  value="timeline"
                  className="data-[state=active]:bg-[#008080] data-[state=active]:text-white"
                >
                  Timeline
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-[oklch(0.145_0_0)] border-[oklch(0.269_0_0)]">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-[oklch(0.722_0_0)]">
                        Taux de Réponse
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-[oklch(0.922_0_0)]">
                          {report.statistics.responseRate.toFixed(0)}%
                        </span>
                        <TrendingUp className="h-5 w-5 text-[#008080] mb-1" />
                      </div>
                      <p className="text-xs text-[oklch(0.722_0_0)] mt-2">
                        {report.statistics.totalCommunications} communications
                        pour {report.statistics.totalInjections} injections
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-[oklch(0.145_0_0)] border-[oklch(0.269_0_0)]">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-[oklch(0.722_0_0)]">
                        Temps de Réponse Moyen
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-[oklch(0.922_0_0)]">
                          {report.statistics.avgResponseTimeMinutes.toFixed(1)}
                        </span>
                        <span className="text-sm text-[oklch(0.722_0_0)] mb-1">
                          min
                        </span>
                      </div>
                      <p className="text-xs text-[oklch(0.722_0_0)] mt-2">
                        Délai moyen entre injection et première réponse
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-[oklch(0.145_0_0)] border-[oklch(0.269_0_0)]">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-[oklch(0.722_0_0)]">
                        Taux d&apos;Acquittement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-[oklch(0.922_0_0)]">
                          {report.statistics.acknowledgmentRate.toFixed(0)}%
                        </span>
                        <CheckCircle2 className="h-5 w-5 text-[#008080] mb-1" />
                      </div>
                      <p className="text-xs text-[oklch(0.722_0_0)] mt-2">
                        {report.statistics.acknowledgedInjections} sur{" "}
                        {report.statistics.totalInjections} injections
                        acquittées
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="communications" className="space-y-4 mt-4">
                <Card className="bg-[oklch(0.145_0_0)] border-[oklch(0.269_0_0)]">
                  <CardHeader>
                    <CardTitle className="text-lg text-[oklch(0.922_0_0)]">
                      Communications par Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(report.communicationsByType).map(
                        ([type, comms]) => (
                          <div
                            key={type}
                            className="flex items-center justify-between p-3 bg-[oklch(0.205_0_0)] rounded-lg border border-[oklch(0.269_0_0)]"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-[#008080]/20 rounded-lg">
                                {getTypeIcon(type)}
                              </div>
                              <span className="font-medium text-[oklch(0.922_0_0)]">
                                {type}
                              </span>
                            </div>
                            <Badge
                              variant="secondary"
                              className="bg-[#008080]/20 text-[#008080]"
                            >
                              {comms.length} communications
                            </Badge>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="injections" className="space-y-4 mt-4">
                <Card className="bg-[oklch(0.145_0_0)] border-[oklch(0.269_0_0)]">
                  <CardHeader>
                    <CardTitle className="text-lg text-[oklch(0.922_0_0)]">
                      Injections par Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(report.injectionsByType).map(
                        ([type, injs]) => (
                          <div
                            key={type}
                            className="flex items-center justify-between p-3 bg-[oklch(0.205_0_0)] rounded-lg border border-[oklch(0.269_0_0)]"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-[#008080]/20 rounded-lg">
                                {getTypeIcon(type)}
                              </div>
                              <span className="font-medium text-[oklch(0.922_0_0)]">
                                {type}
                              </span>
                            </div>
                            <Badge
                              variant="secondary"
                              className="bg-[#008080]/20 text-[#008080]"
                            >
                              {injs.length} injections
                            </Badge>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4 mt-4">
                <Card className="bg-[oklch(0.145_0_0)] border-[oklch(0.269_0_0)]">
                  <CardHeader>
                    <CardTitle className="text-lg text-[oklch(0.922_0_0)]">
                      Timeline des Événements
                    </CardTitle>
                    <CardDescription className="text-[oklch(0.722_0_0)]">
                      Chronologie des injections et communications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-4 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-[oklch(0.269_0_0)]">
                        {report.timeline.map((event, index) => (
                          <div key={index} className="flex gap-4 relative">
                            <div
                              className={`p-2 rounded-full z-10 ${
                                event.type === "injection"
                                  ? "bg-orange-500/20"
                                  : "bg-blue-500/20"
                              }`}
                            >
                              {event.type === "injection" ? (
                                <Zap className="h-4 w-4 text-orange-400" />
                              ) : (
                                <Activity className="h-4 w-4 text-blue-400" />
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="flex items-start justify-between mb-1">
                                <p className="font-medium text-[oklch(0.922_0_0)]">
                                  {event.type === "injection"
                                    ? (event.data as Injection).title
                                    : (event.data as Communication).subject ||
                                      "Sans titre"}
                                </p>
                                <Badge
                                  variant="outline"
                                  className={
                                    event.type === "injection"
                                      ? "border-orange-500/50 text-orange-400"
                                      : "border-blue-500/50 text-blue-400"
                                  }
                                >
                                  {event.type === "injection"
                                    ? "Injection"
                                    : "Communication"}
                                </Badge>
                              </div>
                              <p className="text-xs text-[oklch(0.722_0_0)] flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(event.timestamp).toLocaleString(
                                  "fr-FR"
                                )}
                              </p>
                              {event.data.content && (
                                <p className="text-sm text-[oklch(0.722_0_0)] mt-2 line-clamp-2">
                                  {event.data.content}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Participants Section */}
        <Card className="bg-[oklch(0.205_0_0)] border-[oklch(0.269_0_0)]">
          <CardHeader>
            <CardTitle className="text-xl text-[oklch(0.922_0_0)] flex items-center gap-2">
              <Users className="h-5 w-5 text-[#008080]" />
              Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-[oklch(0.722_0_0)] mb-3">
                  Utilisateurs ({report.participants.users.length})
                </h3>
                <div className="space-y-2">
                  {report.participants.users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 bg-[oklch(0.145_0_0)] rounded-lg border border-[oklch(0.269_0_0)]"
                    >
                      <div className="h-10 w-10 rounded-full bg-[#008080]/20 flex items-center justify-center text-[#008080] font-semibold">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-[oklch(0.922_0_0)]">
                          {user.name}
                        </p>
                        <p className="text-xs text-[oklch(0.722_0_0)]">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[oklch(0.722_0_0)] mb-3">
                  Équipes ({report.participants.teams.length})
                </h3>
                <div className="space-y-2">
                  {report.participants.teams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center gap-3 p-3 bg-[oklch(0.145_0_0)] rounded-lg border border-[oklch(0.269_0_0)]"
                    >
                      <div className="h-10 w-10 rounded-lg bg-[#008080]/20 flex items-center justify-center">
                        <Users className="h-5 w-5 text-[#008080]" />
                      </div>
                      <p className="font-medium text-[oklch(0.922_0_0)]">
                        {team.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
