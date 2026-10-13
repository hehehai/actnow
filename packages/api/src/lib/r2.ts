import { getBinding, getEnvValue } from "@actnow/common/runtime-env";
import { format } from "date-fns";
import slug from "slug";

function getR2Bucket() {
  return getBinding<R2Bucket>("R2");
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Generate a safe, unique filename with date prefix
 */
function generateSafeFilename(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf(".");
  const hasExtension = lastDotIndex > 0;
  const name = hasExtension ? fileName.slice(0, lastDotIndex) : fileName;
  const ext = hasExtension ? fileName.slice(lastDotIndex) : "";
  return `${format(new Date(), "MM-dd")}/${Date.now()}_${slug(name)}${ext}`;
}

/**
 * Execute R2 operation with consistent logging and error handling
 */
async function withR2Operation<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  console.info(`[R2] ${operation}`);
  try {
    return await fn();
  } catch (err) {
    console.error(`[R2] ${operation} failed`, err);
    throw err;
  }
}

// ============================================================================
// Public API
// ============================================================================

export async function getR2File(fileName: string): Promise<R2ObjectBody> {
  return withR2Operation("Downloading file", async () => {
    const file = await getR2Bucket().get(fileName);
    if (!file) {
      throw new Error("File not found");
    }
    return file;
  });
}

export async function deleteR2File(fileName: string): Promise<void> {
  return withR2Operation("Deleting file", async () => {
    await getR2Bucket().delete(fileName);
  });
}

export async function uploadR2File(
  file: File | Blob,
  fileName: string
): Promise<{ type: string; filename: string; url: string }> {
  return withR2Operation("Uploading file", async () => {
    const safeFilename = generateSafeFilename(fileName);
    await getR2Bucket().put(safeFilename, file.stream(), {
      httpMetadata: { contentType: file.type },
    });

    console.info(`[R2] File uploaded: ${safeFilename}`);
    return {
      type: file.type,
      filename: safeFilename,
      url: `${getEnvValue("VITE_CLOUD_FLARE_R2_URL")}/${safeFilename}`,
    };
  });
}
