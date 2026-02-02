import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  PostForm,
  type PostFormValues,
} from "@/components/features/common/post/post-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { client, orpc } from "@/lib/orpc";
import { postFormDialog } from "@/stores/handlers";

type PostFormPayload = {
  mode: "create" | "edit";
  post?: {
    id: string;
    prompt: string | null;
    comment: string | null;
    media: string[] | null;
    isPublic: boolean;
    tagIds: string[];
  };
};

export function PostFormDialog() {
  return (
    <Dialog<PostFormPayload> handle={postFormDialog}>
      {({ payload }) => (
        <DialogContent className="max-w-3xl sm:max-w-3xl">
          <PostFormDialogContent payload={payload} />
        </DialogContent>
      )}
    </Dialog>
  );
}

function PostFormDialogContent({ payload }: { payload?: PostFormPayload }) {
  const queryClient = useQueryClient();
  const mode = payload?.mode ?? "create";

  const mutation = useMutation({
    mutationFn: async (values: PostFormValues) => {
      if (mode === "edit" && values.id) {
        return client.app.post.update(values);
      }
      const { id: _id, ...payloadData } = values;
      return client.app.post.create(payloadData);
    },
    onSuccess: () => {
      toast.success(
        mode === "edit" ? "Post updated successfully" : "Post created"
      );
      queryClient.invalidateQueries({ queryKey: orpc.app.post.list.key() });
      queryClient.invalidateQueries({
        queryKey: orpc.app.user.publicProfile.key(),
      });
      postFormDialog.close();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save post");
    },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-balance">
          {mode === "edit" ? "Edit Post" : "Create Post"}
        </DialogTitle>
      </DialogHeader>
      <PostForm
        initialValues={payload?.post}
        isSubmitting={mutation.isPending}
        key={payload?.post?.id ?? "new"}
        mode={mode}
        onCancel={() => postFormDialog.close()}
        onSubmit={async (values) => {
          await mutation.mutateAsync(values);
        }}
      />
    </>
  );
}
