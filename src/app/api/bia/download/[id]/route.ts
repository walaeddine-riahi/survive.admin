import { NextRequest, NextResponse } from "next/server";
import { getUploadedFileContent } from "@/actions/bia/upload-report-actions";
import { azureStorage } from "@/lib/azure-storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      // Download file from Azure Storage
      if (!azureStorage.isAvailable()) {
        return NextResponse.json(
          { error: "Service de stockage non disponible" },
          { status: 503 }
        );
      }

      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
      const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "uploads";

      if (!connectionString) {
        return NextResponse.json(
          { error: "Storage not configured" },
          { status: 503 }
        );
      }

      const { BlobServiceClient } = await import("@azure/storage-blob");
      const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(report.filePath);

      // Download blob
      const downloadResponse = await blockBlobClient.download(0);
      const chunks: Buffer[] = [];
      const readable = downloadResponse.readableStreamBody;

      if (!readable) {
        return NextResponse.json(
          { error: "Impossible de lire le fichier" },
          { status: 500 }
        );
      }

      for await (const chunk of readable) {
        if (typeof chunk === "string") {
          chunks.push(Buffer.from(chunk));
        } else if (Buffer.isBuffer(chunk)) {
          chunks.push(chunk);
        } else {
          chunks.push(Buffer.from(chunk as unknown as ArrayLike<number>));
        }
      }

      const fileBuffer = Buffer.concat(chunks);

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
      response.headers.set("X-Frame-Options", "ALLOWALL");
      response.headers.set("Access-Control-Allow-Origin", "*");
      response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
      response.headers.set("Cache-Control", "public, max-age=3600");

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

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
