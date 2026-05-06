"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Edit3,
  Bot,
  ThumbsUp,
  MessageSquare,
  Mic,
  MicOff,
  Send,
  Volume2,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VoiceAssistantAvatar } from "@/components/bia/voice-assistant-avatar";

// Types pour Web Speech API
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface ExtractedFieldReview {
  name: string;
  label: string;
  value: unknown;
  type: "text" | "textarea" | "number" | "select";
  options?: string[];
  category?: string;
  confidence?: "high" | "medium" | "low";
}

interface ConfirmationAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  extractedFields: ExtractedFieldReview[];
  onComplete: (confirmedData: Record<string, unknown>) => void;
  title?: string;
  description?: string;
}

export function ConfirmationAssistant({
  isOpen,
  onClose,
  extractedFields,
  onComplete,
  title = "Validation des Données Extraites",
  description = "L'IA a extrait des informations du PDF. Vérifiez et validez chaque donnée.",
}: ConfirmationAssistantProps) {
  console.log("🎨 ConfirmationAssistant rendu:", {
    isOpen,
    fieldsCount: extractedFields.length,
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [confirmedData, setConfirmedData] = useState<Record<string, unknown>>(
    {}
  );
  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set());
  const [currentValue, setCurrentValue] = useState<unknown>(null);

  // États pour la conversation IA
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [chatInput, setChatInput] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] =
    useState<SpeechRecognitionInstance | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // États pour le mode conversation orale
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceRecognition, setVoiceRecognition] =
    useState<SpeechRecognitionInstance | null>(null);

  // État pour la dictée manuelle (mode non-vocal)
  const [isManualDictating, setIsManualDictating] = useState(false);
  const [manualRecognition, setManualRecognition] =
    useState<SpeechRecognitionInstance | null>(null);

  // États pour l'avatar du chatbot
  const [avatarMessage, setAvatarMessage] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [avatarMinimized, setAvatarMinimized] = useState(false);

  const currentField = extractedFields[currentStep];
  const progress = ((currentStep + 1) / extractedFields.length) * 100;
  const confirmedCount = Object.keys(confirmedData).length;

  // Initialiser Web Speech API pour la reconnaissance vocale
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (
        window as {
          webkitSpeechRecognition: new () => SpeechRecognitionInstance;
        }
      ).webkitSpeechRecognition;

      // Reconnaissance pour le chat
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.lang = "fr-FR";
      recognitionInstance.interimResults = false;

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setChatInput(transcript);
        setIsRecording(false);
      };

      recognitionInstance.onerror = () => {
        setIsRecording(false);
        toast.error("Erreur de reconnaissance vocale");
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);

      // Reconnaissance pour la dictée manuelle
      const manualRecognitionInstance = new SpeechRecognition();
      manualRecognitionInstance.continuous = false;
      manualRecognitionInstance.lang = "fr-FR";
      manualRecognitionInstance.interimResults = false;

      manualRecognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;

        // Convertir selon le type de champ
        let newValue: string | number = transcript;
        if (currentField?.type === "number") {
          const match = transcript.match(/(\d+)/);
          if (match) {
            newValue = parseInt(match[1], 10);
          }
        }

        setCurrentValue(newValue);
        setIsManualDictating(false);
        toast.success(`Valeur dictée: ${newValue}`);
      };

      manualRecognitionInstance.onerror = () => {
        setIsManualDictating(false);
        toast.error("Erreur de reconnaissance vocale");
      };

      manualRecognitionInstance.onend = () => {
        setIsManualDictating(false);
      };

      setManualRecognition(manualRecognitionInstance);
    }
  }, [currentField]);

  // Auto-scroll du chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Initialiser la valeur actuelle quand on change de champ
  useEffect(() => {
    if (currentField) {
      setCurrentValue(currentField.value);
      setChatMessages([]); // Reset chat pour nouveau champ
      setShowAIChat(false);

      // Si en mode vocal, poser la question automatiquement (sans démarrer le micro)
      if (isVoiceMode) {
        // Attendre un peu pour que l'UI se mette à jour
        setTimeout(() => {
          speakFieldQuestion();
          // Le micro ne démarre plus automatiquement - l'utilisateur doit cliquer
        }, 500);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, currentField, isVoiceMode]);

  // Fonction pour faire parler l'IA avec avatar
  const speak = useCallback((text: string) => {
    setAvatarMessage(text);
    setIsSpeaking(true);

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Annuler toute lecture en cours
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "fr-FR";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
      return utterance;
    }

    setIsSpeaking(false);
  }, []);

  // Fonction pour poser la question du champ actuel vocalement avec IA
  const speakFieldQuestion = useCallback(async () => {
    if (!currentField) return;

    try {
      // Appeler l'API pour générer une question intelligente
      const response = await fetch("/api/bia/voice-assistant/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fieldContext: {
            label: currentField.label,
            type: currentField.type,
            extractedValue: currentField.value,
            currentValue: currentValue,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur API question");
      }

      const result = await response.json();
      speak(result.question);
    } catch (error) {
      console.error("❌ Erreur speakFieldQuestion:", error);
      // Fallback sur la question simple
      const value =
        currentValue !== null &&
        currentValue !== undefined &&
        currentValue !== ""
          ? String(currentValue)
          : "aucune valeur";

      const question = `${currentField.label}. L'IA a trouvé : ${value}. Est-ce correct ?`;
      speak(question);
    }
  }, [currentField, currentValue, speak]);

  // Démarrer le mode conversation orale
  const startVoiceMode = () => {
    if (
      !voiceRecognition &&
      typeof window !== "undefined" &&
      "webkitSpeechRecognition" in window
    ) {
      const SpeechRecognition = (
        window as {
          webkitSpeechRecognition: new () => SpeechRecognitionInstance;
        }
      ).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.lang = "fr-FR";
      recognitionInstance.interimResults = false;

      recognitionInstance.onresult = async (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log("🎤 Reconnaissance vocale:", transcript);
        setIsListening(false);

        await handleVoiceCommand(transcript);
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Erreur reconnaissance vocale:", event.error);
        setIsListening(false);
        speak("Désolé, je n'ai pas compris. Pouvez-vous répéter ?");
        setTimeout(() => startListening(), 2000);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setVoiceRecognition(recognitionInstance);
    }

    setIsVoiceMode(true);
    toast.success("🎤 Mode conversation orale activé");

    // Démarrer avec le premier champ
    setTimeout(() => {
      speakFieldQuestion();
      setTimeout(() => startListening(), 3000); // Attendre que la question soit finie
    }, 500);
  };

  // Arrêter le mode conversation orale
  const stopVoiceMode = () => {
    setIsVoiceMode(false);
    setIsListening(false);
    if (voiceRecognition) {
      voiceRecognition.stop();
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    toast.info("Mode conversation orale désactivé");
  };

  // Démarrer l'écoute
  const startListening = () => {
    if (voiceRecognition && isVoiceMode) {
      setIsListening(true);
      try {
        voiceRecognition.start();
      } catch (error) {
        console.error("Erreur démarrage reconnaissance:", error);
        setIsListening(false);
      }
    }
  };

  // Gérer les commandes vocales
  const handleVoiceCommand = async (transcript: string) => {
    console.log("🔍 Traitement commande:", transcript);

    try {
      // Appeler l'API intelligente Azure GPT pour comprendre l'intention
      const response = await fetch("/api/bia/voice-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          fieldContext: {
            label: currentField.label,
            type: currentField.type,
            extractedValue: currentField.value,
            currentValue: currentValue,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur API voice-assistant");
      }

      const result = await response.json();
      console.log("🤖 Réponse IA:", result);

      // Parler la réponse de l'IA
      speak(result.response);

      // Exécuter l'action demandée
      switch (result.action) {
        case "confirm":
          // Confirmer et passer au champ suivant
          handleConfirm();
          break;

        case "reject":
          // Rejeter et passer au champ suivant
          handleReject();
          break;

        case "modify":
          // Modifier la valeur actuelle
          if (result.newValue !== null && result.newValue !== undefined) {
            let finalValue: string | number = result.newValue;

            // Convertir selon le type de champ
            if (
              currentField.type === "number" &&
              typeof finalValue === "string"
            ) {
              const match = finalValue.match(/(\d+)/);
              if (match) {
                finalValue = parseInt(match[1], 10);
              }
            }

            setCurrentValue(finalValue);
            // Donner un peu de temps pour que l'utilisateur confirme ou modifie à nouveau
            // Ne pas auto-avancer après modification
          }
          break;

        case "navigate_next":
          // Passer au champ suivant sans confirmer
          moveToNext();
          break;

        case "navigate_previous":
          // Retour au champ précédent
          handleBack();
          break;

        case "repeat":
          // Répéter la question
          speakFieldQuestion();
          break;

        case "stop":
          // Arrêter le mode vocal
          stopVoiceMode();
          break;

        case "help":
          // L'IA a déjà fourni une réponse d'aide dans result.response
          break;

        default:
          speak("Je n'ai pas compris. Pouvez-vous répéter ?");
      }
    } catch (error) {
      console.error("❌ Erreur handleVoiceCommand:", error);
      speak(
        "Désolé, j'ai eu un problème pour comprendre. Pouvez-vous répéter ?"
      );
    }
  };

  // Fonction pour démarrer la dictée manuelle (mode non-vocal)
  const startManualDictation = () => {
    // Vérifier si la reconnaissance vocale est supportée
    if (
      typeof window === "undefined" ||
      !("webkitSpeechRecognition" in window)
    ) {
      toast.error(
        "La reconnaissance vocale n'est pas supportée par votre navigateur"
      );
      return;
    }

    // Créer une nouvelle instance si nécessaire
    let recognitionToUse = manualRecognition;
    if (!recognitionToUse) {
      const SpeechRecognition = (
        window as {
          webkitSpeechRecognition: new () => SpeechRecognitionInstance;
        }
      ).webkitSpeechRecognition;
      recognitionToUse = new SpeechRecognition();
      recognitionToUse.continuous = false;
      recognitionToUse.lang = "fr-FR";
      recognitionToUse.interimResults = false;

      recognitionToUse.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;

        // Convertir selon le type de champ
        let newValue: string | number = transcript;
        if (currentField?.type === "number") {
          const match = transcript.match(/(\d+)/);
          if (match) {
            newValue = parseInt(match[1], 10);
          }
        }

        setCurrentValue(newValue);
        setIsManualDictating(false);
        toast.success(`Valeur dictée: ${newValue}`);
      };

      recognitionToUse.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Erreur reconnaissance vocale:", event);
        setIsManualDictating(false);
        toast.error("Erreur de reconnaissance vocale");
      };

      recognitionToUse.onend = () => {
        setIsManualDictating(false);
      };

      setManualRecognition(recognitionToUse);
    }

    setIsManualDictating(true);
    toast.info("🎤 Dictez votre réponse...");

    try {
      recognitionToUse.start();
    } catch (error) {
      console.error("Erreur démarrage dictée:", error);
      setIsManualDictating(false);
      toast.error("Erreur lors du démarrage du microphone");
    }
  };

  // Fonction pour arrêter la dictée manuelle
  const stopManualDictation = () => {
    if (manualRecognition) {
      manualRecognition.stop();
    }
    setIsManualDictating(false);
  };

  const handleConfirm = () => {
    // Confirmer la valeur (modifiée ou originale)
    setConfirmedData((prev) => ({
      ...prev,
      [currentField.name]: currentValue,
    }));

    // Marquer comme modifié si différent de l'original
    if (currentValue !== currentField.value) {
      setModifiedFields((prev) => new Set(prev).add(currentField.name));
    }

    moveToNext();
  };

  const handleReject = () => {
    // Rejeter = ne pas inclure dans les données confirmées
    moveToNext();
  };

  const moveToNext = () => {
    if (currentStep < extractedFields.length - 1) {
      setCurrentStep((prev) => {
        const newStep = prev + 1;
        // Réinitialiser la valeur pour le prochain champ
        const nextField = extractedFields[newStep];
        setCurrentValue(nextField.value);
        return newStep;
      });
    } else {
      // Fin de la revue
      onComplete(confirmedData);
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => {
        const newStep = prev - 1;
        const prevField = extractedFields[newStep];
        // Restaurer la valeur confirmée ou originale
        setCurrentValue(
          confirmedData[prevField.name] !== undefined
            ? confirmedData[prevField.name]
            : prevField.value
        );
        return newStep;
      });
    }
  };

  // Fonction pour envoyer un message à l'IA
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isAILoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");

    // Ajouter le message utilisateur
    const newMessages = [
      ...chatMessages,
      { role: "user" as const, content: userMessage },
    ];
    setChatMessages(newMessages);
    setIsAILoading(true);

    try {
      const response = await fetch("/api/bia/chat-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          fieldContext: {
            label: currentField.label,
            currentValue: currentValue,
            extractedValue: currentField.value,
            type: currentField.type,
          },
        }),
      });

      if (!response.ok) throw new Error("Erreur API");

      const data = await response.json();

      // Ajouter la réponse de l'IA
      setChatMessages([
        ...newMessages,
        { role: "assistant", content: data.message },
      ]);

      // Si l'IA suggère une valeur, la proposer
      if (data.suggestedValue !== undefined) {
        setCurrentValue(data.suggestedValue);
        toast.success("L'IA a suggéré une nouvelle valeur");
      }

      // Lecture vocale de la réponse (optionnel)
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(data.message);
        utterance.lang = "fr-FR";
        utterance.rate = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      toast.error("Erreur lors de la communication avec l'IA");
      setChatMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer.",
        },
      ]);
    } finally {
      setIsAILoading(false);
    }
  };

  // Fonction pour démarrer/arrêter l'enregistrement vocal
  const toggleRecording = () => {
    if (!recognition) {
      toast.error(
        "La reconnaissance vocale n'est pas supportée par votre navigateur"
      );
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
      toast.info("🎤 Parlez maintenant...");
    }
  };

  const getConfidenceBadge = (confidence?: number) => {
    const score = confidence || 0;
    if (score >= 90) return <Badge className="bg-emerald-500 text-white border-none shadow-[0_0_10px_rgba(16,185,129,0.3)]">✓ Confiance : {score}%</Badge>;
    if (score >= 70) return <Badge className="bg-blue-500 text-white border-none">✓ Confiance : {score}%</Badge>;
    if (score >= 40) return <Badge className="bg-orange-500 text-white border-none">⚠ Confiance : {score}%</Badge>;
    return <Badge className="bg-red-500 text-white border-none">⚠ Faible Confiance : {score}%</Badge>;
  };

  const getConfidenceColor = (confidenceScore?: number | string) => {
    if (typeof confidenceScore === "string") {
        switch (confidenceScore) {
          case "high": return "bg-green-100 text-green-800 border-green-300";
          case "medium": return "bg-blue-100 text-blue-800 border-blue-300";
          case "low": return "bg-red-100 text-red-800 border-red-300";
          default: return "bg-gray-100 text-gray-800 border-gray-300";
        }
    }
    
    const score = confidenceScore || 0;
    if (score >= 90) return "bg-green-100 text-green-800 border-green-300";
    if (score >= 70) return "bg-blue-100 text-blue-800 border-blue-300";
    if (score >= 40) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  if (!currentField) return null;

  const isModified = currentValue !== currentField.value;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-blue-600" />
              {title}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar du chatbot intégré (visible uniquement en mode vocal) */}
          {isVoiceMode && (
            <div className="flex justify-center mb-4">
              <VoiceAssistantAvatar
                message={avatarMessage}
                isSpeaking={isSpeaking}
                isListening={isListening}
                onMinimize={() => setAvatarMinimized(!avatarMinimized)}
                isMinimized={avatarMinimized}
              />
            </div>
          )}

          {/* Mode Conversation Orale */}
          {!isVoiceMode ? (
            <Alert className="border-2 border-purple-200 bg-purple-50">
              <Volume2 className="h-5 w-5 text-purple-600" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-purple-900 mb-1">
                      🎤 Mode Conversation Orale
                    </p>
                    <p className="text-sm text-purple-700">
                      L&apos;IA vous guidera à travers tous les champs par la
                      voix. Dites &quot;confirmer&quot;, &quot;rejeter&quot; ou
                      donnez une nouvelle valeur.
                    </p>
                  </div>
                  <Button
                    onClick={startVoiceMode}
                    className="bg-purple-600 hover:bg-purple-700 gap-2 flex-shrink-0"
                  >
                    <Mic className="h-4 w-4" />
                    Activer
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-2 border-green-200 bg-green-50">
              <Volume2 className="h-5 w-5 text-green-600 animate-pulse" />
              <AlertDescription>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-green-900">
                      🎤 Conversation Orale Active
                    </p>
                    <Button
                      onClick={stopVoiceMode}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <MicOff className="h-4 w-4" />
                      Désactiver
                    </Button>
                  </div>

                  {isListening ? (
                    <div className="flex items-center gap-2 text-green-700">
                      <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                      <span className="text-sm font-medium">
                        J&apos;écoute votre réponse...
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-green-700">
                        L&apos;IA pose la question... Écoutez et répondez.
                      </p>
                      <Button
                        onClick={startListening}
                        variant="outline"
                        size="sm"
                        className="gap-2 w-full"
                      >
                        <Mic className="h-4 w-4" />
                        🎤 Appuyer pour répondre
                      </Button>
                    </div>
                  )}

                  <div className="text-xs text-green-600 space-y-1">
                    <p>
                      💡 Commandes: &quot;confirmer&quot;, &quot;rejeter&quot;,
                      &quot;précédent&quot;, &quot;arrêter&quot;
                    </p>
                    <p>✏️ Ou dictez directement la nouvelle valeur</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Barre de progression */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Champ {currentStep + 1} / {extractedFields.length}
              </span>
              <span className="font-medium text-green-600">
                {confirmedCount} validés · {modifiedFields.size} modifiés
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Catégorie et confiance */}
          <div className="flex items-center gap-2">
            {currentField.category && (
              <Badge variant="outline">{currentField.category}</Badge>
            )}
            {getConfidenceBadge(typeof currentField.confidence === 'number' ? currentField.confidence : undefined)}
          </div>

          {/* Question de l'IA */}
          <Alert className="border-2 border-blue-200 bg-blue-50">
            <Bot className="h-5 w-5 text-blue-600" />
            <AlertDescription>
              <div className="space-y-3">
                <p className="font-medium text-blue-900">
                  <strong>{currentField.label}</strong>
                </p>
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 mb-2">
                    ✨ L&apos;IA a trouvé :
                  </p>
                  <p className="font-mono text-sm bg-gray-50 p-3 rounded border">
                    {currentField.value !== null &&
                    currentField.value !== undefined &&
                    currentField.value !== ""
                      ? String(currentField.value)
                      : "(vide)"}
                  </p>
                </div>
                <p className="text-sm text-blue-700">
                  💬{" "}
                  <strong>Est-ce que cette information est correcte ?</strong>
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Zone d'édition */}
          <div className="space-y-3 p-6 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-gray-600" />
                <Label className="text-base font-medium">
                  Votre réponse {isModified && "(modifiée)"}
                </Label>
              </div>

              {/* Bouton Microphone pour dictée manuelle */}
              {!isVoiceMode && (
                <Button
                  type="button"
                  variant={isManualDictating ? "destructive" : "outline"}
                  size="sm"
                  onClick={
                    isManualDictating
                      ? stopManualDictation
                      : startManualDictation
                  }
                  className="gap-2"
                >
                  {isManualDictating ? (
                    <>
                      <MicOff className="h-4 w-4" />
                      Arrêter
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      🎤 Dicter
                    </>
                  )}
                </Button>
              )}
            </div>

            {isManualDictating && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="flex items-center gap-2 text-red-700">
                  <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="text-sm font-medium">
                    Micro activé - Dictez votre réponse...
                  </span>
                </AlertDescription>
              </Alert>
            )}

            {currentField.type === "text" && (
              <Input
                value={String(currentValue || "")}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder="Modifiez si nécessaire..."
                className="bg-white"
              />
            )}

            {currentField.type === "textarea" && (
              <Textarea
                value={String(currentValue || "")}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder="Modifiez si nécessaire..."
                className="bg-white min-h-[120px]"
              />
            )}

            {currentField.type === "number" && (
              <Input
                type="number"
                value={String(currentValue || "")}
                onChange={(e) =>
                  setCurrentValue(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                placeholder="Modifiez si nécessaire..."
                className="bg-white"
              />
            )}

            {currentField.type === "select" && currentField.options && (
              <Select
                value={String(currentValue || "")}
                onValueChange={(val) => setCurrentValue(val)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Sélectionnez..." />
                </SelectTrigger>
                <SelectContent>
                  {currentField.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {isModified && (
              <p className="text-sm text-orange-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Vous avez modifié cette valeur
              </p>
            )}
          </div>

          {/* Assistant IA conversationnel */}
          <div className="space-y-3">
            <Button
              variant={showAIChat ? "default" : "outline"}
              onClick={() => setShowAIChat(!showAIChat)}
              className="w-full gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              {showAIChat
                ? "Masquer l'assistant IA"
                : "💬 Demander de l'aide à l'IA"}
            </Button>

            {showAIChat && (
              <div className="border rounded-lg bg-white overflow-hidden">
                {/* Zone de chat */}
                <ScrollArea className="h-[300px] p-4">
                  <div className="space-y-3">
                    {chatMessages.length === 0 && (
                      <div className="text-center text-sm text-gray-500 py-8">
                        <Bot className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>Posez une question sur ce champ à l&apos;IA</p>
                        <p className="text-xs mt-2">
                          Exemple: &quot;Quelle est la bonne valeur ?&quot;,
                          &quot;Peux-tu m&apos;expliquer ?&quot;
                        </p>
                      </div>
                    )}

                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            msg.role === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {msg.role === "assistant" && (
                              <Bot className="h-4 w-4 mt-1 flex-shrink-0" />
                            )}
                            <p className="text-sm whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {isAILoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-gray-600">
                            L&apos;IA réfléchit...
                          </span>
                        </div>
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>

                {/* Zone de saisie */}
                <div className="border-t p-3 bg-gray-50">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={toggleRecording}
                      className={isRecording ? "bg-red-100 border-red-300" : ""}
                      disabled={isAILoading}
                    >
                      {isRecording ? (
                        <MicOff className="h-4 w-4 text-red-600" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>

                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Posez votre question... (Entrée pour envoyer)"
                      disabled={isAILoading}
                      className="flex-1"
                    />

                    <Button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim() || isAILoading}
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  {isRecording && (
                    <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                      <span className="animate-pulse">●</span>
                      Enregistrement en cours...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions principales */}
          <div className="flex items-center justify-between pt-4 border-t gap-3">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handleBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Précédent
              </Button>
            )}

            <div className="flex-1" />

            <Button
              variant="outline"
              onClick={handleReject}
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
              Rejeter
            </Button>

            <Button
              onClick={handleConfirm}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <ThumbsUp className="h-4 w-4" />
              {currentStep < extractedFields.length - 1
                ? "Valider & Suivant"
                : "Valider & Terminer"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Résumé */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>{confirmedCount} validés</span>
            </div>
            <div className="flex items-center gap-1">
              <Edit3 className="h-4 w-4 text-orange-600" />
              <span>{modifiedFields.size} modifiés</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{extractedFields.length - currentStep - 1} restants</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
