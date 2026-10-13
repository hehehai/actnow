import type { ColumnDef } from "@/lib/react-table";
import { flexRender, getCoreRowModel, useReactTable } from "@/lib/react-table";
import { useMemo } from "react";
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
import { cn } from "@/lib/utils";
import { createFeedbackColumns, type FeedbackRow } from "./columns";

interface ServerPaginationInfo {
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

interface FeedbackDataTableProps {
  data: FeedbackRow[];
  isLoading?: boolean;
  className?: string;
  pagination?: ServerPaginationInfo;
  onPageChange?: (page: number) => void;
}

export function FeedbackDataTable({
  data,
  isLoading,
  className,
  pagination,
  onPageChange,
}: FeedbackDataTableProps) {
  const columns = useMemo<ColumnDef<FeedbackRow>[]>(
    () => createFeedbackColumns(),
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
              <FrameTableRow key={row.id}>
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
                No feedback found.
              </FrameTableCell>
            </FrameTableRow>
          )}
        </FrameTableBody>
      </FrameTable>

      <DataTablePagination
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

export type { FeedbackRow } from "./columns";
