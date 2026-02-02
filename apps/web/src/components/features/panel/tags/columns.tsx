import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { SortableColumnHeader } from "@/components/shared/data-table";
import { createSelectionColumn } from "@/components/shared/data-table/column-helpers";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ClientOutputs } from "@/lib/orpc-types";
import { TagRowActions } from "./tag-row-actions";

export type TagRow = ClientOutputs["panel"]["tag"]["list"]["items"][number];

const TAG_TYPE_LABELS: Record<TagRow["type"], string> = {
  platform: "Platform",
  model: "Model",
  style: "Style",
};

const TAG_TYPE_VARIANTS: Record<
  TagRow["type"],
  "default" | "secondary" | "outline"
> = {
  platform: "default",
  model: "secondary",
  style: "outline",
};

interface CreateTagColumnsOptions {
  sortBy?: "createdAt" | "name";
  sortOrder?: "asc" | "desc";
  onSortChange?: (sortBy: "createdAt" | "name", order: "asc" | "desc") => void;
}

export function createTagColumns(
  options?: CreateTagColumnsOptions
): ColumnDef<TagRow>[] {
  return [
    createSelectionColumn<TagRow>(),
    {
      accessorKey: "name",
      header: () => (
        <SortableColumnHeader
          onSort={() => {
            const next =
              options?.sortBy === "name" && options?.sortOrder === "asc"
                ? "desc"
                : "asc";
            options?.onSortChange?.("name", next);
          }}
          sortDirection={
            options?.sortBy === "name" ? (options?.sortOrder ?? null) : null
          }
          title="Name"
        />
      ),
      size: 200,
      cell: ({ row }) => {
        const { name, value, description, tipMedia } = row.original;
        return (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">{name}</span>
              {tipMedia && (
                <Tooltip>
                  <TooltipTrigger className="flex items-center">
                    <span className="i-hugeicons-image-02 size-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {tipMedia.includes("video") ? (
                      <video
                        className="max-h-40 max-w-60 rounded"
                        controls
                        src={tipMedia}
                      />
                    ) : (
                      <img
                        alt="Tip media"
                        className="max-h-40 max-w-60 rounded"
                        src={tipMedia}
                      />
                    )}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <span className="text-muted-foreground text-xs">{value}</span>
            {description && (
              <span className="mt-0.5 line-clamp-1 text-muted-foreground text-xs">
                {description}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      size: 100,
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <Badge variant={TAG_TYPE_VARIANTS[type]}>
            {TAG_TYPE_LABELS[type]}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <SortableColumnHeader
          onSort={() => {
            const next =
              options?.sortBy === "createdAt" && options?.sortOrder === "desc"
                ? "asc"
                : "desc";
            options?.onSortChange?.("createdAt", next);
          }}
          sortDirection={
            options?.sortBy === "createdAt"
              ? (options?.sortOrder ?? null)
              : null
          }
          title="Created"
        />
      ),
      size: 150,
      cell: ({ row }) => {
        const createdAt = row.original.createdAt;
        return (
          <span className="text-muted-foreground text-sm">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      size: 100,
      enableSorting: false,
      cell: ({ row }) => <TagRowActions tag={row.original} />,
    },
  ];
}
