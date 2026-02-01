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
  const prompt = `Tu es un expert en Business Continuity Management (BCM) et analyse d'impact métier (BIA).

Analyse le document suivant qui décrit un processus métier et extrait les informations structurées suivantes au format JSON strict :

{
  "name": "Nom du processus",
  "description": "Description détaillée du processus",
  "department": "Département responsable",
  "location": "Localisation du processus",
  "processOwner": "Nom du responsable du processus",
  "ownerRole": "Rôle/fonction du responsable",
  "ownerEmail": "Email du responsable",
  "ownerPhone": "Téléphone du responsable",
  "impact": "Description de l'impact en cas d'interruption",
  "criticality": "CRITICAL | HIGH | MEDIUM | LOW",
  "rto": nombre_heures (Recovery Time Objective en heures),
  "mtpd": nombre_heures (Maximum Tolerable Period of Disruption en heures),
  "rpo": nombre_heures (Recovery Point Objective en heures),
  "mbco": "Description du Minimum Business Continuity Objective",
  "criticalTimes": "Périodes critiques (ligne par ligne)",
  "impacts": [
    {
      "type": "Financier | Opérationnel | Réputation | Légal/Réglementaire | Sécurité",
      "level": "critical | high | medium | low",
      "hasImpact": true/false,
      "description": "Description de l'impact"
    }
  ],
  "dependencies": [
    {
      "name": "Nom de la dépendance",
      "type": "Processus | Système | Fournisseur",
      "criticality": "critical | high | medium | low",
      "description": "Description"
    }
  ],
  "criticalActivities": [
    {
      "name": "Nom de l'activité",
      "role": "Rôle responsable",
      "impact": "Impact si interruption",
      "rto": nombre_heures,
      "rpo": nombre_heures,
      "mbco": "Niveau minimal requis",
      "workaround": "Solution de contournement"
    }
  ],
  "systems": [
    {
      "name": "Nom du système",
      "type": "Type de système",
      "criticality": "critical | high | medium | low",
      "rto": nombre_heures,
      "alternativeSolution": "Solution alternative"
    }
  ],
  "personnel": [
    {
      "role": "Rôle/fonction",
      "number": nombre_personnes,
      "skills": "Compétences requises",
      "criticality": "critical | high | medium | low",
      "backupOption": "Option de backup"
    }
  ]
}

IMPORTANT:
- Si une information n'est pas présente dans le document, utilise null ou un tableau vide []
- Pour criticality, choisis parmi: CRITICAL, HIGH, MEDIUM, LOW
- Pour les niveaux d'impact: critical, high, medium, low
- RTO/MTPD/RPO doivent être des nombres en heures
- Sois précis et ne déduis que ce qui est explicitement mentionné
- Retourne UNIQUEMENT le JSON, sans texte explicatif

DOCUMENT À ANALYSER:
${text}`;

  const completion = await openai.chat.completions.create({
    model: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "Tu es un assistant expert en BCM qui extrait des informations structurées de documents métier.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 4000,
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

  return JSON.parse(cleanedContent);
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
