import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { BiaAnalysisResult } from "@/lib/bia-ai-analyzer";

/**
 * POST /api/bia/reports/[id]/analysis
 * Enregistre une analyse BIA (manuelle ou générée par IA)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const analysisData: BiaAnalysisResult = await req.json();

    console.log("📊 Sauvegarde de l'analyse pour le rapport:", id);
    console.log("👤 Utilisateur:", session.user.id);

    // Vérifier que le rapport existe et appartient à l'utilisateur
    const report = await prisma.biaReport.findFirst({
      where: {
        id,
        authorId: session.user.id,
      },
    });

    if (!report) {
      console.error("❌ Rapport non trouvé pour l'ID:", id);
      return NextResponse.json(
        { error: "Rapport non trouvé" },
        { status: 404 }
      );
    }

    console.log("✅ Rapport trouvé:", report.name);

    // Récupérer les données du rapport existantes
    const existingData =
      typeof report.reportData === "object" &&
      report.reportData !== null &&
      !Array.isArray(report.reportData)
        ? (report.reportData as Record<string, unknown>)
        : {};

    // Convertir analysisDate en string si c'est une Date
    const analysisToSave = {
      ...analysisData,
      analysisDate:
        typeof analysisData.analysisDate === "string"
          ? analysisData.analysisDate
          : new Date().toISOString(),
    };

    console.log("💾 Données à sauvegarder:", {
      impacts: analysisToSave.impacts.length,
      dependencies: analysisToSave.dependencies.length,
      spof: analysisToSave.spof.length,
      confidence: analysisToSave.confidence,
    });

    // Mettre à jour le rapport avec l'analyse
    const updatedReport = await prisma.biaReport.update({
      where: { id },
      data: {
        reportData: JSON.parse(
          JSON.stringify({
            ...existingData,
            analysis: analysisToSave,
          })
        ),
        // Mettre à jour les métriques de niveau supérieur
        continuityLevel: analysisToSave.continuityLevel.score * 10, // Convertir 1-10 en 0-100
        continuityLevelText: analysisToSave.continuityLevel.level,
        updatedAt: new Date(),
      },
    });

    console.log("✅ Analyse sauvegardée avec succès!");

    return NextResponse.json({
      success: true,
      reportId: updatedReport.id,
      message: "Analyse enregistrée avec succès",
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'enregistrement de l'analyse:", error);
    return NextResponse.json(
      {
        error:
          "Erreur lors de l'enregistrement: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bia/reports/[id]/analysis
 * Récupère l'analyse BIA enregistrée pour un rapport
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    // Récupérer le rapport
    const report = await prisma.biaReport.findFirst({
      where: {
        id,
        authorId: session.user.id,
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Rapport non trouvé" },
        { status: 404 }
      );
    }

    // Extraire l'analyse du reportData
    const reportData =
      typeof report.reportData === "object" &&
      report.reportData !== null &&
      !Array.isArray(report.reportData)
        ? (report.reportData as Record<string, unknown>)
        : {};

    if (!reportData.analysis) {
      return NextResponse.json(
        { error: "Aucune analyse trouvée" },
        { status: 404 }
      );
    }

    const analysisResult = reportData.analysis as BiaAnalysisResult;

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'analyse:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}
