import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: {
        id: params.taskId,
      },
      include: {
        assignee: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        team: true,
        creator: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!task) {
      return new NextResponse("Tâche non trouvée", { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("[TASK_GET]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      teamId,
      assigneeId,
    } = body;

    if (!title || !teamId) {
      return new NextResponse("Données manquantes", { status: 400 });
    }

    const taskId = await params.taskId;
    const task = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        teamId,
        assigneeId,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("[TASK_PATCH]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    await prisma.task.delete({
      where: {
        id: params.taskId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[TASK_DELETE]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
