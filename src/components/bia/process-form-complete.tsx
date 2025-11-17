"use client";

/**
 * FORMULAIRE BIA COMPLET - TOUTES LES SECTIONS
 * Interface type tableur Excel avec toutes les sections du BIA standard
 */

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableCell } from "@/components/bia/editable-cell";
import {
  processFormSchemaEnhanced,
  type ProcessFormValues,
} from "@/lib/validations/process-schema";
import { createProcess, updateProcess } from "@/actions/bia/process-actions";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  Save,
  X,
  Plus,
  Trash2,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ProcessFormCompleteProps = {
  processId?: string;
  initialData?: Partial<ProcessFormValues>;
  factories?: Array<{ id: string; name: string; code: string }>;
};

const criticalityOptions = [
  { value: "LOW", label: "🟢 Faible" },
  { value: "MEDIUM", label: "🟡 Moyen" },
  { value: "HIGH", label: "🟠 Élevé" },
  { value: "CRITICAL", label: "🔴 Critique" },
];

const criticalityOptionsLower = [
  { value: "low", label: "🟢 Faible" },
  { value: "medium", label: "🟡 Moyen" },
  { value: "high", label: "🟠 Élevé" },
  { value: "critical", label: "🔴 Critique" },
];

export function ProcessFormComplete({
  processId,
  initialData,
  factories = [],
}: ProcessFormCompleteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [openSections, setOpenSections] = useState({
    general: true,
    responsible: true,
    criticality: true,
    impacts: true,
    scope: true,
    activites: true,
    fournisseurs: true,
    legal: false,
    it: false,
    infrastructure: false,
    personnel: false,
    equipmentIndustrial: false,
    equipmentOffice: false,
    documentation: false,
  });

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
      supplierHasContinuityPlan: initialData?.supplierHasContinuityPlan ?? false,
      hasSLAClause: initialData?.hasSLAClause ?? false,
      hasBackupSystems: initialData?.hasBackupSystems ?? false,
      dependsOnPhysicalInfra: initialData?.dependsOnPhysicalInfra ?? false,
      canWorkRemotely: initialData?.canWorkRemotely ?? false,
      canUseOtherInfra: initialData?.canUseOtherInfra ?? false,
      canBeReplaced: initialData?.canBeReplaced ?? false,
      canReassignEquipment: initialData?.canReassignEquipment ?? false,
      backupCompatible: initialData?.backupCompatible ?? false,
      canReassignOfficeEquipment: initialData?.canReassignOfficeEquipment ?? false,
      neededAfterDisruption: initialData?.neededAfterDisruption ?? false,
      hasAlternativeAccess: initialData?.hasAlternativeAccess ?? false,
      hasReplacement: initialData?.hasReplacement ?? false,
      hasAlternativeSupplier: initialData?.hasAlternativeSupplier ?? false,
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

  // Field arrays
  const { fields: activitesFields, append: appendActivite, remove: removeActivite } = 
    useFieldArray({ control: form.control, name: "activitesCritiques" });
  
  const { fields: fournisseursFields, append: appendFournisseur, remove: removeFournisseur } = 
    useFieldArray({ control: form.control, name: "fournisseursExternes" });

  const { fields: obligationsFields, append: appendObligation, remove: removeObligation } = 
    useFieldArray({ control: form.control, name: "obligationsLegales" });

  const { fields: systemesFields, append: appendSysteme, remove: removeSysteme } = 
    useFieldArray({ control: form.control, name: "systemesInformatiques" });

  const { fields: infrastructuresFields, append: appendInfrastructure, remove: removeInfrastructure } = 
    useFieldArray({ control: form.control, name: "infrastructuresPhysiques" });

  const { fields: rolesFields, append: appendRole, remove: removeRole } = 
    useFieldArray({ control: form.control, name: "rolesPersonnel" });

  const { fields: equipIndusFields, append: appendEquipIndus, remove: removeEquipIndus } = 
    useFieldArray({ control: form.control, name: "equipementsIndustriels" });

  const { fields: equipBuroFields, append: appendEquipBuro, remove: removeEquipBuro } = 
    useFieldArray({ control: form.control, name: "equipementsBureautiques" });

  const { fields: docsFields, append: appendDoc, remove: removeDoc } = 
    useFieldArray({ control: form.control, name: "documentationsCritiques" });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

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
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const TableRow = ({ label, children, required = false }: { label: string; children: React.ReactNode; required?: boolean }) => (
    <tr className="border-b hover:bg-accent/30 transition-colors">
      <td className={cn(
        "px-4 py-2 font-medium text-sm bg-muted/50 border-r w-1/3",
        required && "after:content-['*'] after:text-red-500 after:ml-1"
      )}>
        {label}
      </td>
      <td className="px-2 py-1">
        {children}
      </td>
    </tr>
  );

  return (
    <div className="space-y-6 pb-20">
      {/* En-tête */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">
                {processId ? "Modifier le Processus BIA" : "Nouveau Processus BIA - Formulaire Complet"}
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Interface complète avec toutes les sections - Cliquez sur une cellule pour éditer
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alerte */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>💡 Navigation :</strong> Utilisez les sections collapsibles pour organiser votre saisie. 
          Tab/Enter pour naviguer, Escape pour annuler.
        </AlertDescription>
      </Alert>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* SECTION 1: INFORMATIONS GÉNÉRALES */}
        <Collapsible open={openSections.general} onOpenChange={() => toggleSection("general")}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {openSections.general ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    <CardTitle className="text-lg">1. Informations Générales</CardTitle>
                    <Badge variant="secondary">5 champs</Badge>
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <table className="w-full border">
                  <tbody>
                    <TableRow label="Nom du processus" required>
                      <EditableCell
                        value={form.watch("name")}
                        onChange={(val) => form.setValue("name", val)}
                        placeholder="Ex: Production de la ligne A"
                        required
                      />
                    </TableRow>
                    <TableRow label="Description">
                      <EditableCell
                        value={form.watch("description")}
                        onChange={(val) => form.setValue("description", val)}
                        type="textarea"
                        placeholder="Description détaillée..."
                      />
                    </TableRow>
                    <TableRow label="Département / Unité opérationnelle" required>
                      <EditableCell
                        value={form.watch("department")}
                        onChange={(val) => form.setValue("department", val)}
                        placeholder="Ex: Production"
                        required
                      />
                    </TableRow>
                    <TableRow label="Localisation" required>
                      <EditableCell
                        value={form.watch("location")}
                        onChange={(val) => form.setValue("location", val)}
                        placeholder="Ex: Usine Alger"
                        required
                      />
                    </TableRow>
                    {factories.length > 0 && (
                      <TableRow label="Usine">
                        <EditableCell
                          value={form.watch("factoryId")}
                          onChange={(val) => form.setValue("factoryId", val)}
                          type="select"
                          options={factories.map(f => ({ value: f.id, label: `${f.name} (${f.code})` }))}
                          placeholder="Sélectionner une usine"
                        />
                      </TableRow>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* SUITE DANS LE PROCHAIN MESSAGE - LE FICHIER EST TROP LONG */}
        
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg z-50">
          <div className="container mx-auto flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              <X className="mr-2 h-4 w-4" />
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading} size="lg">
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Enregistrement..." : processId ? "Mettre à jour" : "Créer le processus"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
