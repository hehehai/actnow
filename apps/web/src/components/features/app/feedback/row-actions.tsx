import { confirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import type { FeedbackRow } from "./types";
import { useFeedbackActions } from "./use-submit-actions";

interface FeedbackRowActionsProps {
  feedback: FeedbackRow;
  onEdit: (feedback: FeedbackRow) => void;
}

export function FeedbackRowActions({
  feedback,
  onEdit,
}: FeedbackRowActionsProps) {
  const actions = useFeedbackActions();

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

  const canEdit = feedback.status === "PENDING";

  return (
    <div className="flex items-center justify-end gap-1.5">
      {canEdit && (
        <Button onClick={() => onEdit(feedback)} size="sm" variant="outline">
          <span className="i-hugeicons-pencil-edit-02 size-3.5" />
          Edit
        </Button>
      )}
      <Button onClick={handleDelete} size="sm" variant="outline">
        <span className="i-hugeicons-delete-03 size-3.5" />
        Delete
      </Button>
    </div>
  );
}
