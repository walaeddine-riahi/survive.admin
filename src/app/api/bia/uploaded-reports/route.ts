import { NextRequest, NextResponse } from "next/server";
import { getAllBiaReports } from "@/actions/bia/bia-report-actions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const result = await getAllBiaReports({ limit, offset });

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data || [],
        total: result.total || 0,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Erreur lors de la récupération des rapports",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Erreur API rapports uploads:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur interne du serveur",
      },
      { status: 500 }
    );
  }
}
