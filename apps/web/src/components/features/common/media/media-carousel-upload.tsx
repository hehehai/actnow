import type * as React from "react";
import { useState } from "react";
import { confirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { MediaUpload } from "./media-upload";

type MediaType = "image" | "video";
type AspectRatio = "og" | "cover" | "mobile";
type UploadType = "user" | "admin" | "public";

interface MediaCarouselUploadProps {
  value?: Array<string | null>;
  onChange: (next: Array<string | null>) => void;
  disabled?: boolean;
  className?: string;
  label?: React.ReactNode;
  mediaType?: MediaType;
  aspectRatio?: AspectRatio;
  uploadType?: UploadType;
  maxItems?: number;
  addLabel?: string;
}

function MediaCarouselHeader({
  label,
  status,
  disabled,
  canAdd,
  onAdd,
  addLabel,
}: {
  label?: React.ReactNode;
  status?: React.ReactNode;
  disabled: boolean;
  canAdd: boolean;
  onAdd: () => void;
  addLabel?: string;
}) {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } =
    useCarousel();
  const labelContent =
    typeof label === "string" ? (
      <span className="text-pretty font-medium text-foreground text-sm">
        {label}
      </span>
    ) : (
      label
    );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {labelContent}
        {status}
      </div>
      <div className="flex items-center gap-2">
        <Button
          aria-label="Previous media"
          disabled={disabled || !canScrollPrev}
          onClick={scrollPrev}
          size="icon-sm"
          type="button"
          variant="outline"
        >
          <span className="i-hugeicons-arrow-left-01 size-4" />
        </Button>
        <Button
          aria-label="Next media"
          disabled={disabled || !canScrollNext}
          onClick={scrollNext}
          size="icon-sm"
          type="button"
          variant="outline"
        >
          <span className="i-hugeicons-arrow-right-01 size-4" />
        </Button>
        <Button
          disabled={!canAdd}
          onClick={onAdd}
          size="sm"
          type="button"
          variant="default"
        >
          <span className="i-hugeicons-add-01 size-4" />
          <span>{addLabel ?? "Add"}</span>
        </Button>
      </div>
    </div>
  );
}

function MediaCarouselRemoveButton({
  disabled,
  onConfirm,
}: {
  disabled: boolean;
  onConfirm: () => void;
}) {
  return (
    <Button
      aria-label="Remove media item"
      disabled={disabled}
      onClick={() => {
        confirmDialog.openWithPayload({
          title: "Remove this media item?",
          description: "This will remove the item from the list.",
          confirmText: "Remove",
          variant: "destructive",
          onConfirm,
        });
      }}
      size="icon"
      type="button"
      variant="outline"
    >
      <span className="i-hugeicons-delete-03 size-3.5" />
    </Button>
  );
}

function MediaCarouselEmptyState({
  canAdd,
  onAdd,
}: {
  canAdd: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/30 p-6 text-center">
      <div className="text-pretty text-muted-foreground text-sm">
        No media yet. Add one to get started.
      </div>
      <Button
        disabled={!canAdd}
        onClick={onAdd}
        size="sm"
        type="button"
        variant="outline"
      >
        <span className="i-hugeicons-add-01 size-4" />
        <span>Add media</span>
      </Button>
    </div>
  );
}

export function MediaCarouselUpload({
  value,
  onChange,
  disabled = false,
  className,
  label,
  mediaType = "image",
  aspectRatio = "cover",
  uploadType = "user",
  maxItems,
  addLabel,
}: MediaCarouselUploadProps) {
  const items = value ?? [];
  const [api, setApi] = useState<CarouselApi | null>(null);
  const canAdd =
    !disabled && (maxItems === undefined || items.length < maxItems);

  const handleAdd = () => {
    if (!canAdd) return;
    const nextIndex = items.length;
    onChange([...items, null]);
    if (api) {
      requestAnimationFrame(() => api.scrollTo(nextIndex));
    }
  };

  const handleItemChange = (index: number, nextValue: string | null) => {
    const next = [...items];
    next[index] = nextValue;
    onChange(next);
  };

  const handleRemoveItem = (index: number) => {
    const next = items.filter((_, itemIndex) => itemIndex !== index);
    onChange(next);
    if (api && next.length > 0) {
      const nextIndex = Math.min(index, next.length - 1);
      requestAnimationFrame(() => api.scrollTo(nextIndex));
    }
  };

  return (
    <Carousel
      className={cn("space-y-2", className)}
      opts={{ align: "start" }}
      setApi={setApi}
    >
      <MediaCarouselHeader
        addLabel={addLabel}
        canAdd={canAdd}
        disabled={disabled}
        label={label}
        onAdd={handleAdd}
        status={
          items.length > 0 ? (
            <span className="text-muted-foreground text-xs tabular-nums">
              {api?.selectedScrollSnap() !== undefined
                ? api.selectedScrollSnap() + 1
                : 1}{" "}
              / {items.length}
            </span>
          ) : null
        }
      />
      {items.length > 0 ? (
        <CarouselContent>
          {items.map((media, index) => (
            <CarouselItem key={index}>
              <div className="space-y-3">
                <MediaUpload
                  aspectRatio={aspectRatio}
                  disabled={disabled}
                  extraTools={
                    <MediaCarouselRemoveButton
                      disabled={disabled}
                      onConfirm={() => handleRemoveItem(index)}
                    />
                  }
                  mediaType={mediaType}
                  onChange={(nextValue) => handleItemChange(index, nextValue)}
                  uploadType={uploadType}
                  value={media}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      ) : (
        <MediaCarouselEmptyState canAdd={canAdd} onAdd={handleAdd} />
      )}
    </Carousel>
  );
}
