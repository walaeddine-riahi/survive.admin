"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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

  // États pour les sections collapsibles
  const [openSections, setOpenSections] = useState({
    general: true,
    responsable: true,
    criticite: true,
    impacts: true,
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
      name: initialData?.name || "Processus de Production - Ligne A",
      description:
        initialData?.description ||
        "Processus critique de fabrication des produits pharmaceutiques sur la ligne de production A",
      department: initialData?.department || "Production",
      location: initialData?.location || "Usine Principale - Bâtiment B",
      factoryId: initialData?.factoryId || factories[0]?.id || "",
      processOwner: initialData?.processOwner || "Ahmed Ben Salem",
      ownerRole: initialData?.ownerRole || "Responsable Production",
      ownerEmail: initialData?.ownerEmail || "ahmed.bensalem@entreprise.com",
      ownerPhone: initialData?.ownerPhone || "+216 71 234 567",
      impact:
        initialData?.impact ||
        "Arrêt complet de la production, perte de revenus de 50 000 DT/jour",
      criticality: initialData?.criticality || "CRITICAL",
      rto: initialData?.rto || 4,
      mtpd: initialData?.mtpd || 8,
      rpo: initialData?.rpo || 2,
      mbco: initialData?.mbco || "12 heures maximum avant impact client",
      criticalTimes:
        initialData?.criticalTimes ||
        "Fin de mois (clôture comptable)\nHaute saison (Juin-Septembre)\nPériode de Ramadan",
      financialImpact:
        initialData?.financialImpact ||
        "Perte de chiffre d'affaires: 50 000 DT/jour\nPénalités contractuelles: 10 000 DT/jour\nCoûts de récupération: 20 000 DT",
      operationalImpact:
        initialData?.operationalImpact ||
        "Arrêt de la ligne de production\nRetard des livraisons clients\nSurcharge des autres lignes de production\nPerte de productivité: 30%",
      reputationImpact:
        initialData?.reputationImpact ||
        "Perte de confiance des clients\nImpact sur l'image de marque\nRisque de perte de parts de marché\nMécontentement des partenaires",
      operationalCapacityImpact:
        initialData?.operationalCapacityImpact ||
        "Réduction de capacité de 40%\nRetards de livraison: 5-7 jours\nImpossibilité de respecter les SLA\nAccumulation du backlog",
      mainFunctionality:
        initialData?.mainFunctionality ||
        "Assurer la production continue des médicaments avec respect des normes GMP et des délais de livraison aux distributeurs",
      productDependencies:
        initialData?.productDependencies ||
        "Médicament A | Dépendance totale - production exclusive\nMédicament B | Dépendance partielle - backup sur Ligne C\nMédicament C | Dépendance critique - 80% de la production",
      interServiceDependencies:
        initialData?.interServiceDependencies ||
        "Maintenance | Support technique quotidien et préventif\nQualité | Contrôle qualité obligatoire à chaque batch\nLogistique | Approvisionnement matières premières\nIT | Système MES pour traçabilité",
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
      activitesCritiques: initialData?.activitesCritiques || [
        {
          nom: "Préparation des matières premières",
          criticite: "critical" as const,
          delai: "Immédiat",
          rto: 2,
          mtpd: 4,
          rpo: 1,
          mbco: "Aucune production possible sans cette activité",
          impactsOperationnels: "Blocage complet de la chaîne",
          impactsReglementaires: "Non-conformité GMP",
          impactsImage: "Perte de confiance client",
        },
        {
          nom: "Contrôle qualité en cours de production",
          criticite: "high" as const,
          delai: "4 heures",
          rto: 4,
          mtpd: 8,
          rpo: 2,
          mbco: "Risque de non-conformité produits",
          impactsOperationnels: "Arrêt ligne si défaut détecté",
          impactsReglementaires: "Sanctions réglementaires possibles",
          impactsImage: "Risque rappel produits",
        },
      ],
      fournisseursExternes: initialData?.fournisseursExternes || [
        {
          nom: "PharmaChem SARL",
          servicesOfferts: "Matières premières actives",
          contactNom: "Mohamed Trabelsi",
          contactTelephone: "+216 71 123 456",
          contactEmail: "contact@pharmachem.tn",
          zoneGeographique: "Tunisie - Sousse",
          rto: 24,
          mtpd: 48,
          planContinuiteActivite: "oui" as const,
          clauseSLA: "oui" as const,
        },
        {
          nom: "PackTech International",
          servicesOfferts: "Emballages et étiquettes",
          contactNom: "Salah Ben Ali",
          contactTelephone: "+216 71 987 654",
          contactEmail: "s.benali@packtech.com",
          zoneGeographique: "Tunisie - Tunis",
          rto: 48,
          mtpd: 96,
          planContinuiteActivite: "non" as const,
          clauseSLA: "oui" as const,
        },
      ],
      obligationsLegales: initialData?.obligationsLegales || [
        {
          nature: "Bonnes Pratiques de Fabrication (GMP)",
          reference: "Directive 2003/94/CE",
          autoriteRegulation:
            "Ministère de la Santé - Direction de la Pharmacie",
          details:
            "Respect obligatoire des normes GMP pour la production pharmaceutique",
          consequencesNonRespect:
            "Suspension de l'autorisation de production\nAmendes: 50 000 - 500 000 DT\nRetrait produits du marché",
        },
        {
          nature: "ISO 9001:2015",
          reference: "ISO 9001:2015",
          autoriteRegulation: "INNORPI",
          details: "Système de management de la qualité certifié",
          consequencesNonRespect:
            "Perte de certification\nPerte de marchés publics\nImpact réputation",
        },
      ],
      systemesInformatiques: initialData?.systemesInformatiques || [
        {
          nom: "SAP ERP Production",
          typeSysteme: "ERP",
          criticite: "critical" as const,
          impactIndisponibilite: "Arrêt complet gestion production",
          activitesAssociees: "Planification, suivi production, traçabilité",
          sauvegardesEnPlace: "oui" as const,
          rto: 4,
          rpo: 1,
          mtpd: 8,
          solutionsContournement: "Mode dégradé manuel avec formulaires papier",
          incidentsAnterieurs: "Panne serveur 15/03/2024 - 2h d'arrêt",
        },
        {
          nom: "Siemens SCADA",
          typeSysteme: "SCADA/Supervision",
          criticite: "high" as const,
          impactIndisponibilite: "Perte de supervision temps réel",
          activitesAssociees: "Supervision équipements, alarmes",
          sauvegardesEnPlace: "oui" as const,
          rto: 2,
          rpo: 0.5,
          mtpd: 4,
          solutionsContournement: "Supervision locale sur automates",
          incidentsAnterieurs: "Aucun incident majeur",
        },
      ],
      infrastructuresPhysiques: initialData?.infrastructuresPhysiques || [
        {
          nom: "Alimentation électrique principale",
          categorie: "electricite" as const,
          criticite: "critical" as const,
          rto: 0.5,
          mtpd: 2,
          possibiliteTravailDistance: "non" as const,
          alternativesDisponibles:
            "Groupe électrogène 500 kVA\nUPS 100 kVA pour équipements critiques",
        },
        {
          nom: "Système de climatisation salle blanche",
          categorie: "climatisation" as const,
          criticite: "high" as const,
          rto: 2,
          mtpd: 4,
          possibiliteTravailDistance: "non" as const,
          alternativesDisponibles:
            "Système de climatisation redondant\nProcédure arrêt production si température > 25°C",
        },
      ],
      rolesPersonnel: initialData?.rolesPersonnel || [
        {
          intituleRole: "Opérateur de production ligne A",
          nombrePersonnes: 8,
          tachesResponsabilites:
            "Conduite ligne production\nContrôles en cours\nEnregistrement données",
          competencesRequises:
            "Formation GMP\nHabilitation machines\nConnaissances produits",
          estCritique: "oui" as const,
          delaiDisponibiliteNecessaire: "Immédiat (équipes 3x8)",
          possibiliteRemplacement: "oui" as const,
          personneRemplacante: "Opérateurs formés des lignes B et C",
          formationNecessaire: "oui" as const,
          dureeFormation: "2 semaines formation + 1 mois tutorat",
          solutionsContournement: "Polyvalence opérateurs autres lignes",
        },
        {
          intituleRole: "Technicien maintenance",
          nombrePersonnes: 3,
          tachesResponsabilites:
            "Maintenance préventive\nDépannage\nRéglages machines",
          competencesRequises:
            "Électromécanique\nAutomatisme\nConnaissance équipements",
          estCritique: "oui" as const,
          delaiDisponibiliteNecessaire: "Moins de 2 heures",
          possibiliteRemplacement: "oui" as const,
          personneRemplacante: "Techniciens équipe centrale",
          formationNecessaire: "oui" as const,
          dureeFormation: "3 mois",
          solutionsContournement: "Appel technicien astreinte",
        },
      ],
      equipementsIndustriels: initialData?.equipementsIndustriels || [
        {
          designation: "Mélangeur principal V-200",
          modeleReference: "GERICKE GCM 200",
          tachesRealise: "Mélange matières premières poudre",
          criticite: "critical" as const,
          rto: 8,
          mtpd: 24,
          possibiliteReaffectation: "non" as const,
          solutionsContournement:
            "Utilisation mélangeur ligne B (capacité réduite)",
          tension: "400V",
          typeCourant: "Triphasé",
          puissanceNominale: "15 kW",
          consommationJournaliere: "120 kWh",
          compatibiliteSecours: "oui" as const,
          alternativesDisponibles: "Mélangeur ligne B (50% capacité)",
        },
        {
          designation: "Comprimé presse rotative PR-45",
          modeleReference: "FETTE 3090",
          tachesRealise: "Compression comprimés",
          criticite: "critical" as const,
          rto: 12,
          mtpd: 48,
          possibiliteReaffectation: "non" as const,
          solutionsContournement: "Sous-traitance externe",
          tension: "400V",
          typeCourant: "Triphasé",
          puissanceNominale: "22 kW",
          consommationJournaliere: "176 kWh",
          compatibiliteSecours: "oui" as const,
          alternativesDisponibles: "Ligne C (30% capacité)",
        },
      ],
      equipementsBureautiques: initialData?.equipementsBureautiques || [
        {
          type: "PC de supervision production",
          quantiteActuelle: 4,
          tachesUtilisation:
            "Supervision temps réel\nSaisie données production",
          criticite: "high" as const,
          rto: 4,
          mtpd: 8,
          quantiteRequiseApresIncident: 2,
          possibiliteReaffectation: "oui" as const,
          fournisseur: "Dell Technologies",
          solutionsContournement: "PC portables de secours (3 unités)",
        },
        {
          type: "Imprimante étiquettes production",
          quantiteActuelle: 2,
          tachesUtilisation: "Impression étiquettes produits et lots",
          criticite: "critical" as const,
          rto: 2,
          mtpd: 4,
          quantiteRequiseApresIncident: 1,
          possibiliteReaffectation: "oui" as const,
          fournisseur: "Zebra Technologies",
          solutionsContournement:
            "Imprimante backup + étiquettes pré-imprimées",
        },
      ],
      documentationsCritiques: initialData?.documentationsCritiques || [
        {
          type: "Procédures de fabrication (Batch Records)",
          format: "les_deux" as const,
          emplacementPrincipal:
            "Serveur documentaire GED + Classeur salle production",
          emplacementsSecondaires: "Backup cloud + Coffre-fort archives",
          necessaireApresIncident: "oui" as const,
          rto: 1,
          criticite: "critical" as const,
          modalitesAcces: "Accès GED + copies papier sécurisées",
          possibiliteRemplacement: "oui" as const,
          procedureRecuperation:
            "Impression depuis GED ou utilisation backup cloud",
          responsable: "Responsable Qualité",
          notes: "Documents validés et approuvés - versions contrôlées",
        },
        {
          type: "Plans de maintenance préventive",
          format: "numerique" as const,
          emplacementPrincipal: "Serveur maintenance GMAO",
          emplacementsSecondaires: "Backup quotidien sur NAS",
          necessaireApresIncident: "oui" as const,
          rto: 4,
          criticite: "high" as const,
          modalitesAcces: "Logiciel GMAO - accès réseau",
          possibiliteRemplacement: "oui" as const,
          procedureRecuperation: "Restauration depuis backup NAS",
          responsable: "Chef maintenance",
          notes: "Historique interventions critique pour reprise",
        },
      ],
    },
  });

  // Field arrays pour les multi-éléments
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

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <Badge variant="secondary">4 champs</Badge>
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
                    <Badge variant="secondary">5 champs</Badge>
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <table className="w-full border">
                  <tbody>
                    <TableRow label="Périodes critiques">
                      <EditableCell
                        value={form.watch("criticalTimes")}
                        onChange={(val) =>
                          form.setValue("criticalTimes", String(val ?? ""))
                        }
                        type="textarea"
                        placeholder="Ex: Fin de mois, haute saison..."
                      />
                    </TableRow>
                    <TableRow label="Impacts financiers">
                      <EditableCell
                        value={form.watch("financialImpact")}
                        onChange={(val) =>
                          form.setValue("financialImpact", String(val ?? ""))
                        }
                        type="textarea"
                        placeholder="Pertes de revenus, coûts de récupération, pénalités..."
                      />
                    </TableRow>
                    <TableRow label="Impacts opérationnels">
                      <EditableCell
                        value={form.watch("operationalImpact")}
                        onChange={(val) =>
                          form.setValue("operationalImpact", String(val ?? ""))
                        }
                        type="textarea"
                        placeholder="Arrêts, ralentissements, dysfonctionnements..."
                      />
                    </TableRow>
                    <TableRow label="Impacts sur la réputation">
                      <EditableCell
                        value={form.watch("reputationImpact")}
                        onChange={(val) =>
                          form.setValue("reputationImpact", String(val ?? ""))
                        }
                        type="textarea"
                        placeholder="Image de marque, confiance clients, médias..."
                      />
                    </TableRow>
                    <TableRow label="Retards / Capacité opérationnelle">
                      <EditableCell
                        value={form.watch("operationalCapacityImpact")}
                        onChange={(val) =>
                          form.setValue(
                            "operationalCapacityImpact",
                            String(val ?? "")
                          )
                        }
                        type="textarea"
                        placeholder="Impact sur les délais, SLA, capacité de production..."
                      />
                    </TableRow>
                  </tbody>
                </table>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* SECTION 3: PÉRIMÈTRE ET DÉPENDANCES */}
        <Collapsible
          open={openSections.scope}
          onOpenChange={() => toggleSection("scope")}
        >
          <Card className="border-teal-200">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors bg-teal-50/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {openSections.scope ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    <CardTitle className="text-lg">
                      3. Périmètre et Dépendances 🔗
                    </CardTitle>
                    <Badge variant="secondary">3 champs</Badge>
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <table className="w-full border">
                  <tbody>
                    <TableRow label="Fonctionnalité principale / Objectif">
                      <EditableCell
                        value={form.watch("mainFunctionality")}
                        onChange={(val) =>
                          form.setValue("mainFunctionality", String(val ?? ""))
                        }
                        type="textarea"
                        placeholder="Quel est l'objectif principal de ce processus ?"
                      />
                    </TableRow>
                    <TableRow label="Dépendances Produits/Services">
                      <EditableCell
                        value={form.watch("productDependencies")}
                        onChange={(val) =>
                          form.setValue(
                            "productDependencies",
                            String(val ?? "")
                          )
                        }
                        type="textarea"
                        placeholder="Quels produits/services dépendent de ce processus ? Format: Produit | Type de dépendance (séparez par des lignes)"
                      />
                    </TableRow>
                    <TableRow label="Dépendances Interservices">
                      <EditableCell
                        value={form.watch("interServiceDependencies")}
                        onChange={(val) =>
                          form.setValue(
                            "interServiceDependencies",
                            String(val ?? "")
                          )
                        }
                        type="textarea"
                        placeholder="Quels départements/fonctions doivent soutenir ce processus ? Format: Département | Type de soutien (séparez par des lignes)"
                      />
                    </TableRow>
                  </tbody>
                </table>
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
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
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
                  >
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </Button>
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
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      appendFournisseur({
                        nom: "",
                        servicesOfferts: "",
                        planContinuiteActivite: "non",
                        clauseSLA: "non",
                        rto: 0,
                        mtpd: 0,
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </Button>
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
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
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
                  </Button>
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
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
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
                  </Button>
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
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      appendRole({
                        intituleRole: "",
                        nombrePersonnes: 0,
                        estCritique: "non",
                        possibiliteRemplacement: "non",
                        formationNecessaire: "non",
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </Button>
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
                          <th className="border p-2">Intitulé</th>
                          <th className="border p-2">Nombre</th>
                          <th className="border p-2">Tâches critiques</th>
                          <th className="border p-2">Compétences</th>
                          <th className="border p-2">Critique?</th>
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
                                  `rolesPersonnel.${index}.intituleRole`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `rolesPersonnel.${index}.intituleRole`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="Rôle"
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form
                                  .watch(
                                    `rolesPersonnel.${index}.nombrePersonnes`
                                  )
                                  ?.toString()}
                                onChange={(val) =>
                                  form.setValue(
                                    `rolesPersonnel.${index}.nombrePersonnes`,
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
                                  `rolesPersonnel.${index}.competencesRequises`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `rolesPersonnel.${index}.competencesRequises`,
                                    String(val ?? "")
                                  )
                                }
                                type="textarea"
                                placeholder="Compétences..."
                              />
                            </td>
                            <td className="border p-1">
                              <EditableCell
                                value={form.watch(
                                  `rolesPersonnel.${index}.estCritique`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `rolesPersonnel.${index}.estCritique`,
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
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
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
                  </Button>
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
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
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
                  </Button>
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
                          <th className="border p-2">Criticité</th>
                          <th className="border p-2">RTO (h)</th>
                          <th className="border p-2">MTPD (h)</th>
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
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
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
                  </Button>
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
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      appendObligation({
                        nature: "",
                        reference: "",
                        autoriteRegulation: "",
                        details: "",
                        consequencesNonRespect: "",
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </Button>
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
                          <th className="border p-2">Nature</th>
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
                                  `obligationsLegales.${index}.nature`
                                )}
                                onChange={(val) =>
                                  form.setValue(
                                    `obligationsLegales.${index}.nature`,
                                    String(val ?? "")
                                  )
                                }
                                placeholder="Ex: Norme ISO..."
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
              {isLoading
                ? "Enregistrement..."
                : processId
                ? "Mettre à jour"
                : "Créer le processus"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
