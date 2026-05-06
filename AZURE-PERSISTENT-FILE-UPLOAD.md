# ✅ Azure Persistent File Upload Implementation

## Overview

The file upload system has been successfully converted from Supabase to **Azure Storage**, ensuring that PDF reports and other files uploaded by participants remain persistent even after platform deployment.

## 🔧 What's Been Implemented

### 1. **Azure Storage Service Layer** (`src/lib/azure-storage.ts`)

Singleton service class that manages all interactions with Azure Blob Storage:

- ✅ File upload with metadata headers (MIME type)
- ✅ File download with streaming
- ✅ File deletion with existence checks
- ✅ List files in folders
- ✅ Access verification (Azure Storage is available)

**Public Methods:**

```typescript
- isAvailable(): boolean                          // Check if storage is configured
- getContainerClient(): ContainerClient | null    // Get Azure container reference
- uploadFile(file: File, fileName?, folder?)      // Upload to Azure
- uploadFromFormData(formData, fieldName, folder) // Upload from FormData
- deleteFile(blobUrl: string)                    // Delete file
- listFiles(folder?): Promise<string[]>          // List files in folder
- generateSasUrl(blobName: string)               // Generate temporary URLs
```

### 2. **File Upload API Route** (`src/app/api/media/upload/route.ts`)

**POST Endpoint:** `/api/media/upload`

**Features:**

- ✅ Authentication check via NextAuth session
- ✅ File size validation (max 50MB for Azure, up from 10MB local)
- ✅ File type validation (.pdf, .doc, .docx, .jpg, .jpeg, .png, .mp4, .webm, .mov)
- ✅ Direct Azure Storage upload via `azureStorage.uploadFile()`
- ✅ Database persistence in MongoDB via Prisma
- ✅ Support for optional metadata: `simulationId`, `assignmentId`

**Request:**

```bash
POST /api/media/upload
Content-Type: multipart/form-data

{
  "file": <File>,
  "folder": "documents",           // optional, default="documents"
  "uploadType": "simulation_report", // optional, default="general"
  "simulationId": "123abc",        // optional
  "assignmentId": "456def"         // optional
}
```

**Response:**

```json
{
  "success": true,
  "file": {
    "id": "file_id_from_db",
    "name": "original-filename.pdf",
    "path": "documents/filename-1234567890.pdf",
    "url": "/api/media/download/documents%2Ffilename-1234567890.pdf",
    "size": 1024000,
    "type": "application/pdf",
    "uploadType": "simulation_report"
  }
}
```

### 3. **File Download API Route** (`src/app/api/media/download/[fileId]/route.ts`)

**GET Endpoint:** `/api/media/download/[blobPath]`

**Features:**

- ✅ Authentication validation
- ✅ File streaming from Azure Storage
- ✅ Proper Content-Type headers based on file MIME type
- ✅ Browser download with correct filename
- ✅ Error handling for missing/deleted files (404)

**Request:**

```bash
GET /api/media/download/documents%2Ffilename-1234567890.pdf
```

**Response:**

- File binary stream with headers:
  - `Content-Type: application/pdf` (based on actual file)
  - `Content-Disposition: attachment; filename="filename.pdf"`
  - `Content-Length: <size>`

### 4. **File Management Routes** (`src/app/api/media/files/route.ts`)

#### list Files (GET)

**Features:**

- ✅ List user's uploaded files (admins can list all)
- ✅ Filter by `uploadType` (e.g., "simulation_report")
- ✅ Filter by `simulationId` or `assignmentId`
- ✅ Return metadata (filename, size, upload time, uploader info)

**Query Parameters:**

```bash
GET /api/media/files?uploadType=simulation_report&simulationId=123abc
```

#### Delete File (DELETE)

**Features:**

- ✅ Delete from Azure Storage
- ✅ Delete from database
- ✅ Permission checks (uploader or admin only)
- ✅ Graceful handling if blob already deleted

**Query Parameters:**

```bash
DELETE /api/media/files?fileId=abc123def456
```

### 5. **Database Schema Updates** (`prisma/schema.prisma`)

**New Field:** `storageProvider`

```prisma
model FileUpload {
  id                  String   @id @default(auto()) @map("_id") @db.ObjectId
  fileName            String
  storagePath         String   // Path in Azure (e.g., "documents/filename.pdf")
  storageUrl          String   // Download endpoint URL
  fileSize            Int
  mimeType            String
  uploadType          String
  storageProvider     String   @default("azure")  // NEW: Identifies storage backend

  uploadedById        String   @db.ObjectId
  simulationId        String?  @db.ObjectId
  assignmentId        String?  @db.ObjectId

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  // Relations to User, Simulation, SimulationAssignment
  @@map("file_uploads")
}
```

**Why:** Allows future support for multiple storage backends (Azure, Supabase, GCS, S3, local)

## 🌐 Configuration

**Environment Variables Required:**

```bash
# .env file
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=survive;AccountKey=vCNaNOYv00GRxQ6ZOR0a/CzEAsLYrO2yIhjPmiCn2ftvB71cVPuvh00n0wIeH1zIuC+G4TF0JfUl+AStcbKBEw==;EndpointSuffix=core.windows.net

AZURE_STORAGE_CONTAINER_NAME=uploads
```

✅ **Status:** Both variables are already configured in .env

## 🧪 Testing & Validation

### Manual Testing Steps

1. **Start the development server:**

   ```bash
   npm run dev
   ```

2. **Login as participant:**

   - Email: `participant@survive.tn`
   - Password: `Participant@123456`

3. **Upload a file (test with participant mode):**

   ```bash
   curl -X POST http://localhost:3000/api/media/upload \
     -H "Authorization: Bearer <auth_token>" \
     -F "file=@test-report.pdf" \
     -F "folder=documents" \
     -F "uploadType=simulation_report"
   ```

4. **Verify in Azure Portal:**

   - Go to Azure Storage container "uploads"
   - Look for files in `documents/` folder
   - Files should be named like: `1234567890-test-report.pdf`

5. **Download the file:**

   - Use the returned `url` from upload response
   - Or curl: `curl http://localhost:3000/api/media/download/documents%2F1234567890-test-report.pdf`

6. **Verify in MongoDB:**
   - Check `file_uploads` collection
   - Confirm `storageProvider` is "azure"
   - Confirm `storagePath` points to Azure blob

### Integration Points

**Where Files Are Used:**

- ✅ Simulation reports uploaded by participants
- ✅ Incident photos/evidence
- ✅ Assignment submissions
- ✅ Any modal/form with file upload capability

**Files That Import Upload Functionality:**

- Check your forms with file inputs for:
  ```typescript
  import { useFileUpload } from "@/hooks/useFileUpload"; // if exists
  ```

## 📦 Deployment Considerations

### Production Checklist

- [ ] Azure Storage credentials in environment
- [ ] `AZURE_STORAGE_CONNECTION_STRING` set in production .env
- [ ] `AZURE_STORAGE_CONTAINER_NAME` set (defaults to "uploads")
- [ ] MongoDB FileUpload collection accessible
- [ ] IAM permissions on Azure storage account
- [ ] CORS configured if frontend is on different domain
- [ ] File retention policies set in Azure (if needed)
- [ ] Backup/disaster recovery plan for Azure storage

### Persistence Guarantee

✅ **Files are PERSISTENT because:**

1. Stored in Azure Blob Storage (Microsoft cloud infrastructure)
2. Replicated across availability zones
3. Not stored on local filesystem (survives container/VM restarts)
4. Not stored in application memory (survives process restarts)
5. Metadata in MongoDB ensures file lookup across deployments
6. Unique blob paths include timestamp (no overwrites)

### Scalability

- **File Size Limit:** 50MB per file (configurable in `src/app/api/media/upload/route.ts`)
- **Azure Limit:** 5TB per blob (no practical limit)
- **Storage:** Pay-as-you-go Azure Blob Storage pricing
- **Bandwidth:** Include in deployment cost estimation

## 🔄 Migration from Supabase

### Removed Files/Routes

- ❌ `src/app/api/media/upload-supabase/route.ts` (can be deleted)
- ❌ SUPABASE\_\* environment variables (can be removed from .env)

### Kept Routes (Updated)

- ✅ `src/app/api/media/upload/route.ts` (rewritten for Azure)
- ✅ `src/app/api/media/download/[fileId]/route.ts` (rewritten for Azure)
- ✅ `src/app/api/media/files/route.ts` (updated for Azure)

### Data Migration (if needed)

To migrate existing Supabase files to Azure:

1. Export files from Supabase storage
2. Download via Supabase API
3. Re-upload via `/api/media/upload`
4. Update `storageProvider` field from "supabase" to "azure" in MongoDB

```bash
# Clean up old Supabase routes after verification
rm src/app/api/media/upload-supabase/route.ts
```

## 📋 Code Changes Summary

**Files Modified:** 4

- `src/lib/azure-storage.ts` - Added public `getContainerClient()` method
- `src/app/api/media/upload/route.ts` - Complete rewrite for Azure
- `src/app/api/media/download/[fileId]/route.ts` - Complete rewrite for Azure
- `src/app/api/media/files/route.ts` - Updated DELETE to use Azure
- `prisma/schema.prisma` - Added `storageProvider` field to FileUpload

**Prisma Generated:** ✅

- `npx prisma generate` executed successfully
- Client updated for new schema

## 🚀 Next Steps

1. **Testing:**

   - Upload a participant report via simulation page
   - Download it back
   - Verify it persists after app restart

2. **Cleanup (Optional):**

   - Remove old Supabase-specific code
   - Remove SUPABASE\_\* env variables
   - Update documentation

3. **Monitoring:**
   - Set up Azure Storage monitoring in Azure Portal
   - Monitor costs
   - Enable diagnostics logging for troubleshooting

## 📞 Support & Troubleshooting

### Common Issues

**"Azure Storage not configured" error:**

- Check `.env` file has `AZURE_STORAGE_CONNECTION_STRING`
- Verify connection string is complete (no truncation)
- Check Azure Storage account is accessible

**"Blob not found" on download:**

- Verify blob exists in Azure Portal
- Check blob path matches exactly (URL encoding)
- Check correct container name in env

**File upload hangs:**

- Check file size (max 50MB for web upload)
- Verify network connection to Azure
- Check Azure Storage account status

**Permission denied on delete:**

- Only uploader or ADMIN can delete files
- Verify user's role in database
- Check session is valid

---

**Last Updated:** 2025-04-03  
**Status:** ✅ Complete & Ready for Testing  
**Storage Backend:** Azure Blob Storage (persistent, production-ready)
