import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT: Mettre à jour un rapport BIA
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    // Vérifier que le rapport existe et appartient à l'utilisateur
    const existingReport = await prisma.biaReport.findUnique({
      where: { id },
    });

    if (!existingReport) {
      return NextResponse.json(
        { success: false, error: "Rapport non trouvé" },
        { status: 404 }
      );
    }

    // Seul l'auteur peut modifier le rapport (ou un admin)
    if (existingReport.authorId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Vous n'avez pas la permission de modifier ce rapport",
        },
        { status: 403 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: {
      includedProcessIds?: string[];
      totalProcesses?: number;
    } = {};

    if (body.includedProcessIds !== undefined) {
      updateData.includedProcessIds = body.includedProcessIds;
      // Mettre à jour également le nombre total de processus
      updateData.totalProcesses = body.includedProcessIds.length;
    }

    // Mettre à jour le rapport
    const updatedReport = await prisma.biaReport.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        factory: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedReport,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du rapport:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la mise à jour du rapport",
      },
      { status: 500 }
    );
  }
}

// DELETE: Supprimer un rapport BIA
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Vérifier que le rapport existe et appartient à l'utilisateur
    const existingReport = await prisma.biaReport.findUnique({
      where: { id },
    });

    if (!existingReport) {
      return NextResponse.json(
        { success: false, error: "Rapport non trouvé" },
        { status: 404 }
      );
    }

    // Seul l'auteur peut supprimer le rapport (ou un admin)
    if (existingReport.authorId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Vous n'avez pas la permission de supprimer ce rapport",
        },
        { status: 403 }
      );
    }

    // Supprimer le rapport
    await prisma.biaReport.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Rapport supprimé avec succès",
    });
  } catch (error) {
    console.error("❌ Erreur lors de la suppression du rapport:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la suppression du rapport",
      },
      { status: 500 }
    );
  }
}

// GET: Récupérer un rapport BIA
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const report = await prisma.biaReport.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        factory: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: "Rapport non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du rapport:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la récupération du rapport",
      },
      { status: 500 }
    );
  }
}
