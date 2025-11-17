import * as z from "zod";

// ============================================
// Schémas pour les éléments multiples (JSON)
// ============================================

// 1. Activités Critiques
export const activiteCritiqueSchema = z.object({
  nom: z.string().min(1, "Le nom de l'activité est requis"),
  delai: z.string().optional(),
  impactsOperationnels: z.string().optional(),
  impactsReglementaires: z.string().optional(),
  impactsImage: z.string().optional(),
  criticite: z.enum(["low", "medium", "high", "critical"]),
  rto: z.coerce.number().min(0),
  mtpd: z.coerce.number().min(0),
  rpo: z.coerce.number().min(0),
  mbco: z.string().optional(),
  solutionsContournement: z.string().optional(),
});

// 2. Fournisseurs Externes
export const fournisseurExterneSchema = z.object({
  nom: z.string().min(1, "Le nom du fournisseur est requis"),
  servicesOfferts: z.string().optional(),
  contactNom: z.string().optional(),
  contactTelephone: z.string().optional(),
  contactEmail: z.string().email("Email invalide").optional().or(z.literal("")),
  zoneGeographique: z.string().optional(),
  planContinuiteActivite: z.enum(["oui", "non"]),
  clauseSLA: z.enum(["oui", "non"]),
  rto: z.coerce.number().min(0),
  mtpd: z.coerce.number().min(0),
});

// 3. Obligations Légales
export const obligationLegaleSchema = z.object({
  nature: z.string().min(1, "La nature de l'obligation est requise"),
  reference: z.string().optional(),
  autoriteRegulation: z.string().optional(),
  details: z.string().optional(),
  consequencesNonRespect: z.string().optional(),
});

// 4. Systèmes Informatiques
export const systemeInformatiqueSchema = z.object({
  nom: z.string().min(1, "Le nom du système est requis"),
  typeSysteme: z.string().optional(),
  criticite: z.enum(["low", "medium", "high", "critical"]),
  impactIndisponibilite: z.string().optional(),
  activitesAssociees: z.string().optional(),
  sauvegardesEnPlace: z.enum(["oui", "non"]),
  rto: z.coerce.number().min(0),
  rpo: z.coerce.number().min(0),
  mtpd: z.coerce.number().min(0),
  solutionsContournement: z.string().optional(),
  incidentsAnterieurs: z.string().optional(),
});

// 5. Infrastructures Physiques
export const infrastructurePhysiqueSchema = z.object({
  nom: z.string().min(1, "Le nom de l'infrastructure est requis"),
  categorie: z.enum([
    "electricite",
    "climatisation",
    "internet",
    "locaux",
    "autre",
  ]),
  criticite: z.enum(["low", "medium", "high", "critical"]),
  rto: z.coerce.number().min(0),
  mtpd: z.coerce.number().min(0),
  possibiliteTravailDistance: z.enum(["oui", "non"]),
  alternativesDisponibles: z.string().optional(),
});

// 6. Rôles et Personnel
export const rolePersonnelSchema = z.object({
  intituleRole: z.string().min(1, "L'intitulé du rôle est requis"),
  nombrePersonnes: z.coerce.number().min(1),
  tachesResponsabilites: z.string().optional(),
  competencesRequises: z.string().optional(),
  estCritique: z.enum(["oui", "non"]),
  delaiDisponibiliteNecessaire: z.string().optional(),
  possibiliteRemplacement: z.enum(["oui", "non"]),
  personneRemplacante: z.string().optional(),
  formationNecessaire: z.enum(["oui", "non"]),
  dureeFormation: z.string().optional(),
  solutionsContournement: z.string().optional(),
});

// 7. Équipements Industriels
export const equipementIndustrielSchema = z.object({
  designation: z.string().min(1, "La désignation de l'équipement est requise"),
  modeleReference: z.string().optional(),
  tachesRealise: z.string().optional(),
  criticite: z.enum(["low", "medium", "high", "critical"]),
  rto: z.coerce.number().min(0),
  mtpd: z.coerce.number().min(0),
  possibiliteReaffectation: z.enum(["oui", "non"]),
  solutionsContournement: z.string().optional(),
  // Caractéristiques énergétiques
  tension: z.string().optional(),
  typeCourant: z.string().optional(),
  puissanceNominale: z.string().optional(),
  consommationJournaliere: z.string().optional(),
  compatibiliteSecours: z.enum(["oui", "non"]),
  alternativesDisponibles: z.string().optional(),
});

// 8. Équipements Bureautiques
export const equipementBureautiqueSchema = z.object({
  type: z.string().min(1, "Le type d'équipement est requis"),
  quantiteActuelle: z.coerce.number().min(0),
  tachesUtilisation: z.string().optional(),
  criticite: z.enum(["low", "medium", "high", "critical"]),
  rto: z.coerce.number().min(0),
  mtpd: z.coerce.number().min(0),
  quantiteRequiseApresIncident: z.coerce.number().min(0).optional(),
  possibiliteReaffectation: z.enum(["oui", "non"]),
  fournisseur: z.string().optional(),
  solutionsContournement: z.string().optional(),
});

// 9. Documentation Critique
export const documentationCritiqueSchema = z.object({
  type: z.string().min(1, "Le type de document est requis"),
  format: z.enum(["papier", "numerique", "les_deux"]),
  emplacementPrincipal: z.string().optional(),
  emplacementsSecondaires: z.string().optional(),
  necessaireApresIncident: z.enum(["oui", "non"]),
  rto: z.coerce.number().min(0),
  criticite: z.enum(["low", "medium", "high", "critical"]),
  modalitesAcces: z.string().optional(),
  possibiliteRemplacement: z.enum(["oui", "non"]),
  procedureRecuperation: z.string().optional(),
  responsable: z.string().optional(),
  notes: z.string().optional(),
});

// ====================
// SCHEMA PRINCIPAL DU FORMULAIRE (TOUS LES CHAMPS)
// ====================

export const processFormSchemaEnhanced = z.object({
  // ===== 1. Informations de base =====
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  department: z.string().min(1, "Le département est requis"),
  location: z.string().min(1, "L'emplacement est requis"),
  category: z.string().optional(), // Usine/catégorie
  factoryId: z.string().optional(),

  // Responsable du processus
  processOwner: z.string().optional(),
  ownerRole: z.string().optional(),
  ownerEmail: z.string().email("Email invalide").optional().or(z.literal("")),
  ownerPhone: z.string().optional(),

  // ===== 2. Criticité et métriques (en UPPERCASE pour Prisma) =====
  criticality: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  rto: z.coerce.number().min(0, "RTO doit être positif"),
  mtpd: z.coerce.number().min(0, "MTPD doit être positif"),
  rpo: z.coerce.number().min(0, "RPO doit être positif"),
  mbco: z.string(),

  // ===== 3. Impact =====
  impact: z.string().min(1, "L'impact est requis"),
  criticalTimes: z.string().optional(),
  financialImpact: z.string().optional(),
  operationalImpact: z.string().optional(),
  reputationImpact: z.string().optional(),
  operationalCapacityImpact: z.string().optional(),

  // ===== 4. Périmètre et Dépendances =====
  mainFunctionality: z.string().optional(),
  productDependencies: z.string().optional(),
  interServiceDependencies: z.string().optional(),

  // ===== 5. Arrays JSON multi-éléments (NOUVEAUX) =====
  activitesCritiques: z.array(activiteCritiqueSchema).optional(),
  fournisseursExternes: z.array(fournisseurExterneSchema).optional(),
  obligationsLegales: z.array(obligationLegaleSchema).optional(),
  systemesInformatiques: z.array(systemeInformatiqueSchema).optional(),
  infrastructuresPhysiques: z.array(infrastructurePhysiqueSchema).optional(),
  rolesPersonnel: z.array(rolePersonnelSchema).optional(),
  equipementsIndustriels: z.array(equipementIndustrielSchema).optional(),
  equipementsBureautiques: z.array(equipementBureautiqueSchema).optional(),
  documentationsCritiques: z.array(documentationCritiqueSchema).optional(),

  // ===== 6. Fournisseurs externes (champs texte anciens) =====
  externalSuppliers: z.string().optional(),
  supplierTasks: z.string().optional(),
  supplierContact: z.string().optional(),
  supplierHasContinuityPlan: z.boolean().optional(),
  hasSLAClause: z.boolean().optional(),
  supplierRTO: z.coerce.number().min(0).optional(),
  supplierMTPD: z.coerce.number().min(0).optional(),

  // ===== 7. Cadre légal et réglementaire =====
  legalObligations: z.string().optional(),
  legalReferences: z.string().optional(),
  legalAuthority: z.string().optional(),
  legalDetails: z.string().optional(),
  nonComplianceConsequences: z.string().optional(),

  // ===== 8. MES - Applications IT =====
  itSystems: z.string().optional(),
  systemCriticality: z.string().optional(),
  systemImpact: z.string().optional(),
  supportedActivities: z.string().optional(),
  hasBackupSystems: z.boolean().optional(),
  systemRTO: z.coerce.number().min(0).optional(),
  systemRPO: z.coerce.number().min(0).optional(),
  systemMTPD: z.coerce.number().min(0).optional(),
  workarounds: z.string().optional(),
  previousIncidents: z.string().optional(),

  // ===== 9. Infrastructure physique =====
  dependsOnPhysicalInfra: z.boolean().optional(),
  infrastructureType: z.string().optional(),
  infraRTO: z.coerce.number().min(0).optional(),
  infraMTPD: z.coerce.number().min(0).optional(),
  canWorkRemotely: z.boolean().optional(),
  canUseOtherInfra: z.boolean().optional(),

  // ===== 10. Personnel / Compétences =====
  staffRoles: z.string().optional(),
  staffCount: z.coerce.number().min(0).optional(),
  staffTasks: z.string().optional(),
  uniqueSkills: z.string().optional(),
  criticalityAfterDisruption: z.string().optional(),
  roleRecoveryTime: z.string().optional(),
  canBeReplaced: z.boolean().optional(),
  replacementBy: z.string().optional(),
  staffWorkarounds: z.string().optional(),

  // ===== 11. Équipement industriel =====
  industrialEquipment: z.string().optional(),
  equipmentTasks: z.string().optional(),
  equipmentCriticality: z.string().optional(),
  canReassignEquipment: z.boolean().optional(),
  equipmentRTO: z.coerce.number().min(0).optional(),
  equipmentMTPD: z.coerce.number().min(0).optional(),
  equipmentWorkarounds: z.string().optional(),
  voltage: z.string().optional(),
  currentType: z.string().optional(),
  powerRating: z.string().optional(),
  dailyConsumption: z.string().optional(),
  backupCompatible: z.boolean().optional(),

  // ===== 12. Équipement bureautique =====
  officeEquipment: z.string().optional(),
  equipmentQuantity: z.coerce.number().min(0).optional(),
  officeEquipmentTasks: z.string().optional(),
  officeEquipmentCriticality: z.string().optional(),
  officeRTO: z.coerce.number().min(0).optional(),
  officeMTPD: z.coerce.number().min(0).optional(),
  requiredAfterDisruption: z.coerce.number().min(0).optional(),
  canReassignOfficeEquipment: z.boolean().optional(),
  officeWorkarounds: z.string().optional(),

  // ===== 13. Documentation critique =====
  requiredDocumentation: z.string().optional(),
  documentationLocation: z.string().optional(),
  neededAfterDisruption: z.boolean().optional(),
  documentationRTO: z.coerce.number().min(0).optional(),
  hasAlternativeAccess: z.boolean().optional(),
  hasReplacement: z.boolean().optional(),
  replacementMeasures: z.string().optional(),

  // ===== 14. Fournisseurs clés =====
  keySuppliers: z.string().optional(),
  providedService: z.string().optional(),
  supplierDetails: z.string().optional(),
  supplierCriticality: z.string().optional(),
  hasAlternativeSupplier: z.boolean().optional(),
});

// Type TypeScript généré depuis le schéma
export type ProcessFormValues = z.infer<typeof processFormSchemaEnhanced>;

// Types individuels
export type ActiviteCritique = z.infer<typeof activiteCritiqueSchema>;
export type FournisseurExterne = z.infer<typeof fournisseurExterneSchema>;
export type ObligationLegale = z.infer<typeof obligationLegaleSchema>;
export type SystemeInformatique = z.infer<typeof systemeInformatiqueSchema>;
export type InfrastructurePhysique = z.infer<
  typeof infrastructurePhysiqueSchema
>;
export type RolePersonnel = z.infer<typeof rolePersonnelSchema>;
export type EquipementIndustriel = z.infer<typeof equipementIndustrielSchema>;
export type EquipementBureautique = z.infer<typeof equipementBureautiqueSchema>;
export type DocumentationCritique = z.infer<typeof documentationCritiqueSchema>;
