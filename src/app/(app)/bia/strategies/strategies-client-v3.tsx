"use client";

import { useState, useTransition, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Users, Wrench, Building2, Server, FileText, Truck,
  Plus, ChevronRight, CheckCircle2, AlertCircle, Info,
  RefreshCw, Zap, Clock, MapPin, Phone, Mail,
} from "lucide-react";
import {
  createStrategy, updateStrategy, deleteStrategy, getStrategies,
  getProcessResourceData,
} from "@/actions/bcm/strategy-actions";
import {
  RESOURCE_CATEGORY_CONFIG, STRATEGY_STATUS_CONFIG,
  type ResourceCategory, type StrategyStatus, type CreateStrategyInput,
  type RhDetails, type EquipmentDetails, type InfrastructureDetails,
  type ApplicationItDetails, type DocumentationDetails, type SupplyChainDetails,
} from "@/lib/bcm/strategy-types";

type Strategy = Awaited<ReturnType<typeof getStrategies>>["data"] extends (infer T)[] ? T : never;
type ProcessData = Awaited<ReturnType<typeof getProcessResourceData>>["data"];

const CATEGORY_ICONS: Record<ResourceCategory, React.ElementType> = {
  RH_COMPETENCES: Users,
  EQUIPEMENTS: Wrench,
  INFRASTRUCTURE: Building2,
  APPLICATIONS_IT: Server,
  DOCUMENTATION: FileText,
  SUPPLY_CHAIN: Truck,
};

const CATEGORIES = Object.keys(RESOURCE_CATEGORY_CONFIG) as ResourceCategory[];

// ─── SUB-FORMS PER CATEGORY ──────────────────────────────────────────────────

function RhForm({ details, onChange }: { details: RhDetails; onChange: (d: RhDetails) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...details, [k]: v });
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-2">
        <Info className="h-3.5 w-3.5 flex-shrink-0" />
        <span>ISO 22317 §8.3.3 — Ressources humaines et compétences clés</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">Rôle / Poste critique</Label>
          <Input className="mt-1 h-8 text-xs" value={details.role || ""} onChange={e => set("role", e.target.value)} /></div>
        <div><Label className="text-xs">Effectif minimum requis</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={details.min_count || ""} onChange={e => set("min_count", parseInt(e.target.value))} /></div>
        <div><Label className="text-xs">Personnel de remplacement</Label>
          <Input className="mt-1 h-8 text-xs" value={details.backup_staff || ""} onChange={e => set("backup_staff", e.target.value)} placeholder="Nom ou équipe" /></div>
        <div><Label className="text-xs">Contact suppléant</Label>
          <Input className="mt-1 h-8 text-xs" value={details.backup_staff_contact || ""} onChange={e => set("backup_staff_contact", e.target.value)} /></div>
        <div><Label className="text-xs">Délai de disponibilité (h)</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={details.recovery_time_h || ""} onChange={e => set("recovery_time_h", parseInt(e.target.value))} /></div>
        <div><Label className="text-xs">Durée de formation (jours)</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={details.training_duration_days || ""} onChange={e => set("training_duration_days", parseInt(e.target.value))} /></div>
        <div><Label className="text-xs">Pool externe (intérim, prestataire)</Label>
          <Input className="mt-1 h-8 text-xs" value={details.external_pool || ""} onChange={e => set("external_pool", e.target.value)} /></div>
        <div><Label className="text-xs">Préavis nécessaire (jours)</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={details.replacement_notice_days || ""} onChange={e => set("replacement_notice_days", parseInt(e.target.value))} /></div>
      </div>
      <div><Label className="text-xs">Compétences uniques / critiques</Label>
        <Textarea className="mt-1 text-xs" rows={2} value={details.unique_skills || ""} onChange={e => set("unique_skills", e.target.value)} /></div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={!!details.cross_training_done} onCheckedChange={v => set("cross_training_done", v)} />
          <span className="text-xs">Cross-training en place</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={!!details.remote_work_possible} onCheckedChange={v => set("remote_work_possible", v)} />
          <span className="text-xs">Télétravail possible</span>
        </label>
      </div>
      <div><Label className="text-xs">Solution de contournement RH</Label>
        <Textarea className="mt-1 text-xs" rows={2} value={details.workaround || ""} onChange={e => set("workaround", e.target.value)} /></div>
    </div>
  );
}

function EquipmentForm({ details, onChange }: { details: EquipmentDetails; onChange: (d: EquipmentDetails) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...details, [k]: v });
  const setEnergy = (k: string, v: unknown) => onChange({ ...details, energy_specs: { ...details.energy_specs, [k]: v } });
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
        <Info className="h-3.5 w-3.5 flex-shrink-0" />
        <span>ISO 22317 §8.3.3 — Équipements industriels et bureautiques</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">Désignation de l'équipement</Label>
          <Input className="mt-1 h-8 text-xs" value={details.equipment_name || ""} onChange={e => set("equipment_name", e.target.value)} /></div>
        <div><Label className="text-xs">Type</Label>
          <Select value={details.type || ""} onValueChange={v => set("type", v)}>
            <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder="Type..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="industriel">Équipement industriel</SelectItem>
              <SelectItem value="bureautique">Équipement bureautique</SelectItem>
            </SelectContent>
          </Select></div>
        <div><Label className="text-xs">Modèle / Référence</Label>
          <Input className="mt-1 h-8 text-xs" value={details.model_reference || ""} onChange={e => set("model_reference", e.target.value)} /></div>
        <div><Label className="text-xs">Fournisseur</Label>
          <Input className="mt-1 h-8 text-xs" value={details.supplier || ""} onChange={e => set("supplier", e.target.value)} /></div>
        <div><Label className="text-xs">Équipement de secours / remplacement</Label>
          <Input className="mt-1 h-8 text-xs" value={details.backup_equipment || ""} onChange={e => set("backup_equipment", e.target.value)} /></div>
        <div><Label className="text-xs">Site de repli pour l'équipement</Label>
          <Input className="mt-1 h-8 text-xs" value={details.backup_site || ""} onChange={e => set("backup_site", e.target.value)} /></div>
        <div><Label className="text-xs">RTO équipement (h)</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={details.rto_h || ""} onChange={e => set("rto_h", parseInt(e.target.value))} /></div>
        <div><Label className="text-xs">MTPD équipement (h)</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={details.mtpd_h || ""} onChange={e => set("mtpd_h", parseInt(e.target.value))} /></div>
        <div><Label className="text-xs">Quantité nécessaire après incident</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={details.quantity_needed || ""} onChange={e => set("quantity_needed", parseInt(e.target.value))} /></div>
      </div>
      <Separator />
      <p className="text-xs font-semibold text-muted-foreground">Caractéristiques énergétiques (si applicables)</p>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">Tension</Label>
          <Input className="mt-1 h-8 text-xs" value={details.energy_specs?.voltage || ""} onChange={e => setEnergy("voltage", e.target.value)} placeholder="Ex: 380V" /></div>
        <div><Label className="text-xs">Type de courant</Label>
          <Input className="mt-1 h-8 text-xs" value={details.energy_specs?.current_type || ""} onChange={e => setEnergy("current_type", e.target.value)} placeholder="Monophasé / Triphasé" /></div>
        <div><Label className="text-xs">Puissance nominale (kW)</Label>
          <Input className="mt-1 h-8 text-xs" value={details.energy_specs?.power_kw || ""} onChange={e => setEnergy("power_kw", e.target.value)} /></div>
        <div><Label className="text-xs">Consommation journalière (kWh)</Label>
          <Input className="mt-1 h-8 text-xs" value={details.energy_specs?.daily_consumption || ""} onChange={e => setEnergy("daily_consumption", e.target.value)} /></div>
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={!!details.reassignment_possible} onCheckedChange={v => set("reassignment_possible", v)} />
          <span className="text-xs">Réaffectation possible</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={!!details.energy_specs?.backup_compatible} onCheckedChange={v => setEnergy("backup_compatible", v)} />
          <span className="text-xs">Compatible groupe secours</span>
        </label>
      </div>
      <div><Label className="text-xs">Solution de contournement</Label>
        <Textarea className="mt-1 text-xs" rows={2} value={details.workaround || ""} onChange={e => set("workaround", e.target.value)} /></div>
    </div>
  );
}

function InfrastructureForm({ details, onChange }: { details: InfrastructureDetails; onChange: (d: InfrastructureDetails) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...details, [k]: v });
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg p-2">
        <Info className="h-3.5 w-3.5 flex-shrink-0" />
        <span>ISO 22317 §8.3.3 — Locaux, bureaux et infrastructures physiques</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">Site / Local actuel</Label>
          <Input className="mt-1 h-8 text-xs" value={details.site_name || ""} onChange={e => set("site_name", e.target.value)} /></div>
        <div><Label className="text-xs">Type d'infrastructure</Label>
          <Input className="mt-1 h-8 text-xs" value={details.infrastructure_type || ""} onChange={e => set("infrastructure_type", e.target.value)} placeholder="Bureaux, usine, entrepôt..." /></div>
        <div><Label className="text-xs">Site de repli</Label>
          <Input className="mt-1 h-8 text-xs" value={details.backup_site || ""} onChange={e => set("backup_site", e.target.value)} /></div>
        <div><Label className="text-xs">Adresse du site de repli</Label>
          <Input className="mt-1 h-8 text-xs" value={details.backup_site_address || ""} onChange={e => set("backup_site_address", e.target.value)} /></div>
        <div><Label className="text-xs">Capacité d'accueil (%)</Label>
          <Input type="number" min={0} max={100} className="mt-1 h-8 text-xs" value={details.capacity_pct || ""} onChange={e => set("capacity_pct", parseInt(e.target.value))} /></div>
        <div><Label className="text-xs">Distance du site de repli (km)</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={details.distance_km || ""} onChange={e => set("distance_km", parseInt(e.target.value))} /></div>
        <div><Label className="text-xs">Délai d'activation (h)</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={details.activation_delay_h || ""} onChange={e => set("activation_delay_h", parseInt(e.target.value))} /></div>
        <div><Label className="text-xs">Conditions d'accès</Label>
          <Input className="mt-1 h-8 text-xs" value={details.access_conditions || ""} onChange={e => set("access_conditions", e.target.value)} placeholder="Badge, clé, code..." /></div>
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={!!details.remote_work_possible} onCheckedChange={v => set("remote_work_possible", v)} />
          <span className="text-xs">Travail à distance possible</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={!!details.can_use_other_infra} onCheckedChange={v => set("can_use_other_infra", v)} />
          <span className="text-xs">Peut utiliser autre infrastructure</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={!!details.equipment_available} onCheckedChange={v => set("equipment_available", v)} />
          <span className="text-xs">Équipements disponibles sur site repli</span>
        </label>
      </div>
      <div><Label className="text-xs">Solution de contournement infrastructure</Label>
        <Textarea className="mt-1 text-xs" rows={2} value={details.workaround || ""} onChange={e => set("workaround", e.target.value)} /></div>
    </div>
  );
}

function ApplicationItForm({ details, onChange }: { details: ApplicationItDetails; onChange: (d: ApplicationItDetails) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...details, [k]: v });
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-purple-700 bg-purple-50 border border-purple-200 rounded-lg p-2">
        <Info className="h-3.5 w-3.5 flex-shrink-0" />
        <span>ISO 22317 §8.3.3 — Systèmes d'information et applications critiques</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">Nom du système / Application</Label>
          <Input className="mt-1 h-8 text-xs" value={details.system_name || ""} onChange={e => set("system_name", e.target.value)} /></div>
        <div><Label className="text-xs">Type de système</Label>
          <Input className="mt-1 h-8 text-xs" value={details.system_type || ""} onChange={e => set("system_type", e.target.value)} placeholder="ERP, MES, CRM, BD..." /></div>
        <div><Label className="text-xs">Criticité</Label>
          <Select value={details.criticality || ""} onValueChange={v => set("criticality", v)}>
            <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder="Choisir..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="critique">Critique</SelectItem>
              <SelectItem value="important">Important</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
            </SelectContent>
          </Select></div>
        <div><Label className="text-xs">Système de secours / DRP</Label>
          <Input className="mt-1 h-8 text-xs" value={details.backup_system || ""} onChange={e => set("backup_system", e.target.value)} /></div>
        <div><Label className="text-xs">Site de bascule / Failover</Label>
          <Input className="mt-1 h-8 text-xs" value={details.failover_location || ""} onChange={e => set("failover_location", e.target.value)} /></div>
        <div><Label className="text-xs">Contact responsable système</Label>
          <Input className="mt-1 h-8 text-xs" value={details.responsible_contact || ""} onChange={e => set("responsible_contact", e.target.value)} /></div>
        <div><Label className="text-xs">RTO système (h)</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={details.rto_h || ""} onChange={e => set("rto_h", parseInt(e.target.value))} /></div>
        <div><Label className="text-xs">RPO système (h)</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={details.rpo_h || ""} onChange={e => set("rpo_h", parseInt(e.target.value))} /></div>
        <div><Label className="text-xs">MTPD système (h)</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={details.mtpd_h || ""} onChange={e => set("mtpd_h", parseInt(e.target.value))} /></div>
        <div><Label className="text-xs">Fréquence de sauvegarde</Label>
          <Input className="mt-1 h-8 text-xs" value={details.backup_frequency || ""} onChange={e => set("backup_frequency", e.target.value)} placeholder="Ex: Toutes les 4h, quotidienne" /></div>
      </div>
      <div><Label className="text-xs">Incidents antérieurs significatifs</Label>
        <Textarea className="mt-1 text-xs" rows={2} value={details.previous_incidents || ""} onChange={e => set("previous_incidents", e.target.value)} /></div>
      <div className="flex items-center gap-2 cursor-pointer">
        <Switch checked={!!details.data_replication} onCheckedChange={v => set("data_replication", v)} />
        <span className="text-xs">Réplication de données en temps réel</span>
      </div>
      <div><Label className="text-xs">Solution de contournement IT</Label>
        <Textarea className="mt-1 text-xs" rows={2} value={details.workaround || ""} onChange={e => set("workaround", e.target.value)} /></div>
    </div>
  );
}

function DocumentationForm({ details, onChange }: { details: DocumentationDetails; onChange: (d: DocumentationDetails) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...details, [k]: v });
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-teal-700 bg-teal-50 border border-teal-200 rounded-lg p-2">
        <Info className="h-3.5 w-3.5 flex-shrink-0" />
        <span>ISO 22317 §8.3.3 — Documentation et données critiques</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">Type de document</Label>
          <Input className="mt-1 h-8 text-xs" value={details.doc_type || ""} onChange={e => set("doc_type", e.target.value)} placeholder="Procédure, contrat, licence, plan..." /></div>
        <div><Label className="text-xs">Format</Label>
          <Select value={details.format || ""} onValueChange={v => set("format", v)}>
            <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder="Format..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="electronique">Électronique</SelectItem>
              <SelectItem value="papier">Papier</SelectItem>
              <SelectItem value="hybride">Hybride</SelectItem>
            </SelectContent>
          </Select></div>
        <div><Label className="text-xs">Emplacement principal</Label>
          <Input className="mt-1 h-8 text-xs" value={details.primary_location || ""} onChange={e => set("primary_location", e.target.value)} placeholder="Serveur, armoire, GED..." /></div>
        <div><Label className="text-xs">Emplacement de secours</Label>
          <Input className="mt-1 h-8 text-xs" value={details.backup_location || ""} onChange={e => set("backup_location", e.target.value)} /></div>
        <div><Label className="text-xs">Emplacement de secours 2</Label>
          <Input className="mt-1 h-8 text-xs" value={details.backup_location_2 || ""} onChange={e => set("backup_location_2", e.target.value)} /></div>
        <div><Label className="text-xs">Responsable document</Label>
          <Input className="mt-1 h-8 text-xs" value={details.responsible || ""} onChange={e => set("responsible", e.target.value)} /></div>
        <div><Label className="text-xs">Mode d'accès</Label>
          <Input className="mt-1 h-8 text-xs" value={details.access_mode || ""} onChange={e => set("access_mode", e.target.value)} placeholder="URL, badge, coffre, VPN..." /></div>
        <div><Label className="text-xs">RTO documentation (h)</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={details.rto_h || ""} onChange={e => set("rto_h", parseInt(e.target.value))} /></div>
      </div>
      <div><Label className="text-xs">Procédure de récupération</Label>
        <Textarea className="mt-1 text-xs" rows={2} value={details.recovery_procedure || ""} onChange={e => set("recovery_procedure", e.target.value)} /></div>
      <div className="flex items-center gap-2 cursor-pointer">
        <Switch checked={!!details.version_control} onCheckedChange={v => set("version_control", v)} />
        <span className="text-xs">Contrôle de version en place</span>
      </div>
      <div><Label className="text-xs">Solution de contournement documentation</Label>
        <Textarea className="mt-1 text-xs" rows={2} value={details.workaround || ""} onChange={e => set("workaround", e.target.value)} /></div>
    </div>
  );
}

function SupplyChainForm({ details, onChange }: { details: SupplyChainDetails; onChange: (d: SupplyChainDetails) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...details, [k]: v });
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-pink-700 bg-pink-50 border border-pink-200 rounded-lg p-2">
        <Info className="h-3.5 w-3.5 flex-shrink-0" />
        <span>ISO 22317 §8.3.3 — Fournisseurs, sous-traitants et partenaires critiques</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">Fournisseur / Partenaire</Label>
          <Input className="mt-1 h-8 text-xs" value={details.supplier_name || ""} onChange={e => set("supplier_name", e.target.value)} /></div>
        <div><Label className="text-xs">Service fourni</Label>
          <Input className="mt-1 h-8 text-xs" value={details.service_provided || ""} onChange={e => set("service_provided", e.target.value)} /></div>
        <div><Label className="text-xs">Criticité</Label>
          <Select value={details.criticality || ""} onValueChange={v => set("criticality", v)}>
            <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder="Choisir..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="critique">Critique — aucun substitut immédiat</SelectItem>
              <SelectItem value="important">Important — substitut difficile</SelectItem>
              <SelectItem value="normal">Normal — substitut disponible</SelectItem>
            </SelectContent>
          </Select></div>
        <div><Label className="text-xs">Zone géographique</Label>
          <Input className="mt-1 h-8 text-xs" value={details.geographical_zone || ""} onChange={e => set("geographical_zone", e.target.value)} placeholder="Tunisie, Europe, International..." /></div>
        <div><Label className="text-xs">Fournisseur de secours</Label>
          <Input className="mt-1 h-8 text-xs" value={details.backup_supplier || ""} onChange={e => set("backup_supplier", e.target.value)} /></div>
        <div><Label className="text-xs">Contact fournisseur de secours</Label>
          <Input className="mt-1 h-8 text-xs" value={details.backup_supplier_contact || ""} onChange={e => set("backup_supplier_contact", e.target.value)} /></div>
        <div><Label className="text-xs">Délai d'approvisionnement alternatif (jours)</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={details.lead_time_days || ""} onChange={e => set("lead_time_days", parseInt(e.target.value))} /></div>
        <div><Label className="text-xs">Type de contrat de secours</Label>
          <Input className="mt-1 h-8 text-xs" value={details.contract_type || ""} onChange={e => set("contract_type", e.target.value)} placeholder="Standby, Cadre, Spot..." /></div>
        <div><Label className="text-xs">RTO SLA fournisseur (h)</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={details.sla_rto_h || ""} onChange={e => set("sla_rto_h", parseInt(e.target.value))} /></div>
        <div><Label className="text-xs">MTPD SLA fournisseur (h)</Label>
          <Input type="number" className="mt-1 h-8 text-xs" value={details.sla_mtpd_h || ""} onChange={e => set("sla_mtpd_h", parseInt(e.target.value))} /></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={!!details.has_continuity_plan} onCheckedChange={v => set("has_continuity_plan", v)} />
          <span className="text-xs">PCA fournisseur existant</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={!!details.has_sla_clause} onCheckedChange={v => set("has_sla_clause", v)} />
          <span className="text-xs">Clause SLA au contrat</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={!!details.continuity_plan_verified} onCheckedChange={v => set("continuity_plan_verified", v)} />
          <span className="text-xs">PCA vérifié / audité</span>
        </label>
      </div>
      <div><Label className="text-xs">Solution de contournement supply chain</Label>
        <Textarea className="mt-1 text-xs" rows={2} value={details.workaround || ""} onChange={e => set("workaround", e.target.value)} /></div>
    </div>
  );
}

function ResourceDetailsForm({ category, details, onChange }: {
  category: ResourceCategory;
  details: Record<string, unknown>;
  onChange: (d: Record<string, unknown>) => void;
}) {
  if (category === "RH_COMPETENCES") return <RhForm details={details as RhDetails} onChange={d => onChange(d as Record<string, unknown>)} />;
  if (category === "EQUIPEMENTS") return <EquipmentForm details={details as EquipmentDetails} onChange={d => onChange(d as Record<string, unknown>)} />;
  if (category === "INFRASTRUCTURE") return <InfrastructureForm details={details as InfrastructureDetails} onChange={d => onChange(d as Record<string, unknown>)} />;
  if (category === "APPLICATIONS_IT") return <ApplicationItForm details={details as ApplicationItDetails} onChange={d => onChange(d as Record<string, unknown>)} />;
  if (category === "DOCUMENTATION") return <DocumentationForm details={details as DocumentationDetails} onChange={d => onChange(d as Record<string, unknown>)} />;
  if (category === "SUPPLY_CHAIN") return <SupplyChainForm details={details as SupplyChainDetails} onChange={d => onChange(d as Record<string, unknown>)} />;
  return null;
}

// ─── STRATEGY CARD ────────────────────────────────────────────────────────────
function StrategyCard({ strategy, onStatusChange, onEdit, onDelete }: {
  strategy: Strategy;
  onStatusChange: (id: string, s: StrategyStatus) => void;
  onEdit: (s: Strategy) => void;
  onDelete: (id: string) => void;
}) {
  const cat = strategy.resourceCategory as ResourceCategory;
  const cfg = RESOURCE_CATEGORY_CONFIG[cat];
  const statusCfg = STRATEGY_STATUS_CONFIG[strategy.status as StrategyStatus];
  const details = strategy.resourceDetails as Record<string, unknown> | null;

  // Extract key info from details depending on category
  const keyInfo: string[] = [];
  if (details) {
    if (cat === "RH_COMPETENCES") {
      if (details.backup_staff) keyInfo.push(`Suppléant: ${details.backup_staff}`);
      if (details.recovery_time_h) keyInfo.push(`Disponible en ${details.recovery_time_h}h`);
      if (details.cross_training_done) keyInfo.push("✓ Cross-training");
    } else if (cat === "EQUIPEMENTS") {
      if (details.backup_equipment) keyInfo.push(`Secours: ${details.backup_equipment}`);
      if (details.rto_h) keyInfo.push(`RTO: ${details.rto_h}h`);
    } else if (cat === "INFRASTRUCTURE") {
      if (details.backup_site) keyInfo.push(`Site repli: ${details.backup_site}`);
      if (details.capacity_pct) keyInfo.push(`Capacité: ${details.capacity_pct}%`);
      if (details.activation_delay_h) keyInfo.push(`Activation: ${details.activation_delay_h}h`);
    } else if (cat === "APPLICATIONS_IT") {
      if (details.backup_system) keyInfo.push(`DRP: ${details.backup_system}`);
      if (details.rto_h) keyInfo.push(`RTO: ${details.rto_h}h`);
      if (details.rpo_h) keyInfo.push(`RPO: ${details.rpo_h}h`);
    } else if (cat === "DOCUMENTATION") {
      if (details.backup_location) keyInfo.push(`Secours: ${details.backup_location}`);
      if (details.format) keyInfo.push(`Format: ${details.format}`);
    } else if (cat === "SUPPLY_CHAIN") {
      if (details.backup_supplier) keyInfo.push(`Secours: ${details.backup_supplier}`);
      if (details.lead_time_days) keyInfo.push(`Délai: ${details.lead_time_days}j`);
      if (details.has_continuity_plan) keyInfo.push("✓ PCA fournisseur");
    }
  }

  return (
    <Card className="shadow-sm border hover:shadow-md transition-shadow" style={{ borderTopColor: cfg.color, borderTopWidth: 3 }}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: statusCfg.bg, color: statusCfg.color }}>
                {statusCfg.label}
              </span>
              {strategy.sourceResourceName && (
                <span className="text-xs text-muted-foreground border rounded px-1.5 py-0.5 truncate max-w-32">
                  {strategy.sourceResourceName}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-sm leading-tight">{strategy.title}</h3>
            {strategy.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{strategy.description}</p>
            )}
          </div>
        </div>

        {strategy.fallbackSolution && (
          <div className="flex items-start gap-1.5 mt-2 text-xs" style={{ color: cfg.color }}>
            <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span className="font-medium">Repli :</span>
            <span className="text-muted-foreground">{strategy.fallbackSolution}</span>
          </div>
        )}

        {keyInfo.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {keyInfo.slice(0, 3).map((info, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded" style={{ background: cfg.bg, color: cfg.color }}>
                {info}
              </span>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-2">
          <span className="font-medium">Processus :</span> {strategy.process?.name}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <Progress value={strategy.gapClosurePercent} className="h-2 flex-1" />
          <span className="text-xs font-bold flex-shrink-0" style={{
            color: strategy.gapClosurePercent >= 70 ? "#0F6E56" : strategy.gapClosurePercent >= 40 ? "#854F0B" : "#A32D2D"
          }}>{strategy.gapClosurePercent}%</span>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2 border-t">
          <Select value={strategy.status} onValueChange={v => onStatusChange(strategy.id, v as StrategyStatus)}>
            <SelectTrigger className="h-7 text-xs w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(STRATEGY_STATUS_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onEdit(strategy)}>Modifier</Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600" onClick={() => onDelete(strategy.id)}>Supprimer</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── CATEGORY HEADER WITH STATS ───────────────────────────────────────────────
function CategoryHeader({ cat, strategies, onAdd }: {
  cat: ResourceCategory;
  strategies: Strategy[];
  onAdd: () => void;
}) {
  const cfg = RESOURCE_CATEGORY_CONFIG[cat];
  const Icon = CATEGORY_ICONS[cat];
  const impl = strategies.filter(s => ["IMPLEMENTED","TESTED","VALIDATED"].includes(s.status)).length;
  const avg = strategies.length > 0 ? Math.round(strategies.reduce((a,s) => a + s.gapClosurePercent, 0) / strategies.length) : 0;

  return (
    <div className="flex items-center justify-between mb-4 p-3 rounded-xl" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: cfg.color }}>
          <Icon className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: cfg.color }}>{cfg.label}</p>
          <p className="text-xs text-muted-foreground">{cfg.isoRef}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: cfg.color }}>{avg}%</p>
          <p className="text-xs text-muted-foreground">Gap closure</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: cfg.color }}>{impl}/{strategies.length}</p>
          <p className="text-xs text-muted-foreground">Impl.</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1 text-xs h-8" onClick={onAdd}
          style={{ borderColor: cfg.color, color: cfg.color }}>
          <Plus className="h-3 w-3" /> Ajouter
        </Button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
interface FormState {
  title: string;
  description: string;
  resourceCategory: ResourceCategory;
  status: StrategyStatus;
  processId: string;
  sourceResourceType: string;
  sourceResourceName: string;
  gapClosurePercent: number;
  estimatedCost: string;
  fallbackSolution: string;
  fallbackLocation: string;
  activationDelayHours: string;
  notes: string;
  plannedDate: string;
  resourceDetails: Record<string, unknown>;
}

const DEFAULT_FORM: FormState = {
  title: "", description: "", resourceCategory: "RH_COMPETENCES", status: "PLANNED",
  processId: "", sourceResourceType: "", sourceResourceName: "",
  gapClosurePercent: 0, estimatedCost: "", fallbackSolution: "",
  fallbackLocation: "", activationDelayHours: "", notes: "", plannedDate: "",
  resourceDetails: {},
};

export default function StrategiesClientV3({
  initialStrategies, processes, gaps, factoryId,
}: {
  initialStrategies: Strategy[];
  processes: { id: string; name: string; department: string }[];
  gaps: { id: string; title: string; severity: string }[];
  factoryId?: string;
}) {
  const [strategies, setStrategies] = useState<Strategy[]>(initialStrategies);
  const [showForm, setShowForm] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
  const [activeCategory, setActiveCategory] = useState<ResourceCategory>("RH_COMPETENCES");
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [isPending, startTransition] = useTransition();
  const [processData, setProcessData] = useState<ProcessData>(null);
  const [loadingProcess, setLoadingProcess] = useState(false);

  const byCategory: Record<ResourceCategory, Strategy[]> = Object.fromEntries(
    CATEGORIES.map(c => [c, strategies.filter(s => s.resourceCategory === c)])
  ) as Record<ResourceCategory, Strategy[]>;

  const globalAvg = strategies.length > 0
    ? Math.round(strategies.reduce((a, s) => a + s.gapClosurePercent, 0) / strategies.length)
    : 0;

  // Load process resource data when process is selected
  useEffect(() => {
    if (!form.processId) { setProcessData(null); return; }
    setLoadingProcess(true);
    getProcessResourceData(form.processId).then(result => {
      if (result.success) setProcessData(result.data);
      setLoadingProcess(false);
    });
  }, [form.processId]);

  async function handleSubmit() {
    if (!form.title || !form.processId) {
      toast.error("Titre et processus requis");
      return;
    }
    startTransition(async () => {
      const input: CreateStrategyInput = {
        title: form.title, description: form.description,
        resourceCategory: form.resourceCategory, status: form.status,
        processId: form.processId, factoryId,
        sourceResourceType: form.sourceResourceType || undefined,
        sourceResourceName: form.sourceResourceName || undefined,
        resourceDetails: form.resourceDetails as Record<string, unknown>,
        fallbackSolution: form.fallbackSolution || undefined,
        fallbackLocation: form.fallbackLocation || undefined,
        activationDelayHours: form.activationDelayHours ? parseInt(form.activationDelayHours) : undefined,
        estimatedCost: form.estimatedCost ? parseFloat(form.estimatedCost) : undefined,
        gapClosurePercent: form.gapClosurePercent,
        notes: form.notes || undefined,
        plannedDate: form.plannedDate || undefined,
      };

      const result = editingStrategy
        ? await updateStrategy({ id: editingStrategy.id, ...input })
        : await createStrategy(input);

      if (result.success) {
        toast.success(editingStrategy ? "Stratégie mise à jour" : "Stratégie créée");
        setShowForm(false); setEditingStrategy(null);
        const refreshed = await getStrategies(factoryId);
        if (refreshed.success && refreshed.data) setStrategies(refreshed.data as Strategy[]);
      } else {
        toast.error(result.error);
      }
    });
  }

  async function handleStatusChange(id: string, status: StrategyStatus) {
    await updateStrategy({ id, status });
    setStrategies(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    toast.success("Statut mis à jour");
  }

  async function handleDelete(id: string) {
    await deleteStrategy(id);
    setStrategies(prev => prev.filter(s => s.id !== id));
    toast.success("Stratégie supprimée");
  }

  function openNew(category: ResourceCategory) {
    setEditingStrategy(null);
    setForm({ ...DEFAULT_FORM, resourceCategory: category });
    setShowForm(true);
  }

  function openEdit(s: Strategy) {
    setEditingStrategy(s);
    setForm({
      title: s.title, description: s.description,
      resourceCategory: s.resourceCategory as ResourceCategory,
      status: s.status as StrategyStatus,
      processId: s.processId,
      sourceResourceType: (s as Record<string,unknown>).sourceResourceType as string || "",
      sourceResourceName: (s as Record<string,unknown>).sourceResourceName as string || "",
      gapClosurePercent: s.gapClosurePercent,
      estimatedCost: s.estimatedCost?.toString() || "",
      fallbackSolution: s.fallbackSolution || "",
      fallbackLocation: s.fallbackLocation || "",
      activationDelayHours: s.activationDelayHours?.toString() || "",
      notes: s.notes || "",
      plannedDate: s.plannedDate ? new Date(s.plannedDate).toISOString().split("T")[0] : "",
      resourceDetails: (s.resourceDetails as Record<string, unknown>) || {},
    });
    setShowForm(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Stratégies & Solutions de Continuité</h1>
          <p className="text-sm text-muted-foreground">
            6 catégories de ressources — ISO 22317 §8.3.3
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center bg-blue-50 border border-blue-200 rounded-xl px-4 py-2">
            <p className="text-xl font-bold text-blue-700">{globalAvg}%</p>
            <p className="text-xs text-muted-foreground">Gap closure global</p>
          </div>
          <Button onClick={() => openNew(activeCategory)} className="gap-2">
            <Plus className="h-4 w-4" /> Nouvelle stratégie
          </Button>
        </div>
      </div>

      {/* Global overview bar */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {CATEGORIES.map(cat => {
          const cfg = RESOURCE_CATEGORY_CONFIG[cat];
          const Icon = CATEGORY_ICONS[cat];
          const strats = byCategory[cat];
          const avg = strats.length > 0 ? Math.round(strats.reduce((a,s) => a+s.gapClosurePercent,0)/strats.length) : 0;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${activeCategory===cat?"border-current shadow-sm":"border-transparent hover:border-gray-200"}`}
              style={{ borderColor: activeCategory===cat ? cfg.color : undefined, background: activeCategory===cat ? cfg.bg : undefined }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: cfg.color }}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <p className="text-xs font-semibold text-center leading-tight" style={{ color: cfg.color }}>{cfg.labelShort}</p>
              <div className="w-full">
                <div className="h-1.5 rounded-full" style={{ background: `${cfg.border}` }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${avg}%`, background: cfg.color }} />
                </div>
                <p className="text-xs text-center font-bold mt-0.5" style={{ color: cfg.color }}>{avg}%</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tabs content */}
      <Tabs value={activeCategory} onValueChange={v => setActiveCategory(v as ResourceCategory)}>
        <TabsList className="hidden" />
        {CATEGORIES.map(cat => {
          const strats = byCategory[cat];
          return (
            <TabsContent key={cat} value={cat} className="mt-0">
              <CategoryHeader cat={cat} strategies={strats} onAdd={() => openNew(cat)} />
              {strats.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl"
                  style={{ borderColor: RESOURCE_CATEGORY_CONFIG[cat].border }}>
                  {(() => { const Icon = CATEGORY_ICONS[cat]; return <Icon className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: RESOURCE_CATEGORY_CONFIG[cat].color }} />; })()}
                  <p className="text-sm">Aucune stratégie {RESOURCE_CATEGORY_CONFIG[cat].label} définie</p>
                  <p className="text-xs text-muted-foreground mt-1">{RESOURCE_CATEGORY_CONFIG[cat].description}</p>
                  <Button size="sm" variant="outline" className="mt-3 gap-1" onClick={() => openNew(cat)}>
                    <Plus className="h-3 w-3" /> Créer la première
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {strats.map(s => (
                    <StrategyCard key={s.id} strategy={s}
                      onStatusChange={handleStatusChange} onEdit={openEdit} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {(() => { const cfg = RESOURCE_CATEGORY_CONFIG[form.resourceCategory]; const Icon = CATEGORY_ICONS[form.resourceCategory];
                return <><div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: cfg.color }}><Icon className="h-4 w-4 text-white" /></div>
                  {editingStrategy ? "Modifier" : "Nouvelle"} stratégie — {cfg.label}</>;
              })()}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Catégorie */}
            <div>
              <Label className="text-xs font-semibold mb-2 block">Catégorie de ressource</Label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(cat => {
                  const cfg = RESOURCE_CATEGORY_CONFIG[cat];
                  const Icon = CATEGORY_ICONS[cat];
                  return (
                    <button key={cat} type="button"
                      onClick={() => setForm(f => ({ ...f, resourceCategory: cat, resourceDetails: {} }))}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${form.resourceCategory===cat?"border-2":"border"}`}
                      style={{ borderColor: form.resourceCategory===cat ? cfg.color : undefined, background: form.resourceCategory===cat ? cfg.bg : undefined }}>
                      <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: cfg.color }}>
                        <Icon className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-xs font-medium" style={{ color: cfg.color }}>{cfg.labelShort}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs">Titre de la stratégie *</Label>
                <Input className="mt-1" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Processus concerné *</Label>
                <Select value={form.processId} onValueChange={v => setForm(f => ({ ...f, processId: v }))}>
                  <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                  <SelectContent>
                    {processes.map(p => <SelectItem key={p.id} value={p.id}>{p.name} — {p.department}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Statut</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as StrategyStatus }))}>
                  <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STRATEGY_STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Resource BIA source info */}
            {form.processId && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg">
                <div>
                  <Label className="text-xs text-muted-foreground">Ressource BIA source (référence)</Label>
                  <Input className="mt-1 h-8 text-xs" value={form.sourceResourceName}
                    onChange={e => setForm(f => ({ ...f, sourceResourceName: e.target.value }))}
                    placeholder="Ex: ERP SAP, Opérateur ligne A..." />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Description courte</Label>
                  <Input className="mt-1 h-8 text-xs" value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              </div>
            )}

            <Separator />

            {/* Resource-specific form */}
            <ResourceDetailsForm
              category={form.resourceCategory}
              details={form.resourceDetails}
              onChange={d => setForm(f => ({ ...f, resourceDetails: d }))}
            />

            <Separator />

            {/* Common fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Solution de repli principale</Label>
                <Input className="mt-1 h-8 text-xs" value={form.fallbackSolution} onChange={e => setForm(f => ({ ...f, fallbackSolution: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Localisation du repli</Label>
                <Input className="mt-1 h-8 text-xs" value={form.fallbackLocation} onChange={e => setForm(f => ({ ...f, fallbackLocation: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Délai d'activation global (h)</Label>
                <Input type="number" className="mt-1 h-8 text-xs" value={form.activationDelayHours} onChange={e => setForm(f => ({ ...f, activationDelayHours: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Gap closure % (0–100)</Label>
                <Input type="number" min={0} max={100} className="mt-1 h-8 text-xs" value={form.gapClosurePercent} onChange={e => setForm(f => ({ ...f, gapClosurePercent: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label className="text-xs">Coût estimé (TND)</Label>
                <Input type="number" className="mt-1 h-8 text-xs" value={form.estimatedCost} onChange={e => setForm(f => ({ ...f, estimatedCost: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Date planifiée</Label>
                <Input type="date" className="mt-1 h-8 text-xs" value={form.plannedDate} onChange={e => setForm(f => ({ ...f, plannedDate: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Notes complémentaires</Label>
              <Textarea className="mt-1 text-xs" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Enregistrement..." : editingStrategy ? "Mettre à jour" : "Créer la stratégie"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
