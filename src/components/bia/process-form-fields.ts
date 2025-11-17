/**
 * Configurations des champs pour les différentes sections BIA multi-éléments
 */

import { FieldConfig } from "./dynamic-list-field";

// Section 2: Activités Critiques
export const activitesCritiquesFields: FieldConfig[] = [
  {
    name: "nom_activite",
    label: "Nom de l'activité",
    type: "text",
    placeholder: "Ex: Traitement de la paie",
    required: true,
  },
  {
    name: "delai_legal_contractuel",
    label: "Délai légal/contractuel",
    type: "text",
    placeholder: "Ex: 5 jours ouvrables",
  },
  {
    name: "impacts_specifiques",
    label: "Impacts spécifiques",
    type: "textarea",
    placeholder: "Description des impacts...",
  },
  {
    name: "niveau_criticite",
    label: "Niveau de criticité",
    type: "select",
    options: [
      { value: "Critique", label: "Critique" },
      { value: "Élevé", label: "Élevé" },
      { value: "Moyen", label: "Moyen" },
      { value: "Faible", label: "Faible" },
    ],
  },
  { name: "rto", label: "RTO (heures)", type: "number", placeholder: "8" },
  { name: "mtpd", label: "MTPD (heures)", type: "number", placeholder: "48" },
  { name: "rpo", label: "RPO (heures)", type: "number", placeholder: "4" },
  { name: "mbco", label: "MBCO (heures)", type: "number", placeholder: "24" },
  {
    name: "solutions_contournement",
    label: "Solutions de contournement",
    type: "textarea",
    placeholder: "Description des alternatives...",
  },
];

// Section 5: Fournisseurs Externes
export const fournisseursFields: FieldConfig[] = [
  {
    name: "nom_fournisseur",
    label: "Nom du fournisseur",
    type: "text",
    placeholder: "Ex: Sage Tunisie",
    required: true,
  },
  {
    name: "services_taches_fournies",
    label: "Services/Tâches fournies",
    type: "textarea",
    placeholder: "Description des services...",
  },
  {
    name: "contact_nom",
    label: "Contact - Nom",
    type: "text",
    placeholder: "Nom du contact",
  },
  {
    name: "contact_telephone",
    label: "Contact - Téléphone",
    type: "text",
    placeholder: "+216 XX XXX XXX",
  },
  {
    name: "contact_email",
    label: "Contact - Email",
    type: "text",
    placeholder: "email@exemple.tn",
  },
  {
    name: "zone_geographique",
    label: "Zone géographique",
    type: "text",
    placeholder: "Ex: Tunis",
  },
  {
    name: "pca_disponible",
    label: "PCA disponible",
    type: "select",
    options: [
      { value: "Oui", label: "Oui" },
      { value: "Non", label: "Non" },
      { value: "Non vérifié", label: "Non vérifié" },
    ],
  },
  {
    name: "contrat_sla_continuite",
    label: "Contrat/SLA de continuité",
    type: "select",
    options: [
      { value: "Oui", label: "Oui" },
      { value: "Non", label: "Non" },
    ],
  },
  {
    name: "rto_contractuel",
    label: "RTO contractuel (heures)",
    type: "number",
    placeholder: "4",
  },
  {
    name: "mtpd_contractuel",
    label: "MTPD contractuel (heures)",
    type: "number",
    placeholder: "24",
  },
];

// Section 6: Obligations Légales
export const obligationsLegalesFields: FieldConfig[] = [
  {
    name: "nature_obligation",
    label: "Nature de l'obligation",
    type: "text",
    placeholder: "Ex: Déclaration CNSS mensuelle",
    required: true,
  },
  {
    name: "reference_legale",
    label: "Référence légale",
    type: "text",
    placeholder: "Ex: Code du Travail Art. 145",
  },
  {
    name: "autorite_regulation",
    label: "Autorité de régulation",
    type: "text",
    placeholder: "Ex: CNSS",
  },
  {
    name: "details_exigences",
    label: "Détails des exigences",
    type: "textarea",
    placeholder: "Description des exigences...",
  },
  {
    name: "consequences_non_conformite",
    label: "Conséquences de non-conformité",
    type: "textarea",
    placeholder: "Sanctions, pénalités...",
  },
];

// Section 7: Systèmes Informatiques
export const systemesInformatiquesFields: FieldConfig[] = [
  {
    name: "nom_application_systeme",
    label: "Nom application/système",
    type: "text",
    placeholder: "Ex: SIRH Sage",
    required: true,
  },
  {
    name: "type",
    label: "Type",
    type: "select",
    options: [
      { value: "ERP", label: "ERP" },
      { value: "SIRH", label: "SIRH" },
      { value: "CRM", label: "CRM" },
      { value: "MES", label: "MES" },
      { value: "GED", label: "GED" },
      { value: "Portail web", label: "Portail web" },
      { value: "Email", label: "Email" },
      { value: "Autre", label: "Autre" },
    ],
  },
  {
    name: "niveau_criticite",
    label: "Niveau de criticité",
    type: "select",
    options: [
      { value: "Critique", label: "Critique" },
      { value: "Important", label: "Important" },
      { value: "Normal", label: "Normal" },
    ],
  },
  {
    name: "impact_indisponibilite",
    label: "Impact en cas d'indisponibilité",
    type: "textarea",
    placeholder: "Description de l'impact...",
  },
  {
    name: "activites_metier_soutenues",
    label: "Activités métier soutenues",
    type: "textarea",
    placeholder: "Liste des activités (une par ligne)...",
  },
  {
    name: "systemes_secours_disponibles",
    label: "Systèmes de secours disponibles",
    type: "select",
    options: [
      { value: "Oui", label: "Oui" },
      { value: "Non", label: "Non" },
    ],
  },
  {
    name: "type_backup",
    label: "Type de backup",
    type: "text",
    placeholder: "Ex: Réplication temps réel + cloud",
  },
  { name: "rto", label: "RTO (heures)", type: "number", placeholder: "4" },
  { name: "rpo", label: "RPO (heures)", type: "number", placeholder: "1" },
  { name: "mtpd", label: "MTPD (heures)", type: "number", placeholder: "24" },
  {
    name: "solutions_contournement",
    label: "Solutions de contournement",
    type: "textarea",
    placeholder: "Alternatives en cas de panne...",
  },
  {
    name: "incidents_anterieurs",
    label: "Incidents antérieurs",
    type: "text",
    placeholder: "Historique...",
  },
  {
    name: "frequence_incidents",
    label: "Fréquence des incidents",
    type: "text",
    placeholder: "Ex: 2 fois/an",
  },
];

// Section 8: Infrastructures Physiques
export const infrastructuresFields: FieldConfig[] = [
  {
    name: "nom_type_infrastructure",
    label: "Nom/Type d'infrastructure",
    type: "text",
    placeholder: "Ex: Alimentation électrique",
    required: true,
  },
  {
    name: "categorie",
    label: "Catégorie",
    type: "select",
    options: [
      { value: "Électricité", label: "Électricité" },
      { value: "Réseau", label: "Réseau" },
      { value: "Télécom", label: "Télécom" },
      { value: "Locaux", label: "Locaux" },
      { value: "Autres", label: "Autres" },
    ],
  },
  {
    name: "niveau_criticite",
    label: "Niveau de criticité",
    type: "select",
    options: [
      { value: "Critique", label: "Critique" },
      { value: "Élevé", label: "Élevé" },
      { value: "Moyen", label: "Moyen" },
    ],
  },
  {
    name: "rto",
    label: "RTO (heures)",
    type: "number",
    placeholder: "0 (immédiat)",
  },
  { name: "mtpd", label: "MTPD (heures)", type: "number", placeholder: "2" },
  {
    name: "possibilite_travail_distance",
    label: "Possibilité de travail à distance",
    type: "select",
    options: [
      { value: "Oui", label: "Oui" },
      { value: "Non", label: "Non" },
      { value: "Partiel", label: "Partiel" },
    ],
  },
  {
    name: "possibilite_infra_alternatives",
    label: "Infrastructures alternatives disponibles",
    type: "select",
    options: [
      { value: "Oui", label: "Oui" },
      { value: "Non", label: "Non" },
    ],
  },
  {
    name: "localisation_alternative",
    label: "Localisation alternative",
    type: "text",
    placeholder: "Ex: Générateur 100 kVA",
  },
  {
    name: "delai_basculement",
    label: "Délai de basculement",
    type: "text",
    placeholder: "Ex: 30 secondes (automatique)",
  },
];

// Section 9: Rôles et Compétences Personnel
export const rolesPersonnelFields: FieldConfig[] = [
  {
    name: "intitule_role_fonction",
    label: "Intitulé du rôle/fonction",
    type: "text",
    placeholder: "Ex: Gestionnaire de paie",
    required: true,
  },
  {
    name: "nombre_personnes_affectees",
    label: "Nombre de personnes affectées",
    type: "number",
    placeholder: "2",
  },
  {
    name: "taches_principales",
    label: "Tâches principales",
    type: "textarea",
    placeholder: "Description des tâches...",
  },
  {
    name: "competences_uniques_rares",
    label: "Compétences uniques/rares",
    type: "textarea",
    placeholder: "Compétences spéciales requises...",
  },
  {
    name: "certifications_necessaires",
    label: "Certifications nécessaires",
    type: "text",
    placeholder: "Certifications...",
  },
  {
    name: "critique_immediatement",
    label: "Critique immédiatement après rupture",
    type: "select",
    options: [
      { value: "Oui", label: "Oui" },
      { value: "Non", label: "Non" },
    ],
  },
  {
    name: "delai_max_reprise_role",
    label: "Délai max de reprise du rôle (heures)",
    type: "number",
    placeholder: "24",
  },
  {
    name: "possibilite_remplacement",
    label: "Possibilité de remplacement",
    type: "select",
    options: [
      { value: "Oui", label: "Oui" },
      { value: "Non", label: "Non" },
      { value: "Partiel", label: "Partiel" },
    ],
  },
  {
    name: "remplace_par",
    label: "Remplacé par",
    type: "text",
    placeholder: "Qui ou quel service...",
  },
  {
    name: "solutions_contournement",
    label: "Solutions de contournement",
    type: "textarea",
    placeholder: "Alternatives...",
  },
  {
    name: "formation_requise_remplacement",
    label: "Formation requise pour remplacement",
    type: "text",
    placeholder: "Durée et description...",
  },
];

// Section 10A: Équipement Industriel
export const equipementsIndustrielsFields: FieldConfig[] = [
  {
    name: "designation_equipement",
    label: "Désignation de l'équipement",
    type: "text",
    placeholder: "Ex: Serveur SIRH Principal",
    required: true,
  },
  {
    name: "modele_reference",
    label: "Modèle/Référence",
    type: "text",
    placeholder: "Ex: Dell PowerEdge R740",
  },
  {
    name: "taches_executees",
    label: "Tâches exécutées",
    type: "textarea",
    placeholder: "Description des tâches...",
  },
  {
    name: "critique_apres_rupture",
    label: "Critique après rupture",
    type: "select",
    options: [
      { value: "Oui", label: "Oui" },
      { value: "Non", label: "Non" },
    ],
  },
  {
    name: "possibilite_reaffectation",
    label: "Possibilité de réaffectation",
    type: "select",
    options: [
      { value: "Oui", label: "Oui" },
      { value: "Non", label: "Non" },
    ],
  },
  { name: "rto", label: "RTO (heures)", type: "number", placeholder: "2" },
  { name: "mtpd", label: "MTPD (heures)", type: "number", placeholder: "8" },
  {
    name: "solutions_contournement",
    label: "Solutions de contournement",
    type: "textarea",
    placeholder: "Alternatives...",
  },
  {
    name: "tension_v",
    label: "Tension (V)",
    type: "number",
    placeholder: "220",
  },
  {
    name: "type_courant",
    label: "Type de courant",
    type: "select",
    options: [
      { value: "AC", label: "AC (Alternatif)" },
      { value: "DC", label: "DC (Continu)" },
      { value: "Triphasé", label: "Triphasé" },
    ],
  },
  {
    name: "puissance_nominale_kw",
    label: "Puissance nominale (kW)",
    type: "number",
    placeholder: "1.2",
  },
  {
    name: "puissance_demarrage_kw",
    label: "Puissance au démarrage (kW)",
    type: "number",
    placeholder: "1.5",
  },
  {
    name: "consommation_journaliere_kwh",
    label: "Consommation journalière (kWh)",
    type: "number",
    placeholder: "28.8",
  },
  {
    name: "compatible_systemes_secours",
    label: "Compatible avec systèmes de secours",
    type: "select",
    options: [
      { value: "Oui", label: "Oui" },
      { value: "Non", label: "Non" },
    ],
  },
];

// Section 10B: Équipement Bureautique
export const equipementsBureautiquesFields: FieldConfig[] = [
  {
    name: "type_equipement",
    label: "Type d'équipement",
    type: "text",
    placeholder: "Ex: Postes de travail informatiques",
    required: true,
  },
  {
    name: "quantite_disponible",
    label: "Quantité disponible",
    type: "number",
    placeholder: "15",
  },
  {
    name: "taches_supportees",
    label: "Tâches supportées",
    type: "textarea",
    placeholder: "Description des tâches...",
  },
  {
    name: "critique_apres_rupture",
    label: "Critique après rupture",
    type: "select",
    options: [
      { value: "Oui", label: "Oui" },
      { value: "Non", label: "Non" },
    ],
  },
  { name: "rto", label: "RTO (heures)", type: "number", placeholder: "24" },
  { name: "mtpd", label: "MTPD (heures)", type: "number", placeholder: "72" },
  {
    name: "quantite_requise_apres_incident",
    label: "Quantité requise après incident",
    type: "number",
    placeholder: "10",
  },
  {
    name: "possibilite_reaffectation",
    label: "Possibilité de réaffectation",
    type: "select",
    options: [
      { value: "Oui", label: "Oui" },
      { value: "Non", label: "Non" },
    ],
  },
  {
    name: "solutions_contournement",
    label: "Solutions de contournement",
    type: "textarea",
    placeholder: "Alternatives...",
  },
  {
    name: "fournisseur_remplacement_rapide",
    label: "Fournisseur de remplacement rapide",
    type: "text",
    placeholder: "Nom et délai...",
  },
];

// Section 11: Documentation Critique
export const documentationsFields: FieldConfig[] = [
  {
    name: "type_nom_documentation",
    label: "Type/Nom de documentation",
    type: "text",
    placeholder: "Ex: Procédures de paie",
    required: true,
  },
  {
    name: "format",
    label: "Format",
    type: "select",
    options: [
      { value: "Papier", label: "Papier" },
      { value: "Numérique", label: "Numérique" },
      { value: "Mixte", label: "Mixte" },
    ],
  },
  {
    name: "emplacement_stockage_principal",
    label: "Emplacement de stockage principal",
    type: "text",
    placeholder: "Ex: SharePoint RH",
  },
  {
    name: "emplacement_stockage_secondaire",
    label: "Emplacement de stockage secondaire",
    type: "text",
    placeholder: "Ex: Cloud Azure",
  },
  {
    name: "necessaire_apres_rupture",
    label: "Nécessaire après rupture",
    type: "select",
    options: [
      { value: "Oui", label: "Oui" },
      { value: "Non", label: "Non" },
    ],
  },
  { name: "rto", label: "RTO (heures)", type: "number", placeholder: "2" },
  {
    name: "niveau_criticite",
    label: "Niveau de criticité",
    type: "select",
    options: [
      { value: "Critique", label: "Critique" },
      { value: "Élevé", label: "Élevé" },
      { value: "Moyen", label: "Moyen" },
    ],
  },
  {
    name: "acces_disponible_ailleurs",
    label: "Accès disponible ailleurs",
    type: "select",
    options: [
      { value: "Oui", label: "Oui" },
      { value: "Non", label: "Non" },
    ],
  },
  {
    name: "localisation_acces_alternatif",
    label: "Localisation accès alternatif",
    type: "text",
    placeholder: "Où...",
  },
  {
    name: "remplacement_disponible_delais",
    label: "Remplacement disponible dans les délais",
    type: "select",
    options: [
      { value: "Oui", label: "Oui" },
      { value: "Non", label: "Non" },
    ],
  },
  {
    name: "mesures_remplacement",
    label: "Mesures de remplacement",
    type: "textarea",
    placeholder: "Comment...",
  },
  {
    name: "procedure_recuperation",
    label: "Procédure de récupération",
    type: "textarea",
    placeholder: "Description de la procédure...",
  },
];
