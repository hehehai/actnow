import type { ColumnDef } from "@/lib/react-table";
import { SortableColumnHeader } from "@/components/shared/data-table";
import { createSelectionColumn } from "@/components/shared/data-table/column-helpers";
import { CreatorCell } from "@/components/shared/data-table/common-cells";
import { Badge } from "@/components/ui/badge";
import type { client } from "@/lib/orpc";
import { PostRowActions } from "./post-row-actions";

type PostListResponse = Awaited<ReturnType<typeof client.panel.post.list>>;
export type PostRow = PostListResponse["items"][number];
type SortField = "createdAt" | "publishedAt";

interface CreatePostColumnsOptions {
  sortBy?: SortField;
  sortOrder?: "asc" | "desc";
  onSortChange?: (sortBy: SortField, order: "asc" | "desc") => void;
}

export function createPostColumns(
  options?: CreatePostColumnsOptions
): ColumnDef<PostRow>[] {
  const sortable = (field: SortField, title: string) => ({
    header: () => (
      <SortableColumnHeader
        onSort={() =>
          options?.onSortChange?.(
            field,
            options?.sortBy === field && options?.sortOrder === "desc"
              ? "asc"
              : "desc"
          )
        }
        sortDirection={
          options?.sortBy === field ? (options?.sortOrder ?? null) : null
        }
        title={title}
      />
    ),
    cell: ({ row }: { row: { original: PostRow } }) => {
      const value = row.original.post[field];
      return (
        <span className="text-muted-foreground text-sm tabular-nums">
          {value ? new Date(value).toLocaleDateString() : "—"}
        </span>
      );
    },
  });

  return [
    createSelectionColumn<PostRow>(),
    {
      accessorKey: "title",
      header: "Content",
      size: 320,
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="line-clamp-1 font-medium">{row.original.post.title}</p>
          {row.original.post.description && (
            <p className="mt-0.5 line-clamp-1 text-muted-foreground text-xs">
              {row.original.post.description}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "author",
      header: "Created by",
      size: 140,
      cell: ({ row }) =>
        row.original.author ? (
          <CreatorCell
            createdById={row.original.author.id}
            creatorImage={row.original.author.image}
            creatorName={row.original.author.name}
          />
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        ),
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 100,
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.post.status === "published" ? "default" : "outline"
          }
        >
          {row.original.post.status === "published" ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      size: 110,
      ...sortable("createdAt", "Created"),
    },
    {
      accessorKey: "publishedAt",
      size: 120,
      ...sortable("publishedAt", "Published"),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      size: 180,
      enableSorting: false,
      cell: ({ row }) => <PostRowActions post={row.original} />,
    },
  ];
}
