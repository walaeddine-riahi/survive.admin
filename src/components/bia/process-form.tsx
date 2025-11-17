'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useForm, Control, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Loader2, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { analyzeProcessPdf } from '@/actions/bia/analyze-process-pdf';
import { toast } from 'sonner';

// Définition du type Process pour éviter la dépendance à @prisma/client
export interface Process {
  // Informations de base
  id: string;
  name: string;
  description?: string | null;
  department: string;
  location: string;
  manager: string;
  criticalTimes?: string | null;
  
  // Métriques de reprise d'activité
  impact: string;
  criticality: 'low' | 'medium' | 'high' | 'critical';
  rto: number;
  mtpd: number;
  rpo: number;
  mbco: string;
  
  // Impacts de perturbation
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
  equipmentCriticality?: string | null;
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
  
  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
}

const processFormSchema = z.object({
  // 1. Informations de base
  name: z.string().min(3, { message: 'Le nom doit contenir au moins 3 caractères' }),
  description: z.string().optional(),
  department: z.string().min(1, { message: 'Le département est requis' }),
  location: z.string().min(1, { message: 'La localisation est requise' }),
  
  // 2. Activités et dépendances
  mainFunctionality: z.string().optional(),
  productDependencies: z.string().optional(),
  interServiceDependencies: z.string().optional(),
  criticalTimes: z.string().optional(),
  
  // 3. Impacts de perturbation
  financialImpact: z.string().optional(),
  operationalImpact: z.string().optional(),
  reputationImpact: z.string().optional(),
  operationalCapacityImpact: z.string().optional(),
  
  // 4. Applications IT
  itSystems: z.string().optional(),
  systemCriticality: z.string().optional(),
  systemImpact: z.string().optional(),
  supportedActivities: z.string().optional(),
  hasBackupSystems: z.boolean().default(false),
  systemRTO: z.coerce.number().min(0).optional(),
  systemRPO: z.coerce.number().min(0).optional(),
  systemMTPD: z.coerce.number().min(0).optional(),
  workarounds: z.string().optional(),
  previousIncidents: z.string().optional(),
  
  // 5. Activités externalisées
  externalSuppliers: z.string().optional(),
  supplierTasks: z.string().optional(),
  supplierContact: z.string().optional(),
  supplierContinuityPlan: z.boolean().default(false),
  hasSLAClause: z.boolean().default(false),
  supplierRTO: z.coerce.number().min(0).optional(),
  supplierMTPD: z.coerce.number().min(0).optional(),
  
  // 6. Cadre légal et réglementaire
  legalObligations: z.string().optional(),
  legalReferences: z.string().optional(),
  legalAuthority: z.string().optional(),
  legalDetails: z.string().optional(),
  nonComplianceConsequences: z.string().optional(),
  
  // 7. Infrastructure
  dependsOnPhysicalInfra: z.boolean().default(false),
  infrastructureType: z.string().optional(),
  infraRTO: z.coerce.number().min(0).optional(),
  infraMTPD: z.coerce.number().min(0).optional(),
  canWorkRemotely: z.boolean().default(false),
  canUseOtherInfra: z.boolean().default(false),
  
  // 8. Personnel / Compétences
  staffRoles: z.string().optional(),
  staffCount: z.coerce.number().min(0).optional(),
  staffTasks: z.string().optional(),
  uniqueSkills: z.string().optional(),
  criticalityAfterDisruption: z.string().optional(),
  roleRecoveryTime: z.string().optional(),
  canBeReplaced: z.boolean().default(false),
  replacementBy: z.string().optional(),
  staffWorkarounds: z.string().optional(),
  
  // 9. Équipement industriel
  industrialEquipment: z.string().optional(),
  equipmentTasks: z.string().optional(),
  equipmentCriticality: z.string().optional(),
  canReassignEquipment: z.boolean().default(false),
  equipmentRTO: z.coerce.number().min(0).optional(),
  equipmentMTPD: z.coerce.number().min(0).optional(),
  equipmentWorkarounds: z.string().optional(),
  voltage: z.string().optional(),
  currentType: z.string().optional(),
  powerRating: z.string().optional(),
  dailyConsumption: z.string().optional(),
  backupCompatible: z.boolean().default(false),
  
  // 10. Équipement bureautique
  officeEquipment: z.string().optional(),
  equipmentQuantity: z.coerce.number().min(0).optional(),
  officeEquipmentTasks: z.string().optional(),
  officeEquipmentCriticality: z.string().optional(),
  officeRTO: z.coerce.number().min(0).optional(),
  officeMTPD: z.coerce.number().min(0).optional(),
  requiredAfterDisruption: z.coerce.number().min(0).optional(),
  canReassignOfficeEquipment: z.boolean().default(false),
  officeWorkarounds: z.string().optional(),
  
  // 11. Documentation
  requiredDocumentation: z.string().optional(),
  documentationLocation: z.string().optional(),
  neededAfterDisruption: z.boolean().default(false),
  documentationRTO: z.coerce.number().min(0).optional(),
  hasAlternativeAccess: z.boolean().default(false),
  hasReplacement: z.boolean().default(false),
  replacementMeasures: z.string().optional(),
  
  // 12. Fournisseurs
  keySuppliers: z.string().optional(),
  providedService: z.string().optional(),
  supplierDetails: z.string().optional(),
  supplierCriticality: z.string().optional(),
  hasAlternativeSupplier: z.boolean().default(false),
  supplierHasContinuityPlan: z.boolean().default(false),
  
  // 13. Équipements
  // Les champs d'équipement sont déjà définis dans les sections 9 (industriel) et 10 (bureautique)
  
  // 14. Exigences légales
  legalRequirements: z.string().optional(),
  regulatoryBodies: z.string().optional(),
  complianceRequired: z.boolean().default(false),
  complianceDetails: z.string().optional(),
  penalties: z.string().optional(),
  legalDocuments: z.string().optional(),
  legalContact: z.string().optional(),
  
  // Champs existants avec validation
  impact: z.string().min(1, 'Veuillez sélectionner un impact.'),
  criticality: z.enum(['low', 'medium', 'high', 'critical'], {
    required_error: 'Veuillez sélectionner un niveau de criticité.',
  }),
  rto: z.coerce.number().min(0, 'Le RTO doit être un nombre positif.').default(0),
  mtpd: z.coerce.number().min(0, 'Le MTPD doit être un nombre positif.').default(0),
  rpo: z.coerce.number().min(0, 'Le RPO doit être un nombre positif.').default(0),
  mbco: z.string().min(1, 'Le MBCo est requis.'),
});

// Définition du type manuellement pour éviter les problèmes de récursion
type ProcessFormValues = {
  // Informations générales
  name: string;
  description?: string;
  department: string;
  location: string;
  manager: string;
  criticalTimes?: string;
  
  // Impacts de perturbation
  financialImpact?: string;
  operationalImpact?: string;
  reputationImpact?: string;
  operationalCapacityImpact?: string;
  
  // Métriques de reprise d'activité
  impact: string;
  criticality: 'low' | 'medium' | 'high' | 'critical';
  rto: number;
  mtpd: number;
  rpo: number;
  mbco: string;
  
  // Autres champs booléens
  supplierContinuityPlan: boolean;
  hasSLAClause: boolean;
  hasBackupSystems: boolean;
  dependsOnPhysicalInfra: boolean;
  canWorkRemotely: boolean;
  canUseOtherInfra: boolean;
  canBeReplaced: boolean;
  canReassignEquipment: boolean;
  backupCompatible: boolean;
  canReassignOfficeEquipment: boolean;
  neededAfterDisruption: boolean;
  hasAlternativeAccess: boolean;
  hasReplacement: boolean;
  hasAlternativeSupplier: boolean;
  supplierHasContinuityPlan: boolean;
  
  // Autres champs optionnels
  [key: string]: unknown; // Pour les champs supplémentaires non typés explicitement
};

interface ProcessFormProps {
  processId?: string;
  initialData?: Partial<Process>;
}

export function ProcessForm({ processId, initialData }: ProcessFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Fonction utilitaire pour convertir les valeurs null en undefined
  const sanitizeInitialData = (data: Partial<Process> | undefined): Partial<ProcessFormValues> => {
    if (!data) return {};
    
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = value === null ? undefined : value;
    }
    return sanitized;
  };

  const defaultValues: ProcessFormValues = {
    // Informations générales
    name: '',
    description: '',
    department: '',
    location: '',
    manager: '',
    criticalTimes: '',
    
    // Impacts de perturbation
    financialImpact: '',
    operationalImpact: '',
    reputationImpact: '',
    operationalCapacityImpact: '',
    
    // Métriques de reprise d'activité
    impact: 'medium',
    criticality: 'medium',
    rto: 0,
    mtpd: 0,
    rpo: 0,
    mbco: '',
    
    // Champs booléens
    supplierContinuityPlan: false,
    hasSLAClause: false,
    hasBackupSystems: false,
    dependsOnPhysicalInfra: false,
    canWorkRemotely: false,
    canUseOtherInfra: false,
    canBeReplaced: false,
    canReassignEquipment: false,
    backupCompatible: false,
    canReassignOfficeEquipment: false,
    neededAfterDisruption: false,
    hasAlternativeAccess: false,
    hasReplacement: false,
    hasAlternativeSupplier: false,
    supplierHasContinuityPlan: false,
    
    
    // Autres champs optionnels
    mainFunctionality: '',
    productDependencies: '',
    interServiceDependencies: '',
    externalSuppliers: '',
    supplierTasks: '',
    supplierContact: '',
    supplierMTPD: 0,
    legalObligations: '',
    legalReferences: '',
    legalAuthority: '',
    legalDetails: '',
    nonComplianceConsequences: '',
    itSystems: '',
    systemCriticality: '',
    systemImpact: '',
    supportedActivities: '',
    systemRTO: 0,
    systemRPO: 0,
    systemMTPD: 0,
    workarounds: '',
    previousIncidents: '',
    infrastructureType: '',
    infraRTO: 0,
    infraMTPD: 0,
    staffRoles: '',
    staffCount: 0,
    staffTasks: '',
    uniqueSkills: '',
    criticalityAfterDisruption: '',
    roleRecoveryTime: '',
    replacementBy: '',
    staffWorkarounds: '',
    industrialEquipment: '',
    equipmentTasks: '',
    equipmentCriticality: '',
    equipmentRTO: 0,
    equipmentMTPD: 0,
    equipmentWorkarounds: '',
    voltage: '',
    currentType: '',
    powerRating: '',
    dailyConsumption: '',
    officeEquipment: '',
    equipmentQuantity: 0,
    officeEquipmentTasks: '',
    officeEquipmentCriticality: '',
    officeRTO: 0,
    officeMTPD: 0,
    requiredAfterDisruption: 0,
    officeWorkarounds: '',
    requiredDocumentation: '',
    documentationLocation: '',
    documentationRTO: 0,
    replacementMeasures: '',
    keySuppliers: '',
    providedService: '',
    supplierDetails: '',
    supplierCriticality: '',
    supplierRTO: 0,
  };

  // Création des valeurs par défaut fusionnées
  const mergedDefaults = React.useMemo(() => ({
    ...defaultValues,
    ...sanitizeInitialData(initialData),
  }), [initialData]);

  const form = useForm<ProcessFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(processFormSchema) as any,
    defaultValues: mergedDefaults,
    mode: 'onChange',
  });
  
  // Forcer le typage pour les contrôles du formulaire
  const typedControl = form.control as unknown as Control<ProcessFormValues>;

  const { reset } = form;
  
  // Réinitialiser le formulaire avec les valeurs fusionnées lorsque initialData change
  useEffect(() => {
    console.log('Initial data reçu:', initialData);
    console.log('Valeurs par défaut fusionnées:', mergedDefaults);
    reset(mergedDefaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergedDefaults, reset]);

  const onSubmit: SubmitHandler<ProcessFormValues> = async (data) => {
    console.group('Soumission du formulaire');
    try {
      console.log('1. Données du formulaire:', data);
      
      // Validation du formulaire avec React Hook Form
      console.log('2. Validation du formulaire...');
      const validationResult = await form.trigger(undefined, { shouldFocus: true });
      console.log('3. Résultat de la validation:', validationResult);
      
      if (!validationResult) {
        const errors = form.formState.errors;
        console.warn('4. Échec de la validation du formulaire. Erreurs:', errors);
        
        // Trouver le premier champ en erreur et faire défiler jusqu'à lui
        const firstError = Object.keys(errors)[0];
        if (firstError) {
          const element = document.querySelector(`[name="${firstError}"]`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
        
        // Afficher un message d'erreur plus détaillé
        const errorMessages = errors ? 
          Object.values(errors)
            .map(err => err?.message)
            .filter((msg): msg is string => Boolean(msg))
          : [];
          
        const errorMessage = errorMessages.length > 0 
          ? `Veuillez corriger les erreurs suivantes :\n\n${errorMessages.join('\n')}`
          : 'Veuillez remplir tous les champs obligatoires.';
          
        alert(errorMessage);
        return;
      }
      
      console.log('4. Préparation des données pour l\'API...');
      setIsLoading(true);
      
      // Préparer les données pour l'API
      const processData = {
        // Informations générales
        name: data.name,
        description: data.description,
        department: data.department,
        location: data.location,
        criticalTimes: data.criticalTimes || null,
        
        // Inclure les responsables
        responsibles: responsibles.length > 0 ? responsibles : undefined,
        
        // Métriques de reprise d'activité
        impact: data.impact,
        criticality: data.criticality,
        rto: data.rto || 0,
        mtpd: data.mtpd || 0,
        rpo: data.rpo || 0,
        mbco: data.mbco,
        
        // Impacts de perturbation
        financialImpact: data.financialImpact || null,
        operationalImpact: data.operationalImpact || null,
        reputationImpact: data.reputationImpact || null,
        operationalCapacityImpact: data.operationalCapacityImpact || null,
        mainFunctionality: data.mainFunctionality || null,
        productDependencies: data.productDependencies || null,
        interServiceDependencies: data.interServiceDependencies || null,
        externalSuppliers: data.externalSuppliers || null,
        supplierTasks: data.supplierTasks || null,
        supplierContact: data.supplierContact || null,
        supplierContinuityPlan: data.supplierContinuityPlan || false,
        hasSLAClause: data.hasSLAClause || false,
        supplierRTO: data.supplierRTO || null,
        supplierMTPD: data.supplierMTPD || null,
        legalObligations: data.legalObligations || null,
        legalReferences: data.legalReferences || null,
        legalAuthority: data.legalAuthority || null,
        legalDetails: data.legalDetails || null,
        nonComplianceConsequences: data.nonComplianceConsequences || null,
        itSystems: data.itSystems || null,
        systemCriticality: data.systemCriticality || null,
        systemImpact: data.systemImpact || null,
        supportedActivities: data.supportedActivities || null,
        hasBackupSystems: data.hasBackupSystems || false,
        systemRTO: data.systemRTO || null,
        systemRPO: data.systemRPO || null,
        systemMTPD: data.systemMTPD || null,
        workarounds: data.workarounds || null,
        previousIncidents: data.previousIncidents || null,
        dependsOnPhysicalInfra: data.dependsOnPhysicalInfra || false,
        infrastructureType: data.infrastructureType || null,
        infraRTO: data.infraRTO || null,
        infraMTPD: data.infraMTPD || null,
        canWorkRemotely: data.canWorkRemotely || false,
        canUseOtherInfra: data.canUseOtherInfra || false,
        staffRoles: data.staffRoles || null,
        staffCount: data.staffCount || null,
        staffTasks: data.staffTasks || null,
        uniqueSkills: data.uniqueSkills || null,
        criticalityAfterDisruption: data.criticalityAfterDisruption || null,
        roleRecoveryTime: data.roleRecoveryTime || null,
        canBeReplaced: data.canBeReplaced || false,
        replacementBy: data.replacementBy || null,
        staffWorkarounds: data.staffWorkarounds || null,
        industrialEquipment: data.industrialEquipment || null,
        equipmentTasks: data.equipmentTasks || null,
        equipmentCriticality: data.equipmentCriticality || null,
        canReassignEquipment: data.canReassignEquipment || false,
        equipmentRTO: data.equipmentRTO || null,
        equipmentMTPD: data.equipmentMTPD || null,
        equipmentWorkarounds: data.equipmentWorkarounds || null,
        voltage: data.voltage || null,
        currentType: data.currentType || null,
        powerRating: data.powerRating || null,
        dailyConsumption: data.dailyConsumption || null,
        backupCompatible: data.backupCompatible || false,
        officeEquipment: data.officeEquipment || null,
        equipmentQuantity: data.equipmentQuantity || null,
        officeEquipmentTasks: data.officeEquipmentTasks || null,
        officeEquipmentCriticality: data.officeEquipmentCriticality || null,
        officeRTO: data.officeRTO || null,
        officeMTPD: data.officeMTPD || null,
        requiredAfterDisruption: data.requiredAfterDisruption || null,
        canReassignOfficeEquipment: data.canReassignOfficeEquipment || false,
        officeWorkarounds: data.officeWorkarounds || null,
        requiredDocumentation: data.requiredDocumentation || null,
        documentationLocation: data.documentationLocation || null,
        neededAfterDisruption: data.neededAfterDisruption || false,
        documentationRTO: data.documentationRTO || null,
        hasAlternativeAccess: data.hasAlternativeAccess || false,
        hasReplacement: data.hasReplacement || false,
        replacementMeasures: data.replacementMeasures || null,
        keySuppliers: data.keySuppliers || null,
        providedService: data.providedService || null,
        supplierDetails: data.supplierDetails || null,
        supplierCriticality: data.supplierCriticality || null,
        hasAlternativeSupplier: data.hasAlternativeSupplier || false,
        supplierHasContinuityPlan: data.supplierHasContinuityPlan || false,
      };
      
      // Appel à l'API pour créer ou mettre à jour le processus
      const url = processId ? '/api/bia/processes' : '/api/bia/processes';
      const method = processId ? 'PUT' : 'POST';
      const requestBody = processId ? { id: processId, ...processData } : processData;
      
      console.log('5. Appel API:', { url, method, body: requestBody });
      
      let response;
      let responseData;
      
      try {
        response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        // Essayer de parser la réponse en JSON
        try {
          responseData = await response.json();
        } catch (parseError) {
          console.error('Impossible de parser la réponse du serveur:', parseError);
          throw new Error('Réponse du serveur invalide');
        }
        
        if (!response.ok) {
          console.error('Erreur lors de la sauvegarde du processus', responseData);
          throw new Error(
            responseData?.error || 
            `Erreur ${response.status}: ${response.statusText}`
          );
        }
        
        console.log('7. Réponse du serveur:', responseData);
        
        // Rediriger vers la liste des processus après la création/mise à jour
        console.log('8. Redirection vers /bia');
        window.location.href = '/bia';
        
      } catch (fetchError) {
        console.error('Erreur lors de l\'appel API:', fetchError);
        throw fetchError; // Relancer l'erreur pour la gestion dans le bloc catch externe
      }
      
    } catch (error) {
      console.error('9. Erreur lors de la soumission:', error);
      
      // Afficher une notification d'erreur plus détaillée à l'utilisateur
      let errorMessage = 'Une erreur est survenue lors de la sauvegarde du processus';
      
      if (error instanceof Error) {
        console.error('10. Détails de l\'erreur:', error);
        errorMessage = error.message || errorMessage;
        
        // Afficher plus de détails sur les erreurs de validation
        if (error.message.includes('validation')) {
          errorMessage = 'Veuillez vérifier les champs du formulaire et réessayer.';
        }
      }
      
      // Utiliser une meilleure notification que alert() dans un environnement de production
      alert(errorMessage);
    } finally {
      console.log('9. Fin de la soumission, désactivation du chargement');
      setIsLoading(false);
      console.groupEnd();
    }
  };

  // État pour l'upload de PDF
  const [uploadingPdf, setUploadingPdf] = React.useState(false);
  const [pdfAnalysisResult, setPdfAnalysisResult] = React.useState<{
    name?: string;
    department?: string;
    criticality?: string;
    [key: string]: unknown;
  } | null>(null);

  return (
    <Form {...form}>
      <form 
        onSubmit={(e) => {
          console.log('Début de la soumission du formulaire');
          form.handleSubmit(onSubmit)(e).catch(error => {
            console.error('Erreur dans handleSubmit:', error);
          });
        }} 
        className="space-y-8"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="activities">Activités</TabsTrigger>
            <TabsTrigger value="applications">Applications IT</TabsTrigger>
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
            <TabsTrigger value="equipment">Équipements</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
            <TabsTrigger value="personnel">Personnel</TabsTrigger>
            <TabsTrigger value="suppliers">Fournisseurs</TabsTrigger>
            <TabsTrigger value="legal">Exigences légales</TabsTrigger>
          </TabsList>

          {/* Section d'upload et analyse de PDF */}
          <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Sparkles className="h-5 w-5" />
                Remplissage automatique depuis PDF
              </CardTitle>
              <CardDescription>
                Uploadez un rapport BIA au format PDF (ex: Rapport BIA - RH - SBC - V1.0.pdf) pour remplir automatiquement les champs du formulaire
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Zone d'upload */}
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".pdf"
                  id="pdf-upload"
                  disabled={uploadingPdf}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    setUploadingPdf(true);
                    setPdfAnalysisResult(null);

                    try {
                      const formData = new FormData();
                      formData.append('file', file);

                      toast.info('📄 Analyse du PDF en cours...');
                      const result = await analyzeProcessPdf(formData);

                      if (result.success && result.data) {
                        setPdfAnalysisResult(result);
                        toast.success(result.message || 'PDF analysé avec succès !');

                        // Remplir les champs du formulaire
                        const data = result.data;
                        
                        if (data.name) form.setValue('name', data.name);
                        if (data.description) form.setValue('description', data.description);
                        if (data.department) form.setValue('department', data.department);
                        if (data.location) form.setValue('location', data.location);
                        if (data.manager) form.setValue('manager', data.manager);
                        
                        // Métriques
                        if (data.criticality) form.setValue('criticality', data.criticality);
                        if (data.rto !== undefined) form.setValue('rto', data.rto);
                        if (data.mtpd !== undefined) form.setValue('mtpd', data.mtpd);
                        if (data.rpo !== undefined) form.setValue('rpo', data.rpo);
                        if (data.mbco) form.setValue('mbco', data.mbco);
                        if (data.impact) form.setValue('impact', data.impact);
                        
                        // Impacts
                        if (data.financialImpact) form.setValue('financialImpact', data.financialImpact);
                        if (data.operationalImpact) form.setValue('operationalImpact', data.operationalImpact);
                        if (data.reputationImpact) form.setValue('reputationImpact', data.reputationImpact);
                        
                        // Périmètre
                        if (data.mainFunctionality) form.setValue('mainFunctionality', data.mainFunctionality);
                        if (data.productDependencies) form.setValue('productDependencies', data.productDependencies);
                        if (data.interServiceDependencies) form.setValue('interServiceDependencies', data.interServiceDependencies);
                        
                        // Fournisseurs
                        if (data.externalSuppliers) form.setValue('externalSuppliers', data.externalSuppliers);
                        if (data.keySuppliers) form.setValue('keySuppliers', data.keySuppliers);
                        
                        // Personnel
                        if (data.staffRoles) form.setValue('staffRoles', data.staffRoles);
                        if (data.staffCount !== undefined) form.setValue('staffCount', data.staffCount);
                        
                        // IT
                        if (data.itSystems) form.setValue('itSystems', data.itSystems);
                        if (data.systemCriticality) form.setValue('systemCriticality', data.systemCriticality);
                        
                        // Infrastructure
                        if (data.dependsOnPhysicalInfra !== undefined) form.setValue('dependsOnPhysicalInfra', data.dependsOnPhysicalInfra);
                        if (data.infrastructureType) form.setValue('infrastructureType', data.infrastructureType);
                        
                        // Documentation et équipements
                        if (data.requiredDocumentation) form.setValue('requiredDocumentation', data.requiredDocumentation);
                        if (data.industrialEquipment) form.setValue('industrialEquipment', data.industrialEquipment);
                        if (data.officeEquipment) form.setValue('officeEquipment', data.officeEquipment);

                        toast.success('✅ Formulaire rempli automatiquement !', {
                          description: `Confiance: ${data.confidence || 0}% - Vérifiez et complétez les informations`
                        });
                      } else {
                        toast.error(result.error || 'Erreur lors de l\'analyse');
                        setPdfAnalysisResult(result);
                      }
                    } catch (error) {
                      console.error('Erreur:', error);
                      toast.error('Erreur lors de l\'analyse du PDF');
                    } finally {
                      setUploadingPdf(false);
                      // Réinitialiser l'input file
                      e.target.value = '';
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={uploadingPdf}
                  onClick={() => {
                    const input = document.getElementById('pdf-upload') as HTMLInputElement;
                    input?.click();
                  }}
                >
                  {uploadingPdf ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Résultat de l'analyse */}
              {pdfAnalysisResult && (
                <Alert className={pdfAnalysisResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  {pdfAnalysisResult.success ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className="ml-2">
                    {pdfAnalysisResult.success ? (
                      <div className="space-y-2">
                        <p className="font-medium text-green-800">
                          ✅ Analyse réussie
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {pdfAnalysisResult.data?.name && (
                            <Badge variant="outline">
                              <FileText className="h-3 w-3 mr-1" />
                              {pdfAnalysisResult.data.name}
                            </Badge>
                          )}
                          {pdfAnalysisResult.data?.confidence && (
                            <Badge variant="secondary">
                              Confiance: {pdfAnalysisResult.data.confidence}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-green-700 mt-2">
                          Les champs ont été remplis automatiquement. Vérifiez et complétez les informations manquantes.
                        </p>
                      </div>
                    ) : (
                      <p className="text-red-800">
                        ❌ {pdfAnalysisResult.error || 'Erreur lors de l\'analyse'}
                      </p>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {uploadingPdf && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyse du PDF en cours avec IA...</span>
                </div>
              )}
            </CardContent>
          </Card>

          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={typedControl}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du processus</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du processus" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

<FormField
                control={typedControl}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Département</FormLabel>
                    <FormControl>
                      <Input placeholder="Département" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={typedControl}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localisation</FormLabel>
                    <FormControl>
                      <Input placeholder="Localisation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={typedControl}
                name="criticality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau de criticité</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un niveau" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Faible</SelectItem>
                        <SelectItem value="medium">Moyen</SelectItem>
                        <SelectItem value="high">Élevé</SelectItem>
                        <SelectItem value="critical">Critique</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={typedControl}
                name="rto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RTO - Recovery Time Objective (heures)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Temps maximal d'indisponibilité acceptable" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={typedControl}
                name="mtpd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MTPD - Maximum Tolerable Period of Disruption (heures)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Période maximale d'indisponibilité" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={typedControl}
                name="rpo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RPO - Recovery Point Objective (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Perte de données maximale acceptable" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={typedControl}
                name="mbco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MBCo - Minimum Business Continuity Objective</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Objectif minimum de continuité d'activité" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={typedControl}
                name="impact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impact sur l&apos;entreprise</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un impact" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="financial">Financier</SelectItem>
                        <SelectItem value="reputation">Atteinte à la réputation</SelectItem>
                        <SelectItem value="legal">Conséquences légales</SelectItem>
                        <SelectItem value="operational">Perturbation opérationnelle</SelectItem>
                        <SelectItem value="safety">Sécurité des personnes</SelectItem>
                        <SelectItem value="environmental">Impact environnemental</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={typedControl}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Description détaillée</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Description complète du processus..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Activités du processus</h3>
                <p className="text-sm text-muted-foreground">
                  Définissez les activités principales de ce processus et leurs caractéristiques.
                </p>
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={typedControl}
                  name="mainFunctionality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fonctionnalité principale</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Décrivez la fonctionnalité principale du processus..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={typedControl}
                  name="criticalTimes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Périodes critiques</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Décrivez les périodes critiques d'activité (ex: fin de mois, saison haute...)"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={typedControl}
                    name="productDependencies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dépendances produits</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Liste des dépendances produits..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={typedControl}
                    name="interServiceDependencies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dépendances inter-services</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Liste des dépendances inter-services..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Applications IT</h3>
                <p className="text-sm text-muted-foreground">
                  Liste des applications informatiques critiques pour ce processus.
                </p>
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={typedControl}
                  name="itSystems"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Applications utilisées</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Liste des applications critiques (une par ligne)..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={typedControl}
                    name="systemCriticality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Niveau de criticité</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un niveau" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="critique">Critique</SelectItem>
                            <SelectItem value="eleve">Élevé</SelectItem>
                            <SelectItem value="moyen">Moyen</SelectItem>
                            <SelectItem value="faible">Faible</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={typedControl}
                    name="systemImpact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Impact en cas d'indisponibilité</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Impact sur le processus..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={typedControl}
                  name="supportedActivities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activités supportées</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Décrivez les activités supportées par ces applications..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={typedControl}
                    name="systemRTO"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RTO système (heures)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            placeholder="Ex: 4"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={typedControl}
                    name="systemRPO"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RPO système (minutes)</FormLabel>
                          <Input 
                            type="number" 
                            min="0"
                            placeholder="Ex: 15"
                            {...field}
                          />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={typedControl}
                    name="systemMTPD"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MTPD système (heures)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            placeholder="Ex: 24"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={typedControl}
                  name="hasBackupSystems"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Des systèmes de sauvegarde sont-ils en place ?
                        </FormLabel>
                        <FormDescription>
                          Cochez cette case si des sauvegardes sont configurées pour ces applications
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={typedControl}
                  name="workarounds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Solutions de contournement</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Décrivez les solutions de contournement en cas d'indisponibilité..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={typedControl}
                  name="previousIncidents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incidents antérieurs</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Décrivez les incidents passés et leurs résolutions..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="infrastructure" className="space-y-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Infrastructure</h3>
                <p className="text-sm text-muted-foreground">
                  Configuration de l&apos;infrastructure nécessaire pour le bon fonctionnement du processus.
                </p>
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={typedControl}
                  name="dependsOnPhysicalInfra"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Ce processus dépend-il d&apos;une infrastructure physique ?
                        </FormLabel>
                        <FormDescription>
                          Cochez cette case si le processus nécessite une infrastructure physique spécifique
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                {form.watch('dependsOnPhysicalInfra') && (
                  <div className="space-y-4">
                    <FormField
                      control={typedControl}
                      name="infrastructureType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type d&apos;infrastructure</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: Salle serveur, local technique, atelier..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={typedControl}
                        name="infraRTO"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>RTO infrastructure (heures)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0"
                                placeholder="Temps de reprise objectif"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={typedControl}
                        name="infraMTPD"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>MTPD infrastructure (heures)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0"
                                placeholder="Période maximale d'indisponibilité"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4 pt-2">
                      <FormField
                        control={typedControl}
                        name="canWorkRemotely"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Le personnel peut-il travailler à distance ?
                              </FormLabel>
                              <FormDescription>
                                Cochez cette case si le processus peut être exécuté à distance
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={typedControl}
                        name="canUseOtherInfra"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Peut-on utiliser d&apos;autres infrastructures en cas de problème ?
                              </FormLabel>
                              <FormDescription>
                                Cochez cette case si des infrastructures de secours sont disponibles
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={typedControl}
                      name="industrialEquipment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Équipement industriel</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Liste des équipements industriels critiques..."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={typedControl}
                        name="equipmentTasks"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tâches de l'équipement</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Description des tâches effectuées par l'équipement..."
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={typedControl}
                        name="equipmentCriticality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Criticité de l'équipement</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner un niveau" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="critique">Critique</SelectItem>
                                <SelectItem value="eleve">Élevé</SelectItem>
                                <SelectItem value="moyen">Moyen</SelectItem>
                                <SelectItem value="faible">Faible</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={typedControl}
                      name="canReassignEquipment"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Peut-on réaffecter l'équipement à d&apos;autres usages ?
                            </FormLabel>
                            <FormDescription>
                              Cochez cette case si l'équipement peut être réaffecté en cas de besoin
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Équipements</h3>
                <p className="text-sm text-muted-foreground">
                  Gestion des équipements nécessaires à ce processus.
                </p>
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={typedControl}
                  name="requiredEquipment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Équipements nécessaires</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Liste des équipements essentiels (un par ligne)..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={typedControl}
                    name="equipmentLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localisation des équipements</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Où sont situés les équipements ?"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={typedControl}
                    name="equipmentCriticality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Niveau de criticité</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un niveau" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="critique">Critique (arrêt complet sans cet équipement)</SelectItem>
                            <SelectItem value="eleve">Élevé (impact majeur sur les opérations)</SelectItem>
                            <SelectItem value="moyen">Moyen (impact modéré)</SelectItem>
                            <SelectItem value="faible">Faible (impact limité)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={typedControl}
                  name="equipmentRTO"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Délai de récupération maximal (heures)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          placeholder="Temps maximum acceptable d'indisponibilité"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4 pt-2">
                  <FormField
                    control={typedControl}
                    name="hasBackupEquipment"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Disposez-vous d'équipements de secours ?
                          </FormLabel>
                          <FormDescription>
                            Cochez cette case si des équipements de remplacement sont disponibles
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {form.watch('hasBackupEquipment') && (
                    <FormField
                      control={typedControl}
                      name="backupDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Détails des équipements de secours</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Décrivez les équipements de secours disponibles..."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={typedControl}
                    name="maintenanceRequired"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Une maintenance particulière est-elle requise ?
                          </FormLabel>
                          <FormDescription>
                            Cochez cette case si des procédures de maintenance spécifiques sont nécessaires
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {form.watch('maintenanceRequired') && (
                    <FormField
                      control={typedControl}
                      name="maintenanceDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Détails de la maintenance</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Décrivez les besoins en maintenance..."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={typedControl}
                    name="backupCompatible"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Les équipements sont-ils compatibles avec des systèmes de secours ?
                          </FormLabel>
                          <FormDescription>
                            Cochez cette case si les équipements peuvent fonctionner avec des systèmes de secours
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={typedControl}
                    name="canReassignEquipment"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Peut-on réaffecter l'équipement à d&apos;autres usages ?
                          </FormLabel>
                          <FormDescription>
                            Cochez cette case si l'équipement peut être réaffecté en cas de besoin
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={typedControl}
                    name="equipmentWorkarounds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Solutions de contournement</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Décrivez les solutions de contournement possibles..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="p-4 border rounded-md bg-muted/20">
                  <h4 className="text-sm font-medium mb-2">Recommandations pour la gestion des équipements</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Maintenir un inventaire à jour des équipements critiques</li>
                    <li>• Établir des contrats de maintenance préventive</li>
                    <li>• Prévoir des équipements de secours pour les éléments critiques</li>
                    <li>• Former le personnel aux procédures de maintenance de base</li>
                    <li>• Tester régulièrement les équipements de secours</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documentation" className="space-y-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Documentation</h3>
                <p className="text-sm text-muted-foreground">
                  Gestion de la documentation essentielle pour ce processus.
                </p>
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={typedControl}
                  name="requiredDocumentation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Documents requis</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Liste des documents essentiels (un par ligne)..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={typedControl}
                  name="documentationLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localisation des documents</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Où sont stockés ces documents ? (chemins, systèmes, etc.)"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4 pt-2">
                  <FormField
                    control={typedControl}
                    name="neededAfterDisruption"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Cette documentation est-elle nécessaire après une perturbation ?
                          </FormLabel>
                          <FormDescription>
                            Cochez cette case si les documents sont essentiels à la reprise d'activité
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {form.watch('neededAfterDisruption') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={typedControl}
                        name="documentationRTO"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Délai de récupération (heures)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0"
                                placeholder="Temps maximum acceptable"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={typedControl}
                        name="hasAlternativeAccess"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Accès alternatif disponible
                              </FormLabel>
                              <FormDescription>
                                Cochez si des copies de sauvegarde existent
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  
                  <FormField
                    control={typedControl}
                    name="hasReplacement"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Des mesures de remplacement sont-elles prévues ?
                          </FormLabel>
                          <FormDescription>
                            Cochez si des procédures alternatives existent
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {form.watch('hasReplacement') && (
                    <FormField
                      control={typedControl}
                      name="replacementMeasures"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mesures de remplacement</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Décrivez les procédures alternatives..."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                
                <div className="p-4 border rounded-md bg-muted/20">
                  <h4 className="text-sm font-medium mb-2">Bonnes pratiques de gestion documentaire</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Maintenir des copies de sécurité à jour des documents critiques</li>
                    <li>• Stocker les documents dans des emplacements sécurisés et redondants</li>
                    <li>• Documenter clairement les procédures de récupération</li>
                    <li>• Former le personnel aux procédures documentaires d&apos;urgence</li>
                    <li>• Réviser régulièrement l'actualité et la pertinence des documents</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="personnel" className="space-y-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Personnel</h3>
                <p className="text-sm text-muted-foreground">
                  Gestion du personnel et des compétences nécessaires au processus.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={typedControl}
                    name="staffCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de personnes nécessaires</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            placeholder="Nombre de personnes"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={typedControl}
                    name="roleRecoveryTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temps de reprise du rôle (heures)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            placeholder="Temps estimé"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={typedControl}
                  name="staffRoles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rôles et responsabilités</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Décrivez les rôles et responsabilités du personnel..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={typedControl}
                  name="staffTasks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tâches principales</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Liste des tâches principales effectuées par le personnel..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={typedControl}
                  name="uniqueSkills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compétences uniques ou spécifiques</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Listez les compétences uniques ou spécifiques requises..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={typedControl}
                  name="criticalityAfterDisruption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Criticité après perturbation</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un niveau" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="critique">Critique (arrêt complet)</SelectItem>
                          <SelectItem value="eleve">Élevé (fonctionnement très limité)</SelectItem>
                          <SelectItem value="moyen">Moyen (fonctionnement partiel)</SelectItem>
                          <SelectItem value="faible">Faible (peu d&apos;impact)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4 pt-2">
                  <FormField
                    control={typedControl}
                    name="canBeReplaced"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Le personnel peut-il être remplacé par d&apos;autres employés ?
                          </FormLabel>
                          <FormDescription>
                            Cochez cette case si d&apos;autres employés peuvent prendre le relais
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {form.watch('canBeReplaced') && (
                    <FormField
                      control={typedControl}
                      name="replacementBy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Remplaçable par</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Précisez qui peut remplacer le personnel (rôles, services, etc.)..."
                              className="min-h-[60px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                
                <FormField
                  control={typedControl}
                  name="staffWorkarounds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Solutions de contournement</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Décrivez les solutions de contournement en cas d'indisponibilité du personnel..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="p-4 border rounded-md bg-muted/20">
                  <h4 className="text-sm font-medium mb-2">Plan de continuité recommandé</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Former plusieurs personnes sur les rôles clés</li>
                    <li>• Documenter les procédures essentielles</li>
                    <li>• Identifier des ressources de remplacement potentielles</li>
                    <li>• Mettre en place un système de support à distance si possible</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Fournisseurs clés</h3>
                <p className="text-sm text-muted-foreground">
                  Gestion des fournisseurs critiques pour ce processus.
                </p>
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={typedControl}
                  name="keySuppliers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fournisseurs clés</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Liste des fournisseurs clés (un par ligne avec coordonnées)..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={typedControl}
                    name="providedService"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service fourni</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Type de service ou produit fourni"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={typedControl}
                    name="supplierCriticality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Niveau de criticité</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un niveau" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="critique">Critique (arrêt complet sans ce fournisseur)</SelectItem>
                            <SelectItem value="eleve">Élevé (impact majeur sur les opérations)</SelectItem>
                            <SelectItem value="moyen">Moyen (impact modéré)</SelectItem>
                            <SelectItem value="faible">Faible (impact limité)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={typedControl}
                  name="supplierDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Détails sur les fournisseurs</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Décrivez les détails des contrats, engagements et conditions particulières..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4 pt-2">
                  <FormField
                    control={typedControl}
                    name="hasAlternativeSupplier"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Existe-t-il des fournisseurs alternatifs ?
                          </FormLabel>
                          <FormDescription>
                            Cochez cette case si vous avez identifié des fournisseurs de remplacement
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={typedControl}
                    name="supplierHasContinuityPlan"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Le fournisseur dispose-t-il d&apos;un plan de continuité d'activité ?
                          </FormLabel>
                          <FormDescription>
                            Cochez cette case si le fournisseur a mis en place un PCA
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="p-4 border rounded-md bg-muted/20">
                  <h4 className="text-sm font-medium mb-2">Recommandations pour la gestion des fournisseurs</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Identifier et documenter des fournisseurs alternatifs pour les services critiques</li>
                    <li>• Négocier des contrats avec des clauses de continuité de service</li>
                    <li>• Vérifier régulièrement les plans de continuité des fournisseurs critiques</li>
                    <li>• Maintenir un stock de sécurité pour les fournitures essentielles</li>
                    <li>• Établir des procédures de basculement en cas de défaillance d&apos;un fournisseur</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="legal" className="space-y-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Exigences légales</h3>
                <p className="text-sm text-muted-foreground">
                  Gestion des obligations légales et réglementaires liées à ce processus.
                </p>
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={typedControl}
                  name="legalRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exigences légales applicables</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Liste des textes légaux et réglementaires applicables..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={typedControl}
                  name="regulatoryBodies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Autorités de régulation compétentes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Liste des organismes de contrôle (un par ligne)..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4 pt-2">
                  <FormField
                    control={typedControl}
                    name="complianceRequired"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Des exigences de conformité spécifiques s'appliquent-elles ?
                          </FormLabel>
                          <FormDescription>
                            Cochez cette case si votre secteur d'activité est soumis à des réglementations spécifiques
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {form.watch('complianceRequired') && (
                    <FormField
                      control={typedControl}
                      name="complianceDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Détails des exigences de conformité</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Décrivez les exigences spécifiques..."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                
                <FormField
                  control={typedControl}
                  name="penalties"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sanctions en cas de non-conformité</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Décrivez les risques et sanctions encourus..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={typedControl}
                    name="legalDocuments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Documents contractuels</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Références des contrats et documents"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={typedControl}
                    name="legalContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact juridique</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Personne ressource pour les questions juridiques"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="p-4 border rounded-md bg-muted/20">
                  <h4 className="text-sm font-medium mb-2">Recommandations pour la conformité légale</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Tenir à jour un registre des obligations légales</li>
                    <li>• Mettre en place des procédures de veille réglementaire</li>
                    <li>• Former régulièrement les équipes aux évolutions réglementaires</li>
                    <li>• Documenter les preuves de conformité</li>
                    <li>• Établir un plan d&apos;action pour les écarts de conformité</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
