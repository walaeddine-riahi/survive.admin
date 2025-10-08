import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { simulationId: string; injectionId: string } }
) {
  try {
    const { simulationId, injectionId } = params;

    const updated = await prisma.injection.updateMany({
      where: {
        id: injectionId,
        simulationId: simulationId,
      },
      data: {
        acknowledged: true,
      },
    });

    if (updated.count === 0) {
      return new NextResponse("Injection not found", { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[INJECTION_ACKNOWLEDGE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
