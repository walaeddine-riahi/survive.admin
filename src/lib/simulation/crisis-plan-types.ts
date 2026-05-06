
export interface ProcedureStep {
  ordre: number;
  action: string;
  responsable: string;
  delai_max_min?: number;
  obligatoire: boolean;
}

export interface CrisisProcedure {
  id: string;
  type_incident: string;
  titre: string;
  declencheurs: string[];
  etapes: ProcedureStep[];
  escalade?: string[];
  communication_externe?: string[];
}

export interface ParsedCrisisPlan {
  procedures: CrisisProcedure[];
  roles: { role: string; responsabilites: string[] }[];
  seuils_activation: string[];
  communication_externe: string[];
  keywords: string[];
}

export const DEFAULT_CRITERIA = [
  { name: "Réactivité", description: "Délai de réaction aux injects vs seuils du plan", category: "timing", weight: 20, maxScore: 10, excellentThreshold: 90, goodThreshold: 70, acceptableThreshold: 50, appliesTo: "all", sortOrder: 1 },
  { name: "Conformité au plan", description: "Respect des procédures du plan de gestion de crise", category: "conformity", weight: 25, maxScore: 10, excellentThreshold: 85, goodThreshold: 65, acceptableThreshold: 45, appliesTo: "all", sortOrder: 2 },
  { name: "Qualité décisionnelle", description: "Clarté, pertinence et rapidité des décisions prises", category: "decision", weight: 25, maxScore: 10, excellentThreshold: 90, goodThreshold: 70, acceptableThreshold: 50, appliesTo: "all", sortOrder: 3 },
  { name: "Communication", description: "Clarté, concision et ciblage des communications émises", category: "communication", weight: 15, maxScore: 10, excellentThreshold: 85, goodThreshold: 65, acceptableThreshold: 45, appliesTo: "all", sortOrder: 4 },
  { name: "Gestion du stress", description: "Tonalité, calme et maîtrise émotionnelle sous pression", category: "tonality", weight: 15, maxScore: 10, excellentThreshold: 80, goodThreshold: 60, acceptableThreshold: 40, appliesTo: "all", sortOrder: 5 },
];
