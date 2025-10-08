import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/plan-types
export async function GET() {
  try {
    const planTypes = await prisma.planType.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(planTypes);
  } catch (error) {
    console.error("Error fetching plan types:", error);
    return NextResponse.json(
      { error: "Failed to fetch plan types" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const planType = await prisma.planType.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
    return NextResponse.json(planType);
  } catch (error) {
    console.error("Error creating plan type:", error);
    return NextResponse.json(
      { error: "Failed to create plan type" },
      { status: 500 }
    );
  }
}
