import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client, orpc } from "@/lib/orpc";

export function usePostActions() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: orpc.panel.post.list.key() });
  };

  const upsert = useMutation({
    mutationFn: (input: Parameters<typeof client.panel.post.upsert>[0]) =>
      client.panel.post.upsert(input),
    onSuccess: (_, variables) => {
      toast.success(
        variables.id ? "Post updated successfully" : "Post created successfully"
      );
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save post");
    },
  });

  const remove = useMutation({
    mutationFn: (input: Parameters<typeof client.panel.post.delete>[0]) =>
      client.panel.post.delete(input),
    onSuccess: () => {
      toast.success("Post deleted successfully");
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete post");
    },
  });

  const batchDelete = useMutation({
    mutationFn: (input: Parameters<typeof client.panel.post.batchDelete>[0]) =>
      client.panel.post.batchDelete(input),
    onSuccess: () => {
      toast.success("Posts deleted successfully");
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete posts");
    },
  });

  return {
    upsert,
    remove,
    batchDelete,
  };
}
