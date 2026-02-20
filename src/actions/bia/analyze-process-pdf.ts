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

    const prompt = `Tu es un extracteur de données STRICT pour Business Impact Analysis (BIA).

⛔ INTERDICTIONS ABSOLUES - TU SERAS REJETÉ SI TU VIOLES CES RÈGLES:
1. ❌ N'INVENTE AUCUN NOM de personne, entreprise ou fournisseur
2. ❌ NE CRÉE PAS de numéros de téléphone ou emails
3. ❌ NE DEVINE PAS de valeurs numériques (RTO, RPO, MTPD, etc.)
4. ❌ NE GÉNÈRE PAS d'exemples ou de données plausibles
5. ❌ NE COMPLÈTE PAS avec des informations logiques

✅ RÈGLES STRICTES D'EXTRACTION:
- Si une information N'EST PAS écrite dans le document → utilise null
- Si tu n'es pas CERTAIN à 100% → utilise null
- COPIE mot pour mot, ne reformule JAMAIS
- Garde la langue d'origine du document
- Pour les tableaux: copie UNIQUEMENT les lignes présentes dans le document

❌ EXEMPLES DE CE QU'IL NE FAUT PAS FAIRE:
Document: "Le processus nécessite 2 personnes"
❌ MAUVAIS: "staffRoles": "Opérateurs et techniciens" (INVENTÉ!)
✅ BON: "staffRoles": null (car les rôles ne sont pas mentionnés)

Document: "Fournisseurs: voir annexe"
❌ MAUVAIS: "externalSuppliers": "PharmaChem SARL, PackTech International" (INVENTÉ!)
✅ BON: "externalSuppliers": null (car les noms ne sont pas donnés)

Document: "RTO critique"
❌ MAUVAIS: "rto": 4 (DEVINÉ!)
✅ BON: "rto": null (car le chiffre n'est pas précisé)

DOCUMENT:
${text.substring(0, 50000)}

INSTRUCTIONS:
Lis le document de manière COMPLÈTE ET DÉTAILLÉE. Extrais TOUTES les informations disponibles.
Pour chaque champ:
- Si l'information est présente dans le document: copie-la exactement (même si c'est long)
- Si l'information n'est PAS dans le document: utilise null (pas de valeur par défaut)
- Pour les tableaux: extrais TOUTES les lignes présentes, ne limite pas le nombre
- Pour les booléens: true/false SEULEMENT si explicitement mentionné, sinon null

Structure attendue:
{
  "name": "Nom EXACT du processus tel qu'écrit dans le document",
  "description": "Description EXACTE et COMPLÈTE copiée du document ou null",
  "department": "Département EXACT tel qu'écrit (ex: RH, IT, Finance) ou null",
  "location": "Localisation EXACTE telle qu'écrite ou null",
  "processOwner": "Nom EXACT du responsable de processus ou null",
  "ownerRole": "Fonction EXACTE du responsable ou null",
  "ownerEmail": "Email EXACT du responsable ou null",
  "ownerPhone": "Téléphone EXACT du responsable ou null",
  
  "impact": "Type d'impact SI MENTIONNÉ: financial/reputation/legal/operational/safety/environmental ou null",
  "criticality": "Criticité SI MENTIONNÉE: low/medium/high/critical ou null",
  "rto": Nombre EXACT d'heures SI MENTIONNÉ ou null,
  "mtpd": Nombre EXACT d'heures SI MENTIONNÉ ou null,
  "rpo": Nombre EXACT d'heures SI MENTIONNÉ ou null,
  "mbco": "Valeur EXACTE SI MENTIONNÉE ou null",
  "criticalTimes": "Périodes critiques EXACTES copiées du document ou null",
  
  "financialImpact": "Impact financier EXACT et COMPLET copié du document ou null",
  "operationalImpact": "Impact opérationnel EXACT et COMPLET copié du document ou null",
  "reputationImpact": "Impact réputation EXACT et COMPLET copié du document ou null",
  "operationalCapacityImpact": "Impact capacité opérationnelle EXACT copié du document ou null",
  
  "mainFunctionality": "Fonctionnalité principale EXACTE et COMPLÈTE copiée du document ou null",
  "productDependencies": "Dépendances produits EXACTES et COMPLÈTES copiées du document ou null",
  "interServiceDependencies": "Dépendances inter-services EXACTES et COMPLÈTES copiées du document ou null",
  
  "activitesCritiques": [
    {
      "nom": "Nom EXACT de l'activité critique",
      "criticite": "critical/high/medium/low",
      "delai": "Délai EXACT",
      "rto": nombre d'heures,
      "mtpd": nombre d'heures,
      "rpo": nombre d'heures,
      "mbco": "MBCO EXACT",
      "impactsOperationnels": "Impacts opérationnels EXACTS",
      "impactsReglementaires": "Impacts réglementaires EXACTS",
      "impactsImage": "Impacts image EXACTS"
    }
  ] SI présentes dans le document, sinon [],
  
  "fournisseursExternes": [
    {
      "nom": "Nom EXACT du fournisseur",
      "servicesOfferts": "Services EXACTS offerts",
      "contactNom": "Nom EXACT du contact",
      "contactTelephone": "Téléphone EXACT",
      "contactEmail": "Email EXACT",
      "zoneGeographique": "Zone géographique EXACTE",
      "isUniqueSupplier": true/false si mentionné,
      "rto": nombre d'heures,
      "mtpd": nombre d'heures,
      "planContinuiteActivite": "oui/non/inconnu",
      "clauseSLA": "oui/non/inconnu"
    }
  ] SI présents dans le document, sinon [],
  
  "systemesInformatiques": [
    {
      "nom": "Nom EXACT du système",
      "typeSysteme": "Type EXACT (ERP, CRM, SCADA, etc.)",
      "criticite": "critical/high/medium/low",
      "impactIndisponibilite": "Impact EXACT en cas d'indisponibilité",
      "activitesAssociees": "Activités EXACTES associées",
      "sauvegardesEnPlace": "oui/non/inconnu",
      "rto": nombre d'heures,
      "rpo": nombre d'heures,
      "mtpd": nombre d'heures
    }
  ] SI présents dans le document, sinon [],
  
  "infrastructuresPhysiques": [
    {
      "nom": "Nom EXACT de l'infrastructure",
      "type": "Type EXACT",
      "criticite": "critical/high/medium/low",
      "impactIndisponibilite": "Impact EXACT",
      "activitesAssociees": "Activités EXACTES"
    }
  ] SI présentes dans le document, sinon [],
  
  "rolesPersonnel": [
    {
      "role": "Rôle EXACT",
      "effectif": nombre,
      "tachesResponsabilites": "Tâches et responsabilités EXACTES",
      "competenceUnique": "oui/non",
      "remplacable": "oui/non"
    }
  ] SI présents dans le document, sinon [],
  
  "equipementsIndustriels": [
    {
      "designation": "Désignation EXACTE",
      "modeleReference": "Modèle/Référence EXACT",
      "tachesRealise": "Tâches EXACTES réalisées",
      "criticite": "critical/high/medium/low",
      "rto": nombre d'heures,
      "mtpd": nombre d'heures
    }
  ] SI présents dans le document, sinon [],
  
  "equipementsBureautiques": [
    {
      "type": "Type EXACT",
      "quantiteActuelle": nombre,
      "tachesUtilisation": "Tâches EXACTES",
      "criticite": "critical/high/medium/low",
      "rto": nombre d'heures,
      "mtpd": nombre d'heures
    }
  ] SI présents dans le document, sinon [],
  
  "documentationsCritiques": [
    {
      "type": "Type EXACT de documentation",
      "format": "papier/numerique/les_deux",
      "emplacementPrincipal": "Emplacement EXACT",
      "necessaireApresIncident": "oui/non",
      "criticite": "critical/high/medium/low"
    }
  ] SI présentes dans le document, sinon [],
  
  "obligationsLegales": [
    {
      "domaine": "Domaine EXACT",
      "obligationLegale": "Obligation EXACTE",
      "reference": "Référence EXACTE",
      "autoriteRegulation": "Autorité EXACTE",
      "details": "Détails EXACTS",
      "consequencesNonRespect": "Conséquences EXACTES"
    }
  ] SI présentes dans le document, sinon [],
  
  "externalSuppliers": "Fournisseurs externes EXACTS copiés du document ou null",
  "keySuppliers": "Fournisseurs clés EXACTS copiés du document ou null",
  
  "staffRoles": "Rôles du personnel EXACTS copiés du document ou null",
  "staffCount": Nombre EXACT SI MENTIONNÉ ou null,
  
  "itSystems": "Systèmes IT EXACTS copiés du document ou null",
  "systemCriticality": "Criticité IT EXACTE copiée du document ou null",
  
  "dependsOnPhysicalInfra": true/false SI EXPLICITEMENT MENTIONNÉ, sinon null,
  "infrastructureType": "Type d'infrastructure EXACT copié du document ou null",
  
  "requiredDocumentation": "Documentation requise EXACTE copiée du document ou null",
  "industrialEquipment": "Équipements industriels EXACTS copiés du document ou null",
  "officeEquipment": "Équipements bureautiques EXACTS copiés du document ou null",
  
  "confidence": Score de confiance de 0 à 100 basé sur la quantité d'informations trouvées
}

RAPPEL IMPORTANT:
- LIS LE DOCUMENT EN ENTIER et extrais TOUTES les informations disponibles
- Pour les tableaux: extrais TOUTES les lignes, pas juste quelques exemples
- Utilise null pour toute information NON présente dans le document
- Ne complète PAS avec des valeurs logiques ou probables
- Copie les textes EXACTEMENT comme ils apparaissent (même s'ils sont longs)
- Les valeurs numériques doivent être EXACTES, pas estimées

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire.`;

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
