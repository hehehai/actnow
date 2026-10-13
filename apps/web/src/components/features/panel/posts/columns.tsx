import type { ColumnDef } from "@/lib/react-table";
import { SortableColumnHeader } from "@/components/shared/data-table";
import { createSelectionColumn } from "@/components/shared/data-table/column-helpers";
import { CreatorCell } from "@/components/shared/data-table/common-cells";
import { Badge } from "@/components/ui/badge";
import type { client } from "@/lib/orpc";
import { PostRowActions } from "./post-row-actions";

type PostListResponse = Awaited<ReturnType<typeof client.panel.post.list>>;
export type PostRow = PostListResponse["items"][number];

interface CreatePostColumnsOptions {
  sortBy?: "createdAt" | "updatedAt" | "likes" | "visits";
  sortOrder?: "asc" | "desc";
  onSortChange?: (
    sortBy: "createdAt" | "updatedAt" | "likes" | "visits",
    order: "asc" | "desc"
  ) => void;
}

export function createPostColumns(
  options?: CreatePostColumnsOptions
): ColumnDef<PostRow>[] {
  return [
    createSelectionColumn<PostRow>(),
    {
      accessorKey: "comment",
      header: "Comment",
      size: 280,
      cell: ({ row }) => {
        const { comment } = row.original.post;
        return (
          <p className="line-clamp-1 text-pretty font-medium">
            {comment ?? "Untitled post"}
          </p>
        );
      },
    },
    {
      accessorKey: "author",
      header: "Author",
      size: 120,
      cell: ({ row }) => {
        if (!row.original.author) {
          return <span className="text-muted-foreground text-sm">-</span>;
        }
        const { id, name, image } = row.original.author;
        return (
          <CreatorCell
            createdById={id}
            creatorImage={image}
            creatorName={name}
          />
        );
      },
    },
    {
      accessorKey: "visibility",
      header: "Visibility",
      size: 90,
      cell: ({ row }) => {
        const isPublic = row.original.post.isPublic;
        return (
          <Badge variant={isPublic ? "default" : "outline"}>
            {isPublic ? "Public" : "Private"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "likes",
      header: () => (
        <SortableColumnHeader
          onSort={() => {
            const next =
              options?.sortBy === "likes" && options?.sortOrder === "desc"
                ? "asc"
                : "desc";
            options?.onSortChange?.("likes", next);
          }}
          sortDirection={
            options?.sortBy === "likes" ? (options?.sortOrder ?? null) : null
          }
          title="Likes"
        />
      ),
      size: 80,
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.post.likes}</span>
      ),
    },
    {
      accessorKey: "visits",
      header: () => (
        <SortableColumnHeader
          onSort={() => {
            const next =
              options?.sortBy === "visits" && options?.sortOrder === "desc"
                ? "asc"
                : "desc";
            options?.onSortChange?.("visits", next);
          }}
          sortDirection={
            options?.sortBy === "visits" ? (options?.sortOrder ?? null) : null
          }
          title="Visits"
        />
      ),
      size: 80,
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.post.visits}</span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: () => (
        <SortableColumnHeader
          onSort={() => {
            const next =
              options?.sortBy === "updatedAt" && options?.sortOrder === "desc"
                ? "asc"
                : "desc";
            options?.onSortChange?.("updatedAt", next);
          }}
          sortDirection={
            options?.sortBy === "updatedAt"
              ? (options?.sortOrder ?? null)
              : null
          }
          title="Updated"
        />
      ),
      size: 100,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm tabular-nums">
          {new Date(row.original.post.updatedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      size: 120,
      enableSorting: false,
      cell: ({ row }) => <PostRowActions post={row.original} />,
    },
  ];
}
