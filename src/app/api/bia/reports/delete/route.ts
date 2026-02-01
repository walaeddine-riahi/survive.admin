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
    const { reportIds } = body;

    if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return NextResponse.json(
        { error: "reportIds requis (tableau non vide)" },
        { status: 400 }
      );
    }

    // Supprimer les rapports
    const result = await prisma.biaReport.deleteMany({
      where: {
        id: { in: reportIds },
      },
    });

    return NextResponse.json({
      success: true,
      deleted: result.count,
      message: `${result.count} rapport${result.count > 1 ? "s" : ""} supprimé${
        result.count > 1 ? "s" : ""
      }`,
    });
  } catch (error) {
    console.error("Erreur suppression rapports:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la suppression des rapports",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
