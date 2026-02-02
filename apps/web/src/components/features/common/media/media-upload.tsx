import { useRef } from "react";
import { toast } from "sonner";
import { useFilePicker } from "use-file-picker";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useAdminUpload } from "@/hooks/use-upload";
import { cn } from "@/lib/utils";

type MediaType = "image" | "video";
type AspectRatio = "og" | "cover" | "mobile";

interface MediaUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  className?: string;
  mediaType?: MediaType;
  aspectRatio?: AspectRatio;
  label?: string;
  extraTools?: React.ReactNode;
}

const aspectRatioConfig: Record<
  AspectRatio,
  { ratio: string; width: string; height: string }
> = {
  og: { ratio: "1.91 / 1", width: "w-full", height: "h-auto" },
  cover: { ratio: "16 / 9", width: "w-full", height: "h-auto" },
  mobile: { ratio: "9 / 16", width: "w-32", height: "h-auto" },
};

const acceptTypes: Record<MediaType, string> = {
  image: "image/jpeg,image/png,image/webp,image/gif,image/svg+xml",
  video: "video/mp4,video/webm",
};

const isValidMediaUrl = (url: string, mediaType: MediaType): boolean => {
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
};

export function MediaUpload({
  value,
  onChange,
  disabled = false,
  className,
  mediaType = "image",
  aspectRatio = "cover",
  label,
  extraTools,
}: MediaUploadProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { upload, isUploading } = useAdminUpload({
    onSuccess: (result) => onChange(result.url),
    onError: (error) => {
      toast.error(error.message || "Upload failed");
    },
  });

  const { openFilePicker, filesContent, clear } = useFilePicker({
    accept: acceptTypes[mediaType],
    multiple: false,
    readAs: "DataURL",
    onFilesSuccessfullySelected: async ({ plainFiles }) => {
      const file = plainFiles[0];
      if (file) {
        await upload(file);
      }
    },
  });

  const handleUploadClick = () => {
    if (!(disabled || isUploading)) {
      openFilePicker();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value.trim() || null;
    onChange(url);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    clear();
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value) {
      window.open(value, "_blank");
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();

      for (const item of clipboardItems) {
        // 检查是否有图片类型
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
          await upload(file);
          return;
        }

        // 检查是否有文本类型（URL）
        if (item.types.includes("text/plain")) {
          const blob = await item.getType("text/plain");
          const text = await blob.text();
          if (text.trim() && isValidMediaUrl(text.trim(), mediaType)) {
            onChange(text.trim());
            return;
          }
        }
      }

      toast.error("Clipboard does not contain a valid image or URL.");
    } catch (_error) {
      // 回退到 readText（兼容性）
      try {
        const text = await navigator.clipboard.readText();
        if (text.trim() && isValidMediaUrl(text.trim(), mediaType)) {
          onChange(text.trim());
        } else {
          toast.error("Invalid media URL or no image in clipboard.");
        }
      } catch {
        toast.error(
          "Failed to read from clipboard. Please allow clipboard access."
        );
      }
    }
  };

  const media = value || filesContent[0]?.content;
  const config = aspectRatioConfig[aspectRatio];
  const isVideo = mediaType === "video";

  const renderPreview = () => {
    if (!media) return null;

    if (isVideo) {
      return (
        <video
          className="size-full object-cover"
          controls
          muted
          ref={videoRef}
          src={media}
        />
      );
    }

    return <img alt="Preview" className="size-full object-cover" src={media} />;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-1.5">
        {label && (
          <span className="font-medium text-muted-foreground text-xs">
            {label}
          </span>
        )}
        <InputGroup>
          <InputGroupInput
            disabled={disabled || isUploading}
            onChange={handleInputChange}
            placeholder={`Enter ${mediaType} URL...`}
            value={value || ""}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              disabled={disabled || isUploading}
              onClick={handlePaste}
              variant="secondary"
            >
              Paste
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        {extraTools}
      </div>

      <div className={cn("group relative", config.width)}>
        <button
          className={cn(
            "relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-input border-dashed bg-muted/30 transition-colors",
            "hover:border-primary hover:bg-muted/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            config.width
          )}
          disabled={disabled || isUploading}
          onClick={handleUploadClick}
          style={{ aspectRatio: config.ratio }}
          type="button"
        >
          {media ? (
            renderPreview()
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
              <span
                className={cn(
                  "size-8",
                  isVideo ? "i-hugeicons-video-02" : "i-hugeicons-image-upload"
                )}
              />
              <span className="text-xs">
                {isVideo ? "Upload video" : "Upload image"}
              </span>
            </div>
          )}
        </button>
        <div
          className={cn(
            "-z-10 absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg bg-black/50 transition-opacity",
            isUploading ? "z-10 opacity-100" : "opacity-0",
            !(disabled || isUploading) &&
              media &&
              "group-hover:z-10 group-hover:opacity-100"
          )}
        >
          {isUploading ? (
            <Spinner className="size-8 text-white" />
          ) : (
            <div className="flex gap-2">
              <Button
                className="border-background/30 hover:border-background/70"
                onClick={(e) => {
                  e.stopPropagation();
                  openFilePicker();
                }}
                size="icon"
                type="button"
                variant="default"
              >
                <span className="i-hugeicons-file-upload size-4" />
              </Button>
              <Button
                className="border-background/30 hover:border-background/70"
                onClick={handlePreview}
                size="icon"
                type="button"
                variant="default"
              >
                <span className="i-hugeicons-chat-preview-01 size-4" />
              </Button>
            </div>
          )}
        </div>

        {media && !disabled && !isUploading && (
          <Button
            className="-top-1 -right-1 absolute z-20 size-5 rounded-full p-0.5"
            onClick={handleRemove}
            size="icon-xs"
            type="button"
            variant="destructive"
          >
            <span className="i-hugeicons-cancel-01 size-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
