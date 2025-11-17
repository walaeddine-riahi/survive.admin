"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DynamicListField } from "@/components/bia/dynamic-list-field";
import {
  processFormSchemaEnhanced,
  type ProcessFormValues,
} from "@/lib/validations/process-schema";
import {
  activitesCritiquesFields,
  fournisseursFields,
  obligationsLegalesFields,
  systemesInformatiquesFields,
  infrastructuresFields,
  rolesPersonnelFields,
  equipementsIndustrielsFields,
  equipementsBureautiquesFields,
  documentationsFields,
} from "@/components/bia/process-form-fields";
import {
  Building2,
  FileText,
  TrendingUp,
  Users,
  Server,
  Zap,
  Briefcase,
  Monitor,
  FolderOpen,
  Gavel,
  Save,
  X,
} from "lucide-react";
import { createProcess, updateProcess } from "@/actions/bia/process-actions";
import { toast } from "sonner";

type ProcessFormEnhancedProps = {
  processId?: string;
  initialData?: Partial<ProcessFormValues>;
  factories?: Array<{ id: string; name: string; code: string }>;
};

export function ProcessFormEnhanced({
  processId,
  initialData,
  factories = [],
}: ProcessFormEnhancedProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const form = useForm<ProcessFormValues>({
    resolver: zodResolver(processFormSchemaEnhanced),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      department: initialData?.department || "",
      location: initialData?.location || "",
      factoryId: initialData?.factoryId || "",
      processOwner: initialData?.processOwner || "",
      ownerRole: initialData?.ownerRole || "",
      ownerEmail: initialData?.ownerEmail || "",
      ownerPhone: initialData?.ownerPhone || "",
      impact: initialData?.impact || "",
      criticality: initialData?.criticality || "MEDIUM",
      rto: initialData?.rto || 0,
      mtpd: initialData?.mtpd || 0,
      rpo: initialData?.rpo || 0,
      mbco: initialData?.mbco || "",
      criticalTimes: initialData?.criticalTimes || "",
      financialImpact: initialData?.financialImpact || "",
      operationalImpact: initialData?.operationalImpact || "",
      reputationImpact: initialData?.reputationImpact || "",
      operationalCapacityImpact: initialData?.operationalCapacityImpact || "",
      mainFunctionality: initialData?.mainFunctionality || "",
      productDependencies: initialData?.productDependencies || "",
      interServiceDependencies: initialData?.interServiceDependencies || "",
      // Champs booléens requis
      supplierHasContinuityPlan:
        initialData?.supplierHasContinuityPlan ?? false,
      hasSLAClause: initialData?.hasSLAClause ?? false,
      hasBackupSystems: initialData?.hasBackupSystems ?? false,
      dependsOnPhysicalInfra: initialData?.dependsOnPhysicalInfra ?? false,
      canWorkRemotely: initialData?.canWorkRemotely ?? false,
      canUseOtherInfra: initialData?.canUseOtherInfra ?? false,
      canBeReplaced: initialData?.canBeReplaced ?? false,
      canReassignEquipment: initialData?.canReassignEquipment ?? false,
      backupCompatible: initialData?.backupCompatible ?? false,
      canReassignOfficeEquipment:
        initialData?.canReassignOfficeEquipment ?? false,
      neededAfterDisruption: initialData?.neededAfterDisruption ?? false,
      hasAlternativeAccess: initialData?.hasAlternativeAccess ?? false,
      hasReplacement: initialData?.hasReplacement ?? false,
      hasAlternativeSupplier: initialData?.hasAlternativeSupplier ?? false,

      // Multi-éléments (nouveaux champs JSON)
      activitesCritiques: initialData?.activitesCritiques || [],
      fournisseursExternes: initialData?.fournisseursExternes || [],
      obligationsLegales: initialData?.obligationsLegales || [],
      systemesInformatiques: initialData?.systemesInformatiques || [],
      infrastructuresPhysiques: initialData?.infrastructuresPhysiques || [],
      rolesPersonnel: initialData?.rolesPersonnel || [],
      equipementsIndustriels: initialData?.equipementsIndustriels || [],
      equipementsBureautiques: initialData?.equipementsBureautiques || [],
      documentationsCritiques: initialData?.documentationsCritiques || [],
    },
  });

  const onSubmit = async (data: ProcessFormValues) => {
    setIsLoading(true);

    try {
      if (processId) {
        const result = await updateProcess(processId, data);
        if (result.success) {
          toast.success("Processus mis à jour avec succès");
          router.push("/bia");
          router.refresh();
        } else {
          toast.error(result.error || "Erreur lors de la mise à jour");
        }
      } else {
        const result = await createProcess(data);
        if (result.success) {
          toast.success("Processus créé avec succès");
          router.push("/bia");
          router.refresh();
        } else {
          toast.error(result.error || "Erreur lors de la création");
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-11">
            <TabsTrigger value="general">
              <Building2 className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Général</span>
            </TabsTrigger>
            <TabsTrigger value="activites">
              <FileText className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Activités</span>
            </TabsTrigger>
            <TabsTrigger value="fournisseurs">
              <Briefcase className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Fournisseurs</span>
            </TabsTrigger>
            <TabsTrigger value="legal">
              <Gavel className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Légal</span>
            </TabsTrigger>
            <TabsTrigger value="it">
              <Server className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">IT</span>
            </TabsTrigger>
            <TabsTrigger value="infrastructure">
              <Zap className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Infra</span>
            </TabsTrigger>
            <TabsTrigger value="personnel">
              <Users className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Personnel</span>
            </TabsTrigger>
            <TabsTrigger value="equipements-ind">
              <TrendingUp className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Équip. Ind.</span>
            </TabsTrigger>
            <TabsTrigger value="equipements-bureau">
              <Monitor className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Équip. Bureau</span>
            </TabsTrigger>
            <TabsTrigger value="documentation">
              <FolderOpen className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Docs</span>
            </TabsTrigger>
            <TabsTrigger value="synthese">
              <Save className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Synthèse</span>
            </TabsTrigger>
          </TabsList>

          {/* Onglet Général */}
          <TabsContent value="general" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations Générales</CardTitle>
                <CardDescription>
                  Renseignez les informations de base du processus
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du processus *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Gestion de la paie"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Département *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Ressources Humaines"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localisation *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Siège social" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {factories.length > 0 && (
                    <FormField
                      control={form.control}
                      name="factoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usine / Site</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une usine" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Aucune usine</SelectItem>
                              {factories.map((factory) => (
                                <SelectItem key={factory.id} value={factory.id}>
                                  {factory.name} ({factory.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Description détaillée du processus..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="processOwner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsable du processus</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom du responsable" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ownerRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fonction du responsable</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Directeur RH" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ownerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email du responsable</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ownerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone du responsable</FormLabel>
                        <FormControl>
                          <Input placeholder="+212 6XX XXX XXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Métriques de criticité */}
            <Card>
              <CardHeader>
                <CardTitle>Criticité et Métriques BIA</CardTitle>
                <CardDescription>
                  Définissez les objectifs de reprise et la criticité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="criticality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Niveau de criticité *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LOW">🟢 Faible</SelectItem>
                            <SelectItem value="MEDIUM">🟡 Moyen</SelectItem>
                            <SelectItem value="HIGH">🟠 Élevé</SelectItem>
                            <SelectItem value="CRITICAL">
                              🔴 Critique
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="impact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Impact global *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Description de l'impact"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RTO (heures) *</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormDescription>
                          Recovery Time Objective
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mtpd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MTPD (heures) *</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormDescription>
                          Maximum Tolerable Period of Disruption
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rpo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RPO (heures) *</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormDescription>
                          Recovery Point Objective
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mbco"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MBCO *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Objectif minimum de continuité"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum Business Continuity Objective
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contexte et Impacts */}
            <Card>
              <CardHeader>
                <CardTitle>Contexte et Impacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="criticalTimes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Périodes critiques</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Fin de mois pour la paie..."
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="financialImpact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Impact financier</FormLabel>
                        <FormControl>
                          <Textarea rows={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="operationalImpact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Impact opérationnel</FormLabel>
                        <FormControl>
                          <Textarea rows={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reputationImpact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Impact sur la réputation</FormLabel>
                        <FormControl>
                          <Textarea rows={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="operationalCapacityImpact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Impact sur la capacité</FormLabel>
                        <FormControl>
                          <Textarea rows={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="mainFunctionality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fonctionnalité principale</FormLabel>
                      <FormControl>
                        <Textarea rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="productDependencies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dépendances produits</FormLabel>
                        <FormControl>
                          <Textarea rows={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="interServiceDependencies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dépendances inter-services</FormLabel>
                        <FormControl>
                          <Textarea rows={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Activités Critiques */}
          <TabsContent value="activites" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Activités Critiques
                </CardTitle>
                <CardDescription>
                  Définissez les activités critiques de ce processus avec leurs
                  métriques BIA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="activitesCritiques"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DynamicListField
                          title="Activités Critiques"
                          description="Ajoutez toutes les activités critiques liées à ce processus"
                          fields={activitesCritiquesFields}
                          value={field.value || []}
                          onChange={field.onChange}
                          minItems={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Fournisseurs */}
          <TabsContent value="fournisseurs" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Fournisseurs Externes
                </CardTitle>
                <CardDescription>
                  Listez les fournisseurs externes critiques pour ce processus
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="fournisseursExternes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DynamicListField
                          title="Fournisseurs Externes"
                          description="Ajoutez tous les fournisseurs externes impliqués"
                          fields={fournisseursFields}
                          value={field.value || []}
                          onChange={field.onChange}
                          minItems={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Légal */}
          <TabsContent value="legal" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  Obligations Légales et Réglementaires
                </CardTitle>
                <CardDescription>
                  Définissez les obligations légales liées à ce processus
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="obligationsLegales"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DynamicListField
                          title="Obligations Légales"
                          description="Ajoutez toutes les obligations légales et réglementaires"
                          fields={obligationsLegalesFields}
                          value={field.value || []}
                          onChange={field.onChange}
                          minItems={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet IT */}
          <TabsContent value="it" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Systèmes Informatiques
                </CardTitle>
                <CardDescription>
                  Listez les systèmes IT critiques pour ce processus
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="systemesInformatiques"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DynamicListField
                          title="Systèmes Informatiques"
                          description="Ajoutez tous les systèmes IT utilisés par ce processus"
                          fields={systemesInformatiquesFields}
                          value={field.value || []}
                          onChange={field.onChange}
                          minItems={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Infrastructure */}
          <TabsContent value="infrastructure" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Infrastructures Physiques
                </CardTitle>
                <CardDescription>
                  Définissez les infrastructures nécessaires (électricité,
                  climatisation, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="infrastructuresPhysiques"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DynamicListField
                          title="Infrastructures Physiques"
                          description="Ajoutez toutes les infrastructures critiques"
                          fields={infrastructuresFields}
                          value={field.value || []}
                          onChange={field.onChange}
                          minItems={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Personnel */}
          <TabsContent value="personnel" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Rôles et Personnel
                </CardTitle>
                <CardDescription>
                  Définissez les rôles et compétences nécessaires
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="rolesPersonnel"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DynamicListField
                          title="Rôles et Personnel"
                          description="Ajoutez tous les rôles et leurs compétences"
                          fields={rolesPersonnelFields}
                          value={field.value || []}
                          onChange={field.onChange}
                          minItems={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Équipements Industriels */}
          <TabsContent value="equipements-ind" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Équipements Industriels
                </CardTitle>
                <CardDescription>
                  Listez les équipements industriels critiques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="equipementsIndustriels"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DynamicListField
                          title="Équipements Industriels"
                          description="Ajoutez tous les équipements industriels"
                          fields={equipementsIndustrielsFields}
                          value={field.value || []}
                          onChange={field.onChange}
                          minItems={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Équipements Bureautiques */}
          <TabsContent value="equipements-bureau" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Équipements Bureautiques
                </CardTitle>
                <CardDescription>
                  Listez les équipements bureautiques nécessaires
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="equipementsBureautiques"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DynamicListField
                          title="Équipements Bureautiques"
                          description="Ajoutez tous les équipements bureautiques"
                          fields={equipementsBureautiquesFields}
                          value={field.value || []}
                          onChange={field.onChange}
                          minItems={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Documentation */}
          <TabsContent value="documentation" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Documentation Critique
                </CardTitle>
                <CardDescription>
                  Définissez les documents critiques pour ce processus
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="documentationsCritiques"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DynamicListField
                          title="Documentation Critique"
                          description="Ajoutez tous les documents critiques"
                          fields={documentationsFields}
                          value={field.value || []}
                          onChange={field.onChange}
                          minItems={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Synthèse */}
          <TabsContent value="synthese" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Synthèse du Processus</CardTitle>
                <CardDescription>
                  Vérifiez les informations avant de sauvegarder
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Activités
                    </p>
                    <p className="text-2xl font-bold">
                      {form.watch("activitesCritiques")?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Fournisseurs
                    </p>
                    <p className="text-2xl font-bold">
                      {form.watch("fournisseursExternes")?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Systèmes IT
                    </p>
                    <p className="text-2xl font-bold">
                      {form.watch("systemesInformatiques")?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Personnel
                    </p>
                    <p className="text-2xl font-bold">
                      {form.watch("rolesPersonnel")?.length || 0}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Informations de base</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Nom:</span>{" "}
                      <span className="font-medium">
                        {form.watch("name") || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Département:
                      </span>{" "}
                      <span className="font-medium">
                        {form.watch("department") || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Criticité:</span>{" "}
                      <span className="font-medium">
                        {form.watch("criticality") || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">RTO:</span>{" "}
                      <span className="font-medium">{form.watch("rto")}h</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-4 sticky bottom-0 bg-background p-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/bia")}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading
              ? "Enregistrement..."
              : processId
              ? "Mettre à jour"
              : "Créer le processus"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
