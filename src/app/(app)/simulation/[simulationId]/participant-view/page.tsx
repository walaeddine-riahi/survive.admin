"use client";

import { Inter } from "next/font/google";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

// Configuration de la police Inter
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Configuration du thème Ooredoo
const ooredooTheme = {
  colors: {
    primary: {
      DEFAULT: "#ED1C24",
      light: "#F24950",
      dark: "#C01018",
      hover: "#E5171F",
    },
    secondary: {
      DEFAULT: "#000000",
      light: "#333333",
      dark: "#000000",
    },
    background: {
      DEFAULT: "#ffffff",
      light: "#f8fafc",
      muted: "#f1f5f9",
    },
    text: {
      primary: "#1e293b",
      secondary: "#475569",
      muted: "#64748b",
    },
    border: {
      DEFAULT: "#e2e8f0",
      hover: "#cbd5e1",
    },
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
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
import { ThemeToggle } from "@/components/ui/ThemeToggle";
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
  ChevronLeft,
  Clock,
  Download,
  FileText,
  Lock,
  Mail,
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
      className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all cursor-pointer border ${className} hover:shadow-md`}
      onClick={onClick}
    >
      <div className="flex flex-col items-center w-full">
        <div className="p-3 mb-2">
          <Icon className="h-6 w-6" />
        </div>
        <span className="text-sm font-medium text-center mb-1">{title}</span>
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
    className: "h-6 w-6 text-white drop-shadow-sm",
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
  const { theme, resolvedTheme } = useTheme();
  const params = useParams();
  const simulationId = params.simulationId as string;
  const { toast } = useToast();
  const [data, setData] = useState<ParticipantViewData | null>(null);

  const [selectedChannel, setSelectedChannel] = useState<
    keyof ParticipantViewData["communications"] | null
  >(null);
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const [selectedInjection, setSelectedInjection] = useState<Injection | null>(
    null
  );
  const audioContextRef = useRef<AudioContext | null>(null);

  // Réf pour suivre les injections déjà affichées en modale pour éviter de les remontrer
  const shownInjectionIds = useRef(new Set<string>());

  // Fonction utilitaire pour les classes conditionnelles basées sur le thème
  const getThemeClasses = useCallback(
    (lightClasses: string, darkClasses: string) => {
      return `${lightClasses} dark:${darkClasses}`;
    },
    []
  );

  // Fonction pour jouer un simple bip (solution de secours)
  const playBeep = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext)();
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
    } catch (error) {
      console.error("Erreur avec le bip de secours:", error);
    }
  }, []);

  // Fonction pour jouer une notification sonore simple
  const playNotification = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.4
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      console.error(
        "Erreur lors de la lecture de la notification sonore:",
        error
      );
      playBeep();
    }
  }, [playBeep]);

  // Ouvrir automatiquement la dernière injection non lue
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
      playNotification();
    }
  }, [data, playNotification]);

  // Fonction pour gérer le clic sur une tâche
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
              // Logique pour marquer la tâche comme terminée
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

  // Fonction pour récupérer le rôle de l'utilisateur connecté
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

      // Essayer de trouver l'assignation de l'utilisateur
      const userAssignment = assignments.find(
        (assignment) => assignment.userId === session.user.id
      );

      console.log("Assignation trouvée pour l'utilisateur:", userAssignment);

      // Retourner le rôle de l'assignation si elle existe
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

      // Vérifier s'il y a des nouvelles données par rapport à la dernière récupération
      if (data) {
        // Vérifier les nouveaux messages
        const newMessages: Record<string, number> = {};

        // Vérifier chaque type de communication
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

        // Afficher des notifications pour les nouveaux messages
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

        // Vérifier les nouvelles injections
        if (newData.injections.length > (data.injections?.length || 0)) {
          const newInjections = newData.injections.slice(
            data.injections?.length || 0
          );
          newInjections.forEach((injection: Injection) => {
            // Jouer la notification sonore
            playNotification();

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
                    // Basculer vers l'onglet approprié
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

      // Mettre à jour le rôle de l'utilisateur
      const role = getUserRole(newData);
      if (role) {
        setUserRole(role);
        setSelectedRole(role);
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

  // Nettoyage du contexte audio
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

  // Effet pour surveiller les changements de thème et forcer la synchronisation
  useEffect(() => {
    console.log(`🎨 Thème changé: ${theme} (résolu: ${resolvedTheme})`);

    // Force le re-rendu des éléments dynamiques
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute(
        "data-theme",
        resolvedTheme || "light"
      );
    }
  }, [theme, resolvedTheme]);

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

    // Nettoyer l'intervalle lors du démontage du composant
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
    // Mettre à jour l'état local immédiatement pour une meilleure réactivité
    setData((currentData) => {
      if (!currentData) return null;
      return {
        ...currentData,
        injections: currentData.injections.map((inj) =>
          inj.id === injectionId ? { ...inj, acknowledged: true } : inj
        ),
      };
    });
    setSelectedInjection(null); // Ferme la modale
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

      // Vérifier que le nombre de destinataires correspond au nombre d'emails
      if (
        !formData.toEmails ||
        formData.to.length !== formData.toEmails.length
      ) {
        throw new Error("Erreur dans la liste des destinataires");
      }

      // Envoyer un email à chaque destinataire
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

      // Vérifier s'il y a eu des erreurs
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

      // Vérifier que le nombre de destinataires correspond au nombre de numéros
      if (
        !formData.recipientPhones ||
        formData.to.length !== formData.recipientPhones.length
      ) {
        throw new Error("Erreur dans la liste des destinataires");
      }

      // Vérifier que l'utilisateur est connecté
      if (!session?.user?.id) {
        throw new Error("Vous devez être connecté pour effectuer cette action");
      }

      // Envoyer un SMS à chaque destinataire
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

      // Vérifier s'il y a eu des erreurs
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
      const requestBody = {
        type: "memo",
        subject: formData.subject,
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

      if (!response.ok) throw new Error("Failed to send memo");

      toast({ title: "Succès", description: "Memo envoyé avec succès." });
      setIsComposing(false);
      setData(null);
      setLoading(true);
      fetchData();
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le memo.",
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
            credentials: "include", // Important pour les cookies de session
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

          // Filtrer l'utilisateur actuel s'il fait partie des participants
          const otherParticipants = participants.filter(
            (p: { user?: { id?: string } }) => p.user?.id !== session?.user?.id
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

          // Envoyer une alerte à chaque participant
          const results = await Promise.allSettled(
            otherParticipants.map((p: { user?: { id?: string } }) => {
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

          // Vérifier s'il y a eu des erreurs
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
        // Envoyer aux destinataires sélectionnés
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
          // Lancer une erreur pour que le catch global puisse la gérer si nécessaire
          throw new Error(
            `${failedCount} alerte(s) n'ont pas pu être envoyée(s).`
          );
        }
      } else {
        // Cas où aucun destinataire n'est sélectionné et sendToAll est faux
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

      // Vérifier que le nombre de destinataires correspond au nombre de numéros
      if (
        !formData.toPhones ||
        formData.to.length !== formData.toPhones.length
      ) {
        throw new Error("Erreur dans la liste des destinataires");
      }

      // Vérifier que l'utilisateur est connecté
      if (!session?.user?.id) {
        throw new Error("Vous devez être connecté pour effectuer cette action");
      }

      // Envoyer un appel à chaque destinataire
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

      // Vérifier s'il y a eu des erreurs
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

      // Normaliser les types pour la comparaison (supprimer les underscores et mettre en majuscules)
      const normalizedInjType = inj.type.toUpperCase().replace(/_/g, "");
      const normalizedChannelType = channelType.toUpperCase().replace(/_/g, "");

      // Gérer les cas spéciaux
      if (normalizedChannelType === "SOCIAL") {
        return (
          normalizedInjType === "SOCIAL" || normalizedInjType === "SOCIALMEDIA"
        );
      }

      // Pour les autres types, comparer les valeurs normalisées
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
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl bg-gray-50 border-2 border-dashed border-gray-200">
          <MessageSquare className="h-10 w-10 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">
            Aucun contenu
          </h3>
          <p className="text-sm text-gray-500 max-w-xs">
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
      <div className="space-y-4">
        {combinedContent.map((item) => (
          <div
            key={item.id}
            className={`relative flex flex-col gap-3 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden 
              ${getChannelColor(item.type)} 
              ${
                item.isInjection && !item.acknowledged
                  ? "ring-1 ring-amber-500/20"
                  : "border border-gray-100"
              }
              ${
                item.isInjection ? "hover:bg-amber-50/50" : "hover:bg-gray-50"
              }`}
            tabIndex={0}
            role="button"
            aria-label={
              item.isInjection
                ? `Injection : ${item.title}`
                : `Communication : ${item.subject || "Sans sujet"}`
            }
            onClick={() =>
              item.isInjection
                ? setSelectedInjection(item as Injection)
                : undefined
            }
          >
            {/* En-tête avec icône, titre et date */}
            <div className="flex items-start justify-between p-4 pb-0">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg mt-1 ${
                    item.isInjection
                      ? "bg-amber-100 text-amber-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {getIconForType(item.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {item.isInjection
                      ? item.title
                      : item.subject || "Sans sujet"}
                  </h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
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
                  className="ml-2 bg-white hover:bg-amber-50 text-amber-600 border-amber-200 hover:border-amber-300 hover:text-amber-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAcknowledgeInjection(item.id);
                  }}
                >
                  <Check className="h-4 w-4 mr-1" />
                  <span className="text-xs">Marquer comme lu</span>
                </Button>
              )}
            </div>

            {/* Contenu du message */}
            <div className="px-4 pb-4 pt-1">
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line break-words">
                {item.content}
              </div>

              {/* Pièces jointes (si présentes) */}
              {item.attachments && item.attachments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                    <Paperclip className="h-3 w-3 mr-1.5" />
                    Pièces jointes ({item.attachments.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {item.attachments.map((attachment, idx) => (
                      <a
                        key={idx}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FileText className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                        {attachment.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Badge "Nouveau" pour les injections non lues */}
            {item.isInjection && !item.acknowledged && (
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  Nouveau
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Fonction pour obtenir le dégradé de couleur d'un canal de communication
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

  // Fonction pour obtenir le type de fichier à partir du nom de fichier
  const getFileType = (filename: string) => {
    const extension = filename.split(".").pop()?.toLowerCase() || "";
    const fileTypes: Record<string, string> = {
      // Documents
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

      // Images
      jpg: "Image",
      jpeg: "Image",
      png: "Image",
      gif: "Image",
      bmp: "Image",
      svg: "Image vectorielle",
      webp: "Image WebP",

      // Archives
      zip: "Archive ZIP",
      rar: "Archive RAR",
      "7z": "Archive 7-Zip",
      tar: "Archive TAR",
      gz: "Archive GZIP",

      // Audio/Video
      mp3: "Fichier audio",
      wav: "Fichier audio",
      mp4: "Vidéo",
      avi: "Vidéo",
      mov: "Vidéo",
      wmv: "Vidéo",
    };

    return fileTypes[extension] || `Fichier .${extension}`;
  };

  // Fonction pour obtenir le dégradé de couleur en fonction du type d'injection
  const getInjectionGradient = (type: string) => {
    switch (type.toLowerCase()) {
      case "email":
        return "from-blue-500 to-blue-600";
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
          <Badge className="bg-blue-50 text-[#0066b3] border border-blue-100 font-medium">
            En cours
          </Badge>
        );
      case "termine":
        return (
          <Badge className="bg-green-50 text-[#a8cf45] border border-green-100 font-medium">
            Terminé
          </Badge>
        );
      case "a_venir":
        return (
          <Badge className="bg-amber-50 text-amber-700 border border-amber-100 font-medium">
            À venir
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-50 text-gray-600 border border-gray-200 font-medium">
            {status || "Inconnu"}
          </Badge>
        );
    }
  };

  const getAssignmentStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "en_attente":
        return (
          <Badge className="bg-amber-50 text-amber-700 border border-amber-100 font-medium">
            En attente
          </Badge>
        );
      case "accepte":
        return (
          <Badge className="bg-green-50 text-[#a8cf45] border border-green-100 font-medium">
            Accepté
          </Badge>
        );
      case "refuse":
        return (
          <Badge className="bg-red-50 text-red-600 border border-red-100 font-medium">
            Refusé
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-50 text-gray-600 border border-gray-200 font-medium">
            {status || "Non assigné"}
          </Badge>
        );
    }
  };

  // Composant Skeleton pour le chargement
  const ParticipantViewSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-6 animate-pulse">
      <div className="md:col-span-2 space-y-6">
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-56 w-full rounded-lg" />
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-12 w-32" />
        <Skeleton className="h-[600px] w-full rounded-lg" />
      </div>
    </div>
  );

  // Affichage placeholder pendant le chargement
  if (loading) {
    return (
      <main className="flex-1 bg-background">
        <ParticipantViewSkeleton />
      </main>
    );
  }

  // Filtrer les tâches en fonction du rôle de l'utilisateur
  const planTasks: Task[] = selectedPlan
    ? selectedPlan.planTasks
        .map((pt) => pt.task)
        // Filtrer les tâches qui correspondent au rôle de l'utilisateur
        .filter(
          (task) => !userRole || task.role === null || task.role === userRole
        )
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

  // Fonction pour obtenir la classe de badge en fonction de la priorité
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "haute":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800";
      case "moyenne":
        return "bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800";
      case "basse":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800";
      default:
        return "bg-muted dark:bg-muted text-foreground dark:text-foreground border border-border dark:border-border";
    }
  };

  // Fonction pour obtenir la classe de badge en fonction du statut
  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "en_cours":
        return "bg-red-50 dark:bg-red-900/20 text-[#ED1C24] dark:text-red-400 border border-red-100 dark:border-red-800";
      case "termine":
      case "complété":
        return "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800";
      case "en_attente":
        return "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800";
      case "annulé":
      case "refusé":
        return "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800";
      default:
        return "bg-muted dark:bg-muted text-foreground dark:text-foreground border border-border dark:border-border";
    }
  };

  return (
    <div
      className={`${inter.variable} font-sans min-h-screen bg-background dark:bg-background text-foreground dark:text-foreground`}
    >
      <style jsx global>{`
        :root {
          --primary: ${ooredooTheme.colors.primary.DEFAULT};
          --primary-hover: ${ooredooTheme.colors.primary.hover};
          --success: ${ooredooTheme.colors.secondary.DEFAULT};
        }

        /* Styles pour les boutons */
        .btn-primary {
          background-color: var(--primary);
          color: white;
        }
        .btn-primary:hover {
          background-color: var(--primary-hover);
        }

        /* Styles pour les cartes - compatibles dark mode */
        .card {
          background: ${resolvedTheme === "dark" ? "rgb(24 24 27)" : "white"};
          border: 1px solid
            ${resolvedTheme === "dark" ? "rgb(39 39 42)" : "#e5e7eb"};
          border-radius: 0.5rem;
          transition: all 0.2s ease;
          color: ${resolvedTheme === "dark"
            ? "rgb(244 244 245)"
            : "rgb(24 24 27)"};
        }
        .card:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, ${resolvedTheme === "dark" ? "0.3" : "0.1"}),
            0 2px 4px -1px rgba(0, 0, 0, ${resolvedTheme === "dark" ? "0.2" : "0.06"});
        }

        /* Styles pour les badges */
        .badge {
          font-weight: 500;
          border-radius: 9999px;
          padding: 0.25rem 0.75rem;
          font-size: 0.75rem;
          line-height: 1rem;
        }

        /* Adaptations dark mode */
        .dark .bg-gray-50 {
          background-color: rgb(39 39 42) !important;
        }
        .dark .text-gray-700 {
          color: rgb(212 212 216) !important;
        }
        .dark .border-gray-200 {
          border-color: rgb(39 39 42) !important;
        }

        /* Transitions fluides pour le changement de thème */
        * {
          transition: background-color 0.3s ease, border-color 0.3s ease,
            color 0.3s ease;
        }

        /* Amélioration des couleurs de scrollbar en dark mode */
        .dark ::-webkit-scrollbar {
          background-color: rgb(39 39 42);
        }
        .dark ::-webkit-scrollbar-thumb {
          background-color: rgb(63 63 70);
        }
        .dark ::-webkit-scrollbar-thumb:hover {
          background-color: rgb(82 82 91);
        }
      `}</style>

      <header className="sticky top-0 z-50 bg-[#ED1C24] text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16 bg-white p-2 rounded-md flex items-center justify-center">
              <Image
                src="/ooredoo-logo.png"
                alt="Logo Ooredoo"
                width={56}
                height={56}
                className="object-contain"
                priority
                onError={(e) => {
                  console.error("Erreur de chargement du logo:", e);
                  // Remplacer par un logo de secours
                  const target = e.currentTarget;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML =
                      '<div class="flex items-center justify-center w-full h-full"><span class="text-red-600 text-xs font-bold bg-white px-1 rounded">OOREDOO</span></div>';
                  }
                }}
                onLoad={() => {
                  console.log("Logo chargé avec succès");
                }}
              />
            </div>
            <h1 className="text-2xl font-bold text-white">
              {data?.simulation.title || "Tableau de bord"}
            </h1>
          </div>

          <div className="text-center flex-1 px-4">
            <h1 className="text-xl md:text-2xl font-bold">
              {data?.simulation.title}
            </h1>
            {userRole && (
              <div className="mt-1">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  Rôle: {userRole}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="default"
              className="bg-white text-[#ED1C24] hover:bg-opacity-90 hover:bg-white"
              onClick={handleComposeClick}
            >
              <span className="hidden md:inline">Nouvelle Communication</span>
              <span className="md:hidden">+</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-6 overflow-auto">
        {/* Colonne de gauche : Aperçu + Plans/Tâches */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Carte Aperçu de la Simulation */}
          <Card className="bg-card dark:bg-card shadow-md rounded-lg border border-border dark:border-border hover:shadow-lg transition-shadow">
            <CardHeader className="bg-[#ED1C24] text-white rounded-t-lg p-4">
              <CardTitle className="text-xl">Aperçu de la Simulation</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 mb-6">
                {data?.simulation.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">
                    Date de début
                  </p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {formatDate(data?.simulation.startDate || "")}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">
                    Date de fin
                  </p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {formatDate(data?.simulation.endDate || "")}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">
                    Statut
                  </p>
                  <div className="mt-1">
                    {getStatusBadge(data?.simulation.status || "")}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">
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
          {/* Plans et Tâches */}
          <Card className="bg-card dark:bg-card shadow-md rounded-lg border border-border dark:border-border hover:shadow-lg transition-shadow">
            <CardHeader className="bg-muted/50 dark:bg-muted/50 border-b border-border dark:border-border rounded-t-lg p-4">
              <CardTitle className="text-lg font-semibold text-foreground dark:text-foreground">
                Plans et Tâches Associées
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Sélecteur de plan */}
              {plans && (
                <div className="mb-4">
                  <Select
                    value={selectedPlanId ?? undefined}
                    onValueChange={setSelectedPlanId}
                  >
                    <SelectTrigger className="w-full md:w-[300px] bg-background dark:bg-background border-border dark:border-border hover:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24] focus:border-[#ED1C24] transition-colors">
                      <SelectValue
                        placeholder="Sélectionner un plan"
                        className="text-foreground dark:text-foreground"
                      />
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
              {/* Affichage du rôle utilisateur, seulement si un plan est sélectionné */}
              {selectedPlan &&
                planTasks.length > 0 &&
                selectedRole &&
                selectedRole !== "all" && (
                  <div className="space-y-4">
                    <div className="prose max-w-none break-words">
                      <label className="text-sm font-medium text-foreground dark:text-foreground">
                        Votre rôle
                      </label>
                      <div className="relative">
                        <Select
                          value={selectedRole}
                          onValueChange={() => {}} // Désactive la modification
                          disabled={true}
                        >
                          <SelectTrigger className="w-full md:w-[200px] bg-muted dark:bg-muted border-border dark:border-border text-foreground dark:text-foreground cursor-default">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={selectedRole}>
                              {selectedRole}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <Lock className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                        Votre rôle est déterminé automatiquement
                      </p>
                    </div>
                  </div>
                )}
              {/* Liste dynamique des tâches filtrées par rôle */}
              {selectedPlan ? (
                planTasks.filter(
                  (task) => selectedRole === "all" || task.role === selectedRole
                ).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {planTasks
                      .filter(
                        (task) =>
                          selectedRole === "all" || task.role === selectedRole
                      )
                      .map((task) => (
                        <div
                          key={task.id}
                          className="group bg-card dark:bg-card rounded-xl border border-border dark:border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                          onClick={() => handleTaskClick(task)}
                        >
                          <CardHeader className="p-4 border-b border-border dark:border-border bg-muted/50 dark:bg-muted/50">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-foreground dark:text-foreground truncate">
                                  {task.title}
                                </h3>
                                {task.role && (
                                  <div className="mt-1 flex items-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {task.role}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-shrink-0">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(
                                    task.priority
                                  )}`}
                                >
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                            {task.dueDate && (
                              <div className="mt-2 flex items-center text-xs text-muted-foreground dark:text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground dark:text-muted-foreground" />
                                <span>
                                  Échéance: {formatDate(task.dueDate)}
                                </span>
                              </div>
                            )}
                          </CardHeader>
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground dark:text-muted-foreground line-clamp-3 mb-4">
                              {task.description || "Aucune description fournie"}
                            </p>
                            <div className="flex items-center justify-between pt-3 border-t border-border dark:border-border">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                                  task.status
                                )}`}
                              >
                                {task.status}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-[#ED1C24] hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-1.5 text-sm font-medium"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTaskClick(task);
                                }}
                              >
                                <span>Voir détails</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardContent>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full flex items-center justify-center mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground dark:text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground dark:text-foreground mb-2">
                      Aucune tâche trouvée
                    </h3>
                    <p className="text-muted-foreground dark:text-muted-foreground max-w-md">
                      Ce plan ne contient aucune tâche pour votre rôle ou le
                      plan est vide.
                    </p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground dark:text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground dark:text-foreground mb-2">
                    Aucun plan sélectionné
                  </h3>
                  <p className="text-muted-foreground dark:text-muted-foreground max-w-md">
                    Sélectionnez un plan dans la liste déroulante ci-dessus pour
                    voir les tâches associées.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne de droite : Communications & Injections */}
        <div className="md:col-span-1 flex flex-col gap-6">
          {/* Section des canaux de communication */}
          <Card className="bg-card dark:bg-card rounded-xl shadow-sm border border-border dark:border-border hover:shadow-md transition-all duration-300 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#ED1C24] to-[#F24950] p-4">
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-3">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <span>Canaux de Communication</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <CommunicationChannelCard
                  title="Email"
                  count={data?.counts?.email || 0}
                  injCount={
                    data
                      ? data.injections?.filter(
                          (inj) => inj.type?.toLowerCase() === "email"
                        ).length || 0
                      : 0
                  }
                  onClick={() => handleChannelClick("email")}
                  icon={Mail}
                  className="bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 border-red-100 dark:border-red-800 text-red-600 dark:text-red-400"
                  iconClass="text-red-500 dark:text-red-400 bg-red-500"
                />
                <CommunicationChannelCard
                  title="SMS"
                  count={data?.counts?.sms || 0}
                  injCount={
                    data
                      ? data.injections?.filter(
                          (inj) => inj.type?.toLowerCase() === "sms"
                        ).length || 0
                      : 0
                  }
                  onClick={() => handleChannelClick("sms")}
                  icon={MessageSquare}
                  className="bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-900/30 border-green-100 dark:border-green-800 text-green-600 dark:text-green-400"
                  iconClass="text-green-500 dark:text-green-400 bg-green-500"
                />
                <CommunicationChannelCard
                  title="Appel"
                  count={data?.counts?.call || 0}
                  injCount={
                    data
                      ? data.injections?.filter(
                          (inj) => inj.type?.toLowerCase() === "call"
                        ).length || 0
                      : 0
                  }
                  onClick={() => handleChannelClick("call")}
                  icon={Phone}
                  className="bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border-purple-100 dark:border-purple-800 text-purple-600 dark:text-purple-400"
                  iconClass="text-purple-500 dark:text-purple-400 bg-purple-500"
                />
                <CommunicationChannelCard
                  title="Alerte"
                  count={data?.counts?.alert || 0}
                  injCount={
                    data
                      ? data.injections?.filter(
                          (inj) => inj.type?.toLowerCase() === "alert"
                        ).length || 0
                      : 0
                  }
                  onClick={() => handleChannelClick("alert")}
                  icon={Bell}
                  className="bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 border-amber-100 dark:border-amber-800 text-amber-600 dark:text-amber-400"
                  iconClass="text-amber-500 dark:text-amber-400 bg-amber-500"
                />
                <CommunicationChannelCard
                  title="Memo"
                  count={data?.counts?.memo || 0}
                  injCount={
                    data
                      ? data.injections?.filter(
                          (inj) => inj.type?.toLowerCase() === "memo"
                        ).length || 0
                      : 0
                  }
                  onClick={() => handleChannelClick("memo")}
                  icon={FileText}
                  className="bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
                  iconClass="text-indigo-500 dark:text-indigo-400"
                />
                <CommunicationChannelCard
                  title="Diffusion de Nouvelles"
                  count={data?.counts?.newsBroadcast || 0}
                  injCount={
                    data
                      ? data.injections?.filter((inj) => {
                          if (!inj.type) return false;
                          const normalizedType = inj.type
                            .toUpperCase()
                            .replace(/_/g, "");
                          return normalizedType === "NEWSBROADCAST";
                        }).length || 0
                      : 0
                  }
                  onClick={() => handleChannelClick("newsBroadcast")}
                  icon={Newspaper}
                  className="bg-pink-50 dark:bg-pink-950/20 hover:bg-pink-100 dark:hover:bg-pink-900/30 border-pink-100 dark:border-pink-800 text-pink-600 dark:text-pink-400"
                  iconClass="text-pink-500 dark:text-pink-400"
                />
                <CommunicationChannelCard
                  title="Journal"
                  count={data?.counts?.newspaper || 0}
                  injCount={
                    data
                      ? data.injections?.filter(
                          (inj) => inj.type?.toLowerCase() === "newspaper"
                        ).length || 0
                      : 0
                  }
                  onClick={() => handleChannelClick("newspaper")}
                  icon={Rss}
                  className="bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400"
                  iconClass="text-rose-500 dark:text-rose-400"
                />
                <CommunicationChannelCard
                  title="Social"
                  className="bg-teal-50 dark:bg-teal-950/20 hover:bg-teal-100 dark:hover:bg-teal-900/30 border-teal-100 dark:border-teal-800 text-teal-600 dark:text-teal-400"
                  iconClass="text-teal-500 dark:text-teal-400"
                  count={data?.counts?.social || 0}
                  injCount={
                    data
                      ? data.injections?.filter((inj) => {
                          if (!inj.type) return false;
                          const normalizedType = inj.type
                            .toUpperCase()
                            .replace(/_/g, "");
                          return (
                            normalizedType === "SOCIAL" ||
                            normalizedType === "SOCIALMEDIA"
                          );
                        }).length || 0
                      : 0
                  }
                  onClick={() => handleChannelClick("social")}
                  icon={Users}
                />
              </div>
            </CardContent>
          </Card>
          {/* Liste des communications/injections avec ScrollArea, effet visuel, responsive */}
          <Card className="bg-card dark:bg-card shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl border border-border dark:border-border flex-1 flex flex-col overflow-hidden">
            {/* En-tête avec dégradé de couleur */}
            <CardHeader
              className={`pb-0 border-b border-border dark:border-border bg-gradient-to-r ${
                selectedChannel
                  ? getChannelGradient(selectedChannel)
                  : "from-muted to-muted"
              } rounded-t-2xl px-6 pt-6 pb-4`}
            >
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedChannel && (
                    <div className="relative">
                      <div className="absolute -inset-1 bg-white/30 rounded-xl blur-sm opacity-70 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative p-2.5 bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 shadow-sm">
                        {getIconForType(selectedChannel)}
                      </div>
                    </div>
                  )}
                  <h2 className="text-2xl font-bold text-white drop-shadow-sm">
                    {selectedChannel
                      ? selectedChannel === "newsBroadcast"
                        ? "Diffusion de Nouvelles"
                        : selectedChannel.charAt(0).toUpperCase() +
                          selectedChannel.slice(1)
                      : "Sélectionnez un canal"}
                  </h2>
                </div>
                {selectedChannel && (
                  <Button
                    onClick={handleComposeClick}
                    variant="outline"
                    className="bg-white/20 hover:bg-white/30 border-white/30 text-white hover:text-white backdrop-blur-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden md:inline">Nouveau</span>
                  </Button>
                )}
              </CardTitle>
            </CardHeader>

            {/* Contenu principal */}
            <CardContent className="flex-1 overflow-hidden p-0">
              {!selectedChannel ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground dark:text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground dark:text-foreground mb-2">
                    Aucun canal sélectionné
                  </h3>
                  <p className="text-muted-foreground dark:text-muted-foreground max-w-md">
                    Sélectionnez un canal de communication dans la liste pour
                    afficher son contenu ou en créer un nouveau.
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] w-full">
                  <div className="p-6 space-y-6">
                    {/* Contenu des communications */}
                    {!isComposing && (
                      <div className="animate-fade-in">
                        {renderContentForChannel(selectedChannel)}
                      </div>
                    )}

                    {/* Formulaire de composition */}
                    {isComposing && (
                      <div className="animate-fade-in">
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
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {selectedInjection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-3xl max-h-[90vh] bg-card dark:bg-card shadow-xl rounded-2xl border border-border dark:border-border overflow-hidden flex flex-col">
            {/* En-tête avec dégradé de couleur */}
            <div
              className={`bg-gradient-to-r ${getInjectionGradient(
                selectedInjection.type
              )} px-6 py-4 border-b border-border dark:border-border`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    {getIconForType(selectedInjection.type)}
                  </div>
                  <h2 className="text-xl font-bold text-white truncate max-w-[70%]">
                    {selectedInjection.title}
                  </h2>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white/80 hover:bg-white/20 hover:text-white"
                  aria-label="Fermer"
                  onClick={() => setSelectedInjection(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Métadonnées */}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/90">
                <div className="flex items-center bg-white/20 px-2.5 py-1 rounded-full">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  <span>{formatDate(selectedInjection.createdAt)}</span>
                </div>
                {selectedInjection.scenarioName && (
                  <div className="flex items-center bg-white/20 px-2.5 py-1 rounded-full">
                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                    <span>Scénario : {selectedInjection.scenarioName}</span>
                  </div>
                )}
                {!selectedInjection.acknowledged && (
                  <span className="ml-auto bg-white/20 px-2.5 py-1 rounded-full text-xs font-medium flex items-center">
                    <span className="h-2 w-2 rounded-full bg-yellow-300 mr-1.5 animate-pulse"></span>
                    Non lu
                  </span>
                )}
              </div>
            </div>
            <CardContent className="p-6 overflow-y-auto flex-1">
              {/* Contenu principal */}
              <div className="prose prose-sm max-w-none text-gray-700 mb-6 whitespace-pre-line break-words">
                {selectedInjection.content}
              </div>

              {/* Image */}
              {selectedInjection.imageUrl && (
                <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <Image
                    src={selectedInjection.imageUrl}
                    alt={selectedInjection.title ?? "Image d'injection"}
                    width={800}
                    height={450}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}

              {/* Vidéo */}
              {selectedInjection.videoUrl && (
                <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  {selectedInjection.videoUrl.includes("youtube.com") ? (
                    <div className="aspect-video w-full">
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${
                          selectedInjection.videoUrl
                            .split("v=")[1]
                            ?.split("&")[0]
                        }`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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

              {/* Pièces jointes */}
              {selectedInjection.attachments &&
                selectedInjection.attachments.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <Paperclip className="h-4 w-4 mr-2 text-gray-500" />
                      Pièces jointes ({selectedInjection.attachments.length})
                    </h4>
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                      {selectedInjection.attachments.map(
                        (attachment, index) => (
                          <a
                            key={index}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                            download
                          >
                            <div className="bg-blue-100 p-2 rounded-lg mr-3">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {attachment.name}
                              </p>
                              <p className="text-xs text-gray-500">
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

              {/* Bouton d'action */}
              {!selectedInjection.acknowledged && (
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    className="mr-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => setSelectedInjection(null)}
                  >
                    Fermer
                  </Button>
                  <Button
                    onClick={() => {
                      handleAcknowledgeInjection(selectedInjection.id);
                      setSelectedInjection(null);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
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
