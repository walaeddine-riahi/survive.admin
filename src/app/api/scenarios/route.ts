import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const scenarios = await prisma.scenario.findMany({
      include: {
        simulation: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(scenarios);
  } catch (error) {
    console.error("Error fetching scenarios:", error);
    return NextResponse.json(
      { error: "Failed to fetch scenarios" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, simulationId } = body;

    const scenario = await prisma.scenario.create({
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
    console.error("Error creating scenario:", error);
    return NextResponse.json(
      { error: "Failed to create scenario" },
      { status: 500 }
    );
  }
}
