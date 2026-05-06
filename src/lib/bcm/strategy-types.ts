
export type ResourceCategory =
  | "RH_COMPETENCES"
  | "EQUIPEMENTS"
  | "INFRASTRUCTURE"
  | "APPLICATIONS_IT"
  | "DOCUMENTATION"
  | "SUPPLY_CHAIN";

export type StrategyStatus = "PLANNED" | "IN_PROGRESS" | "IMPLEMENTED" | "TESTED" | "VALIDATED";

export const RESOURCE_CATEGORY_CONFIG: Record<ResourceCategory, {
  label: string;
  labelShort: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  description: string;
  biaSourceField: string;
  isoRef: string;
}> = {
  RH_COMPETENCES: {
    label: "RH & Compétences",
    labelShort: "RH",
    icon: "Users",
    color: "#185FA5",
    bg: "#E6F1FB",
    border: "#B5D4F4",
    description: "Personnel clé, compétences critiques, polyvalence, suppléance",
    biaSourceField: "rolesPersonnel",
    isoRef: "ISO 22317 §8.3.3 — People",
  },
  EQUIPEMENTS: {
    label: "Équipements",
    labelShort: "Équip.",
    icon: "Wrench",
    color: "#854F0B",
    bg: "#FAEEDA",
    border: "#FAC775",
    description: "Équipements industriels et bureautiques critiques, énergie",
    biaSourceField: "equipementsIndustriels",
    isoRef: "ISO 22317 §8.3.3 — Equipment & technology",
  },
  INFRASTRUCTURE: {
    label: "Infrastructure",
    labelShort: "Infra",
    icon: "Building2",
    color: "#3B6D11",
    bg: "#EAF3DE",
    border: "#C0DD97",
    description: "Locaux, bureaux, sites de repli, accès physiques",
    biaSourceField: "infrastructuresPhysiques",
    isoRef: "ISO 22317 §8.3.3 — Premises",
  },
  APPLICATIONS_IT: {
    label: "Applications IT",
    labelShort: "IT",
    icon: "Server",
    color: "#534AB7",
    bg: "#EEEDFE",
    border: "#AFA9EC",
    description: "Systèmes d'information, applications critiques, données",
    biaSourceField: "systemesInformatiques",
    isoRef: "ISO 22317 §8.3.3 — IT & data",
  },
  DOCUMENTATION: {
    label: "Documentation",
    labelShort: "Docs",
    icon: "FileText",
    color: "#0F6E56",
    bg: "#E1F5EE",
    border: "#5DCAA5",
    description: "Documents critiques, procédures, accès et récupération",
    biaSourceField: "documentationsCritiques",
    isoRef: "ISO 22317 §8.3.3 — Information & data",
  },
  SUPPLY_CHAIN: {
    label: "Supply Chain",
    labelShort: "SC",
    icon: "Truck",
    color: "#993556",
    bg: "#FBEAF0",
    border: "#ED93B1",
    description: "Fournisseurs critiques, sous-traitants, continuité amont",
    biaSourceField: "fournisseursExternes",
    isoRef: "ISO 22317 §8.3.3 — Suppliers & partners",
  },
};

export const STRATEGY_STATUS_CONFIG: Record<StrategyStatus, {
  label: string;
  color: string;
  bg: string;
  progress: number;
}> = {
  PLANNED:     { label: "Planifiée",     color: "#5F5E5A", bg: "#F1EFE8", progress: 10 },
  IN_PROGRESS: { label: "En cours",     color: "#185FA5", bg: "#E6F1FB", progress: 40 },
  IMPLEMENTED: { label: "Implémentée",  color: "#3B6D11", bg: "#EAF3DE", progress: 70 },
  TESTED:      { label: "Testée",       color: "#534AB7", bg: "#EEEDFE", progress: 90 },
  VALIDATED:   { label: "Validée",      color: "#0F6E56", bg: "#E1F5EE", progress: 100 },
};

export interface RhDetails {
  role?: string;
  backup_staff?: string;
  backup_staff_contact?: string;
  cross_training_done?: boolean;
  remote_work_possible?: boolean;
  external_pool?: string;
  min_count?: number;
  recovery_time_h?: number;
  unique_skills?: string;
  training_duration_days?: number;
  replacement_notice_days?: number;
  workaround?: string;
}

export interface EquipmentDetails {
  equipment_name?: string;
  type?: "industriel" | "bureautique";
  model_reference?: string;
  criticality?: string;
  backup_equipment?: string;
  reassignment_possible?: boolean;
  backup_site?: string;
  rto_h?: number;
  mtpd_h?: number;
  energy_specs?: {
    voltage?: string;
    current_type?: string;
    power_kw?: string;
    daily_consumption?: string;
    backup_compatible?: boolean;
  };
  workaround?: string;
  quantity_needed?: number;
  supplier?: string;
}

export interface InfrastructureDetails {
  site_name?: string;
  infrastructure_type?: string;
  backup_site?: string;
  backup_site_address?: string;
  capacity_pct?: number;
  distance_km?: number;
  activation_delay_h?: number;
  remote_work_possible?: boolean;
  can_use_other_infra?: boolean;
  access_conditions?: string;
  equipment_available?: boolean;
  workaround?: string;
}

export interface ApplicationItDetails {
  system_name?: string;
  system_type?: string;
  criticality?: string;
  backup_system?: string;
  failover_location?: string;
  rto_h?: number;
  rpo_h?: number;
  mtpd_h?: number;
  backup_frequency?: string;
  data_replication?: boolean;
  workaround?: string;
  previous_incidents?: string;
  responsible_contact?: string;
}

export interface DocumentationDetails {
  doc_type?: string;
  format?: "papier" | "electronique" | "hybride";
  primary_location?: string;
  backup_location?: string;
  backup_location_2?: string;
  access_mode?: string;
  recovery_procedure?: string;
  responsible?: string;
  rto_h?: number;
  version_control?: boolean;
  workaround?: string;
}

export interface SupplyChainDetails {
  supplier_name?: string;
  service_provided?: string;
  criticality?: string;
  backup_supplier?: string;
  backup_supplier_contact?: string;
  lead_time_days?: number;
  contract_type?: string;
  sla_rto_h?: number;
  sla_mtpd_h?: number;
  geographical_zone?: string;
  has_continuity_plan?: boolean;
  has_sla_clause?: boolean;
  continuity_plan_verified?: boolean;
  workaround?: string;
}

export type ResourceDetails =
  | RhDetails
  | EquipmentDetails
  | InfrastructureDetails
  | ApplicationItDetails
  | DocumentationDetails
  | SupplyChainDetails;

export interface CreateStrategyInput {
  title: string;
  description: string;
  resourceCategory: ResourceCategory;
  status?: StrategyStatus;
  gapId?: string;
  processId: string;
  factoryId?: string;
  sourceResourceType?: string;
  sourceResourceName?: string;
  resourceDetails?: ResourceDetails;
  fallbackSolution?: string;
  fallbackLocation?: string;
  activationDelayHours?: number;
  estimatedCost?: number;
  currency?: string;
  gapClosurePercent?: number;
  ownerId?: string;
  plannedDate?: string;
  notes?: string;
}

export interface UpdateStrategyInput extends Partial<CreateStrategyInput> {
  id: string;
  testResults?: string;
}
