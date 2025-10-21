import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function listMediaUrls() {
  try {
    const injections = await prisma.injection.findMany({
      where: {
        OR: [{ imageUrl: { not: null } }, { videoUrl: { not: null } }],
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        videoUrl: true,
      },
    });

    console.log(`\n📊 ${injections.length} injection(s) avec médias:\n`);

    injections.forEach((inj) => {
      console.log(`📌 ${inj.title}`);
      if (inj.imageUrl) {
        console.log(`   🖼️  Image: ${inj.imageUrl}`);
      }
      if (inj.videoUrl) {
        console.log(`   🎥 Vidéo: ${inj.videoUrl}`);
      }
      console.log("");
    });
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

listMediaUrls();
