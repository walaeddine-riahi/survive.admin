/**
 * API Route : Suppression d'usines (DELETE)
 *
 * Permet de supprimer une ou plusieurs usines
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer les IDs des usines à supprimer
    const { factoryIds } = await request.json();

    if (!factoryIds || !Array.isArray(factoryIds) || factoryIds.length === 0) {
      return NextResponse.json(
        { error: "Aucune usine spécifiée" },
        { status: 400 }
      );
    }

    // Supprimer les usines
    const result = await prisma.factory.deleteMany({
      where: {
        id: {
          in: factoryIds,
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `${result.count} usine(s) supprimée(s) avec succès`,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression des usines:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression des usines" },
      { status: 500 }
    );
  }
}
