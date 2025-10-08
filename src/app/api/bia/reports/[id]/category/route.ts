import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/bia/reports/[id]/category
 * Met à jour la catégorie d'un rapport BIA
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const { category } = await req.json();

    console.log("� Mise à jour de l'usine pour le rapport:", id);
    console.log("📝 Nouvelle usine:", category);

    // Vérifier que le rapport existe et appartient à l'utilisateur
    const report = await prisma.biaReport.findFirst({
      where: {
        id,
        authorId: session.user.id,
      },
    });

    if (!report) {
      console.error("❌ Rapport non trouvé pour l'ID:", id);
      return NextResponse.json(
        { error: "Rapport non trouvé" },
        { status: 404 }
      );
    }

    // Mettre à jour la catégorie
    const updatedReport = await prisma.biaReport.update({
      where: { id },
      data: {
        category: category || null,
        updatedAt: new Date(),
      },
    });

    console.log("✅ Usine mise à jour avec succès!");

    return NextResponse.json({
      success: true,
      category: updatedReport.category,
      message: "Usine mise à jour avec succès",
    });
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour de l'usine:", error);
    return NextResponse.json(
      {
        error:
          "Erreur lors de la mise à jour: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}
