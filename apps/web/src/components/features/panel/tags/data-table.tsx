import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { Frame } from "@/components/shared/frame";
import {
  FrameTable,
  FrameTableBody,
  FrameTableCell,
  FrameTableHead,
  FrameTableHeader,
  FrameTableRow,
} from "@/components/shared/frame-table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createTagColumns, type TagRow } from "./columns";
import { useTagActions } from "./use-tag-actions";

interface ServerPaginationInfo {
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

interface TagDataTableProps {
  data: TagRow[];
  isLoading?: boolean;
  className?: string;
  sortBy?: "createdAt" | "name";
  sortOrder?: "asc" | "desc";
  onSortChange?: (sortBy: "createdAt" | "name", order: "asc" | "desc") => void;
  pagination?: ServerPaginationInfo;
  onPageChange?: (page: number) => void;
}

export function TagDataTable({
  data,
  isLoading,
  className,
  sortBy,
  sortOrder,
  onSortChange,
  pagination,
  onPageChange,
}: TagDataTableProps) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const actions = useTagActions();

  const columns = useMemo<ColumnDef<TagRow>[]>(
    () => createTagColumns({ sortBy, sortOrder, onSortChange }),
    [sortBy, sortOrder, onSortChange]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    getRowId: (row) => row.id,
  });

  return (
    <Frame className={cn("w-full", className)}>
      <FrameTable className="table-fixed">
        <FrameTableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <FrameTableRow
              className="hover:bg-transparent"
              key={headerGroup.id}
            >
              {headerGroup.headers.map((header) => {
                const columnSize = header.column.getSize();
                return (
                  <FrameTableHead
                    key={header.id}
                    style={
                      columnSize ? { width: `${columnSize}px` } : undefined
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </FrameTableHead>
                );
              })}
            </FrameTableRow>
          ))}
        </FrameTableHeader>

        <FrameTableBody>
          {isLoading ? (
            <FrameTableRow>
              <FrameTableCell
                className="h-24 text-center text-muted-foreground"
                colSpan={columns.length}
              >
                Loading...
              </FrameTableCell>
            </FrameTableRow>
          ) : data.length ? (
            table.getRowModel().rows.map((row) => (
              <FrameTableRow
                data-state={row.getIsSelected() ? "selected" : undefined}
                key={row.id}
              >
                {row.getVisibleCells().map((cell) => (
                  <FrameTableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </FrameTableCell>
                ))}
              </FrameTableRow>
            ))
          ) : (
            <FrameTableRow>
              <FrameTableCell
                className="h-24 text-center text-muted-foreground"
                colSpan={columns.length}
              >
                No tags found.
              </FrameTableCell>
            </FrameTableRow>
          )}
        </FrameTableBody>
      </FrameTable>

      <DataTablePagination
        selectionActions={({ selectedIds }) => (
          <Button
            disabled={actions.batchDelete.isPending}
            onClick={async () => {
              await actions.batchDelete.mutateAsync({ ids: selectedIds });
              setRowSelection({});
            }}
            size="sm"
            variant="destructive"
          >
            <span className="i-hugeicons-delete-03 size-3.5" />
            {actions.batchDelete.isPending ? "Deleting..." : "Delete Selected"}
          </Button>
        )}
        serverPagination={
          pagination && onPageChange
            ? {
                ...pagination,
                onPageChange,
              }
            : undefined
        }
        table={table}
      />
    </Frame>
  );
}

export type { TagRow } from "./columns";
