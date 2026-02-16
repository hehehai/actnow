import { useState } from "react";
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
import { panelPostFormDialog } from "@/stores/handlers";
import { usePostActions } from "./use-post-actions";

type PanelPostFormPayload = {
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
    <Dialog<PanelPostFormPayload> handle={panelPostFormDialog}>
      {({ payload }) => (
        <DialogContent className="max-w-3xl sm:max-w-3xl">
          <PostFormDialogContent payload={payload} />
        </DialogContent>
      )}
    </Dialog>
  );
}

function PostFormDialogContent({
  payload,
}: {
  payload?: PanelPostFormPayload;
}) {
  const actions = usePostActions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mode = payload?.mode ?? "create";
  const initialValues = payload?.post
    ? {
        id: payload.post.id,
        prompt: payload.post.prompt ?? "",
        comment: payload.post.comment ?? "",
        media: payload.post.media ?? [],
        isPublic: payload.post.isPublic ?? false,
        tagIds: payload.post.tagIds ?? [],
      }
    : undefined;

  const handleSubmit = async (values: PostFormValues) => {
    setIsSubmitting(true);
    try {
      await actions.upsert.mutateAsync({
        id: values.id,
        prompt: values.prompt,
        comment: values.comment,
        media: values.media,
        isPublic: values.isPublic,
        tagIds: values.tagIds,
      });
      panelPostFormDialog.close();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-balance">
          {mode === "create" ? "New Post" : "Edit Post"}
        </DialogTitle>
      </DialogHeader>
      <PostForm
        initialValues={initialValues}
        isSubmitting={isSubmitting}
        key={payload?.post?.id ?? "new"}
        mode={mode}
        onCancel={() => panelPostFormDialog.close()}
        onSubmit={handleSubmit}
        uploadType="admin"
      />
    </>
  );
}
