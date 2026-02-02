import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFileDownload } from "@/hooks/use-file-download";
import { imagePreviewDialog } from "@/stores/handlers";

const filenameSanitizeRegex = /[^a-z0-9]+/g;
const filenameExtensionRegex = /(\.[a-z0-9]+)$/i;

export function ImagePreviewDialog() {
  return (
    <Dialog handle={imagePreviewDialog}>
      {({ payload }) => {
        if (!payload) return null;
        const images = payload.images ?? (payload.src ? [payload.src] : []);
        if (images.length === 0) return null;
        const initialIndex = Math.min(
          Math.max(payload.index ?? 0, 0),
          images.length - 1
        );

        return (
          <ImagePreviewContent
            images={images}
            initialIndex={initialIndex}
            key={`${images[initialIndex]}-${initialIndex}`}
            payload={payload}
          />
        );
      }}
    </Dialog>
  );
}

function ImagePreviewContent({
  images,
  initialIndex,
  payload,
}: {
  images: string[];
  initialIndex: number;
  payload: { alt?: string; title?: string; filename?: string };
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const contentRef = useRef<HTMLDivElement>(null);
  const { download } = useFileDownload();
  const src = images[currentIndex] ?? images[0];
  const title = payload.title ?? "Image preview";
  const alt = payload.alt ?? "Preview image";
  const filenameBase =
    payload.filename ??
    `${title.toLowerCase().replace(filenameSanitizeRegex, "-")}.jpg`;
  const filename =
    images.length > 1
      ? filenameBase.replace(filenameExtensionRegex, `-${currentIndex + 1}$1`)
      : filenameBase;

  const handleFullscreen = useCallback(() => {
    if (typeof document === "undefined") return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {
        // ignore fullscreen exit errors
      });
      return;
    }
    contentRef.current?.requestFullscreen();
  }, []);

  return (
    <DialogContent className="max-w-5xl sm:max-w-5xl" showCloseButton={false}>
      <DialogHeader className="flex flex-row items-center justify-between">
        <DialogTitle>{title}</DialogTitle>
        <div className="flex items-center gap-1">
          {images.length > 1 && (
            <>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      aria-label="Previous image"
                      disabled={currentIndex === 0}
                      onClick={() =>
                        setCurrentIndex((prev) => Math.max(prev - 1, 0))
                      }
                      size="icon-xs"
                      variant="ghost"
                    >
                      <span className="i-hugeicons-arrow-left-01 size-3.5" />
                    </Button>
                  }
                />
                <TooltipContent>Previous</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      aria-label="Next image"
                      disabled={currentIndex === images.length - 1}
                      onClick={() =>
                        setCurrentIndex((prev) =>
                          Math.min(prev + 1, images.length - 1)
                        )
                      }
                      size="icon-xs"
                      variant="ghost"
                    >
                      <span className="i-hugeicons-arrow-right-01 size-3.5" />
                    </Button>
                  }
                />
                <TooltipContent>Next</TooltipContent>
              </Tooltip>
            </>
          )}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label="Download image"
                  onClick={() => download({ url: src, filename })}
                  size="icon-xs"
                  variant="ghost"
                >
                  <span className="i-hugeicons-download-01 size-3.5" />
                </Button>
              }
            />
            <TooltipContent>Download</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label="Toggle fullscreen"
                  onClick={handleFullscreen}
                  size="icon-xs"
                  variant="ghost"
                >
                  <span className="i-hugeicons-full-screen size-3.5" />
                </Button>
              }
            />
            <TooltipContent>Toggle fullscreen</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <DialogClose
                  render={
                    <Button
                      aria-label="Close dialog"
                      size="icon-xs"
                      variant="ghost"
                    />
                  }
                >
                  <span className="i-hugeicons-cancel-01 size-4" />
                </DialogClose>
              }
            />
            <TooltipContent>Close</TooltipContent>
          </Tooltip>
        </div>
      </DialogHeader>
      <div
        className="flex max-h-[80vh] items-center justify-center overflow-hidden rounded-xl"
        ref={contentRef}
      >
        <img alt={alt} className="max-h-[80vh] w-auto" src={src} />
      </div>
    </DialogContent>
  );
}
