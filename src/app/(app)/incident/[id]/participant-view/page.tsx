"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
// Import potential icons (example using lucide-react, assuming it's available)
import AlertComposeForm, {
  AlertFormData,
} from "@/components/participant-mode/communication-forms/AlertComposeForm";
import CallComposeForm, {
  CallFormData,
} from "@/components/participant-mode/communication-forms/CallComposeForm";
import EmailComposeForm, {
  EmailFormData,
} from "@/components/participant-mode/communication-forms/EmailComposeForm";
import MemoComposeForm, {
  MemoFormData,
} from "@/components/participant-mode/communication-forms/MemoComposeForm";
import NewsBroadcastComposeForm, {
  NewsBroadcastFormData,
} from "@/components/participant-mode/communication-forms/NewsBroadcastComposeForm";
import NewspaperComposeForm, {
  NewspaperFormData,
} from "@/components/participant-mode/communication-forms/NewspaperComposeForm";
import SmsComposeForm, {
  SmsFormData,
} from "@/components/participant-mode/communication-forms/SmsComposeForm";
import SocialComposeForm, {
  SocialFormData,
} from "@/components/participant-mode/communication-forms/SocialComposeForm";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  FileText,
  Mail,
  MessageSquare,
  Newspaper,
  Phone,
  Rss,
  Users,
} from "lucide-react"; // Uncomment and use actual icons

// Note: In a real application, you would fetch the incident data based on the ID
const mockIncident = {
  id: "inc-1",
  title: "Incident de sécurité (ID: inc-1)", // Mock title for display
};

// Mock data for counts (replace with actual data fetching in the future)
const mockCounts = {
  alert: 5,
  call: 2,
  email: 55,
  memo: 1,
  newsBroadcast: 0,
  newspaper: 1,
  sms: 8,
  social: 15,
};

// Mock Email Data (Incident specific)
const mockEmails = [
  {
    id: "inc-email-1",
    subject: "Mise à jour Incident #123",
    sender: "centre.operation@securite.com",
    timestamp: "15:00",
    body: "Point de situation concernant l'incident en cours...",
  },
  {
    id: "inc-email-2",
    subject: "Demande de renfort - Équipe technique",
    sender: "chef.equipe@entreprise.com",
    timestamp: "14:45",
    body: "Nous avons besoin d'assistance immédiate pour résoudre...",
  },
];

// Mock Injection Data (Incident specific)
const mockInjections = [
  {
    id: "inc-injection-1",
    title: "Alerte Initiale: Brèche de Sécurité",
    timestamp: "14:30",
    content: "Des activités suspectes ont été détectées sur le réseau.",
    acknowledged: false,
  },
  {
    id: "inc-injection-2",
    title: "Mise à jour: Serveur Compromis",
    timestamp: "14:50",
    content: "Un serveur critique a été compromis. Isolation en cours.",
    acknowledged: false,
  },
];

// Helper component for a communication channel card
function CommunicationChannelCard({
  title,
  count,
  onClick,
  icon: Icon, // Destructure and rename icon prop to Icon (capitalized for React component)
}: {
  title: string;
  count: number;
  onClick: () => void;
  icon: React.ElementType; // Define icon prop type as React component
}) {
  return (
    <Card
      className="flex flex-col items-start p-4 space-y-2 hover:bg-accent transition-colors cursor-pointer"
      onClick={onClick}
    >
      {/* Render the passed Icon component */}
      <div className="text-3xl text-primary">
        {Icon && <Icon size={32} />}
      </div>{" "}
      {/* Use Icon component and add text-primary color */}
      <div className="flex items-center justify-between w-full">
        <span className="text-lg font-semibold">{title}</span>
        {count > 0 && (
          <span className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm font-bold">
            {count}
          </span>
        )}
      </div>
    </Card>
  );
}

export default function IncidentParticipantViewPage({
  params,
}: {
  params: { id: string };
}) {
  // Use params.id to fetch actual incident data
  const incidentId = params.id;
  const incidentTitle = mockIncident.title.replace("inc-1", incidentId); // Use mock title for now

  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [injections, setInjections] = useState(mockInjections); // State for injections
  const [isComposing, setIsComposing] = useState(false); // State to track composition mode

  const handleChannelClick = (channel: string) => {
    setSelectedChannel(channel);
    setIsComposing(false); // Exit composition mode when selecting a new channel
  };

  const handleAcknowledgeInjection = (injectionId: string) => {
    alert(`Injection ${injectionId} acknowledged!`);
    // In a real app, update state or send API call to mark as acknowledged
    setInjections(
      injections.map((injection) =>
        injection.id === injectionId
          ? { ...injection, acknowledged: true }
          : injection
      )
    );
  };

  // Placeholder function to handle composing a new message
  const handleComposeClick = () => {
    setIsComposing(true);
    // Future: Implement actual composition form based on selectedChannel
  };

  const handleEmailSubmit = (data: EmailFormData) => {
    console.log("Email to send:", data);
    alert(
      "Email Sent:\nTo: " +
        data.to +
        "\nSubject: " +
        data.subject +
        "\nBody: " +
        data.body
    );
    setIsComposing(false); // Exit composition mode after submitting
  };

  const handleCallSubmit = (data: CallFormData) => {
    console.log("Call details:", data);
    alert(
      "Call Logged:\nTo: " +
        data.to +
        "\nFrom: " +
        data.from +
        "\nNotes: " +
        data.notes
    );
    setIsComposing(false); // Exit composition mode after submitting
  };

  const handleSmsSubmit = (data: SmsFormData) => {
    console.log("SMS details:", data);
    alert("SMS Sent:\nTo: " + data.to + "\nBody: " + data.body);
    setIsComposing(false); // Exit composition mode after submitting
  };

  const handleAlertSubmit = (data: AlertFormData) => {
    console.log("Alert details:", data);
    alert(
      "Alert Sent:\nSubject: " + data.subject + "\nMessage: " + data.message
    );
    setIsComposing(false); // Exit composition mode after submitting
  };

  const handleMemoSubmit = (data: MemoFormData) => {
    console.log("Memo details:", data);
    alert(
      "Memo Sent:\nSubject: " + data.subject + "\nContent: " + data.content
    );
    setIsComposing(false); // Exit composition mode after submitting
  };

  const handleNewsBroadcastSubmit = (data: NewsBroadcastFormData) => {
    console.log("News Broadcast details:", data);
    alert(
      "News Broadcast Sent:\nTitle: " +
        data.title +
        "\nContent: " +
        data.content
    );
    setIsComposing(false); // Exit composition mode after submitting
  };

  const handleNewspaperSubmit = (data: NewspaperFormData) => {
    console.log("Newspaper details:", data);
    alert(
      "Newspaper Article Sent:\nTitle: " +
        data.title +
        "\nContent: " +
        data.content
    );
    setIsComposing(false); // Exit composition mode after submitting
  };

  const handleSocialSubmit = (data: SocialFormData) => {
    console.log("Social details:", data);
    alert(
      "Social Message Sent:\nPlatform: " +
        data.platform +
        "\nContent: " +
        data.content
    );
    setIsComposing(false); // Exit composition mode after submitting
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <h1 className="text-2xl font-bold">
          Vue Participant - {incidentTitle}
        </h1>
        {/* Add any incident-specific controls for participants here */}
        <Button asChild variant="outline">
          <Link href={`/incident/${incidentId}`}>Retour à l&apos;incident</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <CommunicationChannelCard
          title="ALERT"
          count={mockCounts.alert}
          onClick={() => handleChannelClick("alert")}
          icon={Bell}
        />
        <CommunicationChannelCard
          title="CALL"
          count={mockCounts.call}
          onClick={() => handleChannelClick("call")}
          icon={Phone}
        />
        <CommunicationChannelCard
          title="EMAIL"
          count={mockCounts.email}
          onClick={() => handleChannelClick("email")}
          icon={Mail}
        />
        <CommunicationChannelCard
          title="MEMO"
          count={mockCounts.memo}
          onClick={() => handleChannelClick("memo")}
          icon={FileText}
        />
        <CommunicationChannelCard
          title="NEWS BROADCAST"
          count={mockCounts.newsBroadcast}
          onClick={() => handleChannelClick("newsBroadcast")}
          icon={Rss}
        />
        <CommunicationChannelCard
          title="NEWSPAPER"
          count={mockCounts.newspaper}
          onClick={() => handleChannelClick("newspaper")}
          icon={Newspaper}
        />
        <CommunicationChannelCard
          title="SMS"
          count={mockCounts.sms}
          onClick={() => handleChannelClick("sms")}
          icon={MessageSquare}
        />
        <CommunicationChannelCard
          title="SOCIAL"
          count={mockCounts.social}
          onClick={() => handleChannelClick("social")}
          icon={Users}
        />
      </div>

      {selectedChannel && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            {" "}
            {/* Added flex container for header */}
            <h2 className="text-xl font-semibold">
              Contenu: {selectedChannel.toUpperCase()}
            </h2>
            {/* Add Compose Button */}
            <Button onClick={handleComposeClick} size="sm">
              Nouveau Message
            </Button>
          </div>
          {/* Conditionally render content based on selectedChannel and isComposing */}
          {!isComposing ? (
            selectedChannel === "email" ? (
              <div className="space-y-4">
                {mockEmails.map((email) => (
                  <div
                    key={email.id}
                    className="border-b pb-4 last:border-b-0 last:pb-0"
                  >
                    <h3 className="font-semibold">{email.subject}</h3>
                    <p className="text-sm text-muted-foreground">
                      De: {email.sender} à {email.timestamp}
                    </p>
                    <p className="mt-2">{email.body}</p>
                  </div>
                ))}
              </div>
            ) : selectedChannel === "call" ? (
              <CallComposeForm
                onSubmit={handleCallSubmit}
                onCancel={() => setIsComposing(false)}
              />
            ) : selectedChannel === "sms" ? (
              <SmsComposeForm
                onSubmit={handleSmsSubmit}
                onCancel={() => setIsComposing(false)}
              />
            ) : selectedChannel === "alert" ? (
              <AlertComposeForm
                onSubmit={handleAlertSubmit}
                onCancel={() => setIsComposing(false)}
              />
            ) : selectedChannel === "memo" ? (
              <MemoComposeForm
                onSubmit={handleMemoSubmit}
                onCancel={() => setIsComposing(false)}
              />
            ) : selectedChannel === "newsBroadcast" ? (
              <NewsBroadcastComposeForm
                onSubmit={handleNewsBroadcastSubmit}
                onCancel={() => setIsComposing(false)}
              />
            ) : selectedChannel === "newspaper" ? (
              <NewspaperComposeForm
                onSubmit={handleNewspaperSubmit}
                onCancel={() => setIsComposing(false)}
              />
            ) : selectedChannel === "social" ? (
              <SocialComposeForm
                onSubmit={handleSocialSubmit}
                onCancel={() => setIsComposing(false)}
              />
            ) : (
              <p>Contenu pour {selectedChannel} s&apos;afficherait ici.</p>
            )
          ) : // Render appropriate composition form based on selectedChannel
          selectedChannel === "email" ? (
            <EmailComposeForm
              onSubmit={handleEmailSubmit}
              onCancel={() => setIsComposing(false)}
            />
          ) : selectedChannel === "call" ? (
            <CallComposeForm
              onSubmit={handleCallSubmit}
              onCancel={() => setIsComposing(false)}
            />
          ) : selectedChannel === "sms" ? (
            <SmsComposeForm
              onSubmit={handleSmsSubmit}
              onCancel={() => setIsComposing(false)}
            />
          ) : selectedChannel === "alert" ? (
            <AlertComposeForm
              onSubmit={handleAlertSubmit}
              onCancel={() => setIsComposing(false)}
            />
          ) : selectedChannel === "memo" ? (
            <MemoComposeForm
              onSubmit={handleMemoSubmit}
              onCancel={() => setIsComposing(false)}
            />
          ) : selectedChannel === "newsBroadcast" ? (
            <NewsBroadcastComposeForm
              onSubmit={handleNewsBroadcastSubmit}
              onCancel={() => setIsComposing(false)}
            />
          ) : selectedChannel === "newspaper" ? (
            <NewspaperComposeForm
              onSubmit={handleNewspaperSubmit}
              onCancel={() => setIsComposing(false)}
            />
          ) : selectedChannel === "social" ? (
            <SocialComposeForm
              onSubmit={handleSocialSubmit}
              onCancel={() => setIsComposing(false)}
            />
          ) : (
            <div className="border p-4 rounded-md bg-background">
              {" "}
              {/* Added placeholder for composition form */}
              <h3 className="text-lg font-semibold">
                Composer un {selectedChannel.toUpperCase()}
              </h3>
              <p className="mt-2">
                Formulaire de composition pour {selectedChannel} irait ici.
              </p>
              {/* Future: Add actual form components here */}
              <Button className="mt-4" onClick={() => setIsComposing(false)}>
                Annuler
              </Button>
            </div>
          )}
        </Card>
      )}

      {!selectedChannel && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Injections / Mises à jour du scénario
            </h2>
            {/* Display Injections */}
            {injections.length > 0 ? (
              <div className="space-y-4">
                {injections.map((injection) => (
                  <div
                    key={injection.id}
                    className={`border p-4 rounded-md ${
                      injection.acknowledged
                        ? "bg-green-100 dark:bg-green-900"
                        : "bg-card"
                    }`}
                  >
                    {" "}
                    {/* Added styling based on acknowledged status */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{injection.title}</h3>
                      <span className="text-sm text-muted-foreground">
                        {injection.timestamp}
                      </span>
                    </div>
                    <p className="mt-2">{injection.content}</p>
                    {!injection.acknowledged && (
                      <Button
                        size="sm"
                        className="mt-4"
                        onClick={() => handleAcknowledgeInjection(injection.id)}
                      >
                        Marquer comme lue
                      </Button>
                    )}
                    {injection.acknowledged && (
                      <Badge variant="secondary" className="mt-4">
                        Lue
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">
                Aucune injection disponible.
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Enregistrement des Décisions
            </h2>
            <p>
              Les participants pourraient enregistrer leurs décisions et actions
              ici.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Rapport Post-Injection
            </h2>
            <p>
              Après chaque injection, un espace pour rédiger et soumettre un
              rapport.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
