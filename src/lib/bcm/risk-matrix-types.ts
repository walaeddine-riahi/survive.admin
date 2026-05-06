// Types partagés pour la configuration de la matrice de risque
// Ce fichier est utilisé côté client ET côté serveur

export interface MatrixLevel {
  value: number;       // Valeur numérique (ex: 1, 2, 3, 4, 5)
  label: string;       // Libellé (ex: "Rare", "Peu probable"...)
  description?: string; // Description optionnelle
  color?: string;      // Couleur HEX optionnelle
}

export interface MatrixAxis {
  label: string;        // Nom de l'axe (ex: "Vraisemblance", "Impact métier")
  description?: string;
  levels: MatrixLevel[];
}

export interface MatrixThreshold {
  min: number;          // Score minimum inclusif
  max: number;          // Score maximum inclusif
  label: string;        // Ex: "Risque faible"
  color: string;        // HEX: ex: "#16a34a"
  actionRequired?: string; // Ex: "Surveiller", "Traiter sous 30 jours"
}

export interface TreatmentOptionConfig {
  value: string;
  label: string;
  description?: string;
}

export interface RiskMatrixConfig {
  axeX: MatrixAxis;             // Axe horizontal (ex: vraisemblance)
  axeY: MatrixAxis;             // Axe vertical (ex: impact)
  thirdAxis?: MatrixAxis | null; // Axe optionnel (ex: vitesse, détectabilité)
  formula: "X*Y" | "X*Y*Z" | "(X*Y)*Z" | string; // Formule de calcul
  thresholds: MatrixThreshold[];
  treatmentOptions: TreatmentOptionConfig[];
}

// ─── MATRICES PRÉ-DÉFINIES ────────────────────────────────────────────────────

export const MATRIX_ISO_31000: RiskMatrixConfig = {
  axeX: {
    label: "Vraisemblance",
    description: "Probabilité d'occurrence du scénario",
    levels: [
      { value: 1, label: "Rare", description: "< 5% / Moins d'une fois en 10 ans", color: "#86efac" },
      { value: 2, label: "Peu probable", description: "5–20% / Une fois en 5–10 ans", color: "#fde047" },
      { value: 3, label: "Possible", description: "20–50% / Une fois en 2–5 ans", color: "#fb923c" },
      { value: 4, label: "Probable", description: "50–80% / Une fois par an", color: "#f87171" },
      { value: 5, label: "Quasi-certain", description: "> 80% / Plusieurs fois par an", color: "#dc2626" },
    ],
  },
  axeY: {
    label: "Gravité de l'impact",
    description: "Conséquences sur la continuité d'activité",
    levels: [
      { value: 1, label: "Négligeable", description: "Impact sans conséquence opérationnelle significative", color: "#86efac" },
      { value: 2, label: "Mineur", description: "Perturbation limitée, récupération < RTO", color: "#fde047" },
      { value: 3, label: "Modéré", description: "Interruption partielle, dépasse le RTO", color: "#fb923c" },
      { value: 4, label: "Majeur", description: "Interruption critique, MTPD dépassé", color: "#f87171" },
      { value: 5, label: "Catastrophique", description: "Arrêt total, menace sur la survie de l'organisation", color: "#dc2626" },
    ],
  },
  thirdAxis: {
    label: "Vitesse d'apparition",
    description: "Délai entre l'événement déclencheur et l'impact",
    levels: [
      { value: 1, label: "Lente", description: "> 72h — Préparation possible" },
      { value: 2, label: "Modérée", description: "24–72h — Activation PCA possible" },
      { value: 3, label: "Rapide", description: "4–24h — Activation immédiate requise" },
      { value: 4, label: "Soudaine", description: "< 4h — Pas de temps de réaction" },
    ],
  },
  formula: "X*Y",
  thresholds: [
    { min: 1, max: 4, label: "Risque faible", color: "#16a34a", actionRequired: "Surveiller — revue annuelle" },
    { min: 5, max: 9, label: "Risque moyen", color: "#ca8a04", actionRequired: "Plan de traitement — revue semestrielle" },
    { min: 10, max: 16, label: "Risque élevé", color: "#ea580c", actionRequired: "Action prioritaire — revue trimestrielle" },
    { min: 17, max: 25, label: "Risque critique", color: "#dc2626", actionRequired: "Action immédiate requise — escalade direction" },
  ],
  treatmentOptions: [
    { value: "REDUCE", label: "Réduire", description: "Mettre en place des mesures pour réduire la probabilité ou l'impact" },
    { value: "TRANSFER", label: "Transférer", description: "Partager le risque (assurance, externalisation, contrat)" },
    { value: "AVOID", label: "Éviter", description: "Éliminer la source du risque ou ne pas entreprendre l'activité" },
    { value: "ACCEPT", label: "Accepter", description: "Accepter le risque en connaissance de cause (risque résiduel tolérable)" },
  ],
};

export const MATRIX_BCI_GPG: RiskMatrixConfig = {
  axeX: {
    label: "Probabilité",
    description: "Likelihood d'occurrence (BCI Good Practice Guidelines)",
    levels: [
      { value: 1, label: "Very Unlikely", description: "Moins d'une fois en 100 ans" },
      { value: 2, label: "Unlikely", description: "Moins d'une fois en 25 ans" },
      { value: 3, label: "Possible", description: "Une fois en 10 ans" },
      { value: 4, label: "Likely", description: "Une fois en 5 ans" },
      { value: 5, label: "Almost Certain", description: "Au moins une fois par an" },
    ],
  },
  axeY: {
    label: "Severity",
    description: "Sévérité de l'impact sur la continuité",
    levels: [
      { value: 1, label: "Insignificant", description: "Impact minimal" },
      { value: 2, label: "Minor", description: "Impact limité, récupérable rapidement" },
      { value: 3, label: "Significant", description: "Impact notable sur les opérations" },
      { value: 4, label: "Major", description: "Impact sévère sur les opérations critiques" },
      { value: 5, label: "Catastrophic", description: "Menace sur la survie organisationnelle" },
    ],
  },
  thirdAxis: {
    label: "Velocity",
    description: "Speed of onset",
    levels: [
      { value: 1, label: "Slow", description: "> 72h warning" },
      { value: 2, label: "Medium", description: "24–72h warning" },
      { value: 3, label: "Fast", description: "4–24h warning" },
      { value: 4, label: "Sudden", description: "< 4h — no warning" },
    ],
  },
  formula: "X*Y",
  thresholds: [
    { min: 1, max: 5, label: "Low", color: "#16a34a", actionRequired: "Monitor" },
    { min: 6, max: 12, label: "Medium", color: "#ca8a04", actionRequired: "Treatment plan required" },
    { min: 13, max: 20, label: "High", color: "#ea580c", actionRequired: "Priority action" },
    { min: 21, max: 25, label: "Critical", color: "#dc2626", actionRequired: "Immediate escalation" },
  ],
  treatmentOptions: [
    { value: "REDUCE", label: "Reduce" },
    { value: "TRANSFER", label: "Transfer" },
    { value: "AVOID", label: "Avoid" },
    { value: "ACCEPT", label: "Accept" },
  ],
};

export const MATRIX_MEHARI: RiskMatrixConfig = {
  axeX: {
    label: "Potentialité",
    description: "Potentialité d'exposition au scénario",
    levels: [
      { value: 1, label: "P1", description: "Exposition nulle ou négligeable" },
      { value: 2, label: "P2", description: "Exposition faible" },
      { value: 3, label: "P3", description: "Exposition notable" },
      { value: 4, label: "P4", description: "Exposition importante" },
    ],
  },
  axeY: {
    label: "Impact",
    description: "Impact sur les activités critiques",
    levels: [
      { value: 1, label: "I1", description: "Impact négligeable" },
      { value: 2, label: "I2", description: "Impact faible" },
      { value: 3, label: "I3", description: "Impact grave" },
      { value: 4, label: "I4", description: "Impact critique" },
    ],
  },
  formula: "X*Y",
  thresholds: [
    { min: 1, max: 4, label: "Risque acceptable", color: "#16a34a", actionRequired: "Aucune action immédiate" },
    { min: 5, max: 9, label: "Risque à surveiller", color: "#ca8a04", actionRequired: "Plan de réduction" },
    { min: 10, max: 16, label: "Risque inacceptable", color: "#dc2626", actionRequired: "Traitement obligatoire" },
  ],
  treatmentOptions: [
    { value: "REDUCE", label: "Réduction" },
    { value: "TRANSFER", label: "Transfert" },
    { value: "AVOID", label: "Refus" },
    { value: "ACCEPT", label: "Acceptation" },
  ],
};

export const MATRIX_CUSTOM_TEMPLATE: RiskMatrixConfig = {
  axeX: {
    label: "Vraisemblance",
    levels: [
      { value: 1, label: "Niveau 1" },
      { value: 2, label: "Niveau 2" },
      { value: 3, label: "Niveau 3" },
      { value: 4, label: "Niveau 4" },
      { value: 5, label: "Niveau 5" },
    ],
  },
  axeY: {
    label: "Impact",
    levels: [
      { value: 1, label: "Niveau 1" },
      { value: 2, label: "Niveau 2" },
      { value: 3, label: "Niveau 3" },
      { value: 4, label: "Niveau 4" },
      { value: 5, label: "Niveau 5" },
    ],
  },
  formula: "X*Y",
  thresholds: [
    { min: 1, max: 6, label: "Faible", color: "#16a34a", actionRequired: "Surveiller" },
    { min: 7, max: 15, label: "Moyen", color: "#ca8a04", actionRequired: "Traiter" },
    { min: 16, max: 25, label: "Élevé", color: "#dc2626", actionRequired: "Action immédiate" },
  ],
  treatmentOptions: [
    { value: "REDUCE", label: "Réduire" },
    { value: "TRANSFER", label: "Transférer" },
    { value: "AVOID", label: "Éviter" },
    { value: "ACCEPT", label: "Accepter" },
  ],
};

export const PRESET_MATRICES: Record<string, { label: string; description: string; config: RiskMatrixConfig }> = {
  ISO_31000: {
    label: "ISO 31000 / ISO 22317",
    description: "Matrice 5×5 vraisemblance × gravité, alignée ISO 22301",
    config: MATRIX_ISO_31000,
  },
  BCI_GPG: {
    label: "BCI Good Practice Guidelines",
    description: "Matrice 5×5 Likelihood × Severity — standard BCI",
    config: MATRIX_BCI_GPG,
  },
  MEHARI: {
    label: "MÉHARI (CLUSIF)",
    description: "Matrice 4×4 Potentialité × Impact",
    config: MATRIX_MEHARI,
  },
  CUSTOM: {
    label: "Personnalisée",
    description: "Définissez votre propre matrice selon votre méthodologie interne",
    config: MATRIX_CUSTOM_TEMPLATE,
  },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function calculateScore(config: RiskMatrixConfig, x: number, y: number, z?: number): number {
  const formula = config.formula;
  if (formula === "X*Y") return x * y;
  if (formula === "X*Y*Z" && z) return x * y * z;
  if (formula === "(X*Y)*Z" && z) return x * y * z;
  // Fallback
  return x * y;
}

export function getThresholdForScore(config: RiskMatrixConfig, score: number): MatrixThreshold | null {
  return config.thresholds.find((t) => score >= t.min && score <= t.max) ?? null;
}

export function getMaxScore(config: RiskMatrixConfig): number {
  const maxX = Math.max(...config.axeX.levels.map((l) => l.value));
  const maxY = Math.max(...config.axeY.levels.map((l) => l.value));
  if (config.thirdAxis) {
    const maxZ = Math.max(...config.thirdAxis.levels.map((l) => l.value));
    return calculateScore(config, maxX, maxY, maxZ);
  }
  return calculateScore(config, maxX, maxY);
}
