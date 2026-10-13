import type { ColumnDef } from "@/lib/react-table";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FeedbackRowActions } from "./row-actions";
import type { FeedbackRow, FeedbackStatus } from "./types";

interface CreateColumnsOptions {
  status: FeedbackStatus;
  onEdit: (feedback: FeedbackRow) => void;
}

export function createFeedbackColumns(
  options: CreateColumnsOptions
): ColumnDef<FeedbackRow>[] {
  const { status, onEdit } = options;
  const showStatus = status === "ALL";

  const columns: ColumnDef<FeedbackRow>[] = [
    {
      accessorKey: "title",
      header: "Feedback",
      size: 320,
      cell: ({ row }) => {
        const { title, content, snapshots } = row.original;
        return (
          <div className="space-y-1">
            <p className="font-medium">{title}</p>
            {content && (
              <p className="line-clamp-2 text-muted-foreground text-xs">
                {content}
              </p>
            )}
            {snapshots?.length ? (
              <div className="flex flex-wrap gap-1">
                {snapshots.map((url) => (
                  <Tooltip key={url}>
                    <TooltipTrigger>
                      <span className="truncate rounded-full border px-2 py-0.5 text-muted-foreground text-xs">
                        {new URL(url).hostname}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">{url}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            ) : null}
          </div>
        );
      },
    },
  ];

  if (showStatus) {
    columns.push({
      accessorKey: "status",
      header: "Status",
      size: 120,
      cell: ({ row }) => {
        const variants: Record<FeedbackRow["status"], "secondary" | "default"> =
          {
            PENDING: "secondary",
            REPLIED: "default",
          };
        return (
          <Badge variant={variants[row.original.status]}>
            {row.original.status}
          </Badge>
        );
      },
    });
  }

  if (status === "REPLIED") {
    columns.push({
      accessorKey: "reply",
      header: "Reply",
      size: 220,
      cell: ({ row }) => {
        const { replyContent } = row.original;
        if (!replyContent) return "-";
        return (
          <Tooltip>
            <TooltipTrigger>
              <p className="line-clamp-3 cursor-help text-sm">{replyContent}</p>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{replyContent}</TooltipContent>
          </Tooltip>
        );
      },
    });
  }

  columns.push({
    accessorKey: "createdAt",
    header: "Created",
    size: 120,
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {formatDistanceToNow(new Date(row.original.createdAt), {
          addSuffix: true,
        })}
      </span>
    ),
  });

  columns.push({
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    size: 160,
    enableSorting: false,
    cell: ({ row }) => (
      <FeedbackRowActions feedback={row.original} onEdit={onEdit} />
    ),
  });

  return columns;
}
