/**
 * File List API Route
 * Lists uploaded files for a user or simulation with permission checks
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET: List files uploaded by user or for a simulation
 * Query params:
 *   - uploadType?: string (filter by type, e.g., 'simulation_report')
 *   - simulationId?: string (filter by simulation)
 *   - assignmentId?: string (filter by assignment)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const uploadType = searchParams.get("uploadType");
    const simulationId = searchParams.get("simulationId");
    const assignmentId = searchParams.get("assignmentId");

    // Build filter conditions
    const where: Record<string, unknown> = {
      uploadedById: session.user.id,
    };

    if (uploadType) {
      where.uploadType = uploadType;
    }

    if (simulationId) {
      where.simulationId = simulationId;
    }

    if (assignmentId) {
      where.assignmentId = assignmentId;
    }

    // For admins, allow listing files from any user
    if (session.user.role === "ADMIN") {
      delete where.uploadedById;
    }

    // Fetch files from database
    const files = await prisma.fileUpload.findMany({
      where,
      select: {
        id: true,
        fileName: true,
        fileSize: true,
        mimeType: true,
        uploadType: true,
        createdAt: true,
        uploadedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        simulation: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100, // Limit to 100 files per request
    });

    return NextResponse.json({
      success: true,
      files: files.map((file: (typeof files)[number]) => ({
        id: file.id,
        name: file.fileName,
        size: file.fileSize,
        type: file.mimeType,
        uploadType: file.uploadType,
        uploadedAt: file.createdAt,
        uploadedBy: {
          id: file.uploadedBy.id,
          email: file.uploadedBy.email,
          name: `${file.uploadedBy.firstName} ${file.uploadedBy.lastName}`.trim(),
        },
        simulation: file.simulation
          ? {
              id: file.simulation.id,
              title: file.simulation.title,
            }
          : null,
      })),
      count: files.length,
    });
  } catch (error) {
    console.error("List files error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Delete a file
 * Query param: fileId
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get file ID from query
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: "Missing fileId parameter" },
        { status: 400 }
      );
    }

    // Get file from database
    const file = await prisma.fileUpload.findUnique({
      where: { id: fileId },
      select: {
        id: true,
        fileName: true,
        storagePath: true,
        uploadedById: true,
        storageProvider: true,
      },
    });

    if (!file) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    // Check permissions - only uploader or admin can delete
    if (
      file.uploadedById !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { success: false, error: "Permission denied" },
        { status: 403 }
      );
    }

    // Delete from storage based on provider
    if (file.storageProvider === "azure") {
      const { azureStorage } = await import("@/lib/azure-storage");

      if (azureStorage.isAvailable()) {
        try {
          // Delete from Azure Storage using the blob path
          const containerClient = azureStorage.getContainerClient();
          if (!containerClient) {
            throw new Error("Container client not available");
          }
          const blockBlobClient = containerClient.getBlockBlobClient(
            file.storagePath
          );
          await blockBlobClient.deleteIfExists();
          console.log(`[AZURE] Blob deleted: ${file.storagePath}`);
        } catch (error) {
          console.error("Azure delete error:", error);
          // Continue anyway - delete from DB
        }
      }
    }

    // Delete from database
    await prisma.fileUpload.delete({
      where: { id: fileId },
    });

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete file error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
