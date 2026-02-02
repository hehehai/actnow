import { format } from "date-fns";
import slug from "slug";

// ============================================================================
// Configuration
// ============================================================================

const R2_CONFIG = {
  bucket: process.env.CLOUD_FLARE_S3_UPLOAD_BUCKET!,
  accountId: process.env.CLOUD_FLARE_R2_ACCOUNT_ID!,
  accessKeyId: process.env.CLOUD_FLARE_S3_UPLOAD_KEY!,
  secretAccessKey: process.env.CLOUD_FLARE_S3_UPLOAD_SECRET!,
} as const;

// Lazy-loaded S3 client to avoid loading AWS SDK at module initialization
let r2Client: import("@aws-sdk/client-s3").S3Client | null = null;

async function getR2Client() {
  if (!r2Client) {
    const { S3Client } = await import("@aws-sdk/client-s3");
    r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_CONFIG.accessKeyId,
        secretAccessKey: R2_CONFIG.secretAccessKey,
      },
    });
  }
  return r2Client;
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

export async function getUploadSignedUrl(
  fileName: string,
  expiresIn = 60
): Promise<{ uploadUrl: string; filename: string }> {
  return withR2Operation("Generating upload URL", async () => {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
    const client = await getR2Client();
    const safeFilename = generateSafeFilename(fileName);
    const uploadUrl = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: R2_CONFIG.bucket,
        Key: safeFilename,
      }),
      { expiresIn }
    );

    console.info(`[R2] Generated upload URL for: ${safeFilename}`);
    return { uploadUrl, filename: safeFilename };
  });
}

export async function getR2File(fileName: string) {
  return withR2Operation("Downloading file", async () => {
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await getR2Client();
    const file = await client.send(
      new GetObjectCommand({
        Bucket: R2_CONFIG.bucket,
        Key: fileName,
      })
    );
    if (!file) {
      throw new Error("File not found");
    }
    return file;
  });
}

export async function getDownloadSignedUrl(
  fileName: string,
  expiresIn = 3600
): Promise<string> {
  return withR2Operation("Generating download URL", async () => {
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
    const client = await getR2Client();
    const url = await getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: R2_CONFIG.bucket,
        Key: fileName,
      }),
      { expiresIn }
    );
    return url;
  });
}

export async function deleteR2File(fileName: string): Promise<void> {
  return withR2Operation("Deleting file", async () => {
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await getR2Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: R2_CONFIG.bucket,
        Key: fileName,
      })
    );
  });
}

export async function uploadR2File(
  file: File | Blob,
  fileName: string
): Promise<{ type: string; filename: string; url: string }> {
  return withR2Operation("Uploading file", async () => {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await getR2Client();
    const safeFilename = generateSafeFilename(fileName);
    const buffer = Buffer.from(await file.arrayBuffer());

    await client.send(
      new PutObjectCommand({
        Bucket: R2_CONFIG.bucket,
        Key: safeFilename,
        Body: buffer,
        ContentType: file.type,
      })
    );

    console.info(`[R2] File uploaded: ${safeFilename}`);
    return {
      type: file.type,
      filename: safeFilename,
      url: `${process.env.VITE_CLOUD_FLARE_R2_URL}/${safeFilename}`,
    };
  });
}
