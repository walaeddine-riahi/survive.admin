import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { simulationId: string } }
) {
  try {
    const simulationId = params.simulationId;

    const simulation = await prisma.simulation.findUnique({
      where: {
        id: simulationId,
      },
      include: {
        scenarios: true, // Include scenarios if needed on the edit page
        assignments: {
          // Include assignments if your form uses them
          include: {
            user: true, // Include user details for assignments
          },
        },
      },
    });

    if (!simulation) {
      return new NextResponse("Simulation not found", { status: 404 });
    }

    return NextResponse.json(simulation);
  } catch (error) {
    console.error("[SIMULATION_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { simulationId: string } }
) {
  try {
    const simulationId = params.simulationId;
    const data = await req.json();

    // You might want to add validation here for the incoming data

    const updatedSimulation = await prisma.simulation.update({
      where: {
        id: simulationId,
      },
      data: {
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate), // Ensure dates are Date objects
        endDate: new Date(data.endDate), // Ensure dates are Date objects
        status: data.status,
        // Add logic here to handle assignments updates if needed
        // For now, focusing on core simulation fields
      },
    });

    return NextResponse.json(updatedSimulation);
  } catch (error) {
    console.error("[SIMULATION_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// You might also want to add GET and DELETE handlers for this specific simulation ID
// import { GET, DELETE } from './[simulationId]/route'; // Example if you had them elsewhere
