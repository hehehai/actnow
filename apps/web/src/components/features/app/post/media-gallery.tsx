import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const isVideoUrl = (url: string) =>
  url.endsWith(".mp4") || url.endsWith(".webm");

interface MediaGalleryProps {
  media: string[];
  alt?: string;
}

export function MediaGallery({ media, alt = "Media" }: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedMedia = media[selectedIndex] ?? "";
  const isVideo = isVideoUrl(selectedMedia);

  if (media.length === 0) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-muted">
        <span className="text-muted-foreground">No media</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Focused Media */}
      <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-muted">
        {isVideo ? (
          <video
            className="rounded-xl object-contain"
            controls
            key={selectedMedia}
            src={selectedMedia}
          />
        ) : (
          <img
            alt={alt}
            className="block max-h-[96%] max-w-[96%] rounded-xl object-contain"
            src={selectedMedia}
          />
        )}
      </div>

      {/* Thumbnail Carousel */}
      {media.length > 1 && (
        <Carousel className="mx-10" opts={{ align: "start" }}>
          <CarouselContent className="p-2">
            {media.map((url, index) => {
              const isThumbVideo = isVideoUrl(url);
              return (
                <CarouselItem className="basis-1/4 lg:basis-1/5" key={url}>
                  <button
                    className={cn(
                      "block aspect-square w-full overflow-hidden rounded-lg transition-all",
                      index === selectedIndex
                        ? "ring-2 ring-primary/10 ring-offset-2"
                        : "opacity-70 hover:opacity-100"
                    )}
                    onClick={() => setSelectedIndex(index)}
                    type="button"
                  >
                    {isThumbVideo ? (
                      <div className="flex size-full items-center justify-center bg-muted">
                        <span className="i-hugeicons-play size-6 text-muted-foreground" />
                      </div>
                    ) : (
                      <img
                        alt={`${alt} thumbnail ${index + 1}`}
                        className="size-full object-cover"
                        loading="lazy"
                        src={url}
                      />
                    )}
                  </button>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="-left-10" />
          <CarouselNext className="-right-10" />
        </Carousel>
      )}
    </div>
  );
}
