"use client";

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, PlusCircle, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect } from "react";

// Correspond à l'enum InjectionTriggerType de Prisma
enum InjectionTriggerTypeEnum {
  MANUAL = "MANUAL",
  TIMED = "TIMED",
}

const scenarioFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  simulationId: z.string().min(1, "La simulation est requise"),
});

type ScenarioFormValues = z.infer<typeof scenarioFormSchema>;

interface Simulation {
  id: string;
  title: string;
}

interface ScenarioInjection {
  id: string;
  name: string;
  // Ajoutez d'autres champs si nécessaire pour l'affichage
  // par exemple: triggerType, timeOffset, etc.
}

interface ScenarioFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ScenarioFormValues) => void;
  simulations: Simulation[];
  initialData?: {
    id: string;
    name: string;
    description?: string;
    simulationId: string;
  };
  scenarioInjections: ScenarioInjection[];
  onAddInjectionClick: () => void;
  onEditInjectionClick: (injectionId: string, scenarioId: string) => void;
  onDeleteInjectionClick: (injectionId: string, scenarioId: string) => void;
}

export function ScenarioForm({
  open,
  onOpenChange,
  onSubmit,
  simulations,
  initialData,
  scenarioInjections,
  onAddInjectionClick,
  onEditInjectionClick,
  onDeleteInjectionClick,
}: ScenarioFormProps) {
  const form = useForm<ScenarioFormValues>({
    resolver: zodResolver(scenarioFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      simulationId: initialData?.simulationId || "",
    },
  });

  // Réinitialiser le formulaire lorsque les données initiales ou l'état d'ouverture changent
  useEffect(() => {
    if (open) {
      form.reset({
        name: initialData?.name || "",
        description: initialData?.description || "",
        simulationId: initialData?.simulationId || "",
      });
    }
  }, [open, initialData, form]);

  const handleSubmit = (data: ScenarioFormValues) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Modifier le scénario" : "Créer un scénario"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Modifiez les détails du scénario ci-dessous." +
                " Gérer les injections associées à ce scénario."
              : "Remplissez les détails du scénario ci-dessous."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom du scénario" {...field} />
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
                  <FormLabel>Description (Optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description du scénario"
                      {...field}
                    />
                  </FormControl>
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

            {/* Section pour les injections */}
            {initialData && ( // Afficher seulement en mode modification
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Injections</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onAddInjectionClick}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une
                    injection
                  </Button>
                </div>
                {scenarioInjections.length > 0 ? (
                  <ul className="space-y-2">
                    {scenarioInjections.map((injection) => (
                      <li
                        key={injection.id}
                        className="flex items-center justify-between"
                      >
                        <span>
                          {injection.name || `Injection ${injection.id}`}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              initialData.id &&
                              onEditInjectionClick(injection.id, initialData.id)
                            }
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">
                              Modifier l'injection
                            </span>
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              initialData.id &&
                              onDeleteInjectionClick(
                                injection.id,
                                initialData.id
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">
                              Supprimer l'injection
                            </span>
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Aucune injection associée à ce scénario.
                  </p>
                )}
              </div>
            )}

            <DialogFooter>
              <Button type="submit">
                {initialData ? "Modifier" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
