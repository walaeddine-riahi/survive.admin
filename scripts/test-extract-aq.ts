/**
 * Script de test pour extraire les données du document "Rapport BIA - AQ.docx"
 * Usage: ts-node --compiler-options '{"module":"commonjs"}' scripts/test-extract-aq.ts
 */

import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import { AzureOpenAI } from "openai";
import dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config();

const FILE_PATH = path.join(process.cwd(), "Rapport BIA - AQ.docx");

// Interface pour les données extraites par l'IA
interface ExtractedBIAData {
  name?: string | null;
  description?: string | null;
  department?: string | null;
  location?: string | null;
  processOwner?: string | null;
  ownerRole?: string | null;
  ownerEmail?: string | null;
  ownerPhone?: string | null;
  criticality?: "low" | "medium" | "high" | "critical" | null;
  rto?: number | null;
  mtpd?: number | null;
  rpo?: number | null;
  mbco?: string | null;
  criticalTimes?: string | null;
  financialImpact?: string | null;
  operationalImpact?: string | null;
  reputationImpact?: string | null;
  operationalCapacityImpact?: string | null;
  mainFunctionality?: string | null;
  productDependencies?: string | null;
  interServiceDependencies?: string | null;
  activitesCritiques?: Array<{
    nom?: string;
    criticite?: string;
    rto?: number;
    delai?: string;
    mtpd?: number;
    rpo?: number;
    mbco?: string;
    impactsOperationnels?: string;
    impactsReglementaires?: string;
    impactsImage?: string;
  }>;
  fournisseursExternes?: Array<{
    nom?: string;
    servicesOfferts?: string;
    contactNom?: string;
    contactEmail?: string;
    contactTelephone?: string;
    zoneGeographique?: string;
    isUniqueSupplier?: boolean;
    rto?: number;
    mtpd?: number;
    planContinuiteActivite?: string;
    clauseSLA?: string;
  }>;
  systemesInformatiques?: Array<{
    nom?: string;
    typeSysteme?: string;
    criticite?: string;
    impactIndisponibilite?: string;
    activitesAssociees?: string;
    sauvegardesEnPlace?: string;
    rto?: number;
    rpo?: number;
    mtpd?: number;
  }>;
  infrastructuresPhysiques?: unknown[];
  rolesPersonnel?: unknown[];
  equipementsIndustriels?: unknown[];
  equipementsBureautiques?: unknown[];
  documentationsCritiques?: unknown[];
  obligationsLegales?: unknown[];
  confidence?: number;
  [key: string]: unknown;
}

/**
 * Extrait le texte d'un fichier .docx
 */
async function extractTextFromDocx(filePath: string): Promise<string> {
  try {
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error(`Erreur lors de l'extraction du texte: ${error}`);
    return "";
  }
}

/**
 * Analyse le texte avec l'IA
 */
async function analyzeWithAI(
  text: string,
  processName: string
): Promise<ExtractedBIAData | null> {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";

  if (!apiKey || !endpoint) {
    console.error(
      "❌ AZURE_OPENAI_API_KEY ou AZURE_OPENAI_ENDPOINT non configurés !"
    );
    return null;
  }

  try {
    console.log(`🤖 Analyse IA en cours (Azure OpenAI - ${deployment})...`);
    const client = new AzureOpenAI({
      apiKey,
      endpoint,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview",
      deployment,
    });

    const prompt = `Tu es un extracteur de données STRICT pour Business Impact Analysis (BIA).

⛔ INTERDICTIONS ABSOLUES:
1. ❌ N'INVENTE AUCUN NOM de personne, entreprise ou fournisseur
2. ❌ NE CRÉE PAS de numéros de téléphone ou emails
3. ❌ NE DEVINE PAS de valeurs numériques
4. ❌ NE GÉNÈRE PAS d'exemples
5. ❌ NE COMPLÈTE PAS avec des informations logiques

✅ RÈGLES D'EXTRACTION:
- Si une information N'EST PAS dans le document → utilise null
- COPIE mot pour mot, ne reformule JAMAIS
- Pour les tableaux: copie UNIQUEMENT les lignes présentes
- Extrais TOUTES les données disponibles (pas seulement un résumé)

DOCUMENT (Processus: ${processName}):
${text.substring(0, 50000)}

Extrais TOUTES les informations au format JSON:
{
  "name": "Nom EXACT du processus",
  "description": "Description COMPLÈTE",
  "department": "Département EXACT",
  "location": "Localisation EXACTE",
  "processOwner": "Nom EXACT du responsable",
  "ownerRole": "Fonction EXACTE",
  "ownerEmail": "Email EXACT",
  "ownerPhone": "Téléphone EXACT",
  
  "criticality": "low/medium/high/critical",
  "rto": nombre d'heures,
  "mtpd": nombre d'heures,
  "rpo": nombre d'heures,
  "mbco": "MBCO EXACT",
  "criticalTimes": "Périodes critiques",
  
  "financialImpact": "Impact financier COMPLET",
  "operationalImpact": "Impact opérationnel COMPLET",
  "reputationImpact": "Impact réputation COMPLET",
  "operationalCapacityImpact": "Impact capacité COMPLET",
  
  "mainFunctionality": "Fonctionnalité principale COMPLÈTE",
  "productDependencies": "Dépendances produits COMPLÈTES",
  "interServiceDependencies": "Dépendances services COMPLÈTES",
  
  "activitesCritiques": [
    {
      "nom": "Nom activité",
      "criticite": "critical/high/medium/low",
      "delai": "Délai",
      "rto": nombre,
      "mtpd": nombre,
      "rpo": nombre,
      "mbco": "MBCO",
      "impactsOperationnels": "Impacts",
      "impactsReglementaires": "Impacts",
      "impactsImage": "Impacts"
    }
  ],
  
  "fournisseursExternes": [
    {
      "nom": "Nom fournisseur",
      "servicesOfferts": "Services",
      "contactNom": "Contact",
      "contactTelephone": "Téléphone",
      "contactEmail": "Email",
      "zoneGeographique": "Zone",
      "isUniqueSupplier": true/false,
      "rto": nombre,
      "mtpd": nombre,
      "planContinuiteActivite": "oui/non/inconnu",
      "clauseSLA": "oui/non/inconnu"
    }
  ],
  
  "systemesInformatiques": [
    {
      "nom": "Nom système",
      "typeSysteme": "Type",
      "criticite": "critical/high/medium/low",
      "impactIndisponibilite": "Impact",
      "activitesAssociees": "Activités",
      "sauvegardesEnPlace": "oui/non/inconnu",
      "rto": nombre,
      "rpo": nombre,
      "mtpd": nombre
    }
  ],
  
  "infrastructuresPhysiques": [],
  "rolesPersonnel": [],
  "equipementsIndustriels": [],
  "equipementsBureautiques": [],
  "documentationsCritiques": [],
  "obligationsLegales": [],
  
  "confidence": Score de 0 à 100
}

Réponds UNIQUEMENT avec le JSON complet, sans texte supplémentaire.`;

    const completion = await client.chat.completions.create({
      model: deployment,
      messages: [
        {
          role: "system",
          content:
            "Tu es un expert en extraction de données BIA. Tu réponds UNIQUEMENT en JSON valide, sans texte supplémentaire.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 4000,
    });

    let responseText = completion.choices[0]?.message?.content?.trim() || "{}";

    // Nettoyer la réponse
    if (responseText.startsWith("```json")) {
      responseText = responseText
        .replace(/```json\s*/, "")
        .replace(/```\s*$/, "");
    } else if (responseText.startsWith("```")) {
      responseText = responseText.replace(/```\s*/, "").replace(/```\s*$/, "");
    }

    const parsed = JSON.parse(responseText);

    return parsed;
  } catch (error) {
    console.error(`❌ Erreur analyse IA: ${error}`);
    return null;
  }
}

async function main() {
  console.log("🚀 Test d'extraction pour: Rapport BIA - AQ.docx\n");
  console.log("=".repeat(60));

  // Vérifier que le fichier existe
  if (!fs.existsSync(FILE_PATH)) {
    console.error(`❌ Fichier non trouvé: ${FILE_PATH}`);
    process.exit(1);
  }

  const stats = fs.statSync(FILE_PATH);
  console.log(`📄 Fichier: Rapport BIA - AQ.docx`);
  console.log(`📦 Taille: ${(stats.size / 1024).toFixed(2)} KB`);
  console.log("=".repeat(60) + "\n");

  // Extraire le texte
  console.log("📖 Extraction du texte du document Word...");
  const text = await extractTextFromDocx(FILE_PATH);

  if (!text || text.trim().length === 0) {
    console.error("❌ Aucun texte extrait !");
    process.exit(1);
  }

  console.log(`✅ ${text.length} caractères extraits\n`);
  console.log("📝 Aperçu du texte (premiers 500 caractères):");
  console.log("-".repeat(60));
  console.log(text.substring(0, 500));
  console.log("-".repeat(60) + "\n");

  // Analyser avec l'IA
  console.log("🤖 Analyse avec l'IA (Gemini 1.5 Flash)...\n");
  const aiData = await analyzeWithAI(text, "Assurance Qualité (AQ)");

  if (!aiData) {
    console.error("❌ Échec de l'analyse IA !");
    process.exit(1);
  }

  // Afficher les résultats
  console.log("\n" + "=".repeat(60));
  console.log("📊 RÉSULTATS DE L'EXTRACTION");
  console.log("=".repeat(60));

  console.log(`\n🎯 Confiance: ${aiData.confidence || 0}%`);

  const extractedCount = Object.keys(aiData).filter((k) => {
    const val = aiData[k];
    return (
      val !== null &&
      val !== undefined &&
      val !== "" &&
      (typeof val !== "object" ||
        (Array.isArray(val) && val.length > 0) ||
        Object.keys(val).length > 0)
    );
  }).length;

  console.log(
    `📋 Champs extraits: ${extractedCount}/${Object.keys(aiData).length}`
  );

  console.log("\n📄 Informations de base:");
  console.log(`   → Nom: ${aiData.name || "N/A"}`);
  console.log(`   → Département: ${aiData.department || "N/A"}`);
  console.log(
    `   → Responsable: ${aiData.processOwner || "N/A"} (${
      aiData.ownerRole || "N/A"
    })`
  );
  console.log(
    `   → Contact: ${aiData.ownerEmail || "N/A"} | ${
      aiData.ownerPhone || "N/A"
    }`
  );

  console.log("\n⚡ Métriques BIA:");
  console.log(`   → Criticité: ${aiData.criticality || "N/A"}`);
  console.log(`   → RTO: ${aiData.rto || "N/A"} heures`);
  console.log(`   → RPO: ${aiData.rpo || "N/A"} heures`);
  console.log(`   → MTPD: ${aiData.mtpd || "N/A"} heures`);
  console.log(`   → MBCO: ${aiData.mbco || "N/A"}`);

  console.log("\n💼 Impacts:");
  console.log(
    `   → Financier: ${
      aiData.financialImpact
        ? aiData.financialImpact.substring(0, 80) + "..."
        : "N/A"
    }`
  );
  console.log(
    `   → Opérationnel: ${
      aiData.operationalImpact
        ? aiData.operationalImpact.substring(0, 80) + "..."
        : "N/A"
    }`
  );
  console.log(
    `   → Réputation: ${
      aiData.reputationImpact
        ? aiData.reputationImpact.substring(0, 80) + "..."
        : "N/A"
    }`
  );

  console.log("\n📊 Tableaux extraits:");
  console.log(
    `   → Activités critiques: ${
      Array.isArray(aiData.activitesCritiques)
        ? aiData.activitesCritiques.length
        : 0
    }`
  );
  console.log(
    `   → Fournisseurs externes: ${
      Array.isArray(aiData.fournisseursExternes)
        ? aiData.fournisseursExternes.length
        : 0
    }`
  );
  console.log(
    `   → Systèmes informatiques: ${
      Array.isArray(aiData.systemesInformatiques)
        ? aiData.systemesInformatiques.length
        : 0
    }`
  );
  console.log(
    `   → Infrastructures physiques: ${
      Array.isArray(aiData.infrastructuresPhysiques)
        ? aiData.infrastructuresPhysiques.length
        : 0
    }`
  );
  console.log(
    `   → Personnel: ${
      Array.isArray(aiData.rolesPersonnel) ? aiData.rolesPersonnel.length : 0
    }`
  );
  console.log(
    `   → Équipements industriels: ${
      Array.isArray(aiData.equipementsIndustriels)
        ? aiData.equipementsIndustriels.length
        : 0
    }`
  );
  console.log(
    `   → Équipements bureautiques: ${
      Array.isArray(aiData.equipementsBureautiques)
        ? aiData.equipementsBureautiques.length
        : 0
    }`
  );
  console.log(
    `   → Documentations: ${
      Array.isArray(aiData.documentationsCritiques)
        ? aiData.documentationsCritiques.length
        : 0
    }`
  );
  console.log(
    `   → Obligations légales: ${
      Array.isArray(aiData.obligationsLegales)
        ? aiData.obligationsLegales.length
        : 0
    }`
  );

  // Détails des tableaux
  if (
    Array.isArray(aiData.activitesCritiques) &&
    aiData.activitesCritiques.length > 0
  ) {
    console.log("\n📋 Activités critiques détaillées:");
    aiData.activitesCritiques.forEach((act, i: number) => {
      console.log(
        `   ${i + 1}. ${act.nom} (${act.criticite}) - RTO: ${act.rto}h`
      );
    });
  }

  if (
    Array.isArray(aiData.fournisseursExternes) &&
    aiData.fournisseursExternes.length > 0
  ) {
    console.log("\n🏭 Fournisseurs externes détaillés:");
    aiData.fournisseursExternes.forEach((fournisseur, i: number) => {
      console.log(
        `   ${i + 1}. ${fournisseur.nom} - ${fournisseur.servicesOfferts}`
      );
      console.log(
        `      Contact: ${fournisseur.contactNom} (${fournisseur.contactEmail})`
      );
    });
  }

  if (
    Array.isArray(aiData.systemesInformatiques) &&
    aiData.systemesInformatiques.length > 0
  ) {
    console.log("\n💻 Systèmes informatiques détaillés:");
    aiData.systemesInformatiques.forEach((sys, i: number) => {
      console.log(
        `   ${i + 1}. ${sys.nom} (${sys.typeSysteme}) - Criticité: ${
          sys.criticite
        }`
      );
    });
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Extraction terminée avec succès !");
  console.log("=".repeat(60));

  // Sauvegarder le JSON complet
  const outputPath = path.join(process.cwd(), "extraction-aq-result.json");
  fs.writeFileSync(outputPath, JSON.stringify(aiData, null, 2), "utf-8");
  console.log(
    `\n💾 Résultat complet sauvegardé dans: extraction-aq-result.json`
  );
}

main()
  .then(() => {
    console.log("\n✅ Test terminé avec succès!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erreur:", error);
    process.exit(1);
  });
