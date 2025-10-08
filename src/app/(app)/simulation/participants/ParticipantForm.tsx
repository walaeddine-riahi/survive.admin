"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

export type Participant = {
  id?: string;
  name: string;
  role: string;
  // Ajoutez d'autres champs ici si nécessaire (ex: email, équipe, etc.)
};

// Define the schema for the form using Zod
const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  role: z
    .string()
    .min(2, { message: "Le rôle doit contenir au moins 2 caractères." }),
});

type ParticipantFormValues = z.infer<typeof formSchema>;

export function ParticipantForm({
  initialData,
  onSubmit,
  submitLabel = "Enregistrer",
}: {
  initialData?: Partial<ParticipantFormValues>;
  onSubmit: (data: ParticipantFormValues) => void;
  submitLabel?: string;
}) {
  // Initialize the form with React Hook Form
  const form = useForm<ParticipantFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      role: initialData?.role || "",
    },
  });

  // The onSubmit function now receives validated data from React Hook Form
  function handleFormSubmit(values: ParticipantFormValues) {
    onSubmit(values);
  }

  return (
    <Form {...form}>
      {" "}
      {/* Wrap form with Shadcn Form */}
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Ex : Jean Dupont" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Role Field */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rôle</FormLabel>
                <FormControl>
                  <Input placeholder="Ex : Cyber Analyst" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Ajoutez d'autres FormFields ici pour les champs supplémentaires */}
        </div>
        <Button type="submit" className="w-full md:w-auto">
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}
