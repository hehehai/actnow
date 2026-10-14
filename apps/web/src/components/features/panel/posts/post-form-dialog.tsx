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
    title: string;
    description: string;
    cover: string | null;
    content: string;
    status: "draft" | "published";
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
        title: payload.post.title,
        description: payload.post.description,
        cover: payload.post.cover,
        content: payload.post.content,
        status: payload.post.status,
      }
    : undefined;

  const handleSubmit = async (values: PostFormValues) => {
    setIsSubmitting(true);
    try {
      await actions.upsert.mutateAsync({
        id: values.id,
        title: values.title,
        description: values.description,
        cover: values.cover,
        content: values.content,
        status: values.status,
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
      />
    </>
  );
}
