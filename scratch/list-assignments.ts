import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const assignments = await prisma.simulationAssignment.findMany({
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        simulation: { select: { title: true } }
      }
    });
    console.log("Simulation Assignments:");
    console.log(JSON.stringify(assignments, null, 2));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
