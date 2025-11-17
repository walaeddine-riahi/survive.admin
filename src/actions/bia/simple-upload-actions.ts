"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir, readFile, unlink } from "fs/promises";
import { join } from "path";
import { createBiaReport } from "./bia-report-actions";

// Extraction de texte simplifiée (sans packages externes)
async function extractBasicTextFromFile(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  try {
    // Pour les fichiers texte simples
    if (fileName.toLowerCase().endsWith(".txt")) {
      return buffer.toString("utf-8");
    }

    // Pour PDF et Word, on retourne une description basique
    const fileType = fileName.toLowerCase().endsWith(".pdf") ? "PDF" : "Word";
    return `Contenu du fichier ${fileType}: ${fileName}\nTaille: ${buffer.length} octets\nNote: Analyse complète du contenu nécessite des outils spécialisés.`;
  } catch (error) {
    console.error("Erreur extraction texte:", error);
    return `Fichier uploadé: ${fileName}`;
  }
}

// Analyser le contenu pour extraire des métriques BIA basiques
function analyzeBiaContent(content: string): {
  estimatedProcesses: number;
  estimatedRisks: number;
  estimatedRecommendations: number;
  continuityLevel: number;
} {
  const contentLower = content.toLowerCase();

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
      count + (contentLower.match(new RegExp(keyword, "gi")) || []).length,
    0
  );

  const riskCount = riskKeywords.reduce(
    (count, keyword) =>
      count + (contentLower.match(new RegExp(keyword, "gi")) || []).length,
    0
  );

  const recCount = recommendationKeywords.reduce(
    (count, keyword) =>
      count + (contentLower.match(new RegExp(keyword, "gi")) || []).length,
    0
  );

  const contCount = continuityKeywords.reduce(
    (count, keyword) =>
      count + (contentLower.match(new RegExp(keyword, "gi")) || []).length,
    0
  );

  // Estimer les valeurs (plus conservatrices sans extraction complète)
  const estimatedProcesses = Math.min(
    Math.max(Math.floor(processCount / 5), 1),
    20
  );
  const estimatedRisks = Math.min(Math.max(Math.floor(riskCount / 3), 0), 15);
  const estimatedRecommendations = Math.min(
    Math.max(Math.floor(recCount / 3), 0),
    20
  );

  // Estimer le niveau de continuité basé sur la présence de mots-clés
  let continuityLevel = 50; // Base plus faible car extraction limitée
  if (contCount > 5) continuityLevel += 20;
  if (
    contentLower.includes("plan de continuité") ||
    contentLower.includes("bcp")
  )
    continuityLevel += 15;
  if (contentLower.includes("exercice") || contentLower.includes("test"))
    continuityLevel += 15;

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

// Action principale d'upload simplifiée
export async function uploadBiaReportSimple(formData: FormData) {
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
    const factoryId = formData.get("factoryId") as string;
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
      "text/plain",
    ];

    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: "Type de fichier non supporté. Formats acceptés: PDF, Word, TXT",
      };
    }

    // Créer le répertoire de stockage si nécessaire
    const uploadsDir = join(process.cwd(), "uploads", "bia-reports");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch {
      // Le répertoire existe déjà
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name.replace(
      /[^a-zA-Z0-9.-]/g,
      "_"
    )}`;
    const filePath = join(uploadsDir, fileName);

    // Lire le contenu du fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sauvegarder le fichier
    await writeFile(filePath, buffer);

    // Extraire le texte de base
    const extractedText = await extractBasicTextFromFile(buffer, file.name);
    const format: "PDF" | "DOCX" | "JSON" | "HTML" =
      file.type === "application/pdf"
        ? "PDF"
        : file.type.includes("word")
        ? "DOCX"
        : "JSON";

    // Analyser le contenu pour extraire des métriques
    const analysis = analyzeBiaContent(extractedText);

    // Préparer les tags
    const tags = tagsString
      ? tagsString
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag)
      : [];

    const formatTag =
      format.toLowerCase() === "json" ? "text" : format.toLowerCase();
    tags.push("upload", formatTag, "basic-analysis");

    // Récupérer le nom de l'usine si un factoryId est fourni
    let category: string | undefined;

    if (factoryId && factoryId !== "") {
      const factory = await prisma.factory.findUnique({
        where: { id: factoryId },
        select: { name: true },
      });

      if (factory) {
        category = factory.name;
        tags.push(`usine:${factory.name}`);
      }
    }

    // Créer les données du rapport
    const reportData = {
      source: "upload",
      originalFileName: file.name,
      uploadDate: new Date().toISOString(),
      extractedText: extractedText.substring(0, 5000), // Limiter pour la base de données
      analysis,
      contentLength: extractedText.length,
      processingMethod: "simple-upload",
      note: "Analyse basique - extraction complète nécessite des outils spécialisés",
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
      reportData: reportData as unknown as Record<string, unknown>,
      content: extractedText.substring(0, 2000), // Contenu pour la recherche
      fileName,
      filePath: filePath,
      fileSize: buffer.length,
      mimeType: file.type,
      includedProcessIds: [],
      isPublic: false,
      tags,
      category: category || undefined,
      factoryId: factoryId && factoryId !== "" ? factoryId : undefined,
    });

    if (result.success) {
      revalidatePath("/bia/reports");
      return {
        success: true,
        data: result.data,
        message: `Fichier ${file.name} uploadé avec succès (analyse basique)`,
      };
    } else {
      // Supprimer le fichier en cas d'erreur de base de données
      try {
        await unlink(filePath);
      } catch (unlinkError) {
        console.warn("Impossible de supprimer le fichier:", unlinkError);
      }

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
    if (report.authorId !== session.user.id) {
      return {
        success: false,
        error: "Accès non autorisé",
      };
    }

    // Lire le fichier si disponible
    let fileContent = null;
    if (report.filePath) {
      try {
        fileContent = await readFile(report.filePath);
      } catch (error) {
        console.warn("Impossible de lire le fichier:", error);
      }
    }

    return {
      success: true,
      data: {
        report,
        fileContent,
        hasFile: !!fileContent,
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
