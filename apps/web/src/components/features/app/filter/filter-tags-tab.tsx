import { Badge } from "src/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface FilterTag {
  id: string;
  name: string;
  value: string;
  type: string;
  description: string | null;
  tipMedia?: string | null;
}

interface FilterTagsTabProps {
  tags: FilterTag[];
  type: "platform" | "model" | "style";
  isLoading?: boolean;
  onTagClick: (tagId: string) => void;
  onTagHover?: (
    tag: Pick<FilterTag, "id" | "name" | "tipMedia"> | null
  ) => void;
  className?: string;
}

export function FilterTagsTab({
  tags,
  isLoading,
  onTagClick,
  onTagHover,
  className,
}: FilterTagsTabProps) {
  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-2 gap-3", className)}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton className="h-12 rounded-xl" key={index} />
        ))}
      </div>
    );
  }

  if (!tags.length) {
    return (
      <p className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
        No tags available.
      </p>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag) => (
        <Badge
          className="cursor-pointer px-3 py-1.5 transition-colors hover:bg-primary hover:text-primary-foreground"
          key={tag.id}
          onClick={() => onTagClick(tag.value)}
          onMouseEnter={() =>
            onTagHover?.({
              id: tag.id,
              name: tag.name,
              tipMedia: tag.tipMedia ?? null,
            })
          }
          onMouseLeave={() => onTagHover?.(null)}
          title={tag.description ?? tag.name ?? undefined}
          variant="outline"
        >
          {tag.name}
        </Badge>
      ))}
    </div>
  );
}
