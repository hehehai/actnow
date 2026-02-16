import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { SubscriptionStatusBadge } from "@/components/features/common/subscription/subscription-status-badge";
import { SortableColumnHeader } from "@/components/shared/data-table";
import { createSelectionColumn } from "@/components/shared/data-table/column-helpers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDateTime } from "@/lib/formatters";
import type { client } from "@/lib/orpc";
import { UserRowActions } from "./user-row-actions";

// Type from oRPC API response
type UserListResponse = Awaited<ReturnType<typeof client.panel.user.list>>;
export type UserRow = UserListResponse["items"][number];

interface CreateUserColumnsOptions {
  sortOrder?: "asc" | "desc";
  onSortChange?: (order: "asc" | "desc") => void;
}

export function createUserColumns(
  options?: CreateUserColumnsOptions
): ColumnDef<UserRow>[] {
  return [
    createSelectionColumn<UserRow>(),
    {
      accessorKey: "user",
      header: "User",
      size: 200,
      cell: ({ row }) => {
        const { name, email, image, banned, banReason } = row.original;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarImage alt={name} src={image ?? undefined} />
              <AvatarFallback>{name?.charAt(0) ?? "?"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-medium">{name}</span>
                {banned && (
                  <>
                    <Badge className="px-1 py-0 text-xs" variant="destructive">
                      Banned
                    </Badge>
                    {banReason && (
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="i-hugeicons-information-circle size-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>{banReason}</TooltipContent>
                      </Tooltip>
                    )}
                  </>
                )}
              </div>
              <span className="text-muted-foreground text-xs">{email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      size: 100,
      cell: ({ row }) => {
        const role = row.original.role;
        return (
          <Badge variant={role === "ADMIN" ? "default" : "secondary"}>
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: "subscription",
      header: "Subscription",
      size: 120,
      cell: ({ row }) => {
        const subscription = row.original.subscription;
        return (
          <SubscriptionStatusBadge shape="dot" status={subscription.status} />
        );
      },
    },
    {
      accessorKey: "lastSignedIn",
      header: "Last signed in",
      size: 120,
      cell: ({ row }) => {
        const lastSignedIn = row.original.lastSignedIn;
        if (!lastSignedIn) {
          return <span className="text-muted-foreground text-sm">Never</span>;
        }
        return (
          <span className="text-muted-foreground text-sm">
            {formatDistanceToNow(new Date(lastSignedIn), { addSuffix: true })}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <SortableColumnHeader
          onSort={() => {
            const next = options?.sortOrder === "desc" ? "asc" : "desc";
            options?.onSortChange?.(next);
          }}
          sortDirection={options?.sortOrder ?? null}
          title="Created At"
        />
      ),
      size: 120,
      cell: ({ row }) => {
        const createdAt = row.original.createdAt;
        return (
          <span className="text-muted-foreground text-sm">
            {formatDateTime(createdAt, "-")}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      size: 100,
      enableSorting: false,
      cell: ({ row }) => <UserRowActions user={row.original} />,
    },
  ];
}
