import { NextRequest, NextResponse } from "next/server";
import { getUploadedFileContent } from "@/actions/bia/simple-upload-actions";
import { readFile } from "fs/promises";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { searchParams } = new URL(request.url);
    const inline = searchParams.get("inline") === "true"; // Paramètre pour affichage en ligne

    if (!id) {
      return NextResponse.json(
        { error: "ID du rapport requis" },
        { status: 400 }
      );
    }

    // Récupérer les informations du fichier
    const result = await getUploadedFileContent(id);

    if (!result.success || !result.data?.report) {
      return NextResponse.json(
        { error: result.error || "Rapport non trouvé" },
        { status: 404 }
      );
    }

    const report = result.data.report;

    if (!report.filePath || !report.fileName) {
      return NextResponse.json(
        { error: "Fichier non disponible" },
        { status: 404 }
      );
    }

    try {
      // Lire le fichier
      const fileBuffer = await readFile(report.filePath);

      // Déterminer le type MIME
      const mimeType = report.mimeType || "application/octet-stream";

      // Créer la réponse avec le fichier
      const response = new NextResponse(fileBuffer as unknown as BodyInit);

      // Headers selon le mode (téléchargement ou visualisation)
      response.headers.set("Content-Type", mimeType);

      if (
        inline &&
        (mimeType === "application/pdf" || mimeType.startsWith("image/"))
      ) {
        // Mode visualisation en ligne pour PDF et images
        response.headers.set(
          "Content-Disposition",
          `inline; filename="${encodeURIComponent(report.fileName)}"`
        );
      } else {
        // Mode téléchargement
        response.headers.set(
          "Content-Disposition",
          `attachment; filename="${encodeURIComponent(report.fileName)}"`
        );
      }

      response.headers.set("Content-Length", fileBuffer.length.toString());

      // Headers CORS pour permettre l'embedding
      response.headers.set("X-Frame-Options", "SAMEORIGIN");
      response.headers.set("Access-Control-Allow-Origin", "*");

      return response;
    } catch (fileError) {
      console.error("Erreur lecture fichier:", fileError);
      return NextResponse.json(
        { error: "Fichier introuvable sur le serveur" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Erreur téléchargement:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
