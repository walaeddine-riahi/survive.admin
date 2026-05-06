"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createBiaReport } from "./bia-report-actions";
import { azureStorage } from "@/lib/azure-storage";

import mammoth from "mammoth";

// Extraction de texte simplifiée (sans dépendances externes)
async function extractTextFromPDF(_buffer: Buffer): Promise<string> {
  // PDF text extraction requires pdf-parse which adds complexity
  // Return empty string - metadata is captured elsewhere
  return "";
}

// Extraction de texte à partir de Word (nécessite mammoth)
async function extractTextFromWord(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("Erreur extraction Word:", error);
    return "";
  }
}

// Analyser le contenu pour extraire des métriques BIA
function analyzeBiaContent(content: string): {
  estimatedProcesses: number;
  estimatedRisks: number;
  estimatedRecommendations: number;
  continuityLevel: number;
} {
  // Rechercher des mots-clés BIA
  const processKeywords = [
    "processus",
    "process",
    "activité",
    "fonction",
    "opération",
  ];
  const riskKeywords = ["risque", "risk", "menace", "vulnérabilité", "impact"];
  const recommendationKeywords = [
    "recommandation",
    "recommendation",
    "amélioration",
    "action",
  ];
  const continuityKeywords = ["continuité", "continuity", "rto", "rpo", "mtpd"];

  // Compter les occurrences approximatives
  const processCount = processKeywords.reduce(
    (count, keyword) =>
      count + (content.match(new RegExp(keyword, "gi")) || []).length,
    0
  );

  const riskCount = riskKeywords.reduce(
    (count, keyword) =>
      count + (content.match(new RegExp(keyword, "gi")) || []).length,
    0
  );

  const recCount = recommendationKeywords.reduce(
    (count, keyword) =>
      count + (content.match(new RegExp(keyword, "gi")) || []).length,
    0
  );

  const contCount = continuityKeywords.reduce(
    (count, keyword) =>
      count + (content.match(new RegExp(keyword, "gi")) || []).length,
    0
  );

  // Estimer les valeurs
  const estimatedProcesses = Math.min(
    Math.max(Math.floor(processCount / 3), 1),
    50
  );
  const estimatedRisks = Math.min(Math.max(Math.floor(riskCount / 2), 0), 25);
  const estimatedRecommendations = Math.min(
    Math.max(Math.floor(recCount / 2), 0),
    30
  );

  // Estimer le niveau de continuité basé sur la présence de mots-clés
  let continuityLevel = 60; // Base
  if (contCount > 10) continuityLevel += 20;
  if (content.includes("plan de continuité") || content.includes("bcp"))
    continuityLevel += 10;
  if (content.includes("exercice") || content.includes("test"))
    continuityLevel += 10;

  return {
    estimatedProcesses,
    estimatedRisks,
    estimatedRecommendations,
    continuityLevel: Math.min(continuityLevel, 100),
  };
}

// Déterminer le niveau de continuité textuel
function getContinuityLevelText(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Bon";
  if (score >= 70) return "Satisfaisant";
  if (score >= 60) return "Moyen";
  if (score >= 50) return "Faible";
  return "Critique";
}

// Action principale d'upload
export async function uploadBiaReport(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Utilisateur non authentifié",
      };
    }

    // Récupérer les données du formulaire
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const tagsString = formData.get("tags") as string;

    if (!file || !name) {
      return {
        success: false,
        error: "Fichier et nom requis",
      };
    }

    // Valider le type de fichier
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: "Type de fichier non supporté",
      };
    }

    // Lire le contenu du fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name.replace(
      /[^a-zA-Z0-9.-]/g,
      "_"
    )}`;

    // Check if Azure Storage is available
    if (!azureStorage.isAvailable()) {
      return {
        success: false,
        error: "Service de stockage NOT disponible configuré",
      };
    }

    // Upload vers Azure Storage
    const azureUrl = await azureStorage.uploadFile(
      buffer,
      fileName,
      "bia-reports"
    );
    // Construct the relative blob path for database storage
    const blobPath = `bia-reports/${fileName}`;
    console.log(`✅ Fichier uploadé vers Azure Storage: ${azureUrl}`);

    // Extraire le texte selon le type
    let extractedText = "";
    const format: "PDF" | "DOCX" =
      file.type === "application/pdf" ? "PDF" : "DOCX";

    try {
      if (file.type === "application/pdf") {
        extractedText = await extractTextFromPDF(buffer);
      } else if (file.type.includes("word")) {
        extractedText = await extractTextFromWord(buffer);
      }
    } catch (error) {
      console.warn("Impossible d'extraire le texte:", error);
      // Continue sans le texte extrait
    }

    // Analyser le contenu pour extraire des métriques
    const analysis = analyzeBiaContent(extractedText);

    // Préparer les tags
    const tags = tagsString
      ? tagsString
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag)
      : [];
    if (category) tags.push(category);
    tags.push("upload", format.toLowerCase());

    // Créer les données du rapport
    const reportData = {
      source: "upload",
      originalFileName: file.name,
      uploadDate: new Date().toISOString(),
      extractedText: extractedText.substring(0, 10000), // Limiter pour la base de données
      analysis,
      contentLength: extractedText.length,
      processingMethod: "file-upload",
      storageProvider: "azure",
      blobPath: blobPath,
      azureUrl: azureUrl,
    };

    // Créer le rapport dans la base de données
    const result = await createBiaReport({
      name,
      description:
        description || `Rapport importé depuis le fichier ${file.name}`,
      format,
      status: "GENERATED",
      totalProcesses: analysis.estimatedProcesses,
      continuityLevel: analysis.continuityLevel,
      continuityLevelText: getContinuityLevelText(analysis.continuityLevel),
      riskCount: analysis.estimatedRisks,
      recommendationCount: analysis.estimatedRecommendations,
      reportData: reportData as Record<string, unknown>,
      content: extractedText.substring(0, 5000), // Contenu pour la recherche
      fileName,
      filePath: blobPath, // Store relative blob path for download route
      fileSize: buffer.length,
      mimeType: file.type,
      includedProcessIds: [], // À remplir plus tard si nécessaire
      isPublic: false,
      tags,
      category: category || undefined,
    });

    if (result.success) {
      revalidatePath("/bia/reports");
      return {
        success: true,
        data: result.data,
        message: `Fichier ${file.name} uploadé et traité avec succès`,
      };
    } else {
      return {
        success: false,
        error:
          result.error || "Erreur lors de la sauvegarde en base de données",
      };
    }
  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    return {
      success: false,
      error: "Erreur interne lors du traitement du fichier",
    };
  }
}

// Récupérer le contenu d'un fichier uploadé
export async function getUploadedFileContent(reportId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Utilisateur non authentifié",
      };
    }

    // Récupérer le rapport
    const report = await prisma.biaReport.findUnique({
      where: { id: reportId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      return {
        success: false,
        error: "Rapport non trouvé",
      };
    }

    // Vérifier les permissions (auteur ou admin)
    const isAuthor = report.authorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    
    if (!isAuthor && !isAdmin) {
      return {
        success: false,
        error: "Accès non autorisé",
      };
    }

    // Return report metadata (file is downloaded directly from Azure)
    return {
      success: true,
      data: {
        report,
        fileContent: null,
        hasFile: !!report.filePath,
      },
    };
  } catch (error) {
    console.error("Erreur récupération fichier:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération du fichier",
    };
  }
}
