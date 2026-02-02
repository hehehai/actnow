import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { ClientOutputs } from "@/lib/orpc-types";
import type { FeedbackRow } from "./columns";

type FeedbackDetail = ClientOutputs["panel"]["feedback"]["getById"];

interface ReplyDialogProps {
  feedback: FeedbackRow | FeedbackDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (replyContent: string) => Promise<void>;
}

export function ReplyDialog({
  feedback,
  open,
  onOpenChange,
  onSubmit,
}: ReplyDialogProps) {
  const [reply, setReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setReply(feedback.replyContent ?? "");
    }
  }, [open, feedback.replyContent]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reply.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(reply.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reply to Feedback</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="font-medium text-sm">{feedback.title}</p>
            {feedback.content && (
              <p className="mt-1 text-muted-foreground text-sm">
                {feedback.content}
              </p>
            )}
          </div>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <Textarea
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write your reply..."
              rows={5}
              value={reply}
            />
            <DialogFooter>
              <Button
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Sending..." : "Send Reply"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
