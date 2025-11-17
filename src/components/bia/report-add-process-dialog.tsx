"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ReportAddProcessDialogProps {
  reportId: string;
  reportName: string;
  reportCategory?: string;
  currentProcessIds?: string[];
  onSuccess?: () => void;
}

export function ReportAddProcessDialog({
  reportId,
  reportName,
  reportCategory,
  currentProcessIds = [],
  onSuccess,
}: ReportAddProcessDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    department: "",
    criticality: "MEDIUM" as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
    rto: "",
    rpo: "",
    mtpd: "",
    mbco: "",
    processOwner: "",
    ownerRole: "",
    ownerEmail: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Créer le processus avec le reportCategory (catégorie de l'usine)
      console.log("📤 Envoi des données processus:", {
        ...formData,
        category: reportCategory || "Non définie",
        rto: parseInt(formData.rto) || 0,
        rpo: parseInt(formData.rpo) || 0,
        mtpd: parseInt(formData.mtpd) || 0,
        mbco: parseInt(formData.mbco) || 0,
      });

      const processResponse = await fetch("/api/bia/processes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          category: reportCategory || "Non définie",
          rto: parseInt(formData.rto) || 0,
          rpo: parseInt(formData.rpo) || 0,
          mtpd: parseInt(formData.mtpd) || 0,
          mbco: formData.mbco || "0",
        }),
      });

      const processResult = await processResponse.json();

      console.log("📥 Réponse création processus:", processResult);

      if (!processResult.success) {
        throw new Error(
          processResult.error || "Erreur lors de la création du processus"
        );
      }

      const newProcessId = processResult.data.id;

      // 2. Mettre à jour le rapport pour ajouter le processus à includedProcessIds
      const updatedProcessIds = [...currentProcessIds, newProcessId];

      const reportResponse = await fetch(`/api/bia/reports/${reportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          includedProcessIds: updatedProcessIds,
        }),
      });

      const reportResult = await reportResponse.json();

      if (!reportResult.success) {
        throw new Error(
          reportResult.error || "Erreur lors de la mise à jour du rapport"
        );
      }

      toast.success(
        `✅ Le processus "${formData.name}" a été créé et ajouté au rapport "${reportName}".`
      );

      // Reset form
      setFormData({
        name: "",
        description: "",
        department: "",
        criticality: "MEDIUM",
        rto: "",
        rpo: "",
        mtpd: "",
        mbco: "",
        processOwner: "",
        ownerRole: "",
        ownerEmail: "",
      });

      setOpen(false);

      // Call success callback to refresh the page
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("❌ Erreur:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'ajout du processus"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un Processus
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un Processus au Rapport</DialogTitle>
          <DialogDescription>
            Créer un nouveau processus BIA et l&apos;ajouter automatiquement au
            rapport &quot;{reportName}&quot;.
            {reportCategory && (
              <span className="block mt-1 text-blue-600 font-medium">
                Usine: {reportCategory}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Nom du processus */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nom du processus <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Gestion des commandes clients"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description détaillée du processus..."
                rows={3}
              />
            </div>

            {/* Département */}
            <div className="space-y-2">
              <Label htmlFor="department">Département</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                placeholder="Ex: Logistique, Finance, IT..."
              />
            </div>

            {/* Criticité */}
            <div className="space-y-2">
              <Label htmlFor="criticality">
                Criticité <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.criticality}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    criticality: value as
                      | "CRITICAL"
                      | "HIGH"
                      | "MEDIUM"
                      | "LOW",
                  })
                }
              >
                <SelectTrigger id="criticality">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CRITICAL">Critique</SelectItem>
                  <SelectItem value="HIGH">Élevée</SelectItem>
                  <SelectItem value="MEDIUM">Moyenne</SelectItem>
                  <SelectItem value="LOW">Faible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Métriques BIA */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rto">RTO (heures)</Label>
                <Input
                  id="rto"
                  type="number"
                  value={formData.rto}
                  onChange={(e) =>
                    setFormData({ ...formData, rto: e.target.value })
                  }
                  placeholder="24"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rpo">RPO (heures)</Label>
                <Input
                  id="rpo"
                  type="number"
                  value={formData.rpo}
                  onChange={(e) =>
                    setFormData({ ...formData, rpo: e.target.value })
                  }
                  placeholder="4"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mtpd">MTPD (heures)</Label>
                <Input
                  id="mtpd"
                  type="number"
                  value={formData.mtpd}
                  onChange={(e) =>
                    setFormData({ ...formData, mtpd: e.target.value })
                  }
                  placeholder="72"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mbco">MBCO (heures)</Label>
                <Input
                  id="mbco"
                  type="number"
                  value={formData.mbco}
                  onChange={(e) =>
                    setFormData({ ...formData, mbco: e.target.value })
                  }
                  placeholder="48"
                  min="0"
                />
              </div>
            </div>

            {/* Responsable du processus */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium text-sm">Responsable du Processus</h4>

              <div className="space-y-2">
                <Label htmlFor="processOwner">Nom complet</Label>
                <Input
                  id="processOwner"
                  value={formData.processOwner}
                  onChange={(e) =>
                    setFormData({ ...formData, processOwner: e.target.value })
                  }
                  placeholder="Jean Dupont"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerRole">Rôle/Fonction</Label>
                <Input
                  id="ownerRole"
                  value={formData.ownerRole}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerRole: e.target.value })
                  }
                  placeholder="Responsable Logistique"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerEmail">Email</Label>
                <Input
                  id="ownerEmail"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerEmail: e.target.value })
                  }
                  placeholder="jean.dupont@example.com"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ajout en cours...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter le Processus
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
