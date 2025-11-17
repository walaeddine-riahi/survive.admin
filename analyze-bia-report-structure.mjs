/**
 * Script d'analyse de la structure d'un rapport BIA
 * Identifie tous les paramètres présents dans un rapport
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Structure complète des paramètres BIA SMCA/BCM
const BIA_STRUCTURE = {
  "Phase 1: Identification et Criticité Globale": {
    "Section 1: Informations Générales": {
      parametres: [
        "Nom du processus métier",
        "Département/Unité opérationnelle",
        "Localisation géographique",
        "Responsable process (Nom)",
        "Responsable process (Téléphone)",
        "Responsable process (Email)",
        "Responsable process (Fonction)",
        "Suppléant process (Nom)",
        "Suppléant process (Téléphone)",
        "Suppléant process (Email)",
        "Suppléant process (Fonction)",
        "Impacts en cas d'indisponibilité (Résumé)",
        "Criticité globale [Critique/Élevée/Moyenne/Faible]",
        "RTO (Recovery Time Objective) global en heures",
        "MTPD (Maximum Tolerable Period) global en heures",
        "MBCO (Minimum Business Continuity) global en heures",
        "RPO (Recovery Point Objective) global en heures",
        "Périodes critiques d'activité",
      ],
      exemples: {
        "Nom du processus": "Gestion des Ressources Humaines",
        Département: "Direction des Ressources Humaines",
        Localisation: "Siège Social - Tunis",
        Responsable: "Ahmed Ben Ali",
        Fonction: "Directeur RH",
        Email: "a.benali@entreprise.tn",
        Criticité: "Élevée",
        RTO: "24h",
        MTPD: "72h",
      },
    },
    "Section 2: Activités Critiques": {
      parametres: [
        "Liste des activités critiques (répétable)",
        "Pour chaque activité:",
        "  - Nom de l'activité",
        "  - Délai légal/contractuel de reprise",
        "  - Impacts spécifiques sur le processus",
        "  - Niveau de criticité [Critique/Élevé/Moyen/Faible]",
        "  - RTO de l'activité",
        "  - MTPD de l'activité",
        "  - RPO de l'activité",
        "  - MBCO de l'activité",
        "  - Solutions de contournement possibles",
      ],
      exemples: {
        "Activité 1": {
          Nom: "Traitement de la paie",
          "Délai légal": "5 jours ouvrables",
          Impact: "Non-paiement des salaires",
          Criticité: "Critique",
          RTO: "8h",
          MTPD: "48h",
          Contournement: "Traitement manuel d'urgence",
        },
        "Activité 2": {
          Nom: "Recrutement",
          Criticité: "Moyen",
          RTO: "72h",
        },
      },
    },
  },

  "Phase 2: Impacts et Dépendances": {
    "Section 3: Analyse des Impacts": {
      parametres: [
        "Impacts financiers:",
        "  - Pertes directes estimées",
        "  - Coûts de récupération",
        "  - Pénalités contractuelles",
        "  - Impact sur CA annuel",
        "Impacts opérationnels:",
        "  - Arrêts de processus",
        "  - Ralentissements",
        "  - Dysfonctionnements",
        "  - Retards de livraison",
        "Impacts sur la réputation:",
        "  - Impact image de marque",
        "  - Confiance des clients",
        "  - Impact médiatique",
        "  - Relations partenaires",
        "Impacts sur capacité opérationnelle:",
        "  - Retards dans les livrables",
        "  - Non-respect des SLA",
        "  - Perte de parts de marché",
      ],
      exemples: {
        Financier: "50000€/jour de perte",
        Opérationnel: "Arrêt complet du processus paie",
        Réputation: "Mécontentement employés et risque légal",
      },
    },
    "Section 4: Périmètre et Dépendances": {
      parametres: [
        "Fonctionnalité principale du processus",
        "Dépendances produits/services (répétable):",
        "  - Nom du produit/service",
        "  - Type de dépendance",
        "Dépendances inter-services (répétable):",
        "  - Département/Fonction dépendante",
        "  - Type de soutien fourni",
        "Interfaces critiques avec autres processus",
      ],
      exemples: {
        Fonctionnalité: "Gestion administrative du personnel",
        "Dépendance 1": "Service Comptabilité - Validation budgétaire",
        "Dépendance 2": "Service IT - Système SIRH",
      },
    },
  },

  "Phase 3: Ressources et Conformité": {
    "Section 5: Fournisseurs et Activités Externalisées": {
      parametres: [
        "Liste des fournisseurs externes critiques (répétable)",
        "Pour chaque fournisseur:",
        "  - Nom du fournisseur",
        "  - Service/tâches fournies",
        "  - Nom du contact fournisseur",
        "  - Téléphone contact",
        "  - Email contact",
        "  - Zone géographique",
        "  - PCA fournisseur disponible [Oui/Non/Non vérifié]",
        "  - Contrat/SLA continuité [Oui/Non]",
        "  - RTO contractuel fournisseur",
        "  - MTPD contractuel fournisseur",
      ],
      exemples: {
        "Fournisseur 1": {
          Nom: "Société Paie Expert",
          Service: "Externalisation paie",
          Contact: "Mohamed Triki",
          Email: "m.triki@paieexpert.tn",
          PCA: "Oui",
          SLA: "Oui",
          RTO: "4h",
        },
      },
    },
    "Section 6: Cadre Légal et Réglementaire": {
      parametres: [
        "Liste des obligations légales/réglementaires (répétable)",
        "Pour chaque obligation:",
        "  - Nature de l'obligation",
        "  - Référence légale (ISO, loi, décret, norme)",
        "  - Autorité de régulation compétente",
        "  - Détails et exigences spécifiques",
        "  - Conséquences en cas de non-conformité",
      ],
      exemples: {
        "Obligation 1": {
          Nature: "Déclaration CNSS mensuelle",
          Référence: "Code du Travail Tunisien Art. 145",
          Autorité: "CNSS",
          Délai: "15 du mois suivant",
          Conséquence: "Pénalités de retard 1% par mois",
        },
      },
    },
    "Section 7: Systèmes Informatiques (MES/Applications IT)": {
      parametres: [
        "Liste des applications/systèmes critiques (répétable)",
        "Pour chaque système:",
        "  - Nom de l'application/système",
        "  - Type (ERP, SIRH, CRM, etc.)",
        "  - Niveau de criticité [Critique/Important/Normal]",
        "  - Impact en cas d'indisponibilité",
        "  - Activités métier soutenues",
        "  - Systèmes de secours disponibles [Oui/Non]",
        "  - Type de backup (si applicable)",
        "  - RTO système",
        "  - RPO système",
        "  - MTPD système",
        "  - Solutions de contournement",
        "  - Incidents antérieurs (description)",
        "  - Fréquence des incidents",
      ],
      exemples: {
        "Système 1": {
          Nom: "SIRH Sage",
          Type: "SIRH",
          Criticité: "Critique",
          Impact: "Arrêt traitement paie",
          Backup: "Oui - Réplication temps réel",
          RTO: "4h",
          RPO: "1h",
          Contournement: "Saisie manuelle temporaire",
        },
      },
    },
    "Section 8: Infrastructure Physique": {
      parametres: [
        "Liste des infrastructures critiques (répétable)",
        "Pour chaque infrastructure:",
        "  - Nom/Type d'infrastructure",
        "  - Catégorie [Électricité/Réseau/Télécom/Locaux/Autres]",
        "  - Niveau de criticité",
        "  - RTO infrastructure",
        "  - MTPD infrastructure",
        "  - Possibilité de travail à distance [Oui/Non/Partiel]",
        "  - Possibilité d'utiliser infrastructures alternatives",
        "  - Localisation infrastructure alternative",
        "  - Délai de basculement",
      ],
      exemples: {
        "Infrastructure 1": {
          Type: "Alimentation électrique",
          Criticité: "Critique",
          RTO: "Immédiat",
          "Travail distance": "Partiel",
          Alternative: "Générateur de secours 100 kVA",
        },
      },
    },
  },

  "Phase 4: Personnel et Équipement": {
    "Section 9: Rôles et Compétences Personnel": {
      parametres: [
        "Liste des rôles critiques (répétable)",
        "Pour chaque rôle:",
        "  - Intitulé du rôle/fonction",
        "  - Nombre de personnes affectées",
        "  - Tâches principales exécutées",
        "  - Compétences uniques/rares requises",
        "  - Certifications nécessaires",
        "  - Critique immédiatement après rupture [Oui/Non]",
        "  - Délai maximum de reprise du rôle",
        "  - Possibilité de remplacement [Oui/Non/Partiel]",
        "  - Remplacé par (qui/quel service)",
        "  - Solutions de contournement si non remplacé",
        "  - Formation requise pour remplacement",
      ],
      exemples: {
        "Rôle 1": {
          Intitulé: "Gestionnaire de paie",
          Nombre: "2 personnes",
          Tâches: "Saisie paie, calculs, déclarations",
          Compétences: "Maîtrise législation sociale",
          Critique: "Oui",
          "Délai reprise": "24h",
          Remplacement: "Partiel - par service comptabilité",
        },
      },
    },
    "Section 10A: Équipement Industriel": {
      parametres: [
        "Liste des équipements industriels critiques (répétable)",
        "Pour chaque équipement:",
        "  - Désignation de l'équipement",
        "  - Modèle/Référence",
        "  - Tâches exécutées",
        "  - Critique après rupture [Oui/Non]",
        "  - Possibilité de réaffectation [Oui/Non]",
        "  - RTO équipement",
        "  - MTPD équipement",
        "  - Solutions/Procédures de contournement",
        "Caractéristiques énergétiques:",
        "  - Tension (V)",
        "  - Type de courant [AC/DC/Triphasé]",
        "  - Puissance nominale (KW)",
        "  - Puissance au démarrage (KW)",
        "  - Consommation journalière (KWh)",
        "  - Compatible avec systèmes secours [Oui/Non]",
      ],
      exemples: {
        "Équipement 1": {
          Désignation: "Serveur SIRH Principal",
          Modèle: "Dell PowerEdge R740",
          Tâche: "Hébergement base données RH",
          Critique: "Oui",
          RTO: "2h",
          Tension: "220V",
          "Type courant": "AC",
          Puissance: "1.2 KW",
          Consommation: "28.8 KWh/jour",
          "Compatible secours": "Oui",
        },
      },
    },
    "Section 10B: Équipement Bureautique": {
      parametres: [
        "Liste des équipements bureautiques critiques (répétable)",
        "Pour chaque type d'équipement:",
        "  - Type d'équipement",
        "  - Quantité disponible",
        "  - Tâches supportées",
        "  - Critique après rupture [Oui/Non]",
        "  - RTO équipement bureautique",
        "  - MTPD équipement bureautique",
        "  - Quantité requise après incident",
        "  - Possibilité de réaffectation [Oui/Non]",
        "  - Solutions/Procédures de contournement",
        "  - Fournisseur de remplacement rapide",
      ],
      exemples: {
        "Équipement 1": {
          Type: "Postes de travail informatiques",
          Quantité: "15 PC",
          Tâches: "Travail bureautique, accès SIRH",
          Critique: "Oui",
          RTO: "24h",
          "Quantité requise": "10 PC minimum",
          Réaffectation: "Oui - pool général",
        },
      },
    },
    "Section 11: Documentation Critique": {
      parametres: [
        "Liste des documentations nécessaires (répétable)",
        "Pour chaque documentation:",
        "  - Type/Nom de la documentation",
        "  - Format [Papier/Numérique/Mixte]",
        "  - Emplacement de stockage principal",
        "  - Emplacement de stockage secondaire",
        "  - Nécessaire après rupture [Oui/Non]",
        "  - RTO documentation",
        "  - Niveau de criticité",
        "  - Accès disponible ailleurs [Oui/Non]",
        "  - Localisation accès alternatif",
        "  - Remplacement disponible dans délais [Oui/Non]",
        "  - Mesures de remplacement",
        "  - Procédure de récupération",
      ],
      exemples: {
        "Documentation 1": {
          Type: "Procédures de paie",
          Format: "Numérique",
          Emplacement: "SharePoint RH",
          Backup: "Cloud Azure",
          Nécessaire: "Oui",
          RTO: "2h",
          "Accès ailleurs": "Oui",
          Mesure: "Copie locale sur portable gestionnaire",
        },
      },
    },
  },

  "Synthèse et Recommandations": {
    "Résumé Exécutif": {
      parametres: [
        "Synthèse des principales exigences de continuité",
        "RTO global consolidé",
        "MTPD global consolidé",
        "Principaux goulots d'étranglement identifiés",
        "Dépendances critiques majeures (top 5)",
        "SPOF (Single Points of Failure) identifiés",
        "Score de maturité BCM actuel",
        "Niveau de préparation [Vert/Jaune/Rouge]",
      ],
    },
    "Plan d'Actions Recommandé": {
      parametres: [
        "Actions prioritaires (0-3 mois)",
        "Actions moyen terme (3-6 mois)",
        "Actions long terme (6-12 mois)",
        "Budget estimé par action",
        "Responsables désignés",
        "Échéances cibles",
      ],
    },
  },
};

// Fonction pour afficher la structure complète
function displayBIAStructure() {
  console.log("\n" + "=".repeat(80));
  console.log("📊 STRUCTURE COMPLÈTE D'UN RAPPORT BIA SMCA/BCM");
  console.log("=".repeat(80) + "\n");

  let totalParametres = 0;

  for (const [phase, sections] of Object.entries(BIA_STRUCTURE)) {
    console.log("\n" + "▶".repeat(40));
    console.log(`📌 ${phase}`);
    console.log("▶".repeat(40) + "\n");

    for (const [sectionName, sectionData] of Object.entries(sections)) {
      console.log(`\n  📋 ${sectionName}`);
      console.log("  " + "-".repeat(60));

      if (sectionData.parametres) {
        console.log("\n  Paramètres à collecter:");
        sectionData.parametres.forEach((param, index) => {
          console.log(`    ${index + 1}. ${param}`);
          totalParametres++;
        });
      }

      if (sectionData.exemples) {
        console.log("\n  💡 Exemples:");
        console.log(
          "  " +
            JSON.stringify(sectionData.exemples, null, 4)
              .split("\n")
              .map((line) => "    " + line)
              .join("\n")
        );
      }
    }
  }

  console.log("\n\n" + "=".repeat(80));
  console.log(
    `📊 TOTAL: ${totalParametres}+ paramètres à analyser dans un rapport BIA complet`
  );
  console.log("=".repeat(80) + "\n");
}

// Fonction pour générer un fichier JSON de la structure
function exportStructureToJSON() {
  const outputPath = path.join(__dirname, "bia-structure-complete.json");
  fs.writeFileSync(outputPath, JSON.stringify(BIA_STRUCTURE, null, 2), "utf8");
  console.log(`\n✅ Structure exportée vers: ${outputPath}`);
}

// Fonction pour générer un template Excel/CSV
function generateCSVTemplate() {
  let csv = "Phase,Section,Paramètre,Exemple,Obligatoire\n";

  for (const [phase, sections] of Object.entries(BIA_STRUCTURE)) {
    for (const [sectionName, sectionData] of Object.entries(sections)) {
      if (sectionData.parametres) {
        sectionData.parametres.forEach((param) => {
          const isRequired =
            param.includes("Nom") ||
            param.includes("RTO") ||
            param.includes("Criticité")
              ? "Oui"
              : "Non";
          csv += `"${phase}","${sectionName}","${param}","",${isRequired}\n`;
        });
      }
    }
  }

  const outputPath = path.join(__dirname, "bia-template.csv");
  fs.writeFileSync(outputPath, csv, "utf8");
  console.log(`\n✅ Template CSV généré: ${outputPath}`);
}

// Fonction principale
function main() {
  const args = process.argv.slice(2);
  const action = args[0] || "display";

  switch (action) {
    case "display":
    case "show":
      displayBIAStructure();
      break;

    case "export":
    case "json":
      displayBIAStructure();
      exportStructureToJSON();
      break;

    case "csv":
    case "template":
      generateCSVTemplate();
      console.log("\n💡 Utilisez ce template pour préparer votre rapport BIA");
      break;

    case "all":
      displayBIAStructure();
      exportStructureToJSON();
      generateCSVTemplate();
      break;

    default:
      console.log("\n❌ Action inconnue:", action);
      console.log("\nUsage: node analyze-bia-report-structure.js [action]");
      console.log("\nActions disponibles:");
      console.log(
        "  display / show    - Afficher la structure complète (défaut)"
      );
      console.log("  export / json     - Exporter en JSON");
      console.log("  csv / template    - Générer un template CSV");
      console.log("  all               - Tout générer\n");
  }
}

// Exécution
main();

export { BIA_STRUCTURE };
