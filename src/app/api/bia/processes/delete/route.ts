import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const { processIds } = body;

    if (!processIds || !Array.isArray(processIds) || processIds.length === 0) {
      return NextResponse.json(
        { error: "processIds requis (tableau non vide)" },
        { status: 400 }
      );
    }

    // Supprimer les processus
    const result = await prisma.process.deleteMany({
      where: {
        id: { in: processIds },
      },
    });

    return NextResponse.json({
      success: true,
      deleted: result.count,
      message: `${result.count} processus supprimé${
        result.count > 1 ? "s" : ""
      }`,
    });
  } catch (error) {
    console.error("Erreur suppression processus:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la suppression des processus",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
