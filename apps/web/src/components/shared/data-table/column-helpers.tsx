import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { Checkbox } from "@/components/ui/checkbox";

export function createSelectionColumn<TData>(): ColumnDef<TData> {
  return {
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    header: ({ table }) => {
      const isAllSelected = table.getIsAllPageRowsSelected();
      const isSomeSelected = table.getIsSomePageRowsSelected();
      return (
        <Checkbox
          aria-label="Select all rows"
          checked={isAllSelected}
          indeterminate={isSomeSelected && !isAllSelected}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      );
    },
    id: "select",
    size: 20,
  };
}

interface ActionsColumnOptions<TData> {
  render: (row: TData) => ReactNode;
  size?: number;
}

export function createActionsColumn<TData>({
  render,
  size = 60,
}: ActionsColumnOptions<TData>): ColumnDef<TData> {
  return {
    cell: ({ row }) => render(row.original),
    enableSorting: false,
    header: "Actions",
    id: "actions",
    size,
  };
}
