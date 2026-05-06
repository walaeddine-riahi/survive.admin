
export type GapType =
  | "RTO_BREACH"
  | "RPO_BREACH"
  | "MTPD_BREACH"
  | "MBCO_BREACH"
  | "RH_COMPETENCES"
  | "EQUIPEMENTS"
  | "INFRASTRUCTURE"
  | "APPLICATIONS_IT"
  | "DOCUMENTATION"
  | "SUPPLY_CHAIN";

export type GapSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type GapStatus = "IDENTIFIED" | "IN_PROGRESS" | "RESOLVED" | "ACCEPTED";

export const GAP_TYPE_LABELS: Record<GapType, string> = {
  RTO_BREACH: "RTO hors seuil",
  RPO_BREACH: "RPO hors seuil",
  MTPD_BREACH: "MTPD hors seuil",
  MBCO_BREACH: "MBCO insuffisant",
  RH_COMPETENCES: "RH & Compétences",
  EQUIPEMENTS: "Équipements",
  INFRASTRUCTURE: "Infrastructure",
  APPLICATIONS_IT: "Applications IT",
  DOCUMENTATION: "Documentation",
  SUPPLY_CHAIN: "Supply Chain",
};

export const GAP_TYPE_CATEGORY: Record<GapType, string> = {
  RTO_BREACH: "metric",
  RPO_BREACH: "metric",
  MTPD_BREACH: "metric",
  MBCO_BREACH: "metric",
  RH_COMPETENCES: "resource",
  EQUIPEMENTS: "resource",
  INFRASTRUCTURE: "resource",
  APPLICATIONS_IT: "resource",
  DOCUMENTATION: "resource",
  SUPPLY_CHAIN: "resource",
};

export interface CreateGapInput {
  title: string;
  description: string;
  gapType: GapType;
  severity: GapSeverity;
  status?: GapStatus;
  currentValue?: string;
  targetValue?: string;
  gap?: string;
  processId: string;
  factoryId?: string;
  recommendation?: string;
  targetClosureDate?: string;
}

export interface UpdateGapInput extends Partial<CreateGapInput> {
  id: string;
  aiAnalysis?: string;
}

export interface Gap {
  id: string;
  title: string;
  description: string;
  gapType: string;
  severity: string;
  status: string;
  currentValue?: string | null;
  targetValue?: string | null;
  gap?: string | null;
  recommendation?: string | null;
  processId: string;
  factoryId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  process?: {
    id: string;
    name: string;
    department: string;
    criticality: string;
  } | null;
  strategies: {
    id: string;
    title: string;
    status: string;
    gapClosurePercent: number;
  }[];
}
