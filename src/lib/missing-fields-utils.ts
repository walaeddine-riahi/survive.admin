/**
 * Utilitaires pour identifier et gérer les champs manquants après extraction PDF
 */

import type { ExtractedProcessData } from "@/actions/bia/analyze-process-pdf";

export interface MissingField {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "select";
  options?: string[];
  required?: boolean;
  description?: string;
  category?: string;
}

// Configuration des champs importants du formulaire BIA
export const BIA_FIELD_DEFINITIONS: MissingField[] = [
  // 1️⃣ Informations générales
  {
    name: "name",
    label: "Nom du processus",
    type: "text",
    required: true,
    description: "Exemple: Production ligne A, Gestion des commandes",
    category: "📌 Informations Générales",
  },
  {
    name: "description",
    label: "Description du processus",
    type: "textarea",
    description: "Décrivez brièvement ce processus et son objectif",
    category: "📌 Informations Générales",
  },
  {
    name: "department",
    label: "Département",
    type: "text",
    required: true,
    description: "Exemple: Production, RH, Finance, IT",
    category: "📌 Informations Générales",
  },
  {
    name: "location",
    label: "Localisation",
    type: "text",
    description: "Site ou bâtiment où se déroule ce processus",
    category: "📌 Informations Générales",
  },

  // 1️⃣ Criticité
  {
    name: "criticality",
    label: "Niveau de criticité",
    type: "select",
    options: ["critical", "high", "medium", "low"],
    required: true,
    description: "Quel est le niveau d'importance de ce processus?",
    category: "📌 Criticité",
  },
  {
    name: "rto",
    label: "RTO - Recovery Time Objective (heures)",
    type: "number",
    required: true,
    description: "Délai maximum acceptable pour reprendre le processus",
    category: "📌 Criticité",
  },
  {
    name: "mtpd",
    label: "MTPD - Maximum Tolerable Period of Disruption (heures)",
    type: "number",
    required: true,
    description: "Durée maximale d'interruption tolérable",
    category: "📌 Criticité",
  },
  {
    name: "rpo",
    label: "RPO - Recovery Point Objective (heures)",
    type: "number",
    required: true,
    description: "Perte de données maximale acceptable",
    category: "📌 Criticité",
  },
  {
    name: "mbco",
    label: "MBCO - Objectif minimum de continuité",
    type: "text",
    description: "Exemple: 80%, 50%, 30%",
    category: "📌 Criticité",
  },

  // 2️⃣ Impacts
  {
    name: "financialImpact",
    label: "Impact financier",
    type: "textarea",
    description:
      "Quelles pertes financières sont attendues en cas d'interruption?",
    category: "📌 Impacts de la Perturbation",
  },
  {
    name: "operationalImpact",
    label: "Impact opérationnel",
    type: "textarea",
    description: "Quelles activités seraient impactées?",
    category: "📌 Impacts de la Perturbation",
  },
  {
    name: "reputationImpact",
    label: "Impact sur la réputation",
    type: "textarea",
    description: "L'image ou la confiance seraient-elles affectées?",
    category: "📌 Impacts de la Perturbation",
  },
  {
    name: "operationalCapacityImpact",
    label: "Impact sur la capacité opérationnelle",
    type: "textarea",
    description: "L'interruption impacte-t-elle les délais ou la production?",
    category: "📌 Impacts de la Perturbation",
  },

  // 3️⃣ Périmètre et Dépendances
  {
    name: "mainFunctionality",
    label: "Fonctionnalité principale",
    type: "textarea",
    description: "Quel est l'objectif principal de ce processus?",
    category: "📌 Périmètre et Dépendances",
  },
  {
    name: "productDependencies",
    label: "Dépendances avec les Produits/Services",
    type: "textarea",
    description: "Quels produits ou services dépendent de ce processus?",
    category: "📌 Périmètre et Dépendances",
  },
  {
    name: "interServiceDependencies",
    label: "Dépendances interservices",
    type: "textarea",
    description: "Quels autres départements dépendent de ce processus?",
    category: "📌 Périmètre et Dépendances",
  },

  // 4️⃣ Activités Externalisées
  {
    name: "externalSuppliers",
    label: "Fournisseurs externes clés",
    type: "textarea",
    description: "Liste des fournisseurs externes qui soutiennent ce processus",
    category: "📌 Activités Externalisées",
  },
  {
    name: "supplierTasks",
    label: "Tâches exécutées par le fournisseur",
    type: "textarea",
    description: "Quelles tâches sont confiées aux fournisseurs externes?",
    category: "📌 Activités Externalisées",
  },

  // 6️⃣ Applications IT
  {
    name: "itSystems",
    label: "Systèmes informatiques",
    type: "textarea",
    description:
      "Quels systèmes/applications informatiques soutiennent le processus?",
    category: "📌 Applications Informatiques",
  },
  {
    name: "systemCriticality",
    label: "Criticité des systèmes IT",
    type: "select",
    options: ["critical", "high", "medium", "low"],
    description: "Quelle est l'importance des systèmes IT pour ce processus?",
    category: "📌 Applications Informatiques",
  },

  // 7️⃣ Infrastructure
  {
    name: "infrastructureType",
    label: "Type d'infrastructure",
    type: "text",
    description: "Exemple: Électricité, Climatisation, Réseau",
    category: "📌 Infrastructure",
  },

  // 8️⃣ Personnel
  {
    name: "staffRoles",
    label: "Rôles du personnel",
    type: "textarea",
    description: "Quels sont les rôles/postes nécessaires pour ce processus?",
    category: "📌 Rôles - Compétences - Personnel",
  },
  {
    name: "staffCount",
    label: "Nombre de personnel",
    type: "number",
    description: "Combien de personnes travaillent sur ce processus?",
    category: "📌 Rôles - Compétences - Personnel",
  },

  // 9️⃣ Équipement Industriel
  {
    name: "industrialEquipment",
    label: "Équipements industriels",
    type: "textarea",
    description: "Liste des équipements industriels critiques",
    category: "📌 Équipement Industriel",
  },

  // 🔟 Équipement Bureautique
  {
    name: "officeEquipment",
    label: "Équipements bureautiques",
    type: "textarea",
    description: "Ordinateurs, imprimantes, téléphones, etc.",
    category: "📌 Équipement Bureautique",
  },

  // 1️⃣1️⃣ Documentation
  {
    name: "requiredDocumentation",
    label: "Documentation nécessaire",
    type: "textarea",
    description:
      "Quelle documentation est nécessaire pour la gestion du processus?",
    category: "📌 Documentation",
  },
];

/**
 * Identifie les champs manquants après extraction PDF
 */
export function identifyMissingFields(
  extractedData: Partial<ExtractedProcessData>
): MissingField[] {
  const missingFields: MissingField[] = [];

  for (const fieldDef of BIA_FIELD_DEFINITIONS) {
    const value = extractedData[fieldDef.name as keyof ExtractedProcessData];

    // Un champ est considéré comme manquant si:
    // 1. Il est null ou undefined
    // 2. Il est une chaîne vide
    // 3. Il est 0 pour les nombres (sauf si c'est une valeur valide)
    const isMissing =
      value === null ||
      value === undefined ||
      value === "" ||
      (typeof value === "number" && value === 0 && fieldDef.name !== "rpo");

    if (isMissing) {
      missingFields.push(fieldDef);
    }
  }

  return missingFields;
}

/**
 * Priorise les champs manquants par importance
 */
export function prioritizeMissingFields(
  missingFields: MissingField[]
): MissingField[] {
  return missingFields.sort((a, b) => {
    // Les champs requis en premier
    if (a.required && !b.required) return -1;
    if (!a.required && b.required) return 1;

    // Ensuite par catégorie (ordre d'apparition dans le formulaire)
    const categoryOrder = [
      "📌 Informations Générales",
      "📌 Criticité",
      "📌 Impacts de la Perturbation",
      "📌 Périmètre et Dépendances",
      "📌 Activités Externalisées",
      "📌 Applications Informatiques",
      "📌 Infrastructure",
      "📌 Rôles - Compétences - Personnel",
      "📌 Équipement Industriel",
      "📌 Équipement Bureautique",
      "📌 Documentation",
    ];

    const aIndex = categoryOrder.indexOf(a.category || "");
    const bIndex = categoryOrder.indexOf(b.category || "");

    return aIndex - bIndex;
  });
}

/**
 * Fusionne les données extraites avec les données remplies par l'assistant
 */
export function mergeFilledData(
  extractedData: Partial<ExtractedProcessData>,
  filledData: Record<string, unknown>
): Record<string, unknown> {
  return {
    ...extractedData,
    ...filledData,
  };
}
