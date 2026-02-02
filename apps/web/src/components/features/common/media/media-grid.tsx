import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { imagePreviewDialog } from "@/stores/handlers";

const isVideoUrl = (url: string) =>
  url.endsWith(".mp4") || url.endsWith(".webm");

interface MediaGridProps {
  media: string[] | null | undefined;
  columns?: 2 | 3;
  className?: string;
  emptyText?: string;
  previewTitle?: string;
  previewAlt?: string;
  previewFilename?: string;
  /** @default "button" - click anywhere to preview, "hover" - show button on hover */
  previewMode?: "button" | "hover";
}

export function MediaGrid({
  media,
  columns = 3,
  className,
  emptyText = "No media",
  previewTitle = "Media preview",
  previewAlt = "Media",
  previewFilename,
  previewMode = "button",
}: MediaGridProps) {
  const items = media ?? [];
  const imageItems = items.filter((url) => !isVideoUrl(url));

  if (items.length === 0) {
    return <p className="text-muted-foreground text-sm">{emptyText}</p>;
  }

  const handlePreview = (index: number) => {
    const imageIndex = imageItems.indexOf(items[index]);
    if (imageIndex === -1) return;

    imagePreviewDialog.openWithPayload({
      images: imageItems,
      index: imageIndex,
      title: previewTitle,
      alt: previewAlt,
      filename: previewFilename,
    });
  };

  return (
    <div
      className={cn(
        "grid gap-3",
        columns === 2 ? "grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {items.map((url, index) => {
        if (isVideoUrl(url)) {
          return (
            <video
              className="h-40 w-full rounded-xl object-cover"
              controls
              key={url}
              src={url}
            />
          );
        }

        if (previewMode === "button") {
          return (
            <button
              className="block h-40 w-full cursor-pointer overflow-hidden rounded-xl border transition-opacity hover:opacity-80"
              key={url}
              onClick={() => handlePreview(index)}
              type="button"
            >
              <img
                alt={`${previewAlt} ${index + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
                src={url}
              />
            </button>
          );
        }

        return (
          <div
            className="group relative h-40 w-full overflow-hidden rounded-xl"
            key={url}
          >
            <img
              alt={`${previewAlt} ${index + 1}`}
              className="h-full w-full rounded-xl object-cover"
              loading="lazy"
              src={url}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100">
              <Button
                aria-label="Preview media"
                onClick={() => handlePreview(index)}
                size="icon-sm"
                type="button"
              >
                <span className="i-hugeicons-view size-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
