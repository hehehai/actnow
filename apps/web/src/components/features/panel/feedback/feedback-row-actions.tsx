import { useState } from "react";
import { toast } from "sonner";
import { confirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCopy } from "@/hooks/use-copy";
import { feedbackDetailSheet } from "@/stores/handlers";
import type { FeedbackRow } from "./columns";
import { ReplyDialog } from "./reply-dialog";
import { useFeedbackActions } from "./use-feedback-actions";

interface FeedbackRowActionsProps {
  feedback: FeedbackRow;
}

export function FeedbackRowActions({ feedback }: FeedbackRowActionsProps) {
  const actions = useFeedbackActions();
  const { copy } = useCopy();
  const [replyOpen, setReplyOpen] = useState(false);

  const handleCopyId = async () => {
    const success = await copy(feedback.id);
    if (success) {
      toast.success("Feedback ID copied to clipboard");
    }
  };

  const handleReply = async (replyContent: string) => {
    await actions.reply.mutateAsync({
      id: feedback.id,
      replyContent,
    });
    setReplyOpen(false);
  };

  const handleDelete = () => {
    confirmDialog.openWithPayload({
      title: "Delete Feedback",
      description: (
        <>
          Are you sure you want to delete <strong>{feedback.title}</strong>?
          This action cannot be undone.
        </>
      ),
      confirmText: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        await actions.remove.mutateAsync({ id: feedback.id });
      },
    });
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1.5">
        <Button
          onClick={() =>
            feedbackDetailSheet.openWithPayload({ feedbackId: feedback.id })
          }
          size="sm"
          variant="outline"
        >
          <span className="i-hugeicons-information-circle size-3.5" />
          Detail
        </Button>
        <Button onClick={() => setReplyOpen(true)} size="sm" variant="outline">
          <span className="i-hugeicons-comment-01 size-3.5" />
          Reply
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button size="icon-sm" variant="outline">
                <span className="i-hugeicons-more-horizontal size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCopyId}>
              <span className="i-hugeicons-copy-01 size-4" />
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} variant="destructive">
              <span className="i-hugeicons-delete-03 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ReplyDialog
        feedback={feedback}
        onOpenChange={setReplyOpen}
        onSubmit={handleReply}
        open={replyOpen}
      />
    </>
  );
}
