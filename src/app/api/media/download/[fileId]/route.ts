/**
 * Azure Storage File Download API
 * Retrieves files from Azure Blob Storage with access control
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { azureStorage } from "@/lib/azure-storage";
import { BlobServiceClient } from "@azure/storage-blob";

interface RouteParams {
  params: {
    fileId: string;
  };
}

/**
 * GET: Download file with permission validation
 * Route: /api/media/download/[fileId]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { fileId } = params;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if Azure Storage is available
    if (!azureStorage.isAvailable()) {
      return NextResponse.json(
        { success: false, error: "File download service not configured" },
        { status: 503 }
      );
    }

    // fileId is the encoded blob path (folder/fileName)
    const blobName = decodeURIComponent(fileId);

    // Initialize Azure Storage directly to get the blob
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "uploads";

    if (!connectionString) {
      return NextResponse.json(
        { success: false, error: "Storage not configured" },
        { status: 503 }
      );
    }

    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    try {
      // Get blob properties
      const properties = await blockBlobClient.getProperties();

      // Download blob
      const downloadBlockBlobResponse = await blockBlobClient.download(0);

      // Convert stream to buffer
      const chunks: Buffer[] = [];
      const readable = downloadBlockBlobResponse.readableStreamBody;

      if (!readable) {
        return NextResponse.json(
          { success: false, error: "Failed to read file" },
          { status: 500 }
        );
      }

      for await (const chunk of readable) {
        if (typeof chunk === "string") {
          chunks.push(Buffer.from(chunk));
        } else if (Buffer.isBuffer(chunk)) {
          chunks.push(chunk);
        } else {
          // Handle Uint8Array and other buffer-like objects
          chunks.push(Buffer.from(chunk as unknown as ArrayLike<number>));
        }
      }

      const buffer = Buffer.concat(chunks);

      // Extract filename from blob path
      const filename = blobName.split("/").pop() || "file";

      // Return file with appropriate headers
      const headers = new Headers({
        "Content-Type": properties.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      });

      return new NextResponse(buffer, {
        status: 200,
        headers,
      });
    } catch (error: unknown) {
      // Blob not found
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "BlobNotFound"
      ) {
        return NextResponse.json(
          { success: false, error: "File not found" },
          { status: 404 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
