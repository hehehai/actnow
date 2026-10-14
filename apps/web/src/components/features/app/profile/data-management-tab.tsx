import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { confirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { client, orpc } from "@/lib/orpc";

export function DataManagementTab() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Delete all feedback mutation
  const deleteFeedbackMutation = useMutation({
    mutationFn: () => client.app.user.deleteAllFeedback(),
    onSuccess: (result) => {
      toast.success(`Deleted ${result.deletedCount} feedback item(s)`);
      queryClient.invalidateQueries({
        queryKey: orpc.app.feedback.list.key(),
      });
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const result = await authClient.deleteUser();
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Account deleted");
      navigate({ to: "/" });
    },
  });

  const handleDeleteAccount = () => {
    confirmDialog.openWithPayload({
      title: "Delete Account",
      description:
        "Are you sure you want to delete your account? All your data will be permanently removed. This action cannot be undone.",
      confirmText: "Delete Account",
      variant: "destructive",
      onConfirm: async () => {
        await deleteAccountMutation.mutateAsync();
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Delete Feedback */}
      <section className="space-y-3">
        <div>
          <h3 className="font-medium">My Feedback</h3>
          <p className="text-muted-foreground text-sm">
            Remove all feedback you have submitted.
          </p>
        </div>
        <Button
          disabled={deleteFeedbackMutation.isPending}
          onClick={() =>
            confirmDialog.openWithPayload({
              title: "Delete All Feedback",
              description:
                "Are you sure you want to delete all of your feedback entries? This action cannot be undone.",
              confirmText: "Delete All",
              variant: "destructive",
              onConfirm: async () => {
                await deleteFeedbackMutation.mutateAsync();
              },
            })
          }
          variant="outline"
        >
          {deleteFeedbackMutation.isPending
            ? "Deleting..."
            : "Delete All Feedback"}
        </Button>
      </section>

      <hr />

      {/* Delete Account */}
      <section className="space-y-3">
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <h3 className="font-medium text-destructive">Delete Account</h3>
          <p className="mt-1 text-muted-foreground text-sm">
            Permanently delete your account and all associated data. This action
            is irreversible.
          </p>
          <Button
            className="mt-4"
            disabled={deleteAccountMutation.isPending}
            onClick={handleDeleteAccount}
            variant="destructive"
          >
            {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
          </Button>
        </div>
      </section>
    </div>
  );
}
