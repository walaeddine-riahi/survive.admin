/**
 * DEPRECATED: This route is deprecated in favor of /api/media/upload
 * which uses Azure Storage instead of Supabase.
 * Please use the Azure-based upload endpoint.
 */

import { NextResponse } from "next/server";

/**
 * This endpoint has been deprecated and replaced by the Azure Storage implementation
 * at /api/media/upload. All file uploads should now use the new endpoint which provides:
 * - Persistent cloud storage via Azure Blob Storage
 * - Better production reliability
 * - Automatic scaling and redundancy
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "This endpoint is deprecated",
      message:
        "Please use /api/media/upload instead. The application now uses Azure Blob Storage for persistent file uploads.",
    },
    { status: 410 } // 410 Gone
  );
}
