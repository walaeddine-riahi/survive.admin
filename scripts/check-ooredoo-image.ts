import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkRecentInjection() {
  try {
    // Trouver l'injection la plus récente avec une image
    const injection = await prisma.injection.findFirst({
      where: {
        imageUrl: {
          contains: "ooredoo",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        createdAt: true,
      },
    });

    if (!injection) {
      console.log('❌ Aucune injection trouvée avec "ooredoo" dans l\'URL');
      return;
    }

    console.log("\n📌 Injection trouvée:");
    console.log(`   ID: ${injection.id}`);
    console.log(`   Titre: ${injection.title}`);
    console.log(`   Date: ${injection.createdAt}`);
    console.log(`\n🖼️  URL Image stockée dans la DB:`);
    console.log(`   ${injection.imageUrl}`);

    // Vérifier le format
    if (injection.imageUrl?.startsWith("/media/")) {
      console.log(
        "\n✅ L'URL commence par /media/ - devrait utiliser <img> natif"
      );
    } else if (injection.imageUrl?.startsWith("http")) {
      console.log("\n✅ L'URL est externe - devrait utiliser <Image> Next.js");
    } else {
      console.log("\n⚠️  Format d'URL inattendu");
    }
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentInjection();
