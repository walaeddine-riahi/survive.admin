"use client";

import { Inter } from "next/font/google";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import "./mobile-enhancements.css";

// Configuration de la police Inter
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Configuration du thème sombre de la plateforme
const theme = {
  colors: {
    primary: {
      DEFAULT: "#008080", // Brand teal
      light: "#00b3b3",
      dark: "#005959",
      hover: "#009999",
    },
    secondary: {
      DEFAULT: "#f9b233", // Orange accent
      light: "#ffc55c",
      dark: "#e89d1a",
    },
    background: {
      DEFAULT: "#1e1e1e", // Dark background
      light: "#2a2a2a", // Card background
      muted: "#363636", // Accent background
    },
    text: {
      primary: "#f8f9fa",
      secondary: "#b8b8b8",
      muted: "#9a9a9a",
    },
    border: {
      DEFAULT: "rgba(255, 255, 255, 0.1)",
      hover: "rgba(255, 255, 255, 0.2)",
    },
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.3)",
    DEFAULT: "0 2px 8px 0 rgb(0 0 0 / 0.3)",
    md: "0 4px 12px 0 rgb(0 0 0 / 0.4)",
    lg: "0 8px 24px 0 rgb(0 0 0 / 0.5)",
  },
  borderRadius: {
    sm: "0.25rem",
    DEFAULT: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    full: "9999px",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
  },
};
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState, useRef } from "react";
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
  ArrowRight,
  Bell,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Clock,
  Download,
  FileText,
  Grid3X3,
  List,
  Mail,
  Menu,
  MessageSquare,
  Newspaper,
  Paperclip,
  Phone,
  Plus,
  Rss,
  User,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";

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

interface Assignment {
  userId: string;
  role: string;
  status: string;
  teamId: string | null;
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
  assignments: Assignment[];
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

interface Participant {
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
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
  injCount = 0,
  onClick,
  icon: Icon,
  className = "",
  iconClass = "",
}: {
  title: string;
  count: number;
  onClick: () => void;
  icon: React.ElementType;
  className?: string;
  injCount?: number;
  iconClass?: string;
}) {
  return (
    <Card
      className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg transition-all cursor-pointer border ${className} hover:shadow-md group`}
      onClick={onClick}
    >
      <div className="flex flex-col items-center w-full">
        <div
          className={`p-1.5 sm:p-2 rounded-full mb-1 sm:mb-2 ${iconClass} bg-opacity-20 group-hover:scale-110 transition-transform`}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <span className="text-xs font-medium text-center mb-1 line-clamp-2">
          {title}
        </span>
        <div className="flex gap-1">
          {count > 0 && (
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-800 shadow-sm">
              {count}
            </span>
          )}
          {injCount > 0 && (
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-800 shadow-sm animate-pulse">
              {injCount}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

// Fonction utilitaire pour formater la date
const formatDate = (dateString: string) => {
  if (!dateString) return "Non définie";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date invalide";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    console.error("Erreur de formatage de date:", error);
    return "Date invalide";
  }
};

const getIconForType = (type: string): React.ReactElement => {
  const iconProps = {
    className: "h-5 w-5 text-white drop-shadow-sm",
    strokeWidth: 1.75,
  };

  switch (type.toLowerCase()) {
    case "email":
      return <Mail {...iconProps} />;
    case "sms":
      return <MessageSquare {...iconProps} />;
    case "call":
      return <Phone {...iconProps} />;
    case "alert":
      return <Bell {...iconProps} />;
    case "memo":
      return <FileText {...iconProps} />;
    case "newsbroadcast":
      return <Newspaper {...iconProps} />;
    case "newspaper":
      return <Rss {...iconProps} />;
    case "social":
      return <Users {...iconProps} />;
    default:
      return <MessageSquare {...iconProps} />; // Icône par défaut
  }
};

export default function ParticipantViewFixedPage() {
  const { data: session } = useSession();
  const params = useParams();
  const simulationId = params.simulationId as string;
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [data, setData] = useState<ParticipantViewData | null>(null);

  const [selectedChannel, setSelectedChannel] = useState<
    keyof ParticipantViewData["communications"] | null
  >(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");

  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const [selectedInjection, setSelectedInjection] = useState<Injection | null>(
    null
  );
  const audioContextRef = useRef<AudioContext | null>(null);

  const shownInjectionIds = useRef(new Set<string>());

  useEffect(() => {
    // Force light mode for this specific view
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");

    // Cleanup on component unmount
    return () => {
      document.documentElement.classList.remove("light");
    };
  }, []);

  const playNotification = useCallback((type: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as unknown as typeof AudioContext))();
      }

      const audioContext = audioContextRef.current;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Sonneries spécifiques par type de communication
      switch (type.toLowerCase()) {
        case "email":
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
          break;
        case "sms":
          oscillator.type = "square";
          oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
          break;
        case "call":
          oscillator.type = "triangle";
          oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
          break;
        case "alert":
          oscillator.type = "sawtooth";
          oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
          break;
        case "memo":
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
          break;
        case "newsbroadcast":
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(784, audioContext.currentTime);
          break;
        case "newspaper":
          oscillator.type = "triangle";
          oscillator.frequency.setValueAtTime(659, audioContext.currentTime);
          break;
        case "social":
          oscillator.type = "square";
          oscillator.frequency.setValueAtTime(988, audioContext.currentTime);
          break;
        default:
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      }

      // Durées et intensités spécifiques
      const duration = 0.5; // durée en secondes
      const intensity = 0.3;

      gainNode.gain.setValueAtTime(intensity, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + duration
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      console.error(
        "Erreur lors de la lecture de la notification sonore:",
        error
      );
      // Fallback simple en cas d'erreur
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext ||
            (window as unknown as typeof AudioContext))();
        }

        const audioContext = audioContextRef.current;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.3
        );

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);

        oscillator.onended = () => {
          oscillator.disconnect();
          gainNode.disconnect();
        };
      } catch (fallbackError) {
        console.error("Erreur avec le bip de secours:", fallbackError);
      }
    }
  }, []);

  useEffect(() => {
    if (!data || !data.injections) return;

    const unseen = data.injections
      .filter(
        (inj) => !inj.acknowledged && !shownInjectionIds.current.has(inj.id)
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    if (unseen.length > 0) {
      const latest = unseen[0];
      shownInjectionIds.current.add(latest.id);
      setSelectedInjection(latest);
    }
  }, [data]);

  useEffect(() => {
    if (!selectedInjection?.id) return;

    if (!shownInjectionIds.current.has(selectedInjection.id)) {
      shownInjectionIds.current.add(selectedInjection.id);
      playNotification(selectedInjection.type || "default");
    }
  }, [selectedInjection, playNotification]);

  const handleTaskClick = useCallback(
    (task: Task) => {
      toast({
        title: task.title,
        description: task.description,
        variant: "default",
        action: (
          <Button
            variant="outline"
            size="sm"
            className="border-[#0066b3] text-[#0066b3] hover:bg-[#0066b3] hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              toast({
                title: "Tâche mise à jour",
                description: `La tâche "${task.title}" a été marquée comme terminée`,
                variant: "default",
              });
            }}
          >
            Marquer comme terminée
          </Button>
        ),
      });
    },
    [toast]
  );

  const getUserRole = useCallback(
    (simulationData: ParticipantViewData | null) => {
      if (!simulationData?.simulation) {
        console.log("Aucune donnée de simulation disponible");
        return null;
      }

      if (!session?.user?.id) {
        console.log("Aucun ID utilisateur trouvé dans la session");
        return null;
      }

      const assignments = simulationData.simulation.assignments || [];

      console.log("Assignations disponibles:", assignments);
      console.log("Recherche de l'utilisateur avec l'ID:", session.user.id);

      const userAssignment = assignments.find(
        (assignment) => assignment.userId === session.user.id
      );

      console.log("Assignation trouvée pour l'utilisateur:", userAssignment);

      return userAssignment?.role || null;
    },
    [session?.user?.id]
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
      const newData = await response.json();
      console.log("Fetched data structure:", JSON.stringify(newData, null, 2));
      console.log("Simulation data:", newData.simulation);
      console.log(
        "Available keys in simulation:",
        Object.keys(newData.simulation || {})
      );

      if (data) {
        const newMessages: Record<string, number> = {};

        const communicationTypes = [
          "email",
          "call",
          "sms",
          "alert",
          "memo",
          "newsBroadcast",
          "newspaper",
          "social",
        ] as const;

        communicationTypes.forEach((channel) => {
          const currentMessages = newData.communications[channel] || [];
          const previousMessages = data.communications[channel] || [];
          const newMessagesCount =
            currentMessages.length - previousMessages.length;

          if (newMessagesCount > 0) {
            newMessages[channel] = newMessagesCount;
          }
        });

        (Object.entries(newMessages) as [string, number][]).forEach(
          ([channel, count]) => {
            toast({
              title: "Nouveaux messages",
              description: `${count} nouveau(x) message(s) dans ${channel}`,
              variant: "default",
              duration: 5000,
            });
          }
        );

        if (newData.injections.length > (data.injections?.length || 0)) {
          const newInjections = newData.injections.slice(
            data.injections?.length || 0
          );
          newInjections.forEach((injection: Injection) => {
            playNotification(injection.type);

            toast({
              title: "Nouvelle injection",
              description: injection.title,
              variant: "default",
              duration: 5000,
              action: (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedChannel(
                      injection.type.toLowerCase() as keyof ParticipantViewData["communications"]
                    );
                  }}
                >
                  Voir
                </Button>
              ),
            });
          });
        }
      }

      setData(newData);

      const role = getUserRole(newData);
      if (role) {
        setUserRole(role);
        console.log("Rôle utilisateur détecté:", role);
      } else {
        console.log("Aucun rôle trouvé pour l'utilisateur connecté");
      }
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
  }, [simulationId, toast, getUserRole, data, playNotification]);

  useEffect(() => {
    return () => {
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }
    };
  }, []);

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
    fetchPlans();
    const intervalId = setInterval(() => {
      console.log("Mise à jour automatique des données...");
      fetchData().then(() => {
        toast({
          title: "Mise à jour",
          description: "Les données ont été mises à jour",
          variant: "default",
          duration: 3000,
        });
      });
      fetchPlans();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [fetchData, fetchPlans, toast]);

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
    setData((currentData) => {
      if (!currentData) return null;
      return {
        ...currentData,
        injections: currentData.injections.map((inj) =>
          inj.id === injectionId ? { ...inj, acknowledged: true } : inj
        ),
      };
    });
    setSelectedInjection(null);
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

  const handleComposeClick = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleEmailSubmit = async (formData: EmailFormData) => {
    try {
      if (!formData.to || formData.to.length === 0) {
        throw new Error("Aucun destinataire sélectionné");
      }

      if (
        !formData.toEmails ||
        formData.to.length !== formData.toEmails.length
      ) {
        throw new Error("Erreur dans la liste des destinataires");
      }

      const results = await Promise.allSettled(
        formData.to.map((recipientId, index) => {
          const requestBody = {
            type: "email",
            subject: formData.subject,
            content: formData.body,
            recipientId: recipientId,
            payload: {
              to: formData.toEmails?.[index] || "",
              from: session?.user?.email || "",
            },
          };

          return fetch(`/api/simulations/${simulationId}/communications`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });
        })
      );

      const errors = results.filter(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected"
      );

      if (errors.length > 0) {
        console.error("Erreurs lors de l'envoi des emails:", errors);
        throw new Error(
          `Échec de l'envoi à ${errors.length} destinataire(s) sur ${formData.to.length}`
        );
      }

      toast({
        title: "Succès",
        description: `Email(s) envoyé(s) avec succès à ${formData.to.length} destinataire(s)`,
      });

      setIsComposing(false);
      setData(null);
      setLoading(true);
      fetchData();
    } catch (error: unknown) {
      console.error("Erreur lors de l'envoi des emails:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur inconnue s'est produite";
      toast({
        title: "Erreur",
        description: `Impossible d'envoyer les emails: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleSmsSubmit = async (formData: SmsFormData) => {
    try {
      if (!formData.to || formData.to.length === 0) {
        throw new Error("Aucun destinataire sélectionné");
      }

      if (
        !formData.recipientPhones ||
        formData.to.length !== formData.recipientPhones.length
      ) {
        throw new Error("Erreur dans la liste des destinataires");
      }

      if (!session?.user?.id) {
        throw new Error("Vous devez être connecté pour effectuer cette action");
      }

      const results = await Promise.allSettled(
        formData.to.map((recipientId, index) => {
          const requestBody = {
            type: "sms",
            content: formData.body,
            recipientId: recipientId === "" ? null : recipientId,
            payload: {
              to: formData.recipientPhones?.[index] || "",
              from: session.user.phone || "",
            },
          };

          return fetch(`/api/simulations/${simulationId}/communications`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });
        })
      );

      const errors = results.filter(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected"
      );

      if (errors.length > 0) {
        console.error("Erreurs lors de l'envoi des SMS:", errors);
        throw new Error(
          `Échec de l'envoi à ${errors.length} destinataire(s) sur ${formData.to.length}`
        );
      }

      toast({
        title: "Succès",
        description: `SMS envoyé(s) avec succès à ${formData.to.length} destinataire(s)`,
      });

      setIsComposing(false);
      setData(null);
      setLoading(true);
      fetchData();
    } catch (error: unknown) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible d'envoyer le SMS.",
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

  const sendAlertToParticipant = async (
    recipientId: string | null = null,
    subject: string,
    message: string
  ) => {
    const requestBody = {
      type: "alert",
      subject,
      content: message,
      recipientId: recipientId || null,
      payload: {
        isBroadcast: !recipientId,
      },
    };

    const response = await fetch(
      `/api/simulations/${simulationId}/communications`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Échec de l'envoi de l'alerte");
    }

    return response.json();
  };

  const handleAlertSubmit = async (formData: AlertFormData) => {
    console.log("[handleAlertSubmit] Début de l'envoi d'alerte");
    console.log("Données du formulaire:", formData);

    try {
      if (formData.sendToAll) {
        console.log(
          "[handleAlertSubmit] Tentative de récupération des participants"
        );
        const apiUrl = `/api/simulations/${simulationId}/participants`;
        console.log("[handleAlertSubmit] URL de l'API:", apiUrl);

        try {
          const participantsResponse = await fetch(apiUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
            },
            credentials: "include",
          });

          console.log(
            "[handleAlertSubmit] Réponse reçue, status:",
            participantsResponse.status
          );

          if (!participantsResponse.ok) {
            const errorText = await participantsResponse.text();
            console.error("[handleAlertSubmit] Erreur de l'API participants:", {
              status: participantsResponse.status,
              statusText: participantsResponse.statusText,
              errorText,
            });
            throw new Error(
              `Erreur ${participantsResponse.status}: ${participantsResponse.statusText}`
            );
          }

          const participants = await participantsResponse.json();
          console.log(
            "[handleAlertSubmit] Participants récupérés:",
            participants
          );

          if (!Array.isArray(participants)) {
            console.error(
              "[handleAlertSubmit] Format de réponse inattendu:",
              participants
            );
            throw new Error(
              "Format de réponse inattendu pour les participants"
            );
          }

          const otherParticipants = participants.filter(
            (p: Participant) => p.user?.id !== session?.user?.id
          );

          console.log(
            `[handleAlertSubmit] ${otherParticipants.length} autres participants trouvés`
          );

          if (otherParticipants.length === 0) {
            console.warn(
              "[handleAlertSubmit] Aucun autre participant trouvé dans la simulation"
            );
            throw new Error("Aucun participant trouvé dans cette simulation");
          }

          const results = await Promise.allSettled(
            otherParticipants.map((p: Participant) => {
              if (!p.user?.id) {
                console.warn(
                  "[handleAlertSubmit] Participant sans ID utilisateur valide:",
                  p
                );
                return Promise.reject(new Error("ID utilisateur manquant"));
              }
              console.log(
                `[handleAlertSubmit] Envoi d'alerte à l'utilisateur:`,
                p.user.id
              );
              return sendAlertToParticipant(
                p.user.id,
                formData.subject,
                formData.message
              );
            })
          );

          const errors = results.filter(
            (result): result is PromiseRejectedResult =>
              result.status === "rejected"
          );

          if (errors.length > 0) {
            console.error(
              "[handleAlertSubmit] Erreurs lors de l'envoi des alertes:",
              errors
            );
            throw new Error(
              `Échec de l'envoi à ${errors.length} participant(s) sur ${otherParticipants.length}`
            );
          }

          console.log(
            `[handleAlertSubmit] Alertes envoyées avec succès à ${otherParticipants.length} participants`
          );

          toast({
            title: "Succès",
            description: `Alerte envoyée à ${otherParticipants.length} participant(s) avec succès.`,
          });
        } catch (apiError) {
          console.error(
            "[handleAlertSubmit] Erreur lors de la récupération des participants:",
            apiError
          );
          throw new Error(
            `Erreur lors de la récupération des participants: ${
              apiError instanceof Error ? apiError.message : String(apiError)
            }`
          );
        }
      } else if (formData.recipients && formData.recipients.length > 0) {
        console.log(
          `[handleAlertSubmit] Envoi d'alertes à ${formData.recipients.length} destinataire(s) sélectionné(s)`
        );

        const results = await Promise.allSettled(
          formData.recipients.map((recipientId: string) =>
            sendAlertToParticipant(
              recipientId,
              formData.subject,
              formData.message
            )
          )
        );

        const successfulCount = results.filter(
          (r) => r.status === "fulfilled"
        ).length;
        const failedCount = results.length - successfulCount;

        if (successfulCount > 0) {
          toast({
            title: "Envoi terminé",
            description: `${successfulCount} alerte(s) envoyée(s) avec succès.`,
          });
        }

        if (failedCount > 0) {
          toast({
            title: "Erreur d'envoi",
            description: `Échec de l'envoi de ${failedCount} alerte(s).`,
            variant: "destructive",
          });
          throw new Error(
            `${failedCount} alerte(s) n'ont pas pu être envoyée(s).`
          );
        }
      } else {
        throw new Error("Aucun destinataire sélectionné pour l'alerte.");
      }

      setIsComposing(false);
      setData(null);
      setLoading(true);
      fetchData();
    } catch (error: unknown) {
      console.error("Erreur lors de l'envoi de l'alerte:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur inconnue s'est produite";
      toast({
        title: "Erreur",
        description: `Impossible d'envoyer l'alerte: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleCallSubmit = async (formData: CallFormData) => {
    try {
      if (!formData.to || formData.to.length === 0) {
        throw new Error("Aucun destinataire sélectionné");
      }

      if (
        !formData.toPhones ||
        formData.to.length !== formData.toPhones.length
      ) {
        throw new Error("Erreur dans la liste des destinataires");
      }

      if (!session?.user?.id) {
        throw new Error("Vous devez être connecté pour effectuer cette action");
      }

      const results = await Promise.allSettled(
        formData.to.map((recipientId, index) => {
          const requestBody = {
            type: "call",
            content: formData.notes,
            recipientId: recipientId,
            senderId: session.user.id,
            payload: {
              to: formData.toPhones?.[index] || "",
              from: session.user.phone || "",
            },
          };

          return fetch(`/api/simulations/${simulationId}/communications`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });
        })
      );

      const errors = results.filter(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected"
      );

      if (errors.length > 0) {
        console.error("Erreurs lors de l'enregistrement des appels:", errors);
        throw new Error(
          `Échec de l'enregistrement pour ${errors.length} appel(s) sur ${formData.to.length}`
        );
      }

      toast({
        title: "Succès",
        description: `Appel(s) enregistré(s) avec succès pour ${formData.to.length} destinataire(s)`,
      });

      setIsComposing(false);
      setData(null);
      setLoading(true);
      fetchData();
    } catch (error: unknown) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible d'enregistrer l'appel.",
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

    const channelCommunications = data.communications[channelType] || [];
    const channelInjections = data.injections.filter((inj) => {
      if (!inj.type) return false;

      const normalizedInjType = inj.type.toUpperCase().replace(/_/g, "");
      const normalizedChannelType = channelType.toUpperCase().replace(/_/g, "");

      if (normalizedChannelType === "SOCIAL") {
        return (
          normalizedInjType === "SOCIAL" || normalizedInjType === "SOCIALMEDIA"
        );
      }

      return normalizedInjType === normalizedChannelType;
    });

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
        <div className="flex flex-col items-center justify-center p-4 text-center rounded-lg bg-gray-50 border-2 border-dashed border-gray-200">
          <MessageSquare className="h-8 w-8 text-gray-400 mb-2" />
          <h3 className="text-base font-medium text-gray-700 mb-1">
            Aucun contenu
          </h3>
          <p className="text-xs text-gray-500">
            Aucune communication ou injection n&apos;a été envoyée sur ce canal
            pour le moment.
          </p>
        </div>
      );
    }

    const getChannelColor = (type: string) => {
      switch (type.toLowerCase()) {
        case "email":
          return "border-l-4 border-l-red-500";
        case "sms":
          return "border-l-4 border-l-green-500";
        case "call":
          return "border-l-4 border-l-purple-500";
        case "alert":
          return "border-l-4 border-l-amber-500";
        case "memo":
          return "border-l-4 border-l-indigo-500";
        case "newsbroadcast":
          return "border-l-4 border-l-pink-500";
        case "newspaper":
          return "border-l-4 border-l-rose-500";
        case "social":
          return "border-l-4 border-l-teal-500";
        default:
          return "border-l-4 border-l-gray-400";
      }
    };

    return (
      <div className="space-y-3">
        {combinedContent.map((item) => (
          <div
            key={item.id}
            className={`relative flex flex-col gap-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden 
              ${getChannelColor(item.type)} 
              ${
                item.isInjection && !item.acknowledged
                  ? "ring-1 ring-amber-500/20"
                  : "border border-gray-100"
              }
              ${
                item.isInjection ? "hover:bg-amber-50/50" : "hover:bg-gray-50"
              }`}
          >
            <div
              className={`flex items-start justify-between p-3 ${
                item.isInjection ? "cursor-pointer" : ""
              }`}
              {...(item.isInjection && {
                tabIndex: 0,
                role: "button",
                "aria-label": `Injection : ${item.title}`,
              })}
              {...(!item.isInjection && {
                "aria-label": `Communication : ${item.subject || "Sans sujet"}`,
              })}
              onClick={() =>
                item.isInjection
                  ? setSelectedInjection(item as Injection)
                  : undefined
              }
            >
              <div className="flex items-start gap-2 flex-1">
                <div
                  className={`p-1.5 rounded-md mt-0.5 ${
                    item.isInjection
                      ? "bg-amber-100 text-amber-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {getIconForType(item.type)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 line-clamp-2 text-sm">
                    {item.isInjection
                      ? item.title
                      : item.subject || "Sans sujet"}
                  </h3>
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-gray-500 mt-0.5">
                    {item.sender && (
                      <span className="flex items-center">
                        <User className="h-3 w-3 mr-1 opacity-70" />
                        {item.sender.firstName} {item.sender.lastName}
                      </span>
                    )}
                    {item.recipient && (
                      <span className="flex items-center">
                        <Mail className="h-3 w-3 mr-1 opacity-70" />
                        {item.recipient.firstName} {item.recipient.lastName}
                      </span>
                    )}
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1 opacity-70" />
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {item.isInjection && !item.acknowledged && (
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-1 bg-white hover:bg-amber-50 text-amber-600 border-amber-200 hover:border-amber-300 hover:text-amber-700 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAcknowledgeInjection(item.id);
                  }}
                >
                  <Check className="h-3 w-3 mr-0.5" />
                  <span className="text-xs">Lu</span>
                </Button>
              )}
            </div>

            <div className="px-3 pb-3 pt-0">
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line break-words text-sm">
                {item.content}
              </div>

              {item.attachments && item.attachments.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center">
                    <Paperclip className="h-3 w-3 mr-1" />
                    Pièces jointes ({item.attachments.length})
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {item.attachments.map((attachment, idx) => (
                      <a
                        key={idx}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FileText className="h-3 w-3 mr-1 text-gray-400" />
                        {attachment.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {item.isInjection && !item.acknowledged && (
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  Nouveau
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const getChannelGradient = (channelType: string) => {
    switch (channelType.toLowerCase()) {
      case "email":
        return "from-red-500 to-red-600";
      case "sms":
        return "from-green-500 to-green-600";
      case "call":
        return "from-purple-500 to-purple-600";
      case "alert":
        return "from-amber-500 to-amber-600";
      case "memo":
        return "from-indigo-500 to-indigo-600";
      case "newsbroadcast":
        return "from-pink-500 to-pink-600";
      case "newspaper":
        return "from-rose-500 to-rose-600";
      case "social":
        return "from-teal-500 to-teal-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getFileType = (filename: string) => {
    const extension = filename.split(".").pop()?.toLowerCase() || "";
    const fileTypes: Record<string, string> = {
      pdf: "Document PDF",
      doc: "Document Word",
      docx: "Document Word",
      xls: "Feuille de calcul Excel",
      xlsx: "Feuille de calcul Excel",
      ppt: "Présentation PowerPoint",
      pptx: "Présentation PowerPoint",
      txt: "Fichier texte",
      rtf: "Document texte enrichi",
      odt: "Document OpenDocument",
      ods: "Feuille de calcul OpenDocument",
      odp: "Présentation OpenDocument",
      jpg: "Image",
      jpeg: "Image",
      png: "Image",
      gif: "Image",
      bmp: "Image",
      svg: "Image vectorielle",
      webp: "Image WebP",
      zip: "Archive ZIP",
      rar: "Archive RAR",
      "7z": "Archive 7-Zip",
      tar: "Archive TAR",
      gz: "Archive GZIP",
      mp3: "Fichier audio",
      wav: "Fichier audio",
      mp4: "Vidéo",
      avi: "Vidéo",
      mov: "Vidéo",
      wmv: "Vidéo",
    };

    return fileTypes[extension] || `Fichier .${extension}`;
  };

  const getInjectionGradient = (type: string) => {
    switch (type.toLowerCase()) {
      case "email":
        return "from-red-500 to-red-600";
      case "sms":
        return "from-green-500 to-green-600";
      case "call":
        return "from-purple-500 to-purple-600";
      case "alert":
        return "from-amber-500 to-amber-600";
      case "memo":
        return "from-indigo-500 to-indigo-600";
      case "newsbroadcast":
        return "from-pink-500 to-pink-600";
      case "newspaper":
        return "from-rose-500 to-rose-600";
      case "social":
        return "from-teal-500 to-teal-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "en_cours":
        return (
          <Badge className="bg-blue-50 text-[#0066b3] border border-blue-100 font-medium text-xs">
            En cours
          </Badge>
        );
      case "termine":
        return (
          <Badge className="bg-green-50 text-[#a8cf45] border border-green-100 font-medium text-xs">
            Terminé
          </Badge>
        );
      case "a_venir":
        return (
          <Badge className="bg-amber-50 text-amber-700 border border-amber-100 font-medium text-xs">
            À venir
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-50 text-gray-600 border border-gray-200 font-medium text-xs">
            {status || "Inconnu"}
          </Badge>
        );
    }
  };

  const getAssignmentStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "en_attente":
        return (
          <Badge className="bg-amber-50 text-amber-700 border border-amber-100 font-medium text-xs">
            En attente
          </Badge>
        );
      case "accepte":
        return (
          <Badge className="bg-green-50 text-[#a8cf45] border border-green-100 font-medium text-xs">
            Accepté
          </Badge>
        );
      case "refuse":
        return (
          <Badge className="bg-red-50 text-red-600 border border-red-100 font-medium text-xs">
            Refusé
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-50 text-gray-600 border border-gray-200 font-medium text-xs">
            {status || "Non assigné"}
          </Badge>
        );
    }
  };

  const planTasks: Task[] = selectedPlan
    ? selectedPlan.planTasks
        .map((pt) => pt.task)
        .filter(
          (task) => !userRole || task.role === null || task.role === userRole
        )
    : [];

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
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

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "haute":
        return "bg-red-100 text-red-800";
      case "moyenne":
        return "bg-amber-100 text-amber-800";
      case "basse":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "en_cours":
        return "bg-blue-50 text-[#0066b3] border border-blue-100";
      case "termine":
      case "complété":
        return "bg-green-50 text-[#a8cf45] border border-green-100";
      case "en_attente":
        return "bg-amber-50 text-amber-700 border border-amber-100";
      case "annulé":
      case "refusé":
        return "bg-red-50 text-red-600 border border-red-100";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200";
    }
  };

  return (
    <div
      className={`${
        inter.variable
      } font-sans min-h-screen bg-[#f5f5f5] text-[#333333] participant-view-mobile ${
        isMobile ? "mobile-safe-area" : ""
      }`}
    >
      <style jsx global>{`
        html {
          --primary: ${theme.colors.primary.DEFAULT};
          --primary-hover: ${theme.colors.primary.hover};
          --success: ${theme.colors.secondary.DEFAULT};
        }

        .btn-primary {
          background-color: ${theme.colors.primary.DEFAULT};
          color: white;
        }
        .btn-primary:hover {
          background-color: ${theme.colors.primary.hover};
        }

        .card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
        }
        .card:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .badge {
          font-weight: 500;
          border-radius: 9999px;
          padding: 0.25rem 0.75rem;
          font-size: 0.75rem;
          line-height: 1rem;
        }

        @media (max-width: 768px) {
          .mobile-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }

          .mobile-hidden {
            display: none !important;
          }

          .mobile-compact {
            padding: 0.75rem !important;
          }

          .mobile-text-sm {
            font-size: 0.875rem !important;
          }
        }
      `}</style>

      {/* Header Mobile Optimized */}
      <header className="sticky top-0 z-50 bg-[#0066b3] text-white shadow-lg">
        <div className="container mx-auto px-3 py-2">
          {isMobile ? (
            // Mobile Header Layout
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <div className="relative w-7 h-7 bg-white p-1 rounded-md flex-shrink-0">
                  <Image
                    src="/delice.webp"
                    alt="Logo Délice"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-sm font-bold text-white truncate">
                    {data?.simulation.title || "Simulation"}
                  </h1>
                  {userRole && (
                    <div className="mt-0.5">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {userRole}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-white text-[#0066b3] hover:bg-opacity-90 hover:bg-white text-xs px-2 py-1 h-8"
                  onClick={handleComposeClick}
                >
                  <Plus className="h-3 w-3" />
                </Button>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 p-1 h-8 w-8"
                    >
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <Grid3X3 className="h-4 w-4" />
                        Menu Navigation
                      </SheetTitle>
                    </SheetHeader>
                    <div className="py-4 space-y-4">
                      <Link
                        href="/simulation"
                        className="flex items-center gap-2 text-gray-700 hover:text-[#0066b3] p-2 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Retour aux simulations
                      </Link>

                      <div className="border-t pt-4">
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">
                          Navigation rapide
                        </h3>
                        <div className="space-y-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-left"
                            onClick={() => setActiveTab("overview")}
                          >
                            <Grid3X3 className="h-4 w-4 mr-2" />
                            Aperçu
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-left"
                            onClick={() => setActiveTab("tasks")}
                          >
                            <List className="h-4 w-4 mr-2" />
                            Tâches
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-left"
                            onClick={() => setActiveTab("communications")}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Communications
                          </Button>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          ) : (
            // Desktop Header Layout
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="relative w-8 h-8 bg-white p-1 rounded-md">
                  <Image
                    src="/delice.webp"
                    alt="Logo Délice"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <h1 className="text-lg font-bold text-white truncate max-w-[120px] md:max-w-none">
                  {data?.simulation.title || "Tableau de bord"}
                </h1>
              </div>

              <div className="text-center flex-1 px-2">
                <h1 className="text-base md:text-lg font-bold truncate">
                  {data?.simulation.title}
                </h1>
                {userRole && (
                  <div className="mt-0.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Rôle: {userRole}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Link
                  href="/simulation"
                  className="flex items-center gap-1 text-white hover:text-opacity-80 transition-colors text-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Retour</span>
                </Link>

                <Button
                  variant="default"
                  className="bg-white text-[#0066b3] hover:bg-opacity-90 hover:bg-white text-sm p-2"
                  onClick={handleComposeClick}
                >
                  <span className="hidden md:inline">Nouveau</span>
                  <span className="md:hidden">+</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - Mobile/Desktop Responsive */}
      <main className="flex-1 overflow-auto">
        {isMobile ? (
          // Mobile Tabbed Layout
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm border-b border-gray-200 rounded-none h-12 mobile-tabs">
              <TabsTrigger
                value="overview"
                className="mobile-tab-trigger mobile-touch-target text-xs data-[state=active]:bg-[#0066b3] data-[state=active]:text-white mobile-haptic"
              >
                <Grid3X3 className="h-4 w-4 mr-1" />
                Aperçu
              </TabsTrigger>
              <TabsTrigger
                value="tasks"
                className="mobile-tab-trigger mobile-touch-target text-xs data-[state=active]:bg-[#0066b3] data-[state=active]:text-white mobile-haptic"
              >
                <List className="h-4 w-4 mr-1" />
                Tâches
              </TabsTrigger>
              <TabsTrigger
                value="communications"
                className="mobile-tab-trigger mobile-touch-target text-xs data-[state=active]:bg-[#0066b3] data-[state=active]:text-white mobile-haptic"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Communications
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent
                value="overview"
                className="h-full overflow-auto p-4 m-0 mobile-scroll mobile-scrollbar"
              >
                {/* Mobile Overview Content */}
                <div className="space-y-4 mobile-space-y-4">
                  <MobileSimulationOverviewCard data={data} />
                </div>
              </TabsContent>

              <TabsContent
                value="tasks"
                className="h-full overflow-auto p-4 m-0 mobile-scroll mobile-scrollbar"
              >
                {/* Mobile Tasks Content */}
                <div className="space-y-4 mobile-space-y-4">
                  <MobileTasksSection
                    plans={plans}
                    selectedPlanId={selectedPlanId}
                    setSelectedPlanId={setSelectedPlanId}
                    selectedPlan={selectedPlan}
                    planTasks={planTasks}
                    handleTaskClick={handleTaskClick}
                    formatDate={formatDate}
                    getPriorityBadgeClass={getPriorityBadgeClass}
                    getStatusBadgeClass={getStatusBadgeClass}
                  />
                </div>
              </TabsContent>

              <TabsContent
                value="communications"
                className="h-full overflow-auto p-4 m-0 mobile-scroll mobile-scrollbar"
              >
                {/* Mobile Communications Content */}
                <div className="space-y-4 mobile-space-y-4">
                  <MobileCommunicationsSection
                    data={data}
                    selectedChannel={selectedChannel}
                    handleChannelClick={handleChannelClick}
                    isComposing={isComposing}
                    handleComposeClick={handleComposeClick}
                    renderContentForChannel={renderContentForChannel}
                    getChannelGradient={getChannelGradient}
                    getIconForType={getIconForType}
                    // Form handlers
                    handleEmailSubmit={handleEmailSubmit}
                    handleSmsSubmit={handleSmsSubmit}
                    handleCallSubmit={handleCallSubmit}
                    handleAlertSubmit={handleAlertSubmit}
                    handleMemoSubmit={handleMemoSubmit}
                    handleNewsBroadcastSubmit={handleNewsBroadcastSubmit}
                    handleNewspaperSubmit={handleNewspaperSubmit}
                    handleSocialSubmit={handleSocialSubmit}
                    setIsComposing={setIsComposing}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        ) : (
          // Desktop Grid Layout
          <div className="grid grid-cols-1 gap-4 p-4">
            {/* Desktop content remains the same */}
            <DesktopLayout
              data={data}
              plans={plans}
              selectedPlanId={selectedPlanId}
              setSelectedPlanId={setSelectedPlanId}
              selectedPlan={selectedPlan}
              planTasks={planTasks}
              selectedChannel={selectedChannel}
              isComposing={isComposing}
              handleChannelClick={handleChannelClick}
              handleComposeClick={handleComposeClick}
              handleTaskClick={handleTaskClick}
              renderContentForChannel={renderContentForChannel}
              formatDate={formatDate}
              getStatusBadge={getStatusBadge}
              getAssignmentStatusBadge={getAssignmentStatusBadge}
              getPriorityBadgeClass={getPriorityBadgeClass}
              getStatusBadgeClass={getStatusBadgeClass}
              getChannelGradient={getChannelGradient}
              getIconForType={getIconForType}
              // Form handlers
              handleEmailSubmit={handleEmailSubmit}
              handleSmsSubmit={handleSmsSubmit}
              handleCallSubmit={handleCallSubmit}
              handleAlertSubmit={handleAlertSubmit}
              handleMemoSubmit={handleMemoSubmit}
              handleNewsBroadcastSubmit={handleNewsBroadcastSubmit}
              handleNewspaperSubmit={handleNewspaperSubmit}
              handleSocialSubmit={handleSocialSubmit}
              setIsComposing={setIsComposing}
            />
          </div>
        )}
      </main>

      {/* Injection Modal - Mobile Optimized */}
      {selectedInjection && (
        <MobileInjectionModal
          selectedInjection={selectedInjection}
          setSelectedInjection={setSelectedInjection}
          handleAcknowledgeInjection={handleAcknowledgeInjection}
          formatDate={formatDate}
          getInjectionGradient={getInjectionGradient}
          getIconForType={getIconForType}
          getFileType={getFileType}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}

// Mobile Components
function MobileSimulationOverviewCard({
  data,
}: {
  data: ParticipantViewData | null;
}) {
  return (
    <Card className="bg-[#2a2a2a] shadow-md rounded-lg border border-white/10 mobile-card mobile-shadow-soft">
      <CardHeader className="bg-gradient-to-r from-[#008080] to-[#00b3b3] text-white rounded-t-lg p-3 mobile-gradient-bg">
        <CardTitle className="text-base font-semibold mobile-text-base">
          Aperçu de la Simulation
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4 mobile-compact">
        <p className="text-gray-300 text-sm leading-relaxed mobile-text-sm">
          {data?.simulation.description}
        </p>

        <div className="grid grid-cols-1 gap-3 mobile-space-y-3">
          <div className="bg-gradient-to-r from-[#008080]/20 to-[#00b3b3]/20 p-3 rounded-lg border border-[#008080]/30 mobile-glass-effect">
            <p className="text-[#00b3b3] text-xs font-medium uppercase tracking-wider mb-1">
              Période
            </p>
            <div className="space-y-1">
              <p className="text-gray-200 font-medium text-sm mobile-text-sm">
                Début:{" "}
                {data?.simulation.startDate
                  ? new Date(data.simulation.startDate).toLocaleDateString(
                      "fr-FR"
                    )
                  : "Non défini"}
              </p>
              <p className="text-gray-200 font-medium text-sm mobile-text-sm">
                Fin:{" "}
                {data?.simulation.endDate
                  ? new Date(data.simulation.endDate).toLocaleDateString(
                      "fr-FR"
                    )
                  : "Non défini"}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 p-3 rounded-lg border border-green-700/30 mobile-glass-effect">
            <p className="text-green-400 text-xs font-medium uppercase tracking-wider mb-1">
              Statut
            </p>
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/50 text-green-300 mobile-badge">
                {data?.simulation.status || "Inconnu"}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#008080]/30 text-[#00b3b3] mobile-badge">
                {data?.simulation.assignmentStatus || "Non assigné"}
              </span>
            </div>
          </div>

          {data?.simulation.assignments &&
            data.simulation.assignments.length > 0 && (
              <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/30 p-3 rounded-lg border border-purple-700/30 mobile-glass-effect">
                <p className="text-purple-400 text-xs font-medium uppercase tracking-wider mb-1">
                  Participants
                </p>
                <p className="text-gray-200 font-medium text-sm mobile-text-sm">
                  {data.simulation.assignments.length} participant(s) assigné(s)
                </p>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

interface MobileTasksSectionProps {
  plans: Plan[];
  selectedPlanId: string | null;
  setSelectedPlanId: (id: string | null) => void;
  selectedPlan: Plan | null;
  planTasks: Task[];
  handleTaskClick: (task: Task) => void;
  formatDate: (dateString: string) => string;
  getPriorityBadgeClass: (priority: string) => string;
  getStatusBadgeClass: (status: string) => string;
}

function MobileTasksSection({
  plans,
  selectedPlanId,
  setSelectedPlanId,
  selectedPlan,
  planTasks,
  handleTaskClick,
  formatDate,
  getPriorityBadgeClass,
  getStatusBadgeClass,
}: MobileTasksSectionProps) {
  const [isPlansExpanded, setIsPlansExpanded] = React.useState(false);

  return (
    <div className="space-y-4">
      {/* Plan Selector - Mobile Optimized */}
      <Card className="bg-[#2a2a2a] shadow-sm rounded-lg border border-white/10">
        <Collapsible open={isPlansExpanded} onOpenChange={setIsPlansExpanded}>
          <CollapsibleTrigger asChild>
            <CardHeader className="bg-gradient-to-r from-[#363636] to-[#2a2a2a] rounded-t-lg p-3 cursor-pointer hover:from-[#404040] hover:to-[#303030] transition-all">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-200 flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Plans et Tâches
                </CardTitle>
                {isPlansExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="p-4 space-y-4">
              {plans && plans.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Sélectionner un plan
                  </label>
                  <Select
                    value={selectedPlanId ?? undefined}
                    onValueChange={setSelectedPlanId}
                  >
                    <SelectTrigger className="w-full bg-[#363636] border-white/20 text-gray-200 hover:border-[#008080] focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition-colors">
                      <SelectValue placeholder="Choisir un plan..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2a2a2a] border-white/20">
                      {plans.map((plan: Plan) => (
                        <SelectItem
                          key={plan.id}
                          value={plan.id}
                          className="text-gray-200 focus:bg-[#363636] focus:text-white"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{plan.name}</span>
                            {plan.description && (
                              <span className="text-xs text-gray-400 truncate max-w-48">
                                {plan.description}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Tasks List - Mobile Optimized */}
      {selectedPlan && planTasks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Tâches du plan &quot;{selectedPlan.name}&quot;
            <span className="bg-[#363636] text-gray-300 px-2 py-0.5 rounded-full text-xs">
              {planTasks.length}
            </span>
          </h3>

          {planTasks.map((task: Task) => (
            <Card
              key={task.id}
              className="bg-[#2a2a2a] rounded-lg border border-white/10 overflow-hidden shadow-sm hover:shadow-md hover:border-[#008080]/50 transition-all duration-300 mobile-card mobile-shadow-soft mobile-haptic"
            >
              <CardContent className="p-0">
                <div
                  className="p-4 cursor-pointer hover:bg-[#363636] transition-colors mobile-touch-target"
                  onClick={() => {
                    // Feedback tactile pour mobile
                    if (typeof navigator !== "undefined" && navigator.vibrate) {
                      navigator.vibrate(30);
                    }
                    handleTaskClick(task);
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-200 text-sm line-clamp-2 mb-1 mobile-text-sm">
                        {task.title}
                      </h4>
                      {task.role && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#008080]/30 text-[#00b3b3] mobile-badge">
                          {task.role}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mobile-badge ${getPriorityBadgeClass(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mobile-badge ${getStatusBadgeClass(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-3 mb-3 mobile-text-xs">
                    {task.description || "Aucune description fournie"}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    {task.dueDate && (
                      <div className="flex items-center text-xs text-gray-400 mobile-text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Échéance: {formatDate(task.dueDate)}</span>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#008080] hover:bg-[#008080]/20 hover:text-[#00b3b3] flex items-center gap-1 text-xs font-medium px-2 py-1 h-auto mobile-button mobile-touch-target"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          typeof navigator !== "undefined" &&
                          navigator.vibrate
                        ) {
                          navigator.vibrate(50);
                        }
                        handleTaskClick(task);
                      }}
                    >
                      <span>Voir détails</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedPlan && planTasks.length === 0 && (
        <Card className="bg-[#2a2a2a] rounded-lg border border-white/10 p-6">
          <div className="text-center">
            <List className="h-8 w-8 text-gray-600 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-300 mb-1">
              Aucune tâche disponible
            </h3>
            <p className="text-xs text-gray-500">
              Aucune tâche n&apos;est assignée à votre rôle pour ce plan.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

interface MobileCommunicationsSectionProps {
  data: ParticipantViewData | null;
  selectedChannel: keyof ParticipantViewData["communications"] | null;
  handleChannelClick: (
    channel: keyof ParticipantViewData["communications"]
  ) => void;
  isComposing: boolean;
  handleComposeClick: () => void;
  renderContentForChannel: (
    channelType: keyof ParticipantViewData["communications"]
  ) => React.ReactNode;
  getChannelGradient: (channelType: string) => string;
  getIconForType: (type: string) => React.ReactElement;
  handleEmailSubmit: (formData: EmailFormData) => Promise<void>;
  handleSmsSubmit: (formData: SmsFormData) => Promise<void>;
  handleCallSubmit: (formData: CallFormData) => Promise<void>;
  handleAlertSubmit: (formData: AlertFormData) => Promise<void>;
  handleMemoSubmit: (formData: MemoFormData) => Promise<void>;
  handleNewsBroadcastSubmit: (formData: NewsBroadcastFormData) => Promise<void>;
  handleNewspaperSubmit: (formData: NewspaperFormData) => Promise<void>;
  handleSocialSubmit: (formData: SocialFormData) => Promise<void>;
  setIsComposing: (isComposing: boolean) => void;
}

function MobileCommunicationsSection({
  data,
  selectedChannel,
  handleChannelClick,
  isComposing,
  handleComposeClick,
  renderContentForChannel,
  getChannelGradient,
  getIconForType,
  handleEmailSubmit,
  handleSmsSubmit,
  handleCallSubmit,
  handleAlertSubmit,
  handleMemoSubmit,
  handleNewsBroadcastSubmit,
  handleNewspaperSubmit,
  handleSocialSubmit,
  setIsComposing,
}: MobileCommunicationsSectionProps) {
  const [isChannelsExpanded, setIsChannelsExpanded] = React.useState(true);

  // Mobile optimized communication channels
  const communicationChannels = [
    {
      key: "email",
      title: "Email",
      icon: Mail,
      count: data?.counts?.email || 0,
      injCount: data
        ? data.injections?.filter(
            (inj: Injection) => inj.type?.toLowerCase() === "email"
          ).length || 0
        : 0,
      className:
        "bg-[#008080]/20 hover:bg-[#008080]/30 border-[#008080]/30 text-[#00b3b3]",
    },
    {
      key: "sms",
      title: "SMS",
      icon: MessageSquare,
      count: data?.counts?.sms || 0,
      injCount: data
        ? data.injections?.filter(
            (inj: Injection) => inj.type?.toLowerCase() === "sms"
          ).length || 0
        : 0,
      className:
        "bg-green-900/20 hover:bg-green-900/30 border-green-700/30 text-green-400",
    },
    {
      key: "call",
      title: "Appel",
      icon: Phone,
      count: data?.counts?.call || 0,
      injCount: data
        ? data.injections?.filter(
            (inj: Injection) => inj.type?.toLowerCase() === "call"
          ).length || 0
        : 0,
      className:
        "bg-purple-900/20 hover:bg-purple-900/30 border-purple-700/30 text-purple-400",
    },
    {
      key: "alert",
      title: "Alerte",
      icon: Bell,
      count: data?.counts?.alert || 0,
      injCount: data
        ? data.injections?.filter(
            (inj: Injection) => inj.type?.toLowerCase() === "alert"
          ).length || 0
        : 0,
      className:
        "bg-amber-900/20 hover:bg-amber-900/30 border-amber-700/30 text-amber-400",
    },
    {
      key: "memo",
      title: "WhatsApp",
      icon: FileText,
      count: data?.counts?.memo || 0,
      injCount: data
        ? data.injections?.filter(
            (inj: Injection) => inj.type?.toLowerCase() === "memo"
          ).length || 0
        : 0,
      className:
        "bg-indigo-900/20 hover:bg-indigo-900/30 border-indigo-700/30 text-indigo-400",
    },
    {
      key: "newsBroadcast",
      title: "News",
      icon: Newspaper,
      count: data?.counts?.newsBroadcast || 0,
      injCount: data
        ? data.injections?.filter((inj: Injection) => {
            if (!inj.type) return false;
            const normalizedType = inj.type.toUpperCase().replace(/_/g, "");
            return normalizedType === "NEWSBROADCAST";
          }).length || 0
        : 0,
      className:
        "bg-pink-900/20 hover:bg-pink-900/30 border-pink-700/30 text-pink-400",
    },
    {
      key: "newspaper",
      title: "Journal",
      icon: Rss,
      count: data?.counts?.newspaper || 0,
      injCount: data
        ? data.injections?.filter(
            (inj: Injection) => inj.type?.toLowerCase() === "newspaper"
          ).length || 0
        : 0,
      className:
        "bg-rose-900/20 hover:bg-rose-900/30 border-rose-700/30 text-rose-400",
    },
    {
      key: "social",
      title: "Social",
      icon: Users,
      count: data?.counts?.social || 0,
      injCount: data
        ? data.injections?.filter((inj: Injection) => {
            if (!inj.type) return false;
            const normalizedType = inj.type.toUpperCase().replace(/_/g, "");
            return (
              normalizedType === "SOCIAL" || normalizedType === "SOCIALMEDIA"
            );
          }).length || 0
        : 0,
      className:
        "bg-teal-900/20 hover:bg-teal-900/30 border-teal-700/30 text-teal-400",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Communication Channels - Mobile Grid */}
      <Card className="bg-white shadow-sm rounded-lg border border-gray-200">
        <Collapsible
          open={isChannelsExpanded}
          onOpenChange={setIsChannelsExpanded}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="bg-gradient-to-r from-[#0066b3] to-[#0083d1] rounded-t-lg p-3 cursor-pointer">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Canaux de Communication
                </CardTitle>
                {isChannelsExpanded ? (
                  <ChevronUp className="h-4 w-4 text-white/80" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-white/80" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-3">
                {communicationChannels.map((channel) => (
                  <Card
                    key={channel.key}
                    className={`cursor-pointer transition-all duration-200 border mobile-card mobile-haptic ${
                      channel.className
                    } ${
                      selectedChannel === channel.key
                        ? "ring-2 ring-blue-500 ring-opacity-50"
                        : ""
                    }`}
                    onClick={() => {
                      // Feedback tactile pour mobile
                      if (
                        typeof navigator !== "undefined" &&
                        navigator.vibrate
                      ) {
                        navigator.vibrate(50);
                      }
                      handleChannelClick(
                        channel.key as keyof ParticipantViewData["communications"]
                      );
                    }}
                  >
                    <CardContent className="p-3 text-center mobile-touch-target">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="p-2 rounded-full bg-white/50 mobile-will-change">
                          <channel.icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-medium mobile-text-sm">
                          {channel.title}
                        </span>
                        <div className="flex gap-1">
                          {channel.count > 0 && (
                            <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-800 mobile-badge">
                              {channel.count}
                            </span>
                          )}
                          {channel.injCount > 0 && (
                            <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-800 mobile-badge">
                              {channel.injCount}
                              <span className="mobile-notification-dot"></span>
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Selected Channel Content */}
      {selectedChannel && (
        <Card className="bg-white shadow-sm rounded-lg border border-gray-200 flex flex-col">
          <CardHeader
            className={`bg-gradient-to-r ${getChannelGradient(
              selectedChannel
            )} rounded-t-lg p-3`}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-md">
                  {getIconForType(selectedChannel)}
                </div>
                {selectedChannel === "newsBroadcast"
                  ? "Diffusion"
                  : selectedChannel.charAt(0).toUpperCase() +
                    selectedChannel.slice(1)}
              </CardTitle>
              <Button
                onClick={handleComposeClick}
                variant="outline"
                size="sm"
                className="bg-white/20 hover:bg-white/30 border-white/30 text-white hover:text-white backdrop-blur-sm"
              >
                <Plus className="h-3 w-3 mr-1" />
                Nouveau
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1">
            {!isComposing ? (
              <div className="max-h-96 overflow-y-auto p-4">
                {renderContentForChannel(selectedChannel)}
              </div>
            ) : (
              <div className="p-4">
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
          </CardContent>
        </Card>
      )}

      {!selectedChannel && (
        <Card className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center">
            <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-700 mb-1">
              Sélectionnez un canal
            </h3>
            <p className="text-xs text-gray-500">
              Choisissez un canal de communication pour voir les messages ou en
              envoyer un nouveau.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

interface DesktopLayoutProps {
  data: ParticipantViewData | null;
  plans: Plan[];
  selectedPlanId: string | null;
  setSelectedPlanId: (id: string | null) => void;
  selectedPlan: Plan | null;
  planTasks: Task[];
  selectedChannel: keyof ParticipantViewData["communications"] | null;
  isComposing: boolean;
  handleChannelClick: (
    channel: keyof ParticipantViewData["communications"]
  ) => void;
  handleComposeClick: () => void;
  handleTaskClick: (task: Task) => void;
  renderContentForChannel: (
    channelType: keyof ParticipantViewData["communications"]
  ) => React.ReactNode;
  formatDate: (dateString: string) => string;
  getStatusBadge: (status: string) => React.ReactNode;
  getAssignmentStatusBadge: (status: string) => React.ReactNode;
  getPriorityBadgeClass: (priority: string) => string;
  getStatusBadgeClass: (status: string) => string;
  getChannelGradient: (channelType: string) => string;
  getIconForType: (type: string) => React.ReactElement;
  handleEmailSubmit: (formData: EmailFormData) => Promise<void>;
  handleSmsSubmit: (formData: SmsFormData) => Promise<void>;
  handleCallSubmit: (formData: CallFormData) => Promise<void>;
  handleAlertSubmit: (formData: AlertFormData) => Promise<void>;
  handleMemoSubmit: (formData: MemoFormData) => Promise<void>;
  handleNewsBroadcastSubmit: (formData: NewsBroadcastFormData) => Promise<void>;
  handleNewspaperSubmit: (formData: NewspaperFormData) => Promise<void>;
  handleSocialSubmit: (formData: SocialFormData) => Promise<void>;
  setIsComposing: (isComposing: boolean) => void;
}

function DesktopLayout({
  data,
  plans,
  selectedPlanId,
  setSelectedPlanId,
  selectedPlan,
  planTasks,
  selectedChannel,
  isComposing,
  handleChannelClick,
  handleComposeClick,
  handleTaskClick,
  renderContentForChannel,
  formatDate,
  getStatusBadge,
  getAssignmentStatusBadge,
  getPriorityBadgeClass,
  getStatusBadgeClass,
  getChannelGradient,
  getIconForType,
  handleEmailSubmit,
  handleSmsSubmit,
  handleCallSubmit,
  handleAlertSubmit,
  handleMemoSubmit,
  handleNewsBroadcastSubmit,
  handleNewspaperSubmit,
  handleSocialSubmit,
  setIsComposing,
}: DesktopLayoutProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Overview + Tasks */}
      <div className="space-y-6">
        {/* Simulation Overview */}
        <Card className="bg-white shadow-md rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="bg-[#0066b3] text-white rounded-t-lg p-4">
            <CardTitle className="text-lg">Aperçu de la Simulation</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-700 mb-6 text-sm leading-relaxed">
              {data?.simulation.description}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">
                  Date de début
                </p>
                <p className="text-gray-900 font-semibold text-sm">
                  {formatDate(data?.simulation.startDate || "")}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">
                  Date de fin
                </p>
                <p className="text-gray-900 font-semibold text-sm">
                  {formatDate(data?.simulation.endDate || "")}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">
                  Statut
                </p>
                <div className="mt-1">
                  {getStatusBadge(data?.simulation.status || "")}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">
                  Assignation
                </p>
                <div className="mt-1">
                  {getAssignmentStatusBadge(
                    data?.simulation.assignmentStatus || ""
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Section */}
        <Card className="bg-white shadow-md rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="bg-[#f8f9fa] border-b border-gray-200 rounded-t-lg p-4">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Plans et Tâches
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {plans && plans.length > 0 && (
              <div className="mb-6">
                <Select
                  value={selectedPlanId ?? undefined}
                  onValueChange={setSelectedPlanId}
                >
                  <SelectTrigger className="w-full bg-white border-gray-300 hover:border-[#0066b3] focus:ring-2 focus:ring-[#0066b3] focus:border-[#0066b3] transition-colors">
                    <SelectValue placeholder="Sélectionner un plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan: Plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedPlan && planTasks.length > 0 && (
              <div className="space-y-4">
                {planTasks.map((task: Task) => (
                  <Card
                    key={task.id}
                    className="border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={() => handleTaskClick(task)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                          {task.title}
                        </h3>
                        <div className="flex gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                              task.status
                            )}`}
                          >
                            {task.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                        {task.description || "Aucune description fournie"}
                      </p>
                      {task.dueDate && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Échéance: {formatDate(task.dueDate)}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Communications */}
      <div className="space-y-6">
        {/* Communication Channels */}
        <Card className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-[#0066b3] to-[#0083d1] p-4">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Canaux de Communication
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-3">
              {[
                {
                  key: "email",
                  title: "Email",
                  icon: Mail,
                  className:
                    "bg-red-50 hover:bg-red-100 border-red-100 text-red-600",
                },
                {
                  key: "sms",
                  title: "SMS",
                  icon: MessageSquare,
                  className:
                    "bg-green-50 hover:bg-green-100 border-green-100 text-green-600",
                },
                {
                  key: "call",
                  title: "Appel",
                  icon: Phone,
                  className:
                    "bg-purple-50 hover:bg-purple-100 border-purple-100 text-purple-600",
                },
                {
                  key: "alert",
                  title: "Alerte",
                  icon: Bell,
                  className:
                    "bg-amber-50 hover:bg-amber-100 border-amber-100 text-amber-600",
                },
                {
                  key: "memo",
                  title: "WhatsApp",
                  icon: FileText,
                  className:
                    "bg-indigo-50 hover:bg-indigo-100 border-indigo-100 text-indigo-600",
                },
                {
                  key: "newsBroadcast",
                  title: "News",
                  icon: Newspaper,
                  className:
                    "bg-pink-50 hover:bg-pink-100 border-pink-100 text-pink-600",
                },
                {
                  key: "newspaper",
                  title: "Journal",
                  icon: Rss,
                  className:
                    "bg-rose-50 hover:bg-rose-100 border-rose-100 text-rose-600",
                },
                {
                  key: "social",
                  title: "Social",
                  icon: Users,
                  className:
                    "bg-teal-50 hover:bg-teal-100 border-teal-100 text-teal-600",
                },
              ].map((channel) => (
                <CommunicationChannelCard
                  key={channel.key}
                  title={channel.title}
                  count={
                    data?.counts?.[channel.key as keyof typeof data.counts] || 0
                  }
                  injCount={0} // Calculate injection count here
                  onClick={() =>
                    handleChannelClick(
                      channel.key as keyof ParticipantViewData["communications"]
                    )
                  }
                  icon={channel.icon}
                  className={channel.className}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Communication Content */}
        <Card className="bg-white shadow-sm rounded-lg border border-gray-100 flex-1 flex flex-col">
          <CardHeader
            className={`bg-gradient-to-r ${
              selectedChannel
                ? getChannelGradient(selectedChannel)
                : "from-gray-100 to-gray-200"
            } rounded-t-lg p-4`}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                {selectedChannel && getIconForType(selectedChannel)}
                {selectedChannel
                  ? selectedChannel === "newsBroadcast"
                    ? "Diffusion"
                    : selectedChannel.charAt(0).toUpperCase() +
                      selectedChannel.slice(1)
                  : "Sélectionnez un canal"}
              </CardTitle>
              {selectedChannel && (
                <Button
                  onClick={handleComposeClick}
                  variant="outline"
                  className="bg-white/20 hover:bg-white/30 border-white/30 text-white hover:text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nouveau
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-0">
            {selectedChannel ? (
              <ScrollArea className="h-96">
                <div className="p-4">
                  {!isComposing ? (
                    renderContentForChannel(selectedChannel)
                  ) : (
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
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Aucun canal sélectionné
                </h3>
                <p className="text-sm text-gray-500">
                  Sélectionnez un canal de communication pour afficher son
                  contenu ou créer un nouveau message.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface MobileInjectionModalProps {
  selectedInjection: Injection;
  setSelectedInjection: (injection: Injection | null) => void;
  handleAcknowledgeInjection: (injectionId: string) => Promise<void>;
  formatDate: (dateString: string) => string;
  getInjectionGradient: (type: string) => string;
  getIconForType: (type: string) => React.ReactElement;
  getFileType: (filename: string) => string;
  isMobile: boolean;
}

function MobileInjectionModal({
  selectedInjection,
  setSelectedInjection,
  handleAcknowledgeInjection,
  formatDate,
  getInjectionGradient,
  getIconForType,
  getFileType,
  isMobile,
}: MobileInjectionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card
        className={`bg-white shadow-xl rounded-lg border border-gray-100 overflow-hidden flex flex-col ${
          isMobile
            ? "w-full h-full max-w-none rounded-none"
            : "w-full max-w-lg max-h-[90vh] mx-4"
        }`}
      >
        <CardHeader
          className={`bg-gradient-to-r ${getInjectionGradient(
            selectedInjection.type
          )} p-4`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2 bg-white/20 rounded-md flex-shrink-0">
                {getIconForType(selectedInjection.type)}
              </div>
              <h2 className="text-lg font-bold text-white truncate">
                {selectedInjection.title}
              </h2>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="text-white/80 hover:bg-white/20 hover:text-white"
              onClick={() => setSelectedInjection(null)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/90">
            <div className="flex items-center bg-white/20 px-3 py-1 rounded-full">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(selectedInjection.createdAt)}</span>
            </div>
            {selectedInjection.scenarioName && (
              <div className="flex items-center bg-white/20 px-3 py-1 rounded-full">
                <FileText className="h-4 w-4 mr-2" />
                <span className="truncate">
                  Scénario: {selectedInjection.scenarioName}
                </span>
              </div>
            )}
            {!selectedInjection.acknowledged && (
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <span className="h-2 w-2 rounded-full bg-yellow-300 mr-2 animate-pulse"></span>
                Non lu
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4">
          <div className="prose prose-sm max-w-none text-gray-700 mb-6 whitespace-pre-line break-words">
            {selectedInjection.content}
          </div>

          {selectedInjection.imageUrl && (
            <div className="mb-6 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <Image
                src={selectedInjection.imageUrl}
                alt={selectedInjection.title ?? "Image d'injection"}
                width={800}
                height={450}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {selectedInjection.videoUrl && (
            <div className="mb-6 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              {selectedInjection.videoUrl.includes("youtube.com") ? (
                <div className="aspect-video w-full">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${
                      selectedInjection.videoUrl.split("v=")[1]?.split("&")[0]
                    }`}
                    frameBorder="0"
                    allowFullScreen
                    title="Vidéo YouTube"
                  />
                </div>
              ) : (
                <video
                  src={selectedInjection.videoUrl}
                  controls
                  className="w-full aspect-video"
                />
              )}
            </div>
          )}

          {selectedInjection.attachments &&
            selectedInjection.attachments.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Paperclip className="h-4 w-4 mr-2 text-gray-500" />
                  Pièces jointes ({selectedInjection.attachments.length})
                </h4>
                <div className="space-y-2">
                  {selectedInjection.attachments.map(
                    (attachment, index: number) => (
                      <a
                        key={index}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        download
                      >
                        <div className="bg-blue-100 p-2 rounded-md mr-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {attachment.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {getFileType(attachment.name)}
                          </p>
                        </div>
                        <Download className="h-4 w-4 text-gray-400 ml-2" />
                      </a>
                    )
                  )}
                </div>
              </div>
            )}
        </CardContent>

        {!selectedInjection.acknowledged && (
          <div className="border-t border-gray-100 p-4">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => setSelectedInjection(null)}
              >
                Fermer
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  handleAcknowledgeInjection(selectedInjection.id);
                  setSelectedInjection(null);
                }}
              >
                <Check className="h-4 w-4 mr-2" />
                Marquer comme lu
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
