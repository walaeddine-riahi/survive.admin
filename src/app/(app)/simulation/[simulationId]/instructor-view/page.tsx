"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RealTimeSummaryModal } from "@/components/RealTimeSummaryModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Brain,
  Users,
  MessageSquare,
  Bell,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  Send,
  AlertTriangle,
  Newspaper,
  Radio,
  Globe,
  TrendingUp,
  Eye,
  RefreshCw,
  Sparkles,
  FileText,
  Play,
  Pause,
  Check,
  Zap,
  Target,
  XCircle,
  Shield,
  Star,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { use } from "react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Communication {
  id: string;
  type: string;
  content: string;
  subject?: string;
  sender: User;
  recipient?: User;
  createdAt: string;
  payload?: Record<string, unknown>;
}

interface Injection {
  id: string;
  title: string;
  content: string;
  type: string;
  scenarioName: string;
  acknowledged: boolean;
  createdAt: string;
  imageUrl?: string;
  videoUrl?: string;
  isActive: boolean;
}

interface Assignment {
  userId: string;
  role: string;
  status: string;
  teamId: string | null;
  user: User;
}

interface Simulation {
  id: string;
  title: string;
  description: string | null;
  status: string;
  startDate: string;
  endDate: string;
  assignments: Assignment[];
}

interface InstructorViewData {
  simulation: Simulation;
  communications: {
    email: Communication[];
    sms: Communication[];
    call: Communication[];
    alert: Communication[];
    memo: Communication[];
    newsBroadcast: Communication[];
    newspaper: Communication[];
    social: Communication[];
  };
  injections: Injection[];
  statistics: {
    totalParticipants: number;
    totalCommunications: number;
    totalInjections: number;
    acknowledgedInjections: number;
    acknowledgementRate: number;
  };
}

export default function InstructorViewPage({
  params,
}: {
  params: Promise<{ simulationId: string }>;
}) {
  const resolvedParams = use(params);
  const simulationId = resolvedParams.simulationId;
  const { toast } = useToast();

  const [data, setData] = useState<InstructorViewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);

  const [selectedInjection, setSelectedInjection] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  // AI Analysis state
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAIAnalysisOpen, setIsAIAnalysisOpen] = useState(false);
  const [isRunningAIAnalysis, setIsRunningAIAnalysis] = useState(false);
  const [aiAnalysisTab, setAiAnalysisTab] = useState("synthese");

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/simulations/${simulationId}/instructor-view`
      );
      if (!response.ok) throw new Error("Erreur de chargement");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [simulationId, toast]);

  const toggleInjectionActive = async (injectionId: string, currentIsActive: boolean, targetUserIds?: string[]) => {
    try {
      const response = await fetch(`/api/injections/${injectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          isActive: !currentIsActive,
          targetUserIds: targetUserIds || undefined
        })
      });
      if (response.ok) {
        toast({
          title: "Succès",
          description: !currentIsActive ? "Injection activée avec succès !" : "Injection désactivée avec succès !",
        });
        fetchData();
      } else {
        throw new Error("Erreur de mise à jour");
      }
    } catch (error) {
      console.error("Error toggling injection:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de l'injection",
        variant: "destructive",
      });
    }
  };

  const openInjectionDetails = async (injectionId: string) => {
    try {
      setLoadingDetails(true);
      setIsDetailsOpen(true);
      setSelectedRecipients([]); // Reset selection
      const r = await fetch(`/api/injections/${injectionId}`);
      if (r.ok) {
        const json = await r.json();
        setSelectedInjection(json);
      }
    } catch (e) {
      console.error("Error fetching injection details:", e);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: fr,
    });
  };

  const generateReport = async () => {
    try {
      setGeneratingReport(true);
      window.open(`/simulation/${simulationId}/report`, "_blank");
      toast({
        title: "Rapport ouvert",
        description: "Le rapport de simulation a été ouvert dans un nouvel onglet",
      });
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir le rapport",
        variant: "destructive",
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  const runAIAnalysis = async () => {
    try {
      setIsRunningAIAnalysis(true);
      setIsAIAnalysisOpen(true);
      setAiAnalysis(null);
      toast({
        title: "Analyse IA en cours",
        description: "L'IA analyse la simulation avec les documents PCA et PGUI SBC...",
      });
      const response = await fetch(`/api/simulation/${simulationId}/ai-analysis`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Erreur lors de l'analyse");
      const result = await response.json();
      if (result.success) {
        setAiAnalysis(result.data);
        toast({
          title: "Analyse terminée",
          description: "L'analyse IA enrichie avec PCA/PGUI est disponible.",
        });
      } else {
        throw new Error(result.error || "Erreur inconnue");
      }
    } catch (error) {
      console.error("Erreur analyse IA:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de lancer l'analyse",
        variant: "destructive",
      });
    } finally {
      setIsRunningAIAnalysis(false);
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "sms":
        return <Send className="h-4 w-4" />;
      case "call":
        return <Phone className="h-4 w-4" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4" />;
      case "memo":
        return <MessageSquare className="h-4 w-4" />;
      case "newsBroadcast":
        return <Radio className="h-4 w-4" />;
      case "newspaper":
        return <Newspaper className="h-4 w-4" />;
      case "social":
        return <Globe className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getChannelLabel = (type: string) => {
    const labels: Record<string, string> = {
      email: "Email",
      sms: "SMS",
      call: "Appel",
      alert: "Alerte",
      memo: "WhatsApp",
      newsBroadcast: "Actualités",
      newspaper: "Journal",
      social: "Réseaux Sociaux",
    };
    return labels[type] || type;
  };

  const getAllCommunications = (): Communication[] => {
    if (!data) return [];
    return [
      ...data.communications.email,
      ...data.communications.sms,
      ...data.communications.call,
      ...data.communications.alert,
      ...data.communications.memo,
      ...data.communications.newsBroadcast,
      ...data.communications.newspaper,
      ...data.communications.social,
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const getActivityTimeline = () => {
    if (!data) return [];

    const activities: Array<{
      id: string;
      type: "communication" | "injection";
      subType: string;
      title: string;
      user?: string;
      recipient?: string;
      time: string;
      acknowledged?: boolean;
    }> = [];

    // Add communications
    getAllCommunications().forEach((comm) => {
      activities.push({
        id: comm.id,
        type: "communication",
        subType: comm.type,
        title:
          comm.subject ||
          comm.content.substring(0, 50) +
            (comm.content.length > 50 ? "..." : ""),
        user: `${comm.sender.firstName} ${comm.sender.lastName}`,
        recipient: comm.recipient
          ? `${comm.recipient.firstName} ${comm.recipient.lastName}`
          : undefined,
        time: comm.createdAt,
      });
    });

    // Add injections
    data.injections.forEach((inj) => {
      activities.push({
        id: inj.id,
        type: "injection",
        subType: inj.type,
        title: inj.title,
        time: inj.createdAt,
        acknowledged: inj.acknowledged,
      });
    });

    return activities.sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-semibold">Erreur de chargement</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{data.simulation.title}</h1>
          <p className="text-muted-foreground">
            Vue Instructeur - Monitoring en temps réel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`}
            />
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSummaryModalOpen(true)}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Résumé en temps réel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={generateReport}
            disabled={generatingReport}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {generatingReport ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Rapport avec IA
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/simulation/${simulationId}/dashboard`, "_blank")}
            className="gap-2"
          >
            <Activity className="h-4 w-4 text-green-600" />
            Dashboard live
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/simulation/${simulationId}/analysis`, "_blank")}
            className="gap-2"
          >
            <Brain className="h-4 w-4 text-blue-600" />
            Analyse IA
          </Button>
          <Button
            size="sm"
            onClick={runAIAnalysis}
            disabled={isRunningAIAnalysis}
            className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25"
          >
            {isRunningAIAnalysis ? (
              <><RefreshCw className="h-4 w-4 animate-spin" /> Analyse...</>  
            ) : (
              <><Zap className="h-4 w-4" /> Analyse PCA/PGUI</>
            )}
          </Button>
        </div>
      </div>

      {/* Real-Time Summary Modal */}
      <RealTimeSummaryModal
        open={summaryModalOpen}
        onOpenChange={setSummaryModalOpen}
        simulationId={simulationId}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.statistics.totalParticipants}
            </div>
            <p className="text-xs text-muted-foreground">
              Utilisateurs assignés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Communications
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.statistics.totalCommunications}
            </div>
            <p className="text-xs text-muted-foreground">Messages envoyés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Injections</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.statistics.totalInjections}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.statistics.acknowledgedInjections} acquittées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taux d&apos;acquittement
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.statistics.acknowledgementRate.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">Performance globale</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">
            <Activity className="h-4 w-4 mr-2" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="participants">
            <Users className="h-4 w-4 mr-2" />
            Participants
          </TabsTrigger>
          <TabsTrigger value="communications">
            <MessageSquare className="h-4 w-4 mr-2" />
            Communications
          </TabsTrigger>
          <TabsTrigger value="injections">
            <Bell className="h-4 w-4 mr-2" />
            Injections
          </TabsTrigger>
        </TabsList>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activité en temps réel</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {getActivityTimeline().map((activity, index) => (
                    <div key={activity.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            activity.type === "injection"
                              ? "bg-amber-100 text-amber-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {activity.type === "injection" ? (
                            <Bell className="h-5 w-5" />
                          ) : (
                            getChannelIcon(activity.subType)
                          )}
                        </div>
                        {index < getActivityTimeline().length - 1 && (
                          <div className="w-px h-full bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {activity.type === "injection"
                                  ? "Injection"
                                  : getChannelLabel(activity.subType)}
                              </Badge>
                              {activity.type === "injection" &&
                                activity.acknowledged && (
                                  <Badge
                                    variant="default"
                                    className="bg-green-500"
                                  >
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Acquitté
                                  </Badge>
                                )}
                            </div>
                            <p className="font-medium">{activity.title}</p>
                            {activity.user && (
                              <p className="text-sm text-muted-foreground">
                                Par {activity.user}
                              </p>
                            )}
                            {activity.recipient && (
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                → À {activity.recipient}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDate(activity.time)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Participants Tab */}
        <TabsContent value="participants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Liste des participants</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {data.simulation.assignments.map((assignment) => (
                    <div
                      key={assignment.userId}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {assignment.user.firstName}{" "}
                            {assignment.user.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {assignment.user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{assignment.role}</Badge>
                        <Badge
                          variant={
                            assignment.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {assignment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communications Tab */}
        <TabsContent value="communications" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(data.communications).map(([type, comms]) => (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {getChannelIcon(type)}
                    {getChannelLabel(type)}
                    <Badge variant="secondary" className="ml-auto">
                      {comms.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-3">
                      {comms.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          Aucune communication
                        </p>
                      ) : (
                        comms.map((comm) => (
                          <div
                            key={comm.id}
                            className="p-3 border rounded-lg space-y-2"
                          >
                            {comm.subject && (
                              <p className="font-medium text-sm">
                                {comm.subject}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {comm.content}
                            </p>
                            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                              <div className="flex items-center justify-between">
                                <span>
                                  De: {comm.sender.firstName}{" "}
                                  {comm.sender.lastName}
                                </span>
                                <span>{formatDate(comm.createdAt)}</span>
                              </div>
                              {comm.recipient && (
                                <span className="text-xs text-blue-600 dark:text-blue-400">
                                  À: {comm.recipient.firstName}{" "}
                                  {comm.recipient.lastName}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Injections Tab */}
        <TabsContent value="injections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Toutes les injections</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {data.injections.map((injection) => (
                    <div
                      key={injection.id}
                      className="p-4 border rounded-lg space-y-2 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors relative"
                      onClick={() => openInjectionDetails(injection.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-stone-950 dark:text-stone-55 truncate max-w-[250px] sm:max-w-md">{injection.title}</h3>
                            {injection.isActive ? (
                              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-[10px] px-1.5 py-0">
                                Actif
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground text-[10px] px-1.5 py-0">
                                Inactif
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{injection.type}</Badge>
                            <Badge variant="secondary">
                              {injection.scenarioName}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            {injection.acknowledged ? (
                              <Badge variant="default" className="bg-green-500">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Acquitté
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Non acquitté
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className={cn(
                                "h-8 w-8 p-0 rounded-full",
                                injection.isActive 
                                  ? "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20" 
                                  : "text-stone-400 hover:text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-900/50"
                              )}
                              onClick={() => toggleInjectionActive(injection.id, injection.isActive)}
                              title={injection.isActive ? "Désactiver" : "Activer"}
                            >
                              {injection.isActive ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(injection.createdAt)}
                          </span>
                        </div>
                      </div>
                      <Separator />
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {injection.content}
                      </p>
                      {(injection.imageUrl || injection.videoUrl) && (
                        <div className="flex gap-2">
                          {injection.imageUrl && (
                            <Badge variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              Image
                            </Badge>
                          )}
                          {injection.videoUrl && (
                            <Badge variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              Vidéo
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Détails Injection */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-[#1C1917] border-stone-200 dark:border-stone-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {loadingDetails ? "Chargement..." : selectedInjection?.title || "Détails de l'injection"}
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500">
              Type: {selectedInjection?.type} · Créé le: {selectedInjection?.createdAt && new Date(selectedInjection.createdAt).toLocaleString("fr-FR")}
            </DialogDescription>
          </DialogHeader>
          
          {loadingDetails ? (
            <div className="py-8 flex justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-stone-400" />
            </div>
          ) : selectedInjection ? (
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <p className="text-xs font-bold text-stone-400 uppercase">Contenu</p>
                <div className="p-3 bg-stone-50 dark:bg-stone-900/50 rounded-lg border border-stone-100 dark:border-stone-800 text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
                  {selectedInjection.content || "Aucun contenu"}
                </div>
              </div>

              {/* Sélection des destinataires */}
              {data?.simulation?.assignments && data.simulation.assignments.length > 0 && (
                <div className="space-y-1 mt-3">
                  <p className="text-xs font-bold text-stone-400 uppercase">Assigner à</p>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto p-2 border border-stone-100 dark:border-stone-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="all"
                        checked={selectedRecipients.length === data.simulation.assignments.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRecipients(data.simulation.assignments.map(a => a.userId));
                          } else {
                            setSelectedRecipients([]);
                          }
                        }}
                        className="rounded border-stone-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor="all" className="text-sm text-stone-700 dark:text-stone-300 font-medium">Tout le monde</label>
                    </div>
                    {data.simulation.assignments.map(a => (
                      <div key={a.userId} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={a.userId}
                          checked={selectedRecipients.includes(a.userId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRecipients([...selectedRecipients, a.userId]);
                            } else {
                              setSelectedRecipients(selectedRecipients.filter(id => id !== a.userId));
                            }
                          }}
                          className="rounded border-stone-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor={a.userId} className="text-sm text-stone-700 dark:text-stone-300">
                          {a.user.firstName} {a.user.lastName} ({a.role})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => {
                    toggleInjectionActive(selectedInjection.id, selectedInjection.isActive, selectedRecipients);
                    setIsDetailsOpen(false);
                  }}
                >
                  {selectedInjection.isActive ? "Désactiver" : "Activer pour les sélectionnés"}
                </Button>
              </div>
              
              {selectedInjection.imageUrl && (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-stone-400 uppercase">Image URL</p>
                  <a href={selectedInjection.imageUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block">
                    {selectedInjection.imageUrl}
                  </a>
                </div>
              )}
              
              {selectedInjection.videoUrl && (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-stone-400 uppercase">Vidéo URL</p>
                  <a href={selectedInjection.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block">
                    {selectedInjection.videoUrl}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-stone-500 py-4">Impossible de charger les détails.</p>
          )}
          
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsDetailsOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── AI Analysis Dialog ─────────────────────────────────────────── */}
      <Dialog open={isAIAnalysisOpen} onOpenChange={setIsAIAnalysisOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Analyse IA — PCA & PGUI SBC</h2>
                <p className="text-violet-200 text-xs">Analyse enrichie avec les documents officiels de l'organisation</p>
              </div>
            </div>
            {aiAnalysis?.meta && (
              <div className="flex items-center gap-2">
                {(aiAnalysis.meta.resourcesUsed as string[])?.map((r: string) => (
                  <span key={r} className="text-xs bg-white/20 text-white px-2 py-1 rounded-full flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> {r}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Loading state */}
            {isRunningAIAnalysis && !aiAnalysis && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin" />
                  <Brain className="h-6 w-6 text-violet-600 absolute inset-0 m-auto" />
                </div>
                <p className="text-muted-foreground font-medium">Analyse en cours avec PCA & PGUI SBC...</p>
                <p className="text-xs text-muted-foreground">Cela peut prendre 30 à 60 secondes</p>
              </div>
            )}

            {/* Results */}
            {aiAnalysis && (
              <div className="p-6 space-y-6">
                {/* Score global banner */}
                <div className="flex items-center gap-6 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50 border border-indigo-100">
                  <div className="flex-shrink-0 text-center">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                      style={{
                        background: (aiAnalysis.scoreGlobal ?? 0) >= 80
                          ? "linear-gradient(135deg,#16a34a,#0f6e56)"
                          : (aiAnalysis.scoreGlobal ?? 0) >= 60
                          ? "linear-gradient(135deg,#d97706,#b45309)"
                          : "linear-gradient(135deg,#dc2626,#991b1b)",
                      }}
                    >
                      {aiAnalysis.scoreGlobal ?? "—"}
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground mt-1">Score global</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-lg">{aiAnalysis.niveauMaturite}</span>
                      <Badge className={cn(
                        "text-xs",
                        (aiAnalysis.scoreGlobal ?? 0) >= 80 ? "bg-green-100 text-green-800" :
                        (aiAnalysis.scoreGlobal ?? 0) >= 60 ? "bg-amber-100 text-amber-800" :
                        "bg-red-100 text-red-800"
                      )}>
                        Conformité PCA: {aiAnalysis.conformitePCA?.score ?? "—"}/100
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{aiAnalysis.syntheseExecutive}</p>
                  </div>
                  {aiAnalysis.meta && (
                    <div className="flex-shrink-0 text-right text-xs text-muted-foreground space-y-0.5">
                      <p>{aiAnalysis.meta.totalInjects} injects</p>
                      <p>{aiAnalysis.meta.totalCommunications} messages</p>
                      <p>{aiAnalysis.meta.totalParticipants} participants</p>
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <Tabs value={aiAnalysisTab} onValueChange={setAiAnalysisTab}>
                  <TabsList className="grid grid-cols-5 w-full">
                    <TabsTrigger value="synthese" className="text-xs gap-1"><Star className="h-3 w-3" /> Synthèse</TabsTrigger>
                    <TabsTrigger value="conformite" className="text-xs gap-1"><Shield className="h-3 w-3" /> PCA/PGUI</TabsTrigger>
                    <TabsTrigger value="injects" className="text-xs gap-1"><Zap className="h-3 w-3" /> Injects</TabsTrigger>
                    <TabsTrigger value="participants" className="text-xs gap-1"><Users className="h-3 w-3" /> Participants</TabsTrigger>
                    <TabsTrigger value="recommandations" className="text-xs gap-1"><Target className="h-3 w-3" /> Plan d'action</TabsTrigger>
                  </TabsList>

                  {/* SYNTHÈSE TAB */}
                  <TabsContent value="synthese" className="mt-4 space-y-4">
                    {/* Gestion du temps */}
                    {aiAnalysis.gestionTemps && (
                      <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <p className="font-semibold text-sm">Gestion du temps</p>
                            <Badge className={aiAnalysis.gestionTemps.respectRTO ? "bg-green-100 text-green-800 ml-auto" : "bg-red-100 text-red-800 ml-auto"}>
                              {aiAnalysis.gestionTemps.respectRTO ? "RTO respecté" : "RTO dépassé"}
                            </Badge>
                          </div>
                          {aiAnalysis.gestionTemps.delaiMoyenReaction != null && (
                            <p className="text-2xl font-bold text-blue-600 mb-1">{aiAnalysis.gestionTemps.delaiMoyenReaction} min <span className="text-sm font-normal text-muted-foreground">délai moyen de réaction</span></p>
                          )}
                          <p className="text-sm text-muted-foreground">{aiAnalysis.gestionTemps.analyse}</p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Communication de crise */}
                    {aiAnalysis.communicationCrise && (
                      <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <MessageSquare className="h-4 w-4 text-amber-600" />
                            <p className="font-semibold text-sm">Communication de crise</p>
                            <span className="ml-auto font-bold text-amber-600">{aiAnalysis.communicationCrise.score}/100</span>
                          </div>
                          <Progress value={aiAnalysis.communicationCrise.score} className="h-2 mb-3" />
                          <div className="flex gap-4 text-xs mb-2">
                            <span className={aiAnalysis.communicationCrise.chaineDActivationRespectee ? "text-green-700" : "text-red-600"}>
                              {aiAnalysis.communicationCrise.chaineDActivationRespectee ? "✓" : "✗"} Chaîne d'activation
                            </span>
                            <span className={aiAnalysis.communicationCrise.communicationExterneConforme ? "text-green-700" : "text-red-600"}>
                              {aiAnalysis.communicationCrise.communicationExterneConforme ? "✓" : "✗"} Communication externe
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{aiAnalysis.communicationCrise.analyse}</p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Points critiques */}
                    {aiAnalysis.pointsCritiques?.length > 0 && (
                      <div className="space-y-2">
                        <p className="font-semibold text-sm flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" /> Points critiques identifiés
                        </p>
                        {aiAnalysis.pointsCritiques.map((pt: any, i: number) => (
                          <div key={i} className={cn(
                            "border rounded-xl p-3 text-sm",
                            pt.priorite === "HAUTE" ? "border-red-200 bg-red-50" :
                            pt.priorite === "MOYENNE" ? "border-amber-200 bg-amber-50" :
                            "border-blue-200 bg-blue-50"
                          )}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{pt.titre}</span>
                              <Badge className={cn("text-xs ml-auto", pt.priorite === "HAUTE" ? "bg-red-200 text-red-800" : pt.priorite === "MOYENNE" ? "bg-amber-200 text-amber-800" : "bg-blue-200 text-blue-800")}>
                                {pt.priorite}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-xs">{pt.description}</p>
                            {pt.reference && <p className="text-xs font-mono text-purple-700 mt-1 italic">→ {pt.reference}</p>}
                            {pt.recommandation && <p className="text-xs text-green-700 mt-1 font-medium">✓ {pt.recommandation}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Conclusion instructeur */}
                    {aiAnalysis.conclusionInstructeur && (
                      <Card className="bg-indigo-50 border-indigo-200">
                        <CardContent className="p-4">
                          <p className="font-semibold text-sm text-indigo-900 mb-2 flex items-center gap-2">
                            <Brain className="h-4 w-4" /> Conclusion pour l'instructeur
                          </p>
                          <p className="text-sm text-indigo-800 leading-relaxed">{aiAnalysis.conclusionInstructeur}</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* CONFORMITÉ PCA/PGUI TAB */}
                  <TabsContent value="conformite" className="mt-4 space-y-4">
                    {aiAnalysis.conformitePCA && (
                      <>
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border">
                          <div className="text-center">
                            <p className="text-3xl font-bold" style={{ color: (aiAnalysis.conformitePCA.score ?? 0) >= 70 ? "#16a34a" : (aiAnalysis.conformitePCA.score ?? 0) >= 50 ? "#d97706" : "#dc2626" }}>
                              {aiAnalysis.conformitePCA.score ?? "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">/ 100</p>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm mb-1">Score de conformité PCA/PGUI</p>
                            <Progress value={aiAnalysis.conformitePCA.score} className="h-2.5" />
                          </div>
                        </div>

                        {aiAnalysis.conformitePCA.proceduresRespectees?.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold flex items-center gap-2 text-green-700"><CheckCircle2 className="h-4 w-4" /> Procédures respectées</p>
                            {aiAnalysis.conformitePCA.proceduresRespectees.map((p: string, i: number) => (
                              <div key={i} className="flex gap-2 p-2 bg-green-50 rounded-lg text-xs text-green-800">
                                <span className="text-green-500 flex-shrink-0">✓</span><span>{p}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {aiAnalysis.conformitePCA.proceduresNonRespectees?.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold flex items-center gap-2 text-red-700"><XCircle className="h-4 w-4" /> Procédures non respectées</p>
                            {aiAnalysis.conformitePCA.proceduresNonRespectees.map((p: string, i: number) => (
                              <div key={i} className="flex gap-2 p-2 bg-red-50 rounded-lg text-xs text-red-800">
                                <span className="text-red-500 flex-shrink-0">✗</span><span>{p}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {aiAnalysis.conformitePCA.ecartsIdentifies?.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold flex items-center gap-2 text-amber-700"><AlertTriangle className="h-4 w-4" /> Écarts identifiés</p>
                            {aiAnalysis.conformitePCA.ecartsIdentifies.map((e: string, i: number) => (
                              <div key={i} className="flex gap-2 p-2 bg-amber-50 rounded-lg text-xs text-amber-800">
                                <span className="flex-shrink-0">→</span><span>{e}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>

                  {/* INJECTS TAB */}
                  <TabsContent value="injects" className="mt-4 space-y-3">
                    {aiAnalysis.analyseInjects?.length > 0 ? aiAnalysis.analyseInjects.map((inj: any, i: number) => (
                      <div key={i} className="border rounded-xl p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold",
                            (inj.conformitePlan ?? 0) >= 70 ? "bg-green-100 text-green-700" :
                            (inj.conformitePlan ?? 0) >= 40 ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"
                          )}>
                            {inj.conformitePlan ?? "—"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">{inj.titre}</span>
                              <Badge variant="outline" className="text-xs">{inj.type}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{inj.reponseEquipe}</p>
                            {inj.proceduреApplicable && (
                              <p className="text-xs font-mono text-purple-700 italic bg-purple-50 px-2 py-1 rounded">📋 {inj.proceduреApplicable}</p>
                            )}
                            {inj.ecart && (
                              <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {inj.ecart}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-10 text-muted-foreground">
                        <Zap className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Aucune analyse d'inject disponible</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* PARTICIPANTS TAB */}
                  <TabsContent value="participants" className="mt-4 space-y-3">
                    {aiAnalysis.analyseParticipants?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {aiAnalysis.analyseParticipants.map((p: any, i: number) => (
                          <Card key={i} className="shadow-sm">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                  style={{ background: (p.scoreGlobal ?? 0) >= 70 ? "#16a34a" : (p.scoreGlobal ?? 0) >= 50 ? "#d97706" : "#dc2626" }}>
                                  {p.nom?.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-sm">{p.nom}</p>
                                  <p className="text-xs text-muted-foreground">{p.role}</p>
                                </div>
                                <span className="text-xl font-bold" style={{ color: (p.scoreGlobal ?? 0) >= 70 ? "#16a34a" : (p.scoreGlobal ?? 0) >= 50 ? "#d97706" : "#dc2626" }}>
                                  {p.scoreGlobal ?? "—"}
                                </span>
                              </div>
                              {p.conformiteRole && (
                                <p className="text-xs text-muted-foreground italic mb-2 bg-slate-50 p-2 rounded">{p.conformiteRole}</p>
                              )}
                              {p.pointsForts?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-1">
                                  {p.pointsForts.map((f: string, j: number) => (
                                    <span key={j} className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">✓ {f}</span>
                                  ))}
                                </div>
                              )}
                              {p.pointsAmeliorer?.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {p.pointsAmeliorer.map((a: string, j: number) => (
                                    <span key={j} className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">→ {a}</span>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Aucune analyse participant disponible</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* RECOMMANDATIONS TAB */}
                  <TabsContent value="recommandations" className="mt-4 space-y-4">
                    {aiAnalysis.recommandations?.length > 0 && (
                      <div className="space-y-3">
                        <p className="font-semibold text-sm flex items-center gap-2 text-blue-700">
                          <Target className="h-4 w-4" /> Plan d'amélioration
                        </p>
                        {aiAnalysis.recommandations.map((r: any, i: number) => (
                          <div key={i} className="border rounded-xl p-3 bg-blue-50/50 border-blue-100">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">{r.domaine}</span>
                              <Badge className={cn(
                                "text-xs ml-auto",
                                r.echeance === "IMMEDIAT" ? "bg-red-100 text-red-800" :
                                r.echeance === "1_MOIS" ? "bg-orange-100 text-orange-800" :
                                r.echeance === "3_MOIS" ? "bg-amber-100 text-amber-800" :
                                "bg-blue-100 text-blue-800"
                              )}>
                                {r.echeance?.replace("_", " ")}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{r.action}</p>
                            {r.referencePCA && (
                              <p className="text-xs font-mono text-purple-700 mt-1 italic">📋 {r.referencePCA}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {aiAnalysis.prochainExercice && (
                      <Card className="border-2 border-dashed border-indigo-200 bg-indigo-50/30">
                        <CardContent className="p-4 space-y-3">
                          <p className="font-semibold text-sm flex items-center gap-2 text-indigo-700">
                            <Star className="h-4 w-4" /> Prochain exercice recommandé
                          </p>
                          {aiAnalysis.prochainExercice.focusPrioritaire?.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Focus prioritaire</p>
                              {aiAnalysis.prochainExercice.focusPrioritaire.map((f: string, i: number) => (
                                <div key={i} className="flex items-start gap-2 text-xs text-indigo-800 mb-1">
                                  <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" /><span>{f}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {aiAnalysis.prochainExercice.scenariosRecommandes?.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Scénarios recommandés</p>
                              {aiAnalysis.prochainExercice.scenariosRecommandes.map((s: string, i: number) => (
                                <div key={i} className="flex items-start gap-2 text-xs text-indigo-800 mb-1">
                                  <Zap className="h-3 w-3 mt-0.5 flex-shrink-0" /><span>{s}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>

          <div className="border-t px-6 py-3 flex justify-between items-center flex-shrink-0 bg-slate-50">
            <p className="text-xs text-muted-foreground">
              {aiAnalysis?.meta?.generatedAt
                ? `Généré le ${new Date(aiAnalysis.meta.generatedAt).toLocaleString("fr-FR")}`
                : ""}
            </p>
            <Button variant="outline" size="sm" onClick={() => setIsAIAnalysisOpen(false)}>Fermer</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
