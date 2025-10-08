"use client";

import { IncidentForm, IncidentFormValues } from "@/components/incident-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { IncidentStatus } from "@prisma/client";
import {
  Calendar,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
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

interface IncidentType {
  id: string;
  name: string;
  description: string | null;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
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

export default function IncidentPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchIncidents = async () => {
    try {
      const response = await fetch("/api/incidents");
      if (!response.ok) {
        throw new Error("Failed to fetch incidents");
      }
      const data = await response.json();
      setIncidents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchIncidentTypes = async () => {
    try {
      console.log("Fetching incident types...");
      const response = await fetch("/api/incident-types");
      if (!response.ok) {
        throw new Error("Failed to fetch incident types");
      }
      const data = await response.json();
      console.log("Incident types received:", data);

      if (data.length === 0) {
        console.log("No incident types found, seeding default types...");
        const seedResponse = await fetch("/api/incident-types/seed", {
          method: "POST",
        });
        if (!seedResponse.ok) {
          throw new Error("Failed to seed incident types");
        }
        const seedData = await seedResponse.json();
        console.log("Default incident types created:", seedData);
        setIncidentTypes(seedData.types);
      } else {
        setIncidentTypes(data);
      }
    } catch (err) {
      console.error("Error fetching or seeding incident types:", err);
      toast({
        title: "Erreur",
        description:
          "Impossible de charger ou d'initialiser les types d'incidents.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchIncidents();
    fetchIncidentTypes();
  }, [fetchIncidents, fetchIncidentTypes]);

  const handleCreateIncident = async (data: IncidentFormValues) => {
    try {
      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create incident");
      }

      await fetchIncidents();
      setIsFormOpen(false);
      toast({
        title: "Incident créé",
        description: "L'incident a été créé avec succès.",
      });
    } catch (error) {
      console.error("Error creating incident:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la création de l'incident.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateIncident = async (data: IncidentFormValues) => {
    if (!selectedIncident) return;

    try {
      const response = await fetch(`/api/incidents/${selectedIncident.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update incident");
      }

      await fetchIncidents();
      setIsFormOpen(false);
      setSelectedIncident(null);
      toast({
        title: "Incident modifié",
        description: "L'incident a été modifié avec succès.",
      });
    } catch (error) {
      console.error("Error updating incident:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la modification de l'incident.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteIncident = async (incidentId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet incident ?")) return;

    try {
      const response = await fetch(`/api/incidents/${incidentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete incident");
      }

      await fetchIncidents();
      toast({
        title: "Incident supprimé",
        description: "L'incident a été supprimé avec succès.",
      });
    } catch (error) {
      console.error("Error deleting incident:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la suppression de l'incident.",
        variant: "destructive",
      });
    }
  };

  const filteredIncidents = incidents.filter((incident) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      incident.name.toLowerCase().includes(searchLower) ||
      incident.description.toLowerCase().includes(searchLower) ||
      incident.location.toLowerCase().includes(searchLower) ||
      incident.type.name.toLowerCase().includes(searchLower) ||
      incident.id.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>Erreur: {error}</div>;
  }

  return (
    <div className="flex-1 pl-0 pr-4 py-4 bg-background">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Incidents</h1>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nouvel incident
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList className="bg-muted">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-background"
              >
                Tous
              </TabsTrigger>
              <TabsTrigger
                value="open"
                className="data-[state=active]:bg-background"
              >
                Ouverts
              </TabsTrigger>
              <TabsTrigger
                value="in_progress"
                className="data-[state=active]:bg-background"
              >
                En cours
              </TabsTrigger>
              <TabsTrigger
                value="resolved"
                className="data-[state=active]:bg-background"
              >
                Résolus
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher..."
                  className="pl-8 w-[200px] md:w-[250px] bg-background border-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            <Card className="bg-card border shadow-sm">
              <CardHeader className="px-6 py-4">
                <div className="flex justify-between">
                  <div>
                    <CardTitle>Tous les incidents</CardTitle>
                    <CardDescription>
                      {filteredIncidents.length} incident
                      {filteredIncidents.length !== 1 ? "s" : ""} trouvé
                      {filteredIncidents.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Lieu</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIncidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell className="font-mono text-xs">
                          {incident.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {incident.name}
                        </TableCell>
                        <TableCell>{incident.type.name}</TableCell>
                        <TableCell>{getStatusBadge(incident.status)}</TableCell>
                        <TableCell>{incident.location}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(incident.incidentDate)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="flex items-center gap-2"
                                onClick={() => {
                                  setSelectedIncident(incident);
                                  setIsFormOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" /> Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center gap-2 text-red-600"
                                onClick={() =>
                                  handleDeleteIncident(incident.id)
                                }
                              >
                                <Trash2 className="h-4 w-4" /> Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="open" className="space-y-4">
            <Card className="bg-card border shadow-sm">
              <CardHeader>
                <CardTitle>Incidents ouverts</CardTitle>
                <CardDescription>
                  {
                    filteredIncidents.filter(
                      (incident) => incident.status === IncidentStatus.OPEN
                    ).length
                  }{" "}
                  incident
                  {filteredIncidents.filter(
                    (incident) => incident.status === IncidentStatus.OPEN
                  ).length !== 1
                    ? "s"
                    : ""}{" "}
                  trouvé
                  {filteredIncidents.filter(
                    (incident) => incident.status === IncidentStatus.OPEN
                  ).length !== 1
                    ? "s"
                    : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Lieu</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIncidents
                      .filter(
                        (incident) => incident.status === IncidentStatus.OPEN
                      )
                      .map((incident) => (
                        <TableRow key={incident.id}>
                          <TableCell className="font-mono text-xs">
                            {incident.id}
                          </TableCell>
                          <TableCell className="font-medium">
                            {incident.name}
                          </TableCell>
                          <TableCell>{incident.type.name}</TableCell>
                          <TableCell>{incident.location}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{formatDate(incident.incidentDate)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() => {
                                    setSelectedIncident(incident);
                                    setIsFormOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" /> Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2 text-red-600"
                                  onClick={() =>
                                    handleDeleteIncident(incident.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" /> Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="in_progress" className="space-y-4">
            <Card className="bg-card border shadow-sm">
              <CardHeader>
                <CardTitle>Incidents en cours</CardTitle>
                <CardDescription>
                  {
                    filteredIncidents.filter(
                      (incident) =>
                        incident.status === IncidentStatus.IN_PROGRESS ||
                        incident.status === IncidentStatus.INVESTIGATING
                    ).length
                  }{" "}
                  incident
                  {filteredIncidents.filter(
                    (incident) =>
                      incident.status === IncidentStatus.IN_PROGRESS ||
                      incident.status === IncidentStatus.INVESTIGATING
                  ).length !== 1
                    ? "s"
                    : ""}{" "}
                  trouvé
                  {filteredIncidents.filter(
                    (incident) =>
                      incident.status === IncidentStatus.IN_PROGRESS ||
                      incident.status === IncidentStatus.INVESTIGATING
                  ).length !== 1
                    ? "s"
                    : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Lieu</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIncidents
                      .filter(
                        (incident) =>
                          incident.status === IncidentStatus.IN_PROGRESS ||
                          incident.status === IncidentStatus.INVESTIGATING
                      )
                      .map((incident) => (
                        <TableRow key={incident.id}>
                          <TableCell className="font-mono text-xs">
                            {incident.id}
                          </TableCell>
                          <TableCell className="font-medium">
                            {incident.name}
                          </TableCell>
                          <TableCell>{incident.type.name}</TableCell>
                          <TableCell>{incident.location}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{formatDate(incident.incidentDate)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() => {
                                    setSelectedIncident(incident);
                                    setIsFormOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" /> Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2 text-red-600"
                                  onClick={() =>
                                    handleDeleteIncident(incident.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" /> Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4">
            <Card className="bg-card border shadow-sm">
              <CardHeader>
                <CardTitle>Incidents résolus</CardTitle>
                <CardDescription>
                  {
                    filteredIncidents.filter(
                      (incident) =>
                        incident.status === IncidentStatus.RESOLVED ||
                        incident.status === IncidentStatus.CLOSED
                    ).length
                  }{" "}
                  incident
                  {filteredIncidents.filter(
                    (incident) =>
                      incident.status === IncidentStatus.RESOLVED ||
                      incident.status === IncidentStatus.CLOSED
                  ).length !== 1
                    ? "s"
                    : ""}{" "}
                  trouvé
                  {filteredIncidents.filter(
                    (incident) =>
                      incident.status === IncidentStatus.RESOLVED ||
                      incident.status === IncidentStatus.CLOSED
                  ).length !== 1
                    ? "s"
                    : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Lieu</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIncidents
                      .filter(
                        (incident) =>
                          incident.status === IncidentStatus.RESOLVED ||
                          incident.status === IncidentStatus.CLOSED
                      )
                      .map((incident) => (
                        <TableRow key={incident.id}>
                          <TableCell className="font-mono text-xs">
                            {incident.id}
                          </TableCell>
                          <TableCell className="font-medium">
                            {incident.name}
                          </TableCell>
                          <TableCell>{incident.type.name}</TableCell>
                          <TableCell>{incident.location}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{formatDate(incident.incidentDate)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() => {
                                    setSelectedIncident(incident);
                                    setIsFormOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" /> Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2 text-red-600"
                                  onClick={() =>
                                    handleDeleteIncident(incident.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" /> Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <IncidentForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setSelectedIncident(null);
          }
        }}
        onSubmit={
          selectedIncident ? handleUpdateIncident : handleCreateIncident
        }
        initialData={
          selectedIncident
            ? {
                name: selectedIncident.name,
                description: selectedIncident.description,
                location: selectedIncident.location,
                resources: selectedIncident.resources || "",
                requiredVehicles: selectedIncident.requiredVehicles || "",
                latitude: selectedIncident.latitude || "",
                longitude: selectedIncident.longitude || "",
                incidentDate: selectedIncident.incidentDate,
                typeId: selectedIncident.type.id,
                teamId: selectedIncident.team?.id,
                planId: selectedIncident.plan?.id,
                status: selectedIncident.status,
              }
            : undefined
        }
        incidentTypes={incidentTypes}
      />
    </div>
  );
}
