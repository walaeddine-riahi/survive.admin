"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  processFormSchemaEnhanced,
  type ProcessFormValues,
} from "@/lib/validations/process-schema";
import { createProcess } from "@/actions/bia/process-actions";
import { toast } from "sonner";

type Props = {
  factories?: Array<{ id: string; name: string; code: string }>;
};

export function ProcessFormSpreadsheetSimple({ }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProcessFormValues>({
    resolver: zodResolver(processFormSchemaEnhanced),
    defaultValues: {
      name: "",
      department: "",
      location: "",
      impact: "",
      criticality: "MEDIUM",
      rto: 0,
      mtpd: 0,
      rpo: 0,
      mbco: "",
    },
  });

  const onSubmit = async (data: ProcessFormValues) => {
    setIsLoading(true);
    try {
      const result = await createProcess(data);
      if (result.success) {
        toast.success("Processus créé avec succès");
        router.push("/bia");
        router.refresh();
      } else {
        toast.error(result.error || "Erreur lors de la création");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Formulaire Simple</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom *</label>
              <input
                {...form.register("name")}
                className="w-full border rounded px-3 py-2"
                placeholder="Nom du processus"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Département *
              </label>
              <input
                {...form.register("department")}
                className="w-full border rounded px-3 py-2"
                placeholder="Département"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Localisation *
              </label>
              <input
                {...form.register("location")}
                className="w-full border rounded px-3 py-2"
                placeholder="Localisation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Impact *</label>
              <textarea
                {...form.register("impact")}
                className="w-full border rounded px-3 py-2"
                placeholder="Impact..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  RTO (heures) *
                </label>
                <input
                  type="number"
                  {...form.register("rto", { valueAsNumber: true })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  MTPD (heures) *
                </label>
                <input
                  type="number"
                  {...form.register("mtpd", { valueAsNumber: true })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  RPO (heures) *
                </label>
                <input
                  type="number"
                  {...form.register("rpo", { valueAsNumber: true })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">MBCO *</label>
                <input
                  {...form.register("mbco")}
                  className="w-full border rounded px-3 py-2"
                  placeholder="MBCO"
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Création..." : "Créer le processus"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {Object.keys(form.formState.errors).length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">
              Erreurs de validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm">
              {JSON.stringify(form.formState.errors, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
