import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@test.tn";
  const password = "AdminPassword123!";
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: "ADMIN",
      },
      create: {
        email,
        password: hashedPassword,
        firstName: "Admin",
        lastName: "Test",
        role: "ADMIN",
        profile: {
          create: {
            bio: "Compte administrateur créé pour le test",
            phone: "+216 00 000 000",
            address: "Test Address",
          },
        },
      },
    });
    console.log(`✅ Compte admin prêt :`);
    console.log(`Email : ${email}`);
    console.log(`Mot de passe : ${password}`);
  } catch (error) {
    console.error("Erreur lors de la création du compte :", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
