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
import { Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

interface FactoryAddReportDialogProps {
  factoryId: string;
  factoryName: string;
  factoryProcesses: Array<{
    id: string;
    name: string;
    criticality: string;
  }>;
}

export function FactoryAddReportDialog({
  factoryId,
  factoryName,
  factoryProcesses,
}: FactoryAddReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const router = useRouter();

  const toggleProcess = (processId: string) => {
    setSelectedProcesses((prev) =>
      prev.includes(processId)
        ? prev.filter((id) => id !== processId)
        : [...prev, processId]
    );
  };

  const selectAll = () => {
    setSelectedProcesses(factoryProcesses.map((p) => p.id));
  };

  const deselectAll = () => {
    setSelectedProcesses([]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation : au moins un processus doit être sélectionné
    if (selectedProcesses.length === 0) {
      toast.error("Erreur de validation", {
        description:
          "Veuillez sélectionner au moins un processus pour le rapport",
      });
      return;
    }

    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      format: formData.get("format") as string,
      factoryId: factoryId, // Association automatique avec l'usine
      includedProcessIds: selectedProcesses,
      category: factoryName, // Utiliser le nom de l'usine comme catégorie
    };

    try {
      const response = await fetch("/api/bia/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la création");
      }

      const processNames = factoryProcesses
        .filter((p) => selectedProcesses.includes(p.id))
        .map((p) => p.name)
        .join(", ");

      toast.success("Rapport BIA créé avec succès", {
        description: `${
          selectedProcesses.length
        } processus inclus : ${processNames.substring(0, 100)}${
          processNames.length > 100 ? "..." : ""
        }`,
      });
      setIsOpen(false);
      setSelectedProcesses([]);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Erreur", {
        description:
          error instanceof Error
            ? error.message
            : "Erreur lors de la création du rapport",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Générer un Rapport
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nouveau Rapport BIA pour {factoryName}</DialogTitle>
            <DialogDescription>
              Générer un rapport d&apos;analyse d&apos;impact métier pour cette
              usine
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du Rapport *</Label>
              <Input
                id="name"
                name="name"
                placeholder={`Rapport BIA - ${factoryName} - ${new Date().toLocaleDateString(
                  "fr-FR"
                )}`}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Description du rapport..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Format du Rapport *</Label>
              <Select name="format" defaultValue="PDF" required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">📄 PDF</SelectItem>
                  <SelectItem value="DOCX">📝 Word (DOCX)</SelectItem>
                  <SelectItem value="HTML">🌐 HTML</SelectItem>
                  <SelectItem value="JSON">📊 JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>
                  Processus à inclure ({selectedProcesses.length}/
                  {factoryProcesses.length})
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={selectAll}
                  >
                    Tout sélectionner
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={deselectAll}
                  >
                    Tout désélectionner
                  </Button>
                </div>
              </div>

              {selectedProcesses.length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm font-medium text-blue-900 mb-1">
                    ✓ {selectedProcesses.length} processus sélectionné
                    {selectedProcesses.length > 1 ? "s" : ""} :
                  </div>
                  <div className="text-sm text-blue-700">
                    {factoryProcesses
                      .filter((p) => selectedProcesses.includes(p.id))
                      .map((p) => p.name)
                      .join(", ")}
                  </div>
                </div>
              )}

              {factoryProcesses.length === 0 ? (
                <div className="p-4 border rounded-lg text-center text-muted-foreground">
                  Aucun processus disponible pour cette usine.
                  <br />
                  Ajoutez d&apos;abord des processus avant de générer un
                  rapport.
                </div>
              ) : (
                <div className="border rounded-lg max-h-60 overflow-y-auto">
                  {factoryProcesses.map((process) => (
                    <label
                      key={process.id}
                      className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProcesses.includes(process.id)}
                        onChange={() => toggleProcess(process.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{process.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Criticité: {process.criticality}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
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
            <Button
              type="submit"
              disabled={isLoading || selectedProcesses.length === 0}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Générer le Rapport
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
