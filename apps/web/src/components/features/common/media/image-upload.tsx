import { toast } from "sonner";
import { useFilePicker } from "use-file-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAdminUpload, usePublicUpload, useUpload } from "@/hooks/use-upload";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  className?: string;
  variant?: "avatar" | "square";
  size?: "sm" | "default" | "lg";
  uploadType?: "user" | "admin" | "public";
  placeholder?: React.ReactNode;
  fallback?: string;
  right?: React.ReactNode;
}

const sizeMap = {
  sm: "size-12",
  default: "size-16",
  lg: "size-20",
};

const iconSizeMap = {
  sm: "size-4",
  default: "size-6",
  lg: "size-8",
};

export function ImageUpload({
  value,
  onChange,
  disabled = false,
  className,
  variant = "avatar",
  size = "default",
  uploadType = "admin",
  placeholder,
  fallback = "?",
  right,
}: ImageUploadProps) {
  const getUploadHook = () => {
    switch (uploadType) {
      case "public":
        return usePublicUpload;
      case "user":
        return useUpload;
      default:
        return useAdminUpload;
    }
  };
  const useUploadHook = getUploadHook();
  const { upload, isUploading } = useUploadHook({
    onSuccess: (result) => onChange(result.url),
    onError: (error) => {
      toast.error(error.message || "Upload failed");
    },
  });

  const { openFilePicker, filesContent, clear } = useFilePicker({
    accept: "image/*",
    multiple: false,
    readAs: "DataURL",
    onFilesSuccessfullySelected: async ({ plainFiles }) => {
      const file = plainFiles[0];
      if (file) {
        await upload(file);
      }
    },
  });

  const handleClick = () => {
    if (!(disabled || isUploading)) {
      openFilePicker();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    clear();
  };

  const image = value || filesContent[0]?.content;
  const sizeClass = sizeMap[size];
  const iconSize = iconSizeMap[size];
  const isRound = variant === "avatar";

  const renderContent = () => {
    if (image) {
      if (isRound) {
        return (
          <Avatar className={sizeClass}>
            <AvatarImage src={image} />
            <AvatarFallback className="text-xl">{fallback}</AvatarFallback>
          </Avatar>
        );
      }
      return (
        <img
          alt="Uploaded"
          className={cn("object-cover", sizeClass, "rounded-lg")}
          src={image}
        />
      );
    }

    // Empty state
    if (placeholder) {
      return placeholder;
    }

    if (isRound) {
      return (
        <Avatar className={sizeClass}>
          <AvatarFallback className="text-xl">{fallback}</AvatarFallback>
        </Avatar>
      );
    }

    return (
      <span
        className={cn(
          "i-hugeicons-image-upload text-muted-foreground",
          iconSize
        )}
      />
    );
  };

  return (
    <div className={cn(className)}>
      <div className={cn("relative flex", sizeClass, className)}>
        <button
          className={cn(
            "group relative flex cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-50",
            sizeClass,
            !isRound &&
              "rounded-lg border border-input border-dashed bg-muted/30 transition-colors hover:border-primary hover:bg-muted/50"
          )}
          disabled={disabled || isUploading}
          onClick={handleClick}
          type="button"
        >
          {renderContent()}

          {/* Overlay */}
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity",
              isRound ? "rounded-full" : "rounded-lg",
              isUploading ? "opacity-100" : "opacity-0",
              !(disabled || isUploading) && "group-hover:opacity-100"
            )}
          >
            {isUploading ? (
              <Spinner className={cn("text-white", iconSize)} />
            ) : (
              <span
                className={cn("i-hugeicons-camera-02 text-white", iconSize)}
              />
            )}
          </div>

          {/* Remove button */}
        </button>
        {image && !disabled && !isUploading && (
          <Button
            className="absolute -top-1 -right-1 size-5 rounded-full p-0.5"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove(e);
            }}
            size="icon-xs"
            type="button"
            variant="destructive"
          >
            <span className="i-hugeicons-cancel-01 size-3.5" />
          </Button>
        )}
      </div>
      {right}
    </div>
  );
}
