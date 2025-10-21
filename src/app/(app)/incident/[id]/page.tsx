"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { IncidentStatus } from "@prisma/client";
import { Calendar, Car, FileText, MapPin, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Incident {
  id: string;
  name: string;
  description: string;
  status: IncidentStatus;
  location: string;
  resources: string | null;
  requiredVehicles: string | null;
  latitude: string | null;
  longitude: string | null;
  incidentDate: string;
  createdAt: string;
  updatedAt: string | null;
  reporter: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  type: {
    id: string;
    name: string;
    description: string | null;
  };
  team: {
    id: string;
    name: string;
  } | null;
  plan: {
    id: string;
    name: string;
  } | null;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getStatusBadge = (status: IncidentStatus) => {
  switch (status) {
    case IncidentStatus.OPEN:
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-500 border-blue-500/20"
        >
          Ouvert
        </Badge>
      );
    case IncidentStatus.IN_PROGRESS:
      return (
        <Badge variant="default" className="bg-orange-500">
          En cours
        </Badge>
      );
    case IncidentStatus.INVESTIGATING:
      return (
        <Badge variant="default" className="bg-purple-500">
          En investigation
        </Badge>
      );
    case IncidentStatus.RESOLVED:
      return (
        <Badge variant="default" className="bg-green-500">
          Résolu
        </Badge>
      );
    case IncidentStatus.CLOSED:
      return <Badge variant="secondary">Fermé</Badge>;
    default:
      return <Badge variant="outline">Non défini</Badge>;
  }
};

export default function IncidentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const response = await fetch(`/api/incidents/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch incident");
        }
        const data = await response.json();
        setIncident(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchIncident();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet incident ?")) return;

    try {
      const response = await fetch(`/api/incidents/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete incident");
      }

      toast({
        title: "Incident supprimé",
        description: "L&apos;incident a été supprimé avec succès.",
      });

      router.push("/incident");
    } catch (error) {
      console.error("Error deleting incident:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la suppression de l&apos;incident.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error || !incident) {
    return <div>Erreur: {error || "Incident non trouvé"}</div>;
  }

  return (
    <div className="flex-1 pl-0 pr-4 py-4 bg-background">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{incident.name}</h1>
            <p className="text-muted-foreground mt-1">ID: {incident.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/incident/${incident.id}/edit`)}
            >
              Modifier
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Détails de l&apos;incident</CardTitle>
              <CardDescription>
                Informations générales sur l&apos;incident
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge>{incident.type.name}</Badge>
                {getStatusBadge(incident.status)}
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Description</h3>
                <p className="text-muted-foreground">{incident.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Date de l&apos;incident</span>
                  </div>
                  <p>{formatDate(incident.incidentDate)}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Lieu</span>
                  </div>
                  <p>{incident.location}</p>
                </div>
              </div>

              {incident.resources && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Ressources nécessaires</span>
                  </div>
                  <p>{incident.resources}</p>
                </div>
              )}

              {incident.requiredVehicles && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Car className="h-4 w-4" />
                    <span>Véhicules requis</span>
                  </div>
                  <p>{incident.requiredVehicles}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Équipe et plan</CardTitle>
              <CardDescription>
                Informations sur l&apos;équipe et le plan d&apos;intervention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Équipe assignée</span>
                </div>
                <p>
                  {incident.team
                    ? incident.team.name
                    : "Aucune équipe assignée"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Plan d&apos;intervention</span>
                </div>
                <p>
                  {incident.plan ? incident.plan.name : "Aucun plan assigné"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Signalé par</span>
                </div>
                <p>
                  {incident.reporter.firstName && incident.reporter.lastName
                    ? `${incident.reporter.firstName} ${incident.reporter.lastName}`
                    : incident.reporter.email}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Créé le</span>
                  </div>
                  <p>{formatDate(incident.createdAt)}</p>
                </div>

                {incident.updatedAt && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Mis à jour le</span>
                    </div>
                    <p>{formatDate(incident.updatedAt)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
