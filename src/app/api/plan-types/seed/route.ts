import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Vérifier si des types existent déjà
    const existingTypes = await prisma.planType.findMany();
    if (existingTypes.length > 0) {
      return NextResponse.json({
        message: "Types de plan déjà existants",
        types: existingTypes,
      });
    }

    // Créer les types de plan par défaut
    const defaultTypes = [
      {
        name: "Maintenance",
        description: "Plan de maintenance préventive et corrective",
      },
      {
        name: "Sécurité",
        description: "Plan de sécurité et de prévention des risques",
      },
      {
        name: "Formation",
        description: "Plan de formation et de développement des compétences",
      },
      {
        name: "Urgence",
        description: "Plan d'urgence et de gestion de crise",
      },
      {
        name: "Qualité",
        description: "Plan d'assurance qualité et d'amélioration continue",
      },
    ];

    const createdTypes = await Promise.all(
      defaultTypes.map((type) =>
        prisma.planType.create({
          data: type,
        })
      )
    );

    return NextResponse.json({
      message: "Types de plan créés avec succès",
      types: createdTypes,
    });
  } catch (error) {
    console.error("Error seeding plan types:", error);
    return NextResponse.json(
      { error: "Failed to seed plan types" },
      { status: 500 }
    );
  }
}
