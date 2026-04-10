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
import { cn } from "@/lib/utils";
import {
  acceptTypes,
  aspectRatioConfig,
  getUploadHook,
  type MediaUploadProps,
  readClipboardMedia,
} from "./media-upload-helpers";

export function MediaUpload({
  value,
  onChange,
  disabled = false,
  className,
  mediaType = "image",
  aspectRatio = "cover",
  label,
  uploadType = "user",
  extraTools,
}: MediaUploadProps) {
  const useUploadHook = getUploadHook(uploadType);
  const { upload, isUploading } = useUploadHook({
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
    const clipboardMedia = await readClipboardMedia(mediaType);
    if (!clipboardMedia) {
      toast.error("Invalid media URL or no image in clipboard.");
      return;
    }

    if (clipboardMedia.file) {
      await upload(clipboardMedia.file);
      return;
    }

    if (clipboardMedia.url) {
      onChange(clipboardMedia.url);
    }
  };

  const media = value || filesContent[0]?.content;
  const config = aspectRatioConfig[aspectRatio];
  const isVideo = mediaType === "video";

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
            <MediaPreview isVideo={isVideo} media={media} />
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
            "absolute inset-0 -z-10 flex items-center justify-center overflow-hidden rounded-lg bg-black/50 transition-opacity",
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
                aria-label="Upload media"
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
                aria-label="Preview media"
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
            className="absolute -top-1 -right-1 z-20 size-5 rounded-full p-0.5"
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

function MediaPreview({ media, isVideo }: { media: string; isVideo: boolean }) {
  if (isVideo) {
    return (
      <video className="size-full object-cover" controls muted src={media} />
    );
  }

  return <img alt="Preview" className="size-full object-cover" src={media} />;
}
