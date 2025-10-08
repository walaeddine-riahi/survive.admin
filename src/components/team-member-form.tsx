"use client";

import { TeamSelect } from "@/components/team-select";
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
import { UserSelect } from "@/components/user-select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const teamMemberFormSchema = z.object({
  userId: z.string().min(1, "L&apos;utilisateur est requis"),
  role: z.string().min(1, "Le rôle est requis"),
  teamId: z.string().min(1, "L&apos;équipe est requise"),
});

type TeamMemberFormValues = z.infer<typeof teamMemberFormSchema>;

interface TeamMemberFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TeamMemberFormValues) => void;
  initialData?: TeamMemberFormValues;
}

const TEAM_ROLES = [
  { value: "LEADER", label: "Responsable" },
  { value: "MEMBER", label: "Membre" },
  { value: "VIEWER", label: "Observateur" },
];

export function TeamMemberForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: TeamMemberFormProps) {
  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: initialData || {
      userId: "",
      role: "",
      teamId: "",
    },
  });

  const handleSubmit = (data: TeamMemberFormValues) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Modifier le membre" : "Ajouter un membre"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Modifiez les informations du membre."
              : "Ajoutez un nouveau membre à l&apos;équipe."}
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
                  <FormControl>
                    <UserSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Sélectionner un utilisateur"
                      form={form}
                      name="userId"
                      label="Utilisateur"
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
                  <FormLabel>Équipe</FormLabel>
                  <FormControl>
                    <TeamSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Sélectionner une équipe"
                      form={form}
                      name="teamId"
                      label="Équipe"
                    />
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
                  <FormLabel>Rôle</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TEAM_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">
                {initialData ? "Modifier" : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
