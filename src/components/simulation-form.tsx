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
import { X, Plus, Calendar as CalendarIcon } from "lucide-react";
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
  initialData?: any;
  onSave: (data: SimulationFormValues) => void;
  onCancel: () => void;
}

export function SimulationForm({
  initialData,
  onSave,
  onCancel,
}: SimulationFormProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<{ id: string; role: "participant" | "observer" | "facilitator" }[]>([]);

  const form = useForm<SimulationFormValues>({
    resolver: zodResolver(simulationFormSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description || "",
      status: initialData.status,
      startDate: new Date(initialData.startDate),
      endDate: new Date(initialData.endDate),
    } : {
      title: "",
      description: "",
      status: "planned",
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        description: initialData.description || "",
        status: initialData.status,
        startDate: new Date(initialData.startDate),
        endDate: new Date(initialData.endDate),
      });
      if (initialData.assignments) {
        setSelectedUsers(initialData.assignments.map((a: any) => ({
          id: a.userId,
          role: a.role
        })));
      } else {
        setSelectedUsers([]);
      }
    } else {
      form.reset({
        title: "",
        description: "",
        status: "planned",
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      });
      setSelectedUsers([]);
    }
  }, [initialData, form]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleFormSubmit = (data: SimulationFormValues) => {
    onSave({
      ...data,
      assignments: selectedUsers.map(u => ({
        userId: u.id,
        role: u.role,
        status: "pending"
      }))
    });
  };

  const addUser = (userId: string) => {
    if (userId === "none") return;
    if (!selectedUsers.find(u => u.id === userId)) {
      setSelectedUsers([...selectedUsers, { id: userId, role: "participant" }]);
    }
  };

  const removeUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const updateUserRole = (userId: string, role: string) => {
    setSelectedUsers(selectedUsers.map(u => 
      u.id === userId ? { ...u, role: role as any } : u
    ));
  };

  return (
    <div className="p-8">
      <DialogHeader className="mb-8">
        <DialogTitle className="text-3xl font-black tracking-tight text-[var(--text-primary)]">
          {initialData ? "Configuration Simulation" : "Nouvelle Simulation"}
        </DialogTitle>
        <p className="text-[var(--text-muted)] text-sm uppercase tracking-widest font-bold">Protocole de résilience augmentée</p>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">Titre du Projet</FormLabel>
                    <FormControl>
                      <Input placeholder="S.U.R.V.I.V.E. Alpha" className="bg-[var(--bg-surface)] border-[var(--border)] h-12" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px] uppercase font-bold" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">Niveau d'Activation</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[var(--bg-surface)] border-[var(--border)] h-12">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[var(--bg-surface)] border-[var(--border)]">
                        <SelectItem value="planned">⚪ Planifié</SelectItem>
                        <SelectItem value="ongoing">🔵 En cours</SelectItem>
                        <SelectItem value="completed">🟢 Terminé</SelectItem>
                        <SelectItem value="cancelled">🔴 Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">Briefing Opérationnel</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Détails stratégiques de la simulation..." 
                      className="bg-[var(--bg-surface)] border-[var(--border)] min-h-[150px] resize-none pt-4" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-8 p-6 bg-[var(--bg-tertiary)]/30 rounded-[12px] border border-[var(--border)]">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Début Séquence</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="ghost" className="bg-[var(--bg-surface)] border-[var(--border)] h-12 justify-start font-bold">
                          <CalendarIcon className="mr-3 h-4 w-4 text-[var(--accent)]" />
                          {field.value ? format(field.value, "PPP", { locale: fr }) : "Choisir date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="bg-[var(--bg-surface)] p-0 border-[var(--border)]" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className="text-[var(--text-primary)]" />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Fin Séquence</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="ghost" className="bg-[var(--bg-surface)] border-[var(--border)] h-12 justify-start font-bold">
                          <CalendarIcon className="mr-3 h-4 w-4 text-secondary" />
                          {field.value ? format(field.value, "PPP", { locale: fr }) : "Choisir date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="bg-[var(--bg-surface)] p-0 border-[var(--border)]" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
          </div>

          {/* Assignments */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--accent)]">Unités Opérationnelles</h3>
              <Select onValueChange={addUser} defaultValue="none">
                <SelectTrigger className="w-[280px] bg-[var(--bg-tertiary)]/50 border-[var(--border)] h-10 rounded-[12px] text-xs font-bold">
                  <Plus className="h-3 w-3 mr-2" /> <SelectValue placeholder="Ajouter un membre" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-surface)] border-[var(--border)]">
                  {users.filter(u => !selectedUsers.some(su => su.id === u.id)).map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.firstName} {user.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {selectedUsers.map((assignment) => {
                const user = users.find((u) => u.id === assignment.id);
                return user && (
                  <div key={user.id} className="group flex items-center justify-between bg-[var(--bg-tertiary)]/20 hover:bg-[var(--bg-hover)] border border-[var(--border)] rounded-[12px] p-4 transition-all duration-300">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-[var(--text-primary)]">{user.firstName} {user.lastName}</span>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select onValueChange={(v) => updateUserRole(user.id, v)} value={assignment.role}>
                        <SelectTrigger className="h-9 w-32 bg-transparent border-[var(--border)] text-[10px] font-bold uppercase">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[var(--bg-surface)] border-[var(--border)]">
                          <SelectItem value="participant">Participant</SelectItem>
                          <SelectItem value="observer">Observateur</SelectItem>
                          <SelectItem value="facilitator">Facilitateur</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" onClick={() => removeUser(user.id)} className="h-8 w-8 rounded-full hover:bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button variant="ghost" type="button" className="flex-1 h-14 rounded-[12px] hover:bg-[var(--bg-hover)] font-black uppercase tracking-widest" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" className="flex-[2] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white h-14 rounded-[12px] font-black uppercase tracking-[0.3em]">
              {initialData ? "Mettre à jour" : "Lancer Simulation"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
