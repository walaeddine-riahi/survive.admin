import { NextRequest, NextResponse } from "next/server";
import { AzureOpenAI } from "openai";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

// Configuration Azure OpenAI
const openai = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview",
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o",
});

// Extraction de texte selon le type de fichier
async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  // PDF
  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse-fork");
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      console.error("Erreur extraction PDF:", error);
      throw new Error(
        "Impossible d'extraire le texte du PDF. Vérifiez que le fichier n'est pas protégé ou corrompu."
      );
    }
  }

  // Word (DOCX)
  if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // Excel
  if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.name.endsWith(".xlsx") ||
    file.name.endsWith(".xls")
  ) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    let text = "";
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      // Convertir en CSV pour avoir un format texte lisible
      const csv = XLSX.utils.sheet_to_csv(sheet);
      text += `Feuille: ${sheetName}\n${csv}\n\n`;
    });
    return text;
  }

  throw new Error("Type de fichier non supporté");
}

// Analyse du texte avec Azure OpenAI
async function analyzeTextWithAI(text: string) {
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

  const completion = await openai.chat.completions.create({
    model: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "Tu es un expert en extraction de données BIA. Tu réponds UNIQUEMENT en JSON valide, sans texte supplémentaire. IMPORTANT: Échappe correctement tous les caractères spéciaux dans les chaînes JSON (guillemets, retours à la ligne, etc.). Limite les descriptions longues à 500 caractères maximum.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.1, // Très bas pour maximiser la fidélité au texte source
    max_tokens: 8000, // Augmenté pour gérer les documents longs
    response_format: { type: "json_object" }, // Force un JSON valide
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Aucune réponse de l'IA");
  }

  // Nettoyer le contenu des balises markdown si présentes
  let cleanedContent = content.trim();

  // Supprimer les balises ```json ou ``` au début et à la fin
  if (cleanedContent.startsWith("```json")) {
    cleanedContent = cleanedContent.substring(7); // Enlever ```json
  } else if (cleanedContent.startsWith("```")) {
    cleanedContent = cleanedContent.substring(3); // Enlever ```
  }

  if (cleanedContent.endsWith("```")) {
    cleanedContent = cleanedContent.substring(0, cleanedContent.length - 3);
  }

  cleanedContent = cleanedContent.trim();

  // Tentative de parse avec gestion d'erreur améliorée
  try {
    return JSON.parse(cleanedContent);
  } catch (parseError) {
    console.error("❌ Erreur de parse JSON:", parseError);
    console.error(
      "📄 Contenu reçu (premiers 500 chars):",
      cleanedContent.substring(0, 500)
    );
    console.error(
      "📄 Contenu reçu (derniers 500 chars):",
      cleanedContent.substring(Math.max(0, cleanedContent.length - 500))
    );

    // Essayer de réparer le JSON en utilisant une regex pour trouver le dernier objet valide
    // Trouver la dernière accolade fermante
    const lastBrace = cleanedContent.lastIndexOf("}");
    if (lastBrace !== -1) {
      const truncatedContent = cleanedContent.substring(0, lastBrace + 1);
      try {
        console.log("🔧 Tentative de réparation du JSON tronqué...");
        return JSON.parse(truncatedContent);
      } catch (secondError) {
        console.error("❌ Échec de la réparation:", secondError);
      }
    }

    // Si tout échoue, demander à l'IA de générer à nouveau avec un prompt plus strict
    throw new Error(
      "Le JSON retourné par l'IA est invalide. Contenu trop long ou mal formaté."
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (
      !allowedTypes.includes(file.type) &&
      !file.name.endsWith(".docx") &&
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls") &&
      !file.name.endsWith(".pdf")
    ) {
      return NextResponse.json(
        { error: "Type de fichier non supporté. Utilisez PDF, Word ou Excel." },
        { status: 400 }
      );
    }

    // Vérifier la taille du fichier (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Le fichier est trop volumineux (max 10MB)" },
        { status: 400 }
      );
    }

    console.log("📄 Extraction du texte depuis:", file.name);
    const text = await extractTextFromFile(file);

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: "Le document ne contient pas assez de texte exploitable" },
        { status: 400 }
      );
    }

    console.log("🤖 Analyse avec Azure OpenAI...");
    const extractedData = await analyzeTextWithAI(text);

    console.log("✅ Données extraites avec succès");
    return NextResponse.json({
      success: true,
      data: extractedData,
      message: "Document analysé avec succès",
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'analyse:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de l'analyse du document",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
