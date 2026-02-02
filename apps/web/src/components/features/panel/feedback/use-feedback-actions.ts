import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client, orpc } from "@/lib/orpc";

export function useFeedbackActions() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: orpc.panel.feedback.list.key() });
  };

  const reply = useMutation({
    mutationFn: (input: Parameters<typeof client.panel.feedback.reply>[0]) =>
      client.panel.feedback.reply(input),
    onSuccess: () => {
      toast.success("Reply sent successfully");
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send reply");
    },
  });

  const remove = useMutation({
    mutationFn: (input: Parameters<typeof client.panel.feedback.delete>[0]) =>
      client.panel.feedback.delete(input),
    onSuccess: () => {
      toast.success("Feedback deleted successfully");
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete feedback");
    },
  });

  return {
    reply,
    remove,
  };
}
