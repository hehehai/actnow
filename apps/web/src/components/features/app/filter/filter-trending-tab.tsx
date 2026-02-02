import { Badge } from "src/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClientOutputs, TrendingOutput } from "@/lib/orpc-types";
import { cn } from "@/lib/utils";
import { PopularUsersRow } from "./popular-users-row";

type TrendingData = TrendingOutput;
type TrendingTag = TrendingData["tags"][number];

interface FilterTrendingTabProps {
  tags?: TrendingTag[];
  users?: ClientOutputs["app"]["user"]["popular"];
  onUserClick: (userId: string) => void;
  onTagClick: (tagSlug: string) => void;
  className?: string;
}

export function FilterTrendingTab({
  tags,
  users,
  onUserClick,
  onTagClick,
  className,
}: FilterTrendingTabProps) {
  if (!(tags && users)) {
    return (
      <div className={cn("space-y-6", className)}>
        <TrendingSkeleton />
      </div>
    );
  }

  const tagsByType = tags.reduce<Record<string, TrendingTag[]>>((acc, tag) => {
    acc[tag.type] = [...(acc[tag.type] ?? []), tag];
    return acc;
  }, {});

  return (
    <div className={cn("space-y-6", className)}>
      <section>
        <h3 className="mb-3 text-balance text-muted-foreground text-sm">
          Popular users
        </h3>
        <PopularUsersRow onUserClick={onUserClick} users={users} />
      </section>

      {Object.entries(tagsByType).map(([type, tags]) => (
        <section key={type}>
          <h3 className="mb-3 text-capitalize text-muted-foreground text-sm">
            {type.at(0)?.toUpperCase()}
            {type.slice(1)} tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Button
                className="rounded-full pr-1"
                key={tag.id}
                onClick={() => onTagClick(tag.value)}
                size="sm"
                type="button"
                variant="outline"
              >
                {tag.name}
                <Badge className="ml-1" variant="secondary">
                  {tag.usageCount}
                </Badge>
              </Button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function TrendingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton className="h-10 w-full rounded-2xl" key={index} />
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton className="h-8 w-24 rounded-full" key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
