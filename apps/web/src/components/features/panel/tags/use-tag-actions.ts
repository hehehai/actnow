import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client, orpc } from "@/lib/orpc";

export function useTagActions() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: orpc.panel.tag.list.key() });
    queryClient.invalidateQueries({
      queryKey: orpc.panel.tag.listForSelect.key(),
    });
  };

  const upsert = useMutation({
    mutationFn: (input: Parameters<typeof client.panel.tag.upsert>[0]) =>
      client.panel.tag.upsert(input),
    onSuccess: (_, variables) => {
      toast.success(
        variables.id ? "Tag updated successfully" : "Tag created successfully"
      );
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save tag");
    },
  });

  const remove = useMutation({
    mutationFn: (input: Parameters<typeof client.panel.tag.delete>[0]) =>
      client.panel.tag.delete(input),
    onSuccess: () => {
      toast.success("Tag deleted successfully");
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete tag");
    },
  });

  const batchDelete = useMutation({
    mutationFn: (input: Parameters<typeof client.panel.tag.batchDelete>[0]) =>
      client.panel.tag.batchDelete(input),
    onSuccess: (result) => {
      toast.success(`${result.deletedCount} tag(s) deleted successfully`);
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete tags");
    },
  });

  return {
    upsert,
    remove,
    batchDelete,
  };
}
