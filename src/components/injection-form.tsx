"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, FormProvider } from "react-hook-form";
import * as z from "zod";

type FormData = {
  id?: string;
  title: string;
  content: string;
  triggerType: InjectionTriggerTypeEnum;
  timeOffset: number | null;
  isRepeating: boolean;
  repeatInterval: number | null;
  scenarioId: string;
  simulationId: string;
  isActive: boolean;
  type: InjectionTypeEnum;
  imageUrl: string | null;
  videoUrl: string | null;
  targetUserId: string | null;
  attachments: string;
  payload: string;
};
import { Loader2 } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { MediaSelector } from "@/components/MediaSelector";

// Correspond aux enums de Prisma
export enum InjectionTriggerTypeEnum {
  MANUAL = "MANUAL",
  TIMED = "TIMED",
}

export enum InjectionTypeEnum {
  EMAIL = "EMAIL",
  SMS = "SMS",
  MEMO = "MEMO",
  ALERT = "ALERT",
  SOCIAL = "SOCIAL",
  NEWS_BROADCAST = "NEWS_BROADCAST",
  CALL = "CALL",
  NEWSPAPER = "NEWSPAPER",
  OTHER = "OTHER",
}

// Schéma de validation avec Zod
const injectionFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Le titre est requis"),
  content: z.string().min(1, "Le contenu est requis"),
  triggerType: z.nativeEnum(InjectionTriggerTypeEnum, {
    required_error: "Le type de déclenchement est requis",
  }),
  timeOffset: z.union([z.number().int().nonnegative(), z.null()]).optional(),
  isRepeating: z.boolean().default(false),
  repeatInterval: z.union([z.number().int().positive(), z.null()]).optional(),
  scenarioId: z.string().min(1, "Le scénario est requis"),
  simulationId: z.string().min(1, "La simulation est requise"),
  isActive: z.boolean().default(true),
  type: z.nativeEnum(InjectionTypeEnum, {
    required_error: "Le type d'injection est requis",
  }),
  // Accepter les URLs complètes (http/https) OU les chemins locaux (/media/)
  imageUrl: z
    .union([
      z.string().url(), // URL complète
      z.string().startsWith("/"), // Chemin local
      z.literal(""),
      z.null(),
    ])
    .optional(),
  videoUrl: z
    .union([
      z.string().url(), // URL complète
      z.string().startsWith("/"), // Chemin local
      z.literal(""),
      z.null(),
    ])
    .optional(),
  targetUserId: z.union([z.string().nullable(), z.undefined()]).optional(),
  attachments: z.string().default("[]"),
  payload: z.string().default("{}"),
});

interface ScenarioOption {
  id: string;
  name: string;
  simulationId: string;
  simulation?: {
    id: string;
    name: string;
  };
}

export interface UserOption {
  id: string;
  name: string;
  email: string;
}

export interface SimulationOption {
  id: string;
  name: string;
}

interface InjectionFormData {
  id?: string;
  title: string;
  content: string;
  triggerType: InjectionTriggerTypeEnum;
  timeOffset?: number | null;
  isRepeating?: boolean;
  repeatInterval?: number | null;
  scenarioId: string;
  simulationId: string;
  isActive: boolean;
  type: InjectionTypeEnum;
  imageUrl?: string | null;
  videoUrl?: string | null;
  targetUserId?: string | null;
  attachments?: string;
  payload?: string;
}

// Type pour les props du composant
interface InjectionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InjectionFormData) => void;
  loading?: boolean;
  simulations: SimulationOption[];
  initialData?: Partial<InjectionFormData>;
  onSimulationChange?: (simulationId: string) => void;
  users?: UserOption[];
  scenarioId?: string;
  scenarios?: ScenarioOption[];
}

export function InjectionForm({
  open,
  onOpenChange,
  onSubmit,
  loading,
  simulations,
  initialData,
  onSimulationChange,
  users = [],
  scenarios = [],
}: InjectionFormProps) {
  const methods = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(injectionFormSchema) as any,
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      triggerType: initialData?.triggerType || InjectionTriggerTypeEnum.MANUAL,
      timeOffset: initialData?.timeOffset || null,
      isRepeating: initialData?.isRepeating || false,
      repeatInterval: initialData?.repeatInterval || null,
      scenarioId: initialData?.scenarioId || "",
      simulationId: initialData?.simulationId || "",
      isActive: initialData?.isActive ?? true,
      type: initialData?.type || InjectionTypeEnum.EMAIL,
      imageUrl: initialData?.imageUrl || "",
      videoUrl: initialData?.videoUrl || "",
      targetUserId: initialData?.targetUserId || "",
      attachments: initialData?.attachments || "",
      payload: initialData?.payload || "",
    },
  });

  const { control, watch, setValue } = methods;
  const triggerType = watch("triggerType");
  const isRepeating = watch("isRepeating");
  const selectedSimulationId = watch("simulationId");

  // État pour les sélecteurs de médias
  const [imageSelectOpen, setImageSelectOpen] = useState(false);
  const [videoSelectOpen, setVideoSelectOpen] = useState(false);

  // Filtrer les scénarios en fonction de la simulation sélectionnée
  const filteredScenarios: ScenarioOption[] = selectedSimulationId
    ? (scenarios || []).filter(
        (scenario) => scenario.simulationId === selectedSimulationId
      )
    : [];

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data as InjectionFormData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {initialData?.id ? "Modifier l'injection" : "Créer une injection"}
          </DialogTitle>
          <DialogDescription>
            {initialData?.id
              ? "Modifiez les détails de l'injection."
              : "Remplissez les champs pour créer une nouvelle injection."}
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 py-2 pr-2 -mr-2">
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(handleFormSubmit)}
              className="space-y-4"
            >
              <div className="grid gap-4 pb-4">
                <FormField
                  control={control}
                  name="targetUserId"
                  render={({ field }) => {
                    // Gérer la valeur actuelle (peut être null, undefined ou un ID utilisateur)
                    const currentValue = field.value || "all";

                    return (
                      <FormItem>
                        <FormLabel>Destinataire (optionnel)</FormLabel>
                        <Select
                          value={currentValue}
                          onValueChange={(value) => {
                            // Convertir 'all' en null pour la base de données
                            field.onChange(value === "all" ? null : value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un utilisateur (tous par défaut)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">
                              Tous les participants
                            </SelectItem>
                            {users?.length > 0 ? (
                              users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  <div className="flex flex-col">
                                    <span>{user.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {user.email}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-sm text-muted-foreground">
                                Aucun utilisateur disponible
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre *</FormLabel>
                      <FormControl>
                        <Input placeholder="Titre de l'injection" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type d&apos;injection *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={InjectionTypeEnum.EMAIL}>
                            📧 E-mail
                          </SelectItem>
                          <SelectItem value={InjectionTypeEnum.SMS}>
                            💬 SMS
                          </SelectItem>
                          <SelectItem value={InjectionTypeEnum.CALL}>
                            📞 Appel
                          </SelectItem>
                          <SelectItem value={InjectionTypeEnum.ALERT}>
                            🚨 Alerte
                          </SelectItem>
                          <SelectItem value={InjectionTypeEnum.MEMO}>
                            📝 Note
                          </SelectItem>
                          <SelectItem value={InjectionTypeEnum.NEWS_BROADCAST}>
                            📰 Diffusion de Nouvelles
                          </SelectItem>
                          <SelectItem value={InjectionTypeEnum.NEWSPAPER}>
                            📰 Journal
                          </SelectItem>
                          <SelectItem value={InjectionTypeEnum.SOCIAL}>
                            📱 Réseau social
                          </SelectItem>
                          <SelectItem value={InjectionTypeEnum.OTHER}>
                            🎭 Autre
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="simulationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Simulation *</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          if (onSimulationChange) {
                            onSimulationChange(value);
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une simulation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {simulations.map((simulation) => (
                            <SelectItem
                              key={simulation.id}
                              value={simulation.id}
                            >
                              {simulation.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="scenarioId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scénario *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedSimulationId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                selectedSimulationId
                                  ? "Sélectionner un scénario"
                                  : "Sélectionnez d'abord une simulation"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredScenarios.length > 0 ? (
                            filteredScenarios.map((scenario) => (
                              <SelectItem key={scenario.id} value={scenario.id}>
                                {scenario.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-muted-foreground">
                              {selectedSimulationId
                                ? "Aucun scénario disponible pour cette simulation"
                                : "Sélectionnez d'abord une simulation"}
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Injection active
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          L&apos;injection sera envoyée si activée
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenu *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Contenu de l'injection"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => setImageSelectOpen(true)}
                          >
                            {field.value
                              ? "Changer l&apos;image"
                              : "Sélectionner une image"}
                          </Button>
                          {field.value && (
                            <p className="text-xs text-muted-foreground truncate">
                              {field.value}
                            </p>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                      <MediaSelector
                        open={imageSelectOpen}
                        onOpenChange={setImageSelectOpen}
                        onSelect={(url) => {
                          setValue("imageUrl", url);
                          setImageSelectOpen(false);
                        }}
                        mediaType="image"
                        currentValue={field.value || ""}
                      />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vidéo</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => setVideoSelectOpen(true)}
                          >
                            {field.value
                              ? "Changer la vidéo"
                              : "Sélectionner une vidéo"}
                          </Button>
                          {field.value && (
                            <p className="text-xs text-muted-foreground truncate">
                              {field.value}
                            </p>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                      <MediaSelector
                        open={videoSelectOpen}
                        onOpenChange={setVideoSelectOpen}
                        onSelect={(url) => {
                          setValue("videoUrl", url);
                          setVideoSelectOpen(false);
                        }}
                        mediaType="video"
                        currentValue={field.value || ""}
                      />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="triggerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de déclenchement *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={InjectionTriggerTypeEnum.MANUAL}>
                            Manuel
                          </SelectItem>
                          <SelectItem value={InjectionTriggerTypeEnum.TIMED}>
                            Temporel
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {triggerType === InjectionTriggerTypeEnum.TIMED && (
                  <FormField
                    control={control}
                    name="timeOffset"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Décalage (secondes) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="e.g., 60"
                            {...field}
                            value={field.value === null ? "" : field.value}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={control}
                  name="isRepeating"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Répétition</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Répéter cette injection à intervalle régulier
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {isRepeating && (
                  <FormField
                    control={control}
                    name="repeatInterval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intervalle (secondes) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="e.g., 3600 (1h)"
                            {...field}
                            value={field.value === null ? "" : field.value}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              <div className="space-y-4">
                <Controller
                  name="payload"
                  control={control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payload (JSON)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={'{\n  "key": "value"\n}'}
                          className="font-mono text-sm min-h-[100px]"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Controller
                  name="attachments"
                  control={control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pièces jointes (JSON)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={
                            '[\n  {\n    "name": "fichier.pdf",\n    "url": "https://example.com/file.pdf"\n  }\n]'
                          }
                          className="font-mono text-sm min-h-[100px]"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-2 -mb-2 -mx-4 px-6 border-t">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : initialData?.id ? (
                    "Mettre à jour"
                  ) : (
                    "Créer"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
