import fs from "fs";
import path from "path";

/**
 * Script pour nettoyer les noms de fichiers dans le dossier /public/media/
 * Remplace les espaces et caractères spéciaux par des tirets
 */

const mediaDir = path.join(process.cwd(), "public", "media");

function sanitizeFileName(fileName: string): string {
  const ext = path.extname(fileName);
  const nameWithoutExt = path.basename(fileName, ext);

  const sanitized = nameWithoutExt
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return `${sanitized}${ext}`;
}

function cleanMediaFiles(dir: string) {
  if (!fs.existsSync(dir)) {
    console.log(`Le dossier ${dir} n'existe pas`);
    return;
  }

  const files = fs.readdirSync(dir, { withFileTypes: true });

  files.forEach((file) => {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      // Récursif pour les sous-dossiers
      cleanMediaFiles(fullPath);
    } else if (file.isFile()) {
      const sanitizedName = sanitizeFileName(file.name);

      if (sanitizedName !== file.name) {
        const newPath = path.join(dir, sanitizedName);

        // Vérifier si le fichier cible existe déjà
        if (fs.existsSync(newPath)) {
          console.log(
            `⚠️  Le fichier ${sanitizedName} existe déjà, ajout d'un timestamp`
          );
          const timestamp = Date.now();
          const ext = path.extname(sanitizedName);
          const nameWithoutExt = path.basename(sanitizedName, ext);
          const uniqueName = `${timestamp}_${nameWithoutExt}${ext}`;
          const uniquePath = path.join(dir, uniqueName);
          fs.renameSync(fullPath, uniquePath);
          console.log(`✅ Renommé: ${file.name} → ${uniqueName}`);
        } else {
          fs.renameSync(fullPath, newPath);
          console.log(`✅ Renommé: ${file.name} → ${sanitizedName}`);
        }
      }
    }
  });
}

console.log("🚀 Nettoyage des noms de fichiers dans /public/media/...\n");
cleanMediaFiles(mediaDir);
console.log("\n✅ Nettoyage terminé !");
