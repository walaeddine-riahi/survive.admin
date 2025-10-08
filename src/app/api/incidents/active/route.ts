import { NextResponse } from "next/server";

export async function GET() {
  try {
    // TODO: Remplacer par des données réelles de la base de données
    const incidents = [
      {
        id: "1",
        title: "Suspicious Login Attempt",
        status: "Under Investigation",
        priority: "High",
      },
      {
        id: "2",
        title: "System Performance Degradation",
        status: "In Progress",
        priority: "Medium",
      },
      {
        id: "3",
        title: "Data Backup Failure",
        status: "Resolved",
        priority: "Critical",
      },
    ];

    return NextResponse.json(incidents);
  } catch (error) {
    console.error("Error fetching active incidents:", error);
    return NextResponse.json(
      { error: "Failed to fetch active incidents" },
      { status: 500 }
    );
  }
}
