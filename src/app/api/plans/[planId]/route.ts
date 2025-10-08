import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/plans/[id]
export async function GET(
  request: Request,
  { params }: { params: { planId: string } }
) {
  await params;
  try {
    const plan = await prisma.plan.findUnique({
      where: {
        id: params.planId,
      },
      include: {
        type: true,
        planTasks: {
          include: {
            task: true,
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json(plan);
  } catch (error: any) {
    console.error("Error fetching plan:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch plan" },
      { status: 500 }
    );
  }
}

// PUT /api/plans/[id]
export async function PUT(
  request: Request,
  { params }: { params: { planId: string } }
) {
  await params;
  try {
    const data = await request.json();
    const { assignedTaskIds, ...planData } = data;

    // Get the current plan to determine tasks to disconnect/connect
    const currentPlan = await prisma.plan.findUnique({
      where: { id: params.planId },
      include: {
        planTasks: {
          include: {
            task: true,
          },
        },
      },
    });

    if (!currentPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const currentTaskIds = currentPlan.planTasks.map((pt) => pt.taskId);

    const tasksToDisconnect = currentTaskIds.filter(
      (id) => !assignedTaskIds.includes(id)
    );
    const tasksToConnect = assignedTaskIds.filter(
      (id: string) => !currentTaskIds.includes(id)
    );

    const plan = await prisma.plan.update({
      where: {
        id: params.planId,
      },
      data: {
        ...planData,
        startDate: new Date(planData.startDate),
        endDate: new Date(planData.endDate),
        planTasks: {
          deleteMany: tasksToDisconnect.map((id) => ({
            taskId: id,
          })),
          createMany: {
            data: tasksToConnect.map((id) => ({
              taskId: id,
            })),
          },
        },
      },
      include: {
        type: true,
        planTasks: {
          include: {
            task: true,
          },
        },
      },
    });

    return NextResponse.json(plan);
  } catch (error: any) {
    console.error("Error updating plan:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update plan" },
      { status: 500 }
    );
  }
}

// DELETE /api/plans/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { planId: string } }
) {
  await params;
  try {
    await prisma.plan.delete({
      where: {
        id: params.planId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting plan:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete plan" },
      { status: 500 }
    );
  }
}
