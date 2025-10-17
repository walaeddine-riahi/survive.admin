"use client";

import { Inter } from "next/font/google";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState, useRef } from "react";
import AlertComposeForm from "@/components/participant-mode/communication-forms/AlertComposeForm";
import EmailComposeForm from "@/components/participant-mode/communication-forms/EmailComposeForm";
import MemoComposeForm from "@/components/participant-mode/communication-forms/MemoComposeForm";
import NewsBroadcastComposeForm from "@/components/participant-mode/communication-forms/NewsBroadcastComposeForm";
import SmsComposeForm from "@/components/participant-mode/communication-forms/SmsComposeForm";
import SocialComposeForm from "@/components/participant-mode/communication-forms/SocialComposeForm";
import {
  Mail,
  MessageSquare,
  Phone,
  Bell,
  FileText,
  Newspaper,
  Users,
  ChevronLeft,
  Loader2,
  Inbox,
  PlusCircle,
  Rss,
  X,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Form Data Interfaces
import type { AlertFormData } from "@/components/participant-mode/communication-forms/AlertComposeForm";
import type { EmailFormData } from "@/components/participant-mode/communication-forms/EmailComposeForm";
import type { MemoFormData } from "@/components/participant-mode/communication-forms/MemoComposeForm";
import type { NewsBroadcastFormData } from "@/components/participant-mode/communication-forms/NewsBroadcastComposeForm";
import type { SmsFormData } from "@/components/participant-mode/communication-forms/SmsComposeForm";
import type { SocialFormData } from "@/components/participant-mode/communication-forms/SocialComposeForm";

// Main Data Interfaces
interface Communication {
  id: string;
  type: string;
  subject?: string;
  content: string;
  createdAt: string;
}

interface Injection {
  id: string;
  type: string;
  subject: string;
  acknowledgedAt: string | null;
  content: string;
  createdAt: string;
}

interface Participant {
  id: string;
  name: string;
  role: string;
  user?: { id: string; name?: string | null };
}

interface ParticipantViewData {
  communications: {
    email: Communication[];
    sms: Communication[];
    call: Communication[];
    alert: Communication[];
    memo: Communication[];
    newsBroadcast: Communication[];
    social: Communication[];
    newspaper: Communication[];
  };
  injections: Injection[];
  participants: Participant[];
  counts: {
    email: number;
    sms: number;
    call: number;
    alert: number;
    memo: number;
    newsBroadcast: number;
    social: number;
    newspaper: number;
  };
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

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
      className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all cursor-pointer border ${className} hover:shadow-md`}
      onClick={onClick}
    >
      <div className="flex flex-col items-center w-full">
        <div className={`p-2 rounded-full mb-1 ${iconClass} bg-opacity-20`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs font-medium text-center mb-1">{title}</span>
        <div className="flex gap-1">
          {count > 0 && (
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-800">
              {count}
            </span>
          )}
          {injCount > 0 && (
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-800">
              {injCount}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

// Utility function to format date
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
      return <MessageSquare {...iconProps} />; // Default icon
  }
};

export default function MobileParticipantViewPage() {
  const { data: session } = useSession();
  const params = useParams();
  const simulationId = params.simulationId as string;
  const { toast } = useToast();

  const [data, setData] = useState<ParticipantViewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedChannel, setSelectedChannel] = useState<
    keyof ParticipantViewData["communications"] | "injections" | null
  >(null);
  const [isParticipant, setIsParticipant] = useState<boolean>(false);
  const [isComposing, setIsComposing] = useState(false);
  const [composeType, setComposeType] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [selectedInjection, setSelectedInjection] = useState<Injection | null>(
    null
  );
  const audioContextRef = useRef<AudioContext | null>(null);
  const shownInjectionIds = useRef(new Set<string>());

  const playNotification = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
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
      console.error("Error playing sound notification:", error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/simulations/${simulationId}/participant-view`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch participant data");
      }
      const result = await response.json();
      setData(result.data);

      if (data) {
        // Compare with previous data if it exists
        const newInjections = result.data.injections.filter(
          (newInj: Injection) =>
            !data.injections.some((oldInj) => oldInj.id === newInj.id)
        );
        if (newInjections.length > 0) {
          playNotification();
          toast({
            title: "Nouvelle injection",
            description: newInjections[0].subject,
          });
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  }, [simulationId, data, playNotification, toast]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (session?.user?.id && data?.participants) {
      const currentUserIsParticipant = data.participants.some(
        (p) => p.user?.id === session.user.id
      );
      setIsParticipant(currentUserIsParticipant);
    }
  }, [session, data]);

  useEffect(() => {
    if (!data?.injections) return;

    const unseen = data.injections
      .filter(
        (inj) => !inj.acknowledgedAt && !shownInjectionIds.current.has(inj.id)
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

  const handleAcknowledgeInjection = async (injectionId: string) => {
    try {
      const response = await fetch(
        `/api/injections/${injectionId}/acknowledge`,
        {
          method: "POST",
        }
      );
      if (!response.ok) throw new Error("Failed to acknowledge injection");
      toast({
        title: "Injection Acknowledged",
        description: "The injection has been marked as read.",
      });
      setSelectedInjection(null); // Close modal
      fetchData(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleComposeClick = (type: string) => {
    setComposeType(type);
    setIsComposing(true);
  };

  const handleCancelCompose = () => {
    setIsComposing(false);
    setComposeType(null);
  };

  const genericSubmitHandler = async (type: string, formData: any) => {
    setSubmitting(true);
    try {
      const response = await fetch(
        `/api/simulations/${simulationId}/communications`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, type }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to send ${type}`);
      }
      toast({
        title: "Success",
        description: `${
          type.charAt(0).toUpperCase() + type.slice(1)
        } sent successfully.`,
      });
      handleCancelCompose();
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : `An unknown error occurred`,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderChannelContent = () => {
    if (!selectedChannel || !data) return null;

    const items =
      selectedChannel === "injections"
        ? data.injections
        : data.communications[selectedChannel] || [];
    const title =
      selectedChannel === "injections"
        ? "Injections"
        : selectedChannel.charAt(0).toUpperCase() + selectedChannel.slice(1);

    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <header className="flex items-center justify-between p-4 border-b bg-background">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedChannel(null)}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h2 className="text-lg font-bold">{title}</h2>
          <div className="w-10"></div>
        </header>
        <ScrollArea className="flex-1 p-4">
          {items.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              No items to display.
            </div>
          ) : (
            <div className="space-y-3">
              {[...items]
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((item) => (
                  <Card key={item.id}>
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm font-semibold">
                        {item.subject || "No Subject"}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </p>
                    </CardHeader>
                    <CardContent className="p-3 text-sm">
                      <p>{item.content}</p>
                      {selectedChannel === "injections" &&
                        "acknowledgedAt" in item &&
                        !item.acknowledgedAt && (
                          <Button
                            className="mt-2 w-full"
                            size="sm"
                            onClick={() => handleAcknowledgeInjection(item.id)}
                          >
                            Acknowledge
                          </Button>
                        )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </ScrollArea>
      </div>
    );
  };

  const renderComposeModal = () => {
    if (!isComposing || !composeType) return null;

    const formProps = {
      onCancel: handleCancelCompose,
      onSubmit: (formData: any) => genericSubmitHandler(composeType, formData),
    };

    let formComponent;
    switch (composeType) {
      case "email":
        formComponent = <EmailComposeForm {...formProps} />;
        break;
      case "sms":
        formComponent = <SmsComposeForm {...formProps} />;
        break;
      case "social":
        formComponent = <SocialComposeForm {...formProps} />;
        break;
      case "memo":
        formComponent = <MemoComposeForm {...formProps} />;
        break;
      case "newsBroadcast":
        formComponent = <NewsBroadcastComposeForm {...formProps} />;
        break;
      case "alert":
        formComponent = (
          <AlertComposeForm {...formProps} isParticipant={isParticipant} />
        );
        break;
      default:
        return null;
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <Card className="w-full max-w-lg m-4">
          <CardHeader>
            <CardTitle>
              Compose{" "}
              {composeType.charAt(0).toUpperCase() + composeType.slice(1)}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleCancelCompose}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>{formComponent}</CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!data) {
    return <div className="p-4">No data available.</div>;
  }

  const unacknowledgedInjections = data.injections.filter(
    (inj) => !inj.acknowledgedAt
  ).length;

  return (
    <div className={`${inter.variable} font-sans bg-background min-h-screen`}>
      <main className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Participant View</h1>
          {isParticipant && (
            <Button onClick={() => handleComposeClick("email")} size="sm">
              <PlusCircle className="h-4 w-4 mr-2" />
              Compose
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-4">
          <CommunicationChannelCard
            title="Injections"
            count={unacknowledgedInjections}
            injCount={unacknowledgedInjections}
            onClick={() => setSelectedChannel("injections")}
            icon={Bell}
            className="border-amber-500 bg-amber-50"
            iconClass="text-amber-500 bg-amber-100"
          />
          <CommunicationChannelCard
            title="Email"
            count={data.counts.email}
            onClick={() => setSelectedChannel("email")}
            icon={Mail}
            className="border-red-500 bg-red-50"
            iconClass="text-red-500 bg-red-100"
          />
          <CommunicationChannelCard
            title="SMS"
            count={data.counts.sms}
            onClick={() => setSelectedChannel("sms")}
            icon={MessageSquare}
            className="border-green-500 bg-green-50"
            iconClass="text-green-500 bg-green-100"
          />
          <CommunicationChannelCard
            title="Social"
            count={data.counts.social}
            onClick={() => setSelectedChannel("social")}
            icon={Users}
            className="border-purple-500 bg-purple-50"
            iconClass="text-purple-500 bg-purple-100"
          />
          <CommunicationChannelCard
            title="Memo"
            count={data.counts.memo}
            onClick={() => setSelectedChannel("memo")}
            icon={FileText}
            className="border-gray-500 bg-gray-50"
            iconClass="text-gray-500 bg-gray-100"
          />
          <CommunicationChannelCard
            title="News"
            count={data.counts.newsBroadcast}
            onClick={() => setSelectedChannel("newsBroadcast")}
            icon={Newspaper}
            className="border-red-500 bg-red-50"
            iconClass="text-red-500 bg-red-100"
          />
        </div>

        {isParticipant && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => handleComposeClick("alert")}
              >
                Send Alert
              </Button>
              <Button
                variant="outline"
                onClick={() => handleComposeClick("memo")}
              >
                Write Memo
              </Button>
            </CardContent>
          </Card>
        )}

        {selectedInjection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>{selectedInjection.subject}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => setSelectedInjection(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{selectedInjection.content}</p>
                <Button
                  className="w-full"
                  onClick={() =>
                    handleAcknowledgeInjection(selectedInjection.id)
                  }
                >
                  Acknowledge
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {renderChannelContent()}
        {renderComposeModal()}
      </main>
    </div>
  );
}
