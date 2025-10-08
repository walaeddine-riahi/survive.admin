import { NextRequest, NextResponse } from "next/server";
import { getBiaReportById } from "@/actions/bia/bia-report-actions";

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

    const result = await getBiaReportById(id);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Rapport non trouvé",
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Erreur API rapport:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur interne du serveur",
      },
      { status: 500 }
    );
  }
}
