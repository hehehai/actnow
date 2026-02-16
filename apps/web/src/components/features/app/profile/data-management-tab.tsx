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

  // Delete all posts mutation
  const deletePostsMutation = useMutation({
    mutationFn: () => client.app.user.deleteAllPosts(),
    onSuccess: (result) => {
      toast.success(`Deleted ${result.deletedCount} post(s)`);
      queryClient.invalidateQueries({
        queryKey: orpc.app.post.list.key(),
      });
    },
  });

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

  // Delete all likes mutation
  const deleteLikesMutation = useMutation({
    mutationFn: () => client.app.user.deleteAllLikes(),
    onSuccess: (result) => {
      toast.success(`Deleted ${result.deletedCount} like(s)`);
      queryClient.invalidateQueries({
        queryKey: orpc.app.like.getUserLikes.key(),
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

  const handleDeletePosts = () => {
    confirmDialog.openWithPayload({
      title: "Delete All Posts",
      description:
        "Are you sure you want to delete all of your posts? This action cannot be undone.",
      confirmText: "Delete All",
      variant: "destructive",
      onConfirm: async () => {
        await deletePostsMutation.mutateAsync();
      },
    });
  };

  const handleDeleteLikes = () => {
    confirmDialog.openWithPayload({
      title: "Delete All Likes",
      description:
        "Are you sure you want to remove all your likes? This action cannot be undone.",
      confirmText: "Delete All",
      variant: "destructive",
      onConfirm: async () => {
        await deleteLikesMutation.mutateAsync();
      },
    });
  };

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
      {/* Delete Posts */}
      <section className="space-y-3">
        <div>
          <h3 className="font-medium">My Posts</h3>
          <p className="text-muted-foreground text-sm">
            Delete all posts you have created.
          </p>
        </div>
        <Button
          disabled={deletePostsMutation.isPending}
          onClick={handleDeletePosts}
          variant="outline"
        >
          {deletePostsMutation.isPending ? "Deleting..." : "Delete All Posts"}
        </Button>
      </section>

      <hr />

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

      {/* Delete Likes */}
      <section className="space-y-3">
        <div>
          <h3 className="font-medium">My Likes</h3>
          <p className="text-muted-foreground text-sm">
            Remove all your likes from the platform.
          </p>
        </div>
        <Button
          disabled={deleteLikesMutation.isPending}
          onClick={handleDeleteLikes}
          variant="outline"
        >
          {deleteLikesMutation.isPending ? "Deleting..." : "Delete All Likes"}
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
