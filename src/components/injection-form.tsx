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
  documentUrl?: string | null;
  targetUserId: string | null;
  targetUserIds: string[];
  attachments: string;
  payload: string;
};
import { Loader2, Sparkles, Search, Check, ChevronsUpDown, X, FileUp } from "lucide-react";
import { useState, useEffect } from "react";
import { toast as sonnerToast } from "sonner";

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

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
  imageUrl: z.union([z.string().url().nullable(), z.literal("")]).optional(),
  videoUrl: z.union([z.string().url().nullable(), z.literal("")]).optional(),
  documentUrl: z.union([z.string().url().nullable(), z.literal("")]).optional(),
  targetUserId: z.union([z.string().nullable(), z.undefined()]).optional(),
  targetUserIds: z.array(z.string()).default([]),
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
  targetUserIds?: string[];
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
  simulationId?: string;
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
  simulationId,
  scenarioId,
  scenarios = [],
}: InjectionFormProps) {
  const getInitialTargetUserIds = (data: any) => {
    if (Array.isArray(data?.targetUserIds)) {
      return data.targetUserIds;
    }
    if (data?.targetUserId) {
      return [data.targetUserId];
    }
    return [];
  };

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
      scenarioId: initialData?.scenarioId || scenarioId || "",
      simulationId: initialData?.simulationId || simulationId || "",
      isActive: initialData?.isActive ?? true,
      type: initialData?.type || InjectionTypeEnum.EMAIL,
      imageUrl: initialData?.imageUrl || "",
      videoUrl: initialData?.videoUrl || "",
      documentUrl: "",
      targetUserId: initialData?.targetUserId || "",
      targetUserIds: getInitialTargetUserIds(initialData),
      attachments: initialData?.attachments || "",
      payload: initialData?.payload || "",
    },
  });

  // Réinitialiser le formulaire lorsque les données initiales ou l'état d'ouverture changent
  useEffect(() => {
    if (open) {
      methods.reset({
        title: initialData?.title || "",
        content: initialData?.content || "",
        triggerType: initialData?.triggerType || InjectionTriggerTypeEnum.MANUAL,
        timeOffset: initialData?.timeOffset || null,
        isRepeating: initialData?.isRepeating || false,
        repeatInterval: initialData?.repeatInterval || null,
        scenarioId: initialData?.scenarioId || scenarioId || "",
        simulationId: initialData?.simulationId || simulationId || "",
        isActive: initialData?.isActive ?? true,
        type: initialData?.type || InjectionTypeEnum.EMAIL,
        imageUrl: initialData?.imageUrl || "",
        videoUrl: initialData?.videoUrl || "",
        documentUrl: "",
        targetUserId: initialData?.targetUserId || "",
        targetUserIds: getInitialTargetUserIds(initialData),
        attachments: initialData?.attachments || "",
        payload: initialData?.payload || "",
      });
    }
  }, [open, initialData, simulationId, scenarioId, methods]);

  const [generatingAI, setGeneratingAI] = useState(false);

  const { control, watch } = methods;
  const triggerType = watch("triggerType");
  const isRepeating = watch("isRepeating");
  const selectedSimulationId = watch("simulationId");
  const watchedTargetUserIds = watch("targetUserIds") || [];

  // Filtrer les scénarios en fonction de la simulation sélectionnée
  const filteredScenarios: ScenarioOption[] = selectedSimulationId
    ? (scenarios || []).filter(
        (scenario) => scenario.simulationId === selectedSimulationId
      )
    : [];

  const handleFormSubmit = (data: FormData) => {
    // Si un document URL est présent, on l'ajoute aux attachments
    if (data.documentUrl) {
      try {
        let attachments = [];
        if (data.attachments) {
          attachments = JSON.parse(data.attachments);
        }
        
        // Vérifier si le document n'est pas déjà présent
        const exists = attachments.some((a: any) => a.url === data.documentUrl);
        if (!exists) {
          attachments.push({
            name: "Document joint",
            url: data.documentUrl,
            type: "pdf"
          });
          data.attachments = JSON.stringify(attachments);
        }
      } catch (e) {
        console.error("Erreur lors du parsing des attachments:", e);
        // En cas d'erreur, on crée un nouveau tableau
        data.attachments = JSON.stringify([{
          name: "Document joint",
          url: data.documentUrl,
          type: "pdf"
        }]);
      }
    }
    
    onSubmit(data as InjectionFormData);
  };

  const handleAIGenerate = async () => {
    const type = methods.getValues("type");
    const title = methods.getValues("title");
    const simulationId = methods.getValues("simulationId");
    
    const sim = simulations.find(s => s.id === simulationId);

    try {
      setGeneratingAI(true);
      const response = await fetch("/api/ai/generate-injection", {
        body: JSON.stringify({
          type,
          context: title || "Générer une injection réaliste",
          simulationInfo: sim ? { title: sim.name } : undefined
        }),
        method: "POST",
      });

      if (!response.ok) throw new Error("Erreur IA");
      const data = await response.json();

      methods.setValue("content", data.content, { shouldDirty: true });
      if (data.title && !title) {
        methods.setValue("title", data.title, { shouldDirty: true });
      }
      
      sonnerToast.success("Contenu généré par l'IA");
    } catch (error) {
      console.error(error);
      sonnerToast.error("Échec de la génération IA");
    } finally {
      setGeneratingAI(false);
    }
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
                  name="targetUserIds"
                  render={({ field }) => {
                    const [localSelected, setLocalSelected] = useState<string[]>(field.value || []);
                    const [search, setSearch] = useState("");
                    const [isOpen, setIsOpen] = useState(false);

                    useEffect(() => {
                      if (field.value && JSON.stringify(localSelected) !== JSON.stringify(field.value)) {
                        setLocalSelected(field.value || []);
                      }
                    }, [field.value]);

                    const selectedIds = localSelected;

                    const filteredUsers = users.filter(user =>
                      user.name.toLowerCase().includes(search.toLowerCase()) ||
                      user.email.toLowerCase().includes(search.toLowerCase())
                    );

                    const toggleUser = (userId: string) => {
                      const newSelected = selectedIds.includes(userId)
                        ? selectedIds.filter((id) => id !== userId)
                        : [...selectedIds, userId];
                      setLocalSelected(newSelected);
                      field.onChange(newSelected);
                    };

                    const selectAll = () => {
                      const allIds = users.map(u => u.id);
                      setLocalSelected(allIds);
                      field.onChange(allIds);
                    };

                    const clearAll = () => {
                      setLocalSelected([]);
                      field.onChange([]);
                    };

                    return (
                      <FormItem className="flex flex-col relative">
                        <FormLabel>Destinataire(s) (optionnel)</FormLabel>
                        <div className="relative">
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={isOpen}
                            onClick={(e) => {
                              e.preventDefault();
                              setIsOpen(!isOpen);
                            }}
                            className="w-full justify-between h-auto min-h-10 py-2 px-3 text-left font-normal border-[var(--border)] bg-background hover:bg-white/5"
                          >
                            <div className="flex flex-wrap gap-1.5 max-w-[90%]">
                              {selectedIds.length === 0 ? (
                                <span className="text-muted-foreground text-sm">
                                  Tous les participants (public)
                                </span>
                              ) : (
                                selectedIds.map((id) => {
                                  const user = users.find((u) => u.id === id);
                                  if (!user) return null;
                                  return (
                                    <Badge
                                      key={id}
                                      variant="secondary"
                                      className="bg-primary/20 text-primary border-primary/20 hover:bg-primary/30 flex items-center gap-1 py-0.5 px-2 text-xs"
                                    >
                                      {user.name}
                                      <X
                                        className="h-3 w-3 cursor-pointer hover:text-red-400"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          toggleUser(id);
                                        }}
                                      />
                                    </Badge>
                                  );
                                })
                              )}
                            </div>
                            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                          </Button>

                          {isOpen && (
                            <>
                              {/* Background overlay inside Dialog subtree to safely handle outside clicks */}
                              <div
                                className="fixed inset-0 z-40"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setIsOpen(false);
                                }}
                              />

                              {/* Premium styled Dropdown panel rendered inline */}
                              <div className="absolute top-[calc(100%+4px)] left-0 w-full p-0 bg-stone-900 border border-stone-800 shadow-2xl rounded-2xl overflow-hidden z-50">
                                <div className="p-3 border-b border-white/5 flex items-center gap-2 bg-white/5">
                                  <Search className="h-4 w-4 text-primary shrink-0" />
                                  <input
                                    type="text"
                                    placeholder="Rechercher un participant..."
                                    className="flex h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                  />
                                  {search && (
                                    <X
                                      className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-white"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSearch("");
                                      }}
                                    />
                                  )}
                                </div>
                                
                                <div 
                                  className="flex justify-between px-3 py-2 border-b border-white/5 bg-white/[0.02] text-xs font-bold uppercase tracking-widest text-muted-foreground"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span>Participants ({filteredUsers.length})</span>
                                  <div className="flex gap-3">
                                    <button
                                      type="button"
                                      className="text-primary hover:underline font-bold text-xs"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        selectAll();
                                      }}
                                    >
                                      Tous
                                    </button>
                                    <button
                                      type="button"
                                      className="text-red-400 hover:underline font-bold text-xs"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        clearAll();
                                      }}
                                    >
                                      Aucun
                                    </button>
                                  </div>
                                </div>

                                <div 
                                  className="max-h-[220px] overflow-y-auto p-1.5 space-y-0.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => {
                                      const isSelected = selectedIds.includes(user.id);
                                      return (
                                        <button
                                          key={user.id}
                                          type="button"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleUser(user.id);
                                          }}
                                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl cursor-pointer hover:bg-white/5 transition-colors group text-left"
                                        >
                                          <div className="flex flex-col text-sm">
                                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                              {user.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                              {user.email}
                                            </span>
                                          </div>
                                          <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                                            isSelected 
                                              ? "bg-primary border-primary text-white shadow-[0_0_10px_rgba(124,58,237,0.3)]" 
                                              : "border-white/10"
                                          }`}>
                                            {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                                          </div>
                                        </button>
                                      );
                                    })
                                  ) : (
                                    <div className="p-4 text-center text-xs text-muted-foreground">
                                      Aucun participant trouvé
                                    </div>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
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
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={InjectionTypeEnum.EMAIL}>
                            📧 Email
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
                            📝 WhatsApp
                          </SelectItem>
                          <SelectItem value={InjectionTypeEnum.NEWS_BROADCAST}>
                            � SITREP
                          </SelectItem>
                          <SelectItem value={InjectionTypeEnum.NEWSPAPER}>
                            📰 Journal
                          </SelectItem>
                          <SelectItem value={InjectionTypeEnum.SOCIAL}>
                            📱 Réseau Social
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
                    <div className="flex items-center justify-between">
                      <FormLabel>Contenu *</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50 gap-1"
                        onClick={handleAIGenerate}
                        disabled={generatingAI}
                      >
                        {generatingAI ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        Générer avec l&apos;IA
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Contenu de l'injection (ou utilisez l'IA pour générer un brouillon basé sur le titre)"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Section Médias et Documents joints (Style Instructeur) */}
              <div className="border border-stone-800 rounded-xl p-4 bg-stone-900/50 space-y-3">
                <div className="flex items-center gap-1.5">
                  <FileUp className="h-4 w-4 text-primary" />
                  <p className="text-xs font-bold text-primary uppercase tracking-wider">Médias et Documents joints</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground uppercase">Image URL</FormLabel>
                        <FormControl>
                          <Input
                            className="h-9 text-sm bg-stone-900 border-stone-800 text-white rounded-lg focus-visible:ring-primary"
                            placeholder="https://images.unsplash.com/..."
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground uppercase">Vidéo URL</FormLabel>
                        <FormControl>
                          <Input
                            className="h-9 text-sm bg-stone-900 border-stone-800 text-white rounded-lg focus-visible:ring-primary"
                            placeholder="https://youtube.com/watch?v=..."
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="documentUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground uppercase">Document PDF URL</FormLabel>
                        <FormControl>
                          <Input
                            className="h-9 text-sm bg-stone-900 border-stone-800 text-white rounded-lg focus-visible:ring-primary"
                            placeholder="https://example.com/document.pdf"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  control={control as any}
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
