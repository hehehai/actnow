import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterEmptyResultsProps {
  onCreatePost: () => void;
  className?: string;
}

export function FilterEmptyResults({
  onCreatePost,
  className,
}: FilterEmptyResultsProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed py-12 text-center",
        className
      )}
    >
      <span className="i-hugeicons-list-search text-4xl text-muted-foreground" />
      <p className="mt-3 font-medium">No results</p>
      <p className="text-muted-foreground text-sm">
        Nothing matched. Want to create a new post?
      </p>
      <Button className="mt-4" onClick={onCreatePost} variant="outline">
        Create Post
      </Button>
    </div>
  );
}
