import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterRecentSearchesProps {
  searches: string[];
  onSelect: (query: string) => void;
  onRemove: (query: string) => void;
  className?: string;
}

export function FilterRecentSearches({
  searches,
  onSelect,
  onRemove,
  className,
}: FilterRecentSearchesProps) {
  if (!searches.length) return null;

  return (
    <div className={cn("mb-4", className)}>
      <h3 className="sr-only mb-2 font-medium text-muted-foreground text-xs">
        Recent Searches
      </h3>
      <div className="flex flex-wrap gap-2">
        {searches.map((search) => (
          <Button
            className="gap-1 rounded-full"
            key={search}
            onClick={() => onSelect(search)}
            size="xs"
            type="button"
            variant="outline"
          >
            <span className="truncate">{search}</span>
            <span
              className="i-hugeicons-cancel-01 cursor-pointer text-muted-foreground text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(search);
              }}
            />
          </Button>
        ))}
      </div>
    </div>
  );
}
