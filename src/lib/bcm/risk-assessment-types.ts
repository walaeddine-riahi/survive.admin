
export type RiskStatus = "OPEN" | "MITIGATED" | "ACCEPTED" | "CLOSED";

export const THREAT_SOURCES = [
  "Naturelle (inondation, séisme, tempête, canicule...)",
  "Technologique (panne, cyberattaque, incendie système, explosion...)",
  "Humaine — accidentelle (erreur opérateur, négligence...)",
  "Humaine — malveillante (sabotage, vol, fraude interne...)",
  "Organisationnelle (défaillance fournisseur, départ compétences clés...)",
  "Sanitaire (pandémie, épidémie, accident corporel...)",
  "Environnementale (pollution, pénurie ressource, coupure énergie...)",
  "Réglementaire / Légale (non-conformité, retrait d'autorisation...)",
];

export interface CreateRiskInput {
  title: string;
  description: string;
  scenario: string;
  threatSource?: string;
  processId: string;
  factoryId?: string;
  axeXValue: number;
  axeYValue: number;
  axeZValue?: number;
  rtoImpactHours?: number;
  rpoImpactHours?: number;
  mbcoImpactPercent?: number;
  treatmentOption?: string;
  treatmentPlan?: string;
  ownerId?: string;
  nextReviewDate?: string;
}

export interface UpdateRiskInput extends Partial<CreateRiskInput> {
  id: string;
  status?: RiskStatus;
  residualAxeX?: number;
  residualAxeY?: number;
  residualAxeZ?: number;
  aiAnalysis?: string;
}
