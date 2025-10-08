"use client";

// Types locaux
type PlanType = {
  id: string;
  name: string;
  description: string | null;
};

type PlanTask = {
  id: string;
  taskId: string;
  planId: string;
};

import { Task } from "@/types/task";

type Plan = {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: string;
  type: PlanType;
  planTasks: PlanTask[];
};

import { TaskAssignment } from "@/components/task-assignment";
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
import { useForm } from "react-hook-form";
import * as z from "zod";

const planFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  startDate: z.string().min(1, "La date de début est requise"),
  endDate: z.string().min(1, "La date de fin est requise"),
  status: z.string().min(1, "Le statut est requis"),
  typeId: z.string().min(1, "Le type est requis"),
  assignedTaskIds: z.array(z.string()).default([])
});

type PlanFormValues = z.infer<typeof planFormSchema> & {
  description?: string | null;
};

type PlanFormData = z.infer<typeof planFormSchema>;

interface PlanFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PlanFormData) => Promise<void>;
  planTypes: PlanType[];
  allTasks: Task[];
  initialData?: Omit<Partial<PlanFormData>, 'description' | 'assignedTaskIds'> & {
    description?: string | null;
    assignedTaskIds?: string[];
  };
}

export function PlanForm({
  open,
  onOpenChange,
  onSubmit,
  planTypes,
  allTasks,
  initialData,
}: PlanFormProps) {
  const defaultValues = {
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "draft" as const,
    typeId: "",
    assignedTaskIds: [] as string[],
  };

  const form = useForm<z.infer<typeof planFormSchema>>({
    resolver: zodResolver(planFormSchema) as any,
    defaultValues: {
      ...defaultValues,
      ...initialData,
      description: initialData?.description ?? defaultValues.description,
      assignedTaskIds: initialData?.assignedTaskIds ?? defaultValues.assignedTaskIds,
    },
  });

  const assignedTaskIds = form.watch("assignedTaskIds");

  const handleAssignTask = (taskId: string) => {
    form.setValue("assignedTaskIds", [...assignedTaskIds, taskId]);
  };

  const handleUnassignTask = (taskId: string) => {
    form.setValue(
      "assignedTaskIds",
      assignedTaskIds.filter((id) => id !== taskId)
    );
  };

  const assignedTasks = allTasks.filter((task) =>
    assignedTaskIds.includes(task.id)
  );
  const availableTasks = allTasks.filter(
    (task) => !assignedTaskIds.includes(task.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] w-[90vw] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Modifier le plan" : "Nouveau plan"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Modifiez les détails du plan ci-dessous."
              : "Remplissez les détails du nouveau plan ci-dessous."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto pr-2 -mr-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom du plan" {...field} />
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
                      placeholder="Description du plan"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de début</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de fin</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="typeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {planTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
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
                          <SelectValue placeholder="Sélectionnez un statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Brouillon</SelectItem>
                        <SelectItem value="in_progress">En cours</SelectItem>
                        <SelectItem value="completed">Terminé</SelectItem>
                        <SelectItem value="cancelled">Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Assigner des tâches</h3>
              <TaskAssignment
                assignedTasks={assignedTasks}
                availableTasks={availableTasks}
                onAssignTask={handleAssignTask}
                onUnassignTask={handleUnassignTask}
              />
            </div>
            <div className="sticky bottom-0 bg-background pt-4 pb-2 -mx-6 px-6 border-t">
              <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                {form.formState.isSubmitting
                  ? "Enregistrement..."
                  : "Enregistrer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
