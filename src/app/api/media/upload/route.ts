import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { azureStorage } from "@/lib/azure-storage";
import { prisma } from "@/lib/prisma";

/**
 * Azure Storage File Upload API
 * Persistent file storage for production deployment
 */

// Allowed file extensions
const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".jpg",
  ".jpeg",
  ".png",
  ".mp4",
  ".webm",
  ".mov",
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "documents";
    const uploadType = (formData.get("uploadType") as string) || "general";
    const simulationId = (formData.get("simulationId") as string) || undefined;
    const assignmentId = (formData.get("assignmentId") as string) || undefined;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Le fichier est trop volumineux (max 50MB)" },
        { status: 400 }
      );
    }

    // Validate file extension
    const ext = ("." + file.name.split(".").pop()).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: "Type de fichier non autorisé" },
        { status: 400 }
      );
    }

    // Check if Azure Storage is available
    if (!azureStorage.isAvailable()) {
      return NextResponse.json(
        { error: "File storage service not available" },
        { status: 503 }
      );
    }

    // Generate unique filename with timestamp and user ID
    const timestamp = Date.now();
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();
    const fileName = `${timestamp}-${sanitizedName}`;

    // Upload file to Azure Storage
    const storageUrl = await azureStorage.uploadFile(file, fileName, folder);
    console.log(`[UPLOAD] File uploaded to Azure: ${fileName}`);

    // Extract blob path from storage URL for database storage
    const blobPath = `${folder}/${fileName}`;

    // Save file metadata to database
    const fileRecord = await prisma.fileUpload.create({
      data: {
        fileName: file.name,
        storagePath: blobPath,
        storageUrl: `/api/media/download/${encodeURIComponent(blobPath)}`,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
        uploadType: uploadType,
        storageProvider: "azure",
        uploadedById: session.user.id,
        ...(simulationId && { simulationId }),
        ...(assignmentId && { assignmentId }),
      },
    });

    console.log(`[DB] File record created: ${fileRecord.id}`);

    return NextResponse.json(
      {
        success: true,
        file: {
          id: fileRecord.id,
          name: file.name,
          path: blobPath,
          url: fileRecord.storageUrl,
          size: file.size,
          type: file.type,
          uploadType: uploadType,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload du fichier" },
      { status: 500 }
    );
  }
}
