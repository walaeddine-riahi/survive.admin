/**
 * Utilitaires pour préparer les données extraites pour validation par l'utilisateur
 */

import type { ExtractedProcessData } from "@/actions/bia/analyze-process-pdf";

export interface ExtractedFieldReview {
  name: string;
  label: string;
  value: unknown;
  type: "text" | "textarea" | "number" | "select";
  options?: string[];
  category?: string;
  confidence?: "high" | "medium" | "low";
}

// Configuration des champs avec leurs métadonnées pour la validation
const FIELD_METADATA: Record<
  string,
  {
    label: string;
    type: "text" | "textarea" | "number" | "select";
    options?: string[];
    category: string;
  }
> = {
  // Informations générales
  name: {
    label: "Nom du processus",
    type: "text",
    category: "📌 Informations Générales",
  },
  description: {
    label: "Description du processus",
    type: "textarea",
    category: "📌 Informations Générales",
  },
  department: {
    label: "Département",
    type: "text",
    category: "📌 Informations Générales",
  },
  location: {
    label: "Localisation",
    type: "text",
    category: "📌 Informations Générales",
  },

  // Responsable du processus
  processOwner: {
    label: "Responsable du processus (nom)",
    type: "text",
    category: "👤 Responsable",
  },
  ownerRole: {
    label: "Fonction du responsable",
    type: "text",
    category: "👤 Responsable",
  },
  ownerEmail: {
    label: "Email du responsable",
    type: "text",
    category: "👤 Responsable",
  },
  ownerPhone: {
    label: "Téléphone du responsable",
    type: "text",
    category: "👤 Responsable",
  },

  // Criticité
  criticality: {
    label: "Niveau de criticité",
    type: "select",
    options: ["critical", "high", "medium", "low"],
    category: "📌 Criticité",
  },
  rto: {
    label: "RTO - Recovery Time Objective (heures)",
    type: "number",
    category: "📌 Criticité",
  },
  mtpd: {
    label: "MTPD - Maximum Tolerable Period of Disruption (heures)",
    type: "number",
    category: "📌 Criticité",
  },
  rpo: {
    label: "RPO - Recovery Point Objective (heures)",
    type: "number",
    category: "📌 Criticité",
  },
  mbco: {
    label: "MBCO - Objectif minimum de continuité",
    type: "text",
    category: "📌 Criticité",
  },
  criticalTimes: {
    label: "Périodes critiques",
    type: "textarea",
    category: "📌 Criticité",
  },

  impact: {
    label: "Impact global",
    type: "textarea",
    category: "📌 Criticité",
  },
  factoryId: {
    label: "Usine",
    type: "text",
    category: "📌 Informations Générales",
  },

  // Impacts
  financialImpact: {
    label: "Impact financier",
    type: "textarea",
    category: "📌 Impacts de la Perturbation",
  },
  operationalImpact: {
    label: "Impact opérationnel",
    type: "textarea",
    category: "📌 Impacts de la Perturbation",
  },
  reputationImpact: {
    label: "Impact sur la réputation",
    type: "textarea",
    category: "📌 Impacts de la Perturbation",
  },
  operationalCapacityImpact: {
    label: "Impact sur la capacité opérationnelle",
    type: "textarea",
    category: "📌 Impacts de la Perturbation",
  },

  // Périmètre
  mainFunctionality: {
    label: "Fonctionnalité principale",
    type: "textarea",
    category: "📌 Périmètre et Dépendances",
  },
  productDependencies: {
    label: "Dépendances avec les Produits/Services",
    type: "textarea",
    category: "📌 Périmètre et Dépendances",
  },
  interServiceDependencies: {
    label: "Dépendances interservices",
    type: "textarea",
    category: "📌 Périmètre et Dépendances",
  },

  // Fournisseurs
  externalSuppliers: {
    label: "Fournisseurs externes clés",
    type: "textarea",
    category: "📌 Activités Externalisées",
  },
  supplierTasks: {
    label: "Tâches exécutées par le fournisseur",
    type: "textarea",
    category: "📌 Activités Externalisées",
  },
  supplierContact: {
    label: "Contact du fournisseur",
    type: "text",
    category: "📌 Activités Externalisées",
  },
  keySuppliers: {
    label: "Fournisseurs clés (détails)",
    type: "textarea",
    category: "📌 Activités Externalisées",
  },

  // IT
  itSystems: {
    label: "Systèmes informatiques",
    type: "textarea",
    category: "📌 Applications Informatiques",
  },
  systemCriticality: {
    label: "Criticité des systèmes IT",
    type: "select",
    options: ["critical", "high", "medium", "low"],
    category: "📌 Applications Informatiques",
  },
  systemImpact: {
    label: "Impact des systèmes IT",
    type: "textarea",
    category: "📌 Applications Informatiques",
  },
  supportedActivities: {
    label: "Activités soutenues par les systèmes",
    type: "textarea",
    category: "📌 Applications Informatiques",
  },

  // Infrastructure
  infrastructureType: {
    label: "Type d'infrastructure",
    type: "text",
    category: "📌 Infrastructure",
  },

  // Personnel
  staffRoles: {
    label: "Rôles du personnel",
    type: "textarea",
    category: "📌 Rôles - Compétences - Personnel",
  },
  staffCount: {
    label: "Nombre de personnel",
    type: "number",
    category: "📌 Rôles - Compétences - Personnel",
  },
  staffTasks: {
    label: "Tâches du personnel",
    type: "textarea",
    category: "📌 Rôles - Compétences - Personnel",
  },

  // Équipements
  industrialEquipment: {
    label: "Équipements industriels",
    type: "textarea",
    category: "📌 Équipement Industriel",
  },
  officeEquipment: {
    label: "Équipements bureautiques",
    type: "textarea",
    category: "📌 Équipement Bureautique",
  },

  // Documentation
  requiredDocumentation: {
    label: "Documentation nécessaire",
    type: "textarea",
    category: "📌 Documentation",
  },
  documentationLocation: {
    label: "Emplacement de la documentation",
    type: "text",
    category: "📌 Documentation",
  },
};

/**
 * Détermine le niveau de confiance basé sur la valeur
 */
function determineConfidence(
  value: unknown,
  fieldName: string
): "high" | "medium" | "low" {
  if (value === null || value === undefined || value === "") {
    return "low";
  }

  const strValue = String(value).toLowerCase();

  // Valeurs génériques = faible confiance
  const genericPatterns = [
    "à définir",
    "à compléter",
    "exemple",
    "n/a",
    "non spécifié",
  ];

  if (genericPatterns.some((pattern) => strValue.includes(pattern))) {
    return "low";
  }

  // Champs critiques avec valeurs numériques = haute confiance
  if (
    ["rto", "mtpd", "rpo", "staffCount"].includes(fieldName) &&
    typeof value === "number" &&
    value > 0
  ) {
    return "high";
  }

  // Texte long et détaillé = haute confiance
  if (typeof value === "string" && value.length > 50) {
    return "high";
  }

  // Par défaut = confiance moyenne
  return "medium";
}

/**
 * Formate un tableau d'objets en texte résumé pour affichage
 */
function formatArrayFieldForReview(
  fieldName: string,
  array: unknown[]
): string {
  if (!array || array.length === 0) {
    return "";
  }

  const count = array.length;
  let summary = `${count} élément${count > 1 ? "s" : ""} extrait${
    count > 1 ? "s" : ""
  }:\n\n`;

  // Formatage spécifique selon le type de tableau
  switch (fieldName) {
    case "activitesCritiques":
      summary += array
        .map((item, idx) => {
          const record = item as Record<string, unknown>;
          return `${idx + 1}. ${
            (record.nom as string) || "Sans nom"
          } (Criticité: ${(record.criticite as string) || "N/A"}, RTO: ${
            (record.rto as string) || "N/A"
          }h)`;
        })
        .join("\n");
      break;

    case "fournisseursExternes":
      summary += array
        .map((item, idx) => {
          const record = item as Record<string, unknown>;
          return `${idx + 1}. ${(record.nom as string) || "Sans nom"} - ${
            (record.servicesOfferts as string) || "Services non spécifiés"
          }`;
        })
        .join("\n");
      break;

    case "systemesInformatiques":
      summary += array
        .map((item, idx) => {
          const record = item as Record<string, unknown>;
          return `${idx + 1}. ${(record.nom as string) || "Sans nom"} (${
            (record.typeSysteme as string) || "Type N/A"
          }) - Criticité: ${(record.criticite as string) || "N/A"}`;
        })
        .join("\n");
      break;

    case "infrastructuresPhysiques":
      summary += array
        .map((item, idx) => {
          const record = item as Record<string, unknown>;
          return `${idx + 1}. ${(record.nom as string) || "Sans nom"} (${
            (record.type as string) || "Type N/A"
          }) - Criticité: ${(record.criticite as string) || "N/A"}`;
        })
        .join("\n");
      break;

    case "rolesPersonnel":
      summary += array
        .map((item, idx) => {
          const record = item as Record<string, unknown>;
          return `${idx + 1}. ${
            (record.role as string) || "Rôle N/A"
          } (Effectif: ${(record.effectif as string) || "N/A"})`;
        })
        .join("\n");
      break;

    case "equipementsIndustriels":
      summary += array
        .map((item, idx) => {
          const record = item as Record<string, unknown>;
          return `${idx + 1}. ${
            (record.designation as string) || "Sans désignation"
          } - ${(record.modeleReference as string) || "Modèle N/A"}`;
        })
        .join("\n");
      break;

    case "equipementsBureautiques":
      summary += array
        .map((item, idx) => {
          const record = item as Record<string, unknown>;
          return `${idx + 1}. ${
            (record.type as string) || "Type N/A"
          } (Quantité: ${(record.quantiteActuelle as string) || "N/A"})`;
        })
        .join("\n");
      break;

    case "documentationsCritiques":
      summary += array
        .map((item, idx) => {
          const record = item as Record<string, unknown>;
          return `${idx + 1}. ${
            (record.type as string) || "Type N/A"
          } (Format: ${(record.format as string) || "N/A"})`;
        })
        .join("\n");
      break;

    case "obligationsLegales":
      summary += array
        .map((item, idx) => {
          const record = item as Record<string, unknown>;
          return `${idx + 1}. ${(record.domaine as string) || "Domaine N/A"}: ${
            (record.obligationLegale as string) || "Non spécifiée"
          }`;
        })
        .join("\n");
      break;

    default:
      summary += array
        .map((item, idx) => `${idx + 1}. ${JSON.stringify(item)}`)
        .join("\n");
  }

  return summary;
}

/**
 * Prépare les champs extraits pour la validation par l'utilisateur
 * TOUS les champs configurés sont inclus, même ceux qui sont vides
 * PLUS les tableaux extraits (activités, fournisseurs, etc.)
 */
export function prepareExtractedFieldsForReview(
  extractedData: Partial<ExtractedProcessData>
): ExtractedFieldReview[] {
  const fields: ExtractedFieldReview[] = [];

  // Parcourir TOUS les champs configurés dans FIELD_METADATA
  for (const [fieldName, metadata] of Object.entries(FIELD_METADATA)) {
    // Récupérer la valeur extraite (peut être null/undefined)
    const value = extractedData[fieldName as keyof ExtractedProcessData];

    fields.push({
      name: fieldName,
      label: metadata.label,
      value: value ?? "", // Utiliser chaîne vide si null/undefined
      type: metadata.type,
      options: metadata.options,
      category: metadata.category,
      confidence: determineConfidence(value, fieldName),
    });
  }

  // Ajouter les tableaux extraits avec formatage spécial
  const arrayFields = [
    {
      name: "activitesCritiques",
      label: "Activités critiques",
      category: "📋 Activités Critiques",
    },
    {
      name: "fournisseursExternes",
      label: "Fournisseurs externes",
      category: "📋 Fournisseurs Externes",
    },
    {
      name: "systemesInformatiques",
      label: "Systèmes informatiques",
      category: "📋 Systèmes Informatiques",
    },
    {
      name: "infrastructuresPhysiques",
      label: "Infrastructures physiques",
      category: "📋 Infrastructures Physiques",
    },
    {
      name: "rolesPersonnel",
      label: "Rôles du personnel",
      category: "📋 Personnel",
    },
    {
      name: "equipementsIndustriels",
      label: "Équipements industriels",
      category: "📋 Équipements Industriels",
    },
    {
      name: "equipementsBureautiques",
      label: "Équipements bureautiques",
      category: "📋 Équipements Bureautiques",
    },
    {
      name: "documentationsCritiques",
      label: "Documentations critiques",
      category: "📋 Documentations",
    },
    {
      name: "obligationsLegales",
      label: "Obligations légales",
      category: "📋 Obligations Légales",
    },
  ];

  for (const arrayField of arrayFields) {
    const arrayValue =
      extractedData[arrayField.name as keyof ExtractedProcessData];
    if (Array.isArray(arrayValue)) {
      const formattedValue = formatArrayFieldForReview(
        arrayField.name,
        arrayValue
      );
      fields.push({
        name: arrayField.name,
        label: arrayField.label,
        value: formattedValue,
        type: "textarea",
        category: arrayField.category,
        confidence: arrayValue.length > 0 ? "high" : "low",
      });
    }
  }

  // Trier par catégorie puis par nom
  return fields.sort((a, b) => {
    if (a.category !== b.category) {
      return (a.category || "").localeCompare(b.category || "");
    }
    return a.label.localeCompare(b.label);
  });
}

/**
 * Prépare les champs avec erreurs pour correction par l'IA
 */
export function prepareErrorFieldsForReview(
  errors: Record<string, any>,
  currentValues: any
): ExtractedFieldReview[] {
  const fields: ExtractedFieldReview[] = [];

  for (const fieldName of Object.keys(errors)) {
    const metadata = FIELD_METADATA[fieldName];
    if (metadata) {
      fields.push({
        name: fieldName,
        label: metadata.label,
        value: currentValues[fieldName] ?? "",
        type: metadata.type,
        options: metadata.options,
        category: "❌ Champs Invalides à Corriger",
        confidence: "low",
      });
    }
  }

  return fields;
}
