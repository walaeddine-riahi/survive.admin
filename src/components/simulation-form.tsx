"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
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
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const simulationFormSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Le titre doit contenir au moins 2 caractères." }),
  description: z.string().optional(),
  status: z.enum(["planned", "ongoing", "completed", "cancelled"], {
    message: "Statut invalide.",
  }),
  startDate: z.date({ required_error: "La date de début est requise." }),
  endDate: z.date({ required_error: "La date de fin est requise." }),
  assignments: z
    .array(
      z.object({
        userId: z.string(),
        role: z.enum(["participant", "observer", "facilitator"]),
        status: z.enum(["pending", "confirmed", "declined"]),
        teamId: z.string().optional(),
      })
    )
    .optional(),
});

export type SimulationFormValues = z.infer<typeof simulationFormSchema>;

interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

interface Team {
  id: string;
  name: string;
}

interface SimulationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SimulationFormValues) => void;
  initialData?: SimulationFormValues;
}

export function SimulationForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: SimulationFormProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<
    { id: string; role: string; teamId?: string }[]
  >([]);

  const form = useForm<SimulationFormValues>({
    resolver: zodResolver(simulationFormSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      status: "planned",
      startDate: new Date(),
      endDate: new Date(),
      assignments: [],
    },
  });

  useEffect(() => {
    const fetchUsersAndTeams = async () => {
      try {
        const usersResponse = await fetch("/api/users");
        if (!usersResponse.ok) throw new Error("Failed to fetch users");
        const usersData = await usersResponse.json();
        setUsers(
          usersData
            .filter((user: User | null | undefined) => user && user.id !== "")
            .map((user: User) => ({ ...user, id: String(user.id) }))
        );

        const teamsResponse = await fetch("/api/teams");
        if (!teamsResponse.ok) throw new Error("Failed to fetch teams");
        const teamsData = await teamsResponse.json();
        setTeams(
          teamsData
            .filter((team: Team | null | undefined) => team && team.id !== "")
            .map((team: Team) => ({ ...team, id: String(team.id) }))
        );

        if (initialData?.assignments) {
          setSelectedUsers(
            initialData.assignments
              .filter(
                (assignment) =>
                  assignment.userId !== "" &&
                  (assignment.teamId === undefined || assignment.teamId !== "")
              )
              .map((assignment) => ({
                id: assignment.userId,
                role: assignment.role,
                teamId: assignment.teamId,
              }))
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchUsersAndTeams();
  }, [initialData]);

  const handleFormSubmit = (data: SimulationFormValues) => {
    const formData = {
      ...data,
      assignments: selectedUsers.map((user) => ({
        userId: user.id,
        role: user.role as "participant" | "observer" | "facilitator",
        status: "pending" as const,
        teamId: user.teamId,
      })),
    };
    onSubmit(formData);
    form.reset();
    setSelectedUsers([]);
  };

  const addUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user && !selectedUsers.some((su) => su.id === userId)) {
      setSelectedUsers([
        ...selectedUsers,
        { id: userId, role: "participant", teamId: undefined },
      ]);
    }
  };

  const removeUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
  };

  const updateUserRole = (userId: string, role: string) => {
    setSelectedUsers(
      selectedUsers.map((user) =>
        user.id === userId ? { ...user, role } : user
      )
    );
  };

  const updateUserTeam = (userId: string, teamId: string) => {
    setSelectedUsers(
      selectedUsers.map((user) =>
        user.id === userId
          ? { ...user, teamId: teamId === "no-team" ? undefined : teamId }
          : user
      )
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Modifier la simulation" : "Créer une simulation"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input placeholder="Titre de la simulation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description de la simulation"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="planned">Planifié</SelectItem>
                      <SelectItem value="ongoing">En cours</SelectItem>
                      <SelectItem value="completed">Terminé</SelectItem>
                      <SelectItem value="cancelled">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de début</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: fr })
                            ) : (
                              <span>Choisir une date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de fin</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: fr })
                            ) : (
                              <span>Choisir une date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Assignments Section */}
            <div className="space-y-4 rounded-md border p-4">
              <h3 className="text-lg font-medium">Affectations</h3>
              <div className="flex items-center space-x-2">
                <Select onValueChange={addUser} defaultValue="none">
                  <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="Ajouter un utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" disabled>
                      Sélectionner un utilisateur
                    </SelectItem>
                    {users.length === 0 ? (
                      <SelectItem value="no-users" disabled>
                        Aucun utilisateur disponible
                      </SelectItem>
                    ) : (
                      users
                        .filter(
                          (user) =>
                            user.id !== "" &&
                            !selectedUsers.some(
                              (selected) => selected.id === user.id
                            )
                        )
                        .map((user) => {
                          if (!user.id || String(user.id) === "") return null;
                          return (
                            <SelectItem key={user.id} value={String(user.id)}>
                              {user.firstName} {user.lastName} ({user.email})
                            </SelectItem>
                          );
                        })
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedUsers.length > 0 && (
                <div className="space-y-4">
                  {selectedUsers.map((assignment) => {
                    const user = users.find((u) => u.id === assignment.id);
                    return (
                      user && (
                        <div
                          key={user.id}
                          className="flex items-center justify-between rounded-md border p-3"
                        >
                          <div className="flex flex-col">
                            <span>
                              {user.firstName} {user.lastName} ({user.email})
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Select
                              onValueChange={(value) =>
                                updateUserRole(user.id, value)
                              }
                              value={assignment.role}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Sélectionner un rôle" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="participant">
                                  Participant
                                </SelectItem>
                                <SelectItem value="observer">
                                  Observateur
                                </SelectItem>
                                <SelectItem value="facilitator">
                                  Facilitateur
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            <Select
                              onValueChange={(value) =>
                                updateUserTeam(user.id, value)
                              }
                              value={
                                teams.some(
                                  (team) => team.id === assignment.teamId
                                )
                                  ? String(assignment.teamId)
                                  : "no-team"
                              }
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Sélectionner une équipe" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="no-team">
                                  Aucune équipe
                                </SelectItem>
                                {teams.map((team) => {
                                  console.log(
                                    "Team ID being rendered:",
                                    team.id
                                  );
                                  if (!team.id || String(team.id) === "")
                                    return null;
                                  return (
                                    <SelectItem
                                      key={team.id}
                                      value={String(team.id)}
                                    >
                                      {team.name}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeUser(user.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    );
                  })}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full">
              {initialData ? "Modifier" : "Créer"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
