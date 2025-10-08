import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/plans
export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      include: {
        type: true,
        planTasks: {
          include: {
            task: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    console.log("Plans fetched from Prisma (backend): ", plans);

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

// POST /api/plans
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { assignedTaskIds, ...planData } = data;

    const plan = await prisma.plan.create({
      data: {
        ...planData,
        startDate: new Date(planData.startDate),
        endDate: new Date(planData.endDate),
        planTasks: {
          create: assignedTaskIds?.map((id: string) => ({
            taskId: id,
          })),
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
    console.error("Error creating plan:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create plan" },
      { status: 500 }
    );
  }
}
