"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { TeamSelect } from "./team-select";
import { UserSelect } from "./user-select";

const formSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"], {
    required_error: "Le statut est requis",
  }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"], {
    required_error: "La priorité est requise",
  }),
  dueDate: z.string().optional(),
  teamId: z.string().min(1, "L'équipe est requise"),
  assigneeId: z.string().optional(),
  role: z.union([
    z.enum([
      "Analyste",
      "Chef de projet",
      "Développeur",
      "Testeur",
      "Responsable sécurité",
      "Autre",
    ]),
    z.string()
  ]).refine(val => val !== undefined, { message: "Le rôle est requis" }),
});

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  initialData?: z.infer<typeof formSchema>;
}

export function TaskForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: TaskFormProps) {
  const { toast } = useToast();
  const [customRole, setCustomRole] = useState("");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      status: "PENDING",
      priority: "MEDIUM",
      dueDate: "",
      teamId: "",
      assigneeId: "",
      role: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(initialData || {
        title: "",
        description: "",
        status: "PENDING",
        priority: "MEDIUM",
        dueDate: "",
        teamId: "",
        assigneeId: "",
        role: undefined,
      });
    }
  }, [open, initialData, form]);

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const roleValue = data.role === "Autre" ? customRole : data.role;
      const finalData = {
        ...data,
        role: roleValue as "Analyste" | "Chef de projet" | "Développeur" | "Testeur" | "Responsable sécurité" | "Autre" | string,
      };
      await onSubmit(finalData);
      form.reset();
      setCustomRole("");
      onOpenChange(false);
      toast({
        title: initialData ? "Tâche modifiée" : "Tâche créée",
        description: initialData
          ? "La tâche a été modifiée avec succès."
          : "La tâche a été créée avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'opération.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {initialData ? "Modifier la tâche" : "Nouvelle tâche"}
          </DialogTitle>
          <DialogDescription className="text-base">
            {initialData
              ? "Modifiez les détails de la tâche"
              : "Créez une nouvelle tâche en remplissant les informations ci-dessous"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Titre
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Titre de la tâche" {...field} />
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
                    <FormLabel className="text-base font-medium">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Description de la tâche"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Équipe
                    </FormLabel>
                    <FormControl>
                      <TeamSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Sélectionner une équipe"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Assigné à
                    </FormLabel>
                    <FormControl>
                      <UserSelect
                        value={field.value || ""}
                        onChange={(value) => field.onChange(Array.isArray(value) ? value[0] || "" : value)}
                        placeholder="Sélectionner un utilisateur"
                        form={form}
                        name="assigneeId"
                        label=""
                        multiple={false}
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
                    <FormLabel className="text-base font-medium">
                      Statut
                    </FormLabel>
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
                        <SelectItem value="PENDING">À faire</SelectItem>
                        <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                        <SelectItem value="COMPLETED">Terminée</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Priorité
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une priorité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">Basse</SelectItem>
                        <SelectItem value="MEDIUM">Normale</SelectItem>
                        <SelectItem value="HIGH">Haute</SelectItem>
                        <SelectItem value="CRITICAL">Critique</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Date d'échéance
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Rôle attribué
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un rôle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Analyste">Analyste</SelectItem>
                        <SelectItem value="Chef de projet">
                          Chef de projet
                        </SelectItem>
                        <SelectItem value="Développeur">Développeur</SelectItem>
                        <SelectItem value="Testeur">Testeur</SelectItem>
                        <SelectItem value="Responsable sécurité">
                          Responsable sécurité
                        </SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    {field.value === "Autre" && (
                      <div className="mt-2">
                        <Input
                          placeholder="Précisez le rôle"
                          value={customRole}
                          onChange={(e) => setCustomRole(e.target.value)}
                          required
                        />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="px-6"
              >
                Annuler
              </Button>
              <Button type="submit" className="px-6">
                {initialData ? "Modifier" : "Créer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
