"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const assignmentFormSchema = z.object({
  userId: z.string().min(1, "L'utilisateur est requis"),
  simulationId: z.string().min(1, "La simulation est requise"),
  role: z.string().min(1, "Le rôle est requis"),
  teamId: z.string().optional(),
});

export type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;

interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

interface Simulation {
  id: string;
  title: string;
}

interface Team {
  id: string;
  name: string;
}

interface SimulationAssignmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AssignmentFormValues) => Promise<void>;
  users: User[];
  simulations: Simulation[];
  teams: Team[];
}

export function SimulationAssignmentForm({
  open,
  onOpenChange,
  onSubmit,
  users,
  simulations,
  teams,
}: SimulationAssignmentFormProps) {
  const { toast } = useToast();
  const [roles, setRoles] = useState<string[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch("/api/tasks/roles");
        if (!response.ok)
          throw new Error("Erreur lors du chargement des rôles");
        const data = await response.json();
        setRoles(data);
      } catch (error) {
        console.error("Erreur lors du chargement des rôles:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les rôles",
          variant: "destructive",
        });
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, [toast]);

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      userId: "",
      simulationId: "",
      role: "participant",
      teamId: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        userId: "",
        simulationId: "",
        role: "participant",
        teamId: "",
      });
    }
  }, [open, form]);

  const handleSubmit = async (data: AssignmentFormValues) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'affectation.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Affecter un utilisateur à une simulation</DialogTitle>
          <DialogDescription>
            Sélectionnez un utilisateur, une simulation, un rôle et une équipe
            (optionnel).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Utilisateur</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un utilisateur" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users && users.length > 0 ? (
                        users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName} ({user.email})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="no-users">
                          Aucun utilisateur disponible
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="simulationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Simulation</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une simulation" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {simulations.map((simulation) => (
                        <SelectItem key={simulation.id} value={simulation.id}>
                          {simulation.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "participant"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingRoles ? (
                        <SelectItem value="loading" disabled>
                          Chargement des rôles...
                        </SelectItem>
                      ) : roles.length > 0 ? (
                        roles.map((role: string) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-roles" disabled>
                          Aucun rôle trouvé
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="teamId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Équipe (optionnel)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une équipe" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teams.length > 0 ? (
                        teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="no-teams">
                          Aucune équipe disponible
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit">Affecter</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
