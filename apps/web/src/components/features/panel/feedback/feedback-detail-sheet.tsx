import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MediaGrid } from "@/components/features/common/media/media-grid";
import { confirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatDateTime } from "@/lib/formatters";
import { orpc } from "@/lib/orpc";
import type { ClientOutputs } from "@/lib/orpc-types";
import { feedbackDetailSheet } from "@/stores/handlers";
import { ReplyDialog } from "./reply-dialog";
import { useFeedbackActions } from "./use-feedback-actions";

type FeedbackDetail = ClientOutputs["panel"]["feedback"]["getById"];

export function FeedbackDetailSheet() {
  return (
    <Sheet<{ feedbackId: string }> handle={feedbackDetailSheet}>
      {({ payload }) =>
        payload && <FeedbackDetailContent feedbackId={payload.feedbackId} />
      }
    </Sheet>
  );
}

function FeedbackDetailContent({ feedbackId }: { feedbackId: string }) {
  const actions = useFeedbackActions();
  const [replyOpen, setReplyOpen] = useState(false);

  const { data: feedback, isLoading } = useQuery(
    orpc.panel.feedback.getById.queryOptions({
      input: { id: feedbackId },
    })
  );

  const handleReply = async (replyContent: string) => {
    await actions.reply.mutateAsync({
      id: feedbackId,
      replyContent,
    });
    setReplyOpen(false);
  };

  const handleDelete = (detail: FeedbackDetail) => {
    confirmDialog.openWithPayload({
      title: "Delete Feedback",
      description: (
        <>
          Are you sure you want to delete <strong>{detail.title}</strong>? This
          action cannot be undone.
        </>
      ),
      confirmText: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        await actions.remove.mutateAsync({ id: detail.id });
        feedbackDetailSheet.close();
      },
    });
  };

  const createdAt = formatDateTime(feedback?.createdAt);
  const updatedAt = formatDateTime(feedback?.updatedAt);

  return (
    <>
      <SheetContent
        className="h-full border-none bg-transparent p-3 shadow-none data-[side=right]:max-w-3xl data-[side=right]:sm:max-w-3xl"
        showCloseButton={false}
        side="right"
      >
        <div className="flex h-full w-full flex-col gap-4 rounded-xl bg-background shadow-lg">
          {isLoading || !feedback ? (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              Loading...
            </div>
          ) : (
            <>
              <div className="shrink-0">
                <SheetHeader className="flex-row items-start justify-between">
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <SheetTitle className="text-balance text-base">
                        {feedback.title}
                      </SheetTitle>
                      <Badge
                        variant={
                          feedback.status === "REPLIED"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {feedback.status}
                      </Badge>
                    </div>
                    {feedback.userName && (
                      <SheetDescription>
                        {feedback.userName}
                        {feedback.email ? ` - ${feedback.email}` : ""}
                      </SheetDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setReplyOpen(true)}
                      size="sm"
                      variant="outline"
                    >
                      <span className="i-hugeicons-comment-01 size-3.5" />
                      Reply
                    </Button>
                    <Button
                      onClick={() => handleDelete(feedback)}
                      size="sm"
                      variant="destructive"
                    >
                      <span className="i-hugeicons-delete-03 size-3.5" />
                      Delete
                    </Button>
                    <SheetClose
                      className={buttonVariants({
                        size: "icon-sm",
                        variant: "outline",
                      })}
                    >
                      <span className="i-hugeicons-cancel-01 text-lg" />
                    </SheetClose>
                  </div>
                </SheetHeader>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-4">
                <section className="space-y-2">
                  <h4 className="font-medium text-muted-foreground text-xs uppercase">
                    Content
                  </h4>
                  {feedback.content ? (
                    <p className="whitespace-pre-line text-pretty text-sm">
                      {feedback.content}
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-sm">No content</p>
                  )}
                </section>

                <section className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-muted-foreground text-xs uppercase">
                      Created
                    </h4>
                    <p className="text-muted-foreground text-sm tabular-nums">
                      {createdAt}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-muted-foreground text-xs uppercase">
                      Updated
                    </h4>
                    <p className="text-muted-foreground text-sm tabular-nums">
                      {updatedAt}
                    </p>
                  </div>
                </section>

                <section className="space-y-2">
                  <h4 className="font-medium text-muted-foreground text-xs uppercase">
                    Reply
                  </h4>
                  {feedback.replyContent ? (
                    <p className="whitespace-pre-line text-pretty text-sm">
                      {feedback.replyContent}
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-sm">No reply</p>
                  )}
                </section>

                <section className="space-y-2">
                  <h4 className="font-medium text-muted-foreground text-xs uppercase">
                    Snapshots
                  </h4>
                  <MediaGrid
                    emptyText="No snapshots"
                    media={feedback.snapshots}
                    previewAlt="Feedback snapshot"
                    previewFilename={`feedback-${feedback.id}.jpg`}
                    previewMode="hover"
                    previewTitle="Feedback Snapshot"
                  />
                </section>
              </div>
            </>
          )}
        </div>
      </SheetContent>

      {feedback && (
        <ReplyDialog
          feedback={feedback}
          onOpenChange={setReplyOpen}
          onSubmit={handleReply}
          open={replyOpen}
        />
      )}
    </>
  );
}
