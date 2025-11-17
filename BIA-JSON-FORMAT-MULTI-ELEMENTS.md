# 📋 Format JSON BIA - Structures Multiples

## Format de Sortie Complet avec Éléments Multiples

Le format JSON retourné par l'analyse AI doit inclure **des tableaux d'éléments** pour chaque section qui peut contenir plusieurs items.

---

## 🎯 Structure JSON Complète

```json
{
  "informations_generales": {
    "nom_processus": "Gestion des Ressources Humaines",
    "departement": "Direction des Ressources Humaines",
    "localisation": "Siège Social - Tunis",
    "responsable": {
      "nom": "Ahmed Ben Ali",
      "fonction": "Directeur RH",
      "contact": "a.benali@entreprise.tn"
    },
    "suppleant": {
      "nom": "Fatma Gharbi",
      "fonction": "Directrice RH Adjointe",
      "contact": "f.gharbi@entreprise.tn"
    },
    "impacts_globaux": "Arrêt processus paie, recrutement, gestion administrative",
    "criticite_globale": "Élevée",
    "metriques_globales": {
      "rto": 24,
      "mtpd": 72,
      "mbco": 12,
      "rpo": 8
    },
    "periodes_critiques": "Fin de mois (paie), périodes de recrutement massif"
  },

  "activites_critiques": [
    {
      "id": 1,
      "nom_activite": "Traitement de la paie",
      "delai_legal_contractuel": "5 jours ouvrables fin de mois",
      "impacts_specifiques": "Non-paiement des salaires, sanctions CNSS",
      "niveau_criticite": "Critique",
      "metriques": {
        "rto": 8,
        "mtpd": 48,
        "rpo": 4,
        "mbco": 24
      },
      "solutions_contournement": "Traitement manuel d'urgence via Excel + validation directeur"
    },
    {
      "id": 2,
      "nom_activite": "Recrutement et embauche",
      "delai_legal_contractuel": "Selon besoin opérationnel",
      "impacts_specifiques": "Ralentissement embauches, perte de candidats",
      "niveau_criticite": "Moyen",
      "metriques": {
        "rto": 72,
        "mtpd": 168,
        "rpo": 24,
        "mbco": 48
      },
      "solutions_contournement": "Gestion manuelle CVs + cabinet externe temporaire"
    },
    {
      "id": 3,
      "nom_activite": "Gestion des absences et congés",
      "delai_legal_contractuel": "Traitement quotidien",
      "impacts_specifiques": "Désorganisation planning, mécontentement employés",
      "niveau_criticite": "Élevé",
      "metriques": {
        "rto": 24,
        "mtpd": 72,
        "rpo": 12,
        "mbco": 24
      },
      "solutions_contournement": "Validation papier temporaire + saisie ultérieure"
    },
    {
      "id": 4,
      "nom_activite": "Formation continue",
      "delai_legal_contractuel": "Conformité plan formation annuel",
      "impacts_specifiques": "Reports de formations, non-conformité légale",
      "niveau_criticite": "Faible",
      "metriques": {
        "rto": 168,
        "mtpd": 720,
        "rpo": 72,
        "mbco": 168
      },
      "solutions_contournement": "Report planning formations + priorisation obligatoires"
    },
    {
      "id": 5,
      "nom_activite": "Administration du personnel",
      "delai_legal_contractuel": "Traitement hebdomadaire",
      "impacts_specifiques": "Retards documents administratifs, dossiers employés",
      "niveau_criticite": "Moyen",
      "metriques": {
        "rto": 48,
        "mtpd": 120,
        "rpo": 24,
        "mbco": 48
      },
      "solutions_contournement": "Traitement prioritaire manuel des urgences"
    }
  ],

  "analyse_impacts": {
    "financiers": {
      "pertes_directes_estimees": 50000,
      "couts_recuperation": 15000,
      "penalites_contractuelles": 10000,
      "impact_ca_annuel": "0.5%"
    },
    "operationnels": {
      "arrets_processus": [
        "Paie complète",
        "Recrutement",
        "Déclarations sociales"
      ],
      "ralentissements": ["Formation", "Administration courante"],
      "dysfonctionnements": ["Communication interne RH", "Gestion planning"],
      "retards_livraison": ["Bulletins de paie", "Contrats de travail"]
    },
    "reputation": {
      "image_marque": "Impact négatif sur image employeur",
      "confiance_clients": "Mécontentement employés = perte productivité",
      "impact_mediatique": "Risque médiatisation problèmes sociaux",
      "relations_partenaires": "Confiance CNSS et organismes sociaux"
    },
    "capacite": {
      "retards_livrables": "Déclarations sociales mensuelles",
      "non_respect_sla": "SLA internes RH non respectés",
      "perte_parts_marche": "Difficulté recrutement talents"
    }
  },

  "dependances": {
    "produits_services": [
      {
        "id": 1,
        "nom_produit_service": "Système SIRH Sage",
        "type_dependance": "IT - Critique",
        "fournisseur": "Sage Tunisie",
        "impact_indisponibilite": "Arrêt complet traitement paie et gestion RH"
      },
      {
        "id": 2,
        "nom_produit_service": "Service Comptabilité",
        "type_dependance": "Interne - Important",
        "fournisseur": "Direction Financière",
        "impact_indisponibilite": "Retards validation budgétaire RH"
      },
      {
        "id": 3,
        "nom_produit_service": "Connexion Internet ADSL",
        "type_dependance": "IT - Critique",
        "fournisseur": "Tunisie Telecom",
        "impact_indisponibilite": "Impossibilité accès SIRH cloud et emails"
      }
    ],
    "inter_services": [
      {
        "id": 1,
        "departement_fonction": "Direction IT",
        "type_soutien_fourni": "Support technique SIRH, gestion serveurs, cybersécurité",
        "criticite": "Critique"
      },
      {
        "id": 2,
        "departement_fonction": "Direction Générale",
        "type_soutien_fourni": "Validation décisions stratégiques RH, budget",
        "criticite": "Élevée"
      },
      {
        "id": 3,
        "departement_fonction": "Service Juridique",
        "type_soutien_fourni": "Validation contrats, conseil droit du travail",
        "criticite": "Moyenne"
      },
      {
        "id": 4,
        "departement_fonction": "Tous départements",
        "type_soutien_fourni": "Validation absences, validation recrutements",
        "criticite": "Élevée"
      }
    ]
  },

  "fournisseurs": [
    {
      "id": 1,
      "nom_fournisseur": "Sage Tunisie",
      "services_taches_fournies": "Éditeur SIRH, support technique, mises à jour",
      "contact": {
        "nom": "Karim Mansouri",
        "telephone": "+216 71 123 456",
        "email": "k.mansouri@sage.tn"
      },
      "zone_geographique": "Tunis",
      "pca_disponible": "Oui",
      "contrat_sla_continuite": "Oui",
      "metriques_contractuelles": {
        "rto": 4,
        "mtpd": 24
      }
    },
    {
      "id": 2,
      "nom_fournisseur": "Société Paie Expert",
      "services_taches_fournies": "Externalisation paie (backup)",
      "contact": {
        "nom": "Mohamed Triki",
        "telephone": "+216 71 987 654",
        "email": "m.triki@paieexpert.tn"
      },
      "zone_geographique": "Sousse",
      "pca_disponible": "Non vérifié",
      "contrat_sla_continuite": "Non",
      "metriques_contractuelles": {
        "rto": 48,
        "mtpd": 72
      }
    },
    {
      "id": 3,
      "nom_fournisseur": "Centre Formation RH Pro",
      "services_taches_fournies": "Formations obligatoires et continues",
      "contact": {
        "nom": "Leila Ben Salem",
        "telephone": "+216 71 456 789",
        "email": "l.bensalem@formation-rh.tn"
      },
      "zone_geographique": "Tunis",
      "pca_disponible": "Non",
      "contrat_sla_continuite": "Non",
      "metriques_contractuelles": {
        "rto": 168,
        "mtpd": 720
      }
    }
  ],

  "obligations_legales": [
    {
      "id": 1,
      "nature_obligation": "Déclaration CNSS mensuelle",
      "reference_legale": "Code du Travail Tunisien Art. 145",
      "autorite_regulation": "CNSS (Caisse Nationale de Sécurité Sociale)",
      "details_exigences": "Déclaration avant le 15 de chaque mois des cotisations",
      "consequences_non_conformite": "Pénalités de retard 1% par mois + poursuites"
    },
    {
      "id": 2,
      "nature_obligation": "Déclaration annuelle des salaires",
      "reference_legale": "Loi de finances 2024",
      "autorite_regulation": "Direction Générale des Impôts",
      "details_exigences": "Déclaration avant le 28 février de chaque année",
      "consequences_non_conformite": "Amende 1000 TND + majoration 25%"
    },
    {
      "id": 3,
      "nature_obligation": "Protection données personnelles",
      "reference_legale": "Loi 2004-63 modifiée par loi 2013-51",
      "autorite_regulation": "INPDP (Instance Nationale de Protection des Données Personnelles)",
      "details_exigences": "Déclaration des traitements RH, respect confidentialité",
      "consequences_non_conformite": "Sanctions pénales jusqu'à 5 ans prison + amendes"
    },
    {
      "id": 4,
      "nature_obligation": "Plan de formation obligatoire",
      "reference_legale": "Code du Travail Art. 234",
      "autorite_regulation": "Inspection du Travail",
      "details_exigences": "Formation continue minimum 1% masse salariale",
      "consequences_non_conformite": "Contribution formation doublée"
    }
  ],

  "systemes_informatiques": [
    {
      "id": 1,
      "nom_application_systeme": "SIRH Sage",
      "type": "SIRH",
      "niveau_criticite": "Critique",
      "impact_indisponibilite": "Arrêt complet traitement paie et gestion RH",
      "activites_metier_soutenues": [
        "Paie",
        "Gestion congés",
        "Administration personnel",
        "Reporting RH"
      ],
      "systemes_secours_disponibles": "Oui",
      "type_backup": "Réplication temps réel sur serveur secondaire + backup cloud Azure quotidien",
      "metriques": {
        "rto": 4,
        "rpo": 1,
        "mtpd": 24
      },
      "solutions_contournement": "Saisie manuelle temporaire Excel validée par directeur + rattrapage ultérieur",
      "incidents_anterieurs": "Panne serveur 2024-03-15 (2h) - Problème mise à jour 2024-06-20 (4h)",
      "frequence_incidents": "2 fois/an"
    },
    {
      "id": 2,
      "nom_application_systeme": "Portail RH Web",
      "type": "Portail web",
      "niveau_criticite": "Important",
      "impact_indisponibilite": "Gestion absences impossible, consultation bulletins bloquée",
      "activites_metier_soutenues": [
        "Demandes congés",
        "Consultation bulletins",
        "Déclarations absences"
      ],
      "systemes_secours_disponibles": "Oui",
      "type_backup": "Backup quotidien + serveur miroir",
      "metriques": {
        "rto": 24,
        "rpo": 24,
        "mtpd": 72
      },
      "solutions_contournement": "Formulaires papier temporaires + saisie ultérieure dans SIRH",
      "incidents_anterieurs": "Aucun incident majeur",
      "frequence_incidents": "0"
    },
    {
      "id": 3,
      "nom_application_systeme": "Messagerie Exchange",
      "type": "Email",
      "niveau_criticite": "Important",
      "impact_indisponibilite": "Communication RH difficile, ralentissement traitement demandes",
      "activites_metier_soutenues": [
        "Communication interne",
        "Réception candidatures",
        "Échanges fournisseurs"
      ],
      "systemes_secours_disponibles": "Oui",
      "type_backup": "Serveur Exchange redondant + Office 365 cloud",
      "metriques": {
        "rto": 2,
        "rpo": 0.5,
        "mtpd": 12
      },
      "solutions_contournement": "Utilisation webmail Office 365 + téléphone",
      "incidents_anterieurs": "Maintenance planifiée mensuelle",
      "frequence_incidents": "0 incidents non planifiés"
    },
    {
      "id": 4,
      "nom_application_systeme": "GED (Gestion Électronique Documents)",
      "type": "GED",
      "niveau_criticite": "Normal",
      "impact_indisponibilite": "Accès dossiers employés ralenti, consultation documents difficile",
      "activites_metier_soutenues": [
        "Archivage contrats",
        "Dossiers employés",
        "Procédures RH"
      ],
      "systemes_secours_disponibles": "Oui",
      "type_backup": "Backup hebdomadaire sur NAS + backup mensuel sur bandes",
      "metriques": {
        "rto": 48,
        "rpo": 24,
        "mtpd": 168
      },
      "solutions_contournement": "Consultation archives papier temporairement",
      "incidents_anterieurs": "Corruption base données 2023-11-10 (restauration 6h)",
      "frequence_incidents": "1 fois/2 ans"
    }
  ],

  "infrastructures": [
    {
      "id": 1,
      "nom_type_infrastructure": "Alimentation électrique principale",
      "categorie": "Électricité",
      "niveau_criticite": "Critique",
      "metriques": {
        "rto": 0,
        "mtpd": 2
      },
      "possibilite_travail_distance": "Partiel",
      "possibilite_infra_alternatives": "Oui",
      "localisation_alternative": "Générateur diesel 100 kVA sur site",
      "delai_basculement": "30 secondes (automatique via onduleur)"
    },
    {
      "id": 2,
      "nom_type_infrastructure": "Connexion Internet principale ADSL",
      "categorie": "Réseau",
      "niveau_criticite": "Critique",
      "metriques": {
        "rto": 1,
        "mtpd": 8
      },
      "possibilite_travail_distance": "Oui",
      "possibilite_infra_alternatives": "Oui",
      "localisation_alternative": "Connexion 4G secours (routeur Huawei)",
      "delai_basculement": "5 minutes (basculement manuel)"
    },
    {
      "id": 3,
      "nom_type_infrastructure": "Locaux bureaux RH",
      "categorie": "Locaux",
      "niveau_criticite": "Élevée",
      "metriques": {
        "rto": 24,
        "mtpd": 72
      },
      "possibilite_travail_distance": "Oui",
      "possibilite_infra_alternatives": "Oui",
      "localisation_alternative": "Site secondaire Sousse + télétravail",
      "delai_basculement": "4 heures"
    },
    {
      "id": 4,
      "nom_type_infrastructure": "Système de climatisation",
      "categorie": "Autres",
      "niveau_criticite": "Moyen",
      "metriques": {
        "rto": 24,
        "mtpd": 48
      },
      "possibilite_travail_distance": "Non",
      "possibilite_infra_alternatives": "Oui",
      "localisation_alternative": "Climatiseurs mobiles (2 unités disponibles)",
      "delai_basculement": "2 heures"
    },
    {
      "id": 5,
      "nom_type_infrastructure": "Système téléphonique PABX",
      "categorie": "Télécom",
      "niveau_criticite": "Moyen",
      "metriques": {
        "rto": 4,
        "mtpd": 24
      },
      "possibilite_travail_distance": "Non applicable",
      "possibilite_infra_alternatives": "Oui",
      "localisation_alternative": "Téléphones mobiles entreprise (8 lignes)",
      "delai_basculement": "Immédiat"
    }
  ],

  "roles_personnel": [
    {
      "id": 1,
      "intitule_role_fonction": "Gestionnaire de paie",
      "nombre_personnes_affectees": 2,
      "taches_principales": "Saisie éléments paie, calculs, déclarations sociales, bulletins",
      "competences_uniques_rares": "Maîtrise législation sociale tunisienne, expertise SIRH Sage",
      "certifications_necessaires": "Certification gestionnaire paie",
      "critique_immediatement": "Oui",
      "delai_max_reprise_role": 24,
      "possibilite_remplacement": "Partiel",
      "remplace_par": "Service comptabilité (calculs basiques uniquement)",
      "solutions_contournement": "Externalisation temporaire Société Paie Expert + validation DRH",
      "formation_requise_remplacement": "5 jours formation intensive SIRH + législation"
    },
    {
      "id": 2,
      "intitule_role_fonction": "Responsable recrutement",
      "nombre_personnes_affectees": 3,
      "taches_principales": "Sourcing candidats, entretiens, sélection, intégration",
      "competences_uniques_rares": "Psychologie du travail, techniques entretien",
      "certifications_necessaires": "Aucune obligatoire",
      "critique_immediatement": "Non",
      "delai_max_reprise_role": 168,
      "possibilite_remplacement": "Oui",
      "remplace_par": "Autres membres équipe RH + cabinets recrutement externes",
      "solutions_contournement": "Recours cabinet recrutement externe temporaire",
      "formation_requise_remplacement": "2 jours accompagnement processus"
    },
    {
      "id": 3,
      "intitule_role_fonction": "Responsable formation",
      "nombre_personnes_affectees": 1,
      "taches_principales": "Plan formation, gestion organismes, suivi budget, évaluation",
      "competences_uniques_rares": "Connaissance organismes formation, ingénierie pédagogique",
      "certifications_necessaires": "Aucune",
      "critique_immediatement": "Non",
      "delai_max_reprise_role": 336,
      "possibilite_remplacement": "Oui",
      "remplace_par": "Adjoint RH + organismes formation externes",
      "solutions_contournement": "Report formations non critiques + priorisation obligatoires",
      "formation_requise_remplacement": "3 jours passation procédures"
    },
    {
      "id": 4,
      "intitule_role_fonction": "Gestionnaire administratif personnel",
      "nombre_personnes_affectees": 2,
      "taches_principales": "Dossiers employés, contrats, attestations, courriers",
      "competences_uniques_rares": "Procédures administratives, droit du travail",
      "certifications_necessaires": "Aucune",
      "critique_immediatement": "Non",
      "delai_max_reprise_role": 72,
      "possibilite_remplacement": "Oui",
      "remplace_par": "Autres assistants administratifs RH",
      "solutions_contournement": "Priorisation urgences + délai rallongé documents standard",
      "formation_requise_remplacement": "1 jour formation procédures"
    },
    {
      "id": 5,
      "intitule_role_fonction": "Directeur RH",
      "nombre_personnes_affectees": 1,
      "taches_principales": "Stratégie RH, décisions majeures, relation Direction, budget",
      "competences_uniques_rares": "Vision stratégique, négociation, leadership",
      "certifications_necessaires": "Aucune obligatoire",
      "critique_immediatement": "Oui",
      "delai_max_reprise_role": 48,
      "possibilite_remplacement": "Partiel",
      "remplace_par": "Directeur RH Adjoint + support DG",
      "solutions_contournement": "Délégation responsabilités à adjoint + validation DG",
      "formation_requise_remplacement": "Passation dossiers en cours 2 jours"
    },
    {
      "id": 6,
      "intitule_role_fonction": "Assistant RH",
      "nombre_personnes_affectees": 2,
      "taches_principales": "Support administratif, accueil, courriers, archivage",
      "competences_uniques_rares": "Aucune compétence rare",
      "certifications_necessaires": "Aucune",
      "critique_immediatement": "Non",
      "delai_max_reprise_role": 168,
      "possibilite_remplacement": "Oui",
      "remplace_par": "Pool assistants administratifs entreprise",
      "solutions_contournement": "Réaffectation temporaire autre assistant",
      "formation_requise_remplacement": "1/2 journée découverte poste"
    }
  ],

  "equipements_industriels": [
    {
      "id": 1,
      "designation_equipement": "Serveur SIRH Principal",
      "modele_reference": "Dell PowerEdge R740",
      "taches_executees": "Hébergement base données SIRH, traitement paie, stockage dossiers",
      "critique_apres_rupture": "Oui",
      "possibilite_reaffectation": "Non",
      "metriques": {
        "rto": 2,
        "mtpd": 8
      },
      "solutions_contournement": "Basculement automatique sur serveur secondaire Dell R640",
      "caracteristiques_energetiques": {
        "tension_v": 220,
        "type_courant": "AC",
        "puissance_nominale_kw": 1.2,
        "puissance_demarrage_kw": 1.5,
        "consommation_journaliere_kwh": 28.8,
        "compatible_systemes_secours": "Oui"
      }
    },
    {
      "id": 2,
      "designation_equipement": "Scanner de documents RH",
      "modele_reference": "Canon DR-C240",
      "taches_executees": "Numérisation dossiers employés, contrats, bulletins paie archives",
      "critique_apres_rupture": "Non",
      "possibilite_reaffectation": "Oui",
      "metriques": {
        "rto": 48,
        "mtpd": 168
      },
      "solutions_contournement": "Utilisation scanner multifonction bureautique Canon MF445dw",
      "caracteristiques_energetiques": {
        "tension_v": 220,
        "type_courant": "AC",
        "puissance_nominale_kw": 0.05,
        "puissance_demarrage_kw": 0.06,
        "consommation_journaliere_kwh": 0.4,
        "compatible_systemes_secours": "Oui"
      }
    },
    {
      "id": 3,
      "designation_equipement": "Système de badgeage",
      "modele_reference": "ZKTeco K40",
      "taches_executees": "Pointage entrées/sorties, gestion temps présence, calcul heures",
      "critique_apres_rupture": "Oui",
      "possibilite_reaffectation": "Non",
      "metriques": {
        "rto": 24,
        "mtpd": 72
      },
      "solutions_contournement": "Feuilles de pointage papier + saisie manuelle ultérieure",
      "caracteristiques_energetiques": {
        "tension_v": 12,
        "type_courant": "DC",
        "puissance_nominale_kw": 0.01,
        "puissance_demarrage_kw": 0.015,
        "consommation_journaliere_kwh": 0.24,
        "compatible_systemes_secours": "Oui"
      }
    }
  ],

  "equipements_bureautiques": [
    {
      "id": 1,
      "type_equipement": "Postes de travail informatiques",
      "quantite_disponible": 15,
      "taches_supportees": "Travail bureautique, accès SIRH, emails, GED, internet",
      "critique_apres_rupture": "Oui",
      "metriques": {
        "rto": 24,
        "mtpd": 72
      },
      "quantite_requise_apres_incident": 10,
      "possibilite_reaffectation": "Oui",
      "solutions_contournement": "Utilisation pool général entreprise (20 PC disponibles)",
      "fournisseur_remplacement_rapide": "Distributeur IT local - Livraison sous 24h"
    },
    {
      "id": 2,
      "type_equipement": "Imprimantes multifonctions",
      "quantite_disponible": 3,
      "taches_supportees": "Impression bulletins paie, contrats, documents administratifs, scan",
      "critique_apres_rupture": "Oui",
      "metriques": {
        "rto": 12,
        "mtpd": 48
      },
      "quantite_requise_apres_incident": 2,
      "possibilite_reaffectation": "Oui",
      "solutions_contournement": "Utilisation imprimantes autres services + contrat SAV Canon 4h",
      "fournisseur_remplacement_rapide": "Canon Tunisie - Contrat SAV avec intervention 4h"
    },
    {
      "id": 3,
      "type_equipement": "Téléphones fixes",
      "quantite_disponible": 8,
      "taches_supportees": "Communication interne/externe, entretiens téléphoniques candidats",
      "critique_apres_rupture": "Non",
      "metriques": {
        "rto": 48,
        "mtpd": 168
      },
      "quantite_requise_apres_incident": 5,
      "possibilite_reaffectation": "Oui",
      "solutions_contournement": "Utilisation téléphones mobiles entreprise (8 lignes)",
      "fournisseur_remplacement_rapide": "Opérateur télécoms - Livraison sous 48h"
    },
    {
      "id": 4,
      "type_equipement": "Tablettes numériques",
      "quantite_disponible": 3,
      "taches_supportees": "Présentations, formations, mobilité direction",
      "critique_apres_rupture": "Non",
      "metriques": {
        "rto": 168,
        "mtpd": 720
      },
      "quantite_requise_apres_incident": 2,
      "possibilite_reaffectation": "Oui",
      "solutions_contournement": "Utilisation PC portables ou report présentations",
      "fournisseur_remplacement_rapide": "Fournisseur IT - Délai 7 jours"
    }
  ],

  "documentations": [
    {
      "id": 1,
      "type_nom_documentation": "Procédures de paie",
      "format": "Numérique",
      "emplacement_stockage_principal": "SharePoint RH - Dossier Procédures",
      "emplacement_stockage_secondaire": "Cloud Azure Europe + Copie locale DRH",
      "necessaire_apres_rupture": "Oui",
      "metriques": {
        "rto": 2
      },
      "niveau_criticite": "Critique",
      "acces_disponible_ailleurs": "Oui",
      "localisation_acces_alternatif": "Portable gestionnaire paie + Cloud Azure",
      "remplacement_disponible_delais": "Oui",
      "mesures_remplacement": "Téléchargement depuis cloud via VPN",
      "procedure_recuperation": "Connexion VPN + Authentification double facteur Azure AD"
    },
    {
      "id": 2,
      "type_nom_documentation": "Dossiers employés papier",
      "format": "Papier",
      "emplacement_stockage_principal": "Armoires sécurisées bureau RH (4 armoires)",
      "emplacement_stockage_secondaire": "Copies scannées sur SharePoint + GED",
      "necessaire_apres_rupture": "Oui",
      "metriques": {
        "rto": 24
      },
      "niveau_criticite": "Élevé",
      "acces_disponible_ailleurs": "Oui",
      "localisation_acces_alternatif": "Versions numériques sur SharePoint + GED",
      "remplacement_disponible_delais": "Oui",
      "mesures_remplacement": "Utilisation versions numériques en attendant accès physique",
      "procedure_recuperation": "Accès physique bureau + Clés armoires chez DG + Versions GED"
    },
    {
      "id": 3,
      "type_nom_documentation": "Contrats de travail signés",
      "format": "Mixte",
      "emplacement_stockage_principal": "Coffre-fort physique RH + GED",
      "emplacement_stockage_secondaire": "Backup GED quotidien sur NAS + Backup cloud mensuel",
      "necessaire_apres_rupture": "Non",
      "metriques": {
        "rto": 168
      },
      "niveau_criticite": "Moyen",
      "acces_disponible_ailleurs": "Oui",
      "localisation_acces_alternatif": "GED accessible depuis cloud via VPN",
      "remplacement_disponible_delais": "Oui",
      "mesures_remplacement": "Restauration depuis backup GED",
      "procedure_recuperation": "Récupération backup cloud via IT + Accès coffre si nécessaire"
    },
    {
      "id": 4,
      "type_nom_documentation": "Règlement intérieur",
      "format": "Mixte",
      "emplacement_stockage_principal": "Affichage physique + SharePoint",
      "emplacement_stockage_secondaire": "Cloud + Copies papier multiples sites",
      "necessaire_apres_rupture": "Non",
      "metriques": {
        "rto": 336
      },
      "niveau_criticite": "Faible",
      "acces_disponible_ailleurs": "Oui",
      "localisation_acces_alternatif": "SharePoint + Affichage tous sites + Intranet",
      "remplacement_disponible_delais": "Oui",
      "mesures_remplacement": "Réimpression depuis SharePoint",
      "procedure_recuperation": "Téléchargement SharePoint + Impression"
    },
    {
      "id": 5,
      "type_nom_documentation": "Formulaires administratifs",
      "format": "Numérique",
      "emplacement_stockage_principal": "SharePoint RH - Bibliothèque formulaires",
      "emplacement_stockage_secondaire": "Cloud Azure + Copies papier vierges",
      "necessaire_apres_rupture": "Oui",
      "metriques": {
        "rto": 4
      },
      "niveau_criticite": "Élevé",
      "acces_disponible_ailleurs": "Oui",
      "localisation_acces_alternatif": "Cloud Azure + Portail RH + Copies papier bureau",
      "remplacement_disponible_delais": "Oui",
      "mesures_remplacement": "Téléchargement cloud + Utilisation copies papier temporaires",
      "procedure_recuperation": "Accès SharePoint ou utilisation formulaires papier vierges"
    }
  ],

  "impacts": [
    {
      "type": "Financier",
      "description": "Impact financier lié aux interruptions paie et déclarations sociales",
      "severity": "haut",
      "financialImpact": 50000,
      "operationalImpact": "Pertes de revenus et coûts de récupération",
      "reputationalImpact": "Impact sur la confiance des employés"
    },
    {
      "type": "Opérationnel",
      "description": "Disruption des processus RH critiques et ralentissement des opérations",
      "severity": "haut",
      "financialImpact": null,
      "operationalImpact": "Arrêt complet paie et recrutement, ralentissement administration",
      "reputationalImpact": "Mécontentement employés et perte productivité"
    },
    {
      "type": "Réglementaire",
      "description": "Non-conformité aux obligations légales et risques de sanctions",
      "severity": "haut",
      "financialImpact": 10000,
      "operationalImpact": "Retards déclarations CNSS et impôts",
      "reputationalImpact": "Risque contentieux et poursuites"
    }
  ],

  "criticality": {
    "level": "haut",
    "score": 85,
    "justification": "Processus RH hautement critique : paie = obligation légale mensuelle, nombreuses dépendances IT, impacts employés directs, conformité légale stricte",
    "processes": [
      "Paie",
      "Recrutement",
      "Gestion congés",
      "Administration personnel",
      "Formation"
    ],
    "processOwner": "Ahmed Ben Ali",
    "ownerRole": "Directeur RH",
    "ownerContact": "a.benali@entreprise.tn"
  },

  "metrics": {
    "rto": 24,
    "mtpd": 72,
    "mbco": 12,
    "rpo": 8
  },

  "continuityLevel": {
    "level": "jaune",
    "score": 6,
    "description": "Maturité BCM moyenne - Mesures de continuité partielles en place (backups IT, fournisseur externe backup), mais lacunes sur plan communication crise, tests réguliers PCA, et formation équipes",
    "measures": [
      "Backup serveur SIRH avec réplication temps réel",
      "Contrat fournisseur externe paie (backup)",
      "Générateur électrique automatique",
      "Documentation procédures accessible cloud",
      "Connexion Internet secours 4G"
    ],
    "recommendations": [
      "Élaborer Plan de Continuité d'Activité RH complet et documenté",
      "Organiser tests PCA semestriels avec chronométrage RTO",
      "Former équipes aux procédures dégradées (paie manuelle, etc.)",
      "Mettre en place plan communication crise RH",
      "Vérifier PCA des fournisseurs critiques (Sage, Paie Expert)",
      "Documenter procédures de basculement infrastructure",
      "Créer kit de continuité RH (procédures, contacts, accès)",
      "Améliorer redondance rôles critiques (gestionnaire paie)"
    ]
  },

  "dependencies": [
    {
      "name": "Système SIRH Sage",
      "type": "système",
      "criticality": "critique",
      "description": "Application centrale pour toute la gestion RH",
      "impact": "Arrêt complet paie et administration RH"
    },
    {
      "name": "Serveur SIRH Principal",
      "type": "infrastructure",
      "criticality": "critique",
      "description": "Serveur hébergeant base données SIRH",
      "impact": "Indisponibilité totale système RH"
    },
    {
      "name": "Alimentation électrique",
      "type": "infrastructure",
      "criticality": "critique",
      "description": "Alimentation bureaux et serveurs",
      "impact": "Arrêt complet activité si >2h"
    },
    {
      "name": "Connexion Internet",
      "type": "infrastructure",
      "criticality": "critique",
      "description": "Accès SIRH cloud et communications",
      "impact": "Impossibilité accès système et emails"
    },
    {
      "name": "Gestionnaires de paie",
      "type": "personnel",
      "criticality": "critique",
      "description": "Compétences spécialisées paie",
      "impact": "Impossibilité traiter paie si absents"
    },
    {
      "name": "Service Comptabilité",
      "type": "fournisseur",
      "criticality": "important",
      "description": "Validation budgétaire RH",
      "impact": "Retards validation dossiers"
    },
    {
      "name": "Direction IT",
      "type": "personnel",
      "criticality": "critique",
      "description": "Support technique SIRH",
      "impact": "Impossibilité résoudre incidents IT"
    },
    {
      "name": "Sage Tunisie (éditeur)",
      "type": "fournisseur",
      "criticality": "critique",
      "description": "Support technique SIRH",
      "impact": "Impossibilité corriger bugs ou problèmes techniques"
    }
  ],

  "resume": "Le processus Gestion des Ressources Humaines présente une criticité ÉLEVÉE (85/100) avec un RTO global de 24h et MTPD de 72h. Les 5 activités critiques identifiées (paie, recrutement, congés, formation, administration) présentent des niveaux de criticité variables, la paie étant CRITIQUE avec RTO 8h. Les principaux impacts en cas de disruption sont financiers (50k€ estimés), opérationnels (arrêt paie) et réglementaires (non-conformité CNSS). Le processus dépend fortement du SIRH Sage (SPOF majeur), de 2 gestionnaires paie spécialisés (compétences rares), et de l'infrastructure IT (électricité, internet). 8 dépendances critiques identifiées dont 4 fournisseurs externes. Conformité légale stricte : 4 obligations majeures (CNSS, impôts, INPDP, formation). Infrastructure : 5 éléments critiques avec alternatives partielles. Personnel : 6 rôles dont 2 critiques (gestionnaire paie, DRH). Équipements : 3 industriels + 4 bureautiques avec solutions de contournement. Documentation : 5 types avec stockage redondant. Maturité BCM actuelle : JAUNE (6/10) - Mesures de base en place mais nécessite PCA formalisé, tests réguliers et formation équipes. Actions prioritaires : Plan de Continuité RH, tests semestriels, formation procédures dégradées, vérification PCA fournisseurs.",

  "continuityNeeds": {
    "equipment": [
      "Serveur SIRH Dell R740 (principal) + R640 (secours)",
      "15 postes de travail (min 10 requis)",
      "3 imprimantes multifonctions (min 2 requises)",
      "Scanner Canon DR-C240",
      "Système badgeage ZKTeco K40"
    ],
    "material": [
      "Formulaires papier vierges (urgence)",
      "Fournitures bureau standard",
      "Supports formation",
      "Archivage physique (armoires sécurisées)"
    ],
    "personnel": [
      "2 Gestionnaires de paie (CRITIQUE)",
      "1 Directeur RH (CRITIQUE)",
      "3 Responsables recrutement",
      "2 Gestionnaires admin personnel",
      "1 Responsable formation",
      "2 Assistants RH"
    ],
    "infrastructure": [
      "Alimentation électrique + générateur 100 kVA",
      "Connexion Internet ADSL + 4G secours",
      "Locaux bureaux + site secondaire Sousse",
      "Système climatisation + unités mobiles",
      "PABX + téléphones mobiles"
    ],
    "technology": [
      "SIRH Sage (cloud + on-premise)",
      "Portail RH Web",
      "Messagerie Exchange + Office 365",
      "GED (Gestion Électronique Documents)",
      "SharePoint RH",
      "Système badgeage"
    ],
    "supplyChain": [
      "Sage Tunisie (éditeur SIRH + support)",
      "Société Paie Expert (externalisation backup)",
      "Centre Formation RH Pro (formations)"
    ],
    "other": [
      "Kit de continuité RH (procédures imprimées)",
      "Contacts urgence à jour",
      "Accès VPN pour télétravail",
      "Procédures paie manuelle dégradée",
      "Plan communication crise RH"
    ]
  },

  "spof": [
    {
      "name": "Système SIRH Sage",
      "description": "Application unique pour toute la gestion RH sans alternative équivalente",
      "impact": "Arrêt complet paie, gestion congés, administration personnel. Impossibilité respecter délais légaux paie (5 jours)",
      "riskLevel": "critique",
      "mitigation": [
        "Serveur secondaire avec réplication temps réel (RTO 2h)",
        "Backup cloud Azure quotidien",
        "Contrat support Sage avec SLA 4h",
        "Procédures paie manuelle Excel (dégradé)",
        "Contrat externalisation backup (Société Paie Expert)"
      ]
    },
    {
      "name": "Gestionnaires de paie (2 personnes)",
      "description": "Compétences spécialisées détenues par seulement 2 personnes, non remplaçables rapidement",
      "impact": "Impossibilité traiter paie mensuelle en cas d'absence simultanée. Risque non-respect délais légaux",
      "riskLevel": "critique",
      "mitigation": [
        "Formation croisée service comptabilité (calculs basiques)",
        "Documentation procédures paie détaillées",
        "Contrat externalisation backup Société Paie Expert",
        "Recrutement 3ème gestionnaire paie (recommandation)",
        "Formation continue pour maintien compétences"
      ]
    },
    {
      "name": "Alimentation électrique principale",
      "description": "Source unique d'électricité pour bureaux et serveurs",
      "impact": "Arrêt complet activité RH et SIRH si panne >2h",
      "riskLevel": "critique",
      "mitigation": [
        "Générateur diesel 100 kVA avec basculement automatique 30s",
        "Onduleurs pour serveurs critiques",
        "Possibilité télétravail partiel (accès cloud)",
        "Maintenance préventive générateur mensuelle"
      ]
    },
    {
      "name": "Serveur SIRH Principal Dell R740",
      "description": "Serveur unique hébergeant base données SIRH principale",
      "impact": "Indisponibilité totale SIRH pendant restauration/réparation",
      "riskLevel": "élevé",
      "mitigation": [
        "Serveur secondaire Dell R640 avec basculement",
        "Réplication base données temps réel",
        "Backup quotidien sur NAS + cloud",
        "Contrat maintenance Dell avec intervention 4h",
        "Tests basculement semestriels"
      ]
    },
    {
      "name": "Connexion Internet principale ADSL",
      "description": "Lien unique pour accès SIRH cloud, emails et communications",
      "impact": "Impossibilité accès systèmes cloud, emails, télétravail",
      "riskLevel": "élevé",
      "mitigation": [
        "Connexion 4G secours (routeur Huawei)",
        "Basculement manuel 5 minutes",
        "Accès local serveur on-premise (secours)",
        "Téléphones mobiles pour communications critiques"
      ]
    },
    {
      "name": "Directeur RH (1 personne)",
      "description": "Décisions stratégiques et validations concentrées sur une seule personne",
      "impact": "Ralentissement décisions RH stratégiques, blocage validations budgétaires",
      "riskLevel": "moyen",
      "mitigation": [
        "Directeur RH Adjoint avec délégations partielles",
        "Procédures validation DG en secours",
        "Documentation dossiers en cours accessible",
        "Passation régulière avec adjoint"
      ]
    }
  ],

  "confidence": 85
}
```

## 💡 Points Clés de la Structure

### ✅ Sections Uniques

- `informations_generales`: 1 seul élément
- `analyse_impacts`: 1 ensemble global
- `criticality`, `metrics`, `continuityLevel`: Données globales

### 📊 Sections Multiples (Tableaux)

- `activites_critiques[]`: N activités
- `dependances.produits_services[]`: N dépendances
- `dependances.inter_services[]`: N dépendances
- `fournisseurs[]`: N fournisseurs
- `obligations_legales[]`: N obligations
- `systemes_informatiques[]`: N systèmes
- `infrastructures[]`: N infrastructures
- `roles_personnel[]`: N rôles
- `equipements_industriels[]`: N équipements
- `equipements_bureautiques[]`: N types
- `documentations[]`: N documentations
- `impacts[]`: N types d'impacts
- `dependencies[]`: N dépendances consolidées
- `spof[]`: N points de défaillance

### 📈 Avantages de la Structure Multiple

1. **Exhaustivité**: Capture TOUS les éléments du processus
2. **Granularité**: Métriques spécifiques par élément
3. **Traçabilité**: ID unique pour chaque élément
4. **Évolutivité**: Facile d'ajouter/supprimer des éléments
5. **Analyse**: Permet agrégations et statistiques détaillées
6. **BCM Professionnel**: Conforme aux standards ISO 22301

---

Ce format permet une analyse BIA **complète et professionnelle** ! 🎯
