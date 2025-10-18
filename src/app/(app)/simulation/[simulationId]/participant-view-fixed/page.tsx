"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
// Import potential icons (example using lucide-react, assuming it's available)
import AlertComposeForm from "@/components/participant-mode/communication-forms/AlertComposeForm";
import CallComposeForm from "@/components/participant-mode/communication-forms/CallComposeForm";
import EmailComposeForm from "@/components/participant-mode/communication-forms/EmailComposeForm";
import MemoComposeForm from "@/components/participant-mode/communication-forms/MemoComposeForm";
import NewsBroadcastComposeForm from "@/components/participant-mode/communication-forms/NewsBroadcastComposeForm";
import NewspaperComposeForm from "@/components/participant-mode/communication-forms/NewspaperComposeForm";
import SmsComposeForm from "@/components/participant-mode/communication-forms/SmsComposeForm";
import SocialComposeForm from "@/components/participant-mode/communication-forms/SocialComposeForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Check,
  ChevronLeft,
  FileText,
  Mail,
  MessageSquare,
  Newspaper,
  Phone,
  Rss,
  Users,
} from "lucide-react";
import Image from "next/image";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";

import type { AlertFormData } from "@/components/participant-mode/communication-forms/AlertComposeForm";
import type { CallFormData } from "@/components/participant-mode/communication-forms/CallComposeForm";
import type { EmailFormData } from "@/components/participant-mode/communication-forms/EmailComposeForm";
import type { MemoFormData } from "@/components/participant-mode/communication-forms/MemoComposeForm";
import type { NewsBroadcastFormData } from "@/components/participant-mode/communication-forms/NewsBroadcastComposeForm";
import type { NewspaperFormData } from "@/components/participant-mode/communication-forms/NewspaperComposeForm";
import type { SmsFormData } from "@/components/participant-mode/communication-forms/SmsComposeForm";
import type { SocialFormData } from "@/components/participant-mode/communication-forms/SocialComposeForm";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: string;
  planTasks: PlanTask[];
  type: {
    id: string;
    name: string;
    description: string | null;
  };
}

interface PlanTask {
  id: string;
  planId: string;
  taskId: string;
  task: Task;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string | null;
  role: string | null;
}

interface Simulation {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: string;
  assignmentStatus: string;
  createdAt: string;
}

interface Communication {
  id: string;
  type: string;
  content: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  recipient?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  subject?: string;
}

interface Injection {
  id: string;
  title: string;
  content: string;
  scenarioName: string;
  createdAt: string;
  acknowledged: boolean;
  type: string;
  imageUrl?: string;
  videoUrl?: string;
  attachments?: {
    type: string;
    url: string;
    name: string;
  }[];
}

interface ParticipantViewData {
  simulation: Simulation;
  counts: {
    email: number;
    call: number;
    sms: number;
    alert: number;
    memo: number;
    newsBroadcast: number;
    newspaper: number;
    social: number;
  };
  communications: {
    email: Communication[];
    call: Communication[];
    sms: Communication[];
    alert: Communication[];
    memo: Communication[];
    newsBroadcast: Communication[];
    newspaper: Communication[];
    social: Communication[];
  };
  injections: Injection[];
  tasks: Task[];
}

// Helper component for a communication channel card
function CommunicationChannelCard({
  title,
  count,
  onClick,
  icon: Icon,
}: {
  title: string;
  count: number;
  onClick: () => void;
  icon: React.ElementType;
}) {
  return (
    <Card
      className="flex flex-col items-start p-4 space-y-2 bg-background text-foreground shadow-md hover:bg-accent transition-colors rounded-xl border border-muted cursor-pointer"
      onClick={onClick}
    >
      <div className="text-3xl text-primary">{Icon && <Icon size={32} />}</div>
      <div className="flex items-center justify-between w-full">
        <span className="text-lg font-semibold">{title}</span>
        {count > 0 && (
          <span
            className={`rounded-full px-3 py-1 text-sm font-bold bg-muted text-foreground border border-muted`}
          >
            {count}
          </span>
        )}
      </div>
    </Card>
  );
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const getIconForType = (type: string) => {
  switch (type.toLowerCase()) {
    case "email":
      return <Mail className="mr-2 h-4 w-4" />;
    case "sms":
      return <MessageSquare className="mr-2 h-4 w-4" />;
    case "call":
      return <Phone className="mr-2 h-4 w-4" />;
    case "alert":
      return <Bell className="mr-2 h-4 w-4" />;
    case "memo":
      return <WhatsAppIcon className="mr-2 h-4 w-4" />;
    case "newsbroadcast":
      return <Newspaper className="mr-2 h-4 w-4" />;
    case "newspaper":
      return <Rss className="mr-2 h-4 w-4" />;
    case "social":
      return <Users className="mr-2 h-4 w-4" />;
    default:
      return null;
  }
};

export default function ParticipantViewFixedPage() {
  const params = useParams();
  const simulationId = params.simulationId as string;
  const { toast } = useToast();
  const [data, setData] = useState<ParticipantViewData | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<
    keyof ParticipantViewData["communications"] | null
  >(null);
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [isComposing, setIsComposing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const [selectedInjection, setSelectedInjection] = useState<Injection | null>(
    null
  );

  const fetchData = useCallback(async () => {
    if (!simulationId) {
      console.log("simulationId is not available yet.");
      return;
    }

    console.log(`Fetching data for simulationId: ${simulationId}`);
    const apiUrl = `/api/simulations/${simulationId}/participant-view`;
    console.log(`API URL: ${apiUrl}`);

    try {
      const response = await fetch(apiUrl);
      console.log("API Response status (ok):", response.ok);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Response Error Text:", errorText);
        throw new Error("Failed to fetch simulation data");
      }
      const data = await response.json();
      console.log("Fetched data:", data);
      setData(data);
    } catch (error: unknown) {
      console.error("Error fetching data:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de la simulation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [simulationId, toast]);

  const fetchPlans = useCallback(async () => {
    try {
      const response = await fetch("/api/plans");
      if (!response.ok) {
        throw new Error("Failed to fetch plans");
      }
      const data = await response.json();
      setPlans(data);
      console.log("Fetched plans:", data);
    } catch (error: unknown) {
      console.error("Error fetching plans:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les plans.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
    fetchPlans(); // Fetch plans on component mount
  }, [fetchData, fetchPlans]);

  useEffect(() => {
    if (selectedPlanId) {
      const plan = plans.find((p) => p.id === selectedPlanId);
      setSelectedPlan(plan || null);
    } else {
      setSelectedPlan(null);
    }
  }, [selectedPlanId, plans]);

  const handleChannelClick = (
    channel: keyof ParticipantViewData["communications"]
  ) => {
    setSelectedChannel(channel);
    setIsComposing(false);
  };

  const handleAcknowledgeInjection = async (injectionId: string) => {
    try {
      const response = await fetch(
        `/api/simulations/${simulationId}/injections/${injectionId}/acknowledge`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to acknowledge injection");
      }

      setData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          injections: prev.injections.map((injection) =>
            injection.id === injectionId
              ? { ...injection, acknowledged: true }
              : injection
          ),
        };
      });

      toast({
        title: "Succès",
        description: "Injection marquée comme lue.",
      });
    } catch (error: unknown) {
      console.error("Error acknowledging injection:", error);
      toast({
        title: "Erreur",
        description: `Impossible de marquer l'injection comme lue: ${
          error instanceof Error ? error.message : ""
        }`,
        variant: "destructive",
      });
    }
  };

  const handleComposeClick = () => {
    setIsComposing(true);
  };

  // Helper to normalize recipient id (handles string or string[])
  const normalizeRecipientId = (to: string | string[] | undefined | null) => {
    if (!to) return null;
    if (Array.isArray(to)) return to.length === 0 ? null : to[0];
    return to === "" ? null : to;
  };

  const handleEmailSubmit = async (formData: EmailFormData) => {
    try {
      const requestBody = {
        type: "email",
        subject: formData.subject,
        content: formData.body,
        recipientId: normalizeRecipientId(formData.to),
        payload: null,
      };

      const response = await fetch(
        `/api/simulations/${simulationId}/communications`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) throw new Error("Failed to send email");

      toast({ title: "Succès", description: "Email envoyé avec succès." });
      setIsComposing(false);
      setData(null);
      setLoading(true);
      fetchData();
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'email.",
        variant: "destructive",
      });
    }
  };

  const handleSmsSubmit = async (formData: SmsFormData) => {
    try {
      const requestBody = {
        type: "sms",
        content: formData.body,
        recipientId: normalizeRecipientId(formData.to),
        payload: null,
      };

      const response = await fetch(
        `/api/simulations/${simulationId}/communications`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) throw new Error("Failed to send SMS");

      toast({ title: "Succès", description: "SMS envoyé avec succès." });
      setIsComposing(false);
      setData(null);
      setLoading(true);
      fetchData();
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le SMS.",
        variant: "destructive",
      });
    }
  };

  const handleSocialSubmit = async (formData: SocialFormData) => {
    try {
      const requestBody = {
        type: "social",
        content: formData.content,
        platform: formData.platform,
        payload: null,
      };

      const response = await fetch(
        `/api/simulations/${simulationId}/communications`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) throw new Error("Failed to send social message");

      toast({
        title: "Succès",
        description: "Message social envoyé avec succès.",
      });
      setIsComposing(false);
      setData(null);
      setLoading(true);
      fetchData();
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message social.",
        variant: "destructive",
      });
    }
  };

  const handleMemoSubmit = async (formData: MemoFormData) => {
    try {
      if (formData.to && formData.to.length > 0) {
        if (
          !formData.recipientPhones ||
          formData.to.length !== formData.recipientPhones.length
        ) {
          throw new Error("Erreur dans la liste des destinataires");
        }

        const results = await Promise.allSettled(
          formData.to.map((recipientId, index) => {
            const phone = formData.recipientPhones?.[index] || undefined;
            const requestBody = {
              type: "memo",
              subject: formData.subject,
              content: formData.content,
              recipientId: recipientId === "" ? null : recipientId,
              payload: phone ? { phone } : null,
            };

            return fetch(`/api/simulations/${simulationId}/communications`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(requestBody),
            });
          })
        );

        const errors = results.filter(
          (r): r is PromiseRejectedResult => r.status === "rejected"
        );

        if (errors.length > 0) {
          throw new Error(
            `Échec de l'envoi à ${errors.length} destinataire(s) sur ${formData.to.length}`
          );
        }

        toast({
          title: "Succès",
          description: `WhatsApp envoyé(s) à ${formData.to.length} destinataire(s)`,
        });
      } else {
        const requestBody = {
          type: "memo",
          subject: formData.subject,
          content: formData.content,
          payload: formData.phone ? { phone: formData.phone } : null,
        };

        const response = await fetch(
          `/api/simulations/${simulationId}/communications`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          }
        );

        if (!response.ok) throw new Error("Failed to send memo");

        toast({ title: "Succès", description: "WhatsApp envoyé avec succès." });
      }

      setIsComposing(false);
      setData(null);
      setLoading(true);
      fetchData();
    } catch (error: unknown) {
      console.error("Erreur lors de l'envoi du WhatsApp:", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible d'envoyer le WhatsApp.",
        variant: "destructive",
      });
    }
  };

  const handleNewsBroadcastSubmit = async (formData: NewsBroadcastFormData) => {
    try {
      const requestBody = {
        type: "newsBroadcast",
        subject: formData.title,
        content: formData.content,
        payload: null,
      };

      const response = await fetch(
        `/api/simulations/${simulationId}/communications`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) throw new Error("Failed to send news broadcast");

      toast({
        title: "Succès",
        description: "Diffusion de nouvelles envoyée avec succès.",
      });
      setIsComposing(false);
      setData(null);
      setLoading(true);
      fetchData();
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la diffusion de nouvelles.",
        variant: "destructive",
      });
    }
  };

  const handleAlertSubmit = async (formData: AlertFormData) => {
    try {
      const requestBody = {
        type: "alert",
        subject: formData.subject,
        content: formData.message,
        payload: null,
      };

      const response = await fetch(
        `/api/simulations/${simulationId}/communications`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) throw new Error("Failed to send alert");

      toast({ title: "Succès", description: "Alerte envoyée avec succès." });
      setIsComposing(false);
      setData(null);
      setLoading(true);
      fetchData();
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'alerte.",
        variant: "destructive",
      });
    }
  };

  const handleCallSubmit = async (formData: CallFormData) => {
    try {
      const requestBody = {
        type: "call",
        content: formData.notes,
        recipientId: normalizeRecipientId(formData.to),
        senderId: formData.from === "" ? null : formData.from,
        payload: null,
      };

      const response = await fetch(
        `/api/simulations/${simulationId}/communications`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) throw new Error("Failed to send call");

      toast({ title: "Succès", description: "Appel enregistré avec succès." });
      setIsComposing(false);
      setData(null);
      setLoading(true);
      fetchData();
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer l'appel.",
        variant: "destructive",
      });
    }
  };

  const handleNewspaperSubmit = async (formData: NewspaperFormData) => {
    try {
      const requestBody = {
        type: "newspaper",
        subject: formData.title,
        content: formData.content,
        payload: null,
      };

      const response = await fetch(
        `/api/simulations/${simulationId}/communications`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) throw new Error("Failed to send newspaper article");

      toast({
        title: "Succès",
        description: "Article de journal envoyé avec succès.",
      });
      setIsComposing(false);
      setData(null);
      setLoading(true);
      fetchData();
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'article de journal.",
        variant: "destructive",
      });
    }
  };

  type CombinedContentItem = {
    id: string;
    type: string;
    content: string;
    createdAt: string;
    isInjection: boolean;
    title?: string;
    subject?: string;
    sender?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    recipient?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    scenarioName?: string;
    acknowledged?: boolean;
    imageUrl?: string;
    videoUrl?: string;
    attachments?: {
      type: string;
      url: string;
      name: string;
    }[];
  };

  const renderContentForChannel = (
    channelType: keyof ParticipantViewData["communications"]
  ) => {
    if (!data) return null;

    const channelCommunications = data.communications[channelType];
    const channelInjections = data.injections.filter(
      (inj) => inj.type.toLowerCase() === channelType.toLowerCase()
    );

    const combinedContent: CombinedContentItem[] = [
      ...channelCommunications.map((comm) => ({
        ...comm,
        isInjection: false as const,
      })),
      ...channelInjections.map((inj) => ({
        ...inj,
        isInjection: true as const,
      })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (combinedContent.length === 0) {
      return (
        <p className="text-muted-foreground">Aucun contenu pour ce canal.</p>
      );
    }

    return (
      <div className="space-y-4">
        {combinedContent.map((item) => (
          <div
            key={item.id}
            className={`flex gap-4 items-start rounded-xl shadow-md bg-background text-foreground border border-muted p-4 hover:bg-accent transition-all duration-150 cursor-pointer`}
            tabIndex={0}
            aria-label={
              item.isInjection
                ? `Injection ${item.title}`
                : `Communication ${item.subject || ""}`
            }
            onClick={() =>
              item.isInjection
                ? setSelectedInjection(item as Injection)
                : undefined
            }
          >
            <div className="flex-shrink-0 mt-1">
              {getIconForType(item.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center gap-2">
                <span className="font-bold text-base truncate">
                  {item.isInjection ? item.title : item.subject || "Sans sujet"}
                </span>
                <span className="text-xs bg-muted text-foreground px-2 py-0.5 rounded-full border border-muted ml-2">
                  {formatDate(item.createdAt)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                {item.sender && (
                  <span>
                    De :{" "}
                    <b>
                      {item.sender.firstName} {item.sender.lastName}
                    </b>
                  </span>
                )}
                {item.recipient && (
                  <span>
                    À :{" "}
                    <b>
                      {item.recipient.firstName} {item.recipient.lastName}
                    </b>
                  </span>
                )}
              </div>
              <div className="mt-2 text-sm text-muted-foreground whitespace-pre-line break-words line-clamp-5">
                {item.content}
              </div>
            </div>
            {item.isInjection && !item.acknowledged && (
              <Button
                size="icon"
                variant="outline"
                className="text-green-600 border-green-400 hover:bg-green-50 dark:hover:bg-green-900"
                aria-label="Marquer comme lu"
                title="Marquer comme lu"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAcknowledgeInjection(item.id);
                }}
              >
                <Check className="h-5 w-5" />
              </Button>
            )}
          </div>
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge
            variant="outline"
            className="bg-gray-500/10 text-gray-500 border-gray-500/20"
          >
            Brouillon
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="default" className="bg-orange-500">
            En cours
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="default" className="bg-green-500">
            Terminé
          </Badge>
        );
      case "cancelled":
        return <Badge variant="secondary">Annulé</Badge>;
      default:
        return <Badge variant="outline">Non défini</Badge>;
    }
  };

  const getAssignmentStatusBadge = (status: string) => {
    switch (status) {
      case "assigned":
        return (
          <Badge
            variant="default"
            className="bg-green-500/10 text-green-500 border-green-500/20"
          >
            Assigné
          </Badge>
        );
      case "unassigned":
        return (
          <Badge
            variant="outline"
            className="bg-red-500/10 text-red-500 border-red-500/20"
          >
            Non Assigné
          </Badge>
        );
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  // Supposons que data?.plans est un tableau de plans, chaque plan a un champ planTasks qui contient les tâches
  const planTasks: Task[] = selectedPlan
    ? selectedPlan.planTasks.map((pt) => pt.task)
    : [];

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Erreur: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-950">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background shadow-md border-b">
        <Link
          href="/simulation"
          className="flex items-center gap-2 text-primary"
        >
          <ChevronLeft className="h-5 w-5" />
          Retour aux simulations
        </Link>
        <h1 className="text-2xl font-bold text-center flex-1">
          {data?.simulation.title}
        </h1>
        <Button variant="default" className="ml-4" onClick={handleComposeClick}>
          <span className="hidden md:inline">Nouvelle Communication</span>
          <span className="md:hidden">+</span>
        </Button>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-background overflow-auto">
        {/* Left Column: Aperçu + Plans/Tâches */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Aperçu Simulation */}
          <Card className="bg-background shadow-md hover:bg-accent transition-colors rounded-xl border border-muted">
            <CardHeader>
              <CardTitle>Aperçu de la Simulation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {data?.simulation.description}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>
                  <span className="font-semibold">Date de début:</span>{" "}
                  {formatDate(data?.simulation.startDate || "")}
                </p>
                <p>
                  <span className="font-semibold">Date de fin:</span>{" "}
                  {formatDate(data?.simulation.endDate || "")}
                </p>
                <p>
                  <span className="font-semibold">Statut:</span>{" "}
                  {getStatusBadge(data?.simulation.status || "")}
                </p>
                <p>
                  <span className="font-semibold">Assignation:</span>{" "}
                  {getAssignmentStatusBadge(
                    data?.simulation.assignmentStatus || ""
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
          {/* Plans et Tâches */}
          <Card className="bg-background shadow-md hover:bg-accent transition-colors rounded-xl border border-muted">
            <CardHeader>
              <CardTitle>Plans et Tâches Associées</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Sélecteur de plan */}
              {plans && (
                <div className="mb-4">
                  <Select
                    value={selectedPlanId ?? undefined}
                    onValueChange={setSelectedPlanId}
                  >
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Sélectionner un plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {/* Sélecteur de rôle, seulement si un plan est sélectionné */}
              {selectedPlan && planTasks.length > 0 && (
                <div className="mb-4">
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les rôles</SelectItem>
                      {Array.from(
                        new Set(
                          planTasks
                            .map((t) => t.role)
                            .filter((r): r is string => !!r)
                        )
                      ).map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {/* Liste dynamique des tâches filtrées par rôle */}
              {selectedPlan && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                  {planTasks
                    .filter(
                      (task) =>
                        selectedRole === "all" || task.role === selectedRole
                    )
                    .map((task) => (
                      <Card
                        key={task.id}
                        className="bg-background shadow-md hover:bg-accent transition-colors rounded-xl p-0 flex flex-col min-h-[210px] border border-muted"
                      >
                        <CardHeader className="pb-0 border-b border-muted flex flex-row items-center justify-between gap-2 bg-transparent rounded-t-xl px-5 pt-5">
                          <div className="flex flex-col gap-1">
                            <span className="text-base font-semibold text-foreground leading-tight line-clamp-1">
                              {task.title}
                            </span>
                            {task.role && (
                              <Badge
                                variant="secondary"
                                className="w-fit mt-1 text-xs px-2 py-0.5"
                              >
                                {task.role}
                              </Badge>
                            )}
                          </div>
                          {task.dueDate && (
                            <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                              Échéance : {formatDate(task.dueDate)}
                            </span>
                          )}
                        </CardHeader>
                        <CardContent className="flex-1 px-5 py-4">
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-3 min-h-[48px]">
                            {task.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <Badge
                              variant={
                                task.status === "COMPLETED"
                                  ? "secondary"
                                  : task.status === "IN_PROGRESS"
                                  ? "outline"
                                  : task.status === "PENDING"
                                  ? "secondary"
                                  : task.status === "CANCELLED"
                                  ? "destructive"
                                  : "outline"
                              }
                            >
                              {task.status}
                            </Badge>
                            <Badge variant="outline">{task.priority}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Communications & Injections */}
        <div className="md:col-span-1 flex flex-col gap-6">
          {/* Canaux de communication */}
          <Card className="bg-background shadow-md hover:bg-accent transition-colors rounded-xl border border-muted">
            <CardHeader>
              <CardTitle>Canaux de communication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <CommunicationChannelCard
                  title="Email"
                  count={
                    (data?.counts?.email || 0) +
                    (data?.injections.filter(
                      (inj) => inj.type.toLowerCase() === "email"
                    ).length || 0)
                  }
                  onClick={() => handleChannelClick("email")}
                  icon={Mail}
                />
                <CommunicationChannelCard
                  title="SMS"
                  count={
                    (data?.counts?.sms || 0) +
                    (data?.injections.filter(
                      (inj) => inj.type.toLowerCase() === "sms"
                    ).length || 0)
                  }
                  onClick={() => handleChannelClick("sms")}
                  icon={MessageSquare}
                />
                <CommunicationChannelCard
                  title="Appel"
                  count={
                    (data?.counts?.call || 0) +
                    (data?.injections.filter(
                      (inj) => inj.type.toLowerCase() === "call"
                    ).length || 0)
                  }
                  onClick={() => handleChannelClick("call")}
                  icon={Phone}
                />
                <CommunicationChannelCard
                  title="Alerte"
                  count={
                    (data?.counts?.alert || 0) +
                    (data?.injections.filter(
                      (inj) => inj.type.toLowerCase() === "alert"
                    ).length || 0)
                  }
                  onClick={() => handleChannelClick("alert")}
                  icon={Bell}
                />
                <CommunicationChannelCard
                  title="WhatsApp"
                  count={
                    (data?.counts?.memo || 0) +
                    (data?.injections.filter(
                      (inj) => inj.type.toLowerCase() === "memo"
                    ).length || 0)
                  }
                  onClick={() => handleChannelClick("memo")}
                  icon={WhatsAppIcon}
                />
                <CommunicationChannelCard
                  title="Diffusion de Nouvelles"
                  count={
                    (data?.counts?.newsBroadcast || 0) +
                    (data?.injections.filter(
                      (inj) => inj.type.toLowerCase() === "newsbroadcast"
                    ).length || 0)
                  }
                  onClick={() => handleChannelClick("newsBroadcast")}
                  icon={Newspaper}
                />
                <CommunicationChannelCard
                  title="Journal"
                  count={
                    (data?.counts?.newspaper || 0) +
                    (data?.injections.filter(
                      (inj) => inj.type.toLowerCase() === "newspaper"
                    ).length || 0)
                  }
                  onClick={() => handleChannelClick("newspaper")}
                  icon={Rss}
                />
                <CommunicationChannelCard
                  title="Social"
                  count={
                    (data?.counts?.social || 0) +
                    (data?.injections.filter(
                      (inj) => inj.type.toLowerCase() === "social"
                    ).length || 0)
                  }
                  onClick={() => handleChannelClick("social")}
                  icon={Users}
                />
              </div>
            </CardContent>
          </Card>
          {/* Liste des communications/injections avec ScrollArea, effet visuel, responsive */}
          <Card className="bg-background shadow-md hover:bg-accent transition-colors rounded-xl border border-muted flex-1 flex flex-col">
            <CardHeader className="pb-0 border-b border-muted bg-transparent rounded-t-xl px-5 pt-5">
              <CardTitle className="flex items-center justify-between text-foreground">
                <span className="text-2xl font-bold">
                  {selectedChannel
                    ? selectedChannel.charAt(0).toUpperCase() +
                      selectedChannel.slice(1)
                    : "Contenu de la Communication"}
                </span>
                <Button
                  onClick={handleComposeClick}
                  variant="outline"
                  className="ml-2"
                >
                  <span className="hidden md:inline">Composer</span>
                  <span className="md:hidden">+</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto px-5 py-4">
              <ScrollArea className="h-[500px]">
                <div className="space-y-4 animate-fade-in">
                  {selectedChannel &&
                    !isComposing &&
                    renderContentForChannel(selectedChannel)}
                  {selectedChannel && isComposing && (
                    <div>
                      {selectedChannel === "email" && (
                        <EmailComposeForm
                          onSubmit={handleEmailSubmit}
                          onCancel={() => setIsComposing(false)}
                        />
                      )}
                      {selectedChannel === "sms" && (
                        <SmsComposeForm
                          onSubmit={handleSmsSubmit}
                          onCancel={() => setIsComposing(false)}
                        />
                      )}
                      {selectedChannel === "call" && (
                        <CallComposeForm
                          onSubmit={handleCallSubmit}
                          onCancel={() => setIsComposing(false)}
                        />
                      )}
                      {selectedChannel === "alert" && (
                        <AlertComposeForm
                          onSubmit={handleAlertSubmit}
                          onCancel={() => setIsComposing(false)}
                        />
                      )}
                      {selectedChannel === "memo" && (
                        <MemoComposeForm
                          onSubmit={handleMemoSubmit}
                          onCancel={() => setIsComposing(false)}
                        />
                      )}
                      {selectedChannel === "newsBroadcast" && (
                        <NewsBroadcastComposeForm
                          onSubmit={handleNewsBroadcastSubmit}
                          onCancel={() => setIsComposing(false)}
                        />
                      )}
                      {selectedChannel === "newspaper" && (
                        <NewspaperComposeForm
                          onSubmit={handleNewspaperSubmit}
                          onCancel={() => setIsComposing(false)}
                        />
                      )}
                      {selectedChannel === "social" && (
                        <SocialComposeForm
                          onSubmit={handleSocialSubmit}
                          onCancel={() => setIsComposing(false)}
                        />
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>

      {selectedInjection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-md bg-background text-foreground shadow-md rounded-xl border border-muted p-0">
            <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-muted">
              <div className="flex items-center gap-2">
                {getIconForType(selectedInjection.type)}
                <span className="font-bold text-lg truncate">
                  {selectedInjection.title}
                </span>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Fermer"
                onClick={() => setSelectedInjection(null)}
              >
                ×
              </Button>
            </div>
            <div className="flex items-center gap-2 px-5 pt-2 pb-0">
              <span className="text-xs bg-muted text-foreground px-2 py-0.5 rounded-full border border-muted">
                {formatDate(selectedInjection.createdAt)}
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                Scénario :{" "}
                <span className="font-medium">
                  {selectedInjection.scenarioName}
                </span>
              </span>
            </div>
            <CardContent className="px-5 py-4">
              <div className="mb-4 whitespace-pre-line break-words text-foreground">
                {selectedInjection.content}
              </div>
              {selectedInjection.imageUrl && (
                <div className="mb-4">
                  <Image
                    src={selectedInjection.imageUrl}
                    alt={selectedInjection.title ?? ""}
                    width={400}
                    height={300}
                    className="rounded-lg"
                  />
                </div>
              )}
              {selectedInjection.videoUrl && (
                <div className="mb-4 w-full">
                  {selectedInjection.videoUrl.includes("youtube.com") ? (
                    <iframe
                      className="w-full aspect-video rounded-lg"
                      src={`https://www.youtube.com/embed/${
                        selectedInjection.videoUrl.split("v=")[1]?.split("&")[0]
                      }`}
                      frameBorder="0"
                      /* Omit `allow` to improve compatibility (e.g. Firefox for Android) */
                      allowFullScreen
                      title="YouTube video player"
                    ></iframe>
                  ) : (
                    <video
                      src={selectedInjection.videoUrl}
                      controls
                      className="rounded-lg w-full max-w-2xl"
                    />
                  )}
                </div>
              )}
              {selectedInjection.attachments &&
                selectedInjection.attachments.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Pièces jointes :</h4>
                    <div className="space-y-2">
                      {selectedInjection.attachments.map(
                        (attachment, index) => (
                          <a
                            key={index}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-primary hover:underline"
                          >
                            <FileText className="h-4 w-4" />
                            <span>{attachment.name}</span>
                          </a>
                        )
                      )}
                    </div>
                  </div>
                )}
              {!selectedInjection.acknowledged && (
                <div className="flex justify-end">
                  <Button
                    variant="default"
                    className="mt-2"
                    onClick={() => {
                      handleAcknowledgeInjection(selectedInjection.id);
                      setSelectedInjection(null);
                    }}
                  >
                    Marquer comme lu
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
