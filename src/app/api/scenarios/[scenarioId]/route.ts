import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { scenarioId: string } }
) {
  try {
    const scenario = await prisma.scenario.findUnique({
      where: {
        id: params.scenarioId,
      },
      include: {
        simulation: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!scenario) {
      return NextResponse.json(
        { error: "Scenario not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(scenario);
  } catch (error) {
    console.error("Error fetching scenario:", error);
    return NextResponse.json(
      { error: "Failed to fetch scenario" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { scenarioId: string } }
) {
  try {
    const body = await request.json();
    const { name, description, simulationId } = body;

    const scenario = await prisma.scenario.update({
      where: {
        id: params.scenarioId,
      },
      data: {
        name,
        description,
        simulationId,
      },
      include: {
        simulation: {
          select: {
            title: true,
          },
        },
      },
    });

    return NextResponse.json(scenario);
  } catch (error) {
    console.error("Error updating scenario:", error);
    return NextResponse.json(
      { error: "Failed to update scenario" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { scenarioId: string } }
) {
  try {
    await prisma.scenario.delete({
      where: {
        id: params.scenarioId,
      },
    });

    return NextResponse.json({ message: "Scenario deleted successfully" });
  } catch (error) {
    console.error("Error deleting scenario:", error);
    return NextResponse.json(
      { error: "Failed to delete scenario" },
      { status: 500 }
    );
  }
}
