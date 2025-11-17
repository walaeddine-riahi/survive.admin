"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FactoryAddProcessDialogProps {
  factoryId: string;
  factoryName: string;
}

export function FactoryAddProcessDialog({
  factoryId,
  factoryName,
}: FactoryAddProcessDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      department: formData.get("department") as string,
      location: formData.get("location") as string,
      impact: formData.get("impact") as string,
      criticality: formData.get("criticality") as string,
      rto: parseInt(formData.get("rto") as string) || 0,
      mtpd: parseInt(formData.get("mtpd") as string) || 0,
      rpo: parseInt(formData.get("rpo") as string) || 0,
      mbco: formData.get("mbco") as string,
      factoryId: factoryId, // Association automatique avec l'usine
    };

    try {
      const response = await fetch("/api/bia/processes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la création");
      }

      toast.success("Processus créé avec succès", {
        description: `Le processus a été associé à l'usine ${factoryName}`,
      });
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Erreur", {
        description:
          error instanceof Error
            ? error.message
            : "Erreur lors de la création du processus",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un Processus
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nouveau Processus pour {factoryName}</DialogTitle>
            <DialogDescription>
              Créer un nouveau processus BIA associé à cette usine
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du Processus *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ex: Production principale"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Département *</Label>
                <Input
                  id="department"
                  name="department"
                  placeholder="Ex: Production"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Description du processus..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Localisation</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Ex: Bâtiment A"
                  defaultValue={factoryName}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="criticality">Criticité *</Label>
                <Select name="criticality" defaultValue="medium" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">🔴 Critique</SelectItem>
                    <SelectItem value="high">🟠 Élevé</SelectItem>
                    <SelectItem value="medium">🟡 Moyen</SelectItem>
                    <SelectItem value="low">🟢 Faible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rto">RTO (heures) *</Label>
                <Input
                  id="rto"
                  name="rto"
                  type="number"
                  min="0"
                  placeholder="24"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mtpd">MTPD (heures) *</Label>
                <Input
                  id="mtpd"
                  name="mtpd"
                  type="number"
                  min="0"
                  placeholder="48"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rpo">RPO (heures) *</Label>
                <Input
                  id="rpo"
                  name="rpo"
                  type="number"
                  min="0"
                  placeholder="4"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="impact">Impact</Label>
                <Input
                  id="impact"
                  name="impact"
                  placeholder="Impact sur l'activité"
                  defaultValue="Moyen"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mbco">MBCO</Label>
                <Input
                  id="mbco"
                  name="mbco"
                  placeholder="Objectif de continuité"
                  defaultValue="Maintien partiel"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer le Processus
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
