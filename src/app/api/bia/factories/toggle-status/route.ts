/**
 * API Route : Basculer le statut actif/inactif d'une usine (PUT)
 *
 * Permet d'activer ou désactiver une usine
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer l'ID de l'usine
    const { factoryId } = await request.json();

    if (!factoryId) {
      return NextResponse.json(
        { error: "ID de l'usine manquant" },
        { status: 400 }
      );
    }

    // Récupérer l'usine actuelle
    const factory = await prisma.factory.findUnique({
      where: { id: factoryId },
      select: { isActive: true },
    });

    if (!factory) {
      return NextResponse.json({ error: "Usine non trouvée" }, { status: 404 });
    }

    // Basculer le statut
    const updatedFactory = await prisma.factory.update({
      where: { id: factoryId },
      data: {
        isActive: !factory.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      isActive: updatedFactory.isActive,
      message: updatedFactory.isActive
        ? "Usine activée avec succès"
        : "Usine désactivée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    return NextResponse.json(
      { error: "Erreur lors du changement de statut" },
      { status: 500 }
    );
  }
}
