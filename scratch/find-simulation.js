const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const simulation = await prisma.simulation.findFirst();
  if (simulation) {
    console.log(`FOUND_SIMULATION_ID: ${simulation.id}`);
  } else {
    console.log("NO_SIMULATION_FOUND");
  }
  await prisma.$disconnect();
}

main();
