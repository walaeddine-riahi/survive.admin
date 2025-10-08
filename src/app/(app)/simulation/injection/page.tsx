"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Définition locale de InjectionType si le module n'existe pas
export enum InjectionType {
  EMAIL = "EMAIL",
  SMS = "SMS",
  MEMO = "MEMO",
  ALERT = "ALERT",
  SOCIAL = "SOCIAL",
  CALL = "CALL",
  NEWSBROADCAST = "NEWSBROADCAST",
  NEWSPAPER = "NEWSPAPER",
  OTHER = "OTHER",
}

type InjectionFormValues = {
  title: string;
  content: string;
  scenarioName: string;
  type: InjectionType;
  imageUrl: string | null;
  videoUrl: string | null;
  attachments: { type: string; url: string; name: string }[];
  triggerType: 'MANUAL' | 'TIMED';
  timeOffset: number | null;
  isRepeating: boolean;
  repeatInterval: number | null;
  payload: Record<string, unknown>;
};

// Définition des types pour le formulaire
type FormValues = {
  title: string;
  content: string;
  scenarioName: string;
  type: InjectionType;
  imageUrl: string | null;
  videoUrl: string | null;
  attachments: { type: string; url: string; name: string }[];
  triggerType: 'MANUAL' | 'TIMED';
  timeOffset: number | null;
  isRepeating: boolean;
  repeatInterval: number | null;
  payload: Record<string, unknown>;
};

// Valeurs par défaut pour le formulaire
const defaultValues: FormValues = {
  title: "",
  content: "",
  scenarioName: "workshop",
  type: InjectionType.OTHER,
  imageUrl: null,
  videoUrl: null,
  attachments: [],
  triggerType: 'MANUAL',
  timeOffset: null,
  isRepeating: false,
  repeatInterval: null,
  payload: {},
};

interface Scenario {
  id: string;
  name: string;
}

export default function InjectionPage() {
  const { toast } = useToast();
  const params = useParams();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const simulationId = Array.isArray(params.simulationId) ? params.simulationId[0] : params.simulationId;

  const form = useForm<FormValues>({
    defaultValues,
    mode: 'onChange',
    resolver: undefined, // Désactiver le résolveur pour éviter les conflits
  });

  // Fonction de validation personnalisée
  const validateField = (value: string, fieldName: string) => {
    if (!value || value.trim() === '') {
      return `Le champ ${fieldName} est requis`;
    }
    return true;
  };

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const response = await fetch(`/api/simulations/${simulationId}/scenarios`);
        if (!response.ok) throw new Error("Échec du chargement des scénarios");
        const data = await response.json();
        setScenarios(data);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les scénarios.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (simulationId) {
      fetchScenarios();
    }
  }, [simulationId, toast]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/simulations/${simulationId}/injections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Échec de la création de l'injection");
      
      toast({
        title: "Succès",
        description: "L'injection a été créée avec succès.",
      });
      
      // Réinitialiser le formulaire
      form.reset();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'injection.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestion des Injections</h1>
      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                rules={{
                  required: 'Le titre est requis',
                  minLength: {
                    value: 2,
                    message: 'Le titre doit contenir au moins 2 caractères',
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <FormItem>
                    <FormLabel>Titre *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Titre de l'injection"
                        className={cn(
                          error && "border-red-500 focus-visible:ring-red-500"
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage>{error?.message}</FormMessage>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="scenarioName"
                rules={{
                  required: 'Veuillez sélectionner un scénario',
                }}
                render={({ field, fieldState: { error } }) => (
                  <FormItem>
                    <FormLabel>Scénario *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      isInvalid={!!error}
                    >
                      <FormControl>
                        <SelectTrigger className={error ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Sélectionner un scénario" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {scenarios.map((scenario) => (
                          <SelectItem key={scenario.id} value={scenario.name}>
                            {scenario.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage>{error?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                rules={{
                  required: 'Veuillez sélectionner un type',
                }}
                render={({ field, fieldState: { error } }) => (
                  <FormItem>
                    <FormLabel>Type d'injection *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      isInvalid={!!error}
                    >
                      <FormControl>
                        <SelectTrigger className={error ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(InjectionType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage>{error?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de l'image (optionnel)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/image.jpg" 
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de la vidéo (optionnel)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/video.mp4" 
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="content"
                rules={{
                  required: 'Le contenu est requis',
                  validate: (value) => validateField(value, 'contenu'),
                }}
                render={({ field, fieldState: { error } }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Contenu *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Contenu de l'injection..."
                        className={cn(
                          "min-h-[200px]",
                          error && "border-red-500 focus-visible:ring-red-500"
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage>{error?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="triggerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de déclenchement</FormLabel>
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
                        <SelectItem value="MANUAL">Manuel</SelectItem>
                        <SelectItem value="TIMED">Programmé</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('triggerType') === 'TIMED' && (
                <>
                  <FormField
                    control={form.control}
                    name="timeOffset"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Délai (secondes)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isRepeating"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Répéter l'injection</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  {form.watch('isRepeating') && (
                    <FormField
                      control={form.control}
                      name="repeatInterval"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Intervalle (secondes)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1"
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </>
              )}
            </div>
            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => form.reset()}
              >
                Réinitialiser
              </Button>
              <Button 
                type="submit" 
                disabled={!form.formState.isDirty || isSubmitting}
              >
                {isSubmitting ? 'Création...' : 'Créer l\'injection'}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
