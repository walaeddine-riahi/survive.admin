import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      }
    });
    console.log("Users in database:");
    console.log(JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error fetching users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
