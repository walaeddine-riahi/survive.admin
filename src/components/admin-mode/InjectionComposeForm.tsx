"use client";

import { Button } from "@/components/ui/button";
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
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";

export type InjectionFormData = {
  title: string;
  content: string;
  scenarioName: string;
  type: InjectionType;
  imageUrl?: string;
  videoUrl?: string;
  isActive?: boolean;
  attachments?: { type: string; url: string; name: string }[];
};

export enum InjectionType {
  EMAIL = "EMAIL",
  SMS = "SMS",
  MEMO = "MEMO",
  ALERT = "ALERT",
  SOCIAL_MEDIA = "SOCIAL_MEDIA",
  CALL = "CALL",
  NEWSBROADCAST = "NEWSBROADCAST",
  NEWSPAPER = "NEWSPAPER",
  OTHER = "OTHER",
}

interface Scenario {
  id: string;
  name: string;
}

interface InjectionComposeFormProps {
  onSubmit: (data: InjectionFormData) => void;
  onCancel: () => void;
  simulationId: string;
  initialData?: InjectionFormData | null;
}

export default function InjectionComposeForm({
  onSubmit,
  onCancel,
  simulationId,
  initialData,
}: InjectionComposeFormProps) {
  const [formData, setFormData] = useState<InjectionFormData>({
    title: initialData?.title || "",
    content: initialData?.content || "",
    scenarioName: initialData?.scenarioName || "workshop",
    type: initialData?.type || InjectionType.OTHER,
    imageUrl: initialData?.imageUrl || "",
    videoUrl: initialData?.videoUrl || "",
    isActive:
      initialData?.isActive !== undefined ? initialData.isActive : false,
    attachments: initialData?.attachments || [],
  });
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loadingScenarios, setLoadingScenarios] = useState(true);
  const [errorScenarios, setErrorScenarios] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setLoadingScenarios(true);
        const response = await fetch(
          `/api/simulations/${simulationId}/scenarios`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch scenarios");
        }
        const data = await response.json();

        // Vérifier si le scénario 'workshop' existe, sinon le créer
        const workshopExists = data.some(
          (s: Scenario) => s.name === "workshop"
        );
        if (!workshopExists) {
          try {
            const createResponse = await fetch(
              `/api/simulations/${simulationId}/scenarios`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: "workshop",
                  description: "Scénario par défaut pour les ateliers",
                }),
              }
            );

            if (createResponse.ok) {
              const newScenario = await createResponse.json();
              setScenarios([...data, newScenario]);
              // Mettre à jour le formulaire avec le scénario 'workshop' par défaut
              setFormData((prev) => ({
                ...prev,
                scenarioName: "workshop",
              }));
              return;
            }
          } catch (error) {
            console.error("Error creating default workshop scenario:", error);
            toast({
              title: "Erreur",
              description:
                "Impossible de créer le scénario workshop par défaut.",
              variant: "destructive",
            });
          }
        }

        setScenarios(data);
      } catch (err) {
        console.error("Error fetching scenarios:", err);
        setErrorScenarios(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        toast({
          title: "Erreur",
          description: "Impossible de charger les scénarios de la simulation.",
          variant: "destructive",
        });
      } finally {
        setLoadingScenarios(false);
      }
    };

    if (simulationId) {
      fetchScenarios();
    }
  }, [simulationId, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Si aucun scénario n'est sélectionné, on utilise 'workshop' par défaut
    const submissionData = {
      ...formData,
      scenarioName: formData.scenarioName || "workshop",
    };
    onSubmit(submissionData);
  };

  const handleScenarioChange = (value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      scenarioName: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scenarioName">Nom du scénario</Label>
        {loadingScenarios ? (
          <div>Chargement des scénarios...</div>
        ) : errorScenarios ? (
          <div className="text-red-500">Erreur: {errorScenarios}</div>
        ) : scenarios.length === 0 ? (
          <p className="text-muted-foreground">
            Aucun scénario disponible pour cette simulation.
          </p>
        ) : (
          <Select
            onValueChange={handleScenarioChange}
            value={formData.scenarioName}
            required
          >
            <SelectTrigger id="scenarioName">
              <SelectValue placeholder="Sélectionnez un scénario" />
            </SelectTrigger>
            <SelectContent>
              {scenarios.map((scenario) => (
                <SelectItem key={scenario.id} value={scenario.name}>
                  {scenario.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            aria-label="Injection active"
            title="Injection active"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <Label htmlFor="isActive">Injection active</Label>
        </div>
        <p className="text-xs text-gray-500">
          Les injections inactives ne seront pas visibles dans la vue
          participant.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type d injection</Label>
        <Select
          value={formData.type}
          onValueChange={(value: InjectionType) =>
            setFormData({ ...formData, type: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez un type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={InjectionType.EMAIL}>Email</SelectItem>
            <SelectItem value={InjectionType.SMS}>SMS</SelectItem>
            <SelectItem value={InjectionType.MEMO}>WhatsApp</SelectItem>
            <SelectItem value={InjectionType.ALERT}>Alerte</SelectItem>
            <SelectItem value={InjectionType.SOCIAL_MEDIA}>
              Réseau social
            </SelectItem>
            <SelectItem value={InjectionType.CALL}>Appel</SelectItem>
            <SelectItem value={InjectionType.NEWSBROADCAST}>
              Diffusion de Nouvelles
            </SelectItem>
            <SelectItem value={InjectionType.NEWSPAPER}>Journal</SelectItem>
            <SelectItem value={InjectionType.OTHER}>Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Contenu</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          required
          className="min-h-[200px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">URL de l image (optionnel)</Label>
        <Input
          id="imageUrl"
          type="url"
          value={formData.imageUrl || ""}
          onChange={(e) => {
            const rawUrl = e.target.value;
            const transformedUrl = transformGoogleDriveUrl(rawUrl);
            setFormData({ ...formData, imageUrl: transformedUrl });
          }}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="videoUrl">URL de la vidéo (optionnel)</Label>
        <Input
          id="videoUrl"
          type="url"
          value={formData.videoUrl || ""}
          onChange={(e) =>
            setFormData({ ...formData, videoUrl: e.target.value })
          }
          placeholder="https://youtube.com/watch?v=..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={loadingScenarios || scenarios.length === 0}
        >
          Créer Injection
        </Button>
      </div>
    </form>
  );
}

// Helper function to transform Google Drive URLs
const transformGoogleDriveUrl = (url: string): string => {
  const driveFileRegex =
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)(?:\/view)?/;
  const match = url.match(driveFileRegex);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  return url;
};
