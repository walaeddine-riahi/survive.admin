"use client";

import { TaskForm } from "@/components/task-form";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  teamId: string;
  assigneeId: string | null;
  creatorId: string;
  team: {
    id: string;
    name: string;
  };
  assignee: {
    user: {
      profile: {
        firstName: string;
        lastName: string;
      };
    };
  } | null;
  creator: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  role?: string;
}

const statusMap = {
  PENDING: { label: "À faire", variant: "secondary" },
  IN_PROGRESS: { label: "En cours", variant: "default" },
  COMPLETED: { label: "Terminée", variant: "success" },
} as const;

const priorityMap = {
  LOW: { label: "Basse", variant: "secondary" },
  MEDIUM: { label: "Normale", variant: "default" },
  HIGH: { label: "Haute", variant: "warning" },
  CRITICAL: { label: "Critique", variant: "destructive" },
} as const;

export default function TaskPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des tâches");
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les tâches",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (data: any) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok)
        throw new Error("Erreur lors de la création de la tâche");

      await fetchTasks();
      toast({
        title: "Succès",
        description: "Tâche créée avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la tâche",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTask = async (data: any) => {
    if (!selectedTask) return;

    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok)
        throw new Error("Erreur lors de la modification de la tâche");

      await fetchTasks();
      toast({
        title: "Succès",
        description: "Tâche modifiée avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la tâche",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok)
        throw new Error("Erreur lors de la suppression de la tâche");

      await fetchTasks();
      toast({
        title: "Succès",
        description: "Tâche supprimée avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la tâche",
        variant: "destructive",
      });
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    if (selectedTask) {
      handleUpdateTask(data);
    } else {
      handleCreateTask(data);
    }
    setSelectedTask(null);
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">
          Veuillez vous connecter pour accéder à cette page.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Tâches</CardTitle>
            <CardDescription>Gérez les tâches de votre équipe</CardDescription>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>Nouvelle tâche</Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <p>Chargement des tâches...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Équipe</TableHead>
                  <TableHead>Assigné à</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Date d'échéance</TableHead>
                  <TableHead>Créé par</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{task.team.name}</TableCell>
                    <TableCell>
                      {task.assignee
                        ? `${task.assignee.user.profile.firstName} ${task.assignee.user.profile.lastName}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusMap[task.status].variant as any}>
                        {statusMap[task.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={priorityMap[task.priority].variant as any}
                      >
                        {priorityMap[task.priority].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {task.dueDate
                        ? format(new Date(task.dueDate), "PPP", { locale: fr })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {`${task.creator.profile.firstName} ${task.creator.profile.lastName}`}
                    </TableCell>
                    <TableCell>{task.role ? task.role : "-"}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditTask(task)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <TaskForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        initialData={selectedTask || undefined}
      />
    </div>
  );
}
