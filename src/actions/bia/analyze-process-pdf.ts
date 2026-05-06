"use server";

import { AzureOpenAI } from "openai";

// Import dynamique pour pdfjs-dist côté serveur
let pdfjsLib: typeof import("pdfjs-dist");
let mammoth: typeof import("mammoth");

async function getPDFJS() {
  if (!pdfjsLib) {
    pdfjsLib = await import("pdfjs-dist");
  }
  return pdfjsLib;
}

async function getMammoth() {
  if (!mammoth) {
    mammoth = await import("mammoth");
  }
  return mammoth;
}

// Interface pour les données extraites du PDF
export interface ExtractedProcessData {
  // Informations de base
  name?: string;
  description?: string;
  department?: string;
  location?: string;
  manager?: string;
  processOwner?: string;
  ownerRole?: string;
  ownerEmail?: string;
  ownerPhone?: string;

  // Métriques
  impact?: string;
  criticality?: "low" | "medium" | "high" | "critical";
  rto?: number;
  mtpd?: number;
  rpo?: number;
  mbco?: string;
  criticalTimes?: string;

  // Impacts
  financialImpact?: string;
  operationalImpact?: string;
  reputationImpact?: string;
  operationalCapacityImpact?: string;

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

  dependencies?: any[];

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

    console.log(`📖 Extraction PDF: ${pdfDocument.numPages} pages à traiter`);

    // Extraire le texte de chaque page
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Combiner tous les items de texte avec leurs positions pour préserver la structure
      const pageText = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");

      fullText += `\n=== PAGE ${pageNum} ===\n${pageText}\n`;
    }

    console.log(`✅ ${fullText.length} caractères extraits du PDF`);

    return fullText.trim();
  } catch (error) {
    console.error("Erreur lors de l'extraction du texte du PDF:", error);
    throw new Error("Impossible d'extraire le texte du PDF");
  }
}

/**
 * Analyse le texte extrait avec Azure OpenAI pour extraire les données structurées
 */
async function analyzeWithAI(text: string): Promise<ExtractedProcessData> {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";

  if (!apiKey || !endpoint) {
    console.warn("Azure OpenAI non configuré, analyse heuristique uniquement");
    return analyzeHeuristically(text);
  }

  try {
    const client = new AzureOpenAI({
      apiKey,
      endpoint,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview",
      deployment,
    });

    const prompt = `Tu es une IA EXPERTE en Analyse d'Impact Métier (BIA) et Continuité d'Activité (ISO 22301). 
Ta mission est d'extraire des données de documents PDF/Word de manière CHIRURGICALE.

⛔ RÈGLES D'OR ANTI-HALLUCINATION:
1. ❌ NE JAMAIS INVENTER de données. Si un champ n'est pas explicitement mentionné -> null.
2. ❌ NE JAMAIS ESTIMER de chiffres (RTO, RPO, etc.). Si pas de chiffre précis -> null.
3. ❌ NE JAMAIS GÉNÉRER de noms de personnes, de mails ou de téléphones "probables".
4. ❌ NE PAS REFORMULER les descriptions. Copie le texte original.

🔍 CHAMPS PRIORITAIRES À EXTRAIRE:
- Identité : Nom du processus, département, site géographique, responsable.
- Métriques Temporelles (HEURES UNIAUEMENT) : RTO, MTPD, RPO.
- Impacts : Décrire les conséquences financières, opérationnelles et d'image.
- Ressources Critiques : Systèmes IT (ERP, CRM...), Personnel (nb et rôles), Équipements.

DOCUMENT À ANALYSER:
${text.substring(0, 50000)}

INSTRUCTIONS DE SORTIE:
Génère un JSON respectant STRICTEMENT la structure suivante.
Pour chaque liste (ex: activitesCritiques, systemesInformatiques), extrais TOUTES les lignes si un tableau est présent.

Structure attendue:
{
  "name": "Nom du processus",
  "description": "Description complète",
  "department": "Département (ex: Production, Finance, IT)",
  "location": "Site ou bâtiment",
  "processOwner": "Nom du responsable",
  "ownerRole": "Poste du responsable",
  "ownerEmail": "Email professionnel",
  "ownerPhone": "Numéro de téléphone",
  
  "criticality": "LOW/MEDIUM/HIGH/CRITICAL (choisir le plus proche selon le document)",
  "rto": nombre d'heures (convertis si mentionné en jours/minutes),
  "mtpd": nombre d'heures,
  "rpo": nombre d'heures (ou fraction d'heure),
  "mbco": "Niveau minimum de service acceptable",
  
  "impacts": [
    { "type": "Financier", "level": "low/medium/high", "description": "détails" },
    { "type": "Opérationnel", "level": "low/medium/high", "description": "détails" },
    { "type": "Réputation", "level": "low/medium/high", "description": "détails" }
  ],
  
  "activitesCritiques": [
    { "nom": "nom", "rto": nombre, "impactsOperationnels": "détails" }
  ],
  
  "systemesInformatiques": [
    { "nom": "nom", "typeSysteme": "ERP/CRM/etc", "rto": nombre, "rpo": nombre }
  ],
  
  "rolesPersonnel": [
    { "role": "intitulé", "effectif": nombre, "competenceUnique": "oui/non" }
  ],
  
  "confidence": score de 0 à 100
}

RÉPONDS UNIQUEMENT EN JSON VALIDE.
- Les valeurs numériques doivent être EXACTES, pas estimées
- Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire.`;

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

    const responseText = completion.choices[0]?.message?.content || "{}";

    // Nettoyer la réponse pour extraire le JSON
    let jsonText = responseText.trim();

    // Retirer les balises markdown si présentes
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\s*/, "").replace(/```\s*$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\s*/, "").replace(/```\s*$/, "");
    }

    const parsed = JSON.parse(jsonText);

    // Validation stricte : supprimer les valeurs qui semblent génériques/inventées
    const cleanedData = cleanExtractedData(parsed);

    return {
      ...cleanedData,
      extractedText: text.substring(0, 5000),
    };
  } catch (error) {
    console.error("Erreur lors de l'analyse IA:", error);
    // Fallback sur l'analyse heuristique
    return analyzeHeuristically(text);
  }
}

/**
 * Nettoie les données extraites pour supprimer les valeurs génériques/inventées
 */
function cleanExtractedData(
  data: Record<string, unknown>
): ExtractedProcessData {
  const cleaned: Record<string, unknown> = {};

  // Liste de valeurs génériques à rejeter
  const genericValues = [
    "à définir",
    "à compléter",
    "non spécifié",
    "non mentionné",
    "à déterminer",
    "non disponible",
    "n/a",
    "na",
    "tbd",
    "to be determined",
    "unknown",
    "inconnu",
    "exemple",
    "example",
    "ex:",
    "ex.",
  ];

  // Patterns suspects qui indiquent des données inventées
  const suspiciousPatterns = [
    /\bSARL\b.*(?:International|Group|Services|Tech|Pharma|Pack)/i,
    /\b(?:International|Global|Tech|Services)\s+(?:SARL|Ltd|Inc|Corp|SA)\b/i,
    /\+216\s*\d{2}\s*\d{3}\s*\d{3}/, // Numéros de téléphone tunisiens formatés
    /contact@\w+\.\w+/, // Emails génériques type contact@example.com
    /\w+@\w+\.(com|tn|fr)$/, // Emails trop formatés/propres
    /Mohamed\s+\w+|Salah\s+\w+|Ahmed\s+\w+/i, // Noms tunisiens courants (souvent inventés par IA)
  ];

  const isGeneric = (value: string): boolean => {
    if (!value) return true;
    const lower = value.toLowerCase().trim();

    // Vérifier les valeurs génériques
    if (
      genericValues.some(
        (generic) => lower === generic || lower.includes(generic)
      )
    ) {
      return true;
    }

    // Vérifier les patterns suspects
    if (suspiciousPatterns.some((pattern) => pattern.test(value))) {
      console.warn(`⚠️ Valeur suspecte détectée et rejetée: "${value}"`);
      return true;
    }

    return false;
  };

  // Nettoyer chaque champ
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined || value === "") {
      cleaned[key] = null;
    } else if (typeof value === "string") {
      // Rejeter les valeurs génériques ou suspectes
      cleaned[key] = isGeneric(value) ? null : value;
    } else if (typeof value === "number") {
      // Valider les nombres (pas de 0 par défaut)
      cleaned[key] = value > 0 ? value : null;
    } else if (typeof value === "boolean") {
      // Garder les booléens tels quels
      cleaned[key] = value;
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned as ExtractedProcessData;
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
 * Extrait le texte d'un fichier .docx
 */
async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    const mammothLib = await getMammoth();
    const result = await mammothLib.extractRawText({ buffer });

    console.log(
      `✅ ${result.value.length} caractères extraits du document Word`
    );
    return result.value;
  } catch (error) {
    console.error("Erreur lors de l'extraction du texte du .docx:", error);
    throw new Error("Impossible d'extraire le texte du document Word");
  }
}

/**
 * Action principale : analyse un PDF ou DOCX de processus BIA
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

    // Valider le type de fichier (PDF ou DOCX)
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    const isDocx =
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.toLowerCase().endsWith(".docx");

    if (!isPdf && !isDocx) {
      return {
        success: false,
        error: "Le fichier doit être au format PDF ou DOCX",
      };
    }

    // Valider la taille (max 50MB pour permettre des documents détaillés)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: "Le fichier est trop volumineux (max 50MB)",
      };
    }

    console.log(
      `📄 Début d'analyse: ${file.name} (${(file.size / 1024 / 1024).toFixed(
        2
      )} MB)`
    );

    // Lire le fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extraire le texte selon le type de fichier
    let extractedText: string;
    if (isPdf) {
      console.log("📖 Extraction DÉTAILLÉE du texte du PDF...");
      extractedText = await extractTextFromPDF(buffer);
    } else {
      console.log("📖 Extraction DÉTAILLÉE du texte du document Word...");
      extractedText = await extractTextFromDocx(buffer);
    }

    if (!extractedText || extractedText.length < 50) {
      return {
        success: false,
        error: "Le PDF ne contient pas assez de texte exploitable",
      };
    }

    console.log(`✅ Texte extrait: ${extractedText.length} caractères`);

    // Analyser avec IA de manière DÉTAILLÉE
    console.log("🤖 Analyse DÉTAILLÉE du contenu avec IA...");
    console.log("   → Extraction de TOUS les champs disponibles");
    console.log(
      "   → Extraction de TOUS les tableaux (activités, fournisseurs, systèmes, etc.)"
    );
    const processData = await analyzeWithAI(extractedText);

    // Compter les champs rejetés (null)
    const totalFields = Object.keys(processData).length;
    const nullFields = Object.values(processData).filter(
      (v) => v === null
    ).length;
    const extractedFields = totalFields - nullFields;

    console.log(
      `✅ Analyse terminée: ${extractedFields}/${totalFields} champs extraits`
    );
    console.log(
      `⚠️  ${nullFields} champs vides (données non trouvées dans le document)`
    );

    return {
      success: true,
      data: processData,
      message: `PDF analysé avec succès. ${extractedFields} champs remplis, ${nullFields} champs vides (données non présentes dans le document). Vérifiez et complétez manuellement si nécessaire.`,
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
