/**
 * Script d'importation des processus depuis le dossier raouf vers l'usine SBC
 * Avec extraction détaillée des données via AI
 * Usage: ts-node --compiler-options '{"module":"commonjs"}' scripts/import-raouf-processes.ts
 */

import { PrismaClient, Prisma } from "@prisma/client";
import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import { AzureOpenAI } from "openai";

const prisma = new PrismaClient();

const RAOUF_FOLDER = path.join(process.cwd(), "raouf");
const FACTORY_CODE = "SBC"; // Code de l'usine cible

// Mapping des noms de fichiers vers les départements
const DEPARTMENT_MAPPING: Record<string, string> = {
  "Supply Chain": "Supply Chain & Logistique",
  RH: "Ressources Humaines",
  Production: "Production",
  Performance: "Performance & Excellence",
  Siroperie: "Production - Siroperie",
  TPM: "Total Productive Maintenance",
  "Maintenance Préventive": "Maintenance Préventive",
  "Maintenance Curative": "Maintenance Curative",
  Utilités: "Utilités & Énergie",
  Hygiène: "Hygiène & Sécurité Alimentaire",
  HSE: "Hygiène Sécurité Environnement",
  Finance: "Finance & Contrôle de Gestion",
  DG: "Direction Générale",
  CQ: "Contrôle Qualité",
  Comptabilité: "Comptabilité",
  CG: "Contrôle de Gestion",
  AQ: "Assurance Qualité",
  Sûreté: "Sûreté & Services Généraux",
};

// Mapping des départements vers criticité par défaut
const CRITICALITY_MAPPING: Record<
  string,
  "critical" | "high" | "medium" | "low"
> = {
  Production: "critical",
  "Production - Siroperie": "critical",
  "Supply Chain & Logistique": "critical",
  "Contrôle Qualité": "high",
  "Assurance Qualité": "high",
  HSE: "high",
  "Maintenance Préventive": "high",
  "Maintenance Curative": "high",
  "Utilités & Énergie": "high",
  "Finance & Contrôle de Gestion": "medium",
  "Ressources Humaines": "medium",
  "Direction Générale": "medium",
};

async function extractProcessNameFromFile(filename: string): Promise<string> {
  // Extraire le nom du processus depuis le nom de fichier
  // Ex: "Rapport BIA - Supply Chain - SBC - V1.0.docx" -> "Supply Chain"
  const match = filename.match(
    /Rapport BIA - (.+?)(?: - SBC)?(?:\._Ajusté)?(?:\s*\(\d+\))?(?:_\d+)?\.docx$/i
  );
  if (match) {
    return match[1].trim();
  }
  return filename
    .replace(/\.docx$/i, "")
    .replace(/Rapport BIA - /i, "")
    .trim();
}

function getDepartmentFromProcessName(processName: string): string {
  // Trouver le département correspondant
  for (const [key, department] of Object.entries(DEPARTMENT_MAPPING)) {
    if (processName.toLowerCase().includes(key.toLowerCase())) {
      return department;
    }
  }
  return processName; // Par défaut, utiliser le nom du processus comme département
}

function getCriticality(
  department: string
): "critical" | "high" | "medium" | "low" {
  return CRITICALITY_MAPPING[department] || "medium";
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
  activitesCritiques?: unknown[];
  fournisseursExternes?: unknown[];
  systemesInformatiques?: unknown[];
  confidence?: number;
}

/**
 * Analyse le texte avec l'IA pour extraire les données structurées
 */
async function analyzeWithAI(
  text: string,
  processName: string
): Promise<ExtractedBIAData | null> {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";

  if (!apiKey || !endpoint) {
    console.warn("⚠️  Azure OpenAI non configuré, données minimales seulement");
    return null;
  }

  try {
    console.log(`   🤖 Analyse IA en cours (Azure OpenAI - ${deployment})...`);
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

DOCUMENT (Processus: ${processName}):
${text.substring(0, 20000)}

Extrais les informations au format JSON:
{
  "name": "Nom EXACT du processus ou null",
  "description": "Description EXACTE ou null",
  "department": "Département EXACT ou null",
  "location": "Localisation EXACTE ou null",
  "processOwner": "Nom EXACT du responsable ou null",
  "ownerRole": "Fonction EXACTE du responsable ou null",
  "ownerEmail": "Email EXACT ou null",
  "ownerPhone": "Téléphone EXACT ou null",
  
  "criticality": "low/medium/high/critical SI MENTIONNÉ ou null",
  "rto": Nombre EXACT d'heures ou null,
  "mtpd": Nombre EXACT d'heures ou null,
  "rpo": Nombre EXACT d'heures ou null,
  "mbco": "MBCO EXACT ou null",
  "criticalTimes": "Périodes critiques EXACTES ou null",
  
  "financialImpact": "Impact financier EXACT ou null",
  "operationalImpact": "Impact opérationnel EXACT ou null",
  "reputationImpact": "Impact réputation EXACT ou null",
  "operationalCapacityImpact": "Impact capacité EXACT ou null",
  
  "mainFunctionality": "Fonctionnalité principale EXACTE ou null",
  "productDependencies": "Dépendances produits EXACTES ou null",
  "interServiceDependencies": "Dépendances services EXACTES ou null",
  
  "activitesCritiques": [
    {
      "nom": "Nom EXACT de l'activité",
      "criticite": "critical/high/medium/low",
      "delai": "Délai EXACT",
      "rto": nombre,
      "mtpd": nombre,
      "rpo": nombre,
      "mbco": "MBCO EXACT",
      "impactsOperationnels": "Impacts EXACTS",
      "impactsReglementaires": "Impacts EXACTS",
      "impactsImage": "Impacts EXACTS"
    }
  ] ou [],
  
  "fournisseursExternes": [
    {
      "nom": "Nom EXACT du fournisseur",
      "servicesOfferts": "Services EXACTS",
      "contactNom": "Contact EXACT",
      "contactTelephone": "Téléphone EXACT",
      "contactEmail": "Email EXACT",
      "zoneGeographique": "Zone EXACTE",
      "isUniqueSupplier": true/false,
      "rto": nombre,
      "mtpd": nombre,
      "planContinuiteActivite": "oui/non/inconnu",
      "clauseSLA": "oui/non/inconnu"
    }
  ] ou [],
  
  "systemesInformatiques": [
    {
      "nom": "Nom EXACT du système",
      "typeSysteme": "Type EXACT",
      "criticite": "critical/high/medium/low",
      "impactIndisponibilite": "Impact EXACT",
      "activitesAssociees": "Activités EXACTES",
      "sauvegardesEnPlace": "oui/non/inconnu",
      "rto": nombre,
      "rpo": nombre,
      "mtpd": nombre
    }
  ] ou [],
  
  "confidence": Score de 0 à 100
}

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire.`;

    const completion = await client.chat.completions.create({
      model: deployment,
      messages: [
        {
          role: "system",
          content:
            "Tu es un expert en extraction de données BIA. Tu réponds UNIQUEMENT en JSON valide.",
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
    console.log(
      `   ✅ IA: ${parsed.confidence || 0}% de confiance, ${
        Object.keys(parsed).filter(
          (k) => parsed[k] !== null && parsed[k] !== undefined
        ).length
      } champs extraits`
    );

    return parsed;
  } catch (error) {
    console.error(`   ❌ Erreur analyse IA: ${error}`);
    return null;
  }
}

async function importProcesses() {
  console.log(
    "🚀 Début de l'importation des processus depuis le dossier raouf...\n"
  );

  // 1. Trouver l'usine SBC
  const factory = await prisma.factory.findFirst({
    where: { code: FACTORY_CODE },
  });

  if (!factory) {
    console.error(`❌ Usine avec le code "${FACTORY_CODE}" non trouvée!`);
    console.log("\n💡 Création de l'usine SBC...");

    // Trouver un utilisateur admin pour créer l'usine
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!adminUser) {
      console.error("❌ Aucun utilisateur admin trouvé!");
      return;
    }

    const newFactory = await prisma.factory.create({
      data: {
        code: FACTORY_CODE,
        name: "Société des Boissons de Côte d'Ivoire (SBC)",
        address: "Abidjan, Côte d'Ivoire",
        isActive: true,
        criticalityLevel: "critique",
        createdBy: {
          connect: { id: adminUser.id },
        },
      },
    });

    console.log(`✅ Usine SBC créée avec l'ID: ${newFactory.id}\n`);
    return importProcessesForFactory(newFactory.id);
  }

  console.log(`✅ Usine trouvée: ${factory.name} (ID: ${factory.id})\n`);
  return importProcessesForFactory(factory.id);
}

async function importProcessesForFactory(factoryId: string) {
  // 2. Supprimer tous les processus existants de l'usine
  console.log("🗑️  Suppression des anciens processus...\n");

  const deletedProcesses = await prisma.process.deleteMany({
    where: { factoryId },
  });

  console.log(`✅ ${deletedProcesses.count} processus supprimés\n`);

  // 3. Lister tous les fichiers .docx dans le dossier raouf
  if (!fs.existsSync(RAOUF_FOLDER)) {
    console.error(`❌ Dossier "${RAOUF_FOLDER}" non trouvé!`);
    return;
  }

  const files = fs
    .readdirSync(RAOUF_FOLDER)
    .filter((file) => file.endsWith(".docx"));

  if (files.length === 0) {
    console.error(`❌ Aucun fichier .docx trouvé dans "${RAOUF_FOLDER}"!`);
    return;
  }

  console.log(`📁 ${files.length} fichiers trouvés:\n`);

  let successCount = 0;
  let errorCount = 0;

  // 4. Pour chaque fichier, extraire le texte et analyser avec l'IA
  for (const file of files) {
    try {
      const filePath = path.join(RAOUF_FOLDER, file);
      const processName = await extractProcessNameFromFile(file);
      const department = getDepartmentFromProcessName(processName);
      const defaultCriticality = getCriticality(department);

      console.log(`📄 ${file}`);
      console.log(`   → Processus: ${processName}`);
      console.log(`   → Département: ${department}`);

      // Extraire le texte du document
      console.log(`   📖 Extraction du texte...`);
      const text = await extractTextFromDocx(filePath);

      if (!text || text.trim().length === 0) {
        console.warn(
          `   ⚠️  Aucun texte extrait, utilisation des données minimales`
        );
      } else {
        console.log(`   ✅ ${text.length} caractères extraits`);
      }

      // Analyser avec l'IA
      let aiData = null;
      if (text && text.trim().length > 100) {
        aiData = await analyzeWithAI(text, processName);
      }

      // Fusionner les données IA avec les valeurs par défaut
      const criticality = aiData?.criticality || defaultCriticality;
      const rto =
        aiData?.rto ||
        (criticality === "critical" ? 4 : criticality === "high" ? 8 : 24);
      const rpo =
        aiData?.rpo ||
        (criticality === "critical" ? 2 : criticality === "high" ? 4 : 12);
      const mtpd =
        aiData?.mtpd ||
        (criticality === "critical" ? 8 : criticality === "high" ? 24 : 72);

      console.log(`   → Criticité finale: ${criticality}`);
      console.log(`   → Métriques: RTO=${rto}h, RPO=${rpo}h, MTPD=${mtpd}h`);

      // Préparer les données pour Prisma
      const processData: Prisma.ProcessCreateInput = {
        name: aiData?.name || processName,
        factory: { connect: { id: factoryId } },
        department: aiData?.department || department,
        location:
          aiData?.location ||
          "Site principal - Soliman, Gouvernorat de Nabeul, Tunisie",
        impact:
          aiData?.financialImpact ||
          aiData?.operationalImpact ||
          "À définir selon analyse BIA",
        criticality,
        rto,
        rpo,
        mtpd,
        mbco:
          aiData?.mbco ||
          (criticality === "critical"
            ? "80%"
            : criticality === "high"
            ? "50%"
            : "30%"),
        description:
          aiData?.description ||
          `Processus ${processName} - Département ${department}.`,

        // Champs booléens (requis par le schéma)
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
      };

      // Ajouter les champs extraits par l'IA s'ils existent
      if (aiData) {
        if (aiData.processOwner) processData.processOwner = aiData.processOwner;
        if (aiData.ownerRole) processData.ownerRole = aiData.ownerRole;
        if (aiData.ownerEmail) processData.ownerEmail = aiData.ownerEmail;
        if (aiData.ownerPhone) processData.ownerPhone = aiData.ownerPhone;
        if (aiData.criticalTimes)
          processData.criticalTimes = aiData.criticalTimes;
        if (aiData.financialImpact)
          processData.financialImpact = aiData.financialImpact;
        if (aiData.operationalImpact)
          processData.operationalImpact = aiData.operationalImpact;
        if (aiData.reputationImpact)
          processData.reputationImpact = aiData.reputationImpact;
        if (aiData.operationalCapacityImpact)
          processData.operationalCapacityImpact =
            aiData.operationalCapacityImpact;
        if (aiData.mainFunctionality)
          processData.mainFunctionality = aiData.mainFunctionality;
        if (aiData.productDependencies)
          processData.productDependencies = aiData.productDependencies;
        if (aiData.interServiceDependencies)
          processData.interServiceDependencies =
            aiData.interServiceDependencies;

        // Ajouter les tableaux
        if (
          aiData.activitesCritiques &&
          Array.isArray(aiData.activitesCritiques) &&
          aiData.activitesCritiques.length > 0
        ) {
          processData.activitesCritiques =
            aiData.activitesCritiques as Prisma.JsonValue;
        }
        if (
          aiData.fournisseursExternes &&
          Array.isArray(aiData.fournisseursExternes) &&
          aiData.fournisseursExternes.length > 0
        ) {
          processData.fournisseursExternes =
            aiData.fournisseursExternes as Prisma.JsonValue;
        }
        if (
          aiData.systemesInformatiques &&
          Array.isArray(aiData.systemesInformatiques) &&
          aiData.systemesInformatiques.length > 0
        ) {
          processData.systemesInformatiques =
            aiData.systemesInformatiques as Prisma.JsonValue;
        }
      }

      // Créer le processus
      const process = await prisma.process.create({
        data: processData,
      });

      console.log(`   ✅ Processus créé avec l'ID: ${process.id}\n`);
      successCount++;
    } catch (error) {
      console.error(
        `   ❌ Erreur lors de la création du processus: ${error}\n`
      );
      errorCount++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`📊 RÉSUMÉ DE L'IMPORTATION`);
  console.log("=".repeat(60));
  console.log(`✅ Succès: ${successCount} processus créés`);
  console.log(`❌ Erreurs: ${errorCount}`);
  console.log(`📁 Total: ${files.length} fichiers traités`);
  console.log("=".repeat(60) + "\n");
}

// Exécution
importProcesses()
  .then(() => {
    console.log("✅ Importation terminée avec succès!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erreur fatale:", error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
