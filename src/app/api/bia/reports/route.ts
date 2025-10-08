import { NextRequest, NextResponse } from "next/server";
import { generateBiaReport } from "@/actions/bia/report-actions";

export async function GET() {
  try {
    const result = await generateBiaReport();

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    const reportJson = JSON.stringify(result.data, null, 2);

    return new NextResponse(reportJson, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="Rapport_BIA_${
          new Date().toISOString().split("T")[0]
        }.json"`,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la génération du rapport:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { reportData, filename, format } = await request.json();

    if (!reportData || !filename) {
      return NextResponse.json(
        { error: "Données de rapport ou nom de fichier manquants" },
        { status: 400 }
      );
    }

    // Dans une vraie application, vous pourriez sauvegarder le rapport dans une base de données
    // ou un système de fichiers. Ici, nous retournons simplement une confirmation.

    const response = {
      success: true,
      message: `Rapport ${filename} sauvegardé avec succès`,
      timestamp: new Date().toISOString(),
      format: format || "unknown",
      size: reportData.length,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du rapport:", error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde du rapport" },
      { status: 500 }
    );
  }
}
