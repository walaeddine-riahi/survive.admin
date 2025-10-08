'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

// Type pour la création/mise à jour d'un processus
type ProcessInput = {
  // Informations de base
  id?: string;
  name: string;
  description?: string | null;
  department: string;
  location: string;
  
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
  
  impacts?: Array<{
    id?: string;
    type: string;
    description: string;
    level: string;
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
  impact: string;
  criticality: 'low' | 'medium' | 'high' | 'critical';
  rto: number;
  mtpd: number;
  rpo: number;
  mbco: string;
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
  equipmentCriticality?: string | null;  // Rendu optionnel avec ?
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
  hasAlternativeSupplier?: boolean;
  supplierHasContinuityPlan?: boolean;
};

// Type pour un processus
type Process = {
  id: string;
  name: string;
  description: string | null;
  department: string;
  location: string;
  impact: string;
  criticality: 'low' | 'medium' | 'high' | 'critical';
  rto: number;
  mtpd: number;
  rpo: number;
  mbco: string;
  createdAt: Date;
  updatedAt: Date;
};

// Type pour le client Prisma avec le modèle Process
interface PrismaProcessClient {
  create: (args: { data: ProcessInput }) => Promise<Process>;
  update: (args: { where: { id: string }, data: ProcessInput }) => Promise<Process>;
  delete: (args: { where: { id: string } }) => Promise<Process>;
  findUnique: (args: { where: { id: string } }) => Promise<Process | null>;
  findMany: (args?: { orderBy?: { name: 'asc' | 'desc' } }) => Promise<Process[]>;
}

// Fonction utilitaire pour accéder au modèle Process
function getProcessModel() {
  return (prisma as any).process as PrismaProcessClient;
}

export async function createProcess(data: ProcessInput) {
  try {
    // Préparer les données de base du processus
    const processData: any = {
      name: data.name,
      description: data.description || null,
      department: data.department,
      location: data.location,
      impact: data.impact,
      criticality: data.criticality,
      rto: data.rto,
      mtpd: data.mtpd,
      rpo: data.rpo,
      mbco: data.mbco,
      // ... autres champs scalaires
      
      // Gestion des relations
      responsibles: data.responsibles?.length ? {
        create: data.responsibles.map((r: any) => ({
          name: r.name,
          role: r.role,
          phone: r.phone || null,
          email: r.email || null
        }))
      } : undefined,
      
      activities: data.activities?.length ? {
        create: data.activities.map((a: any) => ({
          name: a.name,
          description: a.description || null
        }))
      } : undefined,
      
      industrialEquipmentList: data.industrialEquipmentList?.length ? {
        create: data.industrialEquipmentList.map((eq: any) => ({
          name: eq.name,
          description: eq.description || null
        }))
      } : undefined,
      
      officeEquipmentList: data.officeEquipmentList?.length ? {
        create: data.officeEquipmentList.map((eq: any) => ({
          name: eq.name,
          description: eq.description || null
        }))
      } : undefined,
      
      suppliers: data.suppliers?.length ? {
        create: data.suppliers.map((s: any) => ({
          name: s.name,
          service: s.service,
          contact: s.contact
        }))
      } : undefined,
      
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
    };
    
    // Nettoyer l'objet pour supprimer les valeurs undefined
    Object.keys(processData).forEach((key: string) => {
      if (processData[key] === undefined) {
        delete processData[key];
      }
    });
    
    // Créer le processus avec les données nettoyées
    const process = await prisma.process.create({
      data: processData,
      include: {
        responsibles: true,
        activities: true,
        industrialEquipmentList: true,
        officeEquipmentList: true,
        suppliers: true,
        // Inclure d'autres relations si nécessaire
      }
    });
    
    revalidatePath('/dashboard/process');
    return { success: true, data: process };
  } catch (error) {
    console.error('Error creating process:', error);
    return { success: false, error: 'Failed to create process' };
  }
}

export async function updateProcess(id: string, data: ProcessInput) {
  try {
    const processModel = getProcessModel();
    
    // Créer un objet avec toutes les propriétés du formulaire
    const updateData: any = {
      name: data.name,
      description: data.description || null,
      department: data.department,
      location: data.location,
      impact: data.impact,
      criticality: data.criticality,
      rto: data.rto,
      mtpd: data.mtpd,
      rpo: data.rpo,
      mbco: data.mbco,
      criticalTimes: data.criticalTimes,
      financialImpact: data.financialImpact,
      operationalImpact: data.operationalImpact,
      reputationImpact: data.reputationImpact,
      operationalCapacityImpact: data.operationalCapacityImpact,
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
    };
    
    // Nettoyer l'objet pour supprimer les valeurs undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      } else if (updateData[key] === null) {
        // Pour les mises à jour, on veut conserver les valeurs null
        // pour effacer les champs existants
        updateData[key] = null;
      }
    });
    
    const process = await processModel.update({
      where: { id },
      data: updateData,
    });
    
    revalidatePath('/bia');
    revalidatePath(`/bia/processes/${id}`);
    return { success: true, data: process };
  } catch (error) {
    console.error('Error updating process:', error);
    return { success: false, error: 'Failed to update process' };
  }
}

export async function deleteProcess(id: string) {
  try {
    const processModel = getProcessModel();
    await processModel.delete({
      where: { id },
    });
    revalidatePath('/bia');
    return { success: true };
  } catch (error) {
    console.error('Error deleting process:', error);
    return { success: false, error: 'Failed to delete process' };
  }
}

export async function getProcessById(id: string) {
  try {
    const processModel = getProcessModel();
    const process = await processModel.findUnique({
      where: { id },
    });
    
    if (!process) {
      return { success: false, error: 'Process not found' };
    }
    
    return { success: true, data: process };
  } catch (error) {
    console.error('Error fetching process:', error);
    return { success: false, error: 'Failed to fetch process' };
  }
}

export async function getAllProcesses() {
  try {
    const processModel = getProcessModel();
    const processes = await processModel.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    
    return { 
      success: true, 
      data: processes
    };
  } catch (error) {
    console.error('Error fetching processes:', error);
    return { success: false, error: 'Failed to fetch processes' };
  }
}
