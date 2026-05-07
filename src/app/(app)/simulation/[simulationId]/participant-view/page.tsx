"use client";

import { Inter } from "next/font/google";
import { Badge } from "@/components/ui/badge";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast as sonnerToast } from "sonner";

import { 
  AlertCircle, Bell, Calendar, Check, Clock, Download, FileText, 
  Mail, MessageSquare, Newspaper, Paperclip, Phone, Plus, Rss, 
  User, Users, X, User2, Heart, Repeat2, Share2, Zap, Sparkles, Loader2, Search,
  ChevronRight
} from "lucide-react";
import Image from "next/image";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";

import { 
  Simulation, Assignment, Communication, Injection, ParticipantViewData, 
  ChannelKey, CombinedContentItem 
} from "./types";
import { 
  cybergTheme, formatDate, participantLogo, 
  getChannelGradient, getInjectionGradient 
} from "./constants";
import { getIconForType } from "./icons";

import { ChannelSidebar } from "./components/ChannelSidebar";
import { CommunicationFeed } from "./components/CommunicationFeed";
import { InjectionModal } from "./components/InjectionModal";
import { CommunicationModal } from "./components/CommunicationModal";
import { ReportModal } from "./components/ReportModal";

import EmailComposeForm, { EmailFormData } from "@/components/participant-mode/communication-forms/EmailComposeForm";
import SmsComposeForm, { SmsFormData } from "@/components/participant-mode/communication-forms/SmsComposeForm";
import CallComposeForm, { CallFormData } from "@/components/participant-mode/communication-forms/CallComposeForm";
import AlertComposeForm, { AlertFormData } from "@/components/participant-mode/communication-forms/AlertComposeForm";
import MemoComposeForm, { MemoFormData } from "@/components/participant-mode/communication-forms/MemoComposeForm";
import NewsBroadcastComposeForm, { NewsBroadcastFormData } from "@/components/participant-mode/communication-forms/NewsBroadcastComposeForm";
import NewspaperComposeForm, { NewspaperFormData } from "@/components/participant-mode/communication-forms/NewspaperComposeForm";
import SocialComposeForm, { SocialFormData } from "@/components/participant-mode/communication-forms/SocialComposeForm";
import Logo from "@/components/Logo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Utility functions moved to constants.ts or components

const defaultCounts = {
  email: 0,
  call: 0,
  sms: 0,
  alert: 0,
  memo: 0,
  newsBroadcast: 0,
  newspaper: 0,
  social: 0,
  report: 0,
};

export default function ParticipantViewFixedPage() {
  const { data: session } = useSession();
  const { theme, resolvedTheme } = useTheme();
  const params = useParams();
  const simulationId = params.simulationId as string;
  const { toast } = useToast();
  const [data, setData] = useState<ParticipantViewData | null>(null);
  const dataRef = useRef<ParticipantViewData | null>(null);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const [selectedChannel, setSelectedChannel] = useState<
    keyof ParticipantViewData["communications"] | null
  >(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedInjection, setSelectedInjection] = useState<Injection | null>(
    null
  );
  const [selectedCommunication, setSelectedCommunication] =
    useState<Communication | null>(null);
  const [selectedReport, setSelectedReport] = useState<{
    filePath: string;
    fileName: string;
    reportId?: string;
  } | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportTitle, setReportTitle] = useState<string>("");
  const [reportDescription, setReportDescription] = useState<string>("");
  const [reportUploading, setReportUploading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Réf pour suivre les injections déjà affichées en modale pour éviter de les remontrer
  const shownInjectionIds = useRef(new Set<string>());

  // Fonction utilitaire pour les classes conditionnelles basées sur le thème
  // getThemeClasses removed — not used in this component

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

  // Fonction pour jouer une notification sonore pour les communications (différente des injections)
  const playCommunicationNotification = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;

      // Créer une séquence de deux notes pour différencier des injections
      const playNote = (
        frequency: number,
        startTime: number,
        duration: number
      ) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, startTime);

        gainNode.gain.setValueAtTime(0.2, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);

        return oscillator;
      };

      // Jouer deux notes successives (do-mi) pour créer un son distinctif
      const currentTime = audioContext.currentTime;
      playNote(523, currentTime, 0.15); // Do (C5)
      playNote(659, currentTime + 0.15, 0.15); // Mi (E5)
    } catch (error) {
      console.error(
        "Erreur lors de la lecture de la notification de communication:",
        error
      );
      playBeep();
    }
  }, [playBeep]);

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

  const currentTeamId = useMemo(() => {
    if (!data?.simulation?.assignments || !session?.user?.id) {
      return null;
    }

    const assignment = data.simulation.assignments.find(
      (item) => item.userId === session.user.id
    );

    return assignment?.teamId || null;
  }, [data?.simulation?.assignments, session?.user?.id]);

  const currentTeamName = useMemo(() => {
    if (!data?.simulation?.assignments || !session?.user?.id) {
      return null;
    }

    const assignment = data.simulation.assignments.find(
      (item) => item.userId === session.user.id
    );

    return assignment?.team?.name || null;
  }, [data?.simulation?.assignments, session?.user?.id]);

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
      if (dataRef.current) {
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
          const previousMessages = dataRef.current?.communications?.[channel] || [];
          const newMessagesCount =
            currentMessages.length - previousMessages.length;

          if (newMessagesCount > 0) {
            newMessages[channel] = newMessagesCount;
          }
        });

        // Afficher des notifications pour les nouveaux messages
        if (Object.keys(newMessages).length > 0) {
          // Jouer la notification sonore pour les communications
          playCommunicationNotification();

          (Object.entries(newMessages) as [string, number][]).forEach(
            ([channel, count]) => {
              const displayName =
                channel.toLowerCase() === "memo" ? "WhatsApp" : channel;
              toast({
                title: "Nouveaux messages",
                description: `${count} nouveau(x) message(s) dans ${displayName}`,
                variant: "default",
                duration: 5000,
              });
            }
          );
        }

        // Vérifier les nouvelles injections
        if (newData.injections.length > (dataRef.current?.injections?.length || 0)) {
          const newInjections = newData.injections.slice(
            dataRef.current?.injections?.length || 0
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
  }, [
    simulationId,
    toast,
    getUserRole,
    playNotification,
    playCommunicationNotification,
  ]);

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

  useEffect(() => {
    fetchData();
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
    }, 30000);

    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(intervalId);
  }, [fetchData, toast]);

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
        formData.to.map((recipientId: string, index: number) => {
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
        formData.to.map((recipientId: string, index: number) => {
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

  const handleReportUpload = async () => {
    if (!reportFile) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier PDF à télécharger.",
        variant: "destructive",
      });
      return;
    }

    if (reportFile.type !== "application/pdf") {
      toast({
        title: "Erreur",
        description: "Seuls les fichiers PDF sont autorisés.",
        variant: "destructive",
      });
      return;
    }

    setReportUploading(true);

    try {
      const uploadForm = new FormData();
      uploadForm.append("file", reportFile);
      uploadForm.append("name", reportTitle || reportFile.name);
      uploadForm.append(
        "description",
        reportDescription || "Rapport PDF participant"
      );
      uploadForm.append("category", "simulation-report");
      uploadForm.append("tags", "participant,report");

      const uploadResp = await fetch("/api/bia/upload-report", {
        method: "POST",
        body: uploadForm,
      });

      if (!uploadResp.ok) {
        const err = await uploadResp.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors de l'upload du rapport");
      }

      const uploadResult = await uploadResp.json();

      if (!uploadResult.success) {
        throw new Error(
          uploadResult.error || "Erreur lors de l'upload du rapport"
        );
      }

      // Poster la communication report dans le flux simulation
      const reportPayload = {
        type: "report",
        content: `Rapport PDF uploadé : ${
          uploadResult.data?.name || reportFile.name
        }`,
        subject: reportTitle || "Rapport PDF participant",
        payload: {
          reportId: uploadResult.data?.id,
          filePath: uploadResult.data?.filePath,
          originalFileName: reportFile.name,
        },
      };

      const commResp = await fetch(
        `/api/simulations/${simulationId}/communications`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reportPayload),
        }
      );

      if (!commResp.ok) {
        const err = await commResp.text();
        throw new Error(
          err || "Erreur lors de la sauvegarde de la communication"
        );
      }

      toast({
        title: "Rapport envoyé",
        description: "Votre fichier PDF a bien été uploadé et partagé.",
      });

      setReportFile(null);
      setReportTitle("");
      setReportDescription("");
      setIsComposing(false);
      setData(null);
      setLoading(true);
      await fetchData();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erreur inconnue";
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
    } finally {
      setReportUploading(false);
    }
  };

  const handleAIDraftSitRep = async () => {
    if (!data) return;
    
    try {
      setReportLoading(true);
      // Récupérer les 10 dernières injections et communications pour le contexte
      const recentInjections = data.injections.slice(-10);
      const recentComms = Object.values(data.communications)
        .flat()
        .slice(-10);

      const response = await fetch("/api/ai/generate-sitrep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          injections: recentInjections,
          communications: recentComms,
          simulationTitle: data.simulation.title,
        }),
      });

      if (!response.ok) throw new Error("Échec de la génération IA");
      const result = await response.json();

      setReportTitle(result.title || "");
      setReportDescription(result.content || "");
      sonnerToast.success("Brouillon de SITREP généré par l'IA");
    } catch (error) {
      console.error(error);
      sonnerToast.error("Erreur lors de la génération IA");
    } finally {
      setReportLoading(false);
    }
  };

  const handleMemoSubmit = async (formData: MemoFormData) => {
    try {
      // If formData.to exists (array of recipient IDs), send one request per recipient like SMS
      if (formData.to && formData.to.length > 0) {
        if (
          !formData.recipientPhones ||
          formData.to.length !== formData.recipientPhones.length
        ) {
          throw new Error("Erreur dans la liste des destinataires");
        }

        const results = await Promise.allSettled(
          formData.to.map((recipientId: string, index: number) => {
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
        // Legacy single send using phone field
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

      if (!response.ok) throw new Error("Failed to send SITREP");

      // Afficher immédiatement le succès à l'utilisateur
      toast({
        title: "Succès",
        description:
          "SITREP créé avec succès. Les emails PDF sont en cours d'envoi...",
      });
      setIsComposing(false);
      setData(null);
      setLoading(true);
      fetchData();

      // Envoyer les emails en arrière-plan (non-bloquant)
      const recipients = [
        "walaeddine1207@gmail.com",
        "rriahi@grssconsulting.com",
      ];

      // Fire-and-forget: on n'attend pas la réponse
      Promise.all(
        recipients.map(async (recipientEmail) => {
          const response = await fetch(
            `/api/simulations/${simulationId}/sitrep/send-email`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: formData.title,
                content: formData.content,
                recipientEmail,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.details ||
                errorData.error ||
                `Erreur HTTP ${response.status}`
            );
          }

          return response.json();
        })
      )
        .then(() => {
          // Email envoyé silencieusement en arrière-plan (pas de notification)
          console.log("✅ Emails SITREP envoyés avec succès");
        })
        .catch((emailError) => {
          // Log l'erreur sans afficher de notification à l'utilisateur
          console.error("❌ Erreur d'envoi email SITREP:", emailError);
        });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le SITREP.",
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
            (p: { user?: { id?: string }; teamId?: string | null }) =>
              p.user?.id !== session?.user?.id &&
              (!currentTeamId || p.teamId === currentTeamId)
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
          (r: PromiseSettledResult<any>) => r.status === "fulfilled"
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
        formData.to.map((recipientId: string, index: number) => {
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
    payload?: Record<string, unknown>;
    attachments?: {
      type: string;
      url: string;
      name: string;
    }[];
  };

  // Utility functions moved to components

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "en_cours":
      case "ongoing":
      case "in_progress":
      case "open":
        return (
          <Badge className="bg-blue-50 text-[#0066b3] border border-blue-100 font-medium">
            En cours
          </Badge>
        );
      case "termine":
      case "completed":
      case "resolved":
      case "closed":
        return (
          <Badge className="bg-green-50 text-[#a8cf45] border border-green-100 font-medium">
            Terminé
          </Badge>
        );
      case "a_venir":
      case "upcoming":
        return (
          <Badge className="bg-amber-50 text-amber-700 border border-amber-100 font-medium">
            À venir
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-50 text-gray-600 border border-gray-200 font-medium">
            {status ? status : "Inconnu"}
          </Badge>
        );
    }
  };

  const getAssignmentStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "en_attente":
      case "pending":
        return (
          <Badge className="bg-amber-50 text-amber-700 border border-amber-100 font-medium">
            En attente
          </Badge>
        );
      case "accepte":
      case "accepted":
      case "assigned":
        return (
          <Badge className="bg-green-50 text-[#a8cf45] border border-green-100 font-medium">
            Assigné
          </Badge>
        );
      case "refuse":
      case "rejected":
      case "declined":
        return (
          <Badge className="bg-red-50 text-red-600 border border-red-100 font-medium">
            Refusé
          </Badge>
        );
      case "non_assigné":
      case "non assigné":
      case "non assigne":
      case "not_assigned":
      case "unassigned":
      case "non assigned":
      case "none":
      case "":
        return (
          <Badge className="bg-gray-50 text-gray-600 border border-gray-200 font-medium">
            Non assigné
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

  const isLight = resolvedTheme === "light";

  return ( 
    <div 
      className={`min-h-screen flex flex-col font-sans transition-colors duration-150 selection:bg-[#D97706]/30`}
      style={{ 
        backgroundColor: isLight ? "#FAF9F5" : "#1C1917",
        color: isLight ? "#1C1917" : "#FAFAF9"
      }}
    >
      {/* 🔝 TOPBAR — Simplifiée */}
      <header 
        className="h-14 flex items-center justify-between px-4 sticky top-0 z-50 backdrop-blur-md transition-colors duration-150"
        style={{ 
          backgroundColor: isLight ? "#FFFFFF" : "#1A1816", 
          borderBottom: isLight ? "1px solid #E4E2DC" : "1px solid #33302D" 
        }}
      >
        {/* Logo zone (gauche) */}
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <div className="w-px h-6 bg-[#33302D] mx-1 hidden sm:block"></div>
          <div className="flex flex-col leading-tight">
            <span className={`text-[14px] font-semibold ${isLight ? "text-stone-900" : "text-[#FAFAF9]"}`}>
              {data?.simulation?.title || "Simulation"}
            </span>
            <span className="text-[11px] text-[#78716C]">
              Espace opérationnel
            </span>
          </div>
        </div>

        {/* Centre — Equipe & Rôle */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#78716C]">Équipe</span>
            <span className={`text-[13px] font-medium ${isLight ? "text-stone-800" : "text-[#FAFAF9]"}`}>
              {currentTeamName || "Équipe de sécurité"}
            </span>
          </div>
          <div className="w-px h-6 bg-[#33302D]"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#78716C]">Rôle</span>
            <span className="text-[13px] font-medium text-[#D97706]">
              {session?.user?.role?.toLowerCase() || "participant"}
            </span>
          </div>
        </div>

        {/* Droite — Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />
          <button className={`p-2 transition-colors ${isLight ? "text-stone-500 hover:text-stone-800" : "text-[#78716C] hover:text-[#FAFAF9]"}`}>
            <Zap className="w-5 h-5" /> 
          </button>
          <Button 
            onClick={() => setIsComposing(true)}
            className="rounded-lg px-3.5 py-2 text-[13px] font-medium transition-all shadow-sm hover:opacity-90"
            style={{ backgroundColor: "#D97706", color: isLight ? "#FFFFFF" : "#1C1917" }}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Communication
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* 📋 PANEL GAUCHE — "Aperçu de la Simulation" */}
        <aside 
          className="w-full md:w-[380px] lg:w-[420px] flex flex-col p-5 overflow-y-auto gap-5 transition-colors duration-150"
          style={{ 
            backgroundColor: isLight ? "#F5F4EE" : "#252220", 
            borderRight: isLight ? "1px solid #E4E2DC" : "1px solid #3C3835" 
          }}
        >
          {/* Header du panel */}
          <div className="flex flex-col gap-1">
            <h1 className={`text-[18px] font-semibold tracking-tight ${isLight ? "text-stone-950" : "text-[#FAFAF9]"}`}>
              Aperçu de la Simulation
            </h1>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#78716C]">
                Séquence opérationnelle en cours
              </span>
              <div 
                className="px-2 py-0.5 rounded-md text-[11px] font-medium"
                style={{ 
                  backgroundColor: isLight ? "#FAF9F5" : "#2E2B28", 
                  border: isLight ? "1px solid #E4E2DC" : "1px solid #57534E", 
                  color: isLight ? "#57534E" : "#A8A29E" 
                }}
              >
                {data?.simulation?.status || "planned"}
              </div>
            </div>
          </div>

          {/* Card Principale - Infos Simulation */}
          <div 
            className="rounded-xl p-5 flex flex-col transition-colors duration-150"
            style={{ 
              backgroundColor: isLight ? "#FFFFFF" : "#2E2B28", 
              border: isLight ? "1px solid #E4E2DC" : "1px solid #3C3835" 
            }}
          >
            <h2 
              className={`text-[16px] font-medium pb-3 mb-4 ${isLight ? "text-stone-900 border-b border-stone-100" : "text-[#FAFAF9]"}`}
              style={isLight ? {} : { borderBottom: "1px solid #3C3835" }}
            >
              {data?.simulation?.title || "Simulation en cours"}
            </h2>

            {/* Directives stratégiques */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[11px] font-semibold text-[#D97706] uppercase tracking-wider">
                Directives stratégiques
              </h3>
              <div 
                className="p-4 rounded-lg flex flex-col gap-3 transition-colors duration-150"
                style={{ 
                  backgroundColor: isLight ? "#FAF9F5" : "#1C1917", 
                  borderLeft: "2px solid #D97706" 
                }}
              >
                {(data?.simulation?.description || "Aucune directive spécifique pour le moment.")
                  .split("\n")
                  .map((line, i) => (
                    <div key={i} className="flex gap-2.5 items-start">
                      <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-[#D97706] flex-shrink-0" />
                      <span className={`text-[13px] leading-relaxed ${isLight ? "text-stone-600" : "text-[#A8A29E]"}`}>
                        {line}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Informations système */}
            <div className="mt-6 flex flex-col gap-4">
              <h3 className="text-[11px] font-medium text-[#78716C]">
                Informations système
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-[#78716C]">Assignation</span>
                  <div 
                    className={`px-2.5 py-1.5 rounded-md text-[12px] font-medium text-center ${isLight ? "text-stone-600" : "text-[#A8A29E]"}`}
                    style={{ 
                      backgroundColor: isLight ? "#FAF9F5" : "#1C1917", 
                      border: isLight ? "1px solid #E4E2DC" : "1px solid #3C3835" 
                    }}
                  >
                    Non assigné
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-[#78716C]">Chronologie</span>
                  <div 
                    className="px-2.5 py-1.5 rounded-md text-[12px] font-medium text-[#10B981] flex items-center justify-center gap-2"
                    style={{ backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                    En cours
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card "Chronologie de la simulation" */}
          <div 
            className="rounded-xl p-5 flex flex-col gap-4 transition-colors duration-150"
            style={{ 
              backgroundColor: isLight ? "#FFFFFF" : "#2E2B28", 
              border: isLight ? "1px solid #E4E2DC" : "1px solid #3C3835" 
            }}
          >
            <h3 className={`text-[13px] font-semibold ${isLight ? "text-stone-900" : "text-[#FAFAF9]"}`}>
              Chronologie de la simulation
            </h3>
            <div className="flex flex-col gap-0 pl-1">
              {[
                { label: "Briefing initial", status: "past" },
                { label: "Activation cellule de crise", status: "current" },
                { label: "Analyse d'impact", status: "future" },
                { label: "Débriefing", status: "future" }
              ].map((step, i, arr) => (
                <div key={i} className="flex gap-4 items-stretch group">
                  <div className="flex flex-col items-center">
                    <div 
                      className={`w-2.5 h-2.5 rounded-full z-10 ${
                        step.status === "past" ? "bg-[#10B981]" : 
                        step.status === "current" ? "bg-[#D97706] animate-pulse" : 
                        (isLight ? "bg-stone-300" : "bg-[#3C3835]")
                      }`}
                    ></div>
                    {i < arr.length - 1 && (
                      <div className={`w-px flex-1 my-1 ${isLight ? "bg-stone-200" : "bg-[#3C3835]"}`}></div>
                    )}
                  </div>
                  <div className="pb-6">
                    <span className={`text-[13px] ${
                      step.status === "past" ? (isLight ? "text-stone-500" : "text-[#A8A29E]") : 
                      step.status === "current" ? (isLight ? "text-stone-900 font-bold" : "text-[#FAFAF9] font-medium") : 
                      "text-[#78716C]"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card "Actions rapides" */}
          <div 
            className="rounded-xl p-5 flex flex-col gap-4 transition-colors duration-150"
            style={{ 
              backgroundColor: isLight ? "#FFFFFF" : "#2E2B28", 
              border: isLight ? "1px solid #E4E2DC" : "1px solid #3C3835" 
            }}
          >
            <h3 className={`text-[13px] font-semibold ${isLight ? "text-stone-900" : "text-[#FAFAF9]"}`}>
              Actions rapides
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: FileText, label: "SITREP" },
                { icon: AlertCircle, label: "Incident" },
                { icon: Bell, label: "Alerte" }
              ].map((action, i) => (
                <button 
                  key={i}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border transition-all hover:scale-[1.02]"
                  style={{ 
                    backgroundColor: isLight ? "#FAF9F5" : "#1C1917", 
                    border: isLight ? "1px solid #E4E2DC" : "1px solid #3C3835" 
                  }}
                >
                  <action.icon className="w-4 h-4 text-[#78716C]" />
                  <span className={`text-[10px] font-medium text-center leading-tight ${isLight ? "text-stone-600" : "text-[#A8A29E]"}`}>
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* 📡 PANEL DROIT — "Canaux de Communication" */}
        <section 
          className="flex-1 flex flex-col overflow-hidden relative transition-colors duration-150"
          style={{ backgroundColor: isLight ? "#FAF9F5" : "#1E1C1A" }}
        >
          {/* Barre latérale des canaux (en haut ou à gauche) */}
          <div 
            className="w-full flex flex-col p-4 border-b transition-colors duration-150"
            style={{ 
              backgroundColor: isLight ? "#FFFFFF" : "#1E1C1A", 
              borderBottom: isLight ? "1px solid #E4E2DC" : "1px solid #3C3835" 
            }}
          >
            <div className="flex items-center gap-2 mb-4 px-1">
              <MessageSquare className="w-4 h-4 text-[#78716C]" />
              <h2 className={`text-[13px] font-semibold ${isLight ? "text-stone-900" : "text-[#FAFAF9]"}`}>
                Canaux de communication
              </h2>
            </div>

            <ChannelSidebar
              selectedChannel={selectedChannel}
              onChannelClick={setSelectedChannel}
              counts={data?.counts || defaultCounts}
              resolvedTheme={resolvedTheme}
            />
          </div>

          {/* Flux de communication principal */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedChannel ? (
              <CommunicationFeed
                channelType={selectedChannel}
                data={data}
                searchQuery={searchQuery}
                onViewInjection={setSelectedInjection}
                onAcknowledgeInjection={handleAcknowledgeInjection}
                onViewCommunication={setSelectedCommunication}
                onViewReport={(id, name) => {
                  setReportLoading(true);
                  setReportError(null);
                  setSelectedReport({
                    filePath: `/api/bia/download/${id}?inline=true`,
                    fileName: name,
                    reportId: id,
                  });
                }}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: "#2E2B28", border: "1px solid #3C3835" }}
                >
                  <MessageSquare className="w-8 h-8 text-[#3C3835]" />
                </div>
                <h3 className="text-[15px] font-medium text-[#57534E] mb-2">
                  Aucun canal sélectionné
                </h3>
                <p className="text-[13px] text-[#78716C] max-w-[240px] leading-relaxed">
                  Veuillez choisir un canal opérationnel ci-dessus pour consulter les messages.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Compose Form Modal */}
      {isComposing && selectedChannel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#3C3835] bg-[#1C1917] p-1 shadow-2xl">
            {selectedChannel === "email" && (
              <EmailComposeForm
                onSubmit={handleEmailSubmit}
                onCancel={() => setIsComposing(false)}
                simulationId={simulationId}
                teamId={currentTeamId}
              />
            )}
            {selectedChannel === "sms" && (
              <SmsComposeForm
                onSubmit={handleSmsSubmit}
                onCancel={() => setIsComposing(false)}
                simulationId={simulationId}
                teamId={currentTeamId}
              />
            )}
            {selectedChannel === "call" && (
              <CallComposeForm
                onSubmit={handleCallSubmit}
                onCancel={() => setIsComposing(false)}
                simulationId={simulationId}
                teamId={currentTeamId}
              />
            )}
            {selectedChannel === "alert" && (
              <AlertComposeForm
                onSubmit={handleAlertSubmit}
                onCancel={() => setIsComposing(false)}
                simulationId={simulationId}
                teamId={currentTeamId}
              />
            )}
            {selectedChannel === "memo" && (
              <MemoComposeForm
                onSubmit={handleMemoSubmit}
                onCancel={() => setIsComposing(false)}
                simulationId={simulationId}
                teamId={currentTeamId}
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
            {selectedChannel === "report" && (
              <div className="p-6 flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <h3 className="text-[16px] font-semibold text-[#FAFAF9]">Gestion des Rapports</h3>
                  <p className="text-[12px] text-[#78716C]">Générer un SITREP ou uploader un document PDF</p>
                </div>

                {/* SITREP Draft Section */}
                <div className="p-4 rounded-xl bg-[#2E2B28] border border-[#3C3835] flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[#FAFAF9]">Brouillon de SITREP</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-[11px] font-medium border-[#D97706]/40 text-[#D97706] hover:bg-[#D97706]/10"
                      onClick={handleAIDraftSitRep}
                      disabled={reportLoading}
                    >
                      {reportLoading ? (
                        <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 mr-1.5" />
                      )}
                      Générer par IA
                    </Button>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      placeholder="Titre du rapport..."
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      className="w-full bg-[#1C1917] border-[#3C3835] border rounded-lg px-3 py-2 text-[13px] text-[#FAFAF9] placeholder-[#78716C] focus:border-[#D97706] outline-none"
                    />
                    <textarea
                      placeholder="Description ou contenu du SITREP..."
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      className="w-full bg-[#1C1917] border-[#3C3835] border rounded-lg px-3 py-2 text-[13px] text-[#FAFAF9] placeholder-[#78716C] focus:border-[#D97706] outline-none min-h-[100px] resize-none"
                    />
                  </div>
                </div>

                <div className="w-full h-px bg-[#3C3835]"></div>

                {/* PDF Upload Section */}
                <div className="flex flex-col gap-3">
                  <span className="text-[13px] font-medium text-[#FAFAF9]">Upload de document PDF</span>
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => setReportFile(e.target.files?.[0] || null)}
                    />
                    <Button
                      variant="outline"
                      className="flex-1 border-dashed border-2 border-[#3C3835] hover:border-[#D97706]/40 hover:bg-[#2C2118] h-12 text-[12px] text-[#78716C]"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {reportFile ? reportFile.name : "Sélectionner un fichier PDF"}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <Button
                    variant="ghost"
                    className="text-[13px] text-[#78716C] hover:text-[#FAFAF9]"
                    onClick={() => setIsComposing(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="px-6 py-2 text-[13px] font-semibold rounded-lg"
                    style={{ backgroundColor: "#D97706", color: "#1C1917" }}
                    onClick={handleReportUpload}
                    disabled={reportUploading || (!reportFile && !reportTitle)}
                  >
                    {reportUploading ? "Envoi..." : "Envoyer le Rapport"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedInjection && (
        <InjectionModal 
          injection={selectedInjection}
          onClose={() => setSelectedInjection(null)}
          onAcknowledge={(id) => {
            handleAcknowledgeInjection(id);
            setSelectedInjection(null);
          }}
        />
      )}
      
      {selectedCommunication && (
        <CommunicationModal 
          communication={selectedCommunication}
          onClose={() => setSelectedCommunication(null)}
        />
      )}
      
      {selectedReport && (
        <ReportModal 
          report={selectedReport}
          loading={reportLoading}
          onClose={() => {
            setSelectedReport(null);
            setReportError(null);
            setReportLoading(false);
          }}
        />
      )}
    </div>
  );
}
