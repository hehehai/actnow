import { Button } from "@/components/ui/button";

export type SortDirection = "asc" | "desc" | null;

interface SortableColumnHeaderProps {
  title: string;
  sortDirection: SortDirection;
  onSort: () => void;
}

export function SortableColumnHeader({
  title,
  sortDirection,
  onSort,
}: SortableColumnHeaderProps) {
  return (
    <Button className="-ml-3 h-8" onClick={onSort} variant="ghost">
      {title}
      {sortDirection === "asc" && (
        <span className="i-hugeicons-sorting-02 ml-2 size-4" />
      )}
      {sortDirection === "desc" && (
        <span className="i-hugeicons-sorting-01 ml-2 size-4" />
      )}
      {sortDirection === null && (
        <span className="i-hugeicons-sorting-05 ml-2 size-4" />
      )}
    </Button>
  );
}
