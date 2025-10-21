"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { InjectionDetailModal } from "@/components/InjectionDetailModal";
import {
  Users,
  MessageSquare,
  Bell,
  TrendingUp,
  Activity,
  Mail,
  Send,
  Phone,
  AlertTriangle,
  Newspaper,
  Radio,
  Globe,
  CheckCircle2,
  Clock,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";

interface RealTimeSummaryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  simulationId: string;
}

interface SummaryData {
  simulation: {
    id: string;
    title: string;
    status: string;
    startDate: string;
    endDate: string;
  };
  timestamp: string;
  overview: {
    totalParticipants: number;
    activeParticipants: number;
    totalInjections: number;
    acknowledgedInjections: number;
    pendingInjections: number;
    totalCommunications: number;
    acknowledgementRate: number;
  };
  injections: {
    total: number;
    acknowledged: number;
    pending: number;
    byType: Record<string, number>;
    recent: Array<{
      id: string;
      title: string;
      content?: string | null;
      type: string;
      acknowledged: boolean;
      createdAt: string;
      imageUrl?: string;
      videoUrl?: string;
      scenario?: {
        name: string;
      };
    }>;
  };
  communications: {
    total: number;
    byType: Record<string, number>;
    byParticipant: Record<string, { sent: number; received: number }>;
    recent: Array<{
      id: string;
      type: string;
      subject?: string;
      sender: string;
      recipient: string;
      createdAt: string;
    }>;
  };
  participants: Array<{
    user: {
      id: string;
      name: string;
      email: string;
    };
    role: string;
    status: string;
    communicationsSent: number;
    communicationsReceived: number;
    injectionsAcknowledged: number;
    lastActivity: string | null;
  }>;
  recentActivity: Array<{
    type: "communication" | "injection_acknowledged";
    subType: string;
    title: string;
    user?: string;
    recipient?: string;
    timestamp: string;
  }>;
}

export function RealTimeSummaryModal({
  open,
  onOpenChange,
  simulationId,
}: RealTimeSummaryProps) {
  const [data, setData] = React.useState<SummaryData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedInjection, setSelectedInjection] = React.useState<SummaryData["injections"]["recent"][0] | null>(null);
  const [injectionDetailOpen, setInjectionDetailOpen] = React.useState(false);

  const fetchSummary = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/simulations/${simulationId}/real-time-summary`);
      if (!response.ok) throw new Error("Erreur lors du chargement");
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger le résumé");
    } finally {
      setLoading(false);
    }
  }, [simulationId]);

  React.useEffect(() => {
    if (open) {
      fetchSummary();
    }
  }, [open, fetchSummary]);

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-3 w-3" />;
      case "sms":
        return <Send className="h-3 w-3" />;
      case "call":
        return <Phone className="h-3 w-3" />;
      case "alert":
        return <AlertTriangle className="h-3 w-3" />;
      case "memo":
        return <MessageSquare className="h-3 w-3" />;
      case "newsBroadcast":
        return <Radio className="h-3 w-3" />;
      case "newspaper":
        return <Newspaper className="h-3 w-3" />;
      case "social":
        return <Globe className="h-3 w-3" />;
      default:
        return <MessageSquare className="h-3 w-3" />;
    }
  };

  const getChannelLabel = (type: string) => {
    const labels: Record<string, string> = {
      email: "Email",
      EMAIL: "Email",
      sms: "SMS",
      SMS: "SMS",
      call: "Appel",
      CALL: "Appel",
      alert: "Alerte",
      ALERT: "Alerte",
      memo: "WhatsApp",
      MEMO: "WhatsApp",
      newsBroadcast: "Actualités",
      NEWS_BROADCAST: "Actualités",
      newspaper: "Journal",
      NEWSPAPER: "Journal",
      social: "Réseaux Sociaux",
      SOCIAL: "Réseaux Sociaux",
      OTHER: "Autre",
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: fr,
    });
  };

  const handleInjectionClick = (injection: SummaryData["injections"]["recent"][0]) => {
    setSelectedInjection(injection);
    setInjectionDetailOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Résumé en Temps Réel
          </DialogTitle>
          {data && (
            <p className="text-sm text-muted-foreground">
              Dernière mise à jour: {formatDate(data.timestamp)}
            </p>
          )}
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchSummary} variant="outline" className="mt-4">
              Réessayer
            </Button>
          </div>
        )}

        {data && !loading && (
          <ScrollArea className="h-[70vh] pr-4">
            <div className="space-y-6">
              {/* Vue d'ensemble */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Vue d&apos;ensemble</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        Participants
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{data.overview.totalParticipants}</p>
                      <p className="text-xs text-muted-foreground">
                        {data.overview.activeParticipants} actifs
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Bell className="h-4 w-4 text-amber-500" />
                        Injections
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{data.overview.totalInjections}</p>
                      <p className="text-xs text-muted-foreground">
                        {data.overview.acknowledgedInjections} acquittées
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-green-500" />
                        Communications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{data.overview.totalCommunications}</p>
                      <p className="text-xs text-muted-foreground">messages envoyés</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                        Taux acquit.
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{data.overview.acknowledgementRate}%</p>
                      <p className="text-xs text-muted-foreground">performance</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              {/* Injections récentes */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Injections récentes</h3>
                <div className="space-y-2">
                  {data.injections.recent.map((injection) => (
                    <div
                      key={injection.id}
                      onClick={() => handleInjectionClick(injection)}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded bg-amber-100 text-amber-600">
                          <Bell className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{injection.title}</p>
                          <Badge variant="outline" className="mt-1">
                            {getChannelLabel(injection.type)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {injection.acknowledged ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Acquittée
                          </Badge>
                        ) : (
                          <Badge variant="secondary">En attente</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(injection.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {data.injections.recent.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucune injection récente
                    </p>
                  )}
                </div>

                {/* Statistiques par type */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Par type</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(data.injections.byType).map(([type, count]) => (
                      <Badge key={type} variant="outline" className="flex items-center gap-1">
                        {getChannelIcon(type)}
                        {getChannelLabel(type)}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Communications récentes */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Communications récentes</h3>
                <div className="space-y-2">
                  {data.communications.recent.slice(0, 5).map((comm) => (
                    <div
                      key={comm.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded bg-blue-100 text-blue-600">
                          {getChannelIcon(comm.type)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {comm.subject || "Sans sujet"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            De: {comm.sender} → À: {comm.recipient}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge variant="outline">{getChannelLabel(comm.type)}</Badge>
                        <span className="text-xs text-muted-foreground mt-1">
                          {formatDate(comm.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {data.communications.recent.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucune communication récente
                    </p>
                  )}
                </div>

                {/* Statistiques par type */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Par canal</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(data.communications.byType).map(([type, count]) => (
                      <Badge key={type} variant="outline" className="flex items-center gap-1">
                        {getChannelIcon(type)}
                        {getChannelLabel(type)}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Participants les plus actifs */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Participants les plus actifs</h3>
                <div className="space-y-2">
                  {data.participants.slice(0, 5).map((participant) => (
                    <div
                      key={participant.user.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{participant.user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {participant.user.email}
                          </p>
                          <Badge variant="outline" className="mt-1">
                            {participant.role}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            <Send className="h-3 w-3 mr-1" />
                            {participant.communicationsSent} envoyés
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            <Bell className="h-3 w-3 mr-1" />
                            {participant.injectionsAcknowledged} acquittées
                          </Badge>
                        </div>
                        {participant.lastActivity && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDate(participant.lastActivity)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Activité récente */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Timeline d&apos;activité</h3>
                <div className="space-y-3">
                  {data.recentActivity.map((activity, index) => (
                    <div key={index} className="flex gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          activity.type === "injection_acknowledged"
                            ? "bg-green-100 text-green-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {activity.type === "injection_acknowledged" ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          getChannelIcon(activity.subType)
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">{activity.title}</p>
                            {activity.user && (
                              <p className="text-xs text-muted-foreground">
                                Par {activity.user}
                              </p>
                            )}
                            {activity.recipient && (
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                → À {activity.recipient}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bouton rafraîchir */}
              <div className="flex justify-center pt-4">
                <Button onClick={fetchSummary} variant="outline" disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Rafraîchir
                </Button>
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>

      {/* Injection Detail Modal */}
      <InjectionDetailModal
        open={injectionDetailOpen}
        onOpenChange={setInjectionDetailOpen}
        injection={selectedInjection}
      />
    </Dialog>
  );
}

// Add React import
import * as React from "react";
