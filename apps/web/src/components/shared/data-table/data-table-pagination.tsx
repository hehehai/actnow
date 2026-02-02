import type { Table } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { FrameFooter } from "@/components/shared/frame";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============================================================================
// Types
// ============================================================================

interface ServerPagination {
  /** Total number of records */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Current page (1-indexed) */
  page: number;
  /** Page size */
  pageSize: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
}

interface UsePaginationStateOptions<TData> {
  table: Table<TData>;
  serverPagination?: ServerPagination;
}

interface PaginationState {
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  totalRows: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  handlePageChange: (page: number) => void;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
}

/** Context passed to selectionActions render function */
export interface SelectionContext<TData> {
  /** Selected row data */
  selectedRows: TData[];
  /** Selected row IDs */
  selectedIds: string[];
  /** Number of selected rows */
  count: number;
  /** Clear all selections */
  clearSelection: () => void;
}

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  /** Function to get the ID from a row, defaults to (row) => row.id */
  getRowId?: (row: TData) => string;
  /** Server-side pagination configuration - if provided, uses server pagination mode */
  serverPagination?: ServerPagination;
  /** Custom actions when rows are selected - ReactNode or render function with selection context */
  selectionActions?:
    | ReactNode
    | ((context: SelectionContext<TData>) => ReactNode);
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to manage pagination state for both client and server-side pagination
 */
function usePaginationState<TData>({
  table,
  serverPagination,
}: UsePaginationStateOptions<TData>): PaginationState {
  const isServerPagination = !!serverPagination;

  const pageCount = isServerPagination
    ? serverPagination.totalPages
    : table.getPageCount();

  const pageIndex = isServerPagination
    ? serverPagination.page - 1
    : table.getState().pagination.pageIndex;

  const pageSize = isServerPagination
    ? serverPagination.pageSize
    : table.getState().pagination.pageSize;

  const totalRows = isServerPagination
    ? serverPagination.total
    : table.getRowCount();

  const canPreviousPage = isServerPagination
    ? serverPagination.page > 1
    : table.getCanPreviousPage();

  const canNextPage = isServerPagination
    ? serverPagination.page < serverPagination.totalPages
    : table.getCanNextPage();

  const handlePageChange = (newPage: number) => {
    if (isServerPagination) {
      serverPagination.onPageChange(newPage);
    } else {
      table.setPageIndex(newPage - 1);
    }
  };

  const handlePreviousPage = () => {
    if (isServerPagination) {
      serverPagination.onPageChange(serverPagination.page - 1);
    } else {
      table.previousPage();
    }
  };

  const handleNextPage = () => {
    if (isServerPagination) {
      serverPagination.onPageChange(serverPagination.page + 1);
    } else {
      table.nextPage();
    }
  };

  return {
    pageCount,
    pageIndex,
    pageSize,
    totalRows,
    canPreviousPage,
    canNextPage,
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
  };
}

// ============================================================================
// Sub-components
// ============================================================================

interface PaginationInfoProps {
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (page: number) => void;
}

function PaginationInfo({
  pageCount,
  pageIndex,
  pageSize,
  totalRows,
  onPageChange,
}: PaginationInfoProps) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      {pageCount > 1 && (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <p className="text-muted-foreground text-sm">Viewing</p>
          <Select
            items={Array.from({ length: pageCount }, (_, i) => {
              const start = i * pageSize + 1;
              const end = Math.min((i + 1) * pageSize, totalRows);
              const pageNum = i + 1;
              return { label: `${start}-${end}`, value: pageNum };
            })}
            onValueChange={(value) => {
              onPageChange(value as number);
            }}
            value={pageIndex + 1}
          >
            <SelectTrigger
              aria-label="Select result range"
              className="w-fit min-w-none"
              size="sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {Array.from({ length: pageCount }, (_, i) => {
                const start = i * pageSize + 1;
                const end = Math.min((i + 1) * pageSize, totalRows);
                const pageNum = i + 1;
                return (
                  <SelectItem key={pageNum} value={pageNum}>
                    {`${start}-${end}`}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-sm">of</p>
        </div>
      )}
      <p className="text-muted-foreground text-sm">
        <strong className="font-medium text-foreground">{totalRows}</strong>{" "}
        results
      </p>
    </div>
  );
}

interface PaginationControlsProps {
  pageIndex: number;
  pageCount: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

function PaginationControls({
  pageIndex,
  pageCount,
  canPreviousPage,
  canNextPage,
  onPreviousPage,
  onNextPage,
}: PaginationControlsProps) {
  return (
    <Pagination className="justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            render={
              <Button
                disabled={!canPreviousPage}
                onClick={onPreviousPage}
                size="sm"
                variant="outline"
              />
            }
          />
        </PaginationItem>
        <PaginationItem>
          <span className="px-2 text-muted-foreground text-xs">
            Page {pageIndex + 1} of {pageCount}
          </span>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            render={
              <Button
                disabled={!canNextPage}
                onClick={onNextPage}
                size="sm"
                variant="outline"
              />
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function DataTablePagination<TData>({
  table,
  getRowId = (row) => (row as { id: string }).id,
  serverPagination,
  selectionActions,
}: DataTablePaginationProps<TData>) {
  const paginationState = usePaginationState({ table, serverPagination });
  const { pageCount } = paginationState;

  const selectedRowModels = table.getFilteredSelectedRowModel().rows;
  const hasSelection = selectedRowModels.length > 0;

  // Don't render if no pagination needed and no selection
  if (pageCount <= 1 && !hasSelection) {
    return null;
  }

  // Build selection context for render function
  const selectionContext: SelectionContext<TData> = {
    selectedRows: selectedRowModels.map((row) => row.original),
    selectedIds: selectedRowModels.map((row) => getRowId(row.original)),
    count: selectedRowModels.length,
    clearSelection: () => table.resetRowSelection(),
  };

  // Resolve selection actions (ReactNode or render function)
  const resolvedSelectionActions =
    typeof selectionActions === "function"
      ? selectionActions(selectionContext)
      : selectionActions;

  return (
    <FrameFooter className="p-2">
      <div className="flex items-center justify-between gap-2">
        {/* Left side: Selection actions or Pagination info */}
        {hasSelection && selectionActions ? (
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-muted-foreground text-sm">
              {selectionContext.count} Selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                onClick={selectionContext.clearSelection}
                size="sm"
                variant="outline"
              >
                Clear
              </Button>
              {resolvedSelectionActions}
            </div>
          </div>
        ) : (
          <PaginationInfo
            onPageChange={paginationState.handlePageChange}
            pageCount={paginationState.pageCount}
            pageIndex={paginationState.pageIndex}
            pageSize={paginationState.pageSize}
            totalRows={paginationState.totalRows}
          />
        )}

        {/* Right side: Pagination controls */}
        <PaginationControls
          canNextPage={paginationState.canNextPage}
          canPreviousPage={paginationState.canPreviousPage}
          onNextPage={paginationState.handleNextPage}
          onPreviousPage={paginationState.handlePreviousPage}
          pageCount={paginationState.pageCount}
          pageIndex={paginationState.pageIndex}
        />
      </div>
    </FrameFooter>
  );
}
