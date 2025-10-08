import { NextResponse } from "next/server";

export async function GET() {
  try {
    // TODO: Remplacer par des données réelles de la base de données
    const members = [
      {
        id: "1",
        name: "John Doe",
        role: "Risk Manager",
        department: "Risk Management",
      },
      {
        id: "2",
        name: "Jane Smith",
        role: "Security Analyst",
        department: "Security",
      },
      {
        id: "3",
        name: "Mike Johnson",
        role: "Compliance Officer",
        department: "Compliance",
      },
      {
        id: "4",
        name: "Sarah Williams",
        role: "Incident Manager",
        department: "Operations",
      },
    ];

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}
