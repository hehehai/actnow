import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface PostPromptBlockProps {
  value?: string | null;
  emptyText?: string;
}

export function PostPromptBlock({
  value,
  emptyText = "No prompt",
}: PostPromptBlockProps) {
  if (!value) {
    return <p className="text-muted-foreground text-sm">{emptyText}</p>;
  }

  return (
    <div className="space-y-1 rounded-xl border bg-muted/30 px-3 py-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs">
          {value.length} characters
        </span>
        <Button
          aria-label="Copy prompt"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              toast.success("Prompt copied");
            } catch {
              toast.error("Failed to copy prompt");
            }
          }}
          size="icon-xs"
          type="button"
          variant="ghost"
        >
          <span className="i-hugeicons-copy-01 size-3.5" />
        </Button>
      </div>
      <p className="whitespace-pre-line text-pretty text-sm">{value}</p>
    </div>
  );
}
