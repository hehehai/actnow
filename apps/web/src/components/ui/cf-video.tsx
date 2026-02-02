// Cloudflare Video Transformations options
export interface CFVideoOptions {
  mode?: "video" | "frame";
  width?: number;
  height?: number;
  fit?: "contain" | "scale-down" | "cover";
  time?: string; // e.g. "5s"
  duration?: string; // e.g. "10s"
  audio?: boolean;
  format?: "jpg" | "png"; // frame mode only
}

// Video presets for common use cases
export const VIDEO_PRESETS = {
  // Video mode - web
  webRecord: { mode: "video", width: 1920, audio: false },
  webRecordThumb: { mode: "video", width: 640, audio: false },

  // Frame mode - extract thumbnail from video
  videoThumbnail: { mode: "frame", width: 800, time: "0s", format: "jpg" },
} as const satisfies Record<string, CFVideoOptions>;

export type VideoPreset = keyof typeof VIDEO_PRESETS;

const R2_BASE_URL = import.meta.env.VITE_CLOUD_FLARE_R2_URL as string;

/**
 * Generate Cloudflare Video Transformations URL
 * @param src - Original video URL
 * @param options - Transformation options
 * @returns Transformed video URL
 */
export function getCFVideoUrl(
  src: string | undefined | null,
  options: CFVideoOptions = {}
): string {
  if (!src) return "";

  // Only transform R2 videos
  if (!(R2_BASE_URL && src.startsWith(R2_BASE_URL))) {
    return src;
  }

  // Extract path from URL
  const path = src.replace(`${R2_BASE_URL}/`, "");

  // Build transformation params
  const params: string[] = [];

  if (options.mode) params.push(`mode=${options.mode}`);
  if (options.width) params.push(`width=${options.width}`);
  if (options.height) params.push(`height=${options.height}`);
  if (options.fit) params.push(`fit=${options.fit}`);
  if (options.time) params.push(`time=${options.time}`);
  if (options.duration) params.push(`duration=${options.duration}`);
  if (options.audio !== undefined) params.push(`audio=${options.audio}`);
  if (options.format) params.push(`format=${options.format}`);

  if (params.length === 0) return src;

  return `${R2_BASE_URL}/cdn-cgi/media/${params.join(",")}/${path}`;
}

/**
 * Get transformed video URL using preset
 * @param src - Original video URL
 * @param preset - Preset name
 * @returns Transformed video URL
 */
export function getCFVideoUrlByPreset(
  src: string | undefined | null,
  preset: VideoPreset
): string {
  return getCFVideoUrl(src, VIDEO_PRESETS[preset]);
}
