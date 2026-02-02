import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client, orpc } from "@/lib/orpc";

export function useUserActions() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: orpc.panel.user.list.key() });
  };

  const create = useMutation({
    mutationFn: (input: Parameters<typeof client.panel.user.create>[0]) =>
      client.panel.user.create(input),
    onSuccess: () => {
      toast.success("User created successfully");
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create user");
    },
  });

  const update = useMutation({
    mutationFn: (input: Parameters<typeof client.panel.user.update>[0]) =>
      client.panel.user.update(input),
    onSuccess: () => {
      toast.success("User updated successfully");
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user");
    },
  });

  const remove = useMutation({
    mutationFn: (input: Parameters<typeof client.panel.user.delete>[0]) =>
      client.panel.user.delete(input),
    onSuccess: () => {
      toast.success("User deleted successfully");
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });

  const batchDelete = useMutation({
    mutationFn: (input: Parameters<typeof client.panel.user.batchDelete>[0]) =>
      client.panel.user.batchDelete(input),
    onSuccess: (result) => {
      toast.success(`${result.deletedCount} user(s) deleted successfully`);
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete users");
    },
  });

  const ban = useMutation({
    mutationFn: (input: Parameters<typeof client.panel.user.ban>[0]) =>
      client.panel.user.ban(input),
    onSuccess: () => {
      toast.success("User banned successfully");
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to ban user");
    },
  });

  const unban = useMutation({
    mutationFn: (input: Parameters<typeof client.panel.user.unban>[0]) =>
      client.panel.user.unban(input),
    onSuccess: () => {
      toast.success("User unbanned successfully");
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to unban user");
    },
  });

  return {
    create,
    update,
    remove,
    batchDelete,
    ban,
    unban,
  };
}
