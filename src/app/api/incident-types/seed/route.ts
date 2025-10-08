import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const defaultIncidentTypes = [
  { name: "Feu", description: "Incendie" },
  { name: "Inondation", description: "Dégât des eaux important" },
  { name: "Tremblement de terre", description: "Séisme" },
  { name: "Attaque cybernétique", description: "Attaque informatique" },
  { name: "Panne électrique", description: "Coupure de courant majeure" },
];

export async function POST() {
  try {
    const count = await prisma.incidentType.count();
    if (count === 0) {
      const createdTypes = await prisma.$transaction(
        defaultIncidentTypes.map((type) =>
          prisma.incidentType.create({
            data: type,
          })
        )
      );
      console.log("Default incident types seeded:", createdTypes);
      return NextResponse.json({ seeded: true, types: createdTypes });
    } else {
      console.log("Incident types already exist, no seeding needed.");
      return NextResponse.json({
        seeded: false,
        message: "Incident types already exist",
      });
    }
  } catch (error) {
    console.error("[INCIDENT_TYPES_SEED]", error);
    return new NextResponse("Erreur interne lors du seeding", { status: 500 });
  }
}
