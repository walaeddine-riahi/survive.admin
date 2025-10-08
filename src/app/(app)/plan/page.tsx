"use client";

import { PlanForm } from "@/components/plan-form";
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
import { Edit, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: string;
  type: {
    id: string;
    name: string;
    description: string | null;
  };
  planTasks: PlanTask[];
}

interface PlanTask {
  id: string;
  planId: string;
  taskId: string;
  task: Task;
}

interface PlanType {
  id: string;
  name: string;
  description: string | null;
}

interface PlanFormData {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: string;
  typeId: string;
  assignedTaskIds?: string[];
}

import { Task as SharedTask } from "@/types/task";

interface Task extends Omit<SharedTask, 'role'> {
  // On hérite de toutes les propriétés de SharedTask sauf 'role' qui est optionnel
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "draft":
      return (
        <Badge
          variant="outline"
          className="bg-gray-500/10 text-gray-500 border-gray-500/20"
        >
          Brouillon
        </Badge>
      );
    case "in_progress":
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

const getTypeBadge = (type: string) => {
  switch (type.toLowerCase()) {
    case "maintenance":
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-500 border-blue-500/20"
        >
          Maintenance
        </Badge>
      );
    case "security":
      return (
        <Badge
          variant="outline"
          className="bg-red-500/10 text-red-500 border-red-500/20"
        >
          Sécurité
        </Badge>
      );
    case "training":
      return (
        <Badge
          variant="outline"
          className="bg-purple-500/10 text-purple-500 border-purple-500/20"
        >
          Formation
        </Badge>
      );
    case "emergency":
      return (
        <Badge
          variant="outline"
          className="bg-orange-500/10 text-orange-500 border-orange-500/20"
        >
          Urgence
        </Badge>
      );
    case "quality":
      return (
        <Badge
          variant="outline"
          className="bg-green-500/10 text-green-500 border-green-500/20"
        >
          Qualité
        </Badge>
      );
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

export default function PlanPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planTypes, setPlanTypes] = useState<PlanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/plans");
      if (!response.ok) {
        throw new Error("Failed to fetch plans");
      }
      const data = await response.json();
      console.log("Fetched plans data:", data);
      setPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanTypes = async () => {
    try {
      console.log("Fetching plan types...");
      const response = await fetch("/api/plan-types");
      if (!response.ok) {
        throw new Error("Failed to fetch plan types");
      }
      const data = await response.json();
      console.log("Plan types received:", data);

      // Si aucun type n'existe, initialiser les types par défaut
      if (data.length === 0) {
        console.log("No plan types found, seeding default types...");
        const seedResponse = await fetch("/api/plan-types/seed", {
          method: "POST",
        });
        if (!seedResponse.ok) {
          throw new Error("Failed to seed plan types");
        }
        const seedData = await seedResponse.json();
        console.log("Default plan types created:", seedData);
        setPlanTypes(seedData.types);
      } else {
        setPlanTypes(data);
      }
    } catch (err) {
      console.error("Error fetching plan types:", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  useEffect(() => {
    console.log("Initial fetch of plans and plan types");
    fetchPlans();
    fetchPlanTypes();
    fetchTasks();
  }, []);

  const handleCreatePlan = async (data: PlanFormData) => {
    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create plan");
      }

      toast({
        title: "Succès",
        description: "Le plan a été créé avec succès.",
      });
      setIsFormOpen(false);
      fetchPlans();
    } catch (error) {
      toast({
        title: "Erreur",
        description: `Échec de la création du plan: ${
          error instanceof Error
            ? error.message
            : "Une erreur inattendue est survenue"
        }`,
        variant: "destructive",
      });
    }
  };

  const handleUpdatePlan = async (data: PlanFormData) => {
    if (!selectedPlan) return;
    console.log("Updating plan with ID:", selectedPlan.id);
    try {
      const response = await fetch(`/api/plans/${selectedPlan.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update plan");
      }

      toast({
        title: "Succès",
        description: "Le plan a été mis à jour avec succès.",
      });
      setIsFormOpen(false);
      setSelectedPlan(null);
      fetchPlans();
    } catch (error) {
      toast({
        title: "Erreur",
        description: `Échec de la mise à jour du plan: ${
          error instanceof Error
            ? error.message
            : "Une erreur inattendue est survenue"
        }`,
        variant: "destructive",
      });
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      const response = await fetch(`/api/plans/${planId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete plan");
      }

      toast({
        title: "Succès",
        description: "Le plan a été supprimé avec succès.",
      });
      fetchPlans();
    } catch (error) {
      toast({
        title: "Erreur",
        description: `Échec de la suppression du plan: ${
          error instanceof Error
            ? error.message
            : "Une erreur inattendue est survenue"
        }`,
        variant: "destructive",
      });
    }
  };

  const filteredPlans = plans.filter((plan) =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Plans</h2>
        <Button
          onClick={() => {
            setSelectedPlan(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Nouveau Plan
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Rechercher un plan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Tabs defaultValue="plans">
        <TabsList className="grid w-fit grid-cols-1 md:grid-cols-2">
          <TabsTrigger value="plans">Plans</TabsTrigger>
          {selectedPlan && (
            <TabsTrigger value="details">Détails du Plan</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="plans" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Liste des Plans</CardTitle>
              <CardDescription>Gérer vos plans de maintenance.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Chargement des plans...</div>
              ) : error ? (
                <div className="text-red-500">Erreur: {error}</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date de début</TableHead>
                      <TableHead>Date de fin</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlans.length > 0 ? (
                      filteredPlans.map((plan) => (
                        <TableRow
                          key={plan.id}
                          onClick={() => {
                            setSelectedPlan(plan);
                          }}
                          className="cursor-pointer"
                        >
                          <TableCell className="font-medium">
                            {plan.name}
                          </TableCell>
                          <TableCell>{plan.description}</TableCell>
                          <TableCell>{formatDate(plan.startDate)}</TableCell>
                          <TableCell>{formatDate(plan.endDate)}</TableCell>
                          <TableCell>{getStatusBadge(plan.status)}</TableCell>
                          <TableCell>{getTypeBadge(plan.type.name)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedPlan(plan);
                                    setIsFormOpen(true);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" /> Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeletePlan(plan.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          Aucun plan trouvé.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {selectedPlan && (
          <TabsContent value="details" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Détails du Plan: {selectedPlan.name}</CardTitle>
                <CardDescription>{selectedPlan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Date de début:</p>
                    <p>{formatDate(selectedPlan.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Date de fin:</p>
                    <p>{formatDate(selectedPlan.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Statut:</p>
                    <p>{getStatusBadge(selectedPlan.status)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Type:</p>
                    <p>{getTypeBadge(selectedPlan.type.name)}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-lg font-medium mb-2">
                    Tâches Assignées:
                  </h4>
                  {selectedPlan.planTasks &&
                  selectedPlan.planTasks.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedPlan.planTasks.map((planTask) => (
                        <li key={planTask.task.id}>
                          {planTask.task.title} ({planTask.task.status})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">
                      Aucune tâche assignée.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <PlanForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={selectedPlan ? handleUpdatePlan : handleCreatePlan}
        planTypes={planTypes}
        allTasks={tasks}
        initialData={
          selectedPlan
            ? {
                ...selectedPlan,
                typeId: selectedPlan.type.id,
                assignedTaskIds: selectedPlan.planTasks.map((pt) => pt.taskId),
              }
            : undefined
        }
      />
    </div>
  );
}
