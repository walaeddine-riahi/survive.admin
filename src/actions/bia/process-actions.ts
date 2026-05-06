"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { z } from "zod";
import {
  activiteCritiqueSchema,
  fournisseurExterneSchema,
  obligationLegaleSchema,
  systemeInformatiqueSchema,
  infrastructurePhysiqueSchema,
  rolePersonnelSchema,
  equipementIndustrielSchema,
  equipementBureautiqueSchema,
  documentationCritiqueSchema,
} from "@/lib/validations/process-schema";

// Types pour les éléments des arrays JSON
type ActiviteCritique = z.infer<typeof activiteCritiqueSchema>;
type FournisseurExterne = z.infer<typeof fournisseurExterneSchema>;
type ObligationLegale = z.infer<typeof obligationLegaleSchema>;
type SystemeInformatique = z.infer<typeof systemeInformatiqueSchema>;
type InfrastructurePhysique = z.infer<typeof infrastructurePhysiqueSchema>;
type RolePersonnel = z.infer<typeof rolePersonnelSchema>;
type EquipementIndustriel = z.infer<typeof equipementIndustrielSchema>;
type EquipementBureautique = z.infer<typeof equipementBureautiqueSchema>;
type DocumentationCritique = z.infer<typeof documentationCritiqueSchema>;

// Type pour la création/mise à jour d'un processus
type ProcessInput = {
  // Informations de base
  id?: string;
  name: string;
  description?: string | null;
  department?: string | null;
  location?: string | null;
  factoryId?: string; // ID de l'usine

  // Responsable du processus
  processOwner?: string | null;
  ownerRole?: string | null;
  ownerEmail?: string | null;
  ownerPhone?: string | null;

  // Responsables intérimaires (JSON array)
  interimManagers?: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    isActive: boolean;
  }>;

  // Impacts structurés (JSON array)
  impacts?: Array<{
    id: string;
    type: string;
    level: string;
    hasImpact: boolean;
    description: string;
  }>;

  // Dépendances structurées (JSON array)
  dependencies?: Array<{
    id: string;
    processName: string;
    department: string;
    supportType: string;
    reason: string;
    dependencyType: string;
  }>;

  // Relations
  responsibles?: Array<{
    id?: string;
    name: string;
    role: string;
    phone?: string | null;
    email?: string | null;
  }>;

  activities?: Array<{
    id?: string;
    name: string;
    description?: string | null;
  }>;

  applications?: Array<{
    id?: string;
    name: string;
    description?: string | null;
    criticality: string;
  }>;

  infrastructures?: Array<{
    id?: string;
    type: string;
    description: string;
    criticality: string;
  }>;

  industrialEquipmentList?: Array<{
    id?: string;
    name: string;
    description?: string | null;
  }>;

  officeEquipmentList?: Array<{
    id?: string;
    name: string;
    description?: string | null;
  }>;

  documentations?: Array<{
    id?: string;
    name: string;
    description?: string | null;
    location: string;
  }>;

  personnels?: Array<{
    id?: string;
    name: string;
    role: string;
    skills: string;
  }>;

  suppliers?: Array<{
    id?: string;
    name: string;
    service: string;
    contact: string;
  }>;

  legalRequirements?: Array<{
    id?: string;
    name: string;
    description: string;
    reference: string;
  }>;

  // Analyse d'impact
  impact?: string | null;
  criticality?: string;
  rto?: number;
  mtpd?: number;
  rpo?: number;
  mbco?: string;
  criticalTimes?: string | null;
  financialImpact?: string | null;
  operationalImpact?: string | null;
  reputationImpact?: string | null;
  operationalCapacityImpact?: string | null;

  // Périmètre et Dépendances
  mainFunctionality?: string | null;
  productDependencies?: string | null;
  interServiceDependencies?: string | null;

  // Activités externalisées
  externalSuppliers?: string | null;
  supplierTasks?: string | null;
  supplierContact?: string | null;
  supplierContinuityPlan?: boolean;
  hasSLAClause?: boolean;
  supplierRTO?: number | null;
  supplierMTPD?: number | null;

  // Cadre légal et réglementaire
  legalObligations?: string | null;
  legalReferences?: string | null;
  legalAuthority?: string | null;
  legalDetails?: string | null;
  nonComplianceConsequences?: string | null;

  // MES - Applications IT
  itSystems?: string | null;
  systemCriticality?: string | null;
  systemImpact?: string | null;
  supportedActivities?: string | null;
  hasBackupSystems?: boolean;
  systemRTO?: number | null;
  systemRPO?: number | null;
  systemMTPD?: number | null;
  workarounds?: string | null;
  previousIncidents?: string | null;

  // Infrastructure
  dependsOnPhysicalInfra?: boolean;
  infrastructureType?: string | null;
  infraRTO?: number | null;
  infraMTPD?: number | null;
  canWorkRemotely?: boolean;
  canUseOtherInfra?: boolean;

  // Personnel / Compétences
  staffRoles?: string | null;
  staffCount?: number | null;
  staffTasks?: string | null;
  uniqueSkills?: string | null;
  criticalityAfterDisruption?: string | null;
  roleRecoveryTime?: string | null;
  canBeReplaced?: boolean;
  replacementBy?: string | null;
  staffWorkarounds?: string | null;

  // Équipement industriel
  industrialEquipment?: string | null;
  equipmentTasks?: string | null;
  equipmentCriticality?: string | null; // Rendu optionnel avec ?
  canReassignEquipment?: boolean;
  equipmentRTO?: number | null;
  equipmentMTPD?: number | null;
  equipmentWorkarounds?: string | null;
  voltage?: string | null;
  currentType?: string | null;
  powerRating?: string | null;
  dailyConsumption?: string | null;
  backupCompatible?: boolean;

  // Équipement bureautique
  officeEquipment?: string | null;
  equipmentQuantity?: number | null;
  officeEquipmentTasks?: string | null;
  officeEquipmentCriticality?: string | null;
  officeRTO?: number | null;
  officeMTPD?: number | null;
  requiredAfterDisruption?: number | null;
  canReassignOfficeEquipment?: boolean;
  officeWorkarounds?: string | null;

  // Documentation
  requiredDocumentation?: string | null;
  documentationLocation?: string | null;
  neededAfterDisruption?: boolean;
  documentationRTO?: number | null;
  hasAlternativeAccess?: boolean;
  hasReplacement?: boolean;
  replacementMeasures?: string | null;

  // Fournisseurs
  keySuppliers?: string | null;
  providedService?: string | null;
  supplierDetails?: string | null;
  supplierCriticality?: string | null;
  isUniqueSupplier?: boolean;
  hasAlternativeSupplier?: boolean;
  supplierHasContinuityPlan?: boolean;

  // ============================================
  // NOUVEAUX CHAMPS MULTI-ÉLÉMENTS (JSON Arrays)
  // Compatible avec les standards SMCA/ISO 22301
  // ============================================
  activitesCritiques?: ActiviteCritique[];
  fournisseursExternes?: FournisseurExterne[];
  obligationsLegales?: ObligationLegale[];
  systemesInformatiques?: SystemeInformatique[];
  infrastructuresPhysiques?: InfrastructurePhysique[];
  rolesPersonnel?: RolePersonnel[];
  equipementsIndustriels?: EquipementIndustriel[];
  equipementsBureautiques?: EquipementBureautique[];
  documentationsCritiques?: DocumentationCritique[];
};

// Fonction utilitaire pour accéder au modèle Process (remove type assertion to fix compatibility)
function getProcessModel() {
  return prisma.process;
}

/**
 * Normalise la criticité depuis divers formats (Français, Anglais, Case)
 * vers les valeurs attendues par l'énumération Prisma.
 */
function normalizeCriticality(value?: string): "low" | "medium" | "high" | "critical" {
  if (!value) return "medium";
  
  const val = value.toLowerCase().trim();
  
  if (val === "low" || val === "faible" || val === "f") return "low";
  if (val === "medium" || val === "moyen" || val === "moyenne" || val === "m") return "medium";
  if (val === "high" || val === "élevé" || val === "eleve" || val === "haute" || val === "h") return "high";
  if (val === "critical" || val === "critique" || val === "c") return "critical";
  
  return "medium"; // Valeur par défaut
}

export async function createProcess(data: ProcessInput) {
  try {
    // Normaliser la criticité
    const normalizedCriticality = normalizeCriticality(data.criticality);

    // Préparer les données de base du processus avec valeurs par défaut
    const processData: Record<string, unknown> = {
      name: data.name,
      description: data.description || null,
      department: data.department || "Non défini",
      location: data.location || "Non défini",
      impact: data.impact || "Moyen",
      criticality: normalizedCriticality,
      rto: data.rto || 0,
      mtpd: data.mtpd || 0,
      rpo: data.rpo || 0,
      mbco: data.mbco || "0",
      processOwner: data.processOwner || null,
      ownerRole: data.ownerRole || null,
      ownerEmail: data.ownerEmail || null,
      ownerPhone: data.ownerPhone || null,

      // Responsables intérimaires (JSON)
      interimManagers: data.interimManagers || null,

      // Factory relation (si fourni)
      ...(data.factoryId && {
        factory: {
          connect: { id: data.factoryId },
        },
      }),

      // Valeurs par défaut pour champs Boolean requis
      supplierContinuityPlan: data.supplierContinuityPlan ?? false,
      hasSLAClause: data.hasSLAClause ?? false,
      hasBackupSystems: data.hasBackupSystems ?? false,
      dependsOnPhysicalInfra: data.dependsOnPhysicalInfra ?? false,
      canWorkRemotely: data.canWorkRemotely ?? false,
      canUseOtherInfra: data.canUseOtherInfra ?? false,
      canBeReplaced: data.canBeReplaced ?? false,
      canReassignEquipment: data.canReassignEquipment ?? false,
      backupCompatible: data.backupCompatible ?? false,
      canReassignOfficeEquipment: data.canReassignOfficeEquipment ?? false,
      neededAfterDisruption: data.neededAfterDisruption ?? false,
      hasAlternativeAccess: data.hasAlternativeAccess ?? false,
      hasReplacement: data.hasReplacement ?? false,
      hasAlternativeSupplier: data.hasAlternativeSupplier ?? false,
      supplierHasContinuityPlan: data.supplierHasContinuityPlan ?? false,
      // ... autres champs scalaires

      // Gestion des relations
      responsibles: data.responsibles?.length
        ? {
            create: data.responsibles.map((r) => ({
              name: r.name,
              role: r.role,
              phone: r.phone || null,
              email: r.email || null,
            })),
          }
        : undefined,

      activities: data.activities?.length
        ? {
            create: data.activities.map((a) => ({
              name: a.name,
              description: a.description || null,
            })),
          }
        : undefined,

      industrialEquipmentList: data.industrialEquipmentList?.length
        ? {
            create: data.industrialEquipmentList.map((eq) => ({
              name: eq.name,
              description: eq.description || null,
            })),
          }
        : undefined,

      officeEquipmentList: data.officeEquipmentList?.length
        ? {
            create: data.officeEquipmentList.map((eq) => ({
              name: eq.name,
              description: eq.description || null,
            })),
          }
        : undefined,

      suppliers: data.suppliers?.length
        ? {
            create: data.suppliers.map((s) => ({
              name: s.name,
              service: s.service,
              contact: s.contact,
            })),
          }
        : undefined,

      // Champs scalaires supplémentaires
      legalObligations: data.legalObligations,
      legalReferences: data.legalReferences,
      legalAuthority: data.legalAuthority,
      legalDetails: data.legalDetails,
      nonComplianceConsequences: data.nonComplianceConsequences,
      itSystems: data.itSystems,
      systemCriticality: data.systemCriticality,
      systemImpact: data.systemImpact,
      supportedActivities: data.supportedActivities,
      systemRTO: data.systemRTO,
      systemRPO: data.systemRPO,
      systemMTPD: data.systemMTPD,
      workarounds: data.workarounds,
      previousIncidents: data.previousIncidents,
      infrastructureType: data.infrastructureType,
      infraRTO: data.infraRTO,
      infraMTPD: data.infraMTPD,
      staffRoles: data.staffRoles,
      staffCount: data.staffCount,
      staffTasks: data.staffTasks,
      uniqueSkills: data.uniqueSkills,
      criticalityAfterDisruption: data.criticalityAfterDisruption,
      roleRecoveryTime: data.roleRecoveryTime,
      replacementBy: data.replacementBy,
      staffWorkarounds: data.staffWorkarounds,
      industrialEquipment: data.industrialEquipment,
      equipmentTasks: data.equipmentTasks,
      equipmentCriticality: data.equipmentCriticality,
      equipmentRTO: data.equipmentRTO,
      equipmentMTPD: data.equipmentMTPD,
      equipmentWorkarounds: data.equipmentWorkarounds,
      voltage: data.voltage,
      currentType: data.currentType,
      powerRating: data.powerRating,
      dailyConsumption: data.dailyConsumption,
      officeEquipment: data.officeEquipment,
      equipmentQuantity: data.equipmentQuantity,
      officeEquipmentTasks: data.officeEquipmentTasks,
      officeEquipmentCriticality: data.officeEquipmentCriticality,
      officeRTO: data.officeRTO,
      officeMTPD: data.officeMTPD,
      requiredAfterDisruption: data.requiredAfterDisruption,
      officeWorkarounds: data.officeWorkarounds,
      requiredDocumentation: data.requiredDocumentation,
      documentationLocation: data.documentationLocation,
      documentationRTO: data.documentationRTO,
      replacementMeasures: data.replacementMeasures,
      keySuppliers: data.keySuppliers,
      providedService: data.providedService,
      supplierDetails: data.supplierDetails,
      supplierCriticality: data.supplierCriticality,
      // NOUVEAUX CHAMPS JSON (9 multi-éléments)
      // ============================================
      activitesCritiques: data.activitesCritiques || null,
      fournisseursExternes: data.fournisseursExternes || null,
      obligationsLegales: data.obligationsLegales || null,
      systemesInformatiques: data.systemesInformatiques || null,
      infrastructuresPhysiques: data.infrastructuresPhysiques || null,
      rolesPersonnel: data.rolesPersonnel || null,
      equipementsIndustriels: data.equipementsIndustriels || null,
      equipementsBureautiques: data.equipementsBureautiques || null,
      documentationsCritiques: data.documentationsCritiques || null,
    };

    // Nettoyer l'objet pour supprimer les valeurs undefined
    Object.keys(processData).forEach((key: string) => {
      if (processData[key] === undefined) {
        delete processData[key];
      }
    });

    // Créer le processus avec les données nettoyées
    const process = await prisma.process.create({
      data: processData as never,
      include: {
        responsibles: true,
        activities: true,
        industrialEquipmentList: true,
        officeEquipmentList: true,
        suppliers: true,
      },
    });

    // Revalider les chemins pertinents
    revalidatePath("/bia");
    revalidatePath("/dashboard/process");
    
    return { success: true, data: process };
  } catch (error) {
    console.error("❌ Error creating process:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create process" 
    };
  }
}

export async function updateProcess(id: string, data: ProcessInput) {
  try {
    const processModel = getProcessModel();

    // Normaliser la criticité
    const normalizedCriticality = data.criticality ? normalizeCriticality(data.criticality) : undefined;

    // Créer un objet avec toutes les propriétés du formulaire
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      name: data.name,
      description: data.description || null,
      department: data.department,
      location: data.location,
      impact: data.impact,
      criticality: normalizedCriticality,
      rto: data.rto,
      mtpd: data.mtpd,
      rpo: data.rpo,
      mbco: data.mbco,
      criticalTimes: data.criticalTimes,
      financialImpact: data.financialImpact,
      operationalImpact: data.operationalImpact,
      reputationImpact: data.reputationImpact,
      operationalCapacityImpact: data.operationalCapacityImpact,
      factoryId: data.factoryId || null,
      mainFunctionality: data.mainFunctionality,
      productDependencies: data.productDependencies,
      interServiceDependencies: data.interServiceDependencies,
      externalSuppliers: data.externalSuppliers,
      supplierTasks: data.supplierTasks,
      supplierContact: data.supplierContact,
      supplierContinuityPlan: data.supplierContinuityPlan,
      hasSLAClause: data.hasSLAClause,
      supplierRTO: data.supplierRTO,
      supplierMTPD: data.supplierMTPD,
      legalObligations: data.legalObligations,
      legalReferences: data.legalReferences,
      legalAuthority: data.legalAuthority,
      legalDetails: data.legalDetails,
      nonComplianceConsequences: data.nonComplianceConsequences,
      itSystems: data.itSystems,
      systemCriticality: data.systemCriticality,
      systemImpact: data.systemImpact,
      supportedActivities: data.supportedActivities,
      hasBackupSystems: data.hasBackupSystems,
      systemRTO: data.systemRTO,
      systemRPO: data.systemRPO,
      systemMTPD: data.systemMTPD,
      workarounds: data.workarounds,
      previousIncidents: data.previousIncidents,
      dependsOnPhysicalInfra: data.dependsOnPhysicalInfra,
      infrastructureType: data.infrastructureType,
      infraRTO: data.infraRTO,
      infraMTPD: data.infraMTPD,
      canWorkRemotely: data.canWorkRemotely,
      canUseOtherInfra: data.canUseOtherInfra,
      staffRoles: data.staffRoles,
      staffCount: data.staffCount,
      staffTasks: data.staffTasks,
      uniqueSkills: data.uniqueSkills,
      criticalityAfterDisruption: data.criticalityAfterDisruption,
      roleRecoveryTime: data.roleRecoveryTime,
      canBeReplaced: data.canBeReplaced,
      replacementBy: data.replacementBy,
      staffWorkarounds: data.staffWorkarounds,
      industrialEquipment: data.industrialEquipment,
      equipmentTasks: data.equipmentTasks,
      equipmentCriticality: data.equipmentCriticality,
      canReassignEquipment: data.canReassignEquipment,
      equipmentRTO: data.equipmentRTO,
      equipmentMTPD: data.equipmentMTPD,
      equipmentWorkarounds: data.equipmentWorkarounds,
      voltage: data.voltage,
      currentType: data.currentType,
      powerRating: data.powerRating,
      dailyConsumption: data.dailyConsumption,
      backupCompatible: data.backupCompatible,
      officeEquipment: data.officeEquipment,
      equipmentQuantity: data.equipmentQuantity,
      officeEquipmentTasks: data.officeEquipmentTasks,
      officeEquipmentCriticality: data.officeEquipmentCriticality,
      officeRTO: data.officeRTO,
      officeMTPD: data.officeMTPD,
      requiredAfterDisruption: data.requiredAfterDisruption,
      canReassignOfficeEquipment: data.canReassignOfficeEquipment,
      officeWorkarounds: data.officeWorkarounds,
      requiredDocumentation: data.requiredDocumentation,
      documentationLocation: data.documentationLocation,
      neededAfterDisruption: data.neededAfterDisruption,
      documentationRTO: data.documentationRTO,
      hasAlternativeAccess: data.hasAlternativeAccess,
      hasReplacement: data.hasReplacement,
      replacementMeasures: data.replacementMeasures,
      keySuppliers: data.keySuppliers,
      providedService: data.providedService,
      supplierDetails: data.supplierDetails,
      supplierCriticality: data.supplierCriticality,
      hasAlternativeSupplier: data.hasAlternativeSupplier,
      supplierHasContinuityPlan: data.supplierHasContinuityPlan,

      // ============================================
      // CHAMPS RESPONSABLE DU PROCESSUS
      // ============================================
      processOwner: data.processOwner || null,
      ownerRole: data.ownerRole || null,
      ownerEmail: data.ownerEmail || null,
      ownerPhone: data.ownerPhone || null,
      interimManagers: data.interimManagers || null,

      // ============================================
      // NOUVEAUX CHAMPS JSON (9 multi-éléments)
      // ============================================
      activitesCritiques: data.activitesCritiques || null,
      fournisseursExternes: data.fournisseursExternes || null,
      obligationsLegales: data.obligationsLegales || null,
      systemesInformatiques: data.systemesInformatiques || null,
      infrastructuresPhysiques: data.infrastructuresPhysiques || null,
      rolesPersonnel: data.rolesPersonnel || null,
      equipementsIndustriels: data.equipementsIndustriels || null,
      equipementsBureautiques: data.equipementsBureautiques || null,
      documentationsCritiques: data.documentationsCritiques || null,
    };

    // Séparer les données en morceaux pour éviter l'erreur MongoDB Atlas "Pipeline length > 50"
    // Ce problème survient lorsque Prisma essaie de mettre à jour trop de champs à la fois sur MongoDB.

    // 1. Informations de base et Métriques
    const basicUpdateData = {
      name: updateData.name,
      description: updateData.description,
      department: updateData.department,
      location: updateData.location,
      impact: updateData.impact,
      criticality: updateData.criticality,
      rto: updateData.rto,
      mtpd: updateData.mtpd,
      rpo: updateData.rpo,
      mbco: updateData.mbco,
      criticalTimes: updateData.criticalTimes,
      financialImpact: updateData.financialImpact,
      operationalImpact: updateData.operationalImpact,
      reputationImpact: updateData.reputationImpact,
      operationalCapacityImpact: updateData.operationalCapacityImpact,
      factoryId: updateData.factoryId,
      processOwner: updateData.processOwner,
      ownerRole: updateData.ownerRole,
      ownerEmail: updateData.ownerEmail,
      ownerPhone: updateData.ownerPhone,
      interimManagers: updateData.interimManagers,
    };

    // 2. Dépendances et Ressources (IT, Infra, Personnel)
    const resourceUpdateData = {
      mainFunctionality: updateData.mainFunctionality,
      productDependencies: updateData.productDependencies,
      interServiceDependencies: updateData.interServiceDependencies,
      externalSuppliers: updateData.externalSuppliers,
      supplierTasks: updateData.supplierTasks,
      supplierContact: updateData.supplierContact,
      supplierContinuityPlan: updateData.supplierContinuityPlan,
      hasSLAClause: updateData.hasSLAClause,
      supplierRTO: updateData.supplierRTO,
      supplierMTPD: updateData.supplierMTPD,
      legalObligations: updateData.legalObligations,
      legalReferences: updateData.legalReferences,
      legalAuthority: updateData.legalAuthority,
      legalDetails: updateData.legalDetails,
      nonComplianceConsequences: updateData.nonComplianceConsequences,
      itSystems: updateData.itSystems,
      systemCriticality: updateData.systemCriticality,
      systemImpact: updateData.systemImpact,
      supportedActivities: updateData.supportedActivities,
      hasBackupSystems: updateData.hasBackupSystems,
      systemRTO: updateData.systemRTO,
      systemRPO: updateData.systemRPO,
      systemMTPD: updateData.systemMTPD,
      workarounds: updateData.workarounds,
      previousIncidents: updateData.previousIncidents,
      dependsOnPhysicalInfra: updateData.dependsOnPhysicalInfra,
      infrastructureType: updateData.infrastructureType,
      infraRTO: updateData.infraRTO,
      infraMTPD: updateData.infraMTPD,
      canWorkRemotely: updateData.canWorkRemotely,
      canUseOtherInfra: updateData.canUseOtherInfra,
      staffRoles: updateData.staffRoles,
      staffCount: updateData.staffCount,
      staffTasks: updateData.staffTasks,
      uniqueSkills: updateData.uniqueSkills,
      criticalityAfterDisruption: updateData.criticalityAfterDisruption,
      roleRecoveryTime: updateData.roleRecoveryTime,
      canBeReplaced: updateData.canBeReplaced,
      replacementBy: updateData.replacementBy,
      staffWorkarounds: updateData.staffWorkarounds,
    };

    // 3. Équipements, Documentation et JSON Arrays
    const extendedUpdateData = {
      industrialEquipment: updateData.industrialEquipment,
      equipmentTasks: updateData.equipmentTasks,
      equipmentCriticality: updateData.equipmentCriticality,
      canReassignEquipment: updateData.canReassignEquipment,
      equipmentRTO: updateData.equipmentRTO,
      equipmentMTPD: updateData.equipmentMTPD,
      equipmentWorkarounds: updateData.equipmentWorkarounds,
      voltage: updateData.voltage,
      currentType: updateData.currentType,
      powerRating: updateData.powerRating,
      dailyConsumption: updateData.dailyConsumption,
      backupCompatible: updateData.backupCompatible,
      officeEquipment: updateData.officeEquipment,
      equipmentQuantity: updateData.equipmentQuantity,
      officeEquipmentTasks: updateData.officeEquipmentTasks,
      officeEquipmentCriticality: updateData.officeEquipmentCriticality,
      officeRTO: updateData.officeRTO,
      officeMTPD: updateData.officeMTPD,
      requiredAfterDisruption: updateData.requiredAfterDisruption,
      canReassignOfficeEquipment: updateData.canReassignOfficeEquipment,
      officeWorkarounds: updateData.officeWorkarounds,
      requiredDocumentation: updateData.requiredDocumentation,
      documentationLocation: updateData.documentationLocation,
      neededAfterDisruption: updateData.neededAfterDisruption,
      documentationRTO: updateData.documentationRTO,
      hasAlternativeAccess: updateData.hasAlternativeAccess,
      hasReplacement: updateData.hasReplacement,
      replacementMeasures: updateData.replacementMeasures,
      keySuppliers: updateData.keySuppliers,
      providedService: updateData.providedService,
      supplierDetails: updateData.supplierDetails,
      supplierCriticality: updateData.supplierCriticality,
      hasAlternativeSupplier: updateData.hasAlternativeSupplier,
      supplierHasContinuityPlan: updateData.supplierHasContinuityPlan,
      activitesCritiques: updateData.activitesCritiques,
      fournisseursExternes: updateData.fournisseursExternes,
      obligationsLegales: updateData.obligationsLegales,
      systemesInformatiques: updateData.systemesInformatiques,
      infrastructuresPhysiques: updateData.infrastructuresPhysiques,
      rolesPersonnel: updateData.rolesPersonnel,
      equipementsIndustriels: updateData.equipementsIndustriels,
      equipementsBureautiques: updateData.equipementsBureautiques,
      documentationsCritiques: updateData.documentationsCritiques,
    };

    // Nettoyer chaque morceau (on garde null pour effacer, on vire undefined)
    const clean = (obj: any) => {
      const result: any = {};
      Object.keys(obj).forEach((key) => {
        if (obj[key] !== undefined) result[key] = obj[key];
      });
      return result;
    };

    const cleanBasic = clean(basicUpdateData);
    const cleanResource = clean(resourceUpdateData);
    const cleanExtended = clean(extendedUpdateData);

    // Exécuter les mises à jour en séquence
    // Note: on utilise des appels séparés plutôt qu'une transaction car Prisma peut combiner 
    // les opérations dans un seul pipeline même au sein d'une transaction MongoDB.
    
    let lastResult;

    if (Object.keys(cleanBasic).length > 0) {
      lastResult = await processModel.update({
        where: { id },
        data: cleanBasic,
      });
    }

    if (Object.keys(cleanResource).length > 0) {
      lastResult = await processModel.update({
        where: { id },
        data: cleanResource,
      });
    }

    if (Object.keys(cleanExtended).length > 0) {
      lastResult = await processModel.update({
        where: { id },
        data: cleanExtended,
      });
    }

    const process = lastResult || (await getProcessById(id)).data;

    revalidatePath("/bia");
    revalidatePath(`/bia/processes/${id}`);
    return { success: true, data: process };
  } catch (error) {
    console.error("Error updating process:", error);
    return { success: false, error: "Failed to update process" };
  }
}

export async function deleteProcess(id: string) {
  try {
    const processModel = getProcessModel();
    await processModel.delete({
      where: { id },
    });
    revalidatePath("/bia");
    return { success: true };
  } catch (error) {
    console.error("Error deleting process:", error);
    return { success: false, error: "Failed to delete process" };
  }
}

export async function getProcessById(id: string) {
  try {
    const processModel = getProcessModel();
    const process = await processModel.findUnique({
      where: { id },
    });

    if (!process) {
      return { success: false, error: "Process not found" };
    }

    return { success: true, data: process };
  } catch (error) {
    console.error("Error fetching process:", error);
    return { success: false, error: "Failed to fetch process" };
  }
}

export async function getAllProcesses() {
  try {
    const processModel = getProcessModel();
    const processes = await processModel.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      data: processes,
    };
  } catch (error) {
    console.error("Error fetching processes:", error);
    return { success: false, error: "Failed to fetch processes" };
  }
}
