import { NextRequest, NextResponse } from "next/server";
import { getBiaReportById } from "@/actions/bia/bia-report-actions";
import BiaAiAnalyzer from "@/lib/bia-ai-analyzer";

/**
 * API endpoint pour analyser un rapport BIA avec l'IA Gemini
 * POST /api/bia/report/[id]/analyze
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID du rapport requis" },
        { status: 400 }
      );
    }

    // Récupérer le rapport BIA
    const reportResult = await getBiaReportById(id);

    if (!reportResult.success || !reportResult.data) {
      return NextResponse.json(
        {
          success: false,
          error: "Rapport non trouvé",
        },
        { status: 404 }
      );
    }

    const report = reportResult.data;

    // Analyser le rapport avec l'IA
    const analyzer = BiaAiAnalyzer.getInstance();
    const analysis = await analyzer.analyzeReport(report.reportData);

    return NextResponse.json({
      success: true,
      data: {
        reportId: id,
        reportName: report.name,
        analysis: analysis,
        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'analyse IA du rapport BIA:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de l'analyse IA",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint pour récupérer une analyse existante (si cachée)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID du rapport requis" },
        { status: 400 }
      );
    }

    // Pour l'instant, on fait l'analyse à chaque fois
    // Dans le futur, on pourrait cacher les résultats en base
    return NextResponse.json(
      {
        success: false,
        error: "Utilisez POST pour déclencher une nouvelle analyse",
      },
      { status: 405 }
    );
  } catch (error) {
    console.error("Erreur API analyse BIA:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur interne du serveur",
      },
      { status: 500 }
    );
  }
}
