import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { writeFile } from "fs/promises";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "";

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Valider la taille du fichier (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Le fichier est trop volumineux (max 10MB)" },
        { status: 400 }
      );
    }

    // Valider l'extension du fichier
    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".svg",
      ".mp4",
      ".webm",
      ".mov",
      ".avi",
      ".pdf",
      ".doc",
      ".docx",
      ".txt",
    ];
    const ext = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { error: "Type de fichier non autorisé" },
        { status: 400 }
      );
    }

    // Créer le dossier de destination
    const mediaDir = path.join(process.cwd(), "public", "media", folder);
    if (!fs.existsSync(mediaDir)) {
      fs.mkdirSync(mediaDir, { recursive: true });
    }

    // Générer un nom de fichier unique avec sanitization stricte
    const timestamp = Date.now();
    // Extraire le nom sans extension et l'extension
    const fileNameWithoutExt = path.basename(file.name, ext);
    // Remplacer tous les caractères non-alphanumériques par des tirets
    const sanitizedName = fileNameWithoutExt
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-") // Remplacer les tirets multiples par un seul
      .replace(/^-|-$/g, "") // Enlever les tirets au début et à la fin
      .toLowerCase();
    const fileName = `${timestamp}_${sanitizedName}${ext}`;
    const filePath = path.join(mediaDir, fileName);

    // Convertir le fichier en buffer et l'enregistrer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Construire l'URL relative
    const relativePath = folder ? `${folder}/${fileName}` : fileName;
    const fileUrl = `/media/${relativePath}`;

    return NextResponse.json({
      success: true,
      file: {
        name: fileName,
        path: relativePath,
        url: fileUrl,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'upload du fichier:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload du fichier" },
      { status: 500 }
    );
  }
}
