import type React from "react";
import { useAdminUpload, usePublicUpload, useUpload } from "@/hooks/use-upload";

export type MediaType = "image" | "video";
export type AspectRatio = "og" | "cover" | "mobile";
export type UploadType = "user" | "admin" | "public";

export interface MediaUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  className?: string;
  mediaType?: MediaType;
  aspectRatio?: AspectRatio;
  label?: string;
  uploadType?: UploadType;
  extraTools?: React.ReactNode;
}

export const aspectRatioConfig: Record<
  AspectRatio,
  { ratio: string; width: string }
> = {
  og: { ratio: "1.91 / 1", width: "w-full" },
  cover: { ratio: "16 / 9", width: "w-full" },
  mobile: { ratio: "9 / 16", width: "w-32" },
};

export const acceptTypes: Record<MediaType, string> = {
  image: "image/jpeg,image/png,image/webp,image/gif,image/svg+xml",
  video: "video/mp4,video/webm",
};

export function getUploadHook(uploadType: UploadType) {
  switch (uploadType) {
    case "public":
      return usePublicUpload;
    case "admin":
      return useAdminUpload;
    default:
      return useUpload;
  }
}

function isValidMediaUrl(url: string, mediaType: MediaType): boolean {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();

    if (mediaType === "image") {
      return (
        pathname.endsWith(".jpg") ||
        pathname.endsWith(".jpeg") ||
        pathname.endsWith(".png") ||
        pathname.endsWith(".webp") ||
        pathname.endsWith(".gif") ||
        pathname.endsWith(".svg")
      );
    }

    return pathname.endsWith(".mp4") || pathname.endsWith(".webm");
  } catch {
    return false;
  }
}

async function readClipboardTextUrl(mediaType: MediaType) {
  const text = await navigator.clipboard.readText();
  if (text.trim() && isValidMediaUrl(text.trim(), mediaType)) {
    return text.trim();
  }
  return null;
}

export async function readClipboardMedia(mediaType: MediaType): Promise<
  | {
      file: File;
      url: null;
    }
  | {
      file: null;
      url: string;
    }
  | null
> {
  try {
    const clipboardItems = await navigator.clipboard.read();

    for (const item of clipboardItems) {
      const imageType = item.types.find((type) => type.startsWith("image/"));
      if (imageType && mediaType === "image") {
        const blob = await item.getType(imageType);
        const file = new File(
          [blob],
          `pasted-image.${imageType.split("/")[1]}`,
          {
            type: imageType,
          }
        );
        return { file, url: null };
      }

      if (item.types.includes("text/plain")) {
        const blob = await item.getType("text/plain");
        const text = await blob.text();
        if (text.trim() && isValidMediaUrl(text.trim(), mediaType)) {
          return { file: null, url: text.trim() };
        }
      }
    }

    return null;
  } catch {
    try {
      const url = await readClipboardTextUrl(mediaType);
      return url ? { file: null, url } : null;
    } catch {
      return null;
    }
  }
}
