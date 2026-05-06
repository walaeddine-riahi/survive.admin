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
  const [selectedUsers, setSelectedUsers] = useState<
    { id: string; role: string }[]
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
    if (open) {
      form.reset(initialData || {
        title: "",
        description: "",
        status: "planned",
        startDate: new Date(),
        endDate: new Date(),
        assignments: [],
      });
      if (initialData?.assignments) {
        setSelectedUsers(initialData.assignments.map(a => ({ id: a.userId, role: a.role })));
      } else {
        setSelectedUsers([]);
      }
    }
  }, [open, initialData, form]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleFormSubmit = (data: SimulationFormValues) => {
    const formData = {
      ...data,
      assignments: selectedUsers.map((user) => ({
        userId: user.id,
        role: user.role,
        status: "pending",
      })),
    };
    onSubmit(formData);
    form.reset();
    setSelectedUsers([]);
  };

  const addUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user && !selectedUsers.some((su) => su.id === userId)) {
      setSelectedUsers([...selectedUsers, { id: userId, role: "participant" }]);
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
                    value={field.value}
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
            <div className="space-y-4">
              <FormLabel>Participants</FormLabel>
              <div className="space-y-2">
                <Select onValueChange={addUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ajouter un participant" />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter(
                        (user) => !selectedUsers.some((su) => su.id === user.id)
                      )
                      .map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.email})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <div className="space-y-2">
                  {selectedUsers.map((user) => {
                    const userData = users.find((u) => u.id === user.id);
                    return (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 border rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <span>
                            {userData?.firstName} {userData?.lastName}
                          </span>
                          <Select
                            value={user.role}
                            onValueChange={(role) =>
                              updateUserRole(user.id, role)
                            }
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
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
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeUser(user.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
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
