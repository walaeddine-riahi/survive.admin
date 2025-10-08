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

    const tasks = await prisma.task.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("[TASKS_GET]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const taskData = await req.json();

    if (!taskData.title || !taskData.teamId) {
      return new NextResponse("Données manquantes", { status: 400 });
    }

    const formattedData = {
      ...taskData,
      dueDate: taskData.dueDate
        ? new Date(taskData.dueDate).toISOString()
        : null,
      creatorId: session.user.id,
    };

    const task = await prisma.task.create({
      data: formattedData,
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("[TASKS_POST] Error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
