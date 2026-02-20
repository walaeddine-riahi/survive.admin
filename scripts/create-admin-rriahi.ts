import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Création de l'utilisateur admin...");

  const email = "rriahi@grssconsulting.com";
  const password = "Elmandra1603*";
  const hashedPassword = await bcrypt.hash(password, 10);

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(
      "⚠️  L'utilisateur existe déjà. Mise à jour du mot de passe..."
    );

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log("✅ Mot de passe mis à jour avec succès!");
  } else {
    console.log("➕ Création d'un nouvel utilisateur admin...");

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: "Raouf",
        lastName: "Riahi",
        role: "ADMIN",
      },
    });

    console.log("✅ Utilisateur admin créé avec succès!");
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Nom: ${user.firstName} ${user.lastName}`);
    console.log(`🔑 Rôle: ${user.role}`);
  }

  console.log("\n🎉 Terminé!");
  console.log("\n📝 Informations de connexion:");
  console.log(`   Email: ${email}`);
  console.log(`   Mot de passe: ${password}`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
