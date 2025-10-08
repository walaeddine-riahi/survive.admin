import { NextResponse } from "next/server";

export async function GET() {
  try {
    // TODO: Remplacer par des données réelles de la base de données
    const stats = {
      activeIncidents: 12,
      identifiedRisks: 45,
      preventiveMeasures: 28,
      incidentResolutionRate: 85,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
