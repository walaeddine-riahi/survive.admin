"use client";

import { SimulationAssignmentForm } from "@/components/simulation-assignment-form";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useUserSession } from "@/hooks/use-user-session";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

interface Simulation {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: string;
}

interface Participation {
  id: string;
  userId: string;
  simulationId: string;
  role: string;
  user: User;
  simulation: Simulation;
}

export default function ParticipationsPage() {
  const { isAuthenticated, isLoading } = useUserSession();
  const { toast } = useToast();
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchParticipations();
    fetchUsers();
    fetchSimulations();
  }, []);

  const fetchParticipations = async () => {
    try {
      const response = await fetch("/api/participations");
      if (!response.ok)
        throw new Error("Erreur lors du chargement des participations");
      const data = await response.json();
      setParticipations(data);
    } catch (error) {
      console.error("Erreur lors du chargement des participations:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les participations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (!response.ok)
        throw new Error("Erreur lors du chargement des utilisateurs");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    }
  };

  const fetchSimulations = async () => {
    try {
      const response = await fetch("/api/simulations");
      if (!response.ok)
        throw new Error("Erreur lors du chargement des simulations");
      const data = await response.json();
      setSimulations(data);
    } catch (error) {
      console.error("Erreur lors du chargement des simulations:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les simulations",
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = async (participationId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/participations/${participationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok)
        throw new Error("Erreur lors de la mise à jour du rôle");

      await fetchParticipations();
      toast({
        title: "Rôle mis à jour",
        description: "Le rôle de participation a été mis à jour avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du rôle:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le rôle",
        variant: "destructive",
      });
    }
  };

  const handleAddParticipation = async (data: {
    userId: string;
    simulationId: string;
    role: string;
  }) => {
    try {
      const response = await fetch("/api/participations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de l'ajout de la participation"
        );
      }

      await fetchParticipations();
      toast({
        title: "Participation ajoutée",
        description: "La participation a été ajoutée avec succès.",
      });
      setIsFormOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la participation:", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible d'ajouter la participation",
        variant: "destructive",
      });
    }
  };

  const handleDeleteParticipation = async (participationId: string) => {
    try {
      const response = await fetch(`/api/participations/${participationId}`, {
        method: "DELETE",
      });

      if (!response.ok)
        throw new Error("Erreur lors de la suppression de la participation");

      await fetchParticipations();
      toast({
        title: "Participation supprimée",
        description: "La participation a été supprimée avec succès.",
      });
    } catch (error) {
      console.error(
        "Erreur lors de la suppression de la participation:",
        error
      );
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la participation",
        variant: "destructive",
      });
    }
  };

  if (isLoading || loading) {
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "participant":
        return (
          <Badge variant="default" className="bg-blue-500">
            Participant
          </Badge>
        );
      case "observer":
        return (
          <Badge variant="default" className="bg-purple-500">
            Observateur
          </Badge>
        );
      case "facilitator":
        return (
          <Badge variant="default" className="bg-green-500">
            Facilitateur
          </Badge>
        );
      case "evaluator":
        return (
          <Badge variant="default" className="bg-orange-500">
            Évaluateur
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gestion des participations</CardTitle>
              <CardDescription>
                Gérez les participations aux simulations
              </CardDescription>
            </div>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Affecter un utilisateur
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Chargement des participations...</div>
          ) : participations.length === 0 ? (
            <p>Aucune participation trouvée.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Simulation</TableHead>
                  <TableHead>Date Début Simulation</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participations.map((participation) => (
                  <TableRow key={participation.id}>
                    <TableCell>
                      <div className="font-medium">
                        {participation.user.firstName}{" "}
                        {participation.user.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {participation.user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {participation.simulation.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {participation.simulation.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(participation.simulation.startDate),
                        "d MMMM yyyy, HH:mm",
                        { locale: fr }
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={participation.role}
                        onValueChange={(newRole) =>
                          handleRoleChange(participation.id, newRole)
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Sélectionner un rôle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="participant">
                            Participant
                          </SelectItem>
                          <SelectItem value="observer">Observateur</SelectItem>
                          <SelectItem value="facilitator">
                            Facilitateur
                          </SelectItem>
                          <SelectItem value="evaluator">Évaluateur</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="flex items-center space-x-2">
                      {getRoleBadge(participation.role)}
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() =>
                          handleDeleteParticipation(participation.id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {!loading && users.length > 0 && simulations.length > 0 && (
        <SimulationAssignmentForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={handleAddParticipation}
          users={users}
          simulations={simulations}
          teams={[]} // Ajout d'un tableau vide pour la prop teams
        />
      )}
    </div>
  );
}
