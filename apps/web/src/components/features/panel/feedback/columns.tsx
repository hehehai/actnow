import type { ColumnDef } from "@/lib/react-table";
import { CreatorCell } from "@/components/shared/data-table/common-cells";
import { Badge } from "@/components/ui/badge";
import type { client } from "@/lib/orpc";
import { FeedbackRowActions } from "./feedback-row-actions";

type FeedbackListResponse = Awaited<
  ReturnType<typeof client.panel.feedback.list>
>;
export type FeedbackRow = FeedbackListResponse["items"][number];

export function createFeedbackColumns(): ColumnDef<FeedbackRow>[] {
  return [
    {
      accessorKey: "feedback",
      header: "Feedback",
      size: 280,
      cell: ({ row }) => {
        const { title } = row.original;
        return (
          <span className="line-clamp-1 text-pretty font-medium">{title}</span>
        );
      },
    },
    {
      accessorKey: "user",
      header: "User",
      size: 140,
      cell: ({ row }) => {
        const { userId, userName, userImage } = row.original;
        if (!userId) {
          return <span className="text-muted-foreground text-sm">-</span>;
        }
        return (
          <CreatorCell
            createdById={userId}
            creatorImage={userImage ?? null}
            creatorName={userName ?? null}
          />
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 90,
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={status === "REPLIED" ? "default" : "secondary"}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "reply",
      header: "Reply",
      size: 180,
      cell: ({ row }) => {
        const replyContent = row.original.replyContent;
        if (!replyContent) {
          return <span className="text-muted-foreground text-xs">—</span>;
        }
        return <p className="line-clamp-2 text-sm">{replyContent}</p>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      size: 100,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      size: 100,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {new Date(row.original.updatedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      size: 120,
      enableSorting: false,
      cell: ({ row }) => <FeedbackRowActions feedback={row.original} />,
    },
  ];
}
