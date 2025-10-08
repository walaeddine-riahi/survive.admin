import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    // Récupérer tous les rôles uniques de la table Task
    const tasks = await prisma.task.findMany({
      select: {
        role: true,
      },
      distinct: ['role'],
      where: {
        role: {
          not: null,
        },
      },
    });

    // Extraire les rôles et supprimer les doublons
    const roles = Array.from(new Set(tasks.map(task => task.role).filter(Boolean)));

    return NextResponse.json(roles);
  } catch (error) {
    console.error("[TASKS_ROLES_GET]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
