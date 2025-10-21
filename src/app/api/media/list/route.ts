import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const mediaDir = path.join(process.cwd(), "public", "media");

    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(mediaDir)) {
      fs.mkdirSync(mediaDir, { recursive: true });
      return NextResponse.json({ files: [] });
    }

    // Fonction récursive pour lister tous les fichiers
    function getAllFiles(
      dirPath: string,
      arrayOfFiles: string[] = []
    ): string[] {
      const files = fs.readdirSync(dirPath);

      files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        if (fs.statSync(filePath).isDirectory()) {
          arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
        } else {
          // Ignorer les fichiers README
          if (!file.toLowerCase().includes("readme")) {
            const relativePath = path
              .relative(mediaDir, filePath)
              .replace(/\\/g, "/");
            arrayOfFiles.push(relativePath);
          }
        }
      });

      return arrayOfFiles;
    }

    const allFiles = getAllFiles(mediaDir);

    // Créer une structure avec des métadonnées
    const filesWithMeta = allFiles.map((file) => {
      const fullPath = path.join(mediaDir, file);
      const stats = fs.statSync(fullPath);
      const ext = path.extname(file).toLowerCase();

      let type = "other";
      if ([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(ext)) {
        type = "image";
      } else if ([".mp4", ".webm", ".mov", ".avi"].includes(ext)) {
        type = "video";
      } else if ([".pdf", ".doc", ".docx", ".txt"].includes(ext)) {
        type = "document";
      }

      return {
        name: path.basename(file),
        path: file,
        url: `/media/${file}`,
        size: stats.size,
        type,
        extension: ext,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
      };
    });

    // Trier par date de modification (plus récent en premier)
    filesWithMeta.sort(
      (a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime()
    );

    return NextResponse.json({ files: filesWithMeta });
  } catch (error) {
    console.error("Erreur lors de la récupération des fichiers média:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des fichiers" },
      { status: 500 }
    );
  }
}
