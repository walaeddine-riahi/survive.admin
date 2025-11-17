"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

// Import dynamique pour pdfjs-dist côté serveur
let pdfjsLib: typeof import("pdfjs-dist");

async function getPDFJS() {
  if (!pdfjsLib) {
    pdfjsLib = await import("pdfjs-dist");
  }
  return pdfjsLib;
}

// Interface pour les données extraites du PDF
export interface ExtractedProcessData {
  // Informations de base
  name?: string;
  description?: string;
  department?: string;
  location?: string;
  manager?: string;

  // Métriques
  impact?: string;
  criticality?: "low" | "medium" | "high" | "critical";
  rto?: number;
  mtpd?: number;
  rpo?: number;
  mbco?: string;

  // Impacts
  financialImpact?: string;
  operationalImpact?: string;
  reputationImpact?: string;

  // Périmètre
  mainFunctionality?: string;
  productDependencies?: string;
  interServiceDependencies?: string;

  // Fournisseurs
  externalSuppliers?: string;
  keySuppliers?: string;

  // Personnel
  staffRoles?: string;
  staffCount?: number;

  // IT
  itSystems?: string;
  systemCriticality?: string;

  // Infrastructure
  dependsOnPhysicalInfra?: boolean;
  infrastructureType?: string;

  // Documentation
  requiredDocumentation?: string;

  // Équipement
  industrialEquipment?: string;
  officeEquipment?: string;

  // Informations supplémentaires
  extractedText?: string;
  confidence?: number;
}

/**
 * Extrait le texte d'un fichier PDF
 */
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Import dynamique de pdfjs-dist
    const pdfjs = await getPDFJS();

    // Convertir le Buffer en Uint8Array
    const uint8Array = new Uint8Array(buffer);

    // Charger le document PDF
    const loadingTask = pdfjs.getDocument({ data: uint8Array });
    const pdfDocument = await loadingTask.promise;

    let fullText = "";

    // Extraire le texte de chaque page
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Combiner tous les items de texte
      // TextItem a la propriété str, TextMarkedContent n'en a pas
      const pageText = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");

      fullText += pageText + "\n";
    }

    return fullText.trim();
  } catch (error) {
    console.error("Erreur lors de l'extraction du texte du PDF:", error);
    throw new Error("Impossible d'extraire le texte du PDF");
  }
}

/**
 * Analyse le texte extrait avec Gemini AI pour extraire les données structurées
 */
async function analyzeWithAI(text: string): Promise<ExtractedProcessData> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn(
      "GEMINI_API_KEY non configurée, analyse heuristique uniquement"
    );
    return analyzeHeuristically(text);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Tu es un expert en Business Impact Analysis (BIA). Analyse le document suivant et extrais les informations sur le processus métier.

DOCUMENT:
${text.substring(0, 15000)}

INSTRUCTIONS:
Extrais les informations suivantes au format JSON. Si une information n'est pas présente, utilise null. Sois précis et ne devine pas.

Structure attendue:
{
  "name": "Nom du processus (obligatoire)",
  "description": "Description détaillée du processus",
  "department": "Département/Service (ex: RH, IT, Finance)",
  "location": "Localisation physique",
  "manager": "Nom du responsable du processus",
  
  "impact": "Type d'impact principal (financial/reputation/legal/operational/safety/environmental)",
  "criticality": "Niveau de criticité (low/medium/high/critical)",
  "rto": Temps de reprise objectif en heures (nombre),
  "mtpd": Durée maximale d'interruption tolérable en heures (nombre),
  "rpo": Point de reprise objectif en heures (nombre),
  "mbco": "Objectif minimum de continuité",
  
  "financialImpact": "Impact financier décrit",
  "operationalImpact": "Impact opérationnel décrit",
  "reputationImpact": "Impact sur la réputation",
  
  "mainFunctionality": "Fonctionnalité principale du processus",
  "productDependencies": "Dépendances produits/services",
  "interServiceDependencies": "Dépendances inter-services",
  
  "externalSuppliers": "Fournisseurs externes",
  "keySuppliers": "Fournisseurs clés",
  
  "staffRoles": "Rôles et responsabilités du personnel",
  "staffCount": Nombre de personnes (nombre),
  
  "itSystems": "Systèmes informatiques utilisés",
  "systemCriticality": "Criticité des systèmes IT",
  
  "dependsOnPhysicalInfra": true/false,
  "infrastructureType": "Type d'infrastructure",
  
  "requiredDocumentation": "Documentation requise",
  "industrialEquipment": "Équipements industriels",
  "officeEquipment": "Équipements bureautiques",
  
  "confidence": Score de confiance de 0 à 100
}

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    // Nettoyer la réponse pour extraire le JSON
    let jsonText = responseText.trim();

    // Retirer les balises markdown si présentes
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\s*/, "").replace(/```\s*$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\s*/, "").replace(/```\s*$/, "");
    }

    const parsed = JSON.parse(jsonText);

    return {
      ...parsed,
      extractedText: text.substring(0, 5000),
    };
  } catch (error) {
    console.error("Erreur lors de l'analyse IA:", error);
    // Fallback sur l'analyse heuristique
    return analyzeHeuristically(text);
  }
}

/**
 * Analyse heuristique du texte (sans IA)
 */
function analyzeHeuristically(text: string): ExtractedProcessData {
  const data: ExtractedProcessData = {
    extractedText: text.substring(0, 5000),
    confidence: 40,
  };

  // Recherche du nom du processus
  const namePatterns = [
    /Processus\s*:\s*([^\n]+)/i,
    /Nom du processus\s*:\s*([^\n]+)/i,
    /Process\s*:\s*([^\n]+)/i,
    /Titre\s*:\s*([^\n]+)/i,
  ];

  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      data.name = match[1].trim();
      break;
    }
  }

  // Département
  const deptPatterns = [
    /Département\s*:\s*([^\n]+)/i,
    /Service\s*:\s*([^\n]+)/i,
    /Department\s*:\s*([^\n]+)/i,
  ];

  for (const pattern of deptPatterns) {
    const match = text.match(pattern);
    if (match) {
      data.department = match[1].trim();
      break;
    }
  }

  // Localisation
  const locationPatterns = [
    /Localisation\s*:\s*([^\n]+)/i,
    /Site\s*:\s*([^\n]+)/i,
    /Location\s*:\s*([^\n]+)/i,
  ];

  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) {
      data.location = match[1].trim();
      break;
    }
  }

  // RTO
  const rtoPatterns = [
    /RTO\s*:\s*(\d+)\s*(?:heures?|hours?|h)/i,
    /Recovery Time Objective\s*:\s*(\d+)/i,
  ];

  for (const pattern of rtoPatterns) {
    const match = text.match(pattern);
    if (match) {
      data.rto = parseInt(match[1]);
      break;
    }
  }

  // MTPD
  const mtpdPatterns = [
    /MTPD\s*:\s*(\d+)\s*(?:heures?|hours?|h)/i,
    /Maximum Tolerable Period\s*:\s*(\d+)/i,
  ];

  for (const pattern of mtpdPatterns) {
    const match = text.match(pattern);
    if (match) {
      data.mtpd = parseInt(match[1]);
      break;
    }
  }

  // RPO
  const rpoPatterns = [
    /RPO\s*:\s*(\d+)\s*(?:heures?|hours?|h)/i,
    /Recovery Point Objective\s*:\s*(\d+)/i,
  ];

  for (const pattern of rpoPatterns) {
    const match = text.match(pattern);
    if (match) {
      data.rpo = parseInt(match[1]);
      break;
    }
  }

  // Criticité
  if (text.match(/critique|critical/i)) {
    data.criticality = "critical";
  } else if (text.match(/haute|élevée|high/i)) {
    data.criticality = "high";
  } else if (text.match(/moyenne|medium/i)) {
    data.criticality = "medium";
  } else if (text.match(/faible|basse|low/i)) {
    data.criticality = "low";
  }

  // Responsable
  const managerPatterns = [
    /Responsable\s*:\s*([^\n]+)/i,
    /Manager\s*:\s*([^\n]+)/i,
    /Propriétaire\s*:\s*([^\n]+)/i,
  ];

  for (const pattern of managerPatterns) {
    const match = text.match(pattern);
    if (match) {
      data.manager = match[1].trim();
      break;
    }
  }

  // Systèmes IT
  const itPatterns = [
    /Systèmes? (?:informatiques?|IT)\s*:\s*([^\n]+)/i,
    /Applications?\s*:\s*([^\n]+)/i,
  ];

  for (const pattern of itPatterns) {
    const match = text.match(pattern);
    if (match) {
      data.itSystems = match[1].trim();
      break;
    }
  }

  return data;
}

/**
 * Action principale : analyse un PDF de processus BIA
 */
export async function analyzeProcessPdf(formData: FormData) {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      return {
        success: false,
        error: "Aucun fichier fourni",
      };
    }

    // Valider le type de fichier
    if (file.type !== "application/pdf") {
      return {
        success: false,
        error: "Le fichier doit être au format PDF",
      };
    }

    // Valider la taille (max 20MB)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: "Le fichier est trop volumineux (max 20MB)",
      };
    }

    // Lire le fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extraire le texte
    console.log("📄 Extraction du texte du PDF...");
    const extractedText = await extractTextFromPDF(buffer);

    if (!extractedText || extractedText.length < 50) {
      return {
        success: false,
        error: "Le PDF ne contient pas assez de texte exploitable",
      };
    }

    console.log(`✅ Texte extrait: ${extractedText.length} caractères`);

    // Analyser avec IA
    console.log("🧠 Analyse du contenu avec IA...");
    const processData = await analyzeWithAI(extractedText);

    console.log("✅ Analyse terminée:", processData);

    return {
      success: true,
      data: processData,
      message: `PDF analysé avec succès. Confiance: ${
        processData.confidence || 0
      }%`,
    };
  } catch (error) {
    console.error("❌ Erreur lors de l'analyse du PDF:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de l'analyse du PDF",
    };
  }
}
