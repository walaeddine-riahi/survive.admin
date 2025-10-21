import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixMediaUrls() {
  try {
    console.log(
      "🔍 Recherche des injections avec des URLs de média contenant des espaces...\n"
    );

    // Trouver toutes les injections avec imageUrl ou videoUrl
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

    console.log(
      `📊 ${injections.length} injection(s) trouvée(s) avec des médias\n`
    );

    let updatedCount = 0;

    for (const injection of injections) {
      let needsUpdate = false;
      const updates: { imageUrl?: string; videoUrl?: string } = {};

      // Nettoyer imageUrl si nécessaire
      if (injection.imageUrl && injection.imageUrl.includes("_")) {
        // Vérifier si l'URL contient des underscores qui devraient être des tirets
        const oldUrl = injection.imageUrl;

        // Extraire le nom du fichier
        const parts = oldUrl.split("/");
        const fileName = parts[parts.length - 1];

        // Si le nom contient des patterns suspects (timestamp_Nom_Avec_Underscores)
        if (fileName.match(/^\d+_[A-Z]/)) {
          const [timestamp, ...nameParts] = fileName.split("_");
          const ext = fileName.substring(fileName.lastIndexOf("."));
          const nameWithoutExt = nameParts.join("_").replace(ext, "");

          // Convertir en lowercase avec tirets
          const cleanName = nameWithoutExt.replace(/_/g, "-").toLowerCase();

          const newFileName = `${timestamp}-${cleanName}${ext}`;
          const newUrl = parts.slice(0, -1).concat(newFileName).join("/");

          if (newUrl !== oldUrl) {
            updates.imageUrl = newUrl;
            needsUpdate = true;
            console.log(`🖼️  Image URL pour "${injection.title}":`);
            console.log(`   Ancien: ${oldUrl}`);
            console.log(`   Nouveau: ${newUrl}`);
          }
        }
      }

      // Nettoyer videoUrl si nécessaire
      if (injection.videoUrl && injection.videoUrl.includes("_")) {
        const oldUrl = injection.videoUrl;
        const parts = oldUrl.split("/");
        const fileName = parts[parts.length - 1];

        if (fileName.match(/^\d+_[A-Z]/)) {
          const [timestamp, ...nameParts] = fileName.split("_");
          const ext = fileName.substring(fileName.lastIndexOf("."));
          const nameWithoutExt = nameParts.join("_").replace(ext, "");

          const cleanName = nameWithoutExt.replace(/_/g, "-").toLowerCase();

          const newFileName = `${timestamp}-${cleanName}${ext}`;
          const newUrl = parts.slice(0, -1).concat(newFileName).join("/");

          if (newUrl !== oldUrl) {
            updates.videoUrl = newUrl;
            needsUpdate = true;
            console.log(`🎥 Video URL pour "${injection.title}":`);
            console.log(`   Ancien: ${oldUrl}`);
            console.log(`   Nouveau: ${newUrl}`);
          }
        }
      }

      // Mettre à jour si nécessaire
      if (needsUpdate) {
        await prisma.injection.update({
          where: { id: injection.id },
          data: updates,
        });
        updatedCount++;
        console.log(`✅ Injection mise à jour\n`);
      }
    }

    console.log(`\n🎉 Terminé ! ${updatedCount} injection(s) mise(s) à jour`);
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMediaUrls();
