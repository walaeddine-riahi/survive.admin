"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Simulation {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: string;
  assignmentStatus: string;
}

interface Incident {
  id: string;
  name: string;
  description: string;
  status: string;
  location: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "planned":
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-500 border-blue-500/20"
        >
          Planifié
        </Badge>
      );
    case "ongoing":
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
    case "confirmed":
      return (
        <Badge variant="default" className="bg-green-500">
          Confirmé
        </Badge>
      );
    case "pending":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
        >
          En attente
        </Badge>
      );
    default:
      return <Badge variant="outline">Non défini</Badge>;
  }
};

export default function ParticipantModePage() {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [activeIncidents, setActiveIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/participant-mode");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setSimulations(data.simulations);
        setActiveIncidents(data.incidents);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données. Veuillez réessayer.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="pb-4 border-b">
          <h1 className="text-2xl font-bold">Mode Participant</h1>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="pb-4 border-b">
        <h1 className="text-2xl font-bold">Mode Participant</h1>
        <p className="text-muted-foreground">
          {simulations.length > 0
            ? `Vous êtes assigné à ${simulations.length} simulation${
                simulations.length > 1 ? "s" : ""
              }`
            : "Vous n'êtes assigné à aucune simulation pour le moment."}
        </p>
      </div>

      <div className="space-y-6">
        {/* Simulations Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Mes Simulations</h2>
          {simulations.length > 0 ? (
            <div className="space-y-4">
              {simulations.map((simulation) => (
                <Card key={simulation.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium">{simulation.title}</h3>
                    <div className="flex gap-2">
                      {getStatusBadge(simulation.status)}
                      {getAssignmentStatusBadge(simulation.assignmentStatus)}
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-2">
                    {simulation.description || "Aucune description."}
                  </p>
                  <div className="text-sm text-muted-foreground mb-4">
                    {formatDate(simulation.startDate)} -{" "}
                    {formatDate(simulation.endDate)}
                  </div>
                  <Button asChild>
                    <Link
                      href={`/simulation/${simulation.id}/participant-view`}
                    >
                      Accéder à la simulation
                    </Link>
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Aucune simulation assignée pour le moment.
            </p>
          )}
        </Card>

        {/* Active Incidents Section */}
        <Separator />
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Incidents Actifs</h2>
          {activeIncidents.length > 0 ? (
            <ul className="space-y-2">
              {activeIncidents.map((incident) => (
                <li key={incident.id}>
                  <Button asChild variant="link" className="px-0">
                    <Link href={`/incident/${incident.id}/participant-view`}>
                      {incident.name}
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">
              Aucun incident actif pour le moment.
            </p>
          )}
        </Card>
      </div>
    </div>
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
