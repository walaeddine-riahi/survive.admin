"use client";

import { useState } from "react";
import { useForm, useFieldArray, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EditableCell } from "@/components/bia/editable-cell";
import {
  processFormSchemaEnhanced,
  type ProcessFormValues,
} from "@/lib/validations/process-schema";
import { createProcess, updateProcess } from "@/actions/bia/process-actions";
import { suggestProcessData } from "@/actions/bia/suggest-process-data";
import { toast } from "sonner";
import { type ExtractedProcessData } from "@/actions/bia/analyze-process-pdf";
import {
  ChevronDown,
  ChevronRight,
  Save,
  X,
  Plus,
  Trash2,
  FileSpreadsheet,
  AlertCircle,
  Wand2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AIDocumentUpload } from "@/components/bia/ai-document-upload";
import { ConfirmationAssistant } from "@/components/bia/confirmation-assistant";
import {
  prepareExtractedFieldsForReview,
  prepareErrorFieldsForReview,
  type ExtractedFieldReview,
} from "@/lib/confirmation-utils";

type ProcessFormSpreadsheetProps = {
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

export function ProcessFormSpreadsheet({
  processId,
  initialData,
  factories = [],
}: ProcessFormSpreadsheetProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // États pour le ConfirmationAssistant
  const [showConfirmationAssistant, setShowConfirmationAssistant] =
    useState(false);
  const [fieldsToReview, setFieldsToReview] = useState<ExtractedFieldReview[]>(
    []
  );
  const [originalAIData, setOriginalAIData] =
    useState<Partial<ExtractedProcessData> | null>(null); // Données IA brutes pour les tableaux
  const [assistantTitle, setAssistantTitle] = useState(
    "Validation des Données"
  );
  const [assistantDescription, setAssistantDescription] = useState(
    "Vérifiez et validez les données."
  );

  // États pour les sections collapsibles
  const [openSections, setOpenSections] = useState({
    general: true,
    responsable: true,
    criticite: true,
    impacts: true,
    dependencies: true,
    scope: true,
    activitesCritiques: false,
    fournisseursExternes: false,
    legal: false,
    systemes: false,
    infrastructure: false,
    personnel: false,
    equipIndus: false,
    equipBuro: false,
    docs: false,
  });

  const form = useForm<ProcessFormValues>({
    resolver: zodResolver(processFormSchemaEnhanced),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      department: initialData?.department || "",
      location: initialData?.location || "",
      factoryId: initialData?.factoryId || factories[0]?.id || "",
      processOwner: initialData?.processOwner || "",
      ownerRole: initialData?.ownerRole || "",
      ownerEmail: initialData?.ownerEmail || "",
      ownerPhone: initialData?.ownerPhone || "",
      interimManagers: initialData?.interimManagers || [],
      impact: initialData?.impact || "",
      criticality: initialData?.criticality || "MEDIUM",
      rto: initialData?.rto || 0,
      mtpd: initialData?.mtpd || 0,
      rpo: initialData?.rpo || 0,
      mbco: initialData?.mbco || "",
      criticalTimes: initialData?.criticalTimes || "",

      // Nouveaux impacts structurés
      impacts: initialData?.impacts || [
        {
          id: "1",
          type: "Financier",
          level: "medium" as const,
          hasImpact: false,
          description: "",
        },
        {
          id: "2",
          type: "Opérationnel",
          level: "medium" as const,
          hasImpact: false,
          description: "",
        },
        {
          id: "3",
          type: "Réputation",
          level: "medium" as const,
          hasImpact: false,
          description: "",
        },
        {
          id: "4",
          type: "Légal/Réglementaire",
          level: "medium" as const,
          hasImpact: false,
          description: "",
        },
        {
          id: "5",
          type: "Sécurité",
          level: "medium" as const,
          hasImpact: false,
          description: "",
        },
      ],

      // Nouvelles dépendances structurées
      dependencies: initialData?.dependencies || [
        {
          id: "1",
          processName: "",
          department: "",
          supportType: "",
          reason: "",
          dependencyType: "",
        },
        {
          id: "2",
          processName: "",
          department: "",
          supportType: "",
          reason: "",
          dependencyType: "",
        },
        {
          id: "3",
          processName: "",
          department: "",
          supportType: "",
          reason: "",
          dependencyType: "",
        },
      ],

      // Anciens champs (deprecated)
      financialImpact: initialData?.financialImpact || "",
      operationalImpact: initialData?.operationalImpact || "",
      reputationImpact: initialData?.reputationImpact || "",
      operationalCapacityImpact: initialData?.operationalCapacityImpact || "",
      mainFunctionality: initialData?.mainFunctionality || "",
      productDependencies: initialData?.productDependencies || "",
      interServiceDependencies: initialData?.interServiceDependencies || "",
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
      activitesCritiques: initialData?.activitesCritiques || [],
      fournisseursExternes: initialData?.fournisseursExternes || [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      obligationsLegales: (initialData as any)?.obligationsLegales || [],
      systemesInformatiques: initialData?.systemesInformatiques || [],
      infrastructuresPhysiques: initialData?.infrastructuresPhysiques || [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rolesPersonnel: (initialData as any)?.rolesPersonnel || [],
      equipementsIndustriels: initialData?.equipementsIndustriels || [],
      equipementsBureautiques: initialData?.equipementsBureautiques || [],
      documentationsCritiques: initialData?.documentationsCritiques || [],
    },
  });

  // Field arrays pour les multi-éléments
  const {
    fields: interimFields,
    append: appendInterim,
    remove: removeInterim,
  } = useFieldArray({ control: form.control, name: "interimManagers" });

  const {
    fields: impactFields,
    append: appendImpact,
    remove: removeImpact,
    update: updateImpact,
  } = useFieldArray({ control: form.control, name: "impacts" });

  const {
    fields: dependencyFields,
    append: appendDependency,
    remove: removeDependency,
    update: updateDependency,
  } = useFieldArray({ control: form.control, name: "dependencies" });

  const {
    fields: activitesFields,
    append: appendActivite,
    remove: removeActivite,
  } = useFieldArray({ control: form.control, name: "activitesCritiques" });

  const {
    fields: fournisseursFields,
    append: appendFournisseur,
    remove: removeFournisseur,
  } = useFieldArray({ control: form.control, name: "fournisseursExternes" });

  const {
    fields: obligationsFields,
    append: appendObligation,
    remove: removeObligation,
  } = useFieldArray({ control: form.control, name: "obligationsLegales" });

  const {
    fields: systemesFields,
    append: appendSysteme,
    remove: removeSysteme,
  } = useFieldArray({ control: form.control, name: "systemesInformatiques" });

  const {
    fields: infrastructuresFields,
    append: appendInfrastructure,
    remove: removeInfrastructure,
  } = useFieldArray({
    control: form.control,
    name: "infrastructuresPhysiques",
  });

  const {
    fields: rolesFields,
    append: appendRole,
    remove: removeRole,
  } = useFieldArray({ control: form.control, name: "rolesPersonnel" });

  const {
    fields: equipIndusFields,
    append: appendEquipIndus,
    remove: removeEquipIndus,
  } = useFieldArray({ control: form.control, name: "equipementsIndustriels" });

  const {
    fields: equipBuroFields,
    append: appendEquipBuro,
    remove: removeEquipBuro,
  } = useFieldArray({ control: form.control, name: "equipementsBureautiques" });

  const {
    fields: docsFields,
    append: appendDoc,
    remove: removeDoc,
  } = useFieldArray({ control: form.control, name: "documentationsCritiques" });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Fonction pour remplir automatiquement le formulaire avec les données extraites par l'IA
  const handleAIDataExtracted = (aiData: Partial<ExtractedProcessData>) => {
    console.log("📋 Données IA reçues:", aiData);

    // Stocker les données originales pour accéder aux tableaux JSON
    setOriginalAIData(aiData);

    // Préparer les champs pour la validation
    const fieldsForReview = prepareExtractedFieldsForReview(aiData);
    console.log("📝 Champs préparés pour validation:", fieldsForReview);
    console.log("🔢 Nombre de champs:", fieldsForReview.length);

    if (fieldsForReview.length > 0) {
      // Ouvrir l'assistant de confirmation
      setAssistantTitle("Validation des Données Extraites");
      setAssistantDescription("L'IA a extrait ces informations du PDF. Veuillez les valider.");
      setFieldsToReview(fieldsForReview);
      setShowConfirmationAssistant(true);

      toast.success("✅ Extraction terminée !", {
        description: `${fieldsForReview.length} informations extraites. L'assistant IA va vous les présenter pour validation.`,
        duration: 4000,
      });
    } else {
      console.log("⚠️ Aucun champ préparé");
      toast.warning("⚠️ Aucune donnée extraite", {
        description: "Le PDF ne contient pas d'informations exploitables.",
      });
    }

    // Remplir les champs simples
    if (aiData.name) form.setValue("name", aiData.name);
    if (aiData.description) form.setValue("description", aiData.description);
    if (aiData.department) form.setValue("department", aiData.department);
    if (aiData.location) form.setValue("location", aiData.location);
    if (aiData.processOwner) form.setValue("processOwner", aiData.processOwner);
    if (aiData.ownerRole) form.setValue("ownerRole", aiData.ownerRole);
    if (aiData.ownerEmail) form.setValue("ownerEmail", aiData.ownerEmail);
    if (aiData.ownerPhone) form.setValue("ownerPhone", aiData.ownerPhone);
    if (aiData.impact) form.setValue("impact", aiData.impact);
    if (aiData.criticality) form.setValue("criticality", aiData.criticality as any);
    if (aiData.rto) form.setValue("rto", Number(aiData.rto));
    if (aiData.mtpd) form.setValue("mtpd", Number(aiData.mtpd));
    if (aiData.rpo) form.setValue("rpo", Number(aiData.rpo));
    if (aiData.mbco) form.setValue("mbco", aiData.mbco);
    if (aiData.criticalTimes) form.setValue("criticalTimes", aiData.criticalTimes);

    // Remplir les impacts structurés (IA: impacts)
    const aiImpacts = (aiData as any).impacts;
    if (aiImpacts && Array.isArray(aiImpacts) && aiImpacts.length > 0) {
      const currentImpacts = [...(form.getValues("impacts") || [])];
      aiImpacts.forEach((impact: any) => {
        const index = currentImpacts.findIndex(i => 
          i.type.toLowerCase() === (impact.type || "").toLowerCase()
        );
        if (index !== -1) {
          if (impact.level) currentImpacts[index].level = impact.level;
          currentImpacts[index].hasImpact = true;
          if (impact.description) currentImpacts[index].description = impact.description;
        }
      });
      form.setValue("impacts", currentImpacts);
    }

    // Remplir les activités critiques si disponibles (Nom du champ dans l'IA: activitesCritiques)
    const criticalActivities = (aiData as any).activitesCritiques || (aiData as any).criticalActivities;
    if (criticalActivities && Array.isArray(criticalActivities)) {
      const activities = criticalActivities.map(
        (activity: any) => ({
          nom: activity.nom || activity.name || "",
          criticite: activity.criticite || activity.criticality || "medium",
          delai: activity.delai || "",
          rto: activity.rto || 4,
          mtpd: activity.mtpd || (activity.rto ? activity.rto * 2 : 8),
          rpo: activity.rpo || 2,
          mbco: activity.mbco || "",
          impactsOperationnels: activity.impactsOperationnels || activity.impact || "",
          impactsReglementaires: activity.impactsReglementaires || "",
          impactsImage: activity.impactsImage || "",
        })
      );
      form.setValue("activitesCritiques", activities);
    }

    // Remplir les systèmes informatiques si disponibles (Nom du champ dans l'IA: systemesInformatiques)
    const systems = (aiData as any).systemesInformatiques || (aiData as any).systems;
    if (systems && Array.isArray(systems)) {
      const itSystems = systems.map((system: any) => ({
        nom: system.nom || system.name || "",
        typeSysteme: system.typeSysteme || system.type || "",
        criticite: system.criticite || system.criticality || "medium",
        impactIndisponibilite: system.impactIndisponibilite || "",
        activitesAssociees: system.activitesAssociees || "",
        sauvegardesEnPlace: system.sauvegardesEnPlace || "oui",
        rto: system.rto || 4,
        rpo: system.rpo || 4,
        mtpd: system.mtpd || 8,
        solutionsContournement: system.solutionsContournement || "",
      }));
      form.setValue("systemesInformatiques", itSystems);
    }

    // Remplir le personnel si disponible (Nom du champ dans l'IA: rolesPersonnel)
    const personnel = (aiData as any).rolesPersonnel || (aiData as any).personnel;
    if (personnel && Array.isArray(personnel)) {
      const staffRoles = personnel.map((person: any) => ({
        role: person.role || "",
        effectif: person.effectif || person.number || 1,
        tachesResponsabilites: person.tachesResponsabilites || "",
        competenceUnique: person.competenceUnique || "non",
        delaiDisponibiliteNecessaire: person.delaiDisponibiliteNecessaire || "",
        remplacable: person.remplacable || "oui",
        formationNecessaire: person.formationNecessaire || "non",
      }));
      form.setValue("rolesPersonnel", staffRoles);
    }

    // Remplir les fournisseurs si disponibles (Nom du champ dans l'IA: fournisseursExternes)
    const suppliers = (aiData as any).fournisseursExternes || (aiData as any).suppliers;
    if (suppliers && Array.isArray(suppliers)) {
      const externalSuppliers = suppliers.map((supplier: any) => ({
        nom: supplier.nom || supplier.name || "",
        servicesOfferts: supplier.servicesOfferts || supplier.service || "",
        contactNom: supplier.contactNom || "",
        contactTelephone: supplier.contactTelephone || "",
        contactEmail: supplier.contactEmail || "",
        zoneGeographique: supplier.zoneGeographique || "",
        planContinuiteActivite: supplier.planContinuiteActivite || "non",
        clauseSLA: supplier.clauseSLA || "non",
        rto: supplier.rto || 4,
        mtpd: supplier.mtpd || 8,
      }));
      form.setValue("fournisseursExternes", externalSuppliers);
    }

    // Remplir les obligations légales si disponibles (Nom du champ dans l'IA: obligationsLegales)
    const obligations = (aiData as any).obligationsLegales || (aiData as any).legalRequirements;
    if (obligations && Array.isArray(obligations)) {
      const legalRequirements = obligations.map((ob: any) => ({
        domaine: ob.domaine || "",
        obligationLegale: ob.obligationLegale || ob.name || "",
        reference: ob.reference || "",
        autoriteRegulation: ob.autoriteRegulation || "",
        details: ob.details || "",
        consequencesNonRespect: ob.consequencesNonRespect || "",
      }));
      form.setValue("obligationsLegales", legalRequirements);
    }

    // Remplir les dépendances si disponibles
    if (aiData.dependencies && Array.isArray(aiData.dependencies)) {
      const deps = aiData.dependencies.map((dep: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        processName: dep.name || "",
        department: dep.department || "",
        supportType: dep.type || "",
        reason: dep.description || "",
        dependencyType: dep.type || "",
      }));
      form.setValue("dependencies", deps);
    }

    // Ouvrir toutes les sections pour que l'utilisateur puisse voir les données
    setOpenSections({
      general: true,
      responsable: true,
      criticite: true,
      impacts: true,
      dependencies: true,
      scope: true,
      activitesCritiques: true,
      fournisseursExternes: true,
      legal: true,
      systemes: true,
      infrastructure: true,
      personnel: true,
      equipIndus: true,
      equipBuro: true,
      docs: true,
    });

    toast.success(
      "✨ Formulaire rempli automatiquement ! Vérifiez et ajustez les données si nécessaire."
    );
    toast.success("✅ Extraction terminée !", {
      description: "Le formulaire a été rempli. Vérifiez et ajustez les données si nécessaire.",
    });
  };

  const handleAISuggestions = async () => {
    const values = form.getValues();
    if (!values.name) {
      toast.error("Veuillez d'abord saisir un nom de processus");
      return;
    }

    setIsLoading(true);
    try {
      const result = await suggestProcessData(values);
      if (result.success && result.suggestions) {
        const s = result.suggestions;
        if (s.department && !values.department) form.setValue("department", s.department);
        if (s.location && !values.location) form.setValue("location", s.location);
        if (s.impact && !values.impact) form.setValue("impact", s.impact);
        if (s.rto !== undefined && !values.rto) form.setValue("rto", s.rto);
        if (s.mtpd !== undefined && !values.mtpd) form.setValue("mtpd", s.mtpd);
        if (s.rpo !== undefined && !values.rpo) form.setValue("rpo", s.rpo);
        if (s.mbco && !values.mbco) form.setValue("mbco", s.mbco);
        if (s.criticality && values.criticality === "MEDIUM") form.setValue("criticality", s.criticality);
        
        toast.success("Suggestions appliquées ✨", {
          description: "L'IA a complété les champs manquants basés sur le contexte.",
        });
        
        // Ouvrir les sections concernées
        setOpenSections(prev => ({ ...prev, general: true, criticite: true }));
      } else {
        toast.error("L'IA n'a pas pu générer de suggestions");
      }
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
      toast.error("Une erreur est survenue lors de la consultation de l'IA");
    } finally {
      setIsLoading(false);
    }
  };

  const onError = (errors: any) => {
    console.error("❌ Erreurs de validation:", errors);
    
    // Fusionner les erreurs pour avoir une vue complète
    const actualErrors = { ...form.formState.errors, ...errors };
    const errorFields = Object.keys(actualErrors);
    
    if (errorFields.length > 0) {
      console.log("🔍 Champs en erreur:", errorFields);
      // Mapper les champs aux sections pour les ouvrir automatiquement
      const fieldToSection: Record<string, keyof typeof openSections> = {
        name: "general",
        description: "general",
        department: "general",
        location: "general",
        factoryId: "general",
        processOwner: "responsable",
        ownerRole: "responsable",
        ownerEmail: "responsable",
        ownerPhone: "responsable",
        interimManagers: "responsable",
        impact: "criticite",
        criticality: "criticite",
        rto: "criticite",
        mtpd: "criticite",
        rpo: "criticite",
        mbco: "criticite",
        criticalTimes: "criticite",
        impacts: "impacts",
        dependencies: "dependencies",
        activitesCritiques: "activitesCritiques",
        fournisseursExternes: "fournisseursExternes",
        obligationsLegales: "legal",
        systemesInformatiques: "systemes",
        infrastructuresPhysiques: "infrastructure",
        rolesPersonnel: "personnel",
        equipementsIndustriels: "equipIndus",
        equipementsBureautiques: "equipBuro",
        documentationsCritiques: "docs",
      };

      // Identifier les sections à ouvrir
      const sectionsToOpen = { ...openSections };
      let hasNewSectionToOpen = false;

      errorFields.forEach((field) => {
        const section = fieldToSection[field as keyof typeof fieldToSection];
        if (section && !sectionsToOpen[section]) {
          sectionsToOpen[section] = true;
          hasNewSectionToOpen = true;
        }
      });

      if (hasNewSectionToOpen) {
        setOpenSections(sectionsToOpen);
      }

      // Préparer les champs pour l'assistant de correction
      const errorFieldsForReview = prepareErrorFieldsForReview(actualErrors, form.getValues());
      if (errorFieldsForReview.length > 0) {
        setAssistantTitle("Correction Assistée par IA 🤖");
        setAssistantDescription(`Il y a ${errorFieldsForReview.length} champ(s) à corriger ou compléter.`);
        setFieldsToReview(errorFieldsForReview);
        setShowConfirmationAssistant(true);
      }

      toast.error("Formulaire incomplet", {
        description: `Veuillez corriger les ${errorFields.length} champ(s) invalide(s).`,
      });
    } else {
      // Cas étrange : onError appelé sans erreurs visibles
      toast.error("Erreur de validation inconnue", {
        description: "Certains champs sont invalides mais n'ont pas pu être identifiés. Vérifiez tous les champs requis (marqués par *).",
      });
    }
  };

  const handleManualSubmit = async () => {
    console.log("🛠️ Démarrage de la soumission manuelle...");
    setIsLoading(true);

    try {
      const values = form.getValues();
      console.log("📝 Valeurs envoyées à Zod:", values);
      
      // Diagnostic ultra-profond via Zod direct
      const zodCheck = processFormSchemaEnhanced.safeParse(values);
      console.log("🧬 Diagnostic Zod direct (success):", zodCheck.success);
      if (!zodCheck.success) {
        console.error("🧬 Erreurs Zod (issues):", JSON.stringify(zodCheck.error.issues, null, 2));
      }

      // Forcer la validation manuelle
      const isValid = await form.trigger();
      console.log("🔍 Résultat du trigger manuel:", isValid);
      
      if (!isValid) {
        console.error("❌ La validation a échoué. Erreurs:", form.formState.errors);
        onError(form.formState.errors);
        setIsLoading(false);
        return;
      }

      // Si valide, on récupère les données et on appelle onSubmit
      const data = form.getValues();
      await onSubmit(data);
    } catch (error) {
      console.error("💥 Erreur critique lors de la soumission manuelle:", error);
      toast.error("Une erreur critique est survenue lors de l'enregistrement");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProcessFormValues) => {
    console.log("🚀 onSubmit appelé avec les données validées:", data);

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
      console.error("Erreur lors de la soumission:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const TableRow = ({
    label,
    children,
    required = false,
  }: {
    label: string;
    children: React.ReactNode;
    required?: boolean;
  }) => (
    <tr className="border-b hover:bg-accent/30 transition-colors">
      <td
        className={cn(
          "px-4 py-2 font-medium text-sm bg-muted/50 border-r w-1/3",
          required && "after:content-['*'] after:text-red-500 after:ml-1"
        )}
      >
        {label}
      </td>
      <td className="px-2 py-1">{children}</td>
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
                {processId
                  ? "Modifier le Processus BIA"
                  : "Nouveau Processus BIA"}
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Interface de saisie type tableur - Cliquez sur une cellule pour
                éditer
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alerte d'aide */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>💡 Astuce :</strong> Cliquez sur n&apos;importe quelle cellule
          pour l&apos;éditer. Utilisez{" "}
          <kbd className="px-2 py-1 text-xs bg-muted rounded">Tab</kbd> pour
          passer à la suivante,
          <kbd className="px-2 py-1 text-xs bg-muted rounded">Enter</kbd> pour
          valider.
        </AlertDescription>
      </Alert>

      {/* Upload de document avec IA - uniquement en création */}
      {!processId && (
        <AIDocumentUpload
          onDataExtracted={handleAIDataExtracted}
          disabled={isLoading}
        />
      )}

      <form
        onSubmit={(e) => e.preventDefault()}
        className="space-y-4"
      >
        {/* SECTION 1: INFORMATIONS GÉNÉRALES */}
        <Collapsible
          open={openSections.general}
          onOpenChange={() => toggleSection("general")}
        >
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {openSections.general ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    <CardTitle className="text-lg">
                      1. Informations Générales
                    </CardTitle>
                    <Badge variant="secondary">6 champs</Badge>
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
                        onChange={(val) =>
                          form.setValue("name", String(val ?? ""))
                        }
                        placeholder="Ex: Production de la ligne A"
                        required
                      />
                    </TableRow>
                    <TableRow label="Description">
                      <EditableCell
                        value={form.watch("description")}
                        onChange={(val) =>
                          form.setValue("description", String(val ?? ""))
                        }
                        type="textarea"
                        placeholder="Description détaillée du processus..."
                      />
                    </TableRow>
                    <TableRow label="Département" required>
                      <EditableCell
                        value={form.watch("department")}
                        onChange={(val) =>
                          form.setValue("department", String(val ?? ""))
                        }
                        placeholder="Ex: Production"
                        required
                      />
                    </TableRow>
                    <TableRow label="Localisation" required>
                      <EditableCell
                        value={form.watch("location")}
                        onChange={(val) =>
                          form.setValue("location", String(val ?? ""))
                        }
                        placeholder="Ex: Usine Alger"
                        required
                      />
                    </TableRow>
                    {factories.length > 0 && (
                      <TableRow label="Usine">
                        <EditableCell
                          value={form.watch("factoryId")}
                          onChange={(val) =>
                            form.setValue("factoryId", String(val ?? ""))
                          }
                          type="select"
                          options={factories.map((f) => ({
                            value: f.id,
                            label: `${f.name} (${f.code})`,
                          }))}
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

        {/* SECTION 2: RESPONSABLE */}
        <Collapsible
          open={openSections.general}
          onOpenChange={() => toggleSection("general")}
        >
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {openSections.general ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    <CardTitle className="text-lg">
                      2. Responsable du Processus
                    </CardTitle>
                    <Badge variant="secondary">
                      {4 + interimFields.length} champs
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <table className="w-full border">
                  <tbody>
                    <TableRow label="Nom du responsable">
                      <EditableCell
                        value={form.watch("processOwner")}
                        onChange={(val) =>
                          form.setValue("processOwner", String(val ?? ""))
                        }
                        placeholder="Ex: Ahmed Benali"
                      />
                    </TableRow>
                    <TableRow label="Rôle / Fonction">
                      <EditableCell
                        value={form.watch("ownerRole")}
                        onChange={(val) =>
                          form.setValue("ownerRole", String(val ?? ""))
                        }
                        placeholder="Ex: Chef de production"
                      />
                    </TableRow>
                    <TableRow label="Email">
                      <EditableCell
                        value={form.watch("ownerEmail")}
                        onChange={(val) =>
                          form.setValue("ownerEmail", String(val ?? ""))
                        }
                        placeholder="ex: ahmed.benali@company.com"
                      />
                    </TableRow>
                    <TableRow label="Téléphone">
                      <EditableCell
                        value={form.watch("ownerPhone")}
                        onChange={(val) =>
                          form.setValue("ownerPhone", String(val ?? ""))
                        }
                        placeholder="Ex: +213 555 123 456"
                      />
                    </TableRow>
                  </tbody>
                </table>

                {/* Responsables intérimaires */}
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">
                      Responsables Intérimaires
                    </h4>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        appendInterim({
                          id: String(Date.now()),
                          name: "",
                          role: "",
                          email: "",
                          phone: "",
                          isActive: true,
                        })
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter un responsable intérimaire
                    </Button>
                  </div>

                  {interimFields.length > 0 && (
                    <div className="space-y-3">
                      {interimFields.map((field, index) => (
                        <Card key={field.id} className="p-4 bg-slate-50/50">
                          <div className="flex items-start gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs font-medium">
                                    Nom
                                  </label>
                                  <EditableCell
                                    value={form.watch(
                                      `interimManagers.${index}.name`
                                    )}
                                    onChange={(val) =>
                                      form.setValue(
                                        `interimManagers.${index}.name`,
                                        String(val ?? "")
                                      )
                                    }
                                    placeholder="Nom complet"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium">
                                    Rôle
                                  </label>
                                  <EditableCell
                                    value={form.watch(
                                      `interimManagers.${index}.role`
                                    )}
                                    onChange={(val) =>
                                      form.setValue(
                                        `interimManagers.${index}.role`,
                                        String(val ?? "")
                                      )
                                    }
                                    placeholder="Fonction"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium">
                                    Email
                                  </label>
                                  <EditableCell
                                    value={form.watch(
                                      `interimManagers.${index}.email`
                                    )}
                                    onChange={(val) =>
                                      form.setValue(
                                        `interimManagers.${index}.email`,
                                        String(val ?? "")
                                      )
                                    }
                                    placeholder="email@exemple.com"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium">
                                    Téléphone
                                  </label>
                                  <EditableCell
                                    value={form.watch(
                                      `interimManagers.${index}.phone`
                                    )}
                                    onChange={(val) =>
                                      form.setValue(
                                        `interimManagers.${index}.phone`,
                                        String(val ?? "")
                                      )
                                    }
                                    placeholder="+216 00 000 000"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={form.watch(
                                    `interimManagers.${index}.isActive`
                                  )}
                                  onChange={(e) =>
                                    form.setValue(
                                      `interimManagers.${index}.isActive`,
                                      e.target.checked
                                    )
                                  }
                                  className="rounded"
                                  aria-label="Responsable actif"
                                />
                                <label className="text-xs">
                                  Responsable actif
                                </label>
                              </div>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeInterim(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* SECTION 3: CRITICITÉ & MÉTRIQUES BIA */}
        <Collapsible
          open={openSections.criticite}
          onOpenChange={() => toggleSection("criticite")}
        >
          <Card className="border-orange-200">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors bg-orange-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {openSections.criticite ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    <CardTitle className="text-lg">
                      3. Criticité & Métriques BIA ⚡
                    </CardTitle>
                    <Badge variant="destructive">5 champs obligatoires</Badge>
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <table className="w-full border">
                  <tbody>
                    <TableRow label="Impact" required>
                      <EditableCell
                        value={form.watch("impact")}
                        onChange={(val) =>
                          form.setValue("impact", String(val ?? ""))
                        }
                        type="textarea"
                        placeholder="Décrivez l'impact de la défaillance de ce processus..."
                        required
                      />
                    </TableRow>
                    <TableRow label="Niveau de Criticité" required>
                      <EditableCell
                        value={form.watch("criticality")}
                        onChange={(val) =>
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          form.setValue("criticality", val as any)
                        }
                        type="select"
                        options={criticalityOptions}
                        required
                      />
                    </TableRow>
                    <TableRow label="RTO (Recovery Time Objective)" required>
                      <div className="flex items-center gap-2">
                        <EditableCell
                          value={form.watch("rto")}
                          onChange={(val) => form.setValue("rto", Number(val))}
                          type="number"
                          min={0}
                          placeholder="0"
                          required
                        />
                        <span className="text-sm text-muted-foreground">
                          heures
                        </span>
                      </div>
                    </TableRow>
                    <TableRow label="MTPD (Maximum Tolerable Period)" required>
                      <div className="flex items-center gap-2">
                        <EditableCell
                          value={form.watch("mtpd")}
                          onChange={(val) => form.setValue("mtpd", Number(val))}
                          type="number"
                          min={0}
                          placeholder="0"
                          required
                        />
                        <span className="text-sm text-muted-foreground">
                          heures
                        </span>
                      </div>
                    </TableRow>
                    <TableRow label="RPO (Recovery Point Objective)" required>
                      <div className="flex items-center gap-2">
                        <EditableCell
                          value={form.watch("rpo")}
                          onChange={(val) => form.setValue("rpo", Number(val))}
                          type="number"
                          min={0}
                          placeholder="0"
                          required
                        />
                        <span className="text-sm text-muted-foreground">
                          heures
                        </span>
                      </div>
                    </TableRow>
                    <TableRow
                      label="MBCO (Minimum Business Continuity Objective)"
                      required
                    >
                      <EditableCell
                        value={form.watch("mbco")}
                        onChange={(val) =>
                          form.setValue("mbco", String(val ?? ""))
                        }
                        placeholder="Ex: 50% de la capacité nominale"
                        required
                      />
                    </TableRow>
                    <TableRow label="Périodes critiques">
                      <EditableCell
                        value={form.watch("criticalTimes")}
                        onChange={(val) =>
                          form.setValue("criticalTimes", String(val ?? ""))
                        }
                        placeholder="Ex: fin de mois, saison haute, période fiscale..."
                        type="textarea"
                      />
                    </TableRow>
                  </tbody>
                </table>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* SECTION 2: IMPACTS DE LA PERTURBATION */}
        <Collapsible
          open={openSections.impacts}
          onOpenChange={() => toggleSection("impacts")}
        >
          <Card className="border-pink-200">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors bg-pink-50/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {openSections.impacts ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    <CardTitle className="text-lg">
                      2. Impacts de la Perturbation 💥
                    </CardTitle>
                    <Badge variant="secondary">
                      {impactFields.length} impacts
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-end mb-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendImpact({
                          id: String(Date.now()),
                          type: "",
                          level: "medium",
                          hasImpact: false,
                          description: "",
                        })
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter un impact
                    </Button>
                  </div>
                  <div className="grid grid-cols-12 gap-2 font-medium text-sm border-b pb-2">
                    <div className="col-span-3">Type d&apos;impact</div>
                    <div className="col-span-2">Niveau</div>
                    <div className="col-span-2">Impact?</div>
                    <div className="col-span-4">Description/Justification</div>
                    <div className="col-span-1"></div>
                  </div>
                  {impactFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-12 gap-2 items-start"
                    >
                      <div className="col-span-3">
                        <EditableCell
                          value={field.type}
                          onChange={(val) => {
                            const updated = {
                              ...field,
                              type: String(val ?? ""),
                            };
                            updateImpact(index, updated);
                          }}
                          placeholder="Type d'impact"
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={field.level}
                          onChange={(e) => {
                            const updated = {
                              ...field,
                              level: e.target.value as
                                | "low"
                                | "medium"
                                | "high",
                            };
                            updateImpact(index, updated);
                          }}
                          className="w-full p-2 border rounded"
                          aria-label="Niveau d'impact"
                        >
                          <option value="low">Bas</option>
                          <option value="medium">Moyen</option>
                          <option value="high">Haut</option>
                        </select>
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={field.hasImpact}
                          onChange={(e) => {
                            const updated = {
                              ...field,
                              hasImpact: e.target.checked,
                            };
                            updateImpact(index, updated);
                          }}
                          className="h-4 w-4"
                          aria-label="A un impact"
                        />
                      </div>
                      <div className="col-span-4">
                        <EditableCell
                          value={field.description}
                          onChange={(val) => {
                            const updated = {
                              ...field,
                              description: String(val ?? ""),
                            };
                            updateImpact(index, updated);
                          }}
                          placeholder="Description..."
                          type="textarea"
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImpact(index)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* SECTION 3: DÉPENDANCES */}
        <Collapsible
          open={openSections.dependencies}
          onOpenChange={() => toggleSection("dependencies")}
        >
          <Card className="border-purple-200">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors bg-purple-50/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {openSections.dependencies ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    <CardTitle className="text-lg">3. Dépendances 🔗</CardTitle>
                    <Badge variant="secondary">
                      {dependencyFields.length} dépendances
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-end mb-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendDependency({
                          id: String(Date.now()),
                          processName: "",
                          department: "",
                          supportType: "",
                          reason: "",
                          dependencyType: "",
                        })
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter une dépendance
                    </Button>
                  </div>
                  <div className="grid grid-cols-12 gap-2 font-medium text-sm border-b pb-2">
                    <div className="col-span-2">Processus dépendant</div>
                    <div className="col-span-2">Département/Fonction</div>
                    <div className="col-span-2">Type de soutien</div>
                    <div className="col-span-2">Pourquoi?</div>
                    <div className="col-span-3">Type (détail)</div>
                    <div className="col-span-1"></div>
                  </div>
                  {dependencyFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-12 gap-2 items-start"
                    >
                      <div className="col-span-2">
                        <EditableCell
                          value={field.processName}
                          onChange={(val) => {
                            const updated = {
                              ...field,
                              processName: String(val ?? ""),
                            };
                            updateDependency(index, updated);
                          }}
                          placeholder="Nom du processus"
                        />
                      </div>
                      <div className="col-span-2">
                        <EditableCell
                          value={field.department}
                          onChange={(val) => {
                            const updated = {
                              ...field,
                              department: String(val ?? ""),
                            };
                            updateDependency(index, updated);
                          }}
                          placeholder="Département"
                        />
                      </div>
                      <div className="col-span-2">
                        <EditableCell
                          value={field.supportType}
                          onChange={(val) => {
                            const updated = {
                              ...field,
                              supportType: String(val ?? ""),
                            };
                            updateDependency(index, updated);
                          }}
                          placeholder="Type de soutien"
                        />
                      </div>
                      <div className="col-span-2">
                        <EditableCell
                          value={field.reason}
                          onChange={(val) => {
                            const updated = {
                              ...field,
                              reason: String(val ?? ""),
                            };
                            updateDependency(index, updated);
                          }}
                          placeholder="Raison..."
                          type="textarea"
                        />
                      </div>
                      <div className="col-span-3">
                        <EditableCell
                          value={field.dependencyType}
                          onChange={(val) => {
                            const updated = {
                              ...field,
                              dependencyType: String(val ?? ""),
                            };
                            updateDependency(index, updated);
                          }}
                          placeholder="Détail du type..."
                          type="textarea"
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDependency(index)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* SECTION 4: ACTIVITÉS CRITIQUES (Multi-éléments) */}
        <Collapsible
          open={openSections.activitesCritiques}
          onOpenChange={() => toggleSection("activitesCritiques")}
        >
          <Card className="border-blue-200">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors bg-blue-50/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {openSections.activitesCritiques ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    <CardTitle className="text-lg">
                      4. Activités Critiques 📋
                    </CardTitle>
                    <Badge variant="outline">
                      {activitesFields.length} activités
                    </Badge>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      appendActivite({
                        nom: "",
                        criticite: "medium",
                        rto: 0,
                        mtpd: 0,
                        rpo: 0,
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        appendActivite({
                          nom: "",
                          criticite: "medium",
                          rto: 0,
                          mtpd: 0,
                          rpo: 0,
                        });
                      }
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                {activitesFields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>
                      Aucune activité critique. Cliquez sur &quot;Ajouter&quot;
                      pour commencer.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-2 py-2 text-left border-r w-8">
                            #
                          </th>
                          <th className="px-2 py-2 text-left border-r">
                            Nom *
                          </th>
                          <th className="px-2 py-2 text-left border-r w-32">
                            Criticité *
                          </th>
                          <th className="px-2 py-2 text-left border-r w-24">
                            RTO (h) *
                          </th>
                          <th className="px-2 py-2 text-left border-r w-24">
                            MTPD (h) *
                          </th>
                          <th className="px-2 py-2 text-left border-r w-24">
                            RPO (h) *
                          </th>
                          <th className="px-2 py-2 text-left border-r">
                            Impacts Opérationnels
                          </th>
                          <th className="px-2 py-2 text-left border-r">
                            Solutions Contournement
                          </th>
                          <th className="px-2 py-2 w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {activitesFields.map((field, index) => (
                          <tr
                            key={field.id}
                            className="border-b hover:bg-accent/30"
                          >
                            <td className="px-2 py-1 border-r text-center text-muted-foreground">
                              {index + 1}
                            </td>
                            <td className="px-2 py-1 border-r">
                              <EditableCell
                                value={form.watch(
                                  `activitesCritiques.${index}.nom`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `activitesCritiques.${index}.nom`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="Nom de l'activité"
                                required
                              />
                            </td>
                            <td className="px-2 py-1 border-r">
                              <EditableCell
                                value={form.watch(
                                  `activitesCritiques.${index}.criticite`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `activitesCritiques.${index}.criticite`,
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    val as any
                                  )
                                }
                                type="select"
                                options={criticalityOptionsLower}
                                required
                              />
                            </td>
                            <td className="px-2 py-1 border-r">
                              <EditableCell
                                value={form.watch(
                                  `activitesCritiques.${index}.rto`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `activitesCritiques.${index}.rto`,
                                    Number(val)
                                  )
                                }
                                type="number"
                                min={0}
                                required
                              />
                            </td>
                            <td className="px-2 py-1 border-r">
                              <EditableCell
                                value={form.watch(
                                  `activitesCritiques.${index}.mtpd`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `activitesCritiques.${index}.mtpd`,
                                    Number(val)
                                  )
                                }
                                type="number"
                                min={0}
                                required
                              />
                            </td>
                            <td className="px-2 py-1 border-r">
                              <EditableCell
                                value={form.watch(
                                  `activitesCritiques.${index}.rpo`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `activitesCritiques.${index}.rpo`,
                                    Number(val)
                                  )
                                }
                                type="number"
                                min={0}
                                required
                              />
                            </td>
                            <td className="px-2 py-1 border-r">
                              <EditableCell
                                value={form.watch(
                                  `activitesCritiques.${index}.impactsOperationnels`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `activitesCritiques.${index}.impactsOperationnels`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="Impacts..."
                              />
                            </td>
                            <td className="px-2 py-1 border-r">
                              <EditableCell
                                value={form.watch(
                                  `activitesCritiques.${index}.solutionsContournement`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `activitesCritiques.${index}.solutionsContournement`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="Solutions..."
                              />
                            </td>
                            <td className="px-2 py-1 text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeActivite(index)}
                                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* SECTION 5: FOURNISSEURS EXTERNES (Multi-éléments) */}
        <Collapsible
          open={openSections.fournisseursExternes}
          onOpenChange={() => toggleSection("fournisseursExternes")}
        >
          <Card className="border-purple-200">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors bg-purple-50/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {openSections.fournisseursExternes ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    <CardTitle className="text-lg">
                      5. Fournisseurs Externes 🤝
                    </CardTitle>
                    <Badge variant="outline">
                      {fournisseursFields.length} fournisseurs
                    </Badge>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      appendFournisseur({
                        nom: "",
                        servicesOfferts: "",
                        isUniqueSupplier: false,
                        planContinuiteActivite: "non",
                        clauseSLA: "non",
                        rto: 0,
                        mtpd: 0,
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        appendFournisseur({
                          nom: "",
                          servicesOfferts: "",
                          isUniqueSupplier: false,
                          planContinuiteActivite: "non",
                          clauseSLA: "non",
                          rto: 0,
                          mtpd: 0,
                        });
                      }
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                {fournisseursFields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>
                      Aucun fournisseur externe. Cliquez sur &quot;Ajouter&quot;
                      pour commencer.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-2 py-2 text-left border-r w-8">
                            #
                          </th>
                          <th className="px-2 py-2 text-left border-r">
                            Nom *
                          </th>
                          <th className="px-2 py-2 text-left border-r">
                            Services Offerts
                          </th>
                          <th className="px-2 py-2 text-left border-r">
                            Contact
                          </th>
                          <th className="px-2 py-2 text-left border-r">
                            Téléphone
                          </th>
                          <th className="px-2 py-2 text-left border-r">
                            Email
                          </th>
                          <th className="px-2 py-2 text-left border-r w-32">
                            Zone Géographique
                          </th>
                          <th className="px-2 py-2 text-left border-r w-32">
                            Fournisseur Unique
                          </th>
                          <th className="px-2 py-2 text-left border-r w-24">
                            RTO (h) *
                          </th>
                          <th className="px-2 py-2 text-left border-r w-24">
                            MTPD (h) *
                          </th>
                          <th className="px-2 py-2 text-left border-r w-24">
                            Plan Continuité
                          </th>
                          <th className="px-2 py-2 text-left border-r w-24">
                            Clause SLA
                          </th>
                          <th className="px-2 py-2 w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {fournisseursFields.map((field, index) => (
                          <tr
                            key={field.id}
                            className="border-b hover:bg-accent/30"
                          >
                            <td className="px-2 py-1 border-r text-center text-muted-foreground">
                              {index + 1}
                            </td>
                            <td className="px-2 py-1 border-r">
                              <EditableCell
                                value={form.watch(
                                  `fournisseursExternes.${index}.nom`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `fournisseursExternes.${index}.nom`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="Nom du fournisseur"
                                required
                              />
                            </td>
                            <td className="px-2 py-1 border-r">
                              <EditableCell
                                value={form.watch(
                                  `fournisseursExternes.${index}.servicesOfferts`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `fournisseursExternes.${index}.servicesOfferts`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="Services..."
                              />
                            </td>
                            <td className="px-2 py-1 border-r">
                              <EditableCell
                                value={form.watch(
                                  `fournisseursExternes.${index}.contactNom`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `fournisseursExternes.${index}.contactNom`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="Nom contact"
                              />
                            </td>
                            <td className="px-2 py-1 border-r">
                              <EditableCell
                                value={form.watch(
                                  `fournisseursExternes.${index}.contactTelephone`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `fournisseursExternes.${index}.contactTelephone`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="Téléphone"
                              />
                            </td>
                            <td className="px-2 py-1 border-r">
                              <EditableCell
                                value={form.watch(
                                  `fournisseursExternes.${index}.contactEmail`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `fournisseursExternes.${index}.contactEmail`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="Email"
                              />
                            </td>
                            <td className="px-2 py-1 border-r">
                              <EditableCell
                                value={form.watch(
                                  `fournisseursExternes.${index}.zoneGeographique`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `fournisseursExternes.${index}.zoneGeographique`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="Zone..."
                              />
                            </td>
                            <td className="px-2 py-1 border-r">
                              <div className="flex items-center justify-center">
                                <input
                                  type="checkbox"
                                  checked={
                                    form.watch(
                                      `fournisseursExternes.${index}.isUniqueSupplier`
                                    ) || false
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      `fournisseursExternes.${index}.isUniqueSupplier`,
                                      e.target.checked
                                    )
                                  }
                                  className="h-4 w-4 cursor-pointer"
                                  title="Fournisseur unique"
                                  aria-label="Fournisseur unique"
                                />
                              </div>
                            </td>
                            <td className="px-2 py-1 border-r">
                              <EditableCell
                                value={form.watch(
                                  `fournisseursExternes.${index}.rto`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `fournisseursExternes.${index}.rto`,
                                    Number(val)
                                  )
                                }
                                type="number"
                                min={0}
                                required
                              />
                            </td>
                            <td className="px-2 py-1 border-r">
                              <EditableCell
                                value={form.watch(
                                  `fournisseursExternes.${index}.mtpd`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `fournisseursExternes.${index}.mtpd`,
                                    Number(val)
                                  )
                                }
                                type="number"
                                min={0}
                                required
                              />
                            </td>
                            <td className="px-2 py-1 border-r">
                              <EditableCell
                                value={form.watch(
                                  `fournisseursExternes.${index}.planContinuiteActivite`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `fournisseursExternes.${index}.planContinuiteActivite`,
                                    val as "oui" | "non"
                                  )
                                }
                                type="select"
                                options={[
                                  { value: "oui", label: "✓ Oui" },
                                  { value: "non", label: "✗ Non" },
                                ]}
                                required
                              />
                            </td>
                            <td className="px-2 py-1 border-r">
                              <EditableCell
                                value={form.watch(
                                  `fournisseursExternes.${index}.clauseSLA`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `fournisseursExternes.${index}.clauseSLA`,
                                    val as "oui" | "non"
                                  )
                                }
                                type="select"
                                options={[
                                  { value: "oui", label: "✓ Oui" },
                                  { value: "non", label: "✗ Non" },
                                ]}
                                required
                              />
                            </td>
                            <td className="px-2 py-1 text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFournisseur(index)}
                                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* SECTION 6: SYSTÈMES INFORMATIQUES / MES */}
        <Collapsible
          open={openSections.systemes}
          onOpenChange={() => toggleSection("systemes")}
        >
          <Card className="border-indigo-200">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors bg-indigo-50/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {openSections.systemes ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    <CardTitle className="text-lg">
                      6. Systèmes Informatiques / MES 💻
                    </CardTitle>
                    <Badge variant="outline">
                      {systemesFields.length} systèmes
                    </Badge>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      appendSysteme({
                        nom: "",
                        typeSysteme: "",
                        criticite: "medium",
                        sauvegardesEnPlace: "non",
                        rto: 0,
                        rpo: 0,
                        mtpd: 0,
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                {systemesFields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>
                      Aucun système. Cliquez sur &quot;Ajouter&quot; pour
                      commencer.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border text-xs">
                      <thead className="bg-muted">
                        <tr>
                          <th className="border p-1">#</th>
                          <th className="border p-1">Nom</th>
                          <th className="border p-1">Type</th>
                          <th className="border p-1">Criticité</th>
                          <th className="border p-1">RTO</th>
                          <th className="border p-1">RPO</th>
                          <th className="border p-1">MTPD</th>
                          <th className="border p-1">Solution de Repli</th>
                          <th className="border p-1">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {systemesFields.map((field, index) => (
                          <tr key={field.id}>
                            <td className="border p-1 text-center">
                              {index + 1}
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `systemesInformatiques.${index}.nom`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `systemesInformatiques.${index}.nom`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="Système"
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `systemesInformatiques.${index}.typeSysteme`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `systemesInformatiques.${index}.typeSysteme`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="ERP..."
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `systemesInformatiques.${index}.criticite`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `systemesInformatiques.${index}.criticite`,
                                    val as
                                      | "low"
                                      | "medium"
                                      | "high"
                                      | "critical"
                                  )
                                }
                                type="select"
                                options={[
                                  { value: "low", label: "Basse" },
                                  { value: "medium", label: "Moyenne" },
                                  { value: "high", label: "Haute" },
                                  { value: "critical", label: "Critique" },
                                ]}
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form
                                  .watch(`systemesInformatiques.${index}.rto`)
                                  ?.toString()}
                                onChange={(val) =>
                                  form.setValue(
                                    `systemesInformatiques.${index}.rto`,
                                    Number(val)
                                  )
                                }
                                type="number"
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form
                                  .watch(`systemesInformatiques.${index}.rpo`)
                                  ?.toString()}
                                onChange={(val) =>
                                  form.setValue(
                                    `systemesInformatiques.${index}.rpo`,
                                    Number(val)
                                  )
                                }
                                type="number"
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form
                                  .watch(`systemesInformatiques.${index}.mtpd`)
                                  ?.toString()}
                                onChange={(val) =>
                                  form.setValue(
                                    `systemesInformatiques.${index}.mtpd`,
                                    Number(val)
                                  )
                                }
                                type="number"
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `systemesInformatiques.${index}.solutionRepli`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `systemesInformatiques.${index}.solutionRepli`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="Solution..."
                                type="textarea"
                              />
                            </td>
                            <td className="border p-1 text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeSysteme(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* SECTION 7: INFRASTRUCTURES PHYSIQUES */}
        <Collapsible
          open={openSections.infrastructure}
          onOpenChange={() => toggleSection("infrastructure")}
        >
          <Card className="border-cyan-200">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors bg-cyan-50/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {openSections.infrastructure ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    <CardTitle className="text-lg">
                      7. Infrastructures Physiques 🏢
                    </CardTitle>
                    <Badge variant="outline">
                      {infrastructuresFields.length} infrastructures
                    </Badge>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      appendInfrastructure({
                        nom: "",
                        categorie: "autre",
                        possibiliteTravailDistance: "non",
                        criticite: "medium",
                        rto: 0,
                        mtpd: 0,
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                {infrastructuresFields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>
                      Aucune infrastructure. Cliquez sur &quot;Ajouter&quot;
                      pour commencer.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="border p-2">#</th>
                          <th className="border p-2">Nom</th>
                          <th className="border p-2">Catégorie</th>
                          <th className="border p-2">Criticité</th>
                          <th className="border p-2">RTO (h)</th>
                          <th className="border p-2">MTPD (h)</th>
                          <th className="border p-2">Solution de Repli</th>
                          <th className="border p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {infrastructuresFields.map((field, index) => (
                          <tr key={field.id}>
                            <td className="border p-1 text-center">
                              {index + 1}
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `infrastructuresPhysiques.${index}.nom`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `infrastructuresPhysiques.${index}.nom`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="Nom infrastructure"
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `infrastructuresPhysiques.${index}.categorie`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `infrastructuresPhysiques.${index}.categorie`,
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    String(val ?? "") as any
                                  )
                                }
                                placeholder="Bâtiment, Réseau..."
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `infrastructuresPhysiques.${index}.criticite`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `infrastructuresPhysiques.${index}.criticite`,
                                    val as
                                      | "low"
                                      | "medium"
                                      | "high"
                                      | "critical"
                                  )
                                }
                                type="select"
                                options={[
                                  { value: "low", label: "Basse" },
                                  { value: "medium", label: "Moyenne" },
                                  { value: "high", label: "Haute" },
                                  { value: "critical", label: "Critique" },
                                ]}
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form
                                  .watch(
                                    `infrastructuresPhysiques.${index}.rto`
                                  )
                                  ?.toString()}
                                onChange={(val) =>
                                  form.setValue(
                                    `infrastructuresPhysiques.${index}.rto`,
                                    Number(val)
                                  )
                                }
                                type="number"
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form
                                  .watch(
                                    `infrastructuresPhysiques.${index}.mtpd`
                                  )
                                  ?.toString()}
                                onChange={(val) =>
                                  form.setValue(
                                    `infrastructuresPhysiques.${index}.mtpd`,
                                    Number(val)
                                  )
                                }
                                type="number"
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `infrastructuresPhysiques.${index}.solutionRepli`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `infrastructuresPhysiques.${index}.solutionRepli`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="Solution..."
                                type="textarea"
                              />
                            </td>
                            <td className="border p-1 text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeInfrastructure(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* SECTION 8: PERSONNEL ET RÔLES */}
        <Collapsible
          open={openSections.personnel}
          onOpenChange={() => toggleSection("personnel")}
        >
          <Card className="border-amber-200">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors bg-amber-50/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {openSections.personnel ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    <CardTitle className="text-lg">
                      8. Personnel et Rôles 👥
                    </CardTitle>
                    <Badge variant="outline">{rolesFields.length} rôles</Badge>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      appendRole({
                        role: "",
                        effectif: 0,
                        competenceUnique: "non",
                        remplacable: "non",
                        formationNecessaire: "non",
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                {rolesFields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>
                      Aucun rôle. Cliquez sur &quot;Ajouter&quot; pour
                      commencer.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="border p-2">#</th>
                          <th className="border p-2">Rôle</th>
                          <th className="border p-2">Effectif</th>
                          <th className="border p-2">Tâches/Responsabilités</th>
                          <th className="border p-2">Compétence Unique?</th>
                          <th className="border p-2">Remplaçable?</th>
                          <th className="border p-2">Remplacé par</th>
                          <th className="border p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rolesFields.map((field, index) => (
                          <tr key={field.id}>
                            <td className="border p-1 text-center">
                              {index + 1}
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `rolesPersonnel.${index}.role`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `rolesPersonnel.${index}.role`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="Rôle"
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form
                                  .watch(`rolesPersonnel.${index}.effectif`)
                                  ?.toString()}
                                onChange={(val) =>
                                  form.setValue(
                                    `rolesPersonnel.${index}.effectif`,
                                    Number(val)
                                  )
                                }
                                type="number"
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `rolesPersonnel.${index}.tachesResponsabilites`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `rolesPersonnel.${index}.tachesResponsabilites`,
                                    String(val ?? "")
                                  )
                                }
                                type="textarea"
                                placeholder="Tâches..."
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `rolesPersonnel.${index}.competenceUnique`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `rolesPersonnel.${index}.competenceUnique`,
                                    val as "oui" | "non"
                                  )
                                }
                                type="select"
                                options={[
                                  { value: "oui", label: "Oui" },
                                  { value: "non", label: "Non" },
                                ]}
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `rolesPersonnel.${index}.remplacable`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `rolesPersonnel.${index}.remplacable`,
                                    val as "oui" | "non"
                                  )
                                }
                                type="select"
                                options={[
                                  { value: "oui", label: "Oui" },
                                  { value: "non", label: "Non" },
                                ]}
                              />
                            </td>
                            <td className="border p-1">
                              {form.watch(
                                `rolesPersonnel.${index}.remplacable`
                              ) === "oui" && (
                                <EditableCell
                                  value={form.watch(
                                    `rolesPersonnel.${index}.remplacePar`
                                  )}
                                  onChange={(val) =>
                                    form.setValue(
                                      `rolesPersonnel.${index}.remplacePar`,
                                      String(val ?? "")
                                    )
                                  }
                                  placeholder="Nom..."
                                />
                              )}
                            </td>
                            <td className="border p-1 text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeRole(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* SECTION 9A: ÉQUIPEMENTS INDUSTRIELS */}
        <Collapsible
          open={openSections.equipIndus}
          onOpenChange={() => toggleSection("equipIndus")}
        >
          <Card className="border-lime-200">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors bg-lime-50/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {openSections.equipIndus ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    <CardTitle className="text-lg">
                      9A. Équipements Industriels ⚙️
                    </CardTitle>
                    <Badge variant="outline">
                      {equipIndusFields.length} équipements
                    </Badge>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      appendEquipIndus({
                        designation: "",
                        possibiliteReaffectation: "non",
                        compatibiliteSecours: "non",
                        criticite: "medium",
                        rto: 0,
                        mtpd: 0,
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                {equipIndusFields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>
                      Aucun équipement. Cliquez sur &quot;Ajouter&quot; pour
                      commencer.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="border p-2">#</th>
                          <th className="border p-2">Désignation</th>
                          <th className="border p-2">Modèle</th>
                          <th className="border p-2">Criticité</th>
                          <th className="border p-2">RTO (h)</th>
                          <th className="border p-2">MTPD (h)</th>
                          <th className="border p-2">Solution de Repli</th>
                          <th className="border p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {equipIndusFields.map((field, index) => (
                          <tr key={field.id}>
                            <td className="border p-1 text-center">
                              {index + 1}
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `equipementsIndustriels.${index}.designation`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `equipementsIndustriels.${index}.designation`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="Équipement"
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `equipementsIndustriels.${index}.modeleReference`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `equipementsIndustriels.${index}.modeleReference`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="Modèle"
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `equipementsIndustriels.${index}.criticite`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `equipementsIndustriels.${index}.criticite`,
                                    val as
                                      | "low"
                                      | "medium"
                                      | "high"
                                      | "critical"
                                  )
                                }
                                type="select"
                                options={[
                                  { value: "low", label: "Basse" },
                                  { value: "medium", label: "Moyenne" },
                                  { value: "high", label: "Haute" },
                                  { value: "critical", label: "Critique" },
                                ]}
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form
                                  .watch(`equipementsIndustriels.${index}.rto`)
                                  ?.toString()}
                                onChange={(val) =>
                                  form.setValue(
                                    `equipementsIndustriels.${index}.rto`,
                                    Number(val)
                                  )
                                }
                                type="number"
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form
                                  .watch(`equipementsIndustriels.${index}.mtpd`)
                                  ?.toString()}
                                onChange={(val) =>
                                  form.setValue(
                                    `equipementsIndustriels.${index}.mtpd`,
                                    Number(val)
                                  )
                                }
                                type="number"
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `equipementsIndustriels.${index}.solutionRepli`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `equipementsIndustriels.${index}.solutionRepli`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="Solution..."
                                type="textarea"
                              />
                            </td>
                            <td className="border p-1 text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeEquipIndus(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* SECTION 9B: ÉQUIPEMENTS BUREAUTIQUES */}
        <Collapsible
          open={openSections.equipBuro}
          onOpenChange={() => toggleSection("equipBuro")}
        >
          <Card className="border-sky-200">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors bg-sky-50/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {openSections.equipBuro ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    <CardTitle className="text-lg">
                      9B. Équipements Bureautiques 🖥️
                    </CardTitle>
                    <Badge variant="outline">
                      {equipBuroFields.length} équipements
                    </Badge>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      appendEquipBuro({
                        type: "",
                        quantiteActuelle: 0,
                        possibiliteReaffectation: "non",
                        criticite: "medium",
                        rto: 0,
                        mtpd: 0,
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                {equipBuroFields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>
                      Aucun équipement. Cliquez sur &quot;Ajouter&quot; pour
                      commencer.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="border p-2">#</th>
                          <th className="border p-2">Type</th>
                          <th className="border p-2">Quantité</th>
                          <th className="border p-2">Qté Requise en Crise</th>
                          <th className="border p-2">Criticité</th>
                          <th className="border p-2">RTO (h)</th>
                          <th className="border p-2">MTPD (h)</th>
                          <th className="border p-2">Solution de Repli</th>
                          <th className="border p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {equipBuroFields.map((field, index) => (
                          <tr key={field.id}>
                            <td className="border p-1 text-center">
                              {index + 1}
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `equipementsBureautiques.${index}.type`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `equipementsBureautiques.${index}.type`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="PC, Imprimante..."
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form
                                  .watch(
                                    `equipementsBureautiques.${index}.quantiteActuelle`
                                  )
                                  ?.toString()}
                                onChange={(val) =>
                                  form.setValue(
                                    `equipementsBureautiques.${index}.quantiteActuelle`,
                                    Number(val)
                                  )
                                }
                                type="number"
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form
                                  .watch(
                                    `equipementsBureautiques.${index}.quantiteRequiseApresIncident`
                                  )
                                  ?.toString()}
                                onChange={(val) =>
                                  form.setValue(
                                    `equipementsBureautiques.${index}.quantiteRequiseApresIncident`,
                                    Number(val)
                                  )
                                }
                                type="number"
                                placeholder="Qté crise"
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `equipementsBureautiques.${index}.criticite`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `equipementsBureautiques.${index}.criticite`,
                                    val as
                                      | "low"
                                      | "medium"
                                      | "high"
                                      | "critical"
                                  )
                                }
                                type="select"
                                options={[
                                  { value: "low", label: "Basse" },
                                  { value: "medium", label: "Moyenne" },
                                  { value: "high", label: "Haute" },
                                  { value: "critical", label: "Critique" },
                                ]}
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form
                                  .watch(`equipementsBureautiques.${index}.rto`)
                                  ?.toString()}
                                onChange={(val) =>
                                  form.setValue(
                                    `equipementsBureautiques.${index}.rto`,
                                    Number(val)
                                  )
                                }
                                type="number"
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form
                                  .watch(
                                    `equipementsBureautiques.${index}.mtpd`
                                  )
                                  ?.toString()}
                                onChange={(val) =>
                                  form.setValue(
                                    `equipementsBureautiques.${index}.mtpd`,
                                    Number(val)
                                  )
                                }
                                type="number"
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `equipementsBureautiques.${index}.solutionRepli`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `equipementsBureautiques.${index}.solutionRepli`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="Solution..."
                                type="textarea"
                              />
                            </td>
                            <td className="border p-1 text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeEquipBuro(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* SECTION 10: DOCUMENTATIONS CRITIQUES */}
        <Collapsible
          open={openSections.docs}
          onOpenChange={() => toggleSection("docs")}
        >
          <Card className="border-rose-200">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors bg-rose-50/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {openSections.docs ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    <CardTitle className="text-lg">
                      10. Documentations Critiques 📚
                    </CardTitle>
                    <Badge variant="outline">
                      {docsFields.length} documents
                    </Badge>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      appendDoc({
                        type: "",
                        format: "numerique",
                        necessaireApresIncident: "non",
                        possibiliteRemplacement: "non",
                        criticite: "medium",
                        rto: 0,
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                {docsFields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>
                      Aucune documentation. Cliquez sur &quot;Ajouter&quot; pour
                      commencer.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="border p-2">#</th>
                          <th className="border p-2">Type</th>
                          <th className="border p-2">Format</th>
                          <th className="border p-2">Emplacement principal</th>
                          <th className="border p-2">Criticité</th>
                          <th className="border p-2">RTO (h)</th>
                          <th className="border p-2">Solution de Repli</th>
                          <th className="border p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {docsFields.map((field, index) => (
                          <tr key={field.id}>
                            <td className="border p-1 text-center">
                              {index + 1}
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `documentationsCritiques.${index}.type`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `documentationsCritiques.${index}.type`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="Type doc"
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `documentationsCritiques.${index}.format`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `documentationsCritiques.${index}.format`,
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    String(val ?? "") as any
                                  )
                                }
                                placeholder="Papier, PDF..."
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `documentationsCritiques.${index}.emplacementPrincipal`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `documentationsCritiques.${index}.emplacementPrincipal`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="Emplacement"
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `documentationsCritiques.${index}.criticite`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `documentationsCritiques.${index}.criticite`,
                                    val as
                                      | "low"
                                      | "medium"
                                      | "high"
                                      | "critical"
                                  )
                                }
                                type="select"
                                options={[
                                  { value: "low", label: "Basse" },
                                  { value: "medium", label: "Moyenne" },
                                  { value: "high", label: "Haute" },
                                  { value: "critical", label: "Critique" },
                                ]}
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form
                                  .watch(`documentationsCritiques.${index}.rto`)
                                  ?.toString()}
                                onChange={(val) =>
                                  form.setValue(
                                    `documentationsCritiques.${index}.rto`,
                                    Number(val)
                                  )
                                }
                                type="number"
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `documentationsCritiques.${index}.solutionRepli`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `documentationsCritiques.${index}.solutionRepli`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="Solution..."
                                type="textarea"
                              />
                            </td>
                            <td className="border p-1 text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeDoc(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* SECTION 5: OBLIGATIONS LÉGALES ET RÉGLEMENTAIRES */}
        <Collapsible
          open={openSections.legal}
          onOpenChange={() => toggleSection("legal")}
        >
          <Card className="border-purple-200">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors bg-purple-50/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {openSections.legal ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    <CardTitle className="text-lg">
                      5. Cadre Légal et Réglementaire ⚖️
                    </CardTitle>
                    <Badge variant="outline">
                      {obligationsFields.length} obligations
                    </Badge>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      appendObligation({
                        domaine: "",
                        obligationLegale: "",
                        reference: "",
                        autoriteRegulation: "",
                        details: "",
                        consequencesNonRespect: "",
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                {obligationsFields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>
                      Aucune obligation légale. Cliquez sur &quot;Ajouter&quot;
                      pour commencer.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="border p-2 w-10">#</th>
                          <th className="border p-2">Domaine</th>
                          <th className="border p-2">Obligation Légale</th>
                          <th className="border p-2">Référence</th>
                          <th className="border p-2">Autorité</th>
                          <th className="border p-2">Détails</th>
                          <th className="border p-2">Conséquences</th>
                          <th className="border p-2 w-20">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {obligationsFields.map((field, index) => (
                          <tr key={field.id} className="hover:bg-accent/20">
                            <td className="border p-1 text-center">
                              {index + 1}
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `obligationsLegales.${index}.domaine`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `obligationsLegales.${index}.domaine`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="Ex: Santé, Sécurité..."
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `obligationsLegales.${index}.obligationLegale`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `obligationsLegales.${index}.obligationLegale`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="Obligation..."
                                type="textarea"
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `obligationsLegales.${index}.reference`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `obligationsLegales.${index}.reference`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="Référence"
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `obligationsLegales.${index}.autoriteRegulation`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `obligationsLegales.${index}.autoriteRegulation`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="Organisme"
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `obligationsLegales.${index}.details`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `obligationsLegales.${index}.details`,
                                    String(val ?? "")
                                  )
                                }
                                type="textarea"
                                placeholder="Détails..."
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `obligationsLegales.${index}.consequencesNonRespect`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `obligationsLegales.${index}.consequencesNonRespect`,
                                    String(val ?? "")
                                  )
                                }
                                type="textarea"
                                placeholder="Amendes..."
                              />
                            </td>
                            <td className="border p-1 text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeObligation(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Boutons de soumission */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg z-50">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleAISuggestions}
                disabled={isLoading}
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Auto-complétion par IA 🤖
              </Button>
            </div>
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                <X className="mr-2 h-4 w-4" />
                Annuler
              </Button>
              <Button 
                type="button" 
                disabled={isLoading} 
                size="lg"
                onClick={handleManualSubmit}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {processId ? "Mettre à jour" : "Créer le processus"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Assistant de confirmation des données extraites */}
      <ConfirmationAssistant
        isOpen={showConfirmationAssistant}
        onClose={() => setShowConfirmationAssistant(false)}
        extractedFields={fieldsToReview}
        title={assistantTitle}
        description={assistantDescription}
        onComplete={(confirmedData) => {
          // Appliquer les données confirmées au formulaire (ignorer les valeurs vides)
          let filledCount = 0;

          // Liste des champs qui sont des tableaux (à prendre depuis originalAIData)
          const arrayFieldNames = [
            "activitesCritiques",
            "fournisseursExternes",
            "systemesInformatiques",
            "infrastructuresPhysiques",
            "rolesPersonnel",
            "equipementsIndustriels",
            "equipementsBureautiques",
            "documentationsCritiques",
            "obligationsLegales",
          ];

          console.log("📝 Données confirmées reçues:", confirmedData);
          console.log("📦 Données IA originales:", originalAIData);

          Object.entries(confirmedData).forEach(([key, value]) => {
            console.log(`🔍 Traitement du champ: ${key}`, {
              value,
              type: typeof value,
            });

            // Pour les tableaux, prendre les données JSON originales au lieu du texte formaté
            if (
              arrayFieldNames.includes(key) &&
              originalAIData &&
              Array.isArray(originalAIData[key as keyof ExtractedProcessData])
            ) {
              const arrayData = originalAIData[
                key as keyof ExtractedProcessData
              ] as unknown as unknown[];
              if (arrayData.length > 0) {
                form.setValue(
                  key as Path<ProcessFormValues>,
                  arrayData as never
                );
                filledCount++;
                console.log(
                  `✅ Tableau ${key} appliqué:`,
                  arrayData.length,
                  "éléments"
                );
              }
              return;
            }

            // Pour les champs simples, vérifier si la valeur n'est pas vide
            const isNotEmpty =
              value !== null &&
              value !== undefined &&
              value !== "" &&
              String(value).trim() !== "";

            if (isNotEmpty) {
              console.log(`✅ Application du champ ${key}:`, value);
              form.setValue(key as Path<ProcessFormValues>, value as never);
              filledCount++;
            } else {
              console.log(`⚠️ Champ ${key} ignoré (vide ou null)`);
            }
          });

          const totalFields = fieldsToReview.length;
          const emptyCount = Object.keys(confirmedData).length - filledCount;
          const rejectedCount = totalFields - Object.keys(confirmedData).length;

          toast.success("✅ Validation terminée !", {
            description: `${filledCount} champs remplis${
              emptyCount > 0 ? `, ${emptyCount} vides ignorés` : ""
            }${
              rejectedCount > 0 ? `, ${rejectedCount} rejetés` : ""
            }. Vérifiez le formulaire avant d'enregistrer.`,
          });

          setShowConfirmationAssistant(false);

          // Ouvrir toutes les sections pour voir les données
          setOpenSections({
            general: true,
            responsable: true,
            criticite: true,
            impacts: true,
            dependencies: true,
            scope: true,
            activitesCritiques: true,
            fournisseursExternes: true,
            legal: true,
            systemes: true,
            infrastructure: true,
            personnel: true,
            equipIndus: true,
            equipBuro: true,
            docs: true,
          });
        }}
      />
    </div>
  );
}
