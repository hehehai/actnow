import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client, orpc } from "@/lib/orpc";

export function useFeedbackActions() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: orpc.app.feedback.list.key(),
    });
  };

  const update = useMutation({
    mutationFn: (input: Parameters<typeof client.app.feedback.update>[0]) =>
      client.app.feedback.update(input),
    onSuccess: () => {
      toast.success("Feedback updated");
      invalidate();
    },
  });

  const remove = useMutation({
    mutationFn: (input: Parameters<typeof client.app.feedback.delete>[0]) =>
      client.app.feedback.delete(input),
    onSuccess: () => {
      toast.success("Feedback deleted");
      invalidate();
    },
  });

  return { update, remove };
}
