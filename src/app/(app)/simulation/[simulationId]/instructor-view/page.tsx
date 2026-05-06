"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RealTimeSummaryModal } from "@/components/RealTimeSummaryModal";
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
} from "lucide-react";
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

      // Rediriger vers la page de rapport
      window.open(`/simulation/${simulationId}/report`, "_blank");

      toast({
        title: "Rapport ouvert",
        description:
          "Le rapport de simulation a été ouvert dans un nouvel onglet",
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
                      className="p-4 border rounded-lg space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold">{injection.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{injection.type}</Badge>
                            <Badge variant="secondary">
                              {injection.scenarioName}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
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
                          <span className="text-xs text-muted-foreground">
                            {formatDate(injection.createdAt)}
                          </span>
                        </div>
                      </div>
                      <Separator />
                      <p className="text-sm text-muted-foreground">
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
    </div>
  );
}
