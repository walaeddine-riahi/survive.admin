import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const planType = await prisma.planType.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!planType) {
      return NextResponse.json(
        { error: "Plan type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(planType);
  } catch (error) {
    console.error("Error fetching plan type:", error);
    return NextResponse.json(
      { error: "Failed to fetch plan type" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const planType = await prisma.planType.update({
      where: {
        id: params.id,
      },
      data: {
        name: data.name,
        description: data.description,
      },
    });
    return NextResponse.json(planType);
  } catch (error) {
    console.error("Error updating plan type:", error);
    return NextResponse.json(
      { error: "Failed to update plan type" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.planType.delete({
      where: {
        id: params.id,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting plan type:", error);
    return NextResponse.json(
      { error: "Failed to delete plan type" },
      { status: 500 }
    );
  }
}
